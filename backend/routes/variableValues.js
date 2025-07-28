const express = require('express');
const router = express.Router();
const variableValueController = require('../controllers/variableValueController');

// GET /api/variable-values
router.get('/', variableValueController.getVariableValues);
// POST /api/variable-values
router.post('/', variableValueController.upsertVariableValue);
// PUT /api/variable-values/:id
router.put('/:id', variableValueController.updateVariableValue);
// DELETE /api/variable-values/:id
router.delete('/:id', variableValueController.deleteVariableValue);

module.exports = router; 