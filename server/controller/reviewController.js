const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.reviewCode = async (req, res) => {
  try {
    const { code, language = "JavaScript", mode = "review" } = req.body;

    if (!code) {
      return res.json({ feedback: "No code provided." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let prompt = "";

    if (mode === "fix") {
      prompt = `Fix all errors in the following ${language} code.

Return your response in this EXACT format:

Errors:
- list each error found

Fixed Code:
\`\`\`${language.toLowerCase()}
<paste the fully corrected code here>
\`\`\`

Explanation:
- briefly explain each fix made

Code Quality Score: (score out of 10)
Confidence: (percentage)

Code to fix:
${code}`;

    } else if (mode === "optimize") {
      prompt = `Optimize the following ${language} code for performance and readability.

Return your response in this EXACT format:

Optimizations Made:
- list each optimization

Optimized Code:
\`\`\`${language.toLowerCase()}
<paste the optimized code here>
\`\`\`

Explanation:
- briefly explain the benefits

Code Quality Score: (score out of 10)
Confidence: (percentage)

Code to optimize:
${code}`;

    } else if (mode === "explain") {
      prompt = `Explain the following ${language} code step by step for a developer.

Return your response in this format:

## Overview
Brief summary of what the code does.

## Step-by-Step Explanation
Explain each logical section.

## Key Concepts
List any important patterns or techniques used.

Code Quality Score: (score out of 10)
Confidence: (percentage)

Code:
${code}`;

    } else {
      // review mode — include line-by-line comments
      prompt = `Review the following ${language} code and find bugs and improvements.

Return your response in this EXACT format:

## Errors
- list each error with severity (Critical / Warning / Info)

## Suggestions
- list improvements

## Line Comments
For each specific line issue, add a tag like: [LINE:5] description of issue
List at least 3–5 line-specific comments if applicable.

Code Quality Score: (score out of 10)
Confidence: (percentage)

Code to review:
${code}`;
    }

    const result = await model.generateContent(prompt);

    res.json({ feedback: result.response.text() });

  } catch (error) {
    console.log("Gemini Error:", error);
    res.status(500).json({ feedback: "Error connecting to Gemini AI" });
  }
};