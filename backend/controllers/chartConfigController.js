const mongoose = require('mongoose');
const ChartConfig = require('../models/ChartConfig');
const AnalysisData = require('../models/AnalysisData');

// Obtener todas las configuraciones de gráfico
const getChartConfigs = async (req, res) => {
  try {
    const configs = await ChartConfig.find({});
    res.json(configs);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener configuraciones', error: error.message });
  }
};

// Crear una nueva configuración
const createChartConfig = async (req, res) => {
  try {
    const config = new ChartConfig(req.body);
    await config.save();
    res.status(201).json(config);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear configuración', error: error.message });
  }
};

// Obtener una configuración por ID
const getChartConfigById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    const config = await ChartConfig.findById(id);
    if (!config) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener configuración', error: error.message });
  }
};

// Actualizar una configuración existente
const updateChartConfig = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    const config = await ChartConfig.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!config) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    res.json(config);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar configuración', error: error.message });
  }
};

// Eliminar una configuración
const deleteChartConfig = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    const config = await ChartConfig.findByIdAndDelete(id);
    if (!config) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    res.json({ message: 'Configuración eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar configuración', error: error.message });
  }
};

// Ejecutar agregación personalizada según la configuración
const runCustomAnalytics = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    const config = await ChartConfig.findById(id);
    if (!config) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }

    const match = { esActual: true };
    if (config.plantillas && config.plantillas.length > 0) {
      match['archivo.nombreOriginal'] = { $in: config.plantillas };
    }

    const groupField = `$${config.groupBy}`;
    const valueField = config.measure === 'count' ? { $sum: 1 } : { $sum: `$${config.measure}` };

    const pipeline = [
      { $match: match },
      { $group: { _id: groupField, value: valueField } },
    ];

    const results = await AnalysisData.aggregate(pipeline);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error al ejecutar análisis', error: error.message });
  }
};

// Obtener opciones dinámicas
const getConfigOptions = async (req, res) => {
  try {
    const plantillas = await AnalysisData.distinct('archivo.nombreOriginal');
    const groupFields = ['secretaria.id', 'secretaria.nombre'];
    const measures = ['count', 'resumen.totalAgentes', 'resumen.masaSalarial'];
    res.json({ plantillas, groupFields, measures });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener opciones', error: error.message });
  }
};

module.exports = {
  getChartConfigs,
  createChartConfig,
  getChartConfigById,
  updateChartConfig,
  deleteChartConfig,
  runCustomAnalytics,
  getConfigOptions,
};
