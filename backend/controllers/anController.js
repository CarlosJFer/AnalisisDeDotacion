const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const ImportTemplate = require('../models/ImportTemplate');
const ANDataset = require('../models/ANDataset');
const ANRecord = require('../models/ANRecord');

// Map rows using ImportTemplate mappings without touching dashboard collections
async function uploadANFiles(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No se subió ningún archivo.' });
    }

    const dataset = new ANDataset({
      createdBy: req.user._id,
      templateIds: [],
      fileNames: [],
      totalRecords: 0,
    });
    await dataset.save();

    const resultados = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        const templateKey = `template_${i}`;
        let templateId = req.body[templateKey] || req.body.templateId;
        let template = null;
        if (templateId && templateId !== 'undefined') {
          template = await ImportTemplate.findById(templateId).catch(() => null);
        }

        const filePath = path.resolve(file.path);
        const workbook = xlsx.readFile(filePath);
        const worksheet = template?.sheetName && workbook.SheetNames.includes(template.sheetName)
          ? workbook.Sheets[template.sheetName]
          : workbook.Sheets[workbook.SheetNames[0]];

        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        const dataStartRow = template?.dataStartRow ?? 2;
        const dataEndRow = template?.dataEndRow;
        const startIndex = Math.max((dataStartRow || 2) - 1, 0);
        const endIndex = dataEndRow ? Math.min(dataEndRow - 1, data.length) : data.length;
        const datos = data.slice(startIndex, endIndex);
        if (!datos.length) {
          resultados.push({ archivo: file.originalname, error: 'El archivo no contiene datos.' });
          try { fs.unlinkSync(filePath); } catch (e) {}
          continue;
        }

        const encabezadoRaw = datos[0] || [];
        const encabezado = encabezadoRaw.map((cell) => String(cell || '').trim());

        let registros = datos.slice(1).map((row) => {
          const obj = {};
          if (template && Array.isArray(template.mappings)) {
            template.mappings.forEach((mapping) => {
              let idx = encabezado.findIndex((h) => h.toLowerCase() === mapping.columnHeader.toLowerCase());
              if (idx === -1) {
                // Try column letter (A, B, C...)
                const colLetter = (mapping.columnHeader || '').toUpperCase();
                const colIdx = colLetter.charCodeAt(0) - 65;
                if (colIdx >= 0 && colIdx < encabezado.length) idx = colIdx;
              }
              if (idx !== -1) {
                let value = row[idx];
                if (mapping.dataType === 'Number') {
                  if (typeof value === 'string') {
                    let s = value.trim();
                    s = s.replace(/%/g, '');
                    if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) {
                      s = s.replace(/\./g, '').replace(/,/g, '.');
                    } else {
                      s = s.replace(/,/g, '.');
                    }
                    const num = Number(s);
                    value = isNaN(num) ? null : num;
                  } else if (typeof value !== 'number') {
                    const num = Number(value);
                    value = isNaN(num) ? null : num;
                  }
                }
                if (mapping.dataType === 'Date') {
                  if (typeof value === 'number') {
                    const parsed = xlsx.SSF.parse_date_code(value);
                    if (parsed) value = new Date(parsed.y, parsed.m - 1, parsed.d);
                  } else {
                    const parsed = Date.parse(value);
                    if (!isNaN(parsed)) value = new Date(parsed);
                  }
                }
                if (mapping.dataType === 'Time') {
                  if (typeof value === 'number') {
                    const t = xlsx.SSF.parse_date_code(value);
                    if (t) value = `${String(t.h).padStart(2,'0')}:${String(t.m).padStart(2,'0')}:${String(t.s).padStart(2,'0')}`;
                  } else if (typeof value === 'string') {
                    const d = new Date(`1970-01-01T${value}`);
                    if (!isNaN(d.getTime())) value = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
                  }
                }
                if (mapping.dataType === 'String' && typeof value === 'string') {
                  const val = value.trim().toLowerCase();
                  const invalids = ['', '0', '-', 's/d', 'sin dato', 'sin datos', 'na', 'n/a', 'nan'];
                  if (invalids.includes(val)) value = '';
                }
                let normalizedVarName = mapping.variableName || '';
                if (typeof normalizedVarName === 'string' && normalizedVarName.normalize) {
                  normalizedVarName = normalizedVarName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                }
                normalizedVarName = normalizedVarName.toLowerCase();
                obj[normalizedVarName] = value;
              }
            });
          } else {
            // Fallback: map using header names directly
            encabezado.forEach((h, idx) => {
              let key = (h || '').toString();
              if (key && key.normalize) key = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              key = key.toLowerCase().trim();
              if (key) obj[key] = row[idx];
            });
          }
          return obj;
        }).filter(Boolean);

        try { fs.unlinkSync(filePath); } catch (e) {}

        if (!registros.length) {
          resultados.push({ archivo: file.originalname, error: 'No se encontraron registros válidos para importar.' });
          continue;
        }

        // Insert records into ANRecord without touching dashboard collections
        const docs = registros.map((r) => ({
          datasetId: dataset._id,
          uploadedBy: req.user._id,
          templateUsed: template ? template._id : undefined,
          sourceFile: file.originalname,
          data: r,
        }));
        await ANRecord.insertMany(docs);

        dataset.templateIds.push(template._id);
        dataset.fileNames.push(file.originalname);
        dataset.totalRecords += registros.length;

        resultados.push({ archivo: file.originalname, totalRegistros: registros.length });
      } catch (err) {
        console.error('Error procesando archivo AN:', err);
        resultados.push({ archivo: file.originalname, error: 'Error al procesar el archivo.' });
        try { fs.unlinkSync(path.resolve(file.path)); } catch (e) {}
      }
    }

    await dataset.save();
    return res.json({ resultados, datasetId: dataset._id, totalRecords: dataset.totalRecords });
  } catch (error) {
    console.error('Error en uploadANFiles:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function getLatestRecords(req, res) {
  try {
    const latestDataset = await ANDataset.findOne({}).sort({ createdAt: -1 });
    if (!latestDataset) return res.json({ dataset: null, records: [] });
    const records = await ANRecord.find({ datasetId: latestDataset._id })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();
    return res.json({ dataset: latestDataset, records });
  } catch (error) {
    console.error('Error en getLatestRecords:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

module.exports = { uploadANFiles, getLatestRecords };
