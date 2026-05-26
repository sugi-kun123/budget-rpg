import type { Expense } from '../types';

interface Props {
  expenses: Expense[];
  onRemove: (id: string) => void;
  todaySpent: number;
  todayBudget: number;
}

const fmt = (amount: number) =>
  `¥${Math.floor(amount).toLocaleString('ja-JP')}`;

const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

export default function ExpenseList({ expenses, onRemove, todaySpent, todayBudget }: Props) {
  const isOverBudget = todaySpent > todayBudget;

  return (
    <section className="border border-[#1a1a2e] rounded-xl p-4 bg-[#0a0a16]">
      <div className="text-xs text-[#3a3a5a] tracking-widest uppercase mb-3">
        📋 今日の戦歴
      </div>

      {expenses.length === 0 ? (
        <div className="text-center text-[#2a2a4a] text-sm py-6 tracking-wide">
          支出なし — 節約モード発動中 ✦
        </div>
      ) : (
        <>
          <ul className="space-y-1.5">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="flex items-center gap-2 text-sm group"
              >
                <span className="text-[#2a2a4a] text-xs w-10 shrink-0">
                  {fmtTime(expense.timestamp)}
                </span>
                <span className="flex-1 text-[#8080a0] truncate">
                  {expense.memo}
                </span>
                <span className="text-[#ffaa55] font-bold shrink-0 tabular-nums">
                  {fmt(expense.amount)}
                </span>
                <button
                  onClick={() => onRemove(expense.id)}
                  className="text-[#2a2a4a] hover:text-[#ff3366] transition-colors w-5 text-center text-xs shrink-0 opacity-0 group-hover:opacity-100"
                  title="削除"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <div
            className={`mt-3 pt-3 border-t border-[#1a1a2e] flex justify-between items-center text-sm font-bold`}
          >
            <span className="text-[#3a3a5a]">今日の合計</span>
            <span className={isOverBudget ? 'text-[#ff3366]' : 'text-[#ffaa55]'}>
              {fmt(todaySpent)}
              {isOverBudget && (
                <span className="text-xs ml-1.5 text-[#ff3366]/70">⚠ OVER</span>
              )}
            </span>
          </div>
        </>
      )}
    </section>
  );
}
