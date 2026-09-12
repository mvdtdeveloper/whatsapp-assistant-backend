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

// app.use("/webhook", webhookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/conversations", conversationRoutes);


app.get("/api/whatsapp/webhook", (req, res) => {

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("Webhook verification request received");

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    console.log("Webhook verified successfully ✅");

    return res.status(200).send(challenge);
  }

  console.log("Webhook verification failed ❌");

  return res.sendStatus(403);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
