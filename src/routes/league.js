const express = require('express');
const router = express.Router();
const { createLeague, joinLeague, getLeagueMembers, getUserLeagues, joinGeneralLeague } = require('../controllers/leagueController');
const authMiddleware = require('../services/authMiddleware');

router.post('/create', authMiddleware, createLeague);
router.post('/join', authMiddleware, joinLeague);
router.post('/join-general', authMiddleware, joinGeneralLeague);
router.get('/user', authMiddleware, getUserLeagues);
router.get('/:leagueId/members', authMiddleware, getLeagueMembers);

module.exports = router;
