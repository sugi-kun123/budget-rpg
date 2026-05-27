import { useState } from 'react';
import { useBudget } from './hooks/useBudget';
import SettingsPanel from './components/SettingsPanel';
import CalendarModal from './components/CalendarModal';
import MonsterDisplay from './components/MonsterDisplay';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';

const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月',
                     '7月','8月','9月','10月','11月','12月'];

const fmt = (amount: number) =>
  `¥${Math.floor(Math.abs(amount)).toLocaleString('ja-JP')}`;

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showCalendar, setShowCalendar]  = useState(false);
  const {
    totalBudget,
    totalDays,
    currentYear,
    currentMonth,
    currentDay,
    todayStr,
    expenses,
    todayExpenses,
    todayBudget,
    todaySpent,
    todayRemaining,
    tomorrowBudget,
    buff,
    buffPercent,
    totalSpentNow,
    addExpense,
    removeExpense,
    updateSettings,
    resetAll,
  } = useBudget();

  const isOverBudget = todayRemaining < 0;
  const isLastDay    = currentDay >= totalDays;

  const baseDailyBudget = totalBudget / totalDays;
  const growthRate  = isLastDay ? 0 : ((tomorrowBudget - baseDailyBudget) / baseDailyBudget) * 100;
  const finalSavings = totalBudget - totalSpentNow;

  const hpPercent = todayBudget > 0
    ? Math.max(0, Math.min(100, (todayRemaining / todayBudget) * 100))
    : 0;

  const hpBarClass =
    isOverBudget  ? 'hp-bar-danger' :
    hpPercent > 50 ? 'hp-bar-green' :
    hpPercent > 25 ? 'hp-bar-yellow' :
                     'hp-bar-red';

  return (
    <div className="min-h-screen bg-[#080810] text-[#c0c0e0] font-mono">
      {showCalendar && (
        <CalendarModal
          todayStr={todayStr}
          currentYear={currentYear}
          currentMonth={currentMonth}
          totalBudget={totalBudget}
          expenses={expenses}
          onClose={() => setShowCalendar(false)}
        />
      )}

      {showSettings && (
        <SettingsPanel
          totalBudget={totalBudget}
          todayStr={todayStr}
          onSave={(b) => { updateSettings(b); setShowSettings(false); }}
          onClose={() => setShowSettings(false)}
          onReset={() => { resetAll(); setShowSettings(false); }}
        />
      )}

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Header */}
        <header className="flex items-center justify-between py-1">
          <span className="text-lg font-bold tracking-widest neon-green-text">
            ⚔ BUDGET RPG
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#3a3a5a]">
              {MONTH_NAMES[currentMonth]} {currentDay}/{totalDays}日
            </span>
            <button
              onClick={() => setShowCalendar(true)}
              title="カレンダーを開く"
              className="px-2 py-1 border border-[#1a1a2e] rounded text-[#3a3a5a] hover:border-[#00d4ff]/50 hover:text-[#00d4ff] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="text-xs px-2 py-1 border border-[#1a1a2e] rounded text-[#3a3a5a] hover:border-[#00d4ff]/50 hover:text-[#00d4ff] transition-colors"
            >
              ⚙
            </button>
          </div>
        </header>

        {/* Monster */}
        <MonsterDisplay
          growthRate={growthRate}
          isLastDay={isLastDay}
          finalSavings={finalSavings}
        />

        {/* HP / Today's Budget */}
        <section className="border border-[#1a1a2e] rounded-xl p-5 bg-[#0a0a16] space-y-4">
          <div className="text-xs text-[#3a3a5a] tracking-widest uppercase">
            Today's HP — 今日の残り予算
          </div>

          <div
            className={`text-6xl font-bold leading-none tracking-tight ${isOverBudget ? 'text-[#ff3366]' : 'neon-green-text'}`}
          >
            {isOverBudget && <span className="text-4xl mr-1">-</span>}
            {fmt(todayRemaining)}
          </div>

          <div>
            <div className="h-5 bg-[#0c0c18] rounded-full overflow-hidden border border-[#1a1a2e]">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${hpBarClass}`}
                style={{ width: `${isOverBudget ? 100 : hpPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-[#3a3a5a]">
              <span>支出 {fmt(todaySpent)}</span>
              <span>今日の予算 {fmt(todayBudget)}</span>
            </div>
          </div>
        </section>

        {/* Buff Preview */}
        {!isLastDay && (
          <section className="border border-[#1a1a2e] rounded-xl p-4 bg-[#0a0a16]">
            <div className="text-xs text-[#3a3a5a] tracking-widest uppercase mb-3">
              🔮 今日これ以上使わなければ...
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span
                className="text-4xl font-bold"
                style={{ color: '#00d4ff', textShadow: '0 0 15px rgba(0,212,255,0.5)' }}
              >
                {fmt(tomorrowBudget)}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-bold ${buff >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                  {buff >= 0 ? '+' : '-'}{fmt(buff)}
                </span>
                <span className={`text-xs ${buff >= 0 ? 'text-[#00ff88]/60' : 'text-[#ff3366]/60'}`}>
                  ({buff >= 0 ? '+' : ''}{buffPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="text-xs text-[#3a3a5a] mt-1.5">明日からの1日予算</div>
          </section>
        )}

        {/* Expense Form */}
        <ExpenseForm onAdd={addExpense} />

        {/* Expense List */}
        <ExpenseList
          expenses={todayExpenses}
          onRemove={removeExpense}
          todaySpent={todaySpent}
          todayBudget={todayBudget}
        />

        <div className="text-center text-[#1a1a2e] text-xs pb-2">
          BUDGET RPG v1.0 — データはブラウザに保存されます
        </div>
      </div>
    </div>
  );
}

export default App;
