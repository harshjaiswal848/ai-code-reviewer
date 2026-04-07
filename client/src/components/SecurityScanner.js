import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./SecurityScanner.css";

const RISK_CONFIG = {
  CRITICAL: { color: "#f85149", bg: "rgba(248,81,73,0.1)",  border: "rgba(248,81,73,0.4)",  icon: "🔴" },
  HIGH:     { color: "#d29922", bg: "rgba(210,153,34,0.1)", border: "rgba(210,153,34,0.4)", icon: "🟠" },
  MEDIUM:   { color: "#e3b341", bg: "rgba(227,179,65,0.1)", border: "rgba(227,179,65,0.4)", icon: "🟡" },
  LOW:      { color: "#3fb950", bg: "rgba(63,185,80,0.1)",  border: "rgba(63,185,80,0.4)",  icon: "🟢" },
  SAFE:     { color: "#3fb950", bg: "rgba(63,185,80,0.1)",  border: "rgba(63,185,80,0.4)",  icon: "✅" },
  UNKNOWN:  { color: "#8b949e", bg: "rgba(139,148,158,0.1)",border: "rgba(139,148,158,0.4)",icon: "⚪" },
};

function SecurityScanner({ code, language }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const runScan = async () => {
    if (!code.trim()) {
      setError("Please write some code in the editor first.");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/security/scan", {
        code,
        language,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Security scan failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const risk = result ? (RISK_CONFIG[result.riskLevel] || RISK_CONFIG.UNKNOWN) : null;

  return (
    <div className="security-scanner">
      <div className="security-header">
        <div className="security-header-left">
          <span className="security-icon">🛡️</span>
          <div>
            <h3>Security Scanner</h3>
            <p>Scan your code for vulnerabilities, exposed secrets, and security risks</p>
          </div>
        </div>
        <button
          className="security-scan-btn"
          onClick={runScan}
          disabled={loading}
        >
          {loading ? (
            <><span className="sec-spinner" /> Scanning...</>
          ) : (
            "Run Security Scan"
          )}
        </button>
      </div>

      {error && <div className="security-error">{error}</div>}

      {result && (
        <div className="security-result">
          {/* Score + Risk level badges */}
          <div className="security-badges">
            {result.score !== null && (
              <div className="security-score-badge" style={{
                background: risk.bg,
                border: `1px solid ${risk.border}`,
                color: risk.color,
              }}>
                <span className="score-number">{result.score}</span>
                <span className="score-label">/ 100</span>
              </div>
            )}
            <div className="security-risk-badge" style={{
              background: risk.bg,
              border: `1px solid ${risk.border}`,
              color: risk.color,
            }}>
              {risk.icon} {result.riskLevel} RISK
            </div>
          </div>

          {/* Full analysis */}
          <div className="security-analysis">
            <ReactMarkdown>{result.scanResult}</ReactMarkdown>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="security-empty">
          <p>🔍 Click "Run Security Scan" to analyze your code for vulnerabilities</p>
          <div className="security-checks-list">
            {["SQL Injection", "XSS", "Hardcoded Secrets", "Auth Flaws", "Data Exposure", "Command Injection"].map(c => (
              <span key={c} className="security-check-tag">{c}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SecurityScanner;