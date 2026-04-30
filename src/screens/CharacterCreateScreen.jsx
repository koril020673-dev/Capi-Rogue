import { useMemo, useState } from 'react';
import femaleAFull from '../assets/optimized/player/player_female_a_full.png';
import femaleAProfile from '../assets/optimized/player/player_female_a_profile.png';
import femaleBFull from '../assets/optimized/player/player_female_b_full.png';
import femaleBProfile from '../assets/optimized/player/player_female_b_profile.png';
import maleAFull from '../assets/optimized/player/player_male_a_full.png';
import maleAProfile from '../assets/optimized/player/player_male_a_profile.png';
import maleBFull from '../assets/optimized/player/player_male_b_full.png';
import maleBProfile from '../assets/optimized/player/player_male_b_profile.png';
import { SCREEN_IDS, useGameStore } from '../store/useGameStore';
import '../styles/characterCreate.css';

export const PLAYER_PROFILES = Object.freeze([
  Object.freeze({
    id: 'male_a',
    gender: '남',
    fullImage: maleAFull,
    profileImage: maleAProfile,
  }),
  Object.freeze({
    id: 'male_b',
    gender: '남',
    fullImage: maleBFull,
    profileImage: maleBProfile,
  }),
  Object.freeze({
    id: 'female_a',
    gender: '여',
    fullImage: femaleAFull,
    profileImage: femaleAProfile,
  }),
  Object.freeze({
    id: 'female_b',
    gender: '여',
    fullImage: femaleBFull,
    profileImage: femaleBProfile,
  }),
]);

const TEXT = Object.freeze({
  title: 'CEO를 설정하세요',
  profileSelect: '프로필 사진 선택',
  ceoName: 'CEO 이름',
  companyName: '회사 이름',
  start: '시작하기',
});

export default function CharacterCreateScreen() {
  const savedProfile = useGameStore((state) => state.playerProfile);
  const completeCharacterCreate = useGameStore((state) => state.completeCharacterCreate);
  const [selectedProfileId, setSelectedProfileId] = useState(
    savedProfile.profileId ?? PLAYER_PROFILES[0].id,
  );
  const [playerName, setPlayerName] = useState(savedProfile.playerName ?? '');
  const [companyName, setCompanyName] = useState(savedProfile.companyName ?? '');
  const selectedProfile = useMemo(
    () => PLAYER_PROFILES.find((profile) => profile.id === selectedProfileId) ?? PLAYER_PROFILES[0],
    [selectedProfileId],
  );

  async function handleStart() {
    const profile = {
      profileId: selectedProfile.id,
      playerName,
      companyName,
      profileImage: selectedProfile.profileImage,
      fullImage: selectedProfile.fullImage,
    };

    await saveProfileToSupabase(profile);
    completeCharacterCreate(profile);
  }

  return (
    <main className="cr2-character-create-screen">
      <section className="cr2-character-panel">
        <button
          className="cr2-flow-back-button"
          type="button"
          onClick={() => useGameStore.setState({ screen: SCREEN_IDS.TITLE })}
        >
          이전으로
        </button>
        <h1>{TEXT.title}</h1>

        <section className="cr2-character-section">
          <h2>{TEXT.profileSelect}</h2>
          <div className="cr2-character-grid">
            {PLAYER_PROFILES.map((profile) => (
              <button
                className={
                  profile.id === selectedProfile.id
                    ? 'cr2-character-thumb cr2-character-thumb--selected'
                    : 'cr2-character-thumb'
                }
                key={profile.id}
                type="button"
                onClick={() => setSelectedProfileId(profile.id)}
              >
                <img src={profile.fullImage} alt="" decoding="async" loading="lazy" />
                <span>{profile.gender} {profile.id.endsWith('_a') ? 'A' : 'B'}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="cr2-character-form">
          <TerminalInput
            label={TEXT.ceoName}
            maxLength={10}
            value={playerName}
            onChange={setPlayerName}
          />
          <TerminalInput
            label={TEXT.companyName}
            maxLength={12}
            value={companyName}
            onChange={setCompanyName}
          />
        </section>

        <button
          className="cr2-primary-button cr2-character-start"
          type="button"
          onClick={handleStart}
        >
          {TEXT.start}
        </button>
      </section>
    </main>
  );
}

function TerminalInput({ label, value, maxLength, onChange }) {
  return (
    <label className="cr2-character-input-row">
      <span>&gt; {label}</span>
      <input
        maxLength={maxLength}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <i aria-hidden="true" />
    </label>
  );
}

async function saveProfileToSupabase(profile) {
  // TODO: Supabase 연동이 확정되면 profiles 테이블에 저장한다.
  // const userId = supabase.auth.user().id;
  // await supabase.from('profiles').insert({
  //   user_id: userId,
  //   profile_id: profile.profileId,
  //   player_name: profile.playerName,
  //   company_name: profile.companyName,
  //   created_at: new Date().toISOString(),
  // });
  return profile;
}
