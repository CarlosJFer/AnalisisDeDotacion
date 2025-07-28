const VariableValue = require('../models/VariableValue');
const mongoose = require('mongoose');

// Obtener todos los valores actuales de variables (opcionalmente filtrado por dependencia)
const getVariableValues = async (req, res) => {
  try {
    const filter = {};
    if (req.query.dependenciaId) {
      filter.dependenciaId = req.query.dependenciaId;
    }
    if (req.query.variableId) {
      filter.variableId = req.query.variableId;
    }
    const values = await VariableValue.find(filter).populate('variableId').populate('dependenciaId');
    res.json(values);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener valores de variables', error: error.message });
  }
};

// Crear o actualizar valor actual de variable para una dependencia
const upsertVariableValue = async (req, res) => {
  try {
    const { dependenciaId, variableId, valor_actual } = req.body;
    if (!dependenciaId || !variableId || typeof valor_actual !== 'number') {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }
    const value = await VariableValue.findOneAndUpdate(
      { dependenciaId, variableId },
      { valor_actual, fecha: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(value);
  } catch (error) {
    res.status(400).json({ message: 'Error al guardar valor de variable', error: error.message });
  }
};

// Editar valor actual (por id)
const updateVariableValue = async (req, res) => {
  try {
    const { id } = req.params;
    const { valor_actual } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    const value = await VariableValue.findByIdAndUpdate(id, { valor_actual, fecha: new Date() }, { new: true });
    if (!value) {
      return res.status(404).json({ message: 'Valor no encontrado' });
    }
    res.json(value);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar valor', error: error.message });
  }
};

// Eliminar valor actual (por id)
const deleteVariableValue = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    const value = await VariableValue.findByIdAndDelete(id);
    if (!value) {
      return res.status(404).json({ message: 'Valor no encontrado' });
    }
    res.json({ message: 'Valor eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar valor', error: error.message });
  }
};

module.exports = {
  getVariableValues,
  upsertVariableValue,
  updateVariableValue,
  deleteVariableValue
}; 