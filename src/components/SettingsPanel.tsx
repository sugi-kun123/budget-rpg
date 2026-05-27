import { useState } from 'react';

interface Props {
  totalBudget: number;
  todayStr: string;
  onSave: (budget: number) => void;
  onClose: () => void;
  onReset: () => void;
}

export default function SettingsPanel({ totalBudget, todayStr, onSave, onClose, onReset }: Props) {
  const [budget, setBudget] = useState(totalBudget.toString());

  const handleSave = () => {
    const b = parseInt(budget, 10);
    if (!isNaN(b) && b > 0) onSave(b);
  };

  const handleReset = () => {
    if (window.confirm('全データをリセットしますか？この操作は元に戻せません。')) onReset();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#0e0e1a] border border-[#2a2a4a] rounded-xl p-6 w-full max-w-sm space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[#00d4ff] font-bold tracking-widest text-sm">⚙ SETTINGS</div>

        <div>
          <label className="text-xs text-[#5050a0] block mb-1.5 tracking-widest uppercase">
            今月の予算 (¥)
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            min="1"
            className="w-full bg-[#080810] border border-[#2a2a4a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00d4ff] transition-colors"
          />
          <p className="text-[10px] text-[#3a3a5a] mt-1.5">
            日数はカレンダーに自動で合わせます
          </p>
        </div>

        <div className="text-xs text-[#3a3a5a] border-t border-[#1a1a2e] pt-3">
          現在: {todayStr}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 border border-[#00d4ff] text-[#00d4ff] rounded-lg px-4 py-2.5 text-sm font-bold hover:bg-[#00d4ff]/10 transition-colors"
          >
            保存
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-[#2a2a4a] text-[#5050a0] rounded-lg px-4 py-2.5 text-sm hover:border-[#3a3a5a] hover:text-[#7070a0] transition-colors"
          >
            キャンセル
          </button>
        </div>

        <button
          onClick={handleReset}
          className="w-full text-xs text-[#ff3366]/40 hover:text-[#ff3366] transition-colors py-1"
        >
          全データをリセット
        </button>
      </div>
    </div>
  );
}
