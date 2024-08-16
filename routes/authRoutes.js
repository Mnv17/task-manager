// backend/routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// User registration route
router.post('/register', registerUser);

// User login route
router.post('/login', loginUser);

// Get user profile (protected route)
router.get('/profile', auth, getUserProfile);

module.exports = router;
