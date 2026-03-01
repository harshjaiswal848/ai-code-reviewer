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
      <div className="output-header">
        <h3>AI Review</h3>
        {result && <button onClick={copyText}>Copy</button>}
      </div>

      {score > 0 && (
        <div className="score-section">
          <p>Code Quality Score</p>
          <div className="score-bar">
            <div style={{ width: `${score}%` }}></div>
          </div>
          <p>Confidence: {confidence}</p>
        </div>
      )}

      <pre className="output-text">
        {result || "AI response will appear here..."}
      </pre>
    </div>
  );
}

export default ReviewResult;