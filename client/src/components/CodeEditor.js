import React, { useState, useEffect, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import axios from "axios";
import ReviewResult from "./ReviewResult";

function CodeEditor() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [mode, setMode] = useState("review");
  const [result, setResult] = useState("");
  const [originalCode, setOriginalCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Chat history: array of { mode, language, code, result, timestamp }
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("reviewHistory") || "[]");
    } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);

  // Persist history to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("reviewHistory", JSON.stringify(history));
  }, [history]);

  // Keyboard shortcut: Ctrl+Enter to submit
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      reviewCode();
    }
  }, [code, loading]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const reviewCode = async () => {
    if (!code || loading) return;

    try {
      setLoading(true);
      setOriginalCode(code);

      const res = await axios.post("http://localhost:5000/review", {
        code,
        language,
        mode
      });

      const feedback = res.data.feedback;
      setResult(feedback);
      setLoading(false);

      // Save to history
      const entry = {
        id: Date.now(),
        mode,
        language,
        code,
        result: feedback,
        timestamp: new Date().toLocaleTimeString(),
      };
      setHistory(prev => [entry, ...prev].slice(0, 20));

    } catch {
      setResult("Error connecting to backend");
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setCode(event.target.result);
    reader.readAsText(file);
  };

  const loadFromHistory = (entry) => {
    setCode(entry.code);
    setLanguage(entry.language);
    setMode(entry.mode);
    setResult(entry.result);
    setOriginalCode(entry.code);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    sessionStorage.removeItem("reviewHistory");
  };

  const modeIcon = { review: "🔍", fix: "🔧", optimize: "⚡", explain: "📖" };

  return (
    <div className="main-content">

      {/* ── HISTORY SIDEBAR ── */}
      <div className={`history-sidebar ${showHistory ? "open" : ""}`}>
        <div className="history-header">
          <span>Session History</span>
          <div style={{ display: "flex", gap: 8 }}>
            {history.length > 0 && (
              <button className="history-clear-btn" onClick={clearHistory}>Clear</button>
            )}
            <button className="history-close-btn" onClick={() => setShowHistory(false)}>✕</button>
          </div>
        </div>
        {history.length === 0 ? (
          <p className="history-empty">No reviews yet this session.</p>
        ) : (
          history.map(entry => (
            <div key={entry.id} className="history-item" onClick={() => loadFromHistory(entry)}>
              <div className="history-item-top">
                <span className="history-mode">{modeIcon[entry.mode]} {entry.mode}</span>
                <span className="history-lang">{entry.language}</span>
                <span className="history-time">{entry.timestamp}</span>
              </div>
              <div className="history-preview">{entry.code.slice(0, 80).replace(/\n/g, " ")}…</div>
            </div>
          ))
        )}
      </div>

      {/* ── LEFT: EDITOR ── */}
      <div className="editor-section">
        <div className="section-title-row">
          <h2>Code Editor</h2>
          <button
            className="history-toggle-btn"
            onClick={() => setShowHistory(s => !s)}
            title="Session History"
          >
            🕑 History {history.length > 0 && <span className="history-badge">{history.length}</span>}
          </button>
        </div>

        <div className="controls">
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option>JavaScript</option>
            <option>Python</option>
            <option>Java</option>
            <option>C++</option>
          </select>

          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="review">🔍 Review</option>
            <option value="fix">🔧 Fix</option>
            <option value="optimize">⚡ Optimize</option>
            <option value="explain">📖 Explain</option>
          </select>

          <input type="file" onChange={handleFileUpload} />
        </div>

        <div className="editor-wrapper">
          <CodeMirror
            value={code}
            height="100%"
            theme={document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark"}
            onChange={(value) => setCode(value)}
          />
        </div>

        <button className="btn glow-btn" onClick={reviewCode} disabled={loading}>
          {loading ? <span className="loading-dots">Reviewing<span>.</span><span>.</span><span>.</span></span> : "Review Code"}
          {!loading && <span className="btn-shortcut">Ctrl+↵</span>}
        </button>
      </div>

      {/* ── RIGHT: RESULT ── */}
      <div className="result-section">
        <h2>AI Review</h2>
        <ReviewResult
          result={result}
          originalCode={originalCode}
          fixedCode={mode === "fix" ? result : null}
          mode={mode}
        />
      </div>

    </div>
  );
}

export default CodeEditor;