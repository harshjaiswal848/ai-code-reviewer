const supabase = require("../supabaseClient");

exports.getAnalytics = async (req, res) => {
  const userId = req.user.id;

  try {
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("language, mode, created_at, result")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    if (!reviews || reviews.length === 0) {
      return res.json({ empty: true });
    }

    // ── Language breakdown ──
    const languageCount = {};
    reviews.forEach(r => {
      const lang = r.language || "Unknown";
      languageCount[lang] = (languageCount[lang] || 0) + 1;
    });
    const languageData = Object.entries(languageCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // ── Mode breakdown ──
    const modeCount = { review: 0, fix: 0, optimize: 0, explain: 0 };
    reviews.forEach(r => {
      const m = r.mode || "review";
      modeCount[m] = (modeCount[m] || 0) + 1;
    });
    const modeData = Object.entries(modeCount).map(([name, count]) => ({ name, count }));

    // ── Reviews over time (last 30 days by day) ──
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const dailyCount = {};

    reviews.forEach(r => {
      const date = new Date(r.created_at);
      if (date >= thirtyDaysAgo) {
        const key = date.toISOString().split("T")[0];
        dailyCount[key] = (dailyCount[key] || 0) + 1;
      }
    });

    // Fill in missing days with 0
    const activityData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      activityData.push({ date: key, count: dailyCount[key] || 0 });
    }

    // ── Extract quality scores from result text ──
    const scores = [];
    reviews.forEach(r => {
      const match = r.result?.match(/Code Quality Score[:\s]+(\d+)/i);
      if (match) scores.push(parseInt(match[1]));
    });
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    // ── Most active day ──
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayCount = [0, 0, 0, 0, 0, 0, 0];
    reviews.forEach(r => {
      const day = new Date(r.created_at).getDay();
      dayCount[day]++;
    });
    const mostActiveDay = dayNames[dayCount.indexOf(Math.max(...dayCount))];

    // ── This week vs last week ──
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);
    const thisWeek = reviews.filter(r => new Date(r.created_at) >= oneWeekAgo).length;
    const lastWeek = reviews.filter(r => {
      const d = new Date(r.created_at);
      return d >= twoWeeksAgo && d < oneWeekAgo;
    }).length;

    res.json({
      empty: false,
      totalReviews: reviews.length,
      avgScore,
      mostActiveDay,
      thisWeek,
      lastWeek,
      weekChange: lastWeek === 0 ? null : Math.round(((thisWeek - lastWeek) / lastWeek) * 100),
      languageData,
      modeData,
      activityData,
      topLanguage: languageData[0]?.name || "N/A",
    });
  } catch (err) {
    console.error("Analytics error:", err.message);
    res.status(500).json({ error: "Failed to fetch analytics." });
  }
};