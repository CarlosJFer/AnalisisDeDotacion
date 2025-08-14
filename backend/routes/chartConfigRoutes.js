const express = require('express');
const router = express.Router();
const chartConfigController = require('../controllers/chartConfigController');

router.get('/options', chartConfigController.getConfigOptions);
router.get('/', chartConfigController.getChartConfigs);
router.post('/', chartConfigController.createChartConfig);
router.get('/:id/data', chartConfigController.runCustomAnalytics);
router.get('/:id', chartConfigController.getChartConfigById);
router.put('/:id', chartConfigController.updateChartConfig);
router.delete('/:id', chartConfigController.deleteChartConfig);

module.exports = router;
