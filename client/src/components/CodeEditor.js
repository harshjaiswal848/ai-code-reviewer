import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import axios from "axios";
import ReviewResult from "./ReviewResult";

function CodeEditor() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const reviewCode = async () => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/review", { code });
      setResult(res.data.feedback);
      setLoading(false);
    } catch (error) {
      setResult("Error connecting to backend");
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="editor-section">
        <h2>Code Editor</h2>
        <CodeMirror
          value={code}
          height="400px"
          theme="dark"
          onChange={(value) => setCode(value)}
        />
        <button className="btn" onClick={reviewCode}>
          {loading ? "Reviewing..." : "Review Code"}
        </button>
      </div>

      <div className="result-section">
        <h2>AI Review</h2>
        <ReviewResult result={result} />
      </div>
    </div>
  );
}

export default CodeEditor;