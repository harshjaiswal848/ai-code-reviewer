# 🤖 AI-Powered Real-Time Code Reviewer

## 📌 Project Overview

The **AI-Powered Real-Time Code Reviewer** is a web-based application that analyzes source code and provides automated feedback instantly. Users can write code in an interactive editor, and the system reviews the code to detect errors, suggest improvements, and enhance coding quality.

This project follows a **Client–Server Architecture** with AI service integration.

---

## 🚀 Features

* Interactive code editor using CodeMirror
* Real-time code review system
* Detects syntax and logical issues
* Suggests code improvements
* Provides automated feedback
* Client–Server architecture implementation
* AI integration ready (OpenAI API)

---

## 🏗️ System Architecture

The system consists of three main layers:

### 1️⃣ Presentation Layer (Frontend)

* React.js
* HTML
* CSS
* JavaScript
* CodeMirror Editor

**Responsibilities:**

* Provides user interface
* Accepts code input
* Sends code to backend
* Displays feedback

---

### 2️⃣ Application Layer (Backend)

* Node.js
* Express.js

**Responsibilities:**

* Handles API requests
* Processes user input
* Communicates with AI service
* Sends response to frontend

---

### 3️⃣ AI Processing Layer

* OpenAI API (optional)
* Analyzes code
* Detects errors
* Suggests improvements

---

## 🔄 System Workflow

1. User writes code in editor.
2. Frontend sends code to backend.
3. Backend processes request.
4. AI analyzes code (or demo response).
5. Backend returns feedback.
6. Frontend displays suggestions.

---

## 🛠️ Technologies Used

### Frontend

* React.js
* CodeMirror
* Axios
* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js
* CORS
* dotenv

### AI Integration

* OpenAI API

---

## 📁 Project Structure

```
ai-code-reviewer/
│
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeEditor.js
│   │   │   └── ReviewResult.js
│   │   ├── App.js
│   │   └── index.js
│
├── server/                 # Node backend
│   ├── controller/
│   │   └── reviewController.js
│   ├── routes/
│   │   └── reviewRoute.js
│   └── server.js
│
└── README.md
```

---

## ⚙️ Installation and Setup

### 1️⃣ Clone Repository

```
git clone https://github.com/harshjaiswal848/ai-code-reviewer
cd ai-code-reviewer
```

---

### 2️⃣ Setup Backend

```
cd server
npm install
node server.js
```

Backend runs on:

```
http://localhost:5000
```

---

### 3️⃣ Setup Frontend

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

## 🧪 Usage

1. Open the application in browser.
2. Write code in the editor.
3. Click **Review Code**.
4. View AI-generated feedback.

---

## 🎯 Objectives

* Improve coding productivity
* Automate code review process
* Provide intelligent suggestions
* Enhance learning experience

---

## 🔮 Future Enhancements

* Real-time review without button
* Multiple programming language support
* Code quality scoring
* Authentication system
* Performance optimization suggestions

---

## 👨‍💻 Author

Harsh Jaiswal

---

## 📜 License

This project is developed for educational purposes.
