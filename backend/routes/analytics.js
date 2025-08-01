// -----------------------------------------------------------------------------
// ARCHIVO: /routes/analytics.js
// -----------------------------------------------------------------------------

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getSecretarias,
  getSecretariaById,
  getResumen,
  compararSecretarias,
  getEstadisticasPorCampo,
  downloadSecretariaPDF,
  getHistorialSecretaria,
  getTotalAgents,
  getAgentsByFunction,
  getAgeDistribution,
  getAgeByFunction,
  getAgentsByEmploymentType,
  getAgentsByDependency,
  getAgentsBySecretaria,
  getAgentsBySubsecretaria,
  getAgentsByDireccionGeneral,
  getAgentsByDireccion,
  getAgentsByDepartamento,
  getAgentsByDivision
} = require('../controllers/analyticsController');

router.get('/secretarias', authenticateToken, getSecretarias);
router.get('/secretarias/:id', authenticateToken, getSecretariaById);
router.get('/secretarias/:id/download', authenticateToken, downloadSecretariaPDF);
router.get('/secretarias/:id/historial', authenticateToken, getHistorialSecretaria);
router.get('/resumen', authenticateToken, getResumen);
router.get('/comparar/:id1/:id2', authenticateToken, compararSecretarias);
router.get('/estadisticas/:campo', authenticateToken, getEstadisticasPorCampo);

// Rutas para análisis de agentes
router.get('/agents/total', authenticateToken, getTotalAgents);
router.get('/agents/by-function', authenticateToken, getAgentsByFunction);
router.get('/agents/age-distribution', authenticateToken, getAgeDistribution);
router.get('/agents/age-by-function', authenticateToken, getAgeByFunction);
router.get('/agents/by-employment-type', authenticateToken, getAgentsByEmploymentType);
router.get('/agents/by-dependency', authenticateToken, getAgentsByDependency);
router.get('/agents/by-secretaria', authenticateToken, getAgentsBySecretaria);
router.get('/agents/by-subsecretaria', authenticateToken, getAgentsBySubsecretaria);
router.get('/agents/by-direccion-general', authenticateToken, getAgentsByDireccionGeneral);
router.get('/agents/by-direccion', authenticateToken, getAgentsByDireccion);
router.get('/agents/by-departamento', authenticateToken, getAgentsByDepartamento);
router.get('/agents/by-division', authenticateToken, getAgentsByDivision);

module.exports = router;