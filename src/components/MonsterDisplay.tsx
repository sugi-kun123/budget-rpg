interface Stage {
  emoji: string;
  name: string;
  subtitle: string;
  color: string;
  animClass: string;
  level: number; // filled dots (0–4)
}

function getStage(growthRate: number, isLastDay: boolean, finalSavings: number): Stage {
  if (isLastDay) {
    return finalSavings >= 0
      ? { emoji: '🏆', name: 'CLEARED', subtitle: '月をクリアした！', color: '#ffcc00', animClass: 'monster-celebrate', level: 4 }
      : { emoji: '😭', name: 'DEFEATED', subtitle: '予算オーバーで敗北...', color: '#ff3366', animClass: 'monster-shake', level: 0 };
  }
  if (growthRate < -10) return { emoji: '💀', name: 'DEPLETED',  subtitle: '財布が枯渇した...',      color: '#ff3366', animClass: 'monster-shake-fast', level: 0 };
  if (growthRate <   0) return { emoji: '😰', name: 'WEAKENED',  subtitle: '弱体化している...',      color: '#ff9966', animClass: 'monster-shake',      level: 0 };
  if (growthRate <   5) return { emoji: '🥚', name: 'EGG',       subtitle: '孵化を待っている',        color: '#5050aa', animClass: 'monster-float',      level: 1 };
  if (growthRate <  15) return { emoji: '🐣', name: 'HATCHLING', subtitle: '節約の芽が出てきた！',   color: '#ffcc00', animClass: 'monster-bounce',     level: 2 };
  if (growthRate <  30) return { emoji: '🐲', name: 'GROWING',   subtitle: '着実に強くなってる！',   color: '#00ff88', animClass: 'monster-glow-pulse', level: 3 };
  return                       { emoji: '🐉', name: 'LEGENDARY', subtitle: '伝説の節約マスター！',   color: '#dd44ff', animClass: 'monster-rainbow',    level: 4 };
}

const STAGE_DOTS = 4;

interface Props {
  growthRate: number;
  isLastDay: boolean;
  finalSavings: number;
}

export default function MonsterDisplay({ growthRate, isLastDay, finalSavings }: Props) {
  const stage = getStage(growthRate, isLastDay, finalSavings);

  return (
    <section
      className="border rounded-xl py-6 px-4 bg-[#0a0a16] flex flex-col items-center gap-2 transition-all duration-700"
      style={{
        borderColor: `${stage.color}30`,
        boxShadow: `0 0 40px ${stage.color}0d`,
      }}
    >
      {/* Monster */}
      <div className={`text-8xl select-none leading-none ${stage.animClass}`}>
        {stage.emoji}
      </div>

      {/* Stage name */}
      <div
        className="text-xs font-bold tracking-[0.3em] mt-2"
        style={{ color: stage.color, textShadow: `0 0 8px ${stage.color}66` }}
      >
        {stage.name}
      </div>

      {/* Subtitle */}
      <div className="text-xs text-[#3a3a5a]">{stage.subtitle}</div>

      {/* Progress dots — positive stages only */}
      {!isLastDay && growthRate >= 0 && (
        <div className="flex items-center gap-2 mt-1">
          {Array.from({ length: STAGE_DOTS }, (_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all duration-700"
              style={{
                backgroundColor: i < stage.level ? stage.color : '#1a1a2e',
                boxShadow: i < stage.level ? `0 0 6px ${stage.color}` : 'none',
              }}
            />
          ))}
        </div>
      )}

      {/* Cumulative growth rate */}
      {!isLastDay && (
        <div
          className="text-xs mt-0.5 tabular-nums"
          style={{ color: growthRate >= 0 ? '#3a3a5a' : '#ff3366' }}
        >
          累積バフ {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
        </div>
      )}
    </section>
  );
}
