const express = require('express');
const router = express.Router();
const expedientesController = require('../controllers/expedientesController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/expedientes/top-initiators', authenticateToken, expedientesController.getTopInitiators);
router.get('/expedientes/by-tramite', authenticateToken, expedientesController.getExpedientesByTramite);
router.get(
  '/expedientes/heatmap-tramite-estado',
  authenticateToken,
  expedientesController.getExpedientesHeatmapTramiteEstado,
);
router.get(
  '/expedientes/heatmap-iniciador-estado',
  authenticateToken,
  expedientesController.getExpedientesHeatmapIniciadorEstado,
);

module.exports = router;
