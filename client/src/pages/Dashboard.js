import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import "./Dashboard.css";

const COLORS = ["#6366f1", "#3b82f6", "#22c55e", "#8b5cf6", "#14b8a6", "#f59e0b"];

const StatCard = ({ label, value, sub, color }) => (
  <div className="stat-card" style={{ borderTopColor: color }}>
    <div className="stat-value" style={{ color }}>{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("analytics");

  // History state
  const [history, setHistory]   = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [histError, setHistError]     = useState("");
  const [expanded, setExpanded]       = useState(null);

  // Analytics state
  const [analytics, setAnalytics]   = useState(null);
  const [analLoading, setAnalLoading] = useState(true);
  const [analError, setAnalError]     = useState("");

  useEffect(() => {
    fetchHistory();
    fetchAnalytics();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data.history);
    } catch { setHistError("Failed to load history"); }
    finally { setHistLoading(false); }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(res.data);
    } catch { setAnalError("Failed to load analytics"); }
    finally { setAnalLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(prev => prev.filter(item => item.id !== id));
      if (expanded === id) setExpanded(null);
    } catch { alert("Failed to delete."); }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const formatDate = (iso) =>
    new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="dash-nav">
        <span className="dash-logo">🤖 AI Code Reviewer</span>
        <div className="dash-nav-right">
          <span className="dash-username">👤 {user?.name}</span>
          <button className="dash-new-btn" onClick={() => navigate("/")}>+ New Review</button>
          <button className="dash-logout-btn" onClick={handleLogout}>Log out</button>
        </div>
      </nav>

      <div className="dash-content">
        <h1>Dashboard</h1>

        {/* Tabs */}
        <div className="dash-tabs">
          <button
            className={`dash-tab ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            📊 Analytics
          </button>
          <button
            className={`dash-tab ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            🕑 History {history.length > 0 && <span className="dash-tab-badge">{history.length}</span>}
          </button>
        </div>

        {/* ── ANALYTICS TAB ── */}
        {activeTab === "analytics" && (
          <div className="analytics-panel">
            {analLoading && <p className="dash-loading">Loading analytics...</p>}
            {analError  && <p className="dash-error">{analError}</p>}

            {analytics?.empty && (
              <div className="dash-empty">
                <p>No data yet. Review some code to see your analytics!</p>
                <button onClick={() => navigate("/")}>Start reviewing →</button>
              </div>
            )}

            {analytics && !analytics.empty && (
              <>
                {/* Stat cards */}
                <div className="stat-cards">
                  <StatCard
                    label="Total Reviews"
                    value={analytics.totalReviews}
                    color="#6366f1"
                  />
                  <StatCard
                    label="Avg Quality Score"
                    value={analytics.avgScore !== null ? `${analytics.avgScore}/10` : "N/A"}
                    color="#3b82f6"
                  />
                  <StatCard
                    label="This Week"
                    value={analytics.thisWeek}
                    sub={analytics.weekChange !== null
                      ? `${analytics.weekChange > 0 ? "+" : ""}${analytics.weekChange}% vs last week`
                      : null}
                    color="#22c55e"
                  />
                  <StatCard
                    label="Top Language"
                    value={analytics.topLanguage}
                    color="#8b5cf6"
                  />
                  <StatCard
                    label="Most Active Day"
                    value={analytics.mostActiveDay}
                    color="#14b8a6"
                  />
                </div>

                {/* Activity chart */}
                <div className="chart-card">
                  <h3>Reviews — Last 30 Days</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={analytics.activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#8b949e", fontSize: 11 }}
                        tickFormatter={d => d.slice(5)}
                        interval={4}
                      />
                      <YAxis tick={{ fill: "#8b949e", fontSize: 11 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8 }}
                        labelStyle={{ color: "#e6edf3" }}
                        itemStyle={{ color: "#6366f1" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Language + Mode charts side by side */}
                <div className="charts-row">
                  <div className="chart-card">
                    <h3>Languages Used</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.languageData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                        <XAxis dataKey="name" tick={{ fill: "#8b949e", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#8b949e", fontSize: 12 }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8 }}
                          labelStyle={{ color: "#e6edf3" }}
                          itemStyle={{ color: "#6366f1" }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {analytics.languageData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-card">
                    <h3>Review Modes</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={analytics.modeData.filter(m => m.count > 0)}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={{ stroke: "#30363d" }}
                        >
                          {analytics.modeData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8 }}
                          labelStyle={{ color: "#e6edf3" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <div className="history-panel">
            {histLoading && <p className="dash-loading">Loading...</p>}
            {histError  && <p className="dash-error">{histError}</p>}

            {!histLoading && history.length === 0 && (
              <div className="dash-empty">
                <p>No reviews yet.</p>
                <button onClick={() => navigate("/")}>Review your first code →</button>
              </div>
            )}

            <div className="history-list">
              {history.map(item => (
                <div key={item.id} className="history-card">
                  <div className="history-card-header">
                    <div>
                      <span className="history-lang">{item.language}</span>
                      <span className="history-mode-tag">{item.mode}</span>
                      <span className="history-date">{formatDate(item.created_at)}</span>
                    </div>
                    <div className="history-actions">
                      <button
                        className="btn-expand"
                        onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                      >
                        {expanded === item.id ? "Hide" : "View"}
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(item.id)}>
                        Delete
                      </button>
                    </div>
                  </div>

                  <pre className="history-code-preview">
                    {item.code.length > 200 ? item.code.slice(0, 200) + "..." : item.code}
                  </pre>

                  {expanded === item.id && (
                    <div className="history-result">
                      <h4>AI Review</h4>
                      <ReactMarkdown>{item.result}</ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;