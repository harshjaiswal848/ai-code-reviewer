# 🤖 AI Code Reviewer

AI Code Reviewer is a full-stack web app for reviewing, explaining, fixing, testing, and securing source code with Google Gemini. It combines a React code workspace with an Express API, optional user accounts, review history, analytics, GitHub pull request review, repository license analysis, and dependency risk checks.

## ✨ Features

- AI code review with review, fix, optimize, explain, and learning modes
- Multi-language editor support for JavaScript, Python, Java, and C++
- Markdown-formatted AI feedback with quality scores and confidence signals
- Code chat that answers follow-up questions about the current code and review
- Security scanner with risk level, vulnerability details, quick fixes, and patched code
- Test case generator for edge cases, unit tests, and QA checklists
- GitHub PR reviewer that analyzes changed files and can post a review comment
- Repository license analyzer for public GitHub repositories
- Dependency risk intelligence for `package.json` dependencies
- Quest mode for gamified learning exercises based on pasted code
- Optional authentication with JWT, Supabase-backed review history, and analytics dashboard
- Session history, shareable snippets, file upload, dark/light themes, and WebSocket-based collaboration rooms

## 🛠️ Tech Stack

**🎨 Frontend**

- React 19
- React Router
- CodeMirror via `@uiw/react-codemirror`
- Axios
- React Markdown
- Recharts
- jsPDF
- Create React App

**⚙️ Backend**

- Node.js
- Express 5
- Google Gemini via `@google/generative-ai`
- Supabase
- JWT authentication
- bcryptjs
- Axios
- dotenv
- CORS

## 📁 Project Structure

```text
ai-code-reviewer/
|-- client/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |   |-- CodeChat.js
|   |   |   |-- CodeEditor.js
|   |   |   |-- DependencyRisk.js
|   |   |   |-- PRReviewer.js
|   |   |   |-- QuestMode.js
|   |   |   |-- ReviewResult.js
|   |   |   |-- SecurityScanner.js
|   |   |   `-- TestGenerator.js
|   |   |-- context/
|   |   |   `-- AuthContext.js
|   |   |-- pages/
|   |   |   |-- Dashboard.js
|   |   |   |-- Login.js
|   |   |   |-- Register.js
|   |   |   `-- RepoAnalyzer.js
|   |   |-- App.js
|   |   `-- index.js
|   `-- package.json
|-- server/
|   |-- controller/
|   |-- middleware/
|   |-- routes/
|   |-- server.js
|   |-- supabaseClient.js
|   `-- package.json
|-- .gitignore
`-- README.md
```

## ✅ Prerequisites

- Node.js 18 or newer
- npm
- Google Gemini API key
- Supabase project, if you want authentication, history, and analytics
- Optional GitHub personal access token for higher GitHub API limits and posting PR reviews

## 🔐 Environment Variables

Create `server/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=replace_with_a_long_random_secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
GITHUB_TOKEN=optional_github_token_for_repo_and_pr_analysis
```

`GITHUB_TOKEN` is optional for public repository analysis and PR review generation, but useful for rate limits and private-access workflows. Posting a PR review from the UI requires a GitHub token entered in the PR Reviewer panel.

## 🗄️ Supabase Tables

The server expects these tables to exist.

### 👤 `users`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid or bigint | Primary key |
| `email` | text | Unique user email |
| `password` | text | bcrypt hash |
| `name` | text | Display name |
| `created_at` | timestamptz | Optional default timestamp |

### 📝 `reviews`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid or bigint | Primary key |
| `user_id` | same as `users.id` | Owner of the review |
| `code` | text | Submitted code |
| `language` | text | Language selected in the editor |
| `mode` | text | Review mode |
| `result` | text | AI response |
| `created_at` | timestamptz | Used by history and analytics |

## 📦 Installation

Clone the repository and install dependencies in both apps:

```bash
git clone <your-repository-url>
cd ai-code-reviewer

cd server
npm install

cd ../client
npm install
```

## 🚀 Running Locally

Start the backend:

```bash
cd server
npm start
```

The API runs at:

```text
http://localhost:5000
```

Start the frontend in another terminal:

```bash
cd client
npm start
```

The React app runs at:

```text
http://localhost:3000
```

## 🔌 API Overview

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/review` | Review, fix, optimize, explain, or teach code | Optional |
| `POST` | `/api/auth/register` | Create a user account | No |
| `POST` | `/api/auth/login` | Log in and receive JWT | No |
| `GET` | `/api/history` | Fetch saved reviews | Required |
| `DELETE` | `/api/history/:id` | Delete a saved review | Required |
| `GET` | `/api/analytics` | Fetch review analytics | Required |
| `POST` | `/api/chat` | Ask follow-up questions about code | No |
| `POST` | `/api/security/scan` | Scan code for security vulnerabilities | No |
| `POST` | `/api/tests/generate` | Generate test cases | No |
| `POST` | `/api/pr/review` | Analyze a GitHub pull request | No |
| `POST` | `/api/pr/post-review` | Post generated review to GitHub | Token in body |
| `POST` | `/api/repo/analyze` | Analyze public GitHub repo license risk | No |
| `POST` | `/api/dependency/analyze` | Analyze dependency freshness and risk | No |
| `POST` | `/api/quest/start` | Generate a learning quest | No |
| `POST` | `/api/quest/evaluate` | Evaluate quest answers | No |

## 🧪 Common Request Examples

### 🔍 Code Review

```bash
curl -X POST http://localhost:5000/review \
  -H "Content-Type: application/json" \
  -d "{\"code\":\"function add(a,b){return a+b}\",\"language\":\"JavaScript\",\"mode\":\"review\"}"
```

### 🔑 Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"password\"}"
```

### 📜 Repository License Analysis

```bash
curl -X POST http://localhost:5000/api/repo/analyze \
  -H "Content-Type: application/json" \
  -d "{\"repoUrl\":\"https://github.com/facebook/react\"}"
```

## 🧭 Frontend Routes

| Route | Screen |
| --- | --- |
| `/` | Main AI code reviewer workspace |
| `/login` | Login page |
| `/register` | Registration page |
| `/dashboard` | Review history and analytics |
| `/repo-analyzer` | GitHub repository license analyzer |

## 📌 Notes

- The frontend currently calls the backend at `http://localhost:5000` directly.
- CORS is configured for `http://localhost:3000`.
- Collaboration rooms use `wss://socketsbay.com/wss/v2/1/{roomId}/`.
- Authenticated reviews are saved to Supabase. Guest reviews still work, but they are not persisted.
- The `.gitignore` file is currently empty. In a production repository, ignore `node_modules`, `.env`, build outputs, and local editor files.

## 📜 Available Scripts

**⚙️ Backend:**

```bash
cd server
npm start
```

**🎨 Frontend:**

```bash
cd client
npm start
npm run build
npm test
```

## 👨‍💻 Authors

- Harsh Jaiswal 

## 📄 License

This project is currently marked as `ISC` in `server/package.json`. Add a root `LICENSE` file if you plan to publish or distribute the project.
