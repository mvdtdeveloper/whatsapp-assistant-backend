const Conversation = require("../models/Conversation");

exports.getConversations = async (req, res) => {
  const { role, status, userId, from, to } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (userId) filter.user = userId;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const conversations = await Conversation.find(filter)
    .populate("user", "name phone role site")
    .sort({ createdAt: -1 })
    .limit(500);
  res.json(conversations);
};

exports.getConversation = async (req, res) => {
  const conversation = await Conversation.findById(req.params.id).populate(
    "user",
    "name phone role site"
  );
  if (!conversation) return res.status(404).json({ message: "Not found" });
  res.json(conversation);
};

exports.getStats = async (req, res) => {
  const [totalUsers, totalConversations, completedToday, inProgress] =
    await Promise.all([
      require("../models/User").countDocuments({ active: true }),
      require("../models/Conversation").countDocuments(),
      require("../models/Conversation").countDocuments({
        status: "completed",
        completedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      require("../models/Conversation").countDocuments({ status: "in_progress" }),
    ]);

  res.json({ totalUsers, totalConversations, completedToday, inProgress });
};
