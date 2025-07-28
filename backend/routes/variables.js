const express = require('express');
const router = express.Router();
const variableController = require('../controllers/variableController');

// GET /api/variables
router.get('/', variableController.getVariables);
// POST /api/variables
router.post('/', variableController.createVariable);
// PUT /api/variables/:id
router.put('/:id', variableController.updateVariable);
// DELETE /api/variables/:id
router.delete('/:id', variableController.deleteVariable);

module.exports = router; 