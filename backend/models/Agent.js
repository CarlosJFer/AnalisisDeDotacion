const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  // Estos campos se llenarán dinámicamente desde las plantillas.
  // Ejemplo basado en "RamaCompletaPersonal"
  legajo: { type: String, index: true },
  dni: { type: String, index: true },
  nombreCompleto: { type: String, index: true },
  fechaNacimiento: { type: Date },
  situacionRevista: { type: String },
  funcion: { type: String },
  dependencia: { type: String },
  secretaria: { type: String },
  subsecretaria: { type: String },
  direccionGeneral: { type: String },
  direccion: { type: String },
  departamento: { type: String },
  division: { type: String },

  // Puedes añadir más campos aquí si otros excels tienen más datos.
  // La lógica del controlador los añadirá si existen en la plantilla.
  
  // Metadata de la carga
  sourceFile: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  templateUsed: { type: mongoose.Schema.Types.ObjectId, ref: 'ImportTemplate', required: true },

}, { 
  timestamps: true,
  // Permite campos que no están estrictamente definidos en el schema
  // Esto da flexibilidad si una plantilla define una variable nueva
  strict: false 
});

module.exports = mongoose.model('Agent', agentSchema);