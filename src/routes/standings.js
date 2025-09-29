const express = require('express');
const router = express.Router();
const { getStandings } = require('../controllers/standingsController');
const authMiddleware = require('../services/authMiddleware');

// Obtiene standings de la NFL
router.get('/', authMiddleware, getStandings);

module.exports = router;