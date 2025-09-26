const express = require('express');
const router = express.Router();
const { getStandings } = require('../controllers/standingsController');

// Obtiene standings de la NFL
router.get('/', getStandings);

module.exports = router;