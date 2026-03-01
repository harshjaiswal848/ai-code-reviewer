const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.reviewCode = async (req, res) => {
  try {
    const { code, language, mode, history } = req.body;

    if (!code) {
      return res.json({ feedback: "No code provided." });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite"
    });

    let instruction = "";

    if (mode === "fix")
      instruction = "Fix all errors and return corrected code.";
    else if (mode === "optimize")
      instruction = "Optimize this code for performance.";
    else if (mode === "explain")
      instruction = "Explain this code step by step.";
    else
      instruction = "Review this code and find bugs and improvements.";

    const conversationHistory = history
      ? history.map((msg) => `${msg.role}: ${msg.content}`).join("\n")
      : "";

    const prompt = `
Conversation History:
${conversationHistory}

${instruction}
Language: ${language}

Code:
${code}
`;

    const result = await model.generateContent(prompt);

    res.json({
      feedback: result.response.text()
    });

  } catch (error) {
    console.log("Gemini Error:", error);
    res.status(500).json({
      feedback: "Error connecting to Gemini AI"
    });
  }
};