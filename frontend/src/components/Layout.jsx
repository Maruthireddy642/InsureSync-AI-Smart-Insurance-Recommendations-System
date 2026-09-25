import { Bell, FileText, LayoutDashboard, LogOut, MessageCircle, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_BY_ROLE = {
  customer: [
    { to: "/", label: "Overview", icon: LayoutDashboard },
    { to: "/health-profile", label: "Health Profile", icon: Stethoscope },
    { to: "/recommendations", label: "Recommendations", icon: Sparkles },
    { to: "/workflow", label: "Claims & Prior Auth", icon: FileText },
    { to: "/advisor", label: "AI Advisor", icon: MessageCircle },
  ],
  provider: [
    { to: "/", label: "Review Queue", icon: LayoutDashboard },
    { to: "/advisor", label: "AI Advisor", icon: MessageCircle },
  ],
  admin: [
    { to: "/", label: "Analytics", icon: LayoutDashboard },
    { to: "/advisor", label: "AI Advisor", icon: MessageCircle },
  ],
};

function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("insuresync_token");
    if (!token) return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/notifications?token=${token}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setNotifications((prev) => [{ ...data, id: Date.now(), read: false }, ...prev].slice(0, 20));
    };
    wsRef.current = ws;
    return () => ws.close();
  }, []);

  const items = NAV_BY_ROLE[user?.role] || [];
  const unread = notifications.filter((n) => !n.read).length;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 relative bg-ink text-white flex flex-col shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-sidebar-glow pointer-events-none" />
        <div className="relative px-6 py-6 flex items-center gap-2.5 border-b border-white/[0.08]">
          <div className="w-8 h-8 rounded-lg bg-ledger/20 border border-ledger-glow/40 flex items-center justify-center">
            <ShieldCheck size={17} className="text-ledger-glow" />
          </div>
          <div>
            <div className="font-display text-[1.05rem] leading-none tracking-tight">InsureSync</div>
            <div className="text-[10px] tracking-[0.2em] text-ledger-glow/80 mt-1 uppercase">AI Platform</div>
          </div>
        </div>

        <nav className="relative flex-1 px-3 py-5 space-y-0.5">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-md text-sm transition-all ${
                  isActive ? "text-white bg-white/[0.06]" : "text-white/55 hover:bg-white/[0.04] hover:text-white/85"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full transition-all ${
                      isActive ? "bg-ledger-glow" : "bg-transparent group-hover:bg-white/20"
                    }`}
                  />
                  <Icon size={16} strokeWidth={2} />
                  <span className="font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="relative px-4 py-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded-md">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ledger-glow to-ledger-dark flex items-center justify-center text-[11px] font-semibold shrink-0">
              {initials(user?.full_name)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user?.full_name}</div>
              <div className="text-[11px] text-white/45 capitalize">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-[13px] text-white/50 hover:bg-white/[0.06] hover:text-white/85 transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-line/80 bg-white/70 backdrop-blur-sm flex items-center justify-end px-6 gap-4 relative sticky top-0 z-20">
          <button
            onClick={() => {
              setShowNotifs((s) => !s);
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            }}
            className="relative p-2 rounded-md hover:bg-paper transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-slate" strokeWidth={1.8} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 bg-risk text-white text-[9px] font-semibold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                {unread}
              </span>
            )}
          </button>
          {showNotifs && (
            <div className="absolute right-6 top-14 w-80 bg-white border border-line rounded-xl shadow-lift z-10 overflow-hidden">
              <div className="px-4 py-3 border-b border-line eyebrow text-slate bg-paper/60">Live Updates</div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-sm text-slate text-center">
                    Nothing yet. Workflow updates arrive here in real time.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="px-4 py-3 border-b border-line last:border-0 text-sm">
                      <div className="font-medium text-ink capitalize">{n.type?.replace(/_/g, " ")}</div>
                      <div className="text-slate text-xs mt-0.5 capitalize">status: {n.status}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </header>
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
