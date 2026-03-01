import { useEffect, useState } from "react";

function ReviewResult({ result }) {
  const [score, setScore] = useState(0);
  const [confidence, setConfidence] = useState("");

  useEffect(() => {
    if (!result) return;

    const scoreMatch = result.match(/Code Quality Score:\s*(\d+)/i);
    const confidenceMatch = result.match(/Confidence:\s*(\d+%?)/i);

    if (scoreMatch) setScore(parseInt(scoreMatch[1]) * 10);
    if (confidenceMatch) setConfidence(confidenceMatch[1]);
  }, [result]);

  const copyText = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <div className="output">

      {score > 0 && (
        <div className="score-card">
          <div className="score-header">
            <h3>Code Quality</h3>
            <span>{score / 10}/10</span>
          </div>

          <div className="score-bar">
            <div style={{ width: `${score}%` }}></div>
          </div>

          <p className="confidence">Confidence: {confidence}</p>
        </div>
      )}

      {result && (
        <button className="copy-btn" onClick={copyText}>
          Copy Result
        </button>
      )}

      <pre className="output-text">
        {result || "AI response will appear here..."}
      </pre>
    </div>
  );
}

export default ReviewResult;