const User = require("../models/User");

exports.createUser = async (req, res) => {
  try {
    const { name, phone, role, site } = req.body;
    if (!name || !phone || !role) {
      return res.status(400).json({ message: "name, phone and role are required" });
    }
    const user = await User.create({ name, phone: phone.replace(/\D/g, ""), role, site });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A user with this phone number already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json(users);
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

exports.updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.phone) updates.phone = updates.phone.replace(/\D/g, "");
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted" });
};
