require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/hero", require("./routes/heroRoutes"));
app.use("/api/skills", require("./routes/skillRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
