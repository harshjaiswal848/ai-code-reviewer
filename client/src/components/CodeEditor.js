import React, { useState, useEffect, useRef, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import axios from "axios";
import ReviewResult from "./ReviewResult";

/* ── Unique room ID generator ── */
const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

/* ── Generate shareable snippet link ── */
const generateSnippetLink = (code, language, result) => {
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ code, language, result }))));
  return `${window.location.origin}${window.location.pathname}?snippet=${payload}`;
};

/* ── Read snippet from URL ── */
const readSnippetFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("snippet");
  if (!raw) return null;
  try { return JSON.parse(decodeURIComponent(escape(atob(raw)))); }
  catch { return null; }
};

const MODE_ICON = { review: "🔍", fix: "🔧", optimize: "⚡", explain: "📖" };

function CodeEditor({ theme }) {
  const [code, setCode]         = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [mode, setMode]         = useState("review");
  const [result, setResult]     = useState("");
  const [loading, setLoading]   = useState(false);

  /* ── Session History ── */
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("reviewHistory") || "[]"); }
    catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("reviewHistory", JSON.stringify(history));
  }, [history]);

  /* ── Collaboration state ── */
  const [roomId, setRoomId]           = useState("");
  const [joinInput, setJoinInput]     = useState("");
  const [collabActive, setCollabActive] = useState(false);
  const [collabStatus, setCollabStatus] = useState("");
  const [showCollab, setShowCollab]   = useState(false);
  const wsRef = useRef(null);
  const isRemoteUpdate = useRef(false);

  /* ── Snippet share state ── */
  const [snippetLink, setSnippetLink]     = useState("");
  const [showSnippet, setShowSnippet]     = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [snippetLoaded, setSnippetLoaded] = useState(false);

  /* ── Load snippet from URL on mount ── */
  useEffect(() => {
    const snippet = readSnippetFromURL();
    if (snippet) {
      setCode(snippet.code || "");
      setLanguage(snippet.language || "JavaScript");
      setResult(snippet.result || "");
      setSnippetLoaded(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  /* ── Keyboard shortcut Ctrl+Enter ── */
  const reviewCode = useCallback(async () => {
    if (!code || loading) return;
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/review", { code, language, mode });
      const feedback = res.data.feedback;
      setResult(feedback);
      setLoading(false);

      // Save to session history
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
  }, [code, language, mode, loading]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") reviewCode();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reviewCode]);

  /* ── Load from history entry ── */
  const loadFromHistory = (entry) => {
    setCode(entry.code);
    setLanguage(entry.language);
    setMode(entry.mode);
    setResult(entry.result);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    sessionStorage.removeItem("reviewHistory");
  };

  /* ── WebSocket collaboration ── */
  const connectToRoom = (id) => {
    if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket(`wss://socketsbay.com/wss/v2/1/${id}/`);
    wsRef.current = ws;

    ws.onopen = () => {
      setCollabActive(true);
      setCollabStatus("🟢 Connected to room: " + id);
      ws.send(JSON.stringify({ type: "join", roomId: id }));
    };
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "code-update") {
          isRemoteUpdate.current = true;
          setCode(msg.code);
          setLanguage(msg.language);
        }
      } catch {}
    };
    ws.onerror = () => setCollabStatus("🔴 Connection error");
    ws.onclose = () => {
      setCollabActive(false);
      setCollabStatus("⚪ Disconnected");
    };
  };

  const startCollabRoom = () => {
    const id = generateRoomId();
    setRoomId(id);
    connectToRoom(id);
  };

  const joinCollabRoom = () => {
    const id = joinInput.trim().toUpperCase();
    if (!id) return;
    setRoomId(id);
    connectToRoom(id);
  };

  const leaveRoom = () => {
    if (wsRef.current) wsRef.current.close();
    setRoomId("");
    setCollabActive(false);
    setCollabStatus("");
  };

  /* ── Broadcast code changes ── */
  const handleCodeChange = (value) => {
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; }
    setCode(value);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "code-update", code: value, language }));
    }
  };

  /* ── File upload ── */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCode(ev.target.result);
    reader.readAsText(file);
  };

  /* ── Generate snippet share link ── */
  const handleShare = () => {
    const link = generateSnippetLink(code, language, result);
    setSnippetLink(link);
    setShowSnippet(true);
    setSnippetCopied(false);
  };

  const copySnippetLink = () => {
    navigator.clipboard.writeText(snippetLink);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2500);
  };

  return (
    <div className="main-content">

      {/* ── HISTORY SIDEBAR ── */}
      <div className={`history-sidebar ${showHistory ? "open" : ""}`}>
        <div className="history-header">
          <span>🕑 Session History</span>
          <div style={{ display: "flex", gap: 6 }}>
            {history.length > 0 && (
              <button className="history-clear-btn" onClick={clearHistory}>Clear</button>
            )}
            <button className="history-close-btn" onClick={() => setShowHistory(false)}>✕</button>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="history-empty">No reviews yet this session.</p>
        ) : (
          <div style={{ overflowY: "auto", flex: 1 }}>
            {history.map(entry => (
              <div key={entry.id} className="history-item" onClick={() => loadFromHistory(entry)}>
                <div className="history-item-top">
                  <span className="history-mode">{MODE_ICON[entry.mode]} {entry.mode}</span>
                  <span className="history-lang">{entry.language}</span>
                  <span className="history-time">{entry.timestamp}</span>
                </div>
                <div className="history-preview">
                  {entry.code.slice(0, 80).replace(/\n/g, " ")}…
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SNIPPET LOADED BANNER ── */}
      {snippetLoaded && (
        <div className="snippet-banner">
          📎 Shared snippet loaded — code and review result restored!
          <button onClick={() => setSnippetLoaded(false)}>✕</button>
        </div>
      )}

      {/* ── LEFT: EDITOR ── */}
      <div className="editor-section">
        <div className="section-title-row">
          <h2>Code Editor</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="history-toggle-btn"
              onClick={() => setShowHistory(s => !s)}
              title="Session History"
            >
              🕑 History
              {history.length > 0 && (
                <span className="history-badge">{history.length}</span>
              )}
            </button>
            <button className="collab-toggle-btn" onClick={() => setShowCollab(s => !s)}>
              👥 Collab {collabActive && <span className="collab-dot" />}
            </button>
            <button className="share-btn" onClick={handleShare}>
              🔗 Share
            </button>
          </div>
        </div>

        {/* ── COLLAB PANEL ── */}
        {showCollab && (
          <div className="collab-panel">
            <div className="collab-panel-title">👥 Real-time Collaboration</div>
            {!collabActive ? (
              <div className="collab-actions">
                <button className="collab-start-btn" onClick={startCollabRoom}>
                  ➕ Start New Room
                </button>
                <div className="collab-join-row">
                  <input
                    className="collab-input"
                    placeholder="Enter Room ID..."
                    value={joinInput}
                    onChange={e => setJoinInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && joinCollabRoom()}
                  />
                  <button className="collab-join-btn" onClick={joinCollabRoom}>Join</button>
                </div>
              </div>
            ) : (
              <div className="collab-active-panel">
                <div className="collab-room-id">
                  Room: <strong>{roomId}</strong>
                  <button className="collab-copy-room" onClick={() => navigator.clipboard.writeText(roomId)}>📋</button>
                </div>
                <div className="collab-status">{collabStatus}</div>
                <button className="collab-leave-btn" onClick={leaveRoom}>Leave Room</button>
              </div>
            )}
          </div>
        )}

        {/* ── SNIPPET SHARE PANEL ── */}
        {showSnippet && (
          <div className="snippet-panel">
            <div className="snippet-panel-title">🔗 Share This Code Snippet</div>
            <p className="snippet-desc">Anyone with this link can view the code and AI review result.</p>
            <div className="snippet-link-row">
              <input className="snippet-link-input" value={snippetLink} readOnly />
              <button className="snippet-copy-btn" onClick={copySnippetLink}>
                {snippetCopied ? "✅ Copied!" : "📋 Copy"}
              </button>
            </div>
            <button className="snippet-close-btn" onClick={() => setShowSnippet(false)}>Close</button>
          </div>
        )}

        {/* ── CONTROLS ── */}
        <div className="controls">
          <select value={language} onChange={(e) => {
            setLanguage(e.target.value);
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: "code-update", code, language: e.target.value }));
            }
          }}>
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
            theme={theme === "light" ? "light" : "dark"}
            onChange={handleCodeChange}
          />
        </div>

        <button className="btn glow-btn" onClick={reviewCode} disabled={loading}>
          {loading
            ? <span className="loading-dots">Reviewing<span>.</span><span>.</span><span>.</span></span>
            : <>Review Code <span className="btn-shortcut">Ctrl+↵</span></>
          }
        </button>
      </div>

      {/* ── RIGHT: RESULT ── */}
      <div className="result-section">
        <h2>AI Review</h2>
        <ReviewResult result={result} mode={mode} />
      </div>

    </div>
  );
}

export default CodeEditor;