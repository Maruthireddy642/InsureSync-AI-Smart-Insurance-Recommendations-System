import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  IndianRupee,
  Send,
  ShieldAlert,
  Stethoscope,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import api from "../api/client";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";

const STATUS_ICON = {
  submitted: Clock,
  pending: Clock,
  under_review: Clock,
  more_info_needed: AlertTriangle,
  approved: CheckCircle2,
  paid: CheckCircle2,
  rejected: XCircle,
  denied: XCircle,
};

const STATUS_ICON_COLOR = {
  submitted: "bg-signal-light text-signal",
  pending: "bg-signal-light text-signal",
  under_review: "bg-signal-light text-signal",
  more_info_needed: "bg-signal-light text-signal",
  approved: "bg-ledger-light text-ledger-dark",
  paid: "bg-ledger-light text-ledger-dark",
  rejected: "bg-risk-light text-risk",
  denied: "bg-risk-light text-risk",
};

const URGENCY_STYLES = {
  routine: "bg-slate/10 text-slate",
  urgent: "bg-signal-light text-signal",
  emergency: "bg-risk-light text-risk",
};

const REDUCE_MOTION =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Counts a number up from 0 on an ease-out curve whenever `target` changes.
function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(target);
  const prev = useRef(target);

  useEffect(() => {
    if (REDUCE_MOTION || prev.current === target) {
      setValue(target);
      prev.current = target;
      return;
    }
    const from = prev.current;
    prev.current = target;
    let frame;
    let start;
    const step = (ts) => {
      if (start === undefined) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (target - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function StatItem({ label, value, accent, isCurrency }) {
  const numeric = typeof value === "number" ? value : null;
  const animated = useCountUp(numeric ?? 0);
  return (
    <div className="flex-1 min-w-[110px]">
      <div className="text-[11px] text-slate-light uppercase tracking-wide mb-1">{label}</div>
      <div className={`font-mono text-2xl font-semibold tabular-nums ${accent || "text-ink"}`}>
        {numeric === null ? value : isCurrency ? `\u20b9${Math.round(animated).toLocaleString()}` : Math.round(animated)}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 border border-dashed border-line rounded-xl bg-white/60 animate-fade-up">
      <div className="w-11 h-11 rounded-full bg-paper flex items-center justify-center mb-3 animate-breathe">
        <Icon size={18} className="text-slate-light" />
      </div>
      <p className="text-sm text-slate">{text}</p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white border border-line rounded-xl px-5 py-4 flex items-center gap-4 animate-fade-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="w-10 h-10 rounded-full bg-ledger-light/60 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 rounded bg-ledger-dark/10 animate-pulse" />
            <div className="h-2.5 w-1/4 rounded bg-ledger-dark/10 animate-pulse" />
          </div>
          <div className="h-6 w-16 rounded-full bg-ledger-dark/10 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function Toast({ message, tone = "success" }) {
  if (!message) return null;
  const Icon = tone === "success" ? CheckCircle2 : AlertTriangle;
  const tones =
    tone === "success" ? "bg-ledger-light text-ledger-dark border-ledger/20" : "bg-risk-light text-risk border-risk/20";
  return (
    <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg border animate-slide-in ${tones}`}>
      <Icon size={15} className="shrink-0" />
      {message}
    </div>
  );
}

export default function ClaimsPriorAuth() {
  const [tab, setTab] = useState("claims");
  const [claims, setClaims] = useState([]);
  const [priorAuths, setPriorAuths] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [paLoading, setPaLoading] = useState(true);

  const [claimForm, setClaimForm] = useState({ description: "", amount_claimed: "" });
  const [paForm, setPaForm] = useState({ procedure: "", justification: "", urgency: "routine" });
  const [submitting, setSubmitting] = useState(false);

  const [claimToast, setClaimToast] = useState(null);
  const [paToast, setPaToast] = useState(null);
  const [justAddedId, setJustAddedId] = useState(null);
  const toastTimer = useRef(null);
  const highlightTimer = useRef(null);

  function loadClaims() {
    return api
      .get("/claims/mine")
      .then(({ data }) => setClaims(data))
      .finally(() => setClaimsLoading(false));
  }
  function loadPriorAuths() {
    return api
      .get("/prior-auth/mine")
      .then(({ data }) => setPriorAuths(data))
      .finally(() => setPaLoading(false));
  }

  useEffect(() => {
    loadClaims();
    loadPriorAuths();
    return () => {
      clearTimeout(toastTimer.current);
      clearTimeout(highlightTimer.current);
    };
  }, []);

  function flashToast(setter, message, tone = "success") {
    clearTimeout(toastTimer.current);
    setter({ message, tone });
    toastTimer.current = setTimeout(() => setter(null), 3200);
  }

  function flashHighlight(id) {
    clearTimeout(highlightTimer.current);
    setJustAddedId(id);
    highlightTimer.current = setTimeout(() => setJustAddedId(null), 2000);
  }

  async function submitClaim(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post("/claims", {
        ...claimForm,
        amount_claimed: +claimForm.amount_claimed,
      });
      setClaimForm({ description: "", amount_claimed: "" });
      await loadClaims();
      flashToast(setClaimToast, "Claim submitted — we'll notify you as it's reviewed.");
      if (data?.id) flashHighlight(data.id);
    } catch (err) {
      flashToast(
        setClaimToast,
        err?.response?.data?.detail || "Couldn't submit that claim. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function submitPriorAuth(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post("/prior-auth", paForm);
      setPaForm({ procedure: "", justification: "", urgency: "routine" });
      await loadPriorAuths();
      flashToast(setPaToast, "Request submitted — we'll notify you as it's reviewed.");
      if (data?.id) flashHighlight(data.id);
    } catch (err) {
      flashToast(
        setPaToast,
        err?.response?.data?.detail || "Couldn't submit that request. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  const claimStats = {
    total: claims.length,
    pending: claims.filter((c) => !["paid", "rejected"].includes(c.status)).length,
    approved: claims.filter((c) => ["approved", "paid"].includes(c.status)).length,
    amount: claims.reduce((sum, c) => sum + c.amount_claimed, 0),
  };
  const paStats = {
    total: priorAuths.length,
    pending: priorAuths.filter((p) => !["approved", "denied"].includes(p.status)).length,
    approved: priorAuths.filter((p) => p.status === "approved").length,
  };

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.8; }
        }
        @keyframes highlightRing {
          0% { box-shadow: 0 0 0 0 rgba(46, 125, 92, 0.35); }
          100% { box-shadow: 0 0 0 8px rgba(46, 125, 92, 0); }
        }
        .animate-fade-up { animation: fadeInUp 380ms ease-out both; }
        .animate-slide-in { animation: slideIn 260ms ease-out both; }
        .animate-breathe { animation: breathe 2.4s ease-in-out infinite; }
        .animate-highlight { animation: highlightRing 1.8s ease-out 1; }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up, .animate-slide-in, .animate-breathe, .animate-highlight, .animate-pulse {
            animation: none !important;
          }
        }
      `}</style>

      <div className="animate-fade-up">
        <div className="eyebrow text-ledger-dark mb-1.5 flex items-center gap-1.5">
          <Stethoscope size={12} /> Healthcare Workflow Automation
        </div>
        <h1 className="font-display text-3xl text-ink">Claims & Prior Authorization</h1>
        <p className="text-sm text-slate mt-1.5">Submit requests and track their status in real time.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-line rounded-lg p-1 w-fit relative">
        {[
          ["claims", "Claims"],
          ["prior-auth", "Prior Authorization"],
        ].map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${tab === t ? "text-white" : "text-slate hover:text-ink"
              }`}
          >
            {tab === t && (
              <span className="absolute inset-0 bg-ink rounded-md -z-10 animate-fade-up" style={{ animationDuration: "180ms" }} />
            )}
            {label}
          </button>
        ))}
      </div>

      {tab === "claims" ? (
        <div key="claims" className="space-y-6 animate-fade-up" style={{ animationDuration: "300ms" }}>
          {/* Stats strip */}
          <Card className="!p-0" accent>
            <div className="flex flex-wrap gap-6 px-5 py-4">
              <StatItem label="Total claims" value={claimStats.total} />
              <StatItem label="In progress" value={claimStats.pending} accent="text-signal" />
              <StatItem label="Approved / paid" value={claimStats.approved} accent="text-ledger-dark" />
              <StatItem label="Total claimed" value={claimStats.amount} isCurrency />
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <Card eyebrow="New request" title="Submit a Claim">
              <form onSubmit={submitClaim} className="space-y-3.5">
                <div>
                  <label className="text-xs font-medium text-slate block mb-1.5">Treatment or service</label>
                  <textarea
                    required
                    placeholder="e.g. MRI scan for lower back pain"
                    value={claimForm.description}
                    onChange={(e) => setClaimForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-sm focus:border-ledger focus:ring-2 focus:ring-ledger/10 outline-none transition-all resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate block mb-1.5">Amount claimed</label>
                  <div className="relative">
                    <IndianRupee
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-light"
                    />
                    <input
                      required
                      type="number"
                      placeholder="15,000"
                      value={claimForm.amount_claimed}
                      onChange={(e) => setClaimForm((f) => ({ ...f, amount_claimed: e.target.value }))}
                      className="w-full border border-line rounded-lg pl-9 pr-3.5 py-2.5 text-sm focus:border-ledger focus:ring-2 focus:ring-ledger/10 outline-none transition-all"
                    />
                  </div>
                </div>
                <button disabled={submitting} className="btn-primary w-full transition-transform active:scale-[0.98]">
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Submit claim
                    </>
                  )}
                </button>
                {claimToast && <Toast message={claimToast.message} tone={claimToast.tone} />}
              </form>
            </Card>

            <div className="md:col-span-2 space-y-3">
              {claimsLoading ? (
                <ListSkeleton />
              ) : claims.length === 0 ? (
                <EmptyState icon={Inbox} text="No claims submitted yet. Your first one will appear here." />
              ) : (
                claims.map((c, i) => {
                  const Icon = STATUS_ICON[c.status] || Clock;
                  return (
                    <div
                      key={c.id}
                      className={`bg-white border border-line rounded-xl px-5 py-4 flex items-center gap-4 card-hover animate-fade-up ${justAddedId === c.id ? "animate-highlight" : ""
                        }`}
                      style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${STATUS_ICON_COLOR[c.status] || "bg-slate/10 text-slate"
                          }`}
                      >
                        <Icon size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-ink font-medium truncate">{c.description}</div>
                        <div className="text-xs text-slate mt-0.5 font-mono">
                          {"\u20b9"}
                          {c.amount_claimed.toLocaleString()}
                        </div>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        <div key="prior-auth" className="space-y-6 animate-fade-up" style={{ animationDuration: "300ms" }}>
          <Card className="!p-0" accent>
            <div className="flex flex-wrap gap-6 px-5 py-4">
              <StatItem label="Total requests" value={paStats.total} />
              <StatItem label="Awaiting review" value={paStats.pending} accent="text-signal" />
              <StatItem label="Approved" value={paStats.approved} accent="text-ledger-dark" />
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <Card eyebrow="New request" title="Request Prior Authorization">
              <form onSubmit={submitPriorAuth} className="space-y-3.5">
                <div>
                  <label className="text-xs font-medium text-slate block mb-1.5">Procedure name</label>
                  <input
                    required
                    placeholder="e.g. Knee arthroscopy"
                    value={paForm.procedure}
                    onChange={(e) => setPaForm((f) => ({ ...f, procedure: e.target.value }))}
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-sm focus:border-ledger focus:ring-2 focus:ring-ledger/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate block mb-1.5">Medical justification</label>
                  <textarea
                    required
                    placeholder="Brief clinical reasoning for the procedure"
                    value={paForm.justification}
                    onChange={(e) => setPaForm((f) => ({ ...f, justification: e.target.value }))}
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-sm focus:border-ledger focus:ring-2 focus:ring-ledger/10 outline-none transition-all resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate block mb-1.5">Urgency</label>
                  <div className="flex gap-2">
                    {["routine", "urgent", "emergency"].map((u) => (
                      <button
                        type="button"
                        key={u}
                        onClick={() => setPaForm((f) => ({ ...f, urgency: u }))}
                        className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium capitalize py-2 rounded-lg border transition-all duration-200 ${paForm.urgency === u
                            ? "bg-ink text-white border-ink scale-[1.03]"
                            : "border-line text-slate hover:border-slate-light"
                          }`}
                      >
                        {u === "emergency" && <ShieldAlert size={12} />}
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <button disabled={submitting} className="btn-primary w-full transition-transform active:scale-[0.98]">
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Submit request
                    </>
                  )}
                </button>
                {paToast && <Toast message={paToast.message} tone={paToast.tone} />}
              </form>
            </Card>

            <div className="md:col-span-2 space-y-3">
              {paLoading ? (
                <ListSkeleton />
              ) : priorAuths.length === 0 ? (
                <EmptyState icon={FileText} text="No prior authorization requests yet." />
              ) : (
                priorAuths.map((p, i) => {
                  const Icon = STATUS_ICON[p.status] || Clock;
                  return (
                    <div
                      key={p.id}
                      className={`bg-white border border-line rounded-xl px-5 py-4 flex items-center gap-4 card-hover animate-fade-up ${justAddedId === p.id ? "animate-highlight" : ""
                        }`}
                      style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${STATUS_ICON_COLOR[p.status] || "bg-slate/10 text-slate"
                          }`}
                      >
                        <Icon size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-ink font-medium truncate">{p.procedure}</div>
                        <span
                          className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${URGENCY_STYLES[p.urgency] || URGENCY_STYLES.routine
                            }`}
                        >
                          {p.urgency}
                        </span>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}