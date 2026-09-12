const mongoose = require("mongoose");

// A "User" here is a Labour or Supervisor who talks to the WhatsApp bot.
// Registered by the Admin from the React dashboard before they can chat.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      // Store in WhatsApp format e.g. 919876543210 (no + no spaces)
    },
    role: {
      type: String,
      enum: ["labour", "supervisor"],
      required: true,
    },
    site: { type: String, trim: true, default: "" }, // optional: site/project name
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
