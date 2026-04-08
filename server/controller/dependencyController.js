const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const parseDependencies = (rawDependencies, packageJsonText) => {
  if (rawDependencies && typeof rawDependencies === "object") {
    return rawDependencies;
  }

  if (!packageJsonText) return {};

  try {
    const parsed = JSON.parse(packageJsonText);
    return {
      ...(parsed.dependencies || {}),
      ...(parsed.devDependencies || {}),
    };
  } catch {
    return {};
  }
};

exports.analyzeDependencies = async (req, res) => {
  const { dependencies, packageJsonText } = req.body;

  const deps = parseDependencies(dependencies, packageJsonText);
  const depEntries = Object.entries(deps).slice(0, 60);

  if (depEntries.length === 0) {
    return res.status(400).json({ error: "No dependencies found. Provide dependencies object or package.json text." });
  }

  try {
    const checks = await Promise.all(depEntries.map(async ([name, versionRange]) => {
      try {
        const response = await axios.get(`https://registry.npmjs.org/${encodeURIComponent(name)}`, { timeout: 10000 });
        const latest = response.data?.["dist-tags"]?.latest || "unknown";
        const modified = response.data?.time?.modified || null;
        return { name, versionRange, latest, modified, status: "ok" };
      } catch {
        return { name, versionRange, latest: "unknown", modified: null, status: "lookup_failed" };
      }
    }));

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const prompt = `You are a dependency security analyst.\n\nAnalyze this dependency inventory and return risk insights.\n\nDependencies:\n${JSON.stringify(checks, null, 2)}\n\nReturn response in EXACT format:\n\n## Dependency Risk Score\n[0-100]\n\n## High-Risk Dependencies\n- name: reason\n\n## Outdated Dependencies\n- name: current range -> latest\n\n## Recommended Upgrades\n- prioritized update plan\n\n## Supply Chain Recommendations\n- practical checks for integrity, pinning, and review policy.`;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    const scoreMatch = analysis.match(/Dependency Risk Score\s*[:\]]\s*(\d+)/i);
    const riskScore = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

    res.json({ analysis, riskScore, dependenciesChecked: checks.length, checks });
  } catch (err) {
    console.error("Dependency analysis error:", err.message);
    res.status(500).json({ error: "Failed to analyze dependencies." });
  }
};
