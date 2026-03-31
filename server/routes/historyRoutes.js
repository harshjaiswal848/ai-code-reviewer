const express = require("express");
const router = express.Router();
const { getHistory, deleteHistoryItem } = require("../controller/historyController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getHistory);
router.delete("/:id", authMiddleware, deleteHistoryItem);

module.exports = router;