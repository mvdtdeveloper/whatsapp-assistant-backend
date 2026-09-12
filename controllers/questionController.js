const Question = require("../models/Question");

exports.createQuestion = async (req, res) => {
  try {
    const { role, text, order } = req.body;
    if (!role || !text) {
      return res.status(400).json({ message: "role and text are required" });
    }
    let finalOrder = order;
    if (finalOrder === undefined || finalOrder === null) {
      const last = await Question.findOne({ role }).sort({ order: -1 });
      finalOrder = last ? last.order + 1 : 1;
    }
    const question = await Question.create({ role, text, order: finalOrder });
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuestions = async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const questions = await Question.find(filter).sort({ role: 1, order: 1 });
  res.json(questions);
};

exports.updateQuestion = async (req, res) => {
  const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!question) return res.status(404).json({ message: "Question not found" });
  res.json(question);
};

exports.deleteQuestion = async (req, res) => {
  const question = await Question.findByIdAndDelete(req.params.id);
  if (!question) return res.status(404).json({ message: "Question not found" });
  res.json({ message: "Question deleted" });
};
