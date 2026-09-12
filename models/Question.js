const mongoose = require("mongoose");

// Question sets are role-based and ordered. Admin can add/edit/reorder/deactivate
// from the dashboard without touching code.
const questionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["labour", "supervisor"],
      required: true,
    },
    text: { type: String, required: true, trim: true },
    order: { type: Number, required: true, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

questionSchema.index({ role: 1, order: 1 });

module.exports = mongoose.model("Question", questionSchema);
