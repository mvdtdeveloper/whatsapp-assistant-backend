require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const conversationRoutes = require("./routes/conversationRoutes");

const app = express();

// ===============================
// DATABASE
// ===============================
connectDB();

// ===============================
// MIDDLEWARE
// ===============================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  }),
);

app.use(express.json());

// ===============================
// BASIC TEST ROUTE
// ===============================
app.get("/", (req, res) => {
  res.send("WhatsApp Assistant API is running ✅");
});

// ===============================
// NORMAL API ROUTES
// ===============================
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/conversations", conversationRoutes);

// ======================================================
// WHATSAPP WEBHOOK - META VERIFICATION
// GET /api/whatsapp/webhook
// ======================================================
app.get("/api/whatsapp/webhook", (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("\n========== WEBHOOK VERIFICATION ==========");
    console.log("Mode:", mode);
    console.log("Token received:", token);
    console.log("Challenge:", challenge);
    console.log("==========================================\n");

    if (!mode || !token) {
      return res.status(400).json({
        success: false,
        message: "Missing webhook verification parameters",
      });
    }

    if (
      mode === "subscribe" &&
      token === process.env.WHATSAPP_VERIFY_TOKEN
    ) {
      console.log("✅ WhatsApp webhook verified successfully");

      // Meta expects ONLY challenge as response
      return res.status(200).send(challenge);
    }

    console.log("❌ WhatsApp webhook verification failed");

    return res.sendStatus(403);
  } catch (error) {
    console.error("Webhook verification error:", error);

    return res.sendStatus(500);
  }
});

// ======================================================
// WHATSAPP WEBHOOK - RECEIVE MESSAGES
// POST /api/whatsapp/webhook
// ======================================================
app.post("/api/whatsapp/webhook", async (req, res) => {
  try {
    // IMPORTANT:
    // Send 200 quickly so Meta knows webhook received
    res.sendStatus(200);

    console.log("\n========== WHATSAPP WEBHOOK ==========");

    console.log(
      JSON.stringify(req.body, null, 2)
    );

    console.log("======================================\n");

    const body = req.body;

    // Check this is WhatsApp webhook
    if (body.object !== "whatsapp_business_account") {
      console.log("⚠️ Not a WhatsApp webhook");

      return;
    }

    const entry = body.entry?.[0];

    if (!entry) {
      console.log("⚠️ No entry found");

      return;
    }

    const change = entry.changes?.[0];

    if (!change) {
      console.log("⚠️ No changes found");

      return;
    }

    const value = change.value;

    if (!value) {
      console.log("⚠️ No value found");

      return;
    }

    // ===============================
    // MESSAGE RECEIVED
    // ===============================

    const message = value.messages?.[0];

    if (message) {
      const senderPhone = message.from;
      const messageId = message.id;
      const messageType = message.type;

      console.log("📩 NEW WHATSAPP MESSAGE");
      console.log("-----------------------");

      console.log("Sender:", senderPhone);
      console.log("Message ID:", messageId);
      console.log("Type:", messageType);

      // TEXT MESSAGE
      if (messageType === "text") {
        const text = message.text?.body;

        console.log("Message:", text);
      }

      // IMAGE MESSAGE
      if (messageType === "image") {
        console.log("Image ID:", message.image?.id);
      }

      // LOCATION MESSAGE
      if (messageType === "location") {
        console.log(
          "Latitude:",
          message.location?.latitude
        );

        console.log(
          "Longitude:",
          message.location?.longitude
        );
      }

      console.log("-----------------------");

      // Later:
      // employee lookup
      // conversation handling
      // question handling
      // automatic reply

      return;
    }

    // ===============================
    // MESSAGE STATUS
    // delivered/read/sent
    // ===============================

    const status = value.statuses?.[0];

    if (status) {
      console.log("📊 MESSAGE STATUS UPDATE");

      console.log("Message ID:", status.id);
      console.log("Status:", status.status);
      console.log("Recipient:", status.recipient_id);

      return;
    }

    console.log("ℹ️ Webhook received but no message/status found");
  } catch (error) {
    console.error("❌ WhatsApp webhook error:", error);
  }
});

// ===============================
// 404
// ===============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ===============================
// SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n======================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `📡 Webhook: http://localhost:${PORT}/api/whatsapp/webhook`,
  );
  console.log("======================================\n");
});