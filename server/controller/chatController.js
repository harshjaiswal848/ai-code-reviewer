const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithCode = async (req, res) => {
  const { code, language, reviewResult, messages } = req.body;

  if (!code || !messages || messages.length === 0) {
    return res.status(400).json({ error: "Code and messages are required." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const systemContext = `You are an expert code assistant. The user is asking questions about the following ${language || "code"}.

Code:
\`\`\`${language?.toLowerCase() || ""}
${code}
\`\`\`

${reviewResult ? `Previous AI Review Result:\n${reviewResult}\n` : ""}

Answer the user's questions clearly and concisely. Reference specific line numbers when helpful. Format code snippets with proper markdown.`;

    // Build conversation history for Gemini
    const conversationHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemContext }],
        },
        {
          role: "model",
          parts: [{ text: "I've reviewed the code and previous analysis. Ask me anything about it!" }],
        },
        ...conversationHistory,
      ],
    });

    const result = await chat.sendMessage(lastMessage.content);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: "Failed to get response. Please try again." });
  }
};