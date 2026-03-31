const express = require("express");
const cors = require("cors");
require("dotenv").config();

const reviewRoute = require("./routes/reviewRoute");
const authRoutes = require("./routes/authRoutes");
const historyRoutes = require("./routes/historyRoutes");
const repoRoutes = require("./routes/repoRoutes");

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

app.use("/review", reviewRoute);
app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/repo", repoRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});