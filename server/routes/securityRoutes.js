const express = require("express");
const router = express.Router();
const { scanSecurity } = require("../controller/securityController");

router.post("/scan", scanSecurity);

module.exports = router;