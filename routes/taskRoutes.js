// routes/taskRoutes.js
const express = require('express');
const Task = require('../models/Task');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

// Create Task
router.post('/', protect, async (req, res) => {
  const { title, description, dueDate, priority } = req.body;
  try {
    const task = await Task.create({ title, description, dueDate, priority, user: req.user._id });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: 'Task creation failed' });
  }
});

// Get Tasks (with pagination)
router.get('/', protect, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const tasks = await Task.find({ user: req.user._id })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Task.countDocuments({ user: req.user._id });
    res.json({
      tasks,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Fetching tasks failed' });
  }
});

// Get Task by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Fetching task failed' });
  }
});

// Update Task
router.put('/:id', protect, async (req, res) => {
  const { title, description, dueDate, status, priority } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this task' });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.dueDate = dueDate || task.dueDate;
    task.status = status || task.status;
    task.priority = priority || task.priority;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Updating task failed' });
  }
});

// Delete Task
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this task' });
    }

    await task.remove();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: 'Deleting task failed' });
  }
});

module.exports = router;
