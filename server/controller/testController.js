const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateTests = async (req, res) => {
  const { code, language = "JavaScript" } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).json({ error: "Code is required to generate test cases." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are an expert QA engineer. Generate practical test cases for the following ${language} code.

Return your response in this EXACT format:

## Coverage Summary
- What areas the tests cover and assumptions.

## High-Risk Edge Cases
- list at least 5 edge/failure scenarios

## Suggested Unit Tests
Provide runnable test code block in ${language} or nearest common test framework for ${language}.

## Failing Input Candidates
- list concrete sample inputs likely to break current implementation

## Quick QA Checklist
- short checklist to validate correctness, performance, and robustness

Code:
\`\`\`${language.toLowerCase()}
${code}
\`\`\``;

    const result = await model.generateContent(prompt);
    const testPlan = result.response.text();

    res.json({ testPlan });
  } catch (err) {
    console.error("Test generation error:", err.message);
    res.status(500).json({ error: "Failed to generate test cases." });
  }
};
