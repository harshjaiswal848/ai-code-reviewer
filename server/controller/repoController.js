const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Extract owner and repo name from GitHub URL
const parseGitHubUrl = (url) => {
  try {
    const cleaned = url.trim().replace(/\.git$/, "").replace(/\/$/, "");
    const match = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  } catch {
    return null;
  }
};

exports.analyzeRepo = async (req, res) => {
  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: "No repository URL provided." });
  }

  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return res.status(400).json({ error: "Invalid GitHub URL. Please provide a valid public GitHub repository link." });
  }

  const { owner, repo } = parsed;
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ai-code-reviewer",
    ...(process.env.GITHUB_TOKEN && {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    }),
  };

  try {
    // Fetch repo metadata, license, README in parallel
    const [repoRes, readmeRes, languagesRes] = await Promise.allSettled([
      axios.get(baseUrl, { headers }),
      axios.get(`${baseUrl}/readme`, { headers }),
      axios.get(`${baseUrl}/languages`, { headers }),
    ]);

    // If repo fetch failed (private or doesn't exist)
    if (repoRes.status === "rejected") {
      const status = repoRes.reason?.response?.status;
      if (status === 404) {
        return res.status(404).json({ error: "Repository not found. It may be private or the URL is incorrect." });
      }
      return res.status(500).json({ error: "Failed to fetch repository data from GitHub." });
    }

    const repoData = repoRes.value.data;

    // Decode README (base64)
    let readmeText = "No README found.";
    if (readmeRes.status === "fulfilled") {
      try {
        readmeText = Buffer.from(readmeRes.value.data.content, "base64").toString("utf-8").slice(0, 3000);
      } catch {
        readmeText = "Could not decode README.";
      }
    }

    // Languages
    const languages = languagesRes.status === "fulfilled"
      ? Object.keys(languagesRes.value.data).join(", ")
      : "Unknown";

    // Build context for Gemini
    const licenseInfo = repoData.license
      ? `${repoData.license.name} (SPDX: ${repoData.license.spdx_id})`
      : "No license specified";

    const prompt = `You are a software licensing and open-source compliance expert. Analyze the following GitHub repository and give a clear, developer-friendly verdict on whether it is safe and legal to copy, fork, use, or build upon.

Repository Info:
- Name: ${repoData.full_name}
- Description: ${repoData.description || "No description"}
- License: ${licenseInfo}
- Stars: ${repoData.stargazers_count}
- Forks: ${repoData.forks_count}
- Open Issues: ${repoData.open_issues_count}
- Primary Languages: ${languages}
- Created: ${repoData.created_at?.split("T")[0]}
- Last Updated: ${repoData.updated_at?.split("T")[0]}
- Topics: ${(repoData.topics || []).join(", ") || "None"}
- Is Fork: ${repoData.fork}
- Is Archived: ${repoData.archived}

README (first 3000 chars):
${readmeText}

Please respond in this EXACT format:

## Verdict
[One of: ✅ Safe to Use | ⚠️ Use with Caution | ❌ Not Recommended]

## License Analysis
Explain the license and what it allows/restricts. If no license, explain the legal implications.

## What You Can Do
- List specific permissions (use, modify, distribute, commercial use, etc.)

## What You Cannot Do
- List specific restrictions or conditions

## Attribution Required?
Yes/No — explain what credit is needed if any.

## Commercial Use Allowed?
Yes/No/Conditional — explain.

## Overall Risk Level
[Low / Medium / High] — brief reason

## Recommendation
2-3 sentence plain-English summary of whether a developer should use this repo and any precautions to take.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const geminiResult = await model.generateContent(prompt);
    const analysis = geminiResult.response.text();

    res.json({
      analysis,
      meta: {
        name: repoData.full_name,
        description: repoData.description || "No description",
        license: licenseInfo,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        languages,
        lastUpdated: repoData.updated_at?.split("T")[0],
        isArchived: repoData.archived,
        isFork: repoData.fork,
        url: repoData.html_url,
      },
    });

  } catch (err) {
    console.error("Repo analysis error:", err.message);
    res.status(500).json({ error: "Failed to analyze repository. Please try again." });
  }
};