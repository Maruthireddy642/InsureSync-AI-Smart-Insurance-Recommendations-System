export default function RiskRing({ label, value, size = 88 }) {
  const pct = Math.round(value * 100);
  const color = pct >= 60 ? "#C85A46" : pct >= 30 ? "#DB9A2C" : "#0F6B5C";
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDEFEB" strokeWidth="7" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="font-mono font-semibold"
          style={{ fontSize: size * 0.22, fill: "#0E1E33" }}
        >
          {pct}%
        </text>
      </svg>
      <span className="text-xs text-slate text-center leading-tight">{label}</span>
    </div>
  );
}
