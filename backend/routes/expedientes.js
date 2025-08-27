const express = require('express');
const router = express.Router();
const expedientesController = require('../controllers/expedientesController');
const authenticateToken = require('../middleware/auth');

router.get('/expedientes/top-initiators', authenticateToken, expedientesController.getTopInitiators);
router.get('/expedientes/by-tramite', authenticateToken, expedientesController.getExpedientesByTramite);

module.exports = router;
