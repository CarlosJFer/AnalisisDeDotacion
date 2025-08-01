const express = require('express');
const router = express.Router();
const { 
  getTemplates, 
  getTemplateById, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate 
} = require('../controllers/importTemplateController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Todas las rutas aquí están protegidas y requieren autenticación y rol admin
router.use(authenticateToken, requireAdmin);

router.route('/')
  .get(getTemplates)
  .post(createTemplate);

router.route('/:id')
  .get(getTemplateById)
  .put(updateTemplate)
  .delete(deleteTemplate);

module.exports = router;