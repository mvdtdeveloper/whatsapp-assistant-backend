const User = require("../models/User");
const Question = require("../models/Question");
const Conversation = require("../models/Conversation");
const { sendTextMessage } = require("./whatsappService");

const GREETINGS = ["hi", "hii", "hiii", "hello", "helo", "hey", "start", "menu"];
const HELP_WORDS = ["help"];

function normalize(text) {
  return (text || "").trim().toLowerCase();
}

function isGreeting(text) {
  const t = normalize(text);
  return GREETINGS.includes(t);
}

/**
 * Fetch the active, ordered question list for a role.
 */
async function getQuestionsForRole(role) {
  return Question.find({ role, active: true }).sort({ order: 1 });
}

/**
 * Build a human-readable summary once a conversation is completed.
 */
function buildSummary(user, conversation, answers) {
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const lines = [
    `📋 *Daily Report Summary*`,
    `Name: ${user.name}`,
    `Role: ${user.role === "labour" ? "Labour" : "Supervisor"}`,
    user.site ? `Site: ${user.site}` : null,
    `Date: ${dateStr}`,
    ``,
  ].filter(Boolean);

  answers.forEach((a, idx) => {
    lines.push(`${idx + 1}. ${a.question}`);
    lines.push(`   ➜ ${a.answer || "(no answer)"}`);
  });

  return lines.join("\n");
}

/**
 * Core entry point: called for every inbound WhatsApp text message.
 * phone: sender's WhatsApp number (string)
 * text: message body (string)
 * profileName: WhatsApp display name of sender (optional, used only as fallback)
 */
async function handleIncomingMessage(phone, text, profileName) {
  const user = await User.findOne({ phone, active: true });

  if (!user) {
    await sendTextMessage(
      phone,
      "👋 Hi, this number is not registered with us yet. Please contact your admin/office to get registered before you can submit reports here."
    );
    return;
  }

  // Is there an open (in_progress) session for this user?
  let conversation = await Conversation.findOne({
    user: user._id,
    status: "in_progress",
  }).sort({ createdAt: -1 });

  const msg = normalize(text);

  // Handle "help" any time
  if (HELP_WORDS.includes(msg)) {
    await sendTextMessage(
      phone,
      `ℹ️ *Help*\nSend "Hii" anytime to start today's report.\nAnswer each question as it comes — one at a time.\nType "help" any time to see this message again.`
    );
    return;
  }

  // Greeting -> (re)start a session
  if (isGreeting(text)) {
    const questions = await getQuestionsForRole(user.role);

    if (!questions.length) {
      await sendTextMessage(
        phone,
        `Hello ${user.name} 👋\nNo questions have been configured for your role yet. Please contact admin.`
      );
      return;
    }

    // If there was a stale in-progress session, mark it abandoned before starting fresh
    if (conversation) {
      conversation.status = "abandoned";
      await conversation.save();
    }

    conversation = await Conversation.create({
      user: user._id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      currentQuestionIndex: 0,
      answers: [],
      status: "in_progress",
    });

    await sendTextMessage(phone, `Hello ${user.name} 👋`);
    await sendTextMessage(phone, questions[0].text);
    return;
  }

  // No active session and not a greeting -> nudge them
  if (!conversation) {
    await sendTextMessage(
      phone,
      `Hi ${user.name}, send "Hii" to start today's report.`
    );
    return;
  }

  // We have an in-progress session -> treat incoming text as the answer
  // to the current question.
  const questions = await getQuestionsForRole(user.role);
  const idx = conversation.currentQuestionIndex;
  const currentQuestion = questions[idx];

  if (!currentQuestion) {
    // Defensive fallback: questions changed mid-session
    conversation.status = "completed";
    conversation.completedAt = new Date();
    conversation.summary = buildSummary(user, conversation, conversation.answers);
    await conversation.save();
    await sendTextMessage(phone, "✅ Thanks, your report is recorded.");
    return;
  }

  conversation.answers.push({ question: currentQuestion.text, answer: text });
  conversation.currentQuestionIndex = idx + 1;

  const nextQuestion = questions[idx + 1];

  if (nextQuestion) {
    await conversation.save();
    await sendTextMessage(phone, nextQuestion.text);
  } else {
    // That was the last question -> complete & summarize
    conversation.status = "completed";
    conversation.completedAt = new Date();
    conversation.summary = buildSummary(user, conversation, conversation.answers);
    await conversation.save();

    await sendTextMessage(
      phone,
      `✅ Thank you ${user.name}! Your report has been recorded.\n\n${conversation.summary}`
    );
  }
}

module.exports = { handleIncomingMessage, buildSummary };
