const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const expedientesController = require('../controllers/expedientesController');

router.get('/expedientes/top-initiators', authenticateToken, expedientesController.getTopInitiators);
router.get('/expedientes/by-tramite', authenticateToken, expedientesController.getExpedientesByTramite);

module.exports = router;
