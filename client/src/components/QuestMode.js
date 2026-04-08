import React, { useState } from "react";
import axios from "axios";

function QuestMode({ code, language }) {
  const [level, setLevel] = useState("intermediate");
  const [quest, setQuest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [xp, setXp] = useState(() => {
    const raw = Number(localStorage.getItem("questXp") || 0);
    return Number.isFinite(raw) ? raw : 0;
  });

  const startQuest = async () => {
    if (!code.trim()) {
      setError("Add code first to start quest mode.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setAnswers({});

    try {
      const res = await axios.post("http://localhost:5000/api/quest/start", { code, language, level });
      setQuest(res.data.quest);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to start quest.");
    } finally {
      setLoading(false);
    }
  };

  const submitQuest = async () => {
    if (!quest) return;

    setLoading(true);
    setError("");

    try {
      const payloadAnswers = (quest.questions || []).map((q) => ({ id: q.id, answer: answers[q.id] || "" }));
      const res = await axios.post("http://localhost:5000/api/quest/evaluate", {
        code,
        language,
        questions: quest.questions,
        answers: payloadAnswers,
      });

      setResult(res.data.evaluation);
      const nextXp = xp + (res.data.evaluation?.xpEarned || 0);
      setXp(nextXp);
      localStorage.setItem("questXp", String(nextXp));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to evaluate quest.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="security-scanner">
      <div className="security-header">
        <div className="security-header-left">
          <span className="security-icon">🎮</span>
          <div>
            <h3>Codebase Quest Mode</h3>
            <p>Gamified learning with story missions, hints, XP, and badges.</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button className="security-scan-btn" onClick={startQuest} disabled={loading}>
            {loading ? "Loading..." : "Start Quest"}
          </button>
        </div>
      </div>

      <div className="security-analysis">
        <p><strong>Total XP:</strong> {xp}</p>
      </div>

      {error && <div className="security-error">{error}</div>}

      {quest && (
        <div className="security-analysis">
          <h3>{quest.title}</h3>
          <p>{quest.story}</p>
          {(quest.questions || []).map((q, idx) => (
            <div key={q.id || idx} style={{ marginBottom: 16 }}>
              <p><strong>Q{idx + 1}:</strong> {q.prompt}</p>
              <p style={{ color: "#8b949e" }}>Hint: {q.hint}</p>
              <textarea
                className="chat-input"
                rows={3}
                value={answers[q.id] || ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                placeholder="Your answer"
              />
            </div>
          ))}
          <button className="security-scan-btn" onClick={submitQuest} disabled={loading}>
            {loading ? "Submitting..." : "Submit Answers"}
          </button>
        </div>
      )}

      {result && (
        <div className="security-analysis">
          <h3>Quest Result</h3>
          <p><strong>Score:</strong> {result.score}/100</p>
          <p><strong>XP Earned:</strong> {result.xpEarned}</p>
          <p><strong>Badge:</strong> {result.badgeUnlocked}</p>
          <ul>
            {(result.feedback || []).map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

export default QuestMode;
