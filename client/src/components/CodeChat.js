import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./CodeChat.css";

function CodeChat({ code, language, reviewResult }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I've seen your code and the review. Ask me anything — explain a line, suggest a rewrite, or ask why something is a bug.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        code,
        language,
        reviewResult,
        messages: newMessages,
      });

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't get a response. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Chat cleared! Ask me anything about your code.",
    }]);
  };

  // Quick prompt suggestions
  const suggestions = [
    "Explain line by line",
    "How do I fix the bugs?",
    "Rewrite this more cleanly",
    "What design patterns apply here?",
  ];

  return (
    <div className="code-chat">
      <div className="chat-header">
        <span>💬 Ask AI about this code</span>
        <button className="chat-clear-btn" onClick={clearChat}>Clear</button>
      </div>

      {/* Quick suggestions */}
      {messages.length <= 1 && (
        <div className="chat-suggestions">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="chat-suggestion-btn"
              onClick={() => { setInput(s); }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            <div className="chat-bubble-label">
              {msg.role === "user" ? "You" : "AI"}
            </div>
            <div className="chat-bubble-content">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-bubble assistant">
            <div className="chat-bubble-label">AI</div>
            <div className="chat-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-row">
        <textarea
          className="chat-input"
          placeholder="Ask about your code... (Enter to send)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={loading}
        />
        <button
          className="chat-send-btn"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default CodeChat;