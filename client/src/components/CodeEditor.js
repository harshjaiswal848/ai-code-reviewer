import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import axios from "axios";
import ReviewResult from "./ReviewResult";

function CodeEditor() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");

  const reviewCode = async () => {
    try {
      const res = await axios.post("http://localhost:5000/review", { code });
      setResult(res.data.feedback);
    } catch (error) {
      setResult("Error connecting to backend");
    }
  };

  return (
    <div>
      <CodeMirror
        value={code}
        height="300px"
        onChange={(value) => setCode(value)}
      />
      <br />
      <button onClick={reviewCode}>Review Code</button>
      <ReviewResult result={result} />
    </div>
  );
}

export default CodeEditor;