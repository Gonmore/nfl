const express = require('express');
const router = express.Router();
const { register, login, updateProfile } = require('../controllers/authController');
const authMiddleware = require('../services/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
