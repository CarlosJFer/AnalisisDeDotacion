const Agent = require('../models/Agent');
const AnalysisData = require('../models/AnalysisData');

// Limpia todos los agentes (puedes agregar más colecciones si lo deseas)
async function limpiarDashboard(req, res) {
  try {
    await Agent.deleteMany({});
    // Si quieres limpiar más colecciones, agrégalas aquí
    // await OtraColeccion.deleteMany({});
    res.status(200).json({ mensaje: 'Dashboard limpiado correctamente (todos los agentes eliminados).' });
  } catch (err) {
    res.status(500).json({ error: 'Error al limpiar el dashboard', detalle: err.message });
  }
}

const modulesToPlantillas = {
  'Planta y Contratos': [
    'Rama completa - Planta y Contratos',
    'Datos concurso - Planta y Contratos',
    'Control de certificaciones - Planta y Contratos',
  ],
  'Neikes y Becas': [
    'Rama completa - Neikes y Beca',
    'Control de certificaciones - Neikes y Becas',
  ],
  Expedientes: ['Expedientes'],
  SAC: [
    'SAC - Via de captacion',
    'SAC - Cierre de problemas',
    'SAC - Boca receptora',
    'SAC - Frecuencia de tipos de cierre',
    'SAC - Temas',
    'SAC - Discriminacion por tipo de contacto',
    'SAC - Evaluacion de llamadas por barrio',
    'SAC - Secretaria de ambiente y desarrollo sustentable',
    'SAC - Secretaria de infraestructura',
    'SAC - Secretaria de coordinacion de relaciones territoriales',
  ],
};

async function deleteModules(req, res) {
  const { modules = [] } = req.body || {};
  const plantillas = modules.flatMap((m) => modulesToPlantillas[m] || []);

  if (!plantillas.length) {
    return res.status(400).json({ message: 'No se especificaron módulos válidos.' });
  }

  try {
    await Agent.deleteMany({ plantilla: { $in: plantillas } });
    await AnalysisData.deleteMany({ plantilla: { $in: plantillas } });
    res.json({ message: 'Datos eliminados correctamente para los módulos seleccionados.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar datos de los módulos.', error: err.message });
  }
}

module.exports = { limpiarDashboard, deleteModules };
