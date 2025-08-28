const ImportTemplate = require('../models/ImportTemplate');
const Agent = require('../models/Agent');

// Helpers
const ALLOWED_TYPES = ['String', 'Number', 'Date', 'Time'];
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isPositiveInt = (n) => Number.isInteger(n) && n >= 1;
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function validateTemplatePayload(body, { partial = false } = {}) {
  const errors = [];
  const payload = { ...body };

  if (!partial || payload.name !== undefined) {
    if (!isNonEmptyString(payload.name)) errors.push('El nombre es obligatorio.');
    else payload.name = payload.name.trim();
  }

  if (!partial || payload.dataStartRow !== undefined) {
    const n = Number(payload.dataStartRow);
    if (!isPositiveInt(n)) errors.push('dataStartRow debe ser un entero mayor o igual a 1.');
    else payload.dataStartRow = n;
  }

  if (payload.description !== undefined && typeof payload.description === 'string') {
    payload.description = payload.description.trim();
  }
  if (payload.sheetName !== undefined && typeof payload.sheetName === 'string') {
    payload.sheetName = payload.sheetName.trim();
  }

  if (!partial || payload.mappings !== undefined) {
    if (!Array.isArray(payload.mappings) || payload.mappings.length === 0) {
      errors.push('Debe incluir al menos un mapeo.');
    } else {
      payload.mappings = payload.mappings.map((m, idx) => {
        const cm = { ...m };
        if (!isNonEmptyString(cm.columnHeader)) errors.push(`El mapeo #${idx + 1} requiere columnHeader.`);
        if (!isNonEmptyString(cm.variableName)) errors.push(`El mapeo #${idx + 1} requiere variableName.`);
        if (cm.dataType === undefined) cm.dataType = 'String';
        if (!ALLOWED_TYPES.includes(cm.dataType)) errors.push(`El mapeo #${idx + 1} tiene dataType inválido.`);
        cm.columnHeader = (cm.columnHeader || '').trim();
        cm.variableName = (cm.variableName || '').trim();
        return cm;
      });
    }
  }

  return { valid: errors.length === 0, errors, payload };
}

// @desc    Get all import templates
// @route   GET /api/templates
// @access  Private/Admin
exports.getTemplates = async (req, res) => {
  try {
    const templates = await ImportTemplate.find().sort({ createdAt: -1 });
    return res.status(200).json(templates);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// @desc    Get single import template
// @route   GET /api/templates/:id
// @access  Private/Admin
exports.getTemplateById = async (req, res) => {
  try {
    const template = await ImportTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Plantilla no encontrada' });
    return res.status(200).json(template);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// @desc    Create an import template
// @route   POST /api/templates
// @access  Private/Admin
exports.createTemplate = async (req, res) => {
  try {
    const { valid, errors, payload } = validateTemplatePayload(req.body);
    if (!valid) return res.status(400).json({ message: errors.join(' ') });

    // Unicidad por nombre (case-insensitive)
    const existing = await ImportTemplate.findOne({ name: { $regex: `^${escapeRegex(payload.name)}$`, $options: 'i' } });
    if (existing) return res.status(400).json({ message: 'Ya existe una plantilla con ese nombre.' });

    const created = await ImportTemplate.create(payload);
    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    // Manejo de errores de Mongoose (validation / unique)
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'El nombre de la plantilla debe ser único.' });
    }
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// @desc    Update an import template
// @route   PUT /api/templates/:id
// @access  Private/Admin
exports.updateTemplate = async (req, res) => {
  try {
    const id = req.params.id;
    let template = await ImportTemplate.findById(id);
    if (!template) return res.status(404).json({ message: 'Plantilla no encontrada' });

    const { valid, errors, payload } = validateTemplatePayload(req.body, { partial: true });
    if (!valid) return res.status(400).json({ message: errors.join(' ') });

    if (payload.name && payload.name.trim() && payload.name.trim() !== template.name) {
      const clash = await ImportTemplate.findOne({
        _id: { $ne: id },
        name: { $regex: `^${escapeRegex(payload.name.trim())}$`, $options: 'i' }
      });
      if (clash) return res.status(400).json({ message: 'Ya existe una plantilla con ese nombre.' });
    }

    // Asignación segura solo de campos presentes
    ['name', 'description', 'dataStartRow', 'sheetName', 'mappings'].forEach((k) => {
      if (payload[k] !== undefined) template[k] = payload[k];
    });

    const saved = await template.save();
    return res.status(200).json(saved);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'El nombre de la plantilla debe ser único.' });
    }
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// @desc    Delete an import template
// @route   DELETE /api/templates/:id
// @access  Private/Admin
exports.deleteTemplate = async (req, res) => {
  try {
    const id = req.params.id;
    const template = await ImportTemplate.findById(id);
    if (!template) return res.status(404).json({ message: 'Plantilla no encontrada' });

    // Evitar eliminar si está referenciada por datos cargados
    const inUse = await Agent.countDocuments({ templateUsed: id });
    if (inUse > 0) {
      return res.status(400).json({
        message: 'No se puede eliminar la plantilla porque hay datos importados que la referencian.'
      });
    }

    await template.deleteOne();
    return res.status(200).json({ message: 'Plantilla eliminada correctamente' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
