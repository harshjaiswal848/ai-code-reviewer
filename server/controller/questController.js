const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateQuest = async (req, res) => {
  const { code, language = "JavaScript", level = "intermediate" } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).json({ error: "Code is required to start quest mode." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const prompt = `You are a gamified coding coach. Build a code quest for ${language} at ${level} level.\n\nCode:\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\`\n\nReturn JSON ONLY with this schema:\n{\n  \"title\": string,\n  \"story\": string,\n  \"xpAvailable\": number,\n  \"questions\": [\n    {\n      \"id\": string,\n      \"prompt\": string,\n      \"hint\": string\n    }\n  ],\n  \"badge\": string\n}\nInclude exactly 3 questions.`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const quest = JSON.parse(cleaned);

    res.json({ quest });
  } catch (err) {
    console.error("Quest generation error:", err.message);
    res.status(500).json({ error: "Failed to generate quest." });
  }
};

exports.evaluateQuest = async (req, res) => {
  const { code, language = "JavaScript", questions = [], answers = [] } = req.body;

  if (!code || !questions.length || !answers.length) {
    return res.status(400).json({ error: "Code, questions, and answers are required." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const prompt = `Evaluate learner answers for this ${language} code quest.\n\nCode:\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\`\n\nQuestions:\n${JSON.stringify(questions, null, 2)}\n\nAnswers:\n${JSON.stringify(answers, null, 2)}\n\nReturn JSON ONLY with schema:\n{\n  \"score\": number,\n  \"xpEarned\": number,\n  \"feedback\": [\"...\"],\n  \"badgeUnlocked\": string\n}\nScore must be 0-100.`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const evaluation = JSON.parse(cleaned);

    res.json({ evaluation });
  } catch (err) {
    console.error("Quest evaluation error:", err.message);
    res.status(500).json({ error: "Failed to evaluate quest answers." });
  }
};
