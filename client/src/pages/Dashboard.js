import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data.history);
    } catch (err) {
      setError("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (expanded === id) setExpanded(null);
    } catch {
      alert("Failed to delete. Try again.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (iso) => {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="dash-nav">
        <span className="dash-logo">🤖 AI Code Reviewer</span>
        <div className="dash-nav-right">
          <span className="dash-username">👤 {user?.name}</span>
          <button className="dash-new-btn" onClick={() => navigate("/")}>
            + New Review
          </button>
          <button className="dash-logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="dash-content">
        <h1>Your Review History</h1>
        <p className="dash-count">
          {history.length} review{history.length !== 1 ? "s" : ""} saved
        </p>

        {loading && <p className="dash-loading">Loading...</p>}
        {error && <p className="dash-error">{error}</p>}

        {!loading && history.length === 0 && (
          <div className="dash-empty">
            <p>No reviews yet.</p>
            <button onClick={() => navigate("/")}>Review your first code →</button>
          </div>
        )}

        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-card">
              <div className="history-card-header">
                <div>
                  <span className="history-lang">{item.language}</span>
                  <span className="history-date">{formatDate(item.created_at)}</span>
                </div>
                <div className="history-actions">
                  <button
                    className="btn-expand"
                    onClick={() =>
                      setExpanded(expanded === item.id ? null : item.id)
                    }
                  >
                    {expanded === item.id ? "Hide" : "View"}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Code preview */}
              <pre className="history-code-preview">
                {item.code.length > 200
                  ? item.code.slice(0, 200) + "..."
                  : item.code}
              </pre>

              {/* Expanded review result */}
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
    </div>
  );
};

export default Dashboard;