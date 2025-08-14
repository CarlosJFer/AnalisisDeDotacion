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
  // Indica si la variable utiliza umbrales flexibles. Por defecto es estricta
  flexible: {
    type: Boolean,
    default: false
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
  },
  // Umbrales inferiores y superiores opcionales para variables flexibles
  umbral_preventivo_inferior: { type: Number },
  umbral_critico_inferior: { type: Number },
  umbral_preventivo_superior: { type: Number },
  umbral_critico_superior: { type: Number }
}, {
  timestamps: true
});

// Validación de umbrales
variableSchema.pre('validate', function(next) {
  // Variables estrictas
  if (!this.flexible) {
    if (this.valor_minimo >= this.umbral_critico) {
      return next(new Error('El valor mínimo debe ser menor que el umbral crítico'));
    }
    if (this.umbral_critico >= this.umbral_preventivo) {
      return next(new Error('El umbral crítico debe ser menor que el umbral preventivo'));
    }
    if (this.umbral_preventivo >= this.valor_maximo) {
      return next(new Error('El umbral preventivo debe ser menor que el valor máximo'));
    }
    return next();
  }
  // Variables flexibles
  if (this.umbral_critico_inferior == null || this.umbral_preventivo_inferior == null ||
      this.umbral_preventivo_superior == null || this.umbral_critico_superior == null) {
    return next(new Error('Todos los umbrales deben especificarse para variables flexibles'));
  }
  if (!(this.valor_minimo <= this.umbral_critico_inferior)) {
    return next(new Error('El valor mínimo debe ser menor o igual que el umbral crítico inferior'));
  }
  if (!(this.umbral_critico_inferior < this.umbral_preventivo_inferior)) {
    return next(new Error('El umbral crítico inferior debe ser menor que el umbral preventivo inferior'));
  }
  if (!(this.umbral_preventivo_inferior < this.umbral_preventivo_superior)) {
    return next(new Error('El umbral preventivo inferior debe ser menor que el umbral preventivo superior'));
  }
  if (!(this.umbral_preventivo_superior < this.umbral_critico_superior)) {
    return next(new Error('El umbral preventivo superior debe ser menor que el umbral crítico superior'));
  }
  if (!(this.umbral_critico_superior <= this.valor_maximo)) {
    return next(new Error('El umbral crítico superior debe ser menor o igual que el valor máximo'));
  }
  return next();
});

let Variable;
try {
  Variable = mongoose.model('Variable');
} catch (error) {
  Variable = mongoose.model('Variable', variableSchema);
}

module.exports = Variable; 