const express = require("express");
const router = express.Router();
const { generateTests } = require("../controller/testController");

router.post("/generate", generateTests);

module.exports = router;
