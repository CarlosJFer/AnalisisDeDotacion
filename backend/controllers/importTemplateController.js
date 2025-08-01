const ImportTemplate = require('../models/ImportTemplate');

// @desc    Get all import templates
// @route   GET /api/templates
// @access  Private/Admin
exports.getTemplates = async (req, res) => {
  try {
    const templates = await ImportTemplate.find();
    res.json(templates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get single import template
// @route   GET /api/templates/:id
// @access  Private/Admin
exports.getTemplateById = async (req, res) => {
  try {
    const template = await ImportTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ msg: 'Template not found' });
    }
    res.json(template);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create an import template
// @route   POST /api/templates
// @access  Private/Admin
exports.createTemplate = async (req, res) => {
  const { name, description, dataStartRow, sheetName, mappings } = req.body;

  try {
    const newTemplate = new ImportTemplate({
      name,
      description,
      dataStartRow,
      sheetName,
      mappings
    });

    const template = await newTemplate.save();
    res.status(201).json(template);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update an import template
// @route   PUT /api/templates/:id
// @access  Private/Admin
exports.updateTemplate = async (req, res) => {
  const { name, description, dataStartRow, sheetName, mappings } = req.body;

  try {
    let template = await ImportTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ msg: 'Template not found' });
    }

    template.name = name || template.name;
    template.description = description || template.description;
    template.dataStartRow = dataStartRow || template.dataStartRow;
    template.sheetName = sheetName || template.sheetName;
    template.mappings = mappings || template.mappings;

    template = await template.save();

    res.json(template);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete an import template
// @route   DELETE /api/templates/:id
// @access  Private/Admin
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await ImportTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ msg: 'Template not found' });
    }

    await template.remove();

    res.json({ msg: 'Template removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};