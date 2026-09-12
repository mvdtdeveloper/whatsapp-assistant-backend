const { handleIncomingMessage } = require("../services/conversationEngine");

// GET /webhook  -> Meta calls this once to verify your endpoint
function verifyWebhook(req, res) {
  console.log("run...........webhook");
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}

// POST /webhook -> Meta calls this for every inbound message/status update
async function receiveWebhook(req, res) {
  try {
    // Always ack immediately so Meta doesn't retry / timeout
    res.sendStatus(200);

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) {
      // Could be a status update (sent/delivered/read) - ignore
      return;
    }

    const from = message.from; // sender phone, e.g. "919876543210"
    const profileName = value?.contacts?.[0]?.profile?.name || "";

    let text = "";
    if (message.type === "text") {
      text = message.text.body;
    } else if (message.type === "interactive") {
      text =
        message.interactive?.button_reply?.title ||
        message.interactive?.list_reply?.title ||
        "";
    } else {
      // image/audio/document/location etc - not part of this flow
      text = `[unsupported message type: ${message.type}]`;
    }

    await handleIncomingMessage(from, text, profileName);
  } catch (err) {
    console.error("❌ Error handling webhook:", err.message);
  }
}

module.exports = { verifyWebhook, receiveWebhook };
