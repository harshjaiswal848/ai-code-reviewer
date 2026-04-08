const express = require("express");
const router = express.Router();
const { reviewPullRequest, postPullRequestReview } = require("../controller/prController");

router.post("/review", reviewPullRequest);
router.post("/post-review", postPullRequestReview);

module.exports = router;
