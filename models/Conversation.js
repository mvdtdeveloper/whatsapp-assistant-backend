const mongoose = require("mongoose");

// One Conversation document = one "session" (e.g. one day's report) for a user.
const answerSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, default: "" },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    phone: { type: String, required: true },
    name: { type: String, default: "" },
    role: { type: String, enum: ["labour", "supervisor"], required: true },
    status: {
      type: String,
      enum: ["in_progress", "completed", "abandoned"],
      default: "in_progress",
    },
    currentQuestionIndex: { type: Number, default: 0 },
    answers: [answerSchema],
    summary: { type: String, default: "" },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
