import React, { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import axios from "axios";

function CodeEditor() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [mode, setMode] = useState("review");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  const reviewCode = async () => {
    if (!code) return;

    const newUserMessage = {
      role: "User",
      content: code
    };

    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/review", {
        code,
        language,
        mode,
        history: messages
      });

      const aiMessage = {
        role: "AI",
        content: res.data.feedback
      };

      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatHistory");
  };

  return (
    <div className="chat-container">

      <div className="controls">
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option>JavaScript</option>
          <option>Python</option>
          <option>Java</option>
          <option>C++</option>
        </select>

        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="review">Review</option>
          <option value="fix">Fix</option>
          <option value="optimize">Optimize</option>
          <option value="explain">Explain</option>
        </select>

        <button onClick={clearChat}>Clear Chat</button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-bubble ${msg.role === "AI" ? "ai" : "user"}`}
          >
            <strong>{msg.role}</strong>
            <pre>{msg.content}</pre>
          </div>
        ))}

        {loading && <div className="chat-bubble ai">AI is thinking...</div>}
      </div>

      <CodeMirror
        value={code}
        height="200px"
        theme="dark"
        onChange={(value) => setCode(value)}
      />

      <button className="btn glow-btn" onClick={reviewCode}>
        Send
      </button>

    </div>
  );
}

export default CodeEditor;