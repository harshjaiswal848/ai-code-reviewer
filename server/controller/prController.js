const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const parsePullRequestUrl = (url) => {
  if (!url) return null;
  const cleaned = url.trim().replace(/\/$/, "");
  const match = cleaned.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
    pullNumber: Number(match[3]),
  };
};

exports.reviewPullRequest = async (req, res) => {
  const { prUrl } = req.body;

  const parsed = parsePullRequestUrl(prUrl);
  if (!parsed) {
    return res.status(400).json({ error: "Please provide a valid GitHub Pull Request URL." });
  }

  const { owner, repo, pullNumber } = parsed;

  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ai-code-reviewer-pr-agent",
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  };

  const base = `https://api.github.com/repos/${owner}/${repo}`;

  try {
    const [prRes, filesRes] = await Promise.all([
      axios.get(`${base}/pulls/${pullNumber}`, { headers }),
      axios.get(`${base}/pulls/${pullNumber}/files?per_page=100`, { headers }),
    ]);

    const pr = prRes.data;
    const files = filesRes.data || [];

    const fileSummary = files
      .slice(0, 25)
      .map((f) => {
        const patch = f.patch ? f.patch.slice(0, 1200) : "(No patch available for binary/large file)";
        return `File: ${f.filename}\nStatus: ${f.status}\n+${f.additions} -${f.deletions}\nPatch:\n${patch}`;
      })
      .join("\n\n---\n\n");

    const prompt = `You are a senior software engineer reviewing a GitHub pull request.

PR Metadata:
- Title: ${pr.title}
- Author: ${pr.user?.login}
- Base branch: ${pr.base?.ref}
- Head branch: ${pr.head?.ref}
- Changed files: ${pr.changed_files}
- Additions: ${pr.additions}
- Deletions: ${pr.deletions}
- Description: ${pr.body || "No PR description."}

Changed file snippets:
${fileSummary}

Return your response in this EXACT format:

## Executive Summary
2-3 bullet points on intent and risk.

## Inline Review Comments
- [file_path:line] comment text (severity: Critical/Warning/Info)
- Include at least 5 comments if enough context exists.

## What Looks Good
- strengths in implementation

## Requested Changes
- must-fix changes before merge

## Suggested Follow-ups
- non-blocking improvements

## Final Verdict
One of: APPROVE | REQUEST_CHANGES | COMMENT_ONLY

## Ready-to-Paste GitHub Review Comment
A single concise paragraph suitable for GitHub review.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const ai = await model.generateContent(prompt);
    const review = ai.response.text();

    res.json({
      review,
      meta: {
        title: pr.title,
        author: pr.user?.login,
        state: pr.state,
        changedFiles: pr.changed_files,
        additions: pr.additions,
        deletions: pr.deletions,
        url: pr.html_url,
      },
    });
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404) {
      return res.status(404).json({ error: "Pull request not found or repository is private." });
    }
    console.error("PR reviewer error:", err.message);
    res.status(500).json({ error: "Failed to analyze PR. Please try again." });
  }
};
