import { STRATEGY_TAB_LABELS, STRATEGY_TABS } from '../constants/strategies';
import { useGameStore } from '../store/useGameStore';
import Tooltip from './Tooltip';

const TAB_ORDER = Object.freeze([
  STRATEGY_TABS.PRICE,
  STRATEGY_TABS.QUALITY,
  STRATEGY_TABS.OPERATIONS,
  STRATEGY_TABS.ADVANCE,
]);

const TAB_HELP = Object.freeze({
  [STRATEGY_TABS.PRICE]: Object.freeze({ className: 'cr2-tab-price', tooltipId: 'tab_price' }),
  [STRATEGY_TABS.QUALITY]: Object.freeze({ className: 'cr2-tab-quality', tooltipId: 'tab_quality' }),
  [STRATEGY_TABS.OPERATIONS]: Object.freeze({ className: 'cr2-tab-operation', tooltipId: 'tab_operation' }),
});

export default function TabBar() {
  const activeTab = useGameStore((state) => state.strategy.activeTab);
  const setActiveTab = useGameStore((state) => state.setActiveTab);

  return (
    <nav className="cr2-tab-bar" aria-label="strategy tabs">
      {TAB_ORDER.map((tabId) => {
        const help = TAB_HELP[tabId];
        const className = [
          'cr2-tab-button',
          help?.className,
          tabId === activeTab ? 'cr2-tab-button--active' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            className={className}
            key={tabId}
            type="button"
            onClick={() => setActiveTab(tabId)}
          >
            {help ? (
              <Tooltip tooltipId={help.tooltipId}>{STRATEGY_TAB_LABELS[tabId]}</Tooltip>
            ) : (
              STRATEGY_TAB_LABELS[tabId]
            )}
          </button>
        );
      })}
    </nav>
  );
}
