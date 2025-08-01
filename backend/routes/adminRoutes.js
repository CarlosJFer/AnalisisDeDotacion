const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { limpiarDashboard } = require('../controllers/adminController');

// Endpoint para limpiar el dashboard (solo admin)
router.post('/limpiar-dashboard', authenticateToken, requireAdmin, limpiarDashboard);

module.exports = router;
