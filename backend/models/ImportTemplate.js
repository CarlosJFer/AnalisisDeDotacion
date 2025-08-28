const mongoose = require('mongoose');

// Define el esquema para cada mapeo de columna dentro de una plantilla
const columnMappingSchema = new mongoose.Schema({
  columnHeader: { type: String, required: true, trim: true },
  variableName: { type: String, required: true, trim: true },
  dataType: {
    type: String,
    enum: ['String', 'Number', 'Date', 'Time'],
    default: 'String',
    required: true
  }
}, { _id: false });

// Esquema de plantilla de importación
const importTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
  dataStartRow: { type: Number, required: true, default: 2, min: 1 },
  sheetName: { type: String, trim: true }, // opcional
  mappings: {
    type: [columnMappingSchema],
    validate: {
      validator: function (arr) { return Array.isArray(arr) && arr.length > 0; },
      message: 'Debe incluir al menos un mapeo de columnas'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('ImportTemplate', importTemplateSchema);

