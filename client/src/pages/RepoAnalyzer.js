import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./RepoAnalyzer.css";

const RepoAnalyzer = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) return;
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/repo/analyze", {
        repoUrl: repoUrl.trim(),
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to analyze repository. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAnalyze();
  };

  const getVerdictClass = (analysis) => {
    if (!analysis) return "";
    if (analysis.includes("✅")) return "verdict-safe";
    if (analysis.includes("⚠️")) return "verdict-caution";
    if (analysis.includes("❌")) return "verdict-danger";
    return "";
  };

  return (
    <div className="repo-analyzer">

      {/* Input section */}
      <div className="repo-input-card">
        <div className="repo-input-header">
          <span className="repo-icon">🔍</span>
          <div>
            <h2>Repo License Analyzer</h2>
            <p>Paste any public GitHub repo link to check if it's safe and legal to use</p>
          </div>
        </div>

        <div className="repo-input-row">
          <input
            type="text"
            className="repo-url-input"
            placeholder="https://github.com/owner/repository"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="repo-analyze-btn"
            onClick={handleAnalyze}
            disabled={loading || !repoUrl.trim()}
          >
            {loading ? (
              <span className="repo-loading">
                <span className="repo-spinner" /> Analyzing...
              </span>
            ) : (
              "Analyze →"
            )}
          </button>
        </div>

        {error && <div className="repo-error">{error}</div>}
      </div>

      {/* Result section */}
      {result && (
        <div className="repo-result">

          {/* Repo meta card */}
          <div className="repo-meta-card">
            <div className="repo-meta-top">
              <a
                href={result.meta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="repo-meta-name"
              >
                📦 {result.meta.name}
              </a>
              {result.meta.isArchived && (
                <span className="repo-badge badge-archived">Archived</span>
              )}
              {result.meta.isFork && (
                <span className="repo-badge badge-fork">Fork</span>
              )}
            </div>

            <p className="repo-meta-desc">{result.meta.description}</p>

            <div className="repo-meta-stats">
              <span>⭐ {result.meta.stars.toLocaleString()}</span>
              <span>🍴 {result.meta.forks.toLocaleString()}</span>
              <span>🗓 {result.meta.lastUpdated}</span>
              <span>💻 {result.meta.languages}</span>
            </div>

            <div className={`repo-license-badge ${getVerdictClass(result.analysis)}`}>
              📜 {result.meta.license}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="repo-analysis-card">
            <h3>AI Analysis</h3>
            <div className="repo-analysis-body">
              <ReactMarkdown>{result.analysis}</ReactMarkdown>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default RepoAnalyzer;