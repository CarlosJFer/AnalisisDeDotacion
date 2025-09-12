const express = require('express');
const router = express.Router();
const { registerINP } = require('../controllers/metricsController');

router.post('/inp', registerINP);

module.exports = router;

