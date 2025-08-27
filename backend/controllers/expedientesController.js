const Agent = require('../models/Agent');

function computePreviousMonthRange() {
  const now = new Date();
  const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfPreviousMonth = new Date(firstDayOfCurrentMonth - 1);
  const startDate = new Date(
    lastDayOfPreviousMonth.getFullYear(),
    lastDayOfPreviousMonth.getMonth(),
    1
  );
  const endDate = new Date(
    lastDayOfPreviousMonth.getFullYear(),
    lastDayOfPreviousMonth.getMonth(),
    lastDayOfPreviousMonth.getDate(),
    23,
    59,
    59,
    999
  );
  return { startDate, endDate };
}

function buildMatch(query) {
  const plantilla = (query.plantilla || 'Expedientes').trim();
  const match = { plantilla };

  if (query.filters) {
    try {
      const extra = JSON.parse(query.filters);
      Object.assign(match, extra);
    } catch (e) {
      console.error('Error parsing filters:', e);
    }
  }

  const andFilters = [];
  const addRegexFilter = (fields, value) => {
    if (!value) return;
    const orConditions = fields.map(f => ({ [f]: { $regex: value, $options: 'i' } }));
    andFilters.push({ $or: orConditions });
  };

  addRegexFilter(['Secretaria', 'Secretaría'], query.secretaria);
  addRegexFilter(['Subsecretaria', 'Subsecretaría'], query.subsecretaria);
  addRegexFilter(['Dirección general', 'Direccion General', 'Dirección General'], query.direccionGeneral);
  addRegexFilter(['Dirección', 'Direccion'], query.direccion);
  addRegexFilter(['Departamento'], query.departamento);
  addRegexFilter(['División', 'Division'], query.division);
  addRegexFilter(['Funcion', 'Función'], query.funcion);

  if (andFilters.length) {
    match.$and = andFilters;
  }

  return match;
}

const getTopInitiators = async (req, res) => {
  try {
    const { startDate, endDate } = computePreviousMonthRange();
    const match = buildMatch(req.query);
    match['Fecha de Inicio'] = { $gte: startDate, $lte: endDate };

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
    const { startDate, endDate } = computePreviousMonthRange();
    const match = buildMatch(req.query);
    match['Fecha de Inicio'] = { $gte: startDate, $lte: endDate };

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

module.exports = { getTopInitiators, getExpedientesByTramite };

