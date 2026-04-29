import { STRATEGY_TAB_LABELS, STRATEGY_TABS } from '../constants/strategies';
import { useGameStore } from '../store/useGameStore';

const TAB_ORDER = Object.freeze([
  STRATEGY_TABS.PRICE,
  STRATEGY_TABS.QUALITY,
  STRATEGY_TABS.OPERATIONS,
  STRATEGY_TABS.ADVANCE,
]);

export default function TabBar() {
  const activeTab = useGameStore((state) => state.strategy.activeTab);
  const setActiveTab = useGameStore((state) => state.setActiveTab);

  return (
    <nav className="cr2-tab-bar" aria-label="strategy tabs">
      {TAB_ORDER.map((tabId) => (
        <button
          className={tabId === activeTab ? 'cr2-tab-button cr2-tab-button--active' : 'cr2-tab-button'}
          key={tabId}
          type="button"
          onClick={() => setActiveTab(tabId)}
        >
          {STRATEGY_TAB_LABELS[tabId]}
        </button>
      ))}
    </nav>
  );
}
