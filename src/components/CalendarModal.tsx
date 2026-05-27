import { useState } from 'react';
import type { Expense } from '../types';
import { daysInMonth, toDateStr, monthPrefix } from '../hooks/useBudget';

interface Props {
  todayStr: string;
  currentYear: number;
  currentMonth: number;
  totalBudget: number;
  expenses: Expense[];
  onClose: () => void;
}

const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月',
                     '7月','8月','9月','10月','11月','12月'];
const WEEKDAYS    = ['月','火','水','木','金','土','日'];

const fmt = (n: number) => `¥${Math.floor(n).toLocaleString('ja-JP')}`;

const fmtCell = (amount: number) => {
  if (amount === 0) return '−';
  if (amount < 1000) return `¥${amount}`;
  return `¥${(amount / 1000).toFixed(1)}k`;
};

function buildDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function weekdayOffset(year: number, month: number): number {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

export default function CalendarModal({
  todayStr,
  currentYear,
  currentMonth,
  totalBudget,
  expenses,
  onClose,
}: Props) {
  const [viewYear, setViewYear]     = useState(currentYear);
  const [viewMonth, setViewMonth]   = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const goPrev = () => {
    const nm = viewMonth === 0 ? 11 : viewMonth - 1;
    const ny = viewMonth === 0 ? viewYear - 1 : viewYear;
    setViewYear(ny); setViewMonth(nm);
    setSelectedDate(buildDateStr(ny, nm, 1));
  };

  const goNext = () => {
    const nm = viewMonth === 11 ? 0 : viewMonth + 1;
    const ny = viewMonth === 11 ? viewYear + 1 : viewYear;
    setViewYear(ny); setViewMonth(nm);
    setSelectedDate(buildDateStr(ny, nm, 1));
  };

  const goToToday = () => {
    setViewYear(currentYear); setViewMonth(currentMonth);
    setSelectedDate(todayStr);
  };

  const byDate = expenses.reduce<Record<string, Expense[]>>((acc, e) => {
    (acc[e.date] ??= []).push(e);
    return acc;
  }, {});

  const dayTotal = (d: string) =>
    (byDate[d] ?? []).reduce((s, e) => s + e.amount, 0);

  const viewDays   = daysInMonth(viewYear, viewMonth);
  const viewOffset = weekdayOffset(viewYear, viewMonth);
  const viewPrefix = monthPrefix(viewYear, viewMonth);

  const projectedPerDay = totalBudget / viewDays;

  const selExpenses  = byDate[selectedDate] ?? [];
  const selTotal     = dayTotal(selectedDate);
  const isFuture     = selectedDate > todayStr;
  const isToday      = selectedDate === todayStr;
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
          <button onClick={onClose} className="text-[#3a3a5a] hover:text-[#c0c0e0] transition-colors text-lg leading-none">×</button>
        </div>

        <div className="overflow-y-auto p-3 space-y-4">

          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <button onClick={goPrev} className="text-[#5050a0] hover:text-[#00d4ff] transition-colors px-2 py-1 text-sm">‹</button>
            <div className="text-center">
              <button onClick={goToToday} className="text-sm font-bold text-[#c0c0e0] hover:text-[#00d4ff] transition-colors tracking-wide">
                {viewYear}年 {MONTH_NAMES[viewMonth]}
              </button>
              {!isCurrentView && (
                <div className="text-[10px] text-[#3a3a5a] mt-0.5">
                  {selectedDate > toDateStr(new Date()) ? 'FUTURE' : 'PAST'}
                </div>
              )}
            </div>
            <button onClick={goNext} className="text-[#5050a0] hover:text-[#00d4ff] transition-colors px-2 py-1 text-sm">›</button>
          </div>

          {/* Calendar grid */}
          <div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((d, i) => (
                <div key={d} className="text-center text-[10px] py-0.5"
                  style={{ color: i >= 5 ? '#3a2a4a' : '#2a2a4a' }}>
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: viewOffset }, (_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: viewDays }, (_, i) => {
                const day     = i + 1;
                const dateStr = buildDateStr(viewYear, viewMonth, day);
                const dayIsToday  = dateStr === todayStr;
                const dayIsPast   = dateStr < todayStr;
                const spent       = dayTotal(dateStr);
                const isSel       = dateStr === selectedDate;
                const isWeekend   = (viewOffset + i) % 7 >= 5;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className="aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all"
                    style={{
                      backgroundColor: isSel ? '#1a1a2e' : 'transparent',
                      boxShadow: isSel ? `0 0 0 1px ${dayIsToday ? '#00ff8866' : '#2a2a4a'}` : 'none',
                    }}
                  >
                    <span className="text-xs font-bold leading-none" style={{
                      color: dayIsToday ? '#00ff88'
                           : dayIsPast  ? (isWeekend ? '#4a3a6a' : '#7070a0')
                                        : (isWeekend ? '#251825' : '#252540'),
                    }}>
                      {day}
                    </span>
                    {(dayIsPast || dayIsToday) ? (
                      <span className="text-[9px] leading-none tabular-nums"
                        style={{ color: spent > 0 ? '#ffaa55' : '#2a2a5a' }}>
                        {fmtCell(spent)}
                      </span>
                    ) : (
                      <span className="text-[9px] leading-none text-[#1a1a2e]">·</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Month total */}
            {!isFuture && (
              <div className="mt-2 text-right text-[10px] text-[#3a3a5a]">
                {MONTH_NAMES[viewMonth]}合計:{' '}
                <span className="text-[#ffaa55] tabular-nums">
                  {fmt(expenses.filter(e => e.date.startsWith(viewPrefix)).reduce((s, e) => s + e.amount, 0))}
                </span>
              </div>
            )}
          </div>

          {/* Selected date detail */}
          <div className="border-t border-[#1a1a2e] pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#3a3a5a] tracking-widest">
                {selectedDate}
                {isToday  && <span className="text-[#00ff88] ml-2">TODAY</span>}
                {isFuture && <span className="text-[#252540] ml-2">FUTURE</span>}
              </span>
              {!isFuture && selTotal > 0 && (
                <span className="text-xs text-[#ffaa55] font-bold tabular-nums">{fmt(selTotal)}</span>
              )}
            </div>

            {isFuture ? (
              <div className="text-center py-5 space-y-1.5">
                <div className="text-3xl font-bold tabular-nums"
                  style={{ color: '#00d4ff', textShadow: '0 0 12px rgba(0,212,255,0.4)' }}>
                  {fmt(projectedPerDay)}
                </div>
                <div className="text-[10px] text-[#3a3a5a]">
                  {viewYear}年{viewMonth + 1}月の基本1日予算
                </div>
              </div>
            ) : selExpenses.length === 0 ? (
              <div className="text-center text-[#2a2a4a] text-xs py-5">支出なし</div>
            ) : (
              /* 過去・今日: 読み取り専用リスト */
              <ul className="space-y-1.5">
                {selExpenses.map((e) => (
                  <li key={e.id} className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="text-[#5050a0] truncate">{e.memo}</span>
                    <span className="text-[#ffaa55] font-bold tabular-nums shrink-0">{fmt(e.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
