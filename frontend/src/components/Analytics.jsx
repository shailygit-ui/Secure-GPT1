import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

function Analytics({ history = [] }) {
  // Normalize data (IMPORTANT FIX)
  const normalized = history.map((h) => ({
    risk:
      typeof h.risk === "number"
        ? h.risk
        : typeof h.local?.risk === "number"
        ? h.local.risk
        : 0,
    blocked: Boolean(h.blocked),
  }));

  const safe = normalized.filter((h) => !h.blocked).length;
  const blocked = normalized.filter((h) => h.blocked).length;

  const pieData = [
    { name: "Safe", value: safe },
    { name: "Blocked", value: blocked },
  ];

  const COLORS = ["#22c55e", "#ef4444"];

  const lineData = normalized.map((item, index) => ({
    scan: index + 1,
    risk: item.risk,
  }));

  return (
    <div className="card section-card">
      <h2>📊 Analytics Dashboard</h2>

      {history.length === 0 ? (
        <p style={{ marginTop: "15px" }}>No scan data yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "30px",
            marginTop: "20px",
          }}
        >
          {/* Pie Chart */}
          <div>
            <h3>Safe vs Blocked</h3>

            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  outerRadius={90}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div>
            <h3>Risk Trend</h3>

            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scan" />
                <YAxis domain={[0, 100]} />
                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="risk"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;