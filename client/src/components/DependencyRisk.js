import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const defaultPackage = `{
  "dependencies": {
    "express": "^4.19.2",
    "axios": "^1.7.7"
  },
  "devDependencies": {
    "eslint": "^9.13.0"
  }
}`;

function DependencyRisk() {
  const [packageJsonText, setPackageJsonText] = useState(defaultPackage);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!packageJsonText.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await axios.post("http://localhost:5000/api/dependency/analyze", { packageJsonText });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to analyze dependencies.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="security-scanner">
      <div className="security-header">
        <div className="security-header-left">
          <span className="security-icon">📦</span>
          <div>
            <h3>Dependency Risk Intelligence</h3>
            <p>Analyze package dependencies for freshness and supply-chain risk patterns.</p>
          </div>
        </div>
        <button className="security-scan-btn" onClick={analyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Dependencies"}
        </button>
      </div>

      <div className="security-analysis">
        <textarea
          className="chat-input"
          rows={10}
          value={packageJsonText}
          onChange={(e) => setPackageJsonText(e.target.value)}
          placeholder='Paste package.json content here'
        />
      </div>

      {error && <div className="security-error">{error}</div>}
      {result && (
        <div className="security-analysis">
          <p><strong>Dependencies Checked:</strong> {result.dependenciesChecked}</p>
          {result.riskScore !== null && <p><strong>Risk Score:</strong> {result.riskScore}/100</p>}
          <ReactMarkdown>{result.analysis}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default DependencyRisk;
