import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import axios from "axios";
import ReviewResult from "./ReviewResult";

function CodeEditor() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [mode, setMode] = useState("review");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const reviewCode = async () => {
    if (!code || loading) return;

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:5000/review", {
        code,
        language,
        mode
      });

      setResult(res.data.feedback);
      setLoading(false);
    } catch {
      setResult("Error connecting to backend");
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="main-content">

      {/* LEFT SIDE */}
      <div className="editor-section">
        <h2>Code Editor</h2>

        <div className="controls">
          <select value={language} onChange={(e)=>setLanguage(e.target.value)}>
            <option>JavaScript</option>
            <option>Python</option>
            <option>Java</option>
            <option>C++</option>
          </select>

          <select value={mode} onChange={(e)=>setMode(e.target.value)}>
            <option value="review">Review</option>
            <option value="fix">Fix</option>
            <option value="optimize">Optimize</option>
            <option value="explain">Explain</option>
          </select>

          <input type="file" onChange={handleFileUpload} />
        </div>

        <div className="editor-wrapper">
          <CodeMirror
            value={code}
            height="100%"
            theme={document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark"}
            onChange={(value)=>setCode(value)}
          />
        </div>

        <button className="btn glow-btn" onClick={reviewCode}>
          {loading ? "Reviewing..." : "Review Code"}
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="result-section">
        <h2>AI Review</h2>
        <ReviewResult result={result} />
      </div>

    </div>
  );
}

export default CodeEditor;