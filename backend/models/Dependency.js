// ----------------------------------------------------------------------------
const mongoose = require('mongoose');

const DependencySchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  idPadre: {
    type: String,
    default: null, // null para secretarías principales
  },
  orden: {
    type: Number,
    default: 999,
  },
  nivel: {
    type: Number,
    min: 1,
  },
  codigo: {
    type: String,
    unique: true,
    required: true,
  },
  funcion: {
    type: String,
    default: '',
  },
  // Campos adicionales que podrían ser útiles
  activo: {
    type: Boolean,
    default: true,
  },
  descripcion: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// Índices para optimizar consultas
DependencySchema.index({ idPadre: 1 });
DependencySchema.index({ nivel: 1 });
DependencySchema.index({ codigo: 1 });

module.exports = mongoose.model('Dependency', DependencySchema);