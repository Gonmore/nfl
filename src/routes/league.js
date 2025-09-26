const express = require('express');
const router = express.Router();
const { createLeague, joinLeague, getLeagueMembers, getUserLeagues } = require('../controllers/leagueController');
const authMiddleware = require('../services/authMiddleware');

router.post('/create', authMiddleware, createLeague);
router.post('/join', authMiddleware, joinLeague);
router.get('/user', authMiddleware, getUserLeagues);
router.get('/:leagueId/members', authMiddleware, getLeagueMembers);

module.exports = router;
