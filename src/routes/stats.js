const express = require('express');
const router = express.Router();
const { getLeagueStats, getUserPicksDetails } = require('../controllers/statsController');
const authMiddleware = require('../services/authMiddleware');

router.get('/league', authMiddleware, getLeagueStats);
router.get('/user-picks', authMiddleware, getUserPicksDetails);

module.exports = router;
