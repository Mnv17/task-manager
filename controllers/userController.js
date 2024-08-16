// backend/controllers/userController.js
const User = require('../models/User');

// Get all users (for task assignment)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = { getUsers };
