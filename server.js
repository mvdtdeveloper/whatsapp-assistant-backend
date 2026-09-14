require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const conversationRoutes = require("./routes/conversationRoutes");

const app = express();

connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL || "*",
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("WhatsApp Assistant API is running ✅");
});

app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/conversations", conversationRoutes);


// ================================
// WEBHOOK VERIFY
// ================================

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    console.log("*********************************************Webhook verified ✅");

    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});


// ================================
// SEND WHATSAPP MESSAGE
// ================================

async function sendWhatsAppMessage(to, message) {
  try {
    const url =
      `https://graph.facebook.com/v24.0/` +
      `${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const response = await fetch(url, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,

        type: "text",

        text: {
          body: message,
        },
      }),
    });

    const data = await response.json();

    console.log("WhatsApp API response:", data);

    return data;

  } catch (error) {
    console.error("Send WhatsApp error:", error);
  }
}


// ================================
// RECEIVE WHATSAPP MESSAGE
// ================================

app.post("/webhook", async (req, res) => {
  try {

    // Always acknowledge webhook
    res.sendStatus(200);

    const body = req.body;

    console.log(
      "Webhook:",
      JSON.stringify(body, null, 2)
    );

    if (
      body.object !== "whatsapp_business_account"
    ) {
      return;
    }

    const value =
      body.entry?.[0]?.changes?.[0]?.value;

    const message =
      value?.messages?.[0];

    if (!message) {
      return;
    }

    const senderPhone = message.from;

    const messageType = message.type;

    console.log("Sender:", senderPhone);
    console.log("Type:", messageType);


    // ================================
    // TEXT MESSAGE
    // ================================

    if (messageType === "text") {

      const text =
        message.text?.body?.trim() || "";

      console.log("Message:", text);


      // Hi / Hii / Hiii / Hiiii
      if (/^hi+$/i.test(text)) {

        await sendWhatsAppMessage(
          senderPhone,
          `Hello 👋

Welcome to MVDT Connect Assistant.

Please select an option:

1️⃣ Daily Work Reporting
2️⃣ Site Issue / Delay
3️⃣ Material Requirement
4️⃣ Work Completion
5️⃣ Attendance

Reply with option number.`
        );

        return;
      }


      // Option 1
      if (text === "1") {

        await sendWhatsAppMessage(
          senderPhone,
          `📋 Daily Work Reporting

Please enter your Route / Job ID.`
        );

        return;
      }


      // Option 2
      if (text === "2") {

        await sendWhatsAppMessage(
          senderPhone,
          `⚠️ Site Issue / Delay

Please describe your issue.`
        );

        return;
      }


      // Default reply
      await sendWhatsAppMessage(
        senderPhone,
        `Sorry, I didn't understand.

Please type "Hi" to start.`
      );
    }

  } catch (error) {
    console.error(
      "Webhook processing error:",
      error
    );
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});