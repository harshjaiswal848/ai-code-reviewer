const express = require("express");
const router = express.Router();
const { reviewCode } = require("../controller/reviewController");
const authMiddleware = require("../middleware/authMiddleware");

// optionalAuth — attaches user to req if token exists, but doesn't block if missing
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(); // no token, continue as guest
  }
  const jwt = require("jsonwebtoken");
  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // invalid token — treat as guest
  }
  next();
};

router.post("/", optionalAuth, reviewCode);

module.exports = router;