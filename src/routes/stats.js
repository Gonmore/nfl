const express = require('express');
const router = express.Router();
const { getLeagueStats, getUserPicksDetails, cleanDuplicates, recalculateScores } = require('../controllers/statsController');
const authMiddleware = require('../services/authMiddleware');

router.get('/league', authMiddleware, getLeagueStats);
router.get('/user-picks', authMiddleware, getUserPicksDetails);

// Endpoint para recalcular puntos
router.post('/recalculate-scores', authMiddleware, recalculateScores);

// Endpoint para limpiar duplicados - SOLO PARA ADMINISTRADORES
router.post('/clean-duplicates', authMiddleware, cleanDuplicates);

module.exports = router;
