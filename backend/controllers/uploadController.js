const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const emailService = require('../services/emailService');
const Variable = require('../models/Variable');
const VariableValue = require('../models/VariableValue');
const Dependency = require('../models/Dependency');

// Función mejorada para limpiar los datos del Excel:
// - Comienza desde la fila 4
// - Elimina filas vacías
// - Elimina filas que sean encabezados (detecta si contienen palabras clave de encabezado en cualquier columna)
// - Solo cuenta filas donde al menos una columna relevante tiene datos válidos
function limpiarDatosExcel(worksheet) {
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  const encabezadoKeywords = ['apellido', 'nombre', 'dni', 'cuil', 'cargo', 'legajo', 'dependencia', 'funcion', 'categoria', 'situacion', 'fecha', 'area', 'unidad'];
  // Tomar solo desde la fila 4 en adelante
  const datos = data.slice(3);
  // Tomar la fila de encabezado real (fila 4)
  const encabezadoReal = datos.length > 0 ? datos[0].map(cell => String(cell).trim().toLowerCase()) : [];
  // Índices de columnas clave
  const columnasClave = ['dni', 'apellido', 'nombre'];
  const indicesClave = encabezadoReal.map((col, idx) => columnasClave.includes(col) ? idx : -1).filter(idx => idx !== -1);
  // Función para validar si un valor es "basura"
  const esValorValido = v => {
    const s = String(v).trim();
    if (!s || s === '-' || s === '0' || s === 'na' || s.toLowerCase() === 'sin dato' || s.toLowerCase() === 's/d') return false;
    return true;
  };
  return datos.filter((row, idx) => {
    if (!Array.isArray(row)) return false;
    // Filtrar filas completamente vacías o con solo espacios
    if (row.every(cell => String(cell).trim() === '')) return false;
    // Filtrar filas que sean encabezados en cualquier columna
    const esEncabezado = row.some(cell => {
      const v = String(cell).toLowerCase().replace(/\s+/g, '');
      return encabezadoKeywords.some(keyword => v.includes(keyword.replace(/\s+/g, '')));
    });
    if (esEncabezado) return false;
    // Filtrar filas que sean duplicados exactos del encabezado real
    const rowNormalizada = row.map(cell => String(cell).trim().toLowerCase());
    if (JSON.stringify(rowNormalizada) === JSON.stringify(encabezadoReal)) return false;
    // Al menos una columna clave debe tener dato válido
    if (indicesClave.length > 0) {
      const tieneClaveValida = indicesClave.some(idxClave => esValorValido(row[idxClave]));
      if (!tieneClaveValida) return false;
    }
    // Al menos una columna relevante debe tener datos válidos (no vacío, no null, no undefined, no solo espacios)
    return row.some(cell => String(cell).trim() !== '' && cell !== null && cell !== undefined);
  });
}


// Controlador para subir y limpiar múltiples archivos Excel

async function uploadFile(req, res) {
  try {
    const Agent = require('../models/Agent');
    const AnalysisData = require('../models/AnalysisData');
    const ImportTemplate = require('../models/ImportTemplate');
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se subió ningún archivo.' });
    }
    const resultados = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        // Obtener el ID de plantilla correspondiente a este archivo
        const templateKey = `template_${i}`;
        let templateId = req.body[templateKey];

        // También admitir un templateId general si existe
        if (!templateId || templateId === 'undefined') {
          templateId = req.body.templateId;
        }

        // Si después de las comprobaciones no hay plantilla, registrar error para este archivo y continuar con los demás
        if (!templateId || templateId === 'undefined') {
          resultados.push({ archivo: file.originalname, error: 'Debes seleccionar una plantilla para cada archivo.' });
          continue;
        }
        
        const template = await ImportTemplate.findById(templateId);
        if (!template) {
          resultados.push({ archivo: file.originalname, error: 'Plantilla no encontrada.' });
          continue;
        }
        const filePath = path.resolve(file.path);
        const workbook = xlsx.readFile(filePath);
        // Usar la hoja especificada en la plantilla, o la primera
        let worksheet;
        if (template.sheetName && workbook.SheetNames.includes(template.sheetName)) {
          worksheet = workbook.Sheets[template.sheetName];
        } else {
          worksheet = workbook.Sheets[workbook.SheetNames[0]];
        }
        // Limpiar datos desde la fila indicada en la plantilla (dataStartRow)
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        const { dataStartRow = 2, dataEndRow } = template;
        const startIndex = dataStartRow - 1;
        const endIndex = dataEndRow ? dataEndRow - 1 : data.length - 1;
        const datos = data.slice(startIndex, endIndex + 1); // incluye fila de inicio y fin
        if (!datos.length) {
          try { fs.unlinkSync(filePath); } catch (e) {}
          resultados.push({ archivo: file.originalname, error: 'No se encontraron datos válidos en el archivo Excel (verifica la fila de inicio en la plantilla).' });
          continue;
        }
        // Primer fila: encabezado real
        const encabezado = datos[0].map(cell => String(cell).trim());
        // Mapear los datos según el mapping de la plantilla, solo si la fila es válida
        let camposClave;
        const templateName = template.name ? template.name.trim().toLowerCase() : '';
        if (templateName.includes('via de captacion')) {
          camposClave = ['Via', 'Total'];
        } else if (templateName.includes('sac')) {
          const mappingNames = template.mappings.map(m => m.variableName);
          const descField = mappingNames.find(n => /descripcion|problema|boca|tema|contacto|barrio/i.test(n)) || mappingNames[0];
          const qtyField = mappingNames.find(n => /cantidad/i.test(n));
          camposClave = [descField];
          if (qtyField && qtyField !== descField) camposClave.push(qtyField);
        } else if (templateName.includes('expedientes')) {
          camposClave = ['Numero de expediente', 'Iniciador del Expediente'];
        } else {
          camposClave = ['dni', 'legajo', 'nombre', 'DNI', 'Legajo', 'Nombre', 'Nombre y Apellido'];
        }
        const agentes = datos.slice(1).map(row => {
          const obj = {};
          template.mappings.forEach(mapping => {
            // Buscar el índice de la columna en el encabezado que corresponde a columnHeader
            let idx = encabezado.findIndex(h => h.toLowerCase() === mapping.columnHeader.toLowerCase());
            if (idx === -1) {
              // Si no se encuentra por nombre, intentar por letra de columna (A, B, C...)
              const colLetter = mapping.columnHeader.toUpperCase();
              const colIdx = colLetter.charCodeAt(0) - 65;
              if (colIdx >= 0 && colIdx < encabezado.length) idx = colIdx;
            }
            if (idx !== -1) {
              let value = row[idx];
              // Convertir tipo de dato si es necesario
              if (mapping.dataType === 'Number') {
                if (typeof value === 'string') {
                  // Normalizar números con coma decimal y separadores de miles, y remover %
                  let s = value.trim();
                  s = s.replace(/%/g, ''); // quitar porcentajes, si existen
                  // remover separador de miles común en ES (.) cuando también hay coma como decimal
                  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) {
                    s = s.replace(/\./g, '').replace(/,/g, '.');
                  } else {
                    // reemplazar coma decimal por punto si no hay patrón de miles
                    s = s.replace(/,/g, '.');
                  }
                  const num = Number(s);
                  value = isNaN(num) ? null : num;
                } else if (typeof value === 'number') {
                  // mantener el número tal cual
                } else {
                  const num = Number(value);
                  value = isNaN(num) ? null : num;
                }
              }
              if (mapping.dataType === 'Date') {
                // Manejar fechas Excel (seriales)
                if (typeof value === 'number') {
                  value = xlsx.SSF.parse_date_code(value);
                  if (value) value = new Date(value.y, value.m - 1, value.d);
                } else {
                  const parsed = Date.parse(value);
                  if (!isNaN(parsed)) value = new Date(parsed);
                }
              }
              if (mapping.dataType === 'Time') {
                if (typeof value === 'number') {
                  const t = xlsx.SSF.parse_date_code(value);
                  if (t) {
                    const h = String(t.h).padStart(2, '0');
                    const m = String(t.m).padStart(2, '0');
                    const s = String(t.s).padStart(2, '0');
                    value = `${h}:${m}:${s}`;
                  }
                } else if (typeof value === 'string') {
                  const d = new Date(`1970-01-01T${value}`);
                  if (!isNaN(d.getTime())) {
                    const h = String(d.getHours()).padStart(2, '0');
                    const m = String(d.getMinutes()).padStart(2, '0');
                    const s = String(d.getSeconds()).padStart(2, '0');
                    value = `${h}:${m}:${s}`;
                  }
                }
              }
              // Normalizar strings "sin dato" a vacío para campos tipo String
              if (mapping.dataType === 'String' && typeof value === 'string') {
                const val = value.trim().toLowerCase();
                const invalids = ['', '0', '-', 's/d', 'sin dato', 'sin datos', 'na', 'n/a', 'nan'];
                if (invalids.includes(val)) {
                  value = '';
                }
              }
              obj[mapping.variableName] = value;
            }
          });

          // Normalizar nombres de campos que difieren entre plantillas
          if (obj['Nombre y Apellido'] && !obj['Apellido Y Nombre']) {
            obj['Apellido Y Nombre'] = obj['Nombre y Apellido'];
          }
          if (obj['Apellido Y Nombre'] && !obj['Nombre y Apellido']) {
            obj['Nombre y Apellido'] = obj['Apellido Y Nombre'];
          }
          if (obj['Situación de revista'] && !obj['Situación de Revista']) {
            obj['Situación de Revista'] = obj['Situación de revista'];
          }
          if (obj['Situación de Revista'] && !obj['Situación de revista']) {
            obj['Situación de revista'] = obj['Situación de Revista'];
          }
          obj.sourceFile = file.originalname;
          obj.uploadDate = new Date();
          obj.templateUsed = template._id;
          // Guardar el nombre de la plantilla sin espacios extra para facilitar los filtros
          obj.plantilla = template.name.trim(); // ✅ AGREGAR NOMBRE DE PLANTILLA PARA FILTROS
          const allowedFilterFields = [
            'Secretaria',
            'Subsecretaria',
            'Dirección general',
            'Dirección',
            'Departamento',
            'División',
            'Funcion'
          ];
          obj.availableFields = Object.keys(obj).filter(k =>
            allowedFilterFields.includes(k)
          );
          // Validar: al menos un campo clave debe tener valor válido
          const tieneClave = camposClave.some(campo => {
            const v = obj[campo];
            if (typeof v === 'string') {
              const val = v.trim().toLowerCase();
              const invalids = ['', '0', '-', 's/d', 'sin dato', 'sin datos', 'na', 'n/a', 'nan'];
              return !invalids.includes(val);
            }
            if (typeof v === 'number') return v > 0;
            return !!v;
          });
          // Validar: la fila no debe ser igual al encabezado
          const esEncabezado = Object.values(obj).every((v, idx) => {
            return String(v).trim().toLowerCase() === (encabezado[idx] ? encabezado[idx].toLowerCase() : '');
          });
          // Validar: la fila no debe estar completamente vacía
          const vacia = Object.values(obj).every(v => {
            if (v === undefined || v === null) return true;
            const s = String(v).trim().toLowerCase();
            const invalids = ['', '0', '-', 's/d', 'sin dato', 'sin datos', 'na', 'n/a', 'nan'];
            return invalids.includes(s);
          });
          if (tieneClave && !esEncabezado && !vacia) {
            return obj;
          }
          return null;
        }).filter(Boolean);
        // Eliminar el archivo después de procesar
        try { fs.unlinkSync(filePath); } catch (e) { /* ignorar error de borrado */ }
        if (!agentes.length) {
          resultados.push({ archivo: file.originalname, error: 'No se encontraron registros válidos para importar.' });
        } else {
          // Eliminar agentes previos del mismo archivo y plantilla
          await Agent.deleteMany({ sourceFile: file.originalname, templateUsed: template._id });
          await Agent.insertMany(agentes);

          const totalAgentes = agentes.length;

          if (template.name && template.name.trim().toLowerCase() !== 'expedientes') {
            // Calcular y almacenar valores de variables por dependencia
            try {
              const totalVar = await Variable.findOne({ nombre: /total/i });
              if (totalVar) {
                const counts = agentes.reduce((acc, a) => {
                  const dep = a['Dependencia donde trabaja'];
                  if (!dep) return acc;
                  acc[dep] = (acc[dep] || 0) + 1;
                  return acc;
                }, {});
                for (const [depName, count] of Object.entries(counts)) {
                  const depDoc = await Dependency.findOne({ nombre: depName });
                  if (!depDoc) continue;
                  await VariableValue.findOneAndUpdate(
                    { dependenciaId: depDoc._id, variableId: totalVar._id },
                    { valor_actual: count, fecha: new Date() },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                  );
                }
              }
            } catch (e) {
              console.error('Error calculando VariableValue:', e);
            }

            // --- Lógica de análisis agregada ---
            // 2. Por género
            const generoMap = {};
            agentes.forEach(a => {
              const genero = (a['genero'] || a['Género'] || a['Genero'] || a['sexo'] || a['Sexo'] || 'No especificado').toString().trim();
              if (!generoMap[genero]) generoMap[genero] = 0;
              generoMap[genero]++;
            });
            const agentesPorGenero = Object.entries(generoMap).map(([genero, cantidad]) => ({
              genero,
              cantidad,
              porcentaje: Math.round((cantidad / totalAgentes) * 100)
            }));

            // 3. Por tipo de contratación
            const contratacionMap = {};
            agentes.forEach(a => {
              const tipo = (a['tipoContratacion'] || a['Tipo de Contratación'] || a['Tipo de contratación'] || a['contratacion'] || a['Contratación'] || 'No especificado').toString().trim();
              if (!contratacionMap[tipo]) contratacionMap[tipo] = 0;
              contratacionMap[tipo]++;
            });
            const agentesPorContratacion = Object.entries(contratacionMap).map(([tipo, cantidad]) => ({
              tipo,
              cantidad,
              porcentaje: Math.round((cantidad / totalAgentes) * 100)
            }));

            // 4. Por antigüedad (si hay campo fechaIngreso o similar)
            const antiguedadMap = {};
            const hoy = new Date();
            agentes.forEach(a => {
              let fechaIngreso = a['fechaIngreso'] || a['Fecha de Ingreso'] || a['fechaAlta'] || a['Fecha de alta'];
              if (fechaIngreso && typeof fechaIngreso === 'string') {
                fechaIngreso = new Date(fechaIngreso);
              }
              let anios = 0;
              if (fechaIngreso instanceof Date && !isNaN(fechaIngreso)) {
                anios = hoy.getFullYear() - fechaIngreso.getFullYear();
              }
              let rango = 'Sin dato';
              if (anios < 1) rango = 'Menos de 1 año';
              else if (anios < 5) rango = '1-4 años';
              else if (anios < 10) rango = '5-9 años';
              else if (anios < 20) rango = '10-19 años';
              else if (anios >= 20) rango = '20 años o más';
              if (!antiguedadMap[rango]) antiguedadMap[rango] = 0;
              antiguedadMap[rango]++;
            });
            const agentesPorAntiguedad = Object.entries(antiguedadMap).map(([rango, cantidad]) => ({
              rango,
              cantidad,
              porcentaje: Math.round((cantidad / totalAgentes) * 100)
            }));

            // 5. Masa salarial y sueldo promedio (si hay campo sueldo)
            let masaSalarial = 0;
            let sueldoPromedio = 0;
            let sueldos = agentes.map(a => Number(a['sueldo'] || a['Sueldo'] || a['remuneracion'] || a['Remuneración']) || 0).filter(v => v > 0);
            if (sueldos.length > 0) {
              masaSalarial = sueldos.reduce((a, b) => a + b, 0);
              sueldoPromedio = masaSalarial / sueldos.length;
            }

            // 6. Guardar en AnalysisData con la estructura que espera el dashboard
            let analisis = await AnalysisData.findOne({
              'archivo.nombreOriginal': file.originalname,
              plantilla: template.name.trim()
            });
            if (!analisis) {
              analisis = new AnalysisData({
                plantilla: template.name.trim(),
                secretaria: {
                  id: req.body.secretariaId || 'default',
                  nombre: req.body.secretariaNombre || 'General'
                },
                organizationId: req.user && req.user.organizationId ? req.user.organizationId : (req.body.organizationId || null),
                uploadedBy: req.user?._id || (req.body.uploadedBy || null),
                archivo: {
                  nombreOriginal: file.originalname,
                  nombreGuardado: file.filename,
                  tamaño: file.size,
                  tipo: file.mimetype,
                  ruta: file.path
                },
                resumen: {
                  totalAgentes,
                  masaSalarial,
                  sueldoPromedio: sueldoPromedio || 0
                },
                analisis: {
                  contratacion: agentesPorContratacion,
                  genero: agentesPorGenero,
                  antiguedad: agentesPorAntiguedad
                },
                auditoria: {
                  creadoPor: req.user?._id || (req.body.uploadedBy || null)
                },
                version: 1,
                esActual: true,
                isActive: true
              });
            } else {
              analisis.plantilla = template.name.trim();
              analisis.resumen.totalAgentes = totalAgentes;
              analisis.resumen.masaSalarial = masaSalarial;
              analisis.resumen.sueldoPromedio = sueldoPromedio || 0;
              analisis.analisis.contratacion = agentesPorContratacion;
              analisis.analisis.genero = agentesPorGenero;
              analisis.analisis.antiguedad = agentesPorAntiguedad;
              analisis.analysisDate = new Date();
              analisis.esActual = true;
              analisis.isActive = true;
            }
            await analisis.save();

            // Enviar notificaciones por email y crear notificaciones en la base de datos
            try {
              const dashboardInfo = {
                action: 'upload',
                fileName: file.originalname,
                totalRecords: totalAgentes,
                secretaria: req.body.secretariaNombre || 'General',
                uploadedBy: req.user?.username || 'Sistema'
              };

              await emailService.notifyDashboardUpdate(dashboardInfo);
              console.log(`Notificaciones enviadas para archivo: ${file.originalname}`);
            } catch (notificationError) {
              console.error('Error enviando notificaciones:', notificationError);
              // No fallar el upload por errores de notificación
            }
          }

          resultados.push({ archivo: file.originalname, mensaje: 'Archivo procesado y guardado correctamente', totalRegistros: totalAgentes });
        }
      } catch (err) {
        resultados.push({ archivo: file.originalname, error: 'Error al procesar el archivo Excel', detalle: err.message });
      }
    }
    return res.status(200).json({ resultados });
  } catch (err) {
    return res.status(500).json({ error: 'Error general al procesar los archivos', detalle: err.message });
  }
}

module.exports = { uploadFile };
