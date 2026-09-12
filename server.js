// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const connectDB = require("./config/db");

// const webhookRoutes = require("./routes/webhookRoutes");
// const userRoutes = require("./routes/userRoutes");
// const questionRoutes = require("./routes/questionRoutes");
// const conversationRoutes = require("./routes/conversationRoutes");

// const app = express();

// connectDB();

// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "*",
//   }),
// );
// app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("WhatsApp Assistant API is running ✅");
// });

// // app.use("/webhook", webhookRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/questions", questionRoutes);
// app.use("/api/conversations", conversationRoutes);

// app.get("/api/whatsapp/webhook", (req, res) => {
//   const mode = req.query["hub.mode"];
//   const token = req.query["hub.verify_token"];
//   const challenge = req.query["hub.challenge"];

//   console.log("Webhook verification request received");

//   if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
//     console.log("Webhook verified successfully ✅");

//     return res.status(200).send(challenge);
//   }

//   console.log("Webhook verification failed ❌");

//   return res.sendStatus(403);
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));



import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5000;


// --------------------------------------
// 1. META WEBHOOK VERIFICATION
// --------------------------------------
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


// --------------------------------------
// 2. RECEIVE WHATSAPP MESSAGE
// --------------------------------------
app.post("/api/whatsapp/webhook", async (req, res) => {

  try {

    console.log(
      "WhatsApp webhook received:",
      JSON.stringify(req.body, null, 2)
    );

    const value =
      req.body?.entry?.[0]?.changes?.[0]?.value;

    const message =
      value?.messages?.[0];

    if (message) {

      const phoneNumber = message.from;

      const messageType = message.type;

      console.log("Sender:", phoneNumber);
      console.log("Message Type:", messageType);

      if (messageType === "text") {

        const text = message.text?.body;

        console.log("Message:", text);

        await sendWhatsAppMessage(
          phoneNumber,
          `Hello 👋

Welcome to MVDT Connect Assistant.

You sent: ${text}`
        );

      }

    }

    // IMPORTANT:
    // Always acknowledge webhook quickly
    return res.sendStatus(200);

  } catch (error) {

    console.error("Webhook Error:", error);

    return res.sendStatus(200);
  }

});


// --------------------------------------
// 3. SEND WHATSAPP MESSAGE
// --------------------------------------
async function sendWhatsAppMessage(to, text) {

  // Use the Graph API version shown in your Meta setup.
  const GRAPH_API_VERSION = "v24.0";

  const url =
    `https://graph.facebook.com/${GRAPH_API_VERSION}/` +
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

      to: to,

      type: "text",

      text: {
        body: text,
      },

    }),

  });

  const data = await response.json();

  console.log("Send WhatsApp Response:", data);

  if (!response.ok) {

    console.error(
      "WhatsApp Send Error:",
      JSON.stringify(data, null, 2)
    );

  }

  return data;
}


app.listen(PORT, () => {

  console.log(
    `MVDT WhatsApp server running on port ${PORT}`
  );

});