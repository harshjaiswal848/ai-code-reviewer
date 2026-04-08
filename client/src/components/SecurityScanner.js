import React, { useMemo, useState } from "react";
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

function computeDiff(original, patched) {
  const a = original.split("\n");
  const b = patched.split("\n");
  const maxLen = Math.max(a.length, b.length);
  const out = [];

  for (let i = 0; i < maxLen; i++) {
    const lineA = a[i];
    const lineB = b[i];
    if (lineA === undefined) out.push({ type: "add", line: lineB, num: i + 1 });
    else if (lineB === undefined) out.push({ type: "remove", line: lineA, num: i + 1 });
    else if (lineA === lineB) out.push({ type: "same", line: lineA, num: i + 1 });
    else {
      out.push({ type: "remove", line: lineA, num: i + 1 });
      out.push({ type: "add", line: lineB, num: i + 1 });
    }
  }
  return out;
}

function SecurityScanner({ code, language }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("analysis");

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
      setTab("analysis");
    } catch (err) {
      setError(err.response?.data?.error || "Security scan failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const risk = result ? (RISK_CONFIG[result.riskLevel] || RISK_CONFIG.UNKNOWN) : null;
  const diffLines = useMemo(() => {
    if (!result?.patchedCode || !code) return [];
    return computeDiff(code, result.patchedCode);
  }, [result, code]);

  return (
    <div className="security-scanner">
      <div className="security-header">
        <div className="security-header-left">
          <span className="security-icon">🛡️</span>
          <div>
            <h3>Security Scanner + Fix Patches</h3>
            <p>Scan your code for vulnerabilities and generate a secure patch with before/after diff</p>
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

          {result.patchedCode && (
            <div className="tab-bar" style={{ padding: "0 20px 12px" }}>
              <button className={`tab-btn ${tab === "analysis" ? "active" : ""}`} onClick={() => setTab("analysis")}>📄 Analysis</button>
              <button className={`tab-btn ${tab === "patch" ? "active" : ""}`} onClick={() => setTab("patch")}>🩹 Patched Code</button>
              <button className={`tab-btn ${tab === "diff" ? "active" : ""}`} onClick={() => setTab("diff")}>🔀 Before/After Diff</button>
            </div>
          )}

          {tab === "analysis" && (
            <div className="security-analysis">
              <ReactMarkdown>{result.scanResult}</ReactMarkdown>
            </div>
          )}

          {tab === "patch" && result.patchedCode && (
            <div className="security-analysis"><pre>{result.patchedCode}</pre></div>
          )}

          {tab === "diff" && result.patchedCode && (
            <div className="diff-view" style={{ margin: "0 20px 20px" }}>
              <div className="diff-lines">
                {diffLines.map((dl, idx) => (
                  <div key={idx} className={`diff-line diff-${dl.type}`}>
                    <span className="diff-gutter">{dl.type === "add" ? "+" : dl.type === "remove" ? "−" : " "} {dl.num}</span>
                    <code className="diff-code">{dl.line}</code>
                  </div>
                ))}
              </div>
            </div>
          )}
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
