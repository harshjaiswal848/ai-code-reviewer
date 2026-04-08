const express = require("express");
const router = express.Router();
const { analyzeDependencies } = require("../controller/dependencyController");

router.post("/analyze", analyzeDependencies);

module.exports = router;
