const Agent = require('../models/Agent');

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

module.exports = { limpiarDashboard };
