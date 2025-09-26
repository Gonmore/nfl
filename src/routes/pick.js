const express = require('express');
const router = express.Router();
const { makePicks, getUserPicks, getLeaguePicks } = require('../controllers/pickController');
const authMiddleware = require('../services/authMiddleware');

router.post('/make', authMiddleware, makePicks);
router.get('/user', authMiddleware, getUserPicks);
router.get('/league', authMiddleware, getLeaguePicks);

module.exports = router;
