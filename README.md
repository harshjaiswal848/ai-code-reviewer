# 🤖 AI-Powered Real-Time Code Reviewer

## 📌 Project Overview

The **AI-Powered Real-Time Code Reviewer** is a full-stack web application that analyzes source code and provides intelligent feedback instantly using **Google Gemini AI**.

Users can write code inside an interactive editor, submit it for review, and receive:

* Syntax error detection
* Bug identification
* Logical issue analysis
* Code improvement suggestions

The system follows a **Client–Server Architecture** with AI integration.

---

## 🏗️ System Architecture

```
Frontend (React + CodeMirror)
        ↓
Backend (Node.js + Express)
        ↓
Google Gemini AI
        ↓
AI Code Review Response
```

---

## 🚀 Features

* Interactive Code Editor (CodeMirror)
* AI-based real-time code review
* Detects bugs and logical errors
* Suggests improvements
* Clean client–server architecture
* Uses Google Gemini (free tier supported)

---

## 🛠️ Technologies Used

### Frontend

* React.js
* HTML5
* CSS3
* JavaScript
* CodeMirror
* Axios

### Backend

* Node.js
* Express.js
* CORS
* dotenv

### AI Integration

* Google Gemini API (`gemini-pro`)

---

## 📁 Project Structure

```
ai-code-reviewer/
│
├── client/                  # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeEditor.js
│   │   │   └── ReviewResult.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── server/                  # Node Backend
│   ├── controller/
│   │   └── reviewController.js
│   ├── routes/
│   │   └── reviewRoute.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```
git clone https://github.com/harshjaiswal848/ai-code-reviewer
cd ai-code-reviewer
```

---

### 2️⃣ Backend Setup

```
cd server
npm install
```

Create a `.env` file inside `server` folder:

```
GEMINI_API_KEY=your_api_key_here
```

Start backend:

```
node server.js
```

Backend runs on:

```
http://localhost:5000
```

---

### 3️⃣ Frontend Setup

```
cd client
npm install
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

## 🧪 How to Use

1. Open the application in browser.
2. Write code inside the editor.
3. Click **Review Code**.
4. View AI-generated feedback instantly.

---

## 🎯 Project Objectives

* Automate code review process
* Improve coding productivity
* Provide intelligent bug detection
* Demonstrate AI integration in web applications

---

## 🔮 Future Enhancements

* Real-time review without button click
* Multi-language support (Java, Python, C++)
* Code quality scoring system
* Authentication system
* Deployment on cloud (Render / Vercel)
* Downloadable review reports

---

## 👨‍💻 Author

Harsh Jaiswal

---

## 📜 License

This project is developed for educational and learning purposes.
