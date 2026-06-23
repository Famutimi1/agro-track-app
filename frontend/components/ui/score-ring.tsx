interface ScoreRingProps {
  score: number;
  size?: number;
  maxScore?: number;
}

export function ScoreRing({ score, size = 80, maxScore = 850 }: ScoreRingProps) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const pct = score / maxScore;

  const color =
    score >= 750
      ? "#16a34a"
      : score >= 600
        ? "#2563eb"
        : score >= 450
          ? "#f59e0b"
          : "#ef4444";

  const label =
    score >= 750
      ? "Platinum"
      : score >= 650
        ? "Gold"
        : score >= 500
          ? "Silver"
          : "Bronze";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={7}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span
          className="font-extrabold leading-none"
          style={{ fontSize: size > 60 ? 18 : 12, color }}
        >
          {score}
        </span>
        {size > 60 && (
          <span className="text-[10px] text-white/60 mt-0.5">{label}</span>
        )}
      </div>
    </div>
  );
}
