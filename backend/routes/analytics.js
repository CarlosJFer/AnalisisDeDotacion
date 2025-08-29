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
  getAgentsByDivision,
  getAgeBySecretaria,
  getAgentsBySecretariaNeikeBeca,
  getAgentsByDependencyNeikeBeca,
  getAgentsBySubsecretariaNeikeBeca,
  getAgentsByDireccionGeneralNeikeBeca,
  getAgentsByDireccionNeikeBeca,
  getAgentsByDepartamentoNeikeBeca,
  getAgentsByDivisionNeikeBeca,
  getAgentsBySeniority,
  getAgentsBySecondaryStudies,
  getAgentsByTertiaryStudies,
  getAgentsByUniversityStudies,
  getTopSecretariasByUniversity,
  getTopSecretariasByTertiary,
  getAgentsByRegistrationType,
  getAgentsByEntryTime,
  getAgentsByExitTime,
  getTopRegistrationUnits,
  notifyDashboardModification,
  getSacViaCaptacion
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
router.get('/agents/age-by-secretaria', authenticateToken, getAgeBySecretaria);
router.get('/agents/by-employment-type', authenticateToken, getAgentsByEmploymentType);
router.get('/agents/by-dependency', authenticateToken, getAgentsByDependency);
router.get('/agents/by-secretaria', authenticateToken, getAgentsBySecretaria);
router.get('/agents/by-subsecretaria', authenticateToken, getAgentsBySubsecretaria);
router.get('/agents/by-direccion-general', authenticateToken, getAgentsByDireccionGeneral);
router.get('/agents/by-direccion', authenticateToken, getAgentsByDireccion);
router.get('/agents/by-departamento', authenticateToken, getAgentsByDepartamento);
router.get('/agents/by-division', authenticateToken, getAgentsByDivision);

// Nuevos endpoints para antigüedad, estudios y certificaciones
router.get('/agents/seniority', authenticateToken, getAgentsBySeniority);
router.get('/agents/secondary-studies', authenticateToken, getAgentsBySecondaryStudies);
router.get('/agents/tertiary-studies', authenticateToken, getAgentsByTertiaryStudies);
router.get('/agents/university-studies', authenticateToken, getAgentsByUniversityStudies);
router.get('/agents/top-secretarias-university', authenticateToken, getTopSecretariasByUniversity);
router.get('/agents/top-secretarias-tertiary', authenticateToken, getTopSecretariasByTertiary);
router.get('/certifications/registration-type', authenticateToken, getAgentsByRegistrationType);
router.get('/certifications/entry-time', authenticateToken, getAgentsByEntryTime);
router.get('/certifications/exit-time', authenticateToken, getAgentsByExitTime);
router.get('/certifications/top-units', authenticateToken, getTopRegistrationUnits);

// Rutas para SAC
router.get('/sac/via-captacion', authenticateToken, getSacViaCaptacion);

// Rutas para Neikes y Beca
router.get('/agents/by-function-neike-beca', authenticateToken, require('../controllers/analyticsController').getAgentsByFunctionNeikeBeca);
router.get('/agents/by-employment-type-neike-beca', authenticateToken, require('../controllers/analyticsController').getAgentsByEmploymentTypeNeikeBeca);
router.get('/agents/age-distribution-neike-beca', authenticateToken, require('../controllers/analyticsController').getAgeDistributionNeikeBeca);
router.get('/agents/age-by-function-neike-beca', authenticateToken, require('../controllers/analyticsController').getAgeByFunctionNeikeBeca);
router.get('/agents/age-by-secretaria-neike-beca', authenticateToken, require('../controllers/analyticsController').getAgeBySecretariaNeikeBeca);

// Rutas adicionales para Neikes y Beca
router.get('/agents/by-secretaria-neike-beca', authenticateToken, getAgentsBySecretariaNeikeBeca);
router.get('/agents/by-dependency-neike-beca', authenticateToken, getAgentsByDependencyNeikeBeca);
router.get('/agents/by-subsecretaria-neike-beca', authenticateToken, getAgentsBySubsecretariaNeikeBeca);
router.get('/agents/by-direccion-general-neike-beca', authenticateToken, getAgentsByDireccionGeneralNeikeBeca);
router.get('/agents/by-direccion-neike-beca', authenticateToken, getAgentsByDireccionNeikeBeca);
router.get('/agents/by-departamento-neike-beca', authenticateToken, getAgentsByDepartamentoNeikeBeca);
router.get('/agents/by-division-neike-beca', authenticateToken, getAgentsByDivisionNeikeBeca);

// Ruta para notificar modificaciones en el dashboard
router.post('/notify-dashboard-modification', authenticateToken, notifyDashboardModification);

module.exports = router;