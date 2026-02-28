const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.reviewCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.json({ feedback: "No code provided." });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite"
    });

    const result = await model.generateContent(
      `You are a professional code reviewer.
      Review the following code, find bugs, errors, and suggest improvements:

      ${code}`
    );

    res.json({
      feedback: result.response.text()
    });

  } catch (error) {
    console.log("Gemini Error:", error.message);
    res.json({
      feedback: "Error connecting to Gemini AI"
    });
  }
};