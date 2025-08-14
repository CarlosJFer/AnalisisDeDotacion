// -----------------------------------------------------------------------------
// ARCHIVO: /models/VariableEspecifica.js
// -----------------------------------------------------------------------------

const mongoose = require('mongoose');

const SECRETARIAS_MODELO = [
  'INTENDENCIA',
  'VICE-INTENDENCIA',
  'SEC. DE COORDINACION DE GOBIERNO',
  'SEC. DE HACIENDA',
  'SEC. DE DESARROLLO URBANO',
  'SEC. DE DESARROLLO ECONOMICO',
  'SEC. DE INFRAESTRUCTURA',
  'SEC. DE SALUD',
  'SEC. DE AMBIENTE Y DESARROLLO SUSTENTABLE',
  'SEC. DE MOVILIDAD URBANA Y SEGURIDAD CIUDADANA',
  'SEC. DE TURISMO Y DEPORTES',
  'SERVICIO JURIDICO PERMANENTE',
  'AUDITORIA MUNICIPAL',
  'ESCRIBANIA MUNICIPAL',
  'ADMINISTRACION GENERAL DEL TRIBUNAL DE FALTAS',
  'HONORABLE CONCEJO DELIBERANTE',
  'DEFENSORIA DE LOS VECINOS',
  'CAJA MUNICIPAL DE PRESTAMOS',
  'FUERA DE LA MCC',
  'COORDINACION DE ASUNTOS POLITICOS ESTRATEGICOS',
  'COORDINACIÓN DE RELACIONES TERRITORIALES',
  'SEC. DE CULTURA Y EDUCACION',
  'SEC. DE DESARROLLO HUMANO'
];

const variableEspecificaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    default: '',
    trim: true
  },
  unidad_medida: {
    type: String,
    required: true,
    trim: true
  },
  secretaria: {
    type: String,
    required: [true, 'La secretaría es requerida'],
    enum: SECRETARIAS_MODELO
  },
  umbral_critico: {
    type: Number,
    required: true,
    min: 0
  },
  umbral_preventivo: {
    type: Number,
    required: true,
    min: 0
  },
  // Umbrales flexibles inferiores y superiores (opcionales)
  umbral_critico_inferior: { type: Number },
  umbral_preventivo_inferior: { type: Number },
  umbral_preventivo_superior: { type: Number },
  umbral_critico_superior: { type: Number },
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
  // Indica si la variable usa umbrales flexibles (doble banda)
  flexible: {
    type: Boolean,
    default: false
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Validación personalizada para umbrales
variableEspecificaSchema.pre('save', function(next) {
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
  } else {
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
  }
  if (!this.secretaria || this.secretaria.trim() === '') {
    return next(new Error('Debe seleccionar una secretaría'));
  }
  return next();
});

// Índices para optimizar consultas
variableEspecificaSchema.index({ nombre: 1 });
variableEspecificaSchema.index({ secretaria: 1 });
variableEspecificaSchema.index({ activo: 1 });

module.exports = mongoose.model('VariableEspecifica', variableEspecificaSchema);
