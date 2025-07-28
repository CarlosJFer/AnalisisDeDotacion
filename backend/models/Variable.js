const mongoose = require('mongoose');

const variableSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  unidad_medida: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  valor_minimo: {
    type: Number,
    required: true,
    min: 0
  },
  valor_maximo: {
    type: Number,
    required: true,
    min: 0
  },
  umbral_preventivo: {
    type: Number,
    required: true,
    min: 0
  },
  umbral_critico: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Validación de umbrales
variableSchema.pre('validate', function(next) {
  if (this.valor_minimo >= this.umbral_critico) {
    return next(new Error('El valor mínimo debe ser menor que el umbral crítico'));
  }
  if (this.umbral_critico >= this.umbral_preventivo) {
    return next(new Error('El umbral crítico debe ser menor que el umbral preventivo'));
  }
  if (this.umbral_preventivo >= this.valor_maximo) {
    return next(new Error('El umbral preventivo debe ser menor que el valor máximo'));
  }
  next();
});

let Variable;
try {
  Variable = mongoose.model('Variable');
} catch (error) {
  Variable = mongoose.model('Variable', variableSchema);
}

module.exports = Variable; 