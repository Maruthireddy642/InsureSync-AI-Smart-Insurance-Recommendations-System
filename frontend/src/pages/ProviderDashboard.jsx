import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Inbox,
  IndianRupee,
  ShieldAlert,
  Stethoscope,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";

const CLAIM_TRANSITIONS = {
  submitted: ["under_review", "rejected"],
  under_review: ["approved", "rejected"],
  approved: ["paid"],
};

const PA_TRANSITIONS = {
  pending: ["approved", "denied", "more_info_needed"],
  more_info_needed: ["approved", "denied"],
};

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

function StatItem({ label, value, accent }) {
  return (
    <div className="flex-1 min-w-[110px]">
      <div className="text-[11px] text-slate-light uppercase tracking-wide mb-1">{label}</div>
      <div className={`font-mono text-2xl font-semibold ${accent || "text-ink"}`}>{value}</div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 border border-dashed border-line rounded-xl bg-white/60">
      <div className="w-11 h-11 rounded-full bg-paper flex items-center justify-center mb-3">
        <Inbox size={18} className="text-slate-light" />
      </div>
      <p className="text-sm text-slate">{text}</p>
    </div>
  );
}

export default function ProviderDashboard() {
  const [tab, setTab] = useState("claims");
  const [claims, setClaims] = useState([]);
  const [priorAuths, setPriorAuths] = useState([]);
  const [notes, setNotes] = useState({});

  function loadClaims() {
    api.get("/claims").then(({ data }) => setClaims(data));
  }
  function loadPriorAuths() {
    api.get("/prior-auth").then(({ data }) => setPriorAuths(data));
  }

  useEffect(() => {
    loadClaims();
    loadPriorAuths();
  }, []);

  async function updateClaim(id, status) {
    await api.patch(`/claims/${id}/status`, { status, reviewer_notes: notes[id] || "" });
    loadClaims();
  }

  async function updatePriorAuth(id, status) {
    await api.patch(`/prior-auth/${id}/status`, { status, reviewer_notes: notes[id] || "" });
    loadPriorAuths();
  }

  const claimStats = {
    pending: claims.filter((c) => ["submitted", "under_review"].includes(c.status)).length,
    approved: claims.filter((c) => ["approved", "paid"].includes(c.status)).length,
    rejected: claims.filter((c) => c.status === "rejected").length,
    amount: claims.reduce((sum, c) => sum + c.amount_claimed, 0),
  };
  const paStats = {
    pending: priorAuths.filter((p) => ["pending", "more_info_needed"].includes(p.status)).length,
    approved: priorAuths.filter((p) => p.status === "approved").length,
    denied: priorAuths.filter((p) => p.status === "denied").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow text-ledger-dark mb-1.5 flex items-center gap-1.5">
          <Stethoscope size={12} /> Provider Review Queue
        </div>
        <h1 className="font-display text-3xl text-ink">Workflow Management</h1>
        <p className="text-sm text-slate mt-1.5">Review and progress claims and prior authorization requests.</p>
      </div>

      <div className="flex gap-1 bg-white border border-line rounded-lg p-1 w-fit">
        {[
          ["claims", `Claims (${claims.length})`],
          ["prior-auth", `Prior Authorization (${priorAuths.length})`],
        ].map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              tab === t ? "bg-ink text-white" : "text-slate hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "claims" ? (
        <>
          <Card accent>
            <div className="flex flex-wrap gap-6">
              <StatItem label="Awaiting review" value={claimStats.pending} accent="text-signal" />
              <StatItem label="Approved / paid" value={claimStats.approved} accent="text-ledger-dark" />
              <StatItem label="Rejected" value={claimStats.rejected} accent="text-risk" />
              <StatItem label="Total value in queue" value={`\u20b9${claimStats.amount.toLocaleString()}`} />
            </div>
          </Card>

          <div className="space-y-3">
            {claims.length === 0 && <EmptyState text="No claims submitted yet." />}
            {claims.map((c) => {
              const Icon = STATUS_ICON[c.status] || Clock;
              return (
                <Card key={c.id} hover>
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        STATUS_ICON_COLOR[c.status] || "bg-slate/10 text-slate"
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink">{c.description}</div>
                      <div className="text-xs text-slate font-mono mt-0.5 flex items-center gap-0.5">
                        <IndianRupee size={10} />
                        {c.amount_claimed.toLocaleString()}
                      </div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="flex gap-2 flex-wrap pl-12">
                    <input
                      placeholder="Reviewer notes (optional)"
                      value={notes[c.id] || ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [c.id]: e.target.value }))}
                      className="flex-1 min-w-[160px] border border-line rounded-lg px-3 py-1.5 text-sm focus:border-ledger focus:ring-2 focus:ring-ledger/10 outline-none transition-all"
                    />
                    {(CLAIM_TRANSITIONS[c.status] || []).map((next) => (
                      <button
                        key={next}
                        onClick={() => updateClaim(c.id, next)}
                        className="btn-ghost capitalize"
                      >
                        Mark {next.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <Card accent>
            <div className="flex flex-wrap gap-6">
              <StatItem label="Awaiting review" value={paStats.pending} accent="text-signal" />
              <StatItem label="Approved" value={paStats.approved} accent="text-ledger-dark" />
              <StatItem label="Denied" value={paStats.denied} accent="text-risk" />
            </div>
          </Card>

          <div className="space-y-3">
            {priorAuths.length === 0 && <EmptyState text="No prior authorization requests yet." />}
            {priorAuths.map((p) => {
              const Icon = STATUS_ICON[p.status] || Clock;
              return (
                <Card key={p.id} hover>
                  <div className="flex items-start gap-3.5 mb-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        STATUS_ICON_COLOR[p.status] || "bg-slate/10 text-slate"
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink">{p.procedure}</div>
                      <span
                        className={`inline-flex items-center gap-1 mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                          URGENCY_STYLES[p.urgency] || URGENCY_STYLES.routine
                        }`}
                      >
                        {p.urgency === "emergency" && <ShieldAlert size={10} />}
                        {p.urgency} priority
                      </span>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-sm text-slate mb-3.5 pl-12">{p.justification}</p>
                  <div className="flex gap-2 flex-wrap pl-12">
                    <input
                      placeholder="Reviewer notes (optional)"
                      value={notes[p.id] || ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [p.id]: e.target.value }))}
                      className="flex-1 min-w-[160px] border border-line rounded-lg px-3 py-1.5 text-sm focus:border-ledger focus:ring-2 focus:ring-ledger/10 outline-none transition-all"
                    />
                    {(PA_TRANSITIONS[p.status] || []).map((next) => (
                      <button
                        key={next}
                        onClick={() => updatePriorAuth(p.id, next)}
                        className="btn-ghost capitalize"
                      >
                        Mark {next.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}