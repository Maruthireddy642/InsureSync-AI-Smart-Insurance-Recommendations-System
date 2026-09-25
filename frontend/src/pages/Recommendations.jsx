import { ChevronDown, IndianRupee, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import Card from "../components/Card";
import ScoreLedger from "../components/ScoreLedger";

// Toggle this to switch between the real API and the sample data below.
// Flip back to false once your backend/ML pipeline is ready for the demo.
const USE_MOCK_DATA = true;

// Realistic sample insurance plans, shaped exactly like what
// GET /recommendations returns: [{ policy: {...}, irs_score: number }, ...]
//
// Ranked for a moderate-risk profile (prediabetes + Stage 1 hypertension) so
// plans with strong pre-existing-condition and chronic-care coverage score
// highest — this is what makes "why this plan ranked #1" land in a demo.
//
// NOTE ON ScoreLedger: I don't have that component's source, so each policy
// includes a `score_breakdown` object with the four factors from your RS
// formula (coverage_fit, benefits_match, claim_reliability, premium_cost),
// each on a 0-10 scale. If ScoreLedger expects different field names, rename
// these to match.
const MOCK_RECOMMENDATIONS = [
  {
    irs_score: 9.1,
    policy: {
      id: "pol_niva_reassure",
      plan_name: "ReAssure 2.0",
      provider_name: "Niva Bupa Health Insurance",
      tier: "premium",
      monthly_premium: 3120,
      coverage_limit: 10000000,
      deductible: 0,
      claim_approval_rate: 0.94,
      avg_claim_days: 6,
      benefits: "dental,wellness,mental_health,teleconsult,pre-existing",
      covers_preexisting: true,
      score_breakdown: { coverage_fit: 9.4, benefits_match: 8.8, claim_reliability: 9.2, premium_cost: 6.5 },
    },
  },
  {
    irs_score: 8.8,
    policy: {
      id: "pol_manipal_cigna_prohealth",
      plan_name: "ProHealth Prime",
      provider_name: "ManipalCigna Health Insurance",
      tier: "premium",
      monthly_premium: 3280,
      coverage_limit: 15000000,
      deductible: 0,
      claim_approval_rate: 0.93,
      avg_claim_days: 5,
      benefits: "dental,wellness,mental_health,teleconsult,maternity,pre-existing",
      covers_preexisting: true,
      score_breakdown: { coverage_fit: 9.2, benefits_match: 9.0, claim_reliability: 9.1, premium_cost: 6.0 },
    },
  },
  {
    irs_score: 8.6,
    policy: {
      id: "pol_star_diabetes_safe",
      plan_name: "Diabetes Safe Insurance Policy",
      provider_name: "Star Health and Allied Insurance",
      tier: "standard",
      monthly_premium: 2340,
      coverage_limit: 500000,
      deductible: 5000,
      claim_approval_rate: 0.91,
      avg_claim_days: 8,
      benefits: "wellness,teleconsult,pre-existing",
      covers_preexisting: true,
      score_breakdown: { coverage_fit: 9.0, benefits_match: 8.2, claim_reliability: 8.7, premium_cost: 7.4 },
    },
  },
  {
    irs_score: 8.2,
    policy: {
      id: "pol_hdfc_optima_secure",
      plan_name: "Optima Secure",
      provider_name: "HDFC ERGO General Insurance",
      tier: "premium",
      monthly_premium: 2890,
      coverage_limit: 7500000,
      deductible: 10000,
      claim_approval_rate: 0.92,
      avg_claim_days: 5,
      benefits: "dental,maternity,wellness,teleconsult",
      covers_preexisting: true,
      score_breakdown: { coverage_fit: 8.6, benefits_match: 8.4, claim_reliability: 9.0, premium_cost: 6.8 },
    },
  },
  {
    irs_score: 8.0,
    policy: {
      id: "pol_max_bupa_health_companion",
      plan_name: "Health Companion Platinum",
      provider_name: "Max Bupa Health Insurance",
      tier: "premium",
      monthly_premium: 2950,
      coverage_limit: 5000000,
      deductible: 5000,
      claim_approval_rate: 0.91,
      avg_claim_days: 6,
      benefits: "dental,wellness,mental_health,teleconsult,pre-existing",
      covers_preexisting: true,
      score_breakdown: { coverage_fit: 8.4, benefits_match: 8.1, claim_reliability: 8.8, premium_cost: 6.6 },
    },
  },
  {
    irs_score: 7.7,
    policy: {
      id: "pol_care_freedom",
      plan_name: "Care Freedom",
      provider_name: "Care Health Insurance",
      tier: "standard",
      monthly_premium: 1980,
      coverage_limit: 2500000,
      deductible: 15000,
      claim_approval_rate: 0.88,
      avg_claim_days: 9,
      benefits: "wellness,mental_health,teleconsult",
      covers_preexisting: true,
      score_breakdown: { coverage_fit: 7.9, benefits_match: 7.6, claim_reliability: 8.1, premium_cost: 7.8 },
    },
  },
  {
    irs_score: 7.5,
    policy: {
      id: "pol_sbi_arogya_supreme",
      plan_name: "Arogya Supreme",
      provider_name: "SBI General Insurance",
      tier: "standard",
      monthly_premium: 1850,
      coverage_limit: 2500000,
      deductible: 10000,
      claim_approval_rate: 0.89,
      avg_claim_days: 9,
      benefits: "wellness,teleconsult,pre-existing",
      covers_preexisting: true,
      score_breakdown: { coverage_fit: 7.8, benefits_match: 7.3, claim_reliability: 8.2, premium_cost: 7.6 },
    },
  },
  {
    irs_score: 7.3,
    policy: {
      id: "pol_icici_complete_health",
      plan_name: "Complete Health Insurance",
      provider_name: "ICICI Lombard General Insurance",
      tier: "standard",
      monthly_premium: 1750,
      coverage_limit: 2000000,
      deductible: 20000,
      claim_approval_rate: 0.87,
      avg_claim_days: 10,
      benefits: "wellness,teleconsult",
      covers_preexisting: false,
      score_breakdown: { coverage_fit: 7.1, benefits_match: 7.0, claim_reliability: 7.9, premium_cost: 8.2 },
    },
  },
  {
    irs_score: 7.0,
    policy: {
      id: "pol_kotak_health_shield",
      plan_name: "Health Shield Plus",
      provider_name: "Kotak Mahindra General Insurance",
      tier: "standard",
      monthly_premium: 1680,
      coverage_limit: 1500000,
      deductible: 15000,
      claim_approval_rate: 0.86,
      avg_claim_days: 10,
      benefits: "wellness,teleconsult,mental_health",
      covers_preexisting: false,
      score_breakdown: { coverage_fit: 7.2, benefits_match: 7.1, claim_reliability: 7.8, premium_cost: 8.0 },
    },
  },
  {
    irs_score: 6.9,
    policy: {
      id: "pol_aditya_birla_activ_platinum",
      plan_name: "Activ Health Platinum Enhanced",
      provider_name: "Aditya Birla Health Insurance",
      tier: "premium",
      monthly_premium: 3350,
      coverage_limit: 10000000,
      deductible: 0,
      claim_approval_rate: 0.9,
      avg_claim_days: 7,
      benefits: "dental,maternity,wellness,mental_health,teleconsult",
      covers_preexisting: false,
      score_breakdown: { coverage_fit: 7.4, benefits_match: 8.9, claim_reliability: 8.5, premium_cost: 5.4 },
    },
  },
  {
    irs_score: 6.6,
    policy: {
      id: "pol_chola_healthline",
      plan_name: "Healthline Classic",
      provider_name: "Cholamandalam MS General Insurance",
      tier: "standard",
      monthly_premium: 1420,
      coverage_limit: 1000000,
      deductible: 20000,
      claim_approval_rate: 0.84,
      avg_claim_days: 12,
      benefits: "wellness,teleconsult",
      covers_preexisting: false,
      score_breakdown: { coverage_fit: 6.8, benefits_match: 6.2, claim_reliability: 7.4, premium_cost: 8.4 },
    },
  },
  {
    irs_score: 6.4,
    policy: {
      id: "pol_tata_aig_medicare",
      plan_name: "MediCare Premier",
      provider_name: "Tata AIG General Insurance",
      tier: "standard",
      monthly_premium: 1590,
      coverage_limit: 1500000,
      deductible: 25000,
      claim_approval_rate: 0.85,
      avg_claim_days: 11,
      benefits: "teleconsult",
      covers_preexisting: false,
      score_breakdown: { coverage_fit: 6.2, benefits_match: 5.8, claim_reliability: 7.6, premium_cost: 8.6 },
    },
  },
  {
    irs_score: 6.1,
    policy: {
      id: "pol_national_mediclaim_plus",
      plan_name: "Mediclaim Plus",
      provider_name: "National Insurance Company",
      tier: "basic",
      monthly_premium: 1100,
      coverage_limit: 500000,
      deductible: 15000,
      claim_approval_rate: 0.82,
      avg_claim_days: 14,
      benefits: "teleconsult,wellness",
      covers_preexisting: false,
      score_breakdown: { coverage_fit: 6.0, benefits_match: 5.5, claim_reliability: 7.0, premium_cost: 8.8 },
    },
  },
  {
    irs_score: 5.6,
    policy: {
      id: "pol_bajaj_health_guard",
      plan_name: "Health Guard Standard",
      provider_name: "Bajaj Allianz General Insurance",
      tier: "basic",
      monthly_premium: 890,
      coverage_limit: 500000,
      deductible: 25000,
      claim_approval_rate: 0.83,
      avg_claim_days: 13,
      benefits: "teleconsult",
      covers_preexisting: false,
      score_breakdown: { coverage_fit: 5.1, benefits_match: 4.6, claim_reliability: 7.2, premium_cost: 9.3 },
    },
  },
  {
    irs_score: 5.2,
    policy: {
      id: "pol_reliance_health_infinity",
      plan_name: "Health Infinity",
      provider_name: "Reliance General Insurance",
      tier: "basic",
      monthly_premium: 950,
      coverage_limit: 300000,
      deductible: 20000,
      claim_approval_rate: 0.81,
      avg_claim_days: 14,
      benefits: "teleconsult",
      covers_preexisting: false,
      score_breakdown: { coverage_fit: 5.0, benefits_match: 4.4, claim_reliability: 6.8, premium_cost: 9.0 },
    },
  },
  {
    irs_score: 4.8,
    policy: {
      id: "pol_oriental_happy_family",
      plan_name: "Happy Family Floater",
      provider_name: "Oriental Insurance Company",
      tier: "basic",
      monthly_premium: 780,
      coverage_limit: 200000,
      deductible: 30000,
      claim_approval_rate: 0.79,
      avg_claim_days: 16,
      benefits: "teleconsult",
      covers_preexisting: false,
      score_breakdown: { coverage_fit: 4.5, benefits_match: 3.9, claim_reliability: 6.5, premium_cost: 9.5 },
    },
  },
];

const TIER_STYLES = {
  basic: "bg-slate/10 text-slate",
  standard: "bg-signal-light text-signal",
  premium: "bg-ledger-light text-ledger-dark",
};

// ---------------------------------------------------------------------------
// Insurance Recommendation Score (IRS) — scoring formula
//
//   RS = Σ(weight × term)
//      = (w_cpf × coverage_fit)
//      + (w_bms × benefits_match)
//      + (w_crs × claim_reliability)
//      + (w_pmc × premium_cost)
//
// where each term is normalized to a 0–10 scale (see `score_breakdown` on
// every mock policy above) and the weights sum to 1:
//
//   w_cpf (coverage_fit)      = 0.35   — how well limits/exclusions fit the user
//   w_bms (benefits_match)    = 0.25   — overlap with the user's needed benefits
//   w_crs (claim_reliability) = 0.25   — approval rate + speed track record
//   w_pmc (premium_cost)      = 0.15   — affordability relative to budget
//
// This block is intentionally NOT rendered anywhere in the UI — it exists
// purely as in-code documentation for how `irs_score` / `score_breakdown`
// are derived upstream (ML pipeline / backend), so the formula stays
// invisible to end users while remaining visible to anyone reading the code.
// ---------------------------------------------------------------------------

function RankBadge({ rank }) {
  if (rank === 0) {
    return (
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-signal flex items-center justify-center shrink-0 shadow-sm animate-pop">
        <Trophy size={16} className="text-white" />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-ledger-light text-ledger-dark font-mono text-sm flex items-center justify-center font-semibold shrink-0">
      {rank + 1}
    </div>
  );
}

function ScoreDisplay({ score, isTop }) {
  // Rendered directly (no count-up animation) so the correct value is
  // guaranteed on first paint — the previous animate-from-zero version could
  // be screenshotted mid-animation and appear stuck at "0.0".
  const value = Number(score ?? 0);
  return (
    <div
      className={`font-mono text-xl font-semibold tabular-nums ${isTop ? "text-signal" : "text-ledger-dark"
        }`}
    // The formula that produced `score` (RS = Σ(weight × term)) lives in the
    // comment block above — deliberately not surfaced in markup or title
    // attributes so it stays invisible to users of the app.
    >
      {value.toFixed(1)}
    </div>
  );
}

function RecommendationSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white border border-line rounded-xl px-5 py-4 flex items-center justify-between animate-fade-up"
          style={{ animationDelay: `${i * 90}ms` }}
        >
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-ledger-light/60 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-36 rounded bg-ledger-dark/10 animate-pulse" />
              <div className="h-2.5 w-24 rounded bg-ledger-dark/10 animate-pulse" />
            </div>
          </div>
          <div className="h-6 w-12 rounded bg-ledger-dark/10 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function Recommendations() {
  const [recs, setRecs] = useState(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(0);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setRecs(MOCK_RECOMMENDATIONS);
      return;
    }
    api
      .get("/recommendations")
      .then(({ data }) => setRecs(data))
      .catch((err) => setError(err?.response?.data?.detail || "Could not load recommendations."));
  }, []);

  if (error) {
    return (
      <Card>
        <p className="text-sm text-slate mb-3">{error}</p>
        <Link to="/health-profile" className="text-ledger-dark font-medium text-sm">
          Complete your health profile {"\u2192"}
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(217, 164, 65, 0.25); }
          50% { box-shadow: 0 0 0 6px rgba(217, 164, 65, 0); }
        }
        .animate-fade-up { animation: fadeInUp 420ms ease-out both; }
        .animate-pop { animation: pop 480ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .animate-glow { animation: glowPulse 2.6s ease-out 1; }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up, .animate-pop, .animate-glow, .animate-pulse {
            animation: none !important;
          }
        }
      `}</style>

      <div className="animate-fade-up">
        <div className="eyebrow text-ledger-dark mb-1.5 flex items-center gap-1.5">
          <Sparkles size={12} /> Insurance Recommendation Score
        </div>
        <h1 className="font-display text-3xl text-ink">Ranked for You</h1>
        <p className="text-xs text-slate-light mt-1.5">
          Every ranking below is fully explainable — expand a plan to see its ledger.
        </p>
      </div>

      {!recs ? (
        <RecommendationSkeleton />
      ) : (
        <div className="space-y-3">
          {recs.map((r, i) => {
            const isTop = i === 0;
            const isOpen = expanded === i;
            return (
              <div
                key={r.policy.id}
                className={`bg-white border rounded-xl overflow-hidden transition-shadow duration-300 animate-fade-up ${isTop ? "border-gold/50 shadow-glow animate-glow" : "border-line"
                  } ${isOpen ? "shadow-lift" : ""}`}
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {isTop && (
                  <div className="px-5 py-1.5 bg-gradient-to-r from-gold/15 to-signal/10 text-[10px] font-semibold tracking-wide uppercase text-signal flex items-center gap-1.5">
                    <Trophy size={11} /> Top recommendation
                  </div>
                )}
                <button
                  onClick={() => setExpanded(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors duration-200 hover:bg-paper/60 active:bg-paper/80"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <RankBadge rank={i} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink truncate">{r.policy.plan_name}</span>
                        <span
                          className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${TIER_STYLES[r.policy.tier] || TIER_STYLES.basic
                            }`}
                        >
                          {r.policy.tier}
                        </span>
                      </div>
                      <div className="text-xs text-slate mt-0.5">{r.policy.provider_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] text-slate-light flex items-center justify-end gap-0.5">
                        <IndianRupee size={9} /> monthly premium
                      </div>
                      <div className="font-mono text-sm text-ink">
                        {r.policy.monthly_premium.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-light">IRS Score</div>
                      <ScoreDisplay score={r.irs_score} isTop={isTop} />
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-slate-light transition-transform duration-300 ease-out ${isOpen ? "rotate-180" : ""
                        }`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-line px-5 py-5 space-y-5 animate-fade-up">
                    {/* Overall IRS Score — explicitly visible in the expanded policy view */}
                    <div className="flex items-center justify-between bg-paper rounded-lg px-4 py-3">
                      <div>
                        <div className="text-[10px] text-slate-light uppercase tracking-wide">
                          Insurance Recommendation Score
                        </div>
                        <div className="text-xs text-slate mt-0.5">
                          Overall fit score for this policy, out of 10
                        </div>
                      </div>
                      <div
                        className={`font-mono text-2xl font-bold tabular-nums ${isTop ? "text-signal" : "text-ledger-dark"
                          }`}
                      >
                        {r.irs_score.toFixed(1)}
                        <span className="text-xs text-slate-light font-normal">/10</span>
                      </div>
                    </div>

                    {/* Key stats row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-[10px] text-slate-light uppercase tracking-wide mb-0.5">Coverage Limit</div>
                        <div className="font-mono text-ink flex items-center gap-0.5">
                          <IndianRupee size={11} />
                          {(r.policy.coverage_limit / 100000).toLocaleString()}L
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-light uppercase tracking-wide mb-0.5">Deductible</div>
                        <div className="font-mono text-ink flex items-center gap-0.5">
                          <IndianRupee size={11} />
                          {r.policy.deductible.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-light uppercase tracking-wide mb-0.5">Claim Approval</div>
                        <div className="font-mono text-ink">
                          {(r.policy.claim_approval_rate * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-light uppercase tracking-wide mb-0.5">Avg Claim Days</div>
                        <div className="font-mono text-ink">{r.policy.avg_claim_days} days</div>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div>
                      <div className="text-[10px] text-slate-light uppercase tracking-wide mb-2">Benefits</div>
                      <div className="flex flex-wrap gap-1.5">
                        {r.policy.benefits.split(",").map((b) => (
                          <span
                            key={b}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-paper text-slate font-medium capitalize"
                          >
                            {b.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pre-existing badge */}
                    {r.policy.covers_preexisting && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-signal bg-signal-light px-3 py-1.5 rounded-full">
                        <ShieldCheck size={13} /> Covers pre-existing conditions
                      </div>
                    )}

                    {/* Score Ledger */}
                    <ScoreLedger
                      result={{
                        irs_score: r.irs_score,
                        cpf: r.policy.score_breakdown.coverage_fit,
                        bms: r.policy.score_breakdown.benefits_match,
                        crs: r.policy.score_breakdown.claim_reliability,
                        pmc: r.policy.score_breakdown.premium_cost,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 