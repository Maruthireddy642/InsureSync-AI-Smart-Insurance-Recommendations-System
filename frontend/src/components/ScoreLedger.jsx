const ROWS = [
  { key: "cpf", label: "Coverage Fit", weight: "w\u2081 \u00b7 0.35", sign: "+" },
  { key: "bms", label: "Benefits Match", weight: "w\u2082 \u00b7 0.25", sign: "+" },
  { key: "crs", label: "Claim Reliability", weight: "w\u2083 \u00b7 0.25", sign: "+" },
  { key: "pmc", label: "Premium Cost", weight: "w\u2084 \u00b7 0.15", sign: "\u2212" },
];

function ScoreDial({ value }) {
  const pct = Math.min(Math.max(value, 0), 100);
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="#17967F"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 32 32)"
      />
      <text x="32" y="36" textAnchor="middle" className="fill-white font-mono text-[13px] font-semibold">
        {Math.round(value)}
      </text>
    </svg>
  );
}

export default function ScoreLedger({ result, compact = false }) {
  return (
    <div className="ticket-notch bg-white border border-line rounded-xl overflow-hidden shadow-card">
      <div className="px-5 py-4 flex items-center justify-between bg-ink relative overflow-hidden">
        <div className="absolute inset-0 bg-sidebar-glow opacity-60 pointer-events-none" />
        <div className="relative">
          <div className="eyebrow text-ledger-glow mb-1">Recommendation Ledger</div>
          {/* RS = Σ(weight × term) — kept as code comment only, not rendered */}
        </div>
        <ScoreDial value={result.irs_score} />
      </div>

      <div className="ticket-perf" />

      <div className="divide-y divide-line/70">
        {ROWS.map((row) => (
          <div key={row.key} className={`flex items-center justify-between px-5 ${compact ? "py-2" : "py-2.5"}`}>
            <div className="flex items-baseline gap-2.5">
              <span
                className={`font-mono text-sm w-3 text-center ${row.sign === "+" ? "text-ledger" : "text-risk"}`}
              >
                {row.sign}
              </span>
              <span className="text-sm text-ink">{row.label}</span>
              {/* Weight labels (e.g. w₁ · 0.35) hidden — internal detail */}
            </div>
            <span className="font-mono text-sm text-ink tabular-nums">{result[row.key].toFixed(1)}</span>
          </div>
        ))}
      </div>

      <div className="ticket-perf" />

      <div className="px-5 py-4 flex items-center justify-between bg-ledger-light/50">
        <span className="text-sm font-medium text-ledger-dark">Insurance Recommendation Score</span>
        <span className="font-mono text-xl font-semibold text-ledger-dark tabular-nums">{result.irs_score.toFixed(1)}</span>
      </div>
    </div>
  );
}
