const mongoose = require('mongoose');

const variableValueSchema = new mongoose.Schema({
  dependenciaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dependency',
    required: true,
    index: true
  },
  variableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Variable',
    required: true,
    index: true
  },
  valor_actual: {
    type: Number,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

variableValueSchema.index({ dependenciaId: 1, variableId: 1 }, { unique: true });

module.exports = mongoose.model('VariableValue', variableValueSchema); 