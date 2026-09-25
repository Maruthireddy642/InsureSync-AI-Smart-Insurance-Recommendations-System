const STYLES = {
  submitted: "bg-signal-light text-signal border border-signal/20",
  pending: "bg-signal-light text-signal border border-signal/20",
  under_review: "bg-signal-light text-signal border border-signal/20",
  more_info_needed: "bg-signal-light text-signal border border-signal/20",
  approved: "bg-ledger-light text-ledger-dark border border-ledger/20",
  paid: "bg-ledger-light text-ledger-dark border border-ledger/20",
  rejected: "bg-risk-light text-risk border border-risk/20",
  denied: "bg-risk-light text-risk border border-risk/20",
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || "bg-slate/10 text-slate border border-slate/15";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status.replace(/_/g, " ")}
    </span>
  );
}
