const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { limpiarDashboard, deleteModules } = require('../controllers/adminController');

// Endpoint para eliminar datos de módulos específicos del dashboard
router.delete('/dashboard', authenticateToken, requireAdmin, deleteModules);

// Endpoint legacy para limpiar todo el dashboard
router.post('/limpiar-dashboard', authenticateToken, requireAdmin, limpiarDashboard);

module.exports = router;
