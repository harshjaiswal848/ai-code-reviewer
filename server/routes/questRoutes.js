const express = require("express");
const router = express.Router();
const { generateQuest, evaluateQuest } = require("../controller/questController");

router.post("/start", generateQuest);
router.post("/evaluate", evaluateQuest);

module.exports = router;
