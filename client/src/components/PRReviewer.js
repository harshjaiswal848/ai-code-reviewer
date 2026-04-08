import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function PRReviewer() {
  const [prUrl, setPrUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [postMessage, setPostMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyzePr = async () => {
    if (!prUrl.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await axios.post("http://localhost:5000/api/pr/review", { prUrl: prUrl.trim() });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to review PR.");
    } finally {
      setLoading(false);
    }
  };

  const postReview = async () => {
    if (!result?.review || !prUrl.trim() || !githubToken.trim()) {
      setError("PR URL, generated review, and GitHub token are required.");
      return;
    }

    setPosting(true);
    setPostMessage("");
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/pr/post-review", {
        prUrl: prUrl.trim(),
        githubToken: githubToken.trim(),
        reviewBody: result.review,
        event: "COMMENT",
      });
      setPostMessage(`✅ Review posted to GitHub (ID: ${res.data.reviewId})`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post review to GitHub.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="security-scanner">
      <div className="security-header">
        <div className="security-header-left">
          <span className="security-icon">🔀</span>
          <div>
            <h3>PR Reviewer Agent</h3>
            <p>Paste a GitHub PR URL to get AI review comments and one-click post to GitHub.</p>
            <p>Paste a GitHub PR URL to get AI review comments and merge verdict.</p>
          </div>
        </div>
        <button className="security-scan-btn" onClick={analyzePr} disabled={loading || !prUrl.trim()}>
          {loading ? "Reviewing..." : "Review PR"}
        </button>
      </div>

      <div style={{ padding: 16, display: "grid", gap: 10 }}>
      <div style={{ padding: 16 }}>
        <input
          className="repo-url-input"
          placeholder="https://github.com/owner/repo/pull/123"
          value={prUrl}
          onChange={(e) => setPrUrl(e.target.value)}
        />
        <input
          className="repo-url-input"
          placeholder="GitHub token with pull request write access"
          type="password"
          value={githubToken}
          onChange={(e) => setGithubToken(e.target.value)}
        />
      </div>

      {error && <div className="security-error">{error}</div>}
      {postMessage && <div className="security-analysis"><p>{postMessage}</p></div>}

      {result && (
        <>
          <div className="security-analysis">
            <p><strong>{result.meta.title}</strong> by @{result.meta.author}</p>
            <p>Files: {result.meta.changedFiles} | +{result.meta.additions} / -{result.meta.deletions}</p>
            <ReactMarkdown>{result.review}</ReactMarkdown>
          </div>
          <div style={{ padding: "0 20px 20px" }}>
            <button className="security-scan-btn" onClick={postReview} disabled={posting || !githubToken.trim()}>
              {posting ? "Posting..." : "Post Review to GitHub"}
            </button>
          </div>
        </>
      </div>

      {error && <div className="security-error">{error}</div>}

      {result && (
        <div className="security-analysis">
          <p><strong>{result.meta.title}</strong> by @{result.meta.author}</p>
          <p>Files: {result.meta.changedFiles} | +{result.meta.additions} / -{result.meta.deletions}</p>
          <ReactMarkdown>{result.review}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default PRReviewer;
