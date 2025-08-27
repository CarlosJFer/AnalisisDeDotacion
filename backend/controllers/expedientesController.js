const Agent = require('../models/Agent');

function computePreviousMonthRange() {
  const now = new Date();
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayPreviousMonth = new Date(firstDayCurrentMonth - 1);
  const startDate = new Date(
    lastDayPreviousMonth.getFullYear(),
    lastDayPreviousMonth.getMonth(),
    1
  );
  const endDate = new Date(
    lastDayPreviousMonth.getFullYear(),
    lastDayPreviousMonth.getMonth(),
    lastDayPreviousMonth.getDate(),
    23,
    59,
    59,
    999
  );
  return { startDate, endDate };
}
const getTopInitiators = async (req, res) => {
  try {
    const { plantilla, filters } = req.query;
    const { startDate, endDate } = computePreviousMonthRange();
    const match = {
      plantilla: plantilla || 'Expedientes',
      'Fecha de Inicio': { $gte: startDate, $lte: endDate },
      ...(filters && JSON.parse(filters))
    };
    const topInitiators = await Agent.aggregate([
      { $match: match },
      { $group: { _id: '$Iniciador del Expediente', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { initiator: '$_id', count: 1, _id: 0 } }
    ]);
    res.json(topInitiators);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener iniciadores' });
  }
};

const getExpedientesByTramite = async (req, res) => {
  try {
    const { plantilla, filters } = req.query;
    const { startDate, endDate } = computePreviousMonthRange();
    const match = {
      plantilla: plantilla || 'Expedientes',
      'Fecha de Inicio': { $gte: startDate, $lte: endDate },
      ...(filters && JSON.parse(filters))
    };
    const byTramite = await Agent.aggregate([
      { $match: match },
      { $group: { _id: '$Tramite', count: { $sum: 1 } } },
      { $project: { tramite: '$_id', count: 1, _id: 0 } }
    ]);
    res.json(byTramite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener expedientes por tipo de trámite' });
  }
};

module.exports = {
  getTopInitiators,
  getExpedientesByTramite,
  computePreviousMonthRange
};
