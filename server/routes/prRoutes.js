const express = require("express");
const router = express.Router();
const { reviewPullRequest } = require("../controller/prController");

router.post("/review", reviewPullRequest);

module.exports = router;
