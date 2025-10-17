const express = require('express');
const router = express.Router();
const { makePicks, getUserPicks, getLeaguePicks, checkAdminPickEligibility, makePicksForUser } = require('../controllers/pickController');
const authMiddleware = require('../services/authMiddleware');

router.post('/make', authMiddleware, makePicks);
router.get('/user', authMiddleware, getUserPicks);
router.get('/league', authMiddleware, getLeaguePicks);

// Rutas para administradores
router.get('/admin/check-eligibility', authMiddleware, checkAdminPickEligibility);
router.post('/admin/make-for-user', authMiddleware, makePicksForUser);

module.exports = router;
