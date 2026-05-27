import { useState } from 'react';
import type { Expense } from '../types';
import { daysInMonth, toDateStr, monthPrefix } from '../hooks/useBudget';

interface Props {
  todayStr: string;      // "2025-05-15"
  currentYear: number;
  currentMonth: number;  // 0-indexed
  totalBudget: number;
  expenses: Expense[];
  onUpdateMemo: (id: string, memo: string) => void;
  onClose: () => void;
}

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月',
                     '7月', '8月', '9月', '10月', '11月', '12月'];
const WEEKDAYS   = ['月', '火', '水', '木', '金', '土', '日'];

const fmt = (n: number) => `¥${Math.floor(n).toLocaleString('ja-JP')}`;

const fmtCell = (amount: number) => {
  if (amount === 0) return '−';
  if (amount < 1000) return `¥${amount}`;
  return `¥${(amount / 1000).toFixed(1)}k`;
};

const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

function buildDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Monday-first weekday offset (Mon=0 … Sun=6)
function weekdayOffset(year: number, month: number): number {
  const d = new Date(year, month, 1).getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1;
}

// Editable memo row — amount is read-only
function ExpenseRow({ expense, onSave }: { expense: Expense; onSave: (memo: string) => void }) {
  const [memo, setMemo] = useState(expense.memo);
  const [dirty, setDirty] = useState(false);

  return (
    <li className="flex items-center gap-2">
      <span className="text-[#3a3a5a] text-[10px] w-9 shrink-0">{fmtTime(expense.timestamp)}</span>
      <span className="text-[#ffaa55] font-bold text-xs shrink-0 w-16 text-right tabular-nums">
        {fmt(expense.amount)}
      </span>
      <input
        type="text"
        value={memo}
        onChange={(e) => { setMemo(e.target.value); setDirty(true); }}
        onBlur={() => { if (dirty) { onSave(memo); setDirty(false); } }}
        placeholder="メモを入力..."
        className="flex-1 min-w-0 bg-[#080810] border border-[#1a1a2e] rounded px-2 py-1 text-xs text-[#a0a0c0] focus:outline-none focus:border-[#00ff88] transition-colors placeholder-[#2a2a4a]"
      />
    </li>
  );
}

export default function CalendarModal({
  todayStr,
  currentYear,
  currentMonth,
  totalBudget,
  expenses,
  onUpdateMemo,
  onClose,
}: Props) {
  const [viewYear, setViewYear]   = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const goPrev = () => {
    const newMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const newYear  = viewMonth === 0 ? viewYear - 1 : viewYear;
    setViewYear(newYear);
    setViewMonth(newMonth);
    setSelectedDate(buildDateStr(newYear, newMonth, 1));
  };

  const goNext = () => {
    const newMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const newYear  = viewMonth === 11 ? viewYear + 1 : viewYear;
    setViewYear(newYear);
    setViewMonth(newMonth);
    setSelectedDate(buildDateStr(newYear, newMonth, 1));
  };

  const goToToday = () => {
    setViewYear(currentYear);
    setViewMonth(currentMonth);
    setSelectedDate(todayStr);
  };

  // Group all expenses by date string
  const byDate = expenses.reduce<Record<string, Expense[]>>((acc, e) => {
    (acc[e.date] ??= []).push(e);
    return acc;
  }, {});

  const dayTotal = (dateStr: string) =>
    (byDate[dateStr] ?? []).reduce((s, e) => s + e.amount, 0);

  const viewDays    = daysInMonth(viewYear, viewMonth);
  const viewOffset  = weekdayOffset(viewYear, viewMonth);
  const viewPrefix  = monthPrefix(viewYear, viewMonth);

  // For future months show base projected budget per day
  const projectedPerDay = totalBudget / viewDays;

  // Detail for selected date
  const selExpenses  = byDate[selectedDate] ?? [];
  const selTotal     = dayTotal(selectedDate);
  const isFutureDate = selectedDate > todayStr;
  const isCurrentView = viewYear === currentYear && viewMonth === currentMonth;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#0e0e1a] border border-[#2a2a4a] rounded-xl w-full max-w-sm flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a2e] shrink-0">
          <span className="text-xs font-bold tracking-widest text-[#00d4ff]">📅 CALENDAR</span>
          <button
            onClick={onClose}
            className="text-[#3a3a5a] hover:text-[#c0c0e0] transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-3 space-y-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={goPrev}
              className="text-[#5050a0] hover:text-[#00d4ff] transition-colors px-2 py-1 text-sm"
            >
              ‹
            </button>
            <div className="text-center">
              <button
                onClick={goToToday}
                className="text-sm font-bold text-[#c0c0e0] hover:text-[#00d4ff] transition-colors tracking-wide"
              >
                {viewYear}年 {MONTH_NAMES[viewMonth]}
              </button>
              {!isCurrentView && (
                <div className="text-[10px] text-[#3a3a5a] mt-0.5">
                  {selectedDate > toDateStr(new Date()) ? 'FUTURE' :
                   viewYear < currentYear || (viewYear === currentYear && viewMonth < currentMonth) ? 'PAST' : ''}
                </div>
              )}
            </div>
            <button
              onClick={goNext}
              className="text-[#5050a0] hover:text-[#00d4ff] transition-colors px-2 py-1 text-sm"
            >
              ›
            </button>
          </div>

          {/* Calendar grid */}
          <div>
            {/* Weekday labels */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((d, i) => (
                <div
                  key={d}
                  className="text-center text-[10px] py-0.5"
                  style={{ color: i >= 5 ? '#3a2a4a' : '#2a2a4a' }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty offset cells */}
              {Array.from({ length: viewOffset }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Actual day cells */}
              {Array.from({ length: viewDays }, (_, i) => {
                const day     = i + 1;
                const dateStr = buildDateStr(viewYear, viewMonth, day);
                const isToday = dateStr === todayStr;
                const isPast  = dateStr < todayStr;
                const spent   = dayTotal(dateStr);
                const isSel   = dateStr === selectedDate;

                // Weekday index (Mon=0…Sun=6) for color
                const weekday = (viewOffset + i) % 7;
                const isWeekend = weekday >= 5;

                return (
                  <button
                    key={dateStr}
                    onClick={() => { setSelectedDate(dateStr); setViewYear(viewYear); setViewMonth(viewMonth); }}
                    className="aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all"
                    style={{
                      backgroundColor: isSel ? '#1a1a2e' : 'transparent',
                      boxShadow: isSel
                        ? `0 0 0 1px ${isToday ? '#00ff8866' : '#2a2a4a'}`
                        : 'none',
                    }}
                  >
                    <span
                      className="text-xs font-bold leading-none"
                      style={{
                        color: isToday  ? '#00ff88' :
                               isPast   ? (isWeekend ? '#4a3a6a' : '#7070a0') :
                                          (isWeekend ? '#251825' : '#252540'),
                      }}
                    >
                      {day}
                    </span>
                    {(isPast || isToday) ? (
                      <span
                        className="text-[9px] leading-none tabular-nums"
                        style={{ color: spent > 0 ? '#ffaa55' : '#2a2a5a' }}
                      >
                        {fmtCell(spent)}
                      </span>
                    ) : (
                      <span className="text-[9px] leading-none text-[#1a1a2e]">·</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Month total (past/current months only) */}
            {!isFutureDate && (
              <div className="mt-2 text-right text-[10px] text-[#3a3a5a]">
                {MONTH_NAMES[viewMonth]}合計:{' '}
                <span className="text-[#ffaa55] tabular-nums">
                  {fmt(
                    expenses
                      .filter((e) => e.date.startsWith(viewPrefix))
                      .reduce((s, e) => s + e.amount, 0)
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Selected date detail */}
          <div className="border-t border-[#1a1a2e] pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#3a3a5a] tracking-widest">
                {selectedDate}
                {selectedDate === todayStr && <span className="text-[#00ff88] ml-2">TODAY</span>}
                {isFutureDate && <span className="text-[#252540] ml-2">FUTURE</span>}
              </span>
              {!isFutureDate && selTotal > 0 && (
                <span className="text-xs text-[#ffaa55] font-bold tabular-nums">
                  {fmt(selTotal)}
                </span>
              )}
            </div>

            {isFutureDate ? (
              <div className="text-center py-5 space-y-1.5">
                <div
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: '#00d4ff', textShadow: '0 0 12px rgba(0,212,255,0.4)' }}
                >
                  {fmt(projectedPerDay)}
                </div>
                <div className="text-[10px] text-[#3a3a5a]">
                  {viewYear}年{viewMonth + 1}月の基本1日予算
                </div>
              </div>
            ) : selExpenses.length === 0 ? (
              <div className="text-center text-[#2a2a4a] text-xs py-5">支出なし</div>
            ) : (
              <ul className="space-y-2">
                {selExpenses.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    onSave={(memo) => onUpdateMemo(expense.id, memo)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
