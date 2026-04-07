const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.scanSecurity = async (req, res) => {
  const { code, language = "JavaScript" } = req.body;

  if (!code) {
    return res.status(400).json({ error: "No code provided." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are a professional security auditor and penetration tester. Perform a thorough security vulnerability scan on the following ${language} code.

Analyze for ALL of the following vulnerability categories:
- SQL Injection
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Hardcoded secrets, API keys, passwords
- Insecure dependencies or imports
- Authentication/Authorization flaws
- Insecure data storage
- Sensitive data exposure
- Buffer overflow / memory issues
- Command injection
- Path traversal
- Insecure deserialization
- Broken access control
- Security misconfigurations

Return your response in this EXACT format:

## Security Score: [0-100]
Brief one-line justification of the score.

## Risk Level: [CRITICAL | HIGH | MEDIUM | LOW | SAFE]

## Vulnerabilities Found

### [CRITICAL] Vulnerability Name
- **Line(s):** [line numbers if applicable]
- **Description:** What the vulnerability is
- **Impact:** What an attacker could do
- **Fix:** Exact code fix or recommendation

### [HIGH] Vulnerability Name
(repeat format for each vulnerability found)

## No Issues Found In
- List security categories that passed cleanly

## Quick Fix Summary
List the most urgent 3 fixes the developer should make immediately, numbered 1-2-3.

## Overall Recommendation
2-3 sentences summarizing the security posture of this code.

Code to scan:
\`\`\`${language.toLowerCase()}
${code}
\`\`\``;

    const result = await model.generateContent(prompt);
    const scanResult = result.response.text();

    // Extract score from response for frontend
    const scoreMatch = scanResult.match(/Security Score:\s*(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

    const riskMatch = scanResult.match(/Risk Level:\s*(CRITICAL|HIGH|MEDIUM|LOW|SAFE)/i);
    const riskLevel = riskMatch ? riskMatch[1].toUpperCase() : "UNKNOWN";

    res.json({ scanResult, score, riskLevel });
  } catch (err) {
    console.error("Security scan error:", err.message);
    res.status(500).json({ error: "Failed to run security scan. Please try again." });
  }
};