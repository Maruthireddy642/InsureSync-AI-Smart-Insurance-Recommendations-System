import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper text-center px-4">
      <div className="font-display text-5xl text-ink mb-3">404</div>
      <p className="text-slate mb-5">This page doesn't exist.</p>
      <Link to="/" className="text-ledger font-medium text-sm">
        Return home
      </Link>
    </div>
  );
}
