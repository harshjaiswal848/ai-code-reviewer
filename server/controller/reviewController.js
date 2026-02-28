exports.reviewCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.json({ feedback: "No code provided" });
    }

    // Fake AI response for demo
    res.json({
      feedback: `
AI Code Review:

✔ Syntax looks correct
✔ Try better variable naming
✔ Add comments for readability
✔ Optimize loops if possible
 
`
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ feedback: "Backend error" });
  }
};