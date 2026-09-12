// Run with: npm run seed
// Seeds default question sets for Labour and Supervisor, and one sample user.
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Question = require("../models/Question");
const User = require("../models/User");

const labourQuestions = [
  "Report and issue? (Any issue at your work today?)",
  "Material consumption? (What material did you use today?)",
  "Work report? (What work did you complete today?)",
  "Site status? (What is the current status of the site?)",
  "Help / Anything else you want to report?",
];

const supervisorQuestions = [
  "Team attendance? (How many labourers were present today?)",
  "Progress review? (What is today's progress on the assigned work?)",
  "Any issue escalated today?",
  "Safety compliance check done? (Yes/No + remarks)",
  "Any material or resource requirement for tomorrow?",
];

async function seed() {
  await connectDB();

  await Question.deleteMany({});
  await Question.insertMany(
    labourQuestions.map((text, i) => ({ role: "labour", text, order: i + 1 }))
  );
  await Question.insertMany(
    supervisorQuestions.map((text, i) => ({ role: "supervisor", text, order: i + 1 }))
  );

  const existing = await User.findOne({ phone: "919999999999" });
  if (!existing) {
    await User.create({
      name: "Ramesh",
      phone: "919999999999", // replace with a real WhatsApp test number
      role: "labour",
      site: "Site A",
    });
  }

  console.log("✅ Seed complete: questions + sample user created.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
