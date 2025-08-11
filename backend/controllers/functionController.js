const FunctionDefinition = require('../models/FunctionDefinition');

// Obtener todas las funciones
const getFunctions = async (req, res) => {
  try {
    const functions = await FunctionDefinition.find().sort({ name: 1 });
    res.json(functions);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener funciones', error: error.message });
  }
};

// Crear nueva función
const createFunction = async (req, res) => {
  try {
    const func = new FunctionDefinition(req.body);
    await func.save();
    res.status(201).json(func);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear función', error: error.message });
  }
};

// Actualizar función existente
const updateFunction = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await FunctionDefinition.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Función no encontrada' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar función', error: error.message });
  }
};

// Eliminar función
const deleteFunction = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await FunctionDefinition.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Función no encontrada' });
    res.json({ message: 'Función eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ message: 'Error al eliminar función', error: error.message });
  }
};

module.exports = { getFunctions, createFunction, updateFunction, deleteFunction };
