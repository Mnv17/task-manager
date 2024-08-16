// routes/userRoutes.js
const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task'); // Assuming Task model is imported here
const jwt = require('jsonwebtoken');
const protect = require('../middleware/authMiddleware'); // Correct import of the protect middleware
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await User.create({ username, email, password });
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '30d' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ message: 'User registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '30d' });
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// Assign task
router.put('/:id/assign', protect, async (req, res) => { // Use protect middleware
  const { userId } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.assignedTo = userId;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Task assignment failed' });
  }
});

// Add comment
router.post('/:id/comment', protect, async (req, res) => { // Use protect middleware
  const { text } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.comments.push({ user: req.user.id, text });
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Adding comment failed' });
  }
});

// Get User Profile
router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
