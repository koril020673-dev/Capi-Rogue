import { useEffect, useRef, useState } from 'react';
import { getAudioSettings } from '../logic/audioEngine';
import { useGameStore } from '../store/useGameStore';
import clickSfx from '../assets/sfx/sfx_click.wav';
import nextFloorSfx from '../assets/sfx/sfx_nextfloor.wav';

export default function AudioController() {
  const floor = useGameStore((state) => state.floor);
  const [settings, setSettings] = useState(() => getAudioSettings());
  const clickRef = useRef(null);
  const nextFloorRef = useRef(null);
  const previousFloorRef = useRef(floor);

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
    function handleClick(event) {
      if (!settings.sfxEnabled || getSfxVolume(settings) <= 0 || !event.target?.closest?.('button')) {
        return;
      }

      playOneShot(clickRef.current, getSfxVolume(settings) * 0.45);
    }

    document.addEventListener('click', handleClick, true);

    return () => document.removeEventListener('click', handleClick, true);
  }, [settings.sfxEnabled, settings.masterVolume, settings.sfxVolume]);

  useEffect(() => {
    if (floor > previousFloorRef.current && settings.sfxEnabled && getSfxVolume(settings) > 0) {
      playOneShot(nextFloorRef.current, getSfxVolume(settings) * 0.7);
    }

    previousFloorRef.current = floor;
  }, [floor, settings.sfxEnabled, settings.masterVolume, settings.sfxVolume]);

  return (
    <>
      <audio ref={clickRef} preload="auto" src={clickSfx} />
      <audio ref={nextFloorRef} preload="auto" src={nextFloorSfx} />
    </>
  );
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

function getSfxVolume(settings) {
  return clampVolume(settings.masterVolume) * clampVolume(settings.sfxVolume);
}

function clampVolume(value) {
  return Math.max(0, Math.min(1, (Number(value) || 0) / 100));
}
