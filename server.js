require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const webhookRoutes = require("./routes/webhookRoutes");
const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const conversationRoutes = require("./routes/conversationRoutes");

const app = express();

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("WhatsApp Assistant API is running ✅");
});

app.use("/webhook", webhookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/conversations", conversationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
