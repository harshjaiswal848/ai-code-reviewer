import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function TestGenerator({ code, language }) {
  const [loading, setLoading] = useState(false);
  const [testPlan, setTestPlan] = useState("");
  const [error, setError] = useState("");

  const generate = async () => {
    if (!code.trim()) {
      setError("Write code first to generate tests.");
      return;
    }

    setLoading(true);
    setError("");
    setTestPlan("");

    try {
      const res = await axios.post("http://localhost:5000/api/tests/generate", { code, language });
      setTestPlan(res.data.testPlan);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate tests.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="security-scanner">
      <div className="security-header">
        <div className="security-header-left">
          <span className="security-icon">🧪</span>
          <div>
            <h3>Auto Test Case Generator</h3>
            <p>Generate edge cases, failing inputs, and suggested unit tests.</p>
          </div>
        </div>
        <button className="security-scan-btn" onClick={generate} disabled={loading}>
          {loading ? "Generating..." : "Generate Tests"}
        </button>
      </div>

      {error && <div className="security-error">{error}</div>}
      {testPlan ? (
        <div className="security-analysis"><ReactMarkdown>{testPlan}</ReactMarkdown></div>
      ) : (
        <div className="security-empty"><p>Generate test cases from your current editor code.</p></div>
      )}
    </div>
  );
}

export default TestGenerator;
