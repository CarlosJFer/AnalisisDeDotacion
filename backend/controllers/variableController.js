const Variable = require('../models/Variable');
const mongoose = require('mongoose');

// Obtener todas las variables
const getVariables = async (req, res) => {
  try {
    const variables = await Variable.find({});
    res.json(variables);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener variables', error: error.message });
  }
};

// Crear nueva variable
const createVariable = async (req, res) => {
  try {
    const variable = new Variable(req.body);
    await variable.save();
    res.status(201).json(variable);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear variable', error: error.message });
  }
};

// Actualizar variable existente
const updateVariable = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    const variable = await Variable.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!variable) {
      return res.status(404).json({ message: 'Variable no encontrada' });
    }
    res.json(variable);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar variable', error: error.message });
  }
};

// Eliminar variable
const deleteVariable = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    const variable = await Variable.findByIdAndDelete(id);
    if (!variable) {
      return res.status(404).json({ message: 'Variable no encontrada' });
    }
    res.json({ message: 'Variable eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar variable', error: error.message });
  }
};

module.exports = {
  getVariables,
  createVariable,
  updateVariable,
  deleteVariable
}; 