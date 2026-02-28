import { useEffect, useRef, useState } from "react";
import CodeEditor from "./components/CodeEditor";
import "./App.css";

function App() {
  const [theme, setTheme] = useState("system");
  const canvasRef = useRef(null);

  /* ---------------- THEME SYSTEM ---------------- */
  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else if (theme === "light") root.setAttribute("data-theme", "light");
    else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }
  }, [theme]);

  /* ---------------- MATRIX BACKGROUND ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = "01<>/{}[]()function const var let";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#22c55e"; // green hacker color
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.97)
          drops[i] = 0;

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35);

    // cleanup when component rerenders
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      {/* Background canvas */}
      <canvas ref={canvasRef} id="bgCanvas"></canvas>

      <div className="card">
        <div className="header">
          <h1>AI Code Reviewer</h1>

          <div className="theme-buttons">
            <button onClick={() => setTheme("dark")}>🌙</button>
            <button onClick={() => setTheme("light")}>☀</button> 
          </div>
        </div>

        <CodeEditor />
      </div>
    </div>
  );
}

export default App;