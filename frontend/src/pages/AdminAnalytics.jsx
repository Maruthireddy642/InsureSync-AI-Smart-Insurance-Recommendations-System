import { BarChart3, IndianRupee, Sparkles, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api/client";
import Card from "../components/Card";

const STATUS_COLORS = {
  submitted: "#DB9A2C",
  under_review: "#DB9A2C",
  approved: "#0F6B5C",
  paid: "#0F6B5C",
  rejected: "#C85A46",
  pending: "#DB9A2C",
  more_info_needed: "#DB9A2C",
  denied: "#C85A46",
};

const ROLE_COLORS = ["#0F6B5C", "#DB9A2C", "#0E1E33"];

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white border border-line rounded-xl px-5 py-4 card-hover flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent || "bg-ledger-light text-ledger-dark"}`}>
        <Icon size={17} />
      </div>
      <div>
        <div className="text-xs text-slate mb-0.5">{label}</div>
        <div className="font-mono text-2xl font-semibold text-ink">{value}</div>
      </div>
    </div>
  );
}

const tooltipStyle = {
  contentStyle: {
    borderRadius: 10,
    border: "1px solid #E2E6E1",
    fontSize: 12,
    fontFamily: "IBM Plex Sans, sans-serif",
  },
};

export default function AdminAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/analytics/overview").then(({ data }) => setData(data));
  }, []);

  if (!data)
    return (
      <div className="flex items-center gap-2 text-sm text-slate">
        <div className="w-4 h-4 border-2 border-ledger border-t-transparent rounded-full animate-spin" />
        Loading analytics...
      </div>
    );

  const claimsChart = Object.entries(data.workflow.claims_by_status).map(([status, count]) => ({ status, count }));
  const paChart = Object.entries(data.workflow.prior_auth_by_status).map(([status, count]) => ({ status, count }));
  const usersChart = Object.entries(data.engagement.users_by_role).map(([role, count]) => ({ role, count }));
  const ledgerBreakdown = [
    { label: "CPF", value: data.recommendations.avg_cpf },
    { label: "BMS", value: data.recommendations.avg_bms },
    { label: "CRS", value: data.recommendations.avg_crs },
    { label: "PMC", value: data.recommendations.avg_pmc },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow text-ledger-dark mb-1.5 flex items-center gap-1.5">
          <BarChart3 size={12} /> Operational Intelligence
        </div>
        <h1 className="font-display text-3xl text-ink">Analytics & Reporting</h1>
        <p className="text-sm text-slate mt-1.5">Real-time visibility across users, workflow, and recommendation quality.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Users} label="Total Users" value={data.engagement.total_users} />
        <Stat
          icon={TrendingUp}
          label="Total Claims"
          value={data.workflow.total_claims}
          accent="bg-signal-light text-signal"
        />
        <Stat
          icon={IndianRupee}
          label="Total Prior Auths"
          value={data.workflow.total_prior_auths}
          accent="bg-ink/5 text-ink"
        />
        <Stat
          icon={Sparkles}
          label="Avg. IRS Score"
          value={data.recommendations.avg_irs_score.toFixed(1)}
          accent="bg-gradient-to-br from-gold/20 to-signal/20 text-signal"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card eyebrow="Healthcare Workflow" title="Claims by Status" accent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={claimsChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E6E1" vertical={false} />
              <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#5B6B73" }} axisLine={{ stroke: "#E2E6E1" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#5B6B73" }} axisLine={{ stroke: "#E2E6E1" }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {claimsChart.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] || "#5B6B73"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card eyebrow="Healthcare Workflow" title="Prior Authorizations by Status" accent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={paChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E6E1" vertical={false} />
              <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#5B6B73" }} axisLine={{ stroke: "#E2E6E1" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#5B6B73" }} axisLine={{ stroke: "#E2E6E1" }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {paChart.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] || "#5B6B73"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card eyebrow="Recommendation Quality" title="Average IRS Term Breakdown" accent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ledgerBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E6E1" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#5B6B73" }} axisLine={{ stroke: "#E2E6E1" }} />
              <YAxis dataKey="label" type="category" tick={{ fontSize: 12, fill: "#0E1E33" }} width={50} axisLine={{ stroke: "#E2E6E1" }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" fill="#0F6B5C" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card eyebrow="User Engagement" title="Users by Role" accent>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={usersChart}
                dataKey="count"
                nameKey="role"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={3}
                label={{ fontSize: 11 }}
              >
                {usersChart.map((_, i) => (
                  <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}