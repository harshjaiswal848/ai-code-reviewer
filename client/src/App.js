import CodeEditor from "./components/CodeEditor";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI Code Reviewer</h1>
        <p>Powered by Google Gemini</p>
      </header>

      <CodeEditor />
    </div>
  );
}

export default App;