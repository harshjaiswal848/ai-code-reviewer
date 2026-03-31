const supabase = require("../supabaseClient");

const getHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ history: data });
  } catch (err) {
    console.error("Get history error:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

const deleteHistoryItem = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete history error:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
};

module.exports = { getHistory, deleteHistoryItem };