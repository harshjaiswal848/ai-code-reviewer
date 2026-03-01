import { useEffect, useRef, useState } from "react";
import CodeEditor from "./components/CodeEditor";
import "./App.css";

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const canvasRef = useRef(null);

  /* ---------------- THEME SYSTEM ---------------- */
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  /* ---------------- PARTICLE CONSTELLATION BACKGROUND ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const PARTICLE_COUNT = 110;
    const CONNECTION_DIST = 150;
    const MOUSE_REPEL_DIST = 120;
    const COLORS = ["#6366f1", "#3b82f6", "#22c55e", "#8b5cf6", "#14b8a6"];

    let particles = [];
    let mouse = { x: -9999, y: -9999 };
    let animId;

    const initParticles = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1.2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
      }));
    };

    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r},${g},${b}`;
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const isDark = document.documentElement.getAttribute("data-theme") !== "light";

      ctx.fillStyle = isDark ? "#0b0f1a" : "rgba(241,245,249,0.3)";
      ctx.fillRect(0, 0, W, H);

      particles.forEach((p) => {
        p.pulse += p.pulseSpeed;
        const glowRadius = p.r + Math.sin(p.pulse) * 0.8;
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_REPEL_DIST && dist > 0) {
          const force = (MOUSE_REPEL_DIST - dist) / MOUSE_REPEL_DIST;
          p.vx += (dx / dist) * force * 0.3;
          p.vy += (dy / dist) * force * 0.3;
        }
        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        const rgb = hexToRgb(p.color);
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, 0.08)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]; const b = particles[j];
          const dx = a.x - b.x; const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.5;
            const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            gradient.addColorStop(0, `rgba(${hexToRgb(a.color)}, ${alpha})`);
            gradient.addColorStop(1, `rgba(${hexToRgb(b.color)}, ${alpha})`);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };

    const onMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div className="page">
      <canvas ref={canvasRef} id="bgCanvas"></canvas>

      <div className="page-wrapper">

        {/* HEADER */}
        <div className="app-header">
          <div className="header-left">
            <h1 className="site-title">
              <span className="title-ai">AI</span>
              <span className="title-separator"> </span>
              <span className="title-code">CODE</span>
              <span className="title-separator"> </span>
              <span className="title-reviewer">REVIEWER</span>
            </h1>
            <p className="site-subtitle">Developed by Harsh Jaiswal &amp; Krishna Garg</p>
          </div>

          {/* THEME TOGGLE */}
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <div className="dashboard">
          <CodeEditor theme={theme} />
        </div>

      </div>
    </div>
  );
}

export default App;