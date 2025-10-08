const ANFunction = require('../models/ANFunction');

async function getFunciones(req, res) {
  try {
    const rows = await ANFunction.find({}).sort({ functionId: 1 }).lean();
    // map to {id, funcion, agrupamiento}
    const out = rows.map((r) => ({ id: r.functionId, funcion: r.funcion, agrupamiento: r.agrupamiento }));
    return res.json(out);
  } catch (e) {
    console.error('getFunciones error:', e);
    return res.status(500).json({ message: 'Error obteniendo funciones' });
  }
}

async function putFunciones(req, res) {
  try {
    const { rows } = req.body || {};
    if (!Array.isArray(rows)) {
      return res.status(400).json({ message: 'Formato inválido: se esperaba { rows: [...] }' });
    }
    // replace all
    await ANFunction.deleteMany({});
    if (rows.length) {
      const docs = rows
        .filter((r) => r && r.id != null && r.funcion)
        .map((r) => ({ functionId: Number(r.id), funcion: String(r.funcion).trim(), agrupamiento: String(r.agrupamiento || '').trim().toLowerCase() }));
      if (docs.length) await ANFunction.insertMany(docs, { ordered: false });
    }
    return res.json({ ok: true, count: rows.length });
  } catch (e) {
    console.error('putFunciones error:', e);
    return res.status(500).json({ message: 'Error guardando funciones' });
  }
}

module.exports = { getFunciones, putFunciones };

