const express = require('express');
const router = express.Router();
const { createLeague, joinLeague, getLeagueMembers, getUserLeagues, joinGeneralLeague, addUserWithPicks, createInvitationWithPicks } = require('../controllers/leagueController');
const authMiddleware = require('../services/authMiddleware');

router.post('/create', authMiddleware, createLeague);
router.post('/join', authMiddleware, joinLeague);
router.post('/join-general', authMiddleware, joinGeneralLeague);
router.post('/add-user-with-picks', authMiddleware, addUserWithPicks);
router.post('/create-invitation-with-picks', authMiddleware, createInvitationWithPicks);
router.get('/user', authMiddleware, getUserLeagues);
router.get('/:leagueId/members', authMiddleware, getLeagueMembers);

module.exports = router;
