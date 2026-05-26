import { useState } from 'react';

interface Props {
  onAdd: (amount: number, memo: string) => void;
}

export default function ExpenseForm({ onAdd }: Props) {
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(amount, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onAdd(parsed, memo);
      setAmount('');
      setMemo('');
    }
  };

  return (
    <section className="border border-[#1a1a2e] rounded-xl p-4 bg-[#0a0a16]">
      <div className="text-xs text-[#3a3a5a] tracking-widest uppercase mb-3">
        ⚡ 支出を記録
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5050a0] text-sm">¥</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            min="1"
            className="w-28 bg-[#080810] border border-[#2a2a4a] rounded-lg pl-7 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88] transition-colors placeholder-[#2a2a4a]"
          />
        </div>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="メモ（任意）"
          maxLength={40}
          className="flex-1 bg-[#080810] border border-[#2a2a4a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88] transition-colors placeholder-[#2a2a4a]"
        />
        <button
          type="submit"
          className="px-4 py-2.5 border border-[#00ff88] text-[#00ff88] rounded-lg text-sm font-bold hover:bg-[#00ff88]/10 transition-colors whitespace-nowrap tracking-wide"
        >
          記録！
        </button>
      </form>
    </section>
  );
}
