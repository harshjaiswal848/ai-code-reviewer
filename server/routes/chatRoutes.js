const express = require("express");
const router = express.Router();
const { chatWithCode } = require("../controller/chatController");

router.post("/", chatWithCode);

module.exports = router;