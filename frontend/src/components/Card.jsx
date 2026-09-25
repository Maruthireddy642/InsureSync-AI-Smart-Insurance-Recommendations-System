export default function Card({ title, eyebrow, action, children, className = "", accent = false, hover = false }) {
  return (
    <div
      className={`relative bg-white border border-line rounded-xl shadow-card overflow-hidden ${
        hover ? "card-hover" : ""
      } ${className}`}
    >
      {accent && <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-ledger-glow to-ledger" />}
      {(title || eyebrow || action) && (
        <div className="px-5 pt-5 pb-3.5 flex items-start justify-between border-b border-line/70">
          <div>
            {eyebrow && <div className="eyebrow text-ledger-dark/80 mb-1.5">{eyebrow}</div>}
            {title && <h3 className="font-display text-lg text-ink leading-snug">{title}</h3>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
