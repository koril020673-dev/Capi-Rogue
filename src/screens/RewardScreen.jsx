import StatusBar from '../components/StatusBar';
import { REWARD_GRADE_LABELS } from '../constants/rewards';
import { useGameStore } from '../store/useGameStore';

export default function RewardScreen() {
  const rewardOptions = useGameStore((state) => state.rewardOptions);
  const chooseReward = useGameStore((state) => state.chooseReward);
  const floor = useGameStore((state) => state.floor);

  return (
    <main className="cr2-reward-screen">
      <StatusBar />
      <section className="cr2-reward-panel">
        <p className="cr2-kicker">{floor}개월차 보상</p>
        <h1>보상 선택</h1>
        <p className="cr2-title-copy">
          5개월마다 하나의 보상을 고릅니다. 선택한 보상은 이번 런의 성장 방향을 바꿉니다.
        </p>
        <div className="cr2-reward-grid">
          {rewardOptions.map((reward) => (
            <button
              className={`cr2-reward-card cr2-reward-card--${reward.grade}`}
              key={reward.id}
              type="button"
              onClick={() => chooseReward(reward.id)}
            >
              <span>{REWARD_GRADE_LABELS[reward.grade]}</span>
              <strong>{reward.title}</strong>
              <small>{reward.description}</small>
            </button>
          ))}
        </div>
        <p className="cr2-ledger-note">보상 선택 후 다음 달 시장 뉴스 또는 전략 화면으로 이동합니다.</p>
      </section>
    </main>
  );
}
