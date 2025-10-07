const express = require('express');
const router = express.Router();
const { register, login, updateProfile, wakeup, checkUserExists, validateInvitationToken, registerWithInvitation } = require('../controllers/authController');
const authMiddleware = require('../services/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/register-with-invitation', registerWithInvitation);
router.put('/profile', authMiddleware, updateProfile);
router.get('/wakeup', wakeup);
router.get('/check-user', authMiddleware, checkUserExists);
router.get('/validate-invitation/:token', validateInvitationToken);

module.exports = router;
