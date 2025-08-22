const mongoose = require('mongoose');

const columnMappingSchema = new mongoose.Schema({
  columnHeader: { type: String, required: true }, // Ej: "Nombre del Agente" o la letra de la columna como "C"
  variableName: { type: String, required: true }, // El nombre del campo como lo guardaremos en la BD, ej: "nombreCompleto"
  dataType: { type: String, enum: ['String', 'Number', 'Date', 'Time'], default: 'String' } // Para saber cómo procesar el dato
}, { _id: false });

const importTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Ej: "Rama Completa - Planta"
  description: { type: String },
  dataStartRow: { type: Number, required: true, default: 2 }, // Fila donde empiezan los datos
  sheetName: { type: String }, // Nombre de la hoja de Excel (opcional, si no se usa la primera)
  mappings: [columnMappingSchema] // El mapeo de columnas
}, { timestamps: true });

module.exports = mongoose.model('ImportTemplate', importTemplateSchema);
