const express = require('express');
const router = express.Router();
const functionController = require('../controllers/functionController');

router.get('/', functionController.getFunctions);
router.post('/', functionController.createFunction);
router.put('/:id', functionController.updateFunction);
router.delete('/:id', functionController.deleteFunction);

module.exports = router;
