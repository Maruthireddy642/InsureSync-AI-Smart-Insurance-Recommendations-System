import { AlertCircle, ArrowRight, CheckCircle2, FileText, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import Card from "../components/Card";
import RiskRing from "../components/RiskRing";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

// The IRS engine (backend/app/services/irs_engine.py) produces scores on a
// 0-100 scale, since each sub-term (CPF/BMS/CRS/PMC) is normalized to 0-100
// before weighting. Keep this in sync with that scale.
const SCORE_MAX = 100;

function firstName(fullName) {
  return fullName ? fullName.split(" ")[0] : "there";
}

function ScoreStamp({ score }) {
  const pct = Math.min(Math.max(score / SCORE_MAX, 0), 1);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const ticks = Array.from({ length: 24 });

  return (
    <div className="relative w-[104px] h-[104px] shrink-0">
      <svg viewBox="0 0 104 104" className="w-full h-full -rotate-90">
        {ticks.map((_, i) => {
          const angle = (i / ticks.length) * 360;
          const major = i % 6 === 0;
          return (
            <line
              key={i}
              x1="52"
              y1={major ? "3" : "5"}
              x2="52"
              y2={major ? "8" : "8"}
              stroke="currentColor"
              strokeWidth={major ? 1.5 : 1}
              className="text-ledger-dark/30"
              transform={`rotate(${angle} 52 52)`}
            />
          );
        })}
        <circle cx="52" cy="52" r={radius} className="text-ledger-dark/10" stroke="currentColor" strokeWidth="6" fill="none" />
        <circle
          cx="52"
          cy="52"
          r={radius}
          className="text-ledger-dark"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl text-ledger-dark font-semibold leading-none">
          {score.toFixed(1)}
        </span>
        <span className="text-[10px] text-slate mt-1 tracking-wide">/ {SCORE_MAX}</span>
      </div>
    </div>
  );
}

function CardSkeleton({ lines = 3 }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 rounded bg-ledger-dark/10" style={{ width: `${85 - i * 15}%` }} />
      ))}
    </div>
  );
}

export default function CustomerDashboard() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [profileState, setProfileState] = useState("loading"); // loading | ready | error

  const [topRec, setTopRec] = useState(null);
  const [recState, setRecState] = useState("loading"); // loading | ready | empty | error

  const [claims, setClaims] = useState([]);
  const [priorAuths, setPriorAuths] = useState([]);
  const [itemsState, setItemsState] = useState("loading"); // loading | ready | error

  useEffect(() => {
    api
      .get("/users/me/health-profile")
      .then(({ data }) => {
        setProfile(data);
        setProfileState("ready");
      })
      .catch(() => setProfileState("error"));

    Promise.allSettled([api.get("/claims/mine"), api.get("/prior-auth/mine")]).then(
      ([claimsRes, priorAuthRes]) => {
        if (claimsRes.status === "fulfilled") setClaims(claimsRes.value.data);
        if (priorAuthRes.status === "fulfilled") setPriorAuths(priorAuthRes.value.data);
        setItemsState(
          claimsRes.status === "rejected" && priorAuthRes.status === "rejected" ? "error" : "ready"
        );
      }
    );

    api
      .get("/recommendations")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setTopRec(data[0]);
          setRecState("ready");
        } else {
          setRecState("empty");
        }
      })
      .catch(() => setRecState("error"));
  }, []);

  const openItems = [...claims, ...priorAuths].filter(
    (i) => !["paid", "rejected", "denied"].includes(i.status)
  );

  const elevatedRiskCount = profile
    ? [profile.diabetes_risk, profile.hypertension_risk, profile.heart_disease_risk].filter(
      (v) => v >= 0.5
    ).length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow text-ledger-dark mb-1.5 flex items-center gap-1.5">
          <LayoutDashboard size={12} /> Welcome back
        </div>
        <h1 className="font-display text-3xl text-ink">{firstName(user?.full_name)}</h1>
        {openItems.length > 0 && itemsState === "ready" && (
          <p className="text-sm text-slate mt-1">
            {openItems.length} item{openItems.length === 1 ? "" : "s"} need{openItems.length === 1 ? "s" : ""}{" "}
            your attention
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Recommended plan */}
        <Card eyebrow="Recommended plan" title="Top Match" accent hover>
          {recState === "loading" && <CardSkeleton lines={4} />}

          {recState === "error" && (
            <div className="flex items-start gap-2 text-sm text-slate">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>Couldn&apos;t load your recommendation. Try refreshing the page.</span>
            </div>
          )}

          {recState === "empty" && (
            <div>
              <p className="text-sm text-slate mb-4">
                Complete your health profile to get personalized plan recommendations.
              </p>
              <Link to="/health-profile" className="text-sm text-ledger-dark font-medium flex items-center gap-1">
                Build my profile <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {recState === "ready" && topRec && (
            <div className="flex items-start gap-4">
              <ScoreStamp score={topRec.irs_score} />
              <div className="pt-1">
                <div className="text-ink font-medium leading-snug">{topRec.policy.plan_name}</div>
                <div className="text-xs text-slate mb-3">{topRec.policy.provider_name}</div>
                <Link
                  to="/recommendations"
                  className="text-sm text-ledger-dark font-medium flex items-center gap-1 group"
                >
                  View all rankings
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          )}
        </Card>

        {/* Risk snapshot */}
        <Card eyebrow="Health risk" title="Risk Snapshot" hover>
          {profileState === "loading" && <CardSkeleton lines={3} />}

          {profileState === "error" && (
            <div className="flex items-start gap-2 text-sm text-slate">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>Couldn&apos;t load your risk snapshot right now.</span>
            </div>
          )}

          {profileState === "ready" && !profile && (
            <div>
              <p className="text-sm text-slate mb-4">
                We don&apos;t have a health profile for you yet.
              </p>
              <Link to="/health-profile" className="text-sm text-ledger-dark font-medium flex items-center gap-1">
                Build my profile <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {profileState === "ready" && profile && (
            <div>
              <div className="flex justify-between px-1 mb-3">
                <RiskRing label="Diabetes" value={profile.diabetes_risk} size={78} />
                <RiskRing label="Hypertension" value={profile.hypertension_risk} size={78} />
                <RiskRing label="Heart disease" value={profile.heart_disease_risk} size={78} />
              </div>
              <p className="text-xs text-slate">
                {elevatedRiskCount === 0
                  ? "All factors are within a typical range."
                  : `${elevatedRiskCount} of 3 factors are elevated — this shapes which plans rank highest.`}
              </p>
            </div>
          )}
        </Card>

        {/* Open items */}
        <Card eyebrow="Workflow" title="Open Items" hover>
          {itemsState === "loading" && <CardSkeleton lines={3} />}

          {itemsState === "error" && (
            <div className="flex items-start gap-2 text-sm text-slate mb-5">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>Couldn&apos;t load your claims or prior authorizations.</span>
            </div>
          )}

          {itemsState === "ready" && openItems.length === 0 && (
            <div className="flex items-start gap-2 mb-5">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-ledger-dark" />
              <p className="text-sm text-slate">You&apos;re all caught up — nothing needs your attention.</p>
            </div>
          )}

          {itemsState === "ready" && openItems.length > 0 && (
            <div className="space-y-3 mb-5">
              {openItems.slice(0, 4).map((item) => {
                const isClaim = Boolean(item.description);
                const Icon = isClaim ? FileText : ShieldCheck;
                return (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon size={14} className="text-slate shrink-0" />
                      <span className="text-sm text-ink truncate">
                        {item.description || item.procedure}
                      </span>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                );
              })}
              {openItems.length > 4 && (
                <p className="text-xs text-slate pt-1">+{openItems.length - 4} more</p>
              )}
            </div>
          )}

          <Link to="/workflow" className="text-sm text-ledger-dark font-medium flex items-center gap-1">
            Manage claims & prior auth <ArrowRight size={14} />
          </Link>
        </Card>
      </div>
    </div>
  );
}