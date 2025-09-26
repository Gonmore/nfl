const express = require('express');
const router = express.Router();
const { syncGames, getGames, getGamesByWeek } = require('../controllers/gameController');
const authMiddleware = require('../services/authMiddleware');

// Solo admin puede sincronizar partidos
router.post('/sync', authMiddleware, syncGames);
// Todos pueden consultar partidos
router.get('/current', authMiddleware, getGames);
router.get('/week/:week', authMiddleware, getGamesByWeek);

module.exports = router;
