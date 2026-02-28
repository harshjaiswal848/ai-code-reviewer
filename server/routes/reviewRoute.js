const express = require("express");
const router = express.Router();
const { reviewCode } = require("../controller/reviewController");

router.post("/", reviewCode);

module.exports = router;