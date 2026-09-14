require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// =====================================================
// CONFIG
// =====================================================

const PORT = process.env.PORT || 5000;

const GRAPH_API_VERSION =
  process.env.GRAPH_API_VERSION || "v24.0";

const VERIFY_TOKEN =
  process.env.WHATSAPP_VERIFY_TOKEN;

const ACCESS_TOKEN =
  process.env.WHATSAPP_ACCESS_TOKEN;

const PHONE_NUMBER_ID =
  process.env.WHATSAPP_PHONE_NUMBER_ID;

const WABA_ID =
  process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Optional request logger
app.use((req, res, next) => {
  console.log(
    `\n[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );

  next();
});


// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
  res.send("MVDT WhatsApp Assistant API is running ✅");
});


// =====================================================
// 1. WEBHOOK VERIFICATION
// Meta calls this using GET
// =====================================================

app.get("/webhook", (req, res) => {
  console.log("====================================");
  console.log("🔥 META GET WEBHOOK HIT");
  console.log("QUERY:", req.query);

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("MODE:", mode);
  console.log("VERIFY TOKEN:", token);
  console.log("CHALLENGE:", challenge);

  if (
    mode === "subscribe" &&
    token === VERIFY_TOKEN
  ) {
    console.log("✅ META WEBHOOK VERIFIED");

    return res
      .status(200)
      .send(String(challenge));
  }

  console.log("❌ WEBHOOK VERIFICATION FAILED");

  return res.sendStatus(403);
});


// =====================================================
// 2. SUBSCRIBE APP TO WABA
// Run this once after webhook configuration
// =====================================================

// async function subscribeAppToWABA() {
//   try {
//     if (!WABA_ID) {
//       throw new Error(
//         "WHATSAPP_BUSINESS_ACCOUNT_ID is missing"
//       );
//     }

//     if (!ACCESS_TOKEN) {
//       throw new Error(
//         "WHATSAPP_ACCESS_TOKEN is missing"
//       );
//     }

//     const url =
//       `https://graph.facebook.com/${GRAPH_API_VERSION}` +
//       `/${WABA_ID}/subscribed_apps`;

//     console.log("====================================");
//     console.log("🔔 SUBSCRIBING APP TO WABA");
//     console.log("WABA ID:", WABA_ID);
//     console.log("====================================");

//     const response = await fetch(url, {
//       method: "POST",

//       headers: {
//         Authorization: `Bearer ${ACCESS_TOKEN}`,
//         "Content-Type": "application/json",
//       },
//     });

//     const data = await response.json();

//     console.log(
//       "WABA SUBSCRIBE RESPONSE:",
//       JSON.stringify(data, null, 2)
//     );

//     if (!response.ok) {
//       throw new Error(
//         data?.error?.message ||
//           "WABA subscription failed"
//       );
//     }

//     console.log("✅ WABA SUBSCRIBED SUCCESSFULLY");

//     return data;

//   } catch (error) {
//     console.error(
//       "❌ WABA SUBSCRIPTION ERROR:",
//       error.message
//     );

//     throw error;
//   }
// }


// =====================================================
// 3. CHECK WABA SUBSCRIPTION
// =====================================================

// async function getWabaSubscriptions() {
//   try {
//     const url =
//       `https://graph.facebook.com/${GRAPH_API_VERSION}` +
//       `/${WABA_ID}/subscribed_apps`;

//     const response = await fetch(url, {
//       method: "GET",

//       headers: {
//         Authorization: `Bearer ${ACCESS_TOKEN}`,
//       },
//     });

//     const data = await response.json();

//     console.log(
//       "WABA SUBSCRIPTIONS:",
//       JSON.stringify(data, null, 2)
//     );

//     return {
//       ok: response.ok,
//       data,
//     };

//   } catch (error) {
//     console.error(
//       "❌ GET WABA SUBSCRIPTION ERROR:",
//       error
//     );

//     throw error;
//   }
// }


// =====================================================
// OPTIONAL SETUP ENDPOINTS
// Remove/protect these after setup
// =====================================================

// app.get("/setup/waba-status", async (req, res) => {
//   try {
//     const result =
//       await getWabaSubscriptions();

//     return res
//       .status(result.ok ? 200 : 400)
//       .json(result.data);

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// });


// app.post("/setup/subscribe-waba", async (req, res) => {
//   try {
//     const data =
//       await subscribeAppToWABA();

//     return res.status(200).json({
//       success: true,
//       meta: data,
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// });


// =====================================================
// 4. SEND WHATSAPP MESSAGE
// =====================================================

async function sendWhatsAppMessage(to, message) {
  try {
    if (!PHONE_NUMBER_ID) {
      throw new Error(
        "WHATSAPP_PHONE_NUMBER_ID missing"
      );
    }

    if (!ACCESS_TOKEN) {
      throw new Error(
        "WHATSAPP_ACCESS_TOKEN missing"
      );
    }

    const url =
      `https://graph.facebook.com/${GRAPH_API_VERSION}` +
      `/${PHONE_NUMBER_ID}/messages`;

    console.log("------------------------------------");
    console.log("📤 SENDING WHATSAPP MESSAGE");
    console.log("TO:", to);
    console.log("------------------------------------");

    const response = await fetch(url, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        messaging_product: "whatsapp",

        recipient_type: "individual",

        to: to,

        type: "text",

        text: {
          body: message,
        },
      }),
    });

    const data = await response.json();

    console.log(
      "META SEND RESPONSE:",
      JSON.stringify(data, null, 2)
    );

    if (!response.ok) {
      console.error(
        "❌ MESSAGE SEND FAILED"
      );

      return {
        success: false,
        data,
      };
    }

    console.log(
      "✅ MESSAGE SENT SUCCESSFULLY"
    );

    return {
      success: true,
      data,
    };

  } catch (error) {
    console.error(
      "❌ SEND WHATSAPP ERROR:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
}


// =====================================================
// 5. PROCESS TEXT MESSAGE
// =====================================================

async function processTextMessage({
  senderPhone,
  senderName,
  text,
}) {
  console.log("====================================");
  console.log("👤 NAME:", senderName);
  console.log("📱 PHONE:", senderPhone);
  console.log("💬 MESSAGE:", text);
  console.log("====================================");


  // =============================================
  // HI / HII / HIII
  // =============================================

  if (/^hi+$/i.test(text)) {
    await sendWhatsAppMessage(
      senderPhone,
      `Hello ${senderName} 👋

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


  // =============================================
  // OPTION 1
  // =============================================

  if (text === "1") {
    await sendWhatsAppMessage(
      senderPhone,
      `📋 Daily Work Reporting

Please enter your Route / Job ID.`
    );

    return;
  }


  // =============================================
  // OPTION 2
  // =============================================

  if (text === "2") {
    await sendWhatsAppMessage(
      senderPhone,
      `⚠️ Site Issue / Delay

Please describe your issue.`
    );

    return;
  }


  // =============================================
  // OPTION 3
  // =============================================

  if (text === "3") {
    await sendWhatsAppMessage(
      senderPhone,
      `📦 Material Requirement

Please enter your Route / Job ID.`
    );

    return;
  }


  // =============================================
  // OPTION 4
  // =============================================

  if (text === "4") {
    await sendWhatsAppMessage(
      senderPhone,
      `✅ Work Completion

Please enter your Route / Job ID.`
    );

    return;
  }


  // =============================================
  // OPTION 5
  // =============================================

  if (text === "5") {
    await sendWhatsAppMessage(
      senderPhone,
      `🕐 Attendance

Please enter your Employee ID.`
    );

    return;
  }


  // =============================================
  // DEFAULT
  // =============================================

  await sendWhatsAppMessage(
    senderPhone,
    `Sorry ${senderName}, I didn't understand that.

Please type "Hi" to start.`
  );
}


// =====================================================
// 6. PROCESS META WEBHOOK
// =====================================================

async function processWhatsAppWebhook(body) {
  try {
    if (
      body.object !==
      "whatsapp_business_account"
    ) {
      console.log(
        "ℹ️ Ignoring non-WhatsApp webhook"
      );

      return;
    }

    const entries = body.entry || [];

    for (const entry of entries) {

      const changes = entry.changes || [];

      for (const change of changes) {

        if (change.field !== "messages") {
          continue;
        }

        const value = change.value;

        if (!value) {
          continue;
        }


        // ==========================================
        // MESSAGE STATUS EVENTS
        // ==========================================

        if (value.statuses?.length) {

          for (const status of value.statuses) {
            console.log(
              "📊 MESSAGE STATUS:",
              status.status
            );

            console.log(
              "MESSAGE ID:",
              status.id
            );
          }

          continue;
        }


        // ==========================================
        // INCOMING USER MESSAGES
        // ==========================================

        const messages =
          value.messages || [];

        for (const message of messages) {

          const senderPhone =
            message.from;

          const contact =
            value.contacts?.find(
              (item) =>
                item.wa_id === senderPhone
            ) || value.contacts?.[0];

          const senderName =
            contact?.profile?.name ||
            "User";

          console.log(
            "📨 MESSAGE TYPE:",
            message.type
          );


          // ======================================
          // TEXT
          // ======================================

          if (message.type === "text") {

            const text =
              message.text?.body?.trim() ||
              "";

            await processTextMessage({
              senderPhone,
              senderName,
              text,
            });

            continue;
          }


          // ======================================
          // UNSUPPORTED MESSAGE TYPE
          // ======================================

          console.log(
            "Unsupported message type:",
            message.type
          );

          await sendWhatsAppMessage(
            senderPhone,
            `Currently I can process text messages only.

              Please type "Hi" to start.`
          );
        }
      }
    }

  } catch (error) {
    console.error(
      "❌ WEBHOOK PROCESSING ERROR:",
      error
    );
  }
}


// =====================================================
// 7. RECEIVE REAL META WEBHOOK
// =====================================================

app.post("/webhook", (req, res) => {

  console.log("\n\n====================================");
  console.log("🔥 WHATSAPP POST WEBHOOK RECEIVED");
  console.log("====================================");

  console.log(
    JSON.stringify(req.body, null, 2)
  );


  /*
   * VERY IMPORTANT
   *
   * Give Meta 200 immediately.
   *
   * Do not wait for Graph API,
   * MongoDB, chatbot logic, etc.
   */

  res.sendStatus(200);


  /*
   * Continue processing after
   * acknowledging Meta.
   */

  processWhatsAppWebhook(req.body)
    .catch((error) => {
      console.error(
        "Webhook async error:",
        error
      );
    });
});


// =====================================================
// 8. JSON ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {

  console.error("❌ EXPRESS ERROR:", err);

  if (
    err instanceof SyntaxError &&
    err.status === 400
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON body",
      error: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});


// =====================================================
// SERVER
// =====================================================

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );

  console.log(
    `Webhook: /webhook`
  );
});