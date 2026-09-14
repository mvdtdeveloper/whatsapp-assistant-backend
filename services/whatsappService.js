// const axios = require("axios");

// const API_VERSION = process.env.WHATSAPP_API_VERSION || "v20.0";
// const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
// const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

// /**
//  * Send a plain text WhatsApp message.
//  * @param {string} to - recipient phone number in international format, no "+" (e.g. 919876543210)
//  * @param {string} body - message text
//  */
// async function sendTextMessage(to, body) {
//   try {
//     const res = await axios.post(
//       BASE_URL,
//       {
//         messaging_product: "whatsapp",
//         recipient_type: "individual",
//         to,
//         type: "text",
//         text: { preview_url: false, body },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${ACCESS_TOKEN}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     return res.data;
//   } catch (err) {
//     console.error(
//       "❌ Failed to send WhatsApp message:",
//       err.response ? JSON.stringify(err.response.data) : err.message
//     );
//     throw err;
//   }
// }

// /**
//  * Send a message with quick-reply style numbered options (plain text based,
//  * works without needing a pre-approved WhatsApp template).
//  * options: array of strings
//  */
// async function sendNumberedOptions(to, question, options = []) {
//   let body = question;
//   if (options.length) {
//     body +=
//       "\n\n" + options.map((opt, i) => `${i + 1}. ${opt}`).join("\n") +
//       "\n\n(Reply with the number or type your answer)";
//   }
//   return sendTextMessage(to, body);
// }

// module.exports = { sendTextMessage, sendNumberedOptions };
