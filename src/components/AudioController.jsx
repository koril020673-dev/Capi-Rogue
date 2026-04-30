import { useEffect, useMemo, useRef, useState } from 'react';
import { ECONOMIC_PHASES } from '../constants/economy';
import { getAudioSettings } from '../logic/audioEngine';
import { SCREEN_IDS, useGameStore } from '../store/useGameStore';
import mainBgm from '../assets/bgm/bg_music_main.wav';
import tensionBgm from '../assets/bgm/bg_music_tension.wav';
import boomBgm from '../assets/bgm/boom_bgm.wav';
import businessDecisionBgm from '../assets/bgm/business_decision_bgm.wav';
import contractionBgm from '../assets/bgm/contraction_bgm.wav';
import growthBgm from '../assets/bgm/growth_bgm.wav';
import recessionBgm from '../assets/bgm/recession_bgm.wav';
import stableBgm from '../assets/bgm/stable_bgm.wav';
import clickSfx from '../assets/sfx/sfx_click.wav';
import nextFloorSfx from '../assets/sfx/sfx_nextfloor.wav';

const PHASE_BGM = Object.freeze({
  [ECONOMIC_PHASES.BOOM]: boomBgm,
  [ECONOMIC_PHASES.GROWTH]: growthBgm,
  [ECONOMIC_PHASES.STABLE]: stableBgm,
  [ECONOMIC_PHASES.CONTRACTION]: contractionBgm,
  [ECONOMIC_PHASES.RECESSION]: recessionBgm,
});

const DECISION_SCREENS = new Set([
  SCREEN_IDS.ADVISOR_SELECT,
  SCREEN_IDS.CHARACTER_CREATE,
  SCREEN_IDS.SETTLEMENT,
  SCREEN_IDS.RESULT,
  SCREEN_IDS.REWARD,
]);

export default function AudioController() {
  const screen = useGameStore((state) => state.screen);
  const phase = useGameStore((state) => state.phase);
  const floor = useGameStore((state) => state.floor);
  const [settings, setSettings] = useState(() => getAudioSettings());
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const bgmRef = useRef(null);
  const clickRef = useRef(null);
  const nextFloorRef = useRef(null);
  const previousBgmRef = useRef(null);
  const previousFloorRef = useRef(floor);
  const bgmSrc = useMemo(() => getBgmForScreen(screen, phase), [phase, screen]);

  useEffect(() => {
    function unlockAudio() {
      setAudioUnlocked(true);
    }

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  useEffect(() => {
    function handleSettingsChange() {
      setSettings(getAudioSettings());
    }

    window.addEventListener('storage', handleSettingsChange);
    window.addEventListener('cr2-audio-settings-change', handleSettingsChange);

    return () => {
      window.removeEventListener('storage', handleSettingsChange);
      window.removeEventListener('cr2-audio-settings-change', handleSettingsChange);
    };
  }, []);

  useEffect(() => {
    const bgm = bgmRef.current;

    if (!bgm) {
      return;
    }

    bgm.volume = Math.max(0, Math.min(1, settings.bgmVolume / 100));
  }, [settings.bgmVolume]);

  useEffect(() => {
    const bgm = bgmRef.current;

    if (!bgm || !audioUnlocked) {
      return;
    }

    if (previousBgmRef.current !== bgmSrc) {
      bgm.pause();
      bgm.src = bgmSrc;
      bgm.currentTime = 0;
      previousBgmRef.current = bgmSrc;
    }

    bgm.loop = true;
    bgm.volume = Math.max(0, Math.min(1, settings.bgmVolume / 100));
    bgm.play().catch(() => {});
  }, [audioUnlocked, bgmSrc, settings.bgmVolume]);

  useEffect(() => {
    function handleClick(event) {
      if (!settings.sfxEnabled || !event.target?.closest?.('button')) {
        return;
      }

      playOneShot(clickRef.current, 0.45);
    }

    document.addEventListener('click', handleClick, true);

    return () => document.removeEventListener('click', handleClick, true);
  }, [settings.sfxEnabled]);

  useEffect(() => {
    if (floor > previousFloorRef.current && settings.sfxEnabled) {
      playOneShot(nextFloorRef.current, 0.7);
    }

    previousFloorRef.current = floor;
  }, [floor, settings.sfxEnabled]);

  return (
    <>
      <audio ref={bgmRef} preload="auto" />
      <audio ref={clickRef} preload="auto" src={clickSfx} />
      <audio ref={nextFloorRef} preload="auto" src={nextFloorSfx} />
    </>
  );
}

function getBgmForScreen(screen, phase) {
  if (screen === SCREEN_IDS.MAIN) {
    return PHASE_BGM[phase] ?? stableBgm;
  }

  if (screen === SCREEN_IDS.EVENT || screen === SCREEN_IDS.GAME_OVER) {
    return tensionBgm;
  }

  if (DECISION_SCREENS.has(screen)) {
    return businessDecisionBgm;
  }

  return mainBgm;
}

function playOneShot(audio, volume) {
  if (!audio) {
    return;
  }

  audio.pause();
  audio.currentTime = 0;
  audio.volume = volume;
  audio.play().catch(() => {});
}
