const AnalysisData = require('../models/AnalysisData');
const Agent = require('../models/Agent'); // Importamos el modelo Agent
const PDFDocument = require('pdfkit');
const emailService = require('../services/emailService');

// Construye dinámicamente el objeto de filtros para consultas
const buildMatchStage = (query) => {
  const match = {};
  // Asegurar que todas las consultas tengan el nombre de plantilla correcto.
  // Si no se especifica, por defecto se usa "Rama completa - Planta y Contratos".
  const plantilla = (query.plantilla || 'Rama completa - Planta y Contratos').trim();
  match.plantilla = plantilla;

  // Filtros dinámicos recibidos como JSON en query.filters
  if (query.filters) {
    try {
      const extra = JSON.parse(query.filters);
      Object.assign(match, extra);
    } catch (e) {
      console.error('Error parsing filters:', e);
    }
  }

  // Filtros específicos: se usan expresiones regulares para permitir
  // coincidencias parciales sin importar mayúsculas/minúsculas.
  if (query.secretaria) {
    match['Secretaria'] = { $regex: query.secretaria, $options: 'i' };
  }
  if (query.subsecretaria) {
    match['Subsecretaria'] = { $regex: query.subsecretaria, $options: 'i' };
  }
  if (query.direccionGeneral) {
    match['Dirección general'] = { $regex: query.direccionGeneral, $options: 'i' };
  }
  if (query.direccion) {
    match['Dirección'] = { $regex: query.direccion, $options: 'i' };
  }
  if (query.departamento) {
    match['Departamento'] = { $regex: query.departamento, $options: 'i' };
  }
  if (query.division) {
    match['División'] = { $regex: query.division, $options: 'i' };
  }
  if (query.funcion) {
    match['Funcion'] = { $regex: query.funcion, $options: 'i' };
  }
  return match;
};

// Obtener lista de secretarías disponibles
const getSecretarias = async (req, res) => {
  try {
    const secretarias = await AnalysisData.find({ activo: true })
      .select('secretariaId secretariaNombre data.totalAgentes analysisDate')
      .sort({ secretariaNombre: 1 });
    const secretariasFormateadas = secretarias.map(sec => ({
      id: sec.secretariaId,
      nombre: sec.secretariaNombre,
      totalAgentes: sec.data.totalAgentes,
      ultimaActualizacion: sec.analysisDate,
    }));
    res.json(secretariasFormateadas);
  } catch (error) {
    console.error('Error obteniendo secretarías:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener datos de análisis de una secretaría específica
const getSecretariaById = async (req, res) => {
  try {
    const secretariaId = req.params.id;
    const analisis = await AnalysisData.findOne({ secretariaId }).sort({ createdAt: -1 });
    if (!analisis) {
      return res.status(404).json({ message: 'No se encontraron datos para esta secretaría' });
    }
    const respuesta = {
      secretaria: {
        id: analisis.secretariaId,
        nombre: analisis.secretariaNombre,
        ultimaActualizacion: analisis.analysisDate,
      },
      resumen: {
        totalAgentes: analisis.data.totalAgentes,
        sueldoPromedio: analisis.data.analisisSalarial.sueldoPromedio,
        masaSalarial: analisis.data.analisisSalarial.masaTotal,
      },
      analisis: {
        contratacion: analisis.data.agentesPorContratacion,
        funcion: analisis.data.agentesPorFuncion,
        escalafon: analisis.data.agentesPorEscalafon,
        edad: analisis.data.agentesPorRangoEdad,
        antiguedad: analisis.data.agentesPorAntiguedad,
        genero: analisis.data.agentesPorGenero,
        salarial: analisis.data.analisisSalarial,
      },
      metadatos: {
        archivo: analisis.archivoInfo.nombreArchivo,
        fechaCarga: analisis.archivoInfo.fechaCarga,
        totalRegistros: analisis.archivoInfo.totalRegistros,
        version: analisis.version,
      },
    };
    res.json(respuesta);
  } catch (error) {
    console.error('Error obteniendo datos de secretaría:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener resumen general de todas las secretarías
const getResumen = async (req, res) => {
  try {
    const analisis = await AnalysisData.find({ activo: true })
      .select('secretariaNombre data.totalAgentes data.analisisSalarial.masaTotal');
    const resumen = {
      totalSecretarias: analisis.length,
      totalAgentes: analisis.reduce((sum, a) => sum + a.data.totalAgentes, 0),
      masaSalarialTotal: analisis.reduce((sum, a) => sum + a.data.analisisSalarial.masaTotal, 0),
      secretariasPorTamaño: {
        pequeñas: analisis.filter(a => a.data.totalAgentes < 100).length,
        medianas: analisis.filter(a => a.data.totalAgentes >= 100 && a.data.totalAgentes < 500).length,
        grandes: analisis.filter(a => a.data.totalAgentes >= 500).length,
      },
      secretarias: analisis.map(a => ({
        nombre: a.secretariaNombre,
        totalAgentes: a.data.totalAgentes,
        masaSalarial: a.data.analisisSalarial.masaTotal,
      })).sort((a, b) => b.totalAgentes - a.totalAgentes),
    };
    res.json(resumen);
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Comparar dos secretarías
const compararSecretarias = async (req, res) => {
  try {
    const { id1, id2 } = req.params;
    const [sec1, sec2] = await Promise.all([
      AnalysisData.findOne({ secretariaId: id1 }).sort({ createdAt: -1 }),
      AnalysisData.findOne({ secretariaId: id2 }).sort({ createdAt: -1 })
    ]);
    if (!sec1 || !sec2) {
      return res.status(404).json({ message: 'No se encontraron datos para una o ambas secretarías' });
    }
    const comparacion = {
      secretaria1: {
        nombre: sec1.secretariaNombre,
        totalAgentes: sec1.data.totalAgentes,
        sueldoPromedio: sec1.data.analisisSalarial.sueldoPromedio,
      },
      secretaria2: {
        nombre: sec2.secretariaNombre,
        totalAgentes: sec2.data.totalAgentes,
        sueldoPromedio: sec2.data.analisisSalarial.sueldoPromedio,
      },
      diferencias: {
        agentes: sec1.data.totalAgentes - sec2.data.totalAgentes,
        sueldo: sec1.data.analisisSalarial.sueldoPromedio - sec2.data.analisisSalarial.sueldoPromedio,
      },
    };
    res.json(comparacion);
  } catch (error) {
    console.error('Error comparando secretarías:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener estadísticas por campo específico
const getEstadisticasPorCampo = async (req, res) => {
  try {
    const campo = req.params.campo;
    const camposPermitidos = ['contratacion', 'funcion', 'escalafon', 'edad', 'antiguedad', 'genero'];
    if (!camposPermitidos.includes(campo)) {
      return res.status(400).json({ message: 'Campo no válido. Campos permitidos: ' + camposPermitidos.join(', ') });
    }
    const analises = await AnalysisData.find({ activo: true });
    const mapaCampos = {
      contratacion: 'agentesPorContratacion',
      funcion: 'agentesPorFuncion',
      escalafon: 'agentesPorEscalafon',
      edad: 'agentesPorRangoEdad',
      antiguedad: 'agentesPorAntiguedad',
      genero: 'agentesPorGenero',
    };
    const propiedad = mapaCampos[campo];
    const consolidado = {};
    analises.forEach(analisis => {
      const datos = analisis.data[propiedad] || [];
      datos.forEach(item => {
        const clave = item.tipo || item.funcion || item.escalafon || item.rango || item.genero;
        if (!consolidado[clave]) {
          consolidado[clave] = 0;
        }
        consolidado[clave] += item.cantidad;
      });
    });
    const total = Object.values(consolidado).reduce((sum, val) => sum + val, 0);
    const estadisticas = Object.entries(consolidado).map(([clave, cantidad]) => ({
      [campo === 'contratacion' ? 'tipo' : 
        campo === 'funcion' ? 'funcion' : 
        campo === 'escalafon' ? 'escalafon' : 
        campo === 'edad' || campo === 'antiguedad' ? 'rango' : 'genero']: clave,
      cantidad,
      porcentaje: parseFloat(((cantidad / total) * 100).toFixed(2)),
    })).sort((a, b) => b.cantidad - a.cantidad);
    res.json({ campo, total, estadisticas });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Descargar PDF con los datos de una secretaría
const downloadSecretariaPDF = async (req, res) => {
  try {
    const secretariaId = req.params.id;
    const analisis = await AnalysisData.findOne({ secretariaId }).sort({ createdAt: -1 });
    if (!analisis) {
      return res.status(404).json({ message: 'No se encontraron datos para esta secretaría' });
    }

    // Crear el PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${analisis.secretariaNombre}.pdf"`);
    doc.pipe(res);

    // Título
    doc.fontSize(18).text(`Análisis de Secretaría: ${analisis.secretariaNombre}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Fecha de análisis: ${analisis.analysisDate.toLocaleDateString()}`);
    doc.text(`Total de agentes: ${analisis.data.totalAgentes}`);
    doc.text(`Sueldo promedio: $${analisis.data.analisisSalarial.sueldoPromedio.toFixed(2)}`);
    doc.text(`Masa salarial: $${analisis.data.analisisSalarial.masaTotal.toFixed(2)}`);
    doc.moveDown();

    // Análisis por categorías
    const categorias = [
      { titulo: 'Contratación', datos: analisis.data.agentesPorContratacion, campo: 'tipo' },
      { titulo: 'Función', datos: analisis.data.agentesPorFuncion, campo: 'funcion' },
      { titulo: 'Escalafón', datos: analisis.data.agentesPorEscalafon, campo: 'escalafon' },
      { titulo: 'Edad', datos: analisis.data.agentesPorRangoEdad, campo: 'rango' },
      { titulo: 'Antigüedad', datos: analisis.data.agentesPorAntiguedad, campo: 'rango' },
      { titulo: 'Género', datos: analisis.data.agentesPorGenero, campo: 'genero' },
    ];
    categorias.forEach(cat => {
      doc.fontSize(14).text(cat.titulo, { underline: true });
      cat.datos.forEach(item => {
        doc.fontSize(12).text(`${item[cat.campo]}: ${item.cantidad} (${item.porcentaje}%)`);
      });
      doc.moveDown();
    });

    // Información del archivo
    doc.fontSize(10).text(`Archivo original: ${analisis.archivoInfo.nombreArchivo}`);
    doc.text(`Fecha de carga: ${analisis.archivoInfo.fechaCarga.toLocaleDateString()}`);
    doc.text(`Total de registros: ${analisis.archivoInfo.totalRegistros}`);
    doc.text(`Versión: ${analisis.version}`);

    doc.end();
  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ message: 'Error generando el PDF' });
  }
};

// Obtener historial de cargas de una secretaría
const getHistorialSecretaria = async (req, res) => {
  try {
    const secretariaId = req.params.id;
    const historial = await AnalysisData.find({ secretariaId })
      .sort({ analysisDate: -1 })
      .populate('archivoInfo.usuarioId', 'username email');
    const resultado = historial.map(item => ({
      version: item.version,
      fecha: item.analysisDate,
      archivo: item.archivoInfo?.nombreArchivo,
      usuario: item.archivoInfo?.usuarioId?.username || 'Desconocido',
      totalRegistros: item.archivoInfo?.totalRegistros,
    }));
    res.json(resultado);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const getSecretariasAnalytics = async (req, res) => {
  try {
    const analytics = await AnalysisData.find({ activo: true }).select('secretariaId secretariaNombre data.totalAgentes data.agentesPorContratacion data.agentesPorFuncion');
    res.json(analytics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// @desc    Get total number of agents
// @route   GET /api/analytics/agents/total
// @access  Private/Admin
const getTotalAgents = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const totalAgents = await Agent.countDocuments(match);
    res.json({ total: totalAgents });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ===== FUNCIONES PARA PLANTA Y CONTRATOS =====

// @desc    Get agents grouped by function (Planta y Contratos)
// @route   GET /api/analytics/agents/by-function
// @access  Private/Admin
const getAgentsByFunction = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const agentsByFunction = await Agent.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$Funcion',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          function: '$_id',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    res.json(agentsByFunction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get age distribution with scatter plot data (Planta y Contratos)
// @route   GET /api/analytics/agents/age-distribution
// @access  Private/Admin
const getAgeDistribution = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const agents = await Agent.find({
      ...match,
      'Fecha de nacimiento': { $exists: true, $ne: null, $ne: '' }
    }).limit(1000);

    const currentDate = new Date();
    const ageRanges = {
      '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56-65': 0, '65+': 0
    };

    const scatterData = [];

    agents.forEach(agent => {
      try {
        let birthDate = agent['Fecha de nacimiento'];
        
        if (typeof birthDate === 'string') {
          birthDate = new Date(birthDate);
        }
        
        if (!(birthDate instanceof Date) || isNaN(birthDate.getTime())) {
          return;
        }
        
        const age = Math.floor((currentDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        
        if (age < 0 || age > 120) {
          return;
        }
        
        const func = agent['Funcion'] || 'Sin especificar';
        
        if (age >= 18 && age <= 25) ageRanges['18-25']++;
        else if (age >= 26 && age <= 35) ageRanges['26-35']++;
        else if (age >= 36 && age <= 45) ageRanges['36-45']++;
        else if (age >= 46 && age <= 55) ageRanges['46-55']++;
        else if (age >= 56 && age <= 65) ageRanges['56-65']++;
        else if (age > 65) ageRanges['65+']++;

        scatterData.push({
          age,
          function: func,
          id: agent._id
        });
      } catch (agentError) {
        // Silently skip invalid agents
      }
    });

    const ageRangeData = Object.entries(ageRanges).map(([range, count]) => ({
      range,
      count
    }));

    res.json({
      scatterData,
      rangeData: ageRangeData,
      totalAgents: scatterData.length,
      note: scatterData.length === 1000 ? 'Mostrando muestra de 1000 agentes para mejor rendimiento' : null
    });
  } catch (err) {
    console.error('Error en análisis de edad:', err.message);
    res.status(500).json({ 
      error: 'Error en análisis de edad',
      message: err.message 
    });
  }
};

// @desc    Get age distribution by function (Planta y Contratos)
// @route   GET /api/analytics/agents/age-by-function
// @access  Private/Admin
const getAgeByFunction = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const agents = await Agent.find({
      ...match,
      'Fecha de nacimiento': { $exists: true, $ne: null, $ne: '' },
      'Funcion': { $exists: true, $ne: null, $ne: '' }
    }).limit(2000);

    const currentDate = new Date();
    const functionAgeData = {};

    agents.forEach(agent => {
      try {
        let birthDate = agent['Fecha de nacimiento'];
        
        if (typeof birthDate === 'string') {
          birthDate = new Date(birthDate);
        }
        
        if (!(birthDate instanceof Date) || isNaN(birthDate.getTime())) {
          return;
        }
        
        const age = Math.floor((currentDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        
        if (age < 0 || age > 120) {
          return;
        }
        
        const func = agent['Funcion'] || 'Sin especificar';
        
        if (!functionAgeData[func]) {
          functionAgeData[func] = { ages: [], count: 0 };
        }
        
        functionAgeData[func].ages.push(age);
        functionAgeData[func].count++;
      } catch (agentError) {
        // Silently skip invalid agents
      }
    });

    const result = Object.entries(functionAgeData).map(([func, data]) => {
      const avgAge = data.ages.reduce((sum, age) => sum + age, 0) / data.ages.length;
      return {
        function: func,
        count: data.count,
        avgAge: Math.round(avgAge * 100) / 100,
        ages: data.ages
      };
    }).sort((a, b) => b.count - a.count).slice(0, 20);

    res.json(result);
  } catch (err) {
    console.error('Error en análisis de edad por función:', err.message);
    res.status(500).json({ 
      error: 'Error en análisis de edad por función',
      message: err.message 
    });
  }
};

// @desc    Get age distribution by secretaria (Planta y Contratos)
// @route   GET /api/analytics/agents/age-by-secretaria
// @access  Private/Admin
const getAgeBySecretaria = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const agents = await Agent.find({
      ...match,
      'Fecha de nacimiento': { $exists: true, $ne: null, $ne: '' },
      'Secretaria': { $exists: true, $ne: null, $ne: '' }
    }).limit(2000);

    const currentDate = new Date();
    const secretariaAgeData = {};

    agents.forEach(agent => {
      try {
        let birthDate = agent['Fecha de nacimiento'];
        
        if (typeof birthDate === 'string') {
          birthDate = new Date(birthDate);
        }
        
        if (!(birthDate instanceof Date) || isNaN(birthDate.getTime())) {
          return;
        }
        
        const age = Math.floor((currentDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        
        if (age < 0 || age > 120) {
          return;
        }
        
        const secretaria = agent['Secretaria'] || 'Sin especificar';
        
        if (!secretariaAgeData[secretaria]) {
          secretariaAgeData[secretaria] = { ages: [], count: 0 };
        }
        
        secretariaAgeData[secretaria].ages.push(age);
        secretariaAgeData[secretaria].count++;
      } catch (agentError) {
        // Silently skip invalid agents
      }
    });

    const result = Object.entries(secretariaAgeData).map(([secretaria, data]) => {
      const avgAge = data.ages.reduce((sum, age) => sum + age, 0) / data.ages.length;
      return {
        secretaria: secretaria,
        count: data.count,
        avgAge: Math.round(avgAge * 100) / 100,
        ages: data.ages
      };
    }).sort((a, b) => b.count - a.count).slice(0, 15);

    res.json(result);
  } catch (err) {
    console.error('Error en análisis de edad por secretaría:', err.message);
    res.status(500).json({ 
      error: 'Error en análisis de edad por secretaría',
      message: err.message 
    });
  }
};

// @desc    Get agents by employment type (planta permanente, etc.) (Planta y Contratos)
// @route   GET /api/analytics/agents/by-employment-type
// @access  Private/Admin
const getAgentsByEmploymentType = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const agentsByType = await Agent.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$Situación de revista',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          type: { $ifNull: ['$_id', 'Sin especificar'] },
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    res.json(agentsByType);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get agents by dependency (Planta y Contratos)
// @route   GET /api/analytics/agents/by-dependency
// @access  Private/Admin
const getAgentsByDependency = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const agentsByDependency = await Agent.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$Dependencia donde trabaja',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          dependency: { $ifNull: ['$_id', 'Sin especificar'] },
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    res.json(agentsByDependency);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get agents by secretaria (Planta y Contratos)
// @route   GET /api/analytics/agents/by-secretaria
// @access  Private/Admin
const getAgentsBySecretaria = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const agentsBySecretaria = await Agent.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$Secretaria',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          secretaria: { $ifNull: ['$_id', 'Sin especificar'] },
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    res.json(agentsBySecretaria);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get agents by subsecretaria (Planta y Contratos)
// @route   GET /api/analytics/agents/by-subsecretaria
// @access  Private/Admin
const getAgentsBySubsecretaria = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const agentsBySubsecretaria = await Agent.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$Subsecretaria',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          subsecretaria: { $ifNull: ['$_id', 'Sin especificar'] },
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    res.json(agentsBySubsecretaria);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get agents by direccion general (Planta y Contratos)
// @route   GET /api/analytics/agents/by-direccion-general
// @access  Private/Admin
const getAgentsByDireccionGeneral = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const agentsByDireccionGeneral = await Agent.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$Dirección general',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          direccionGeneral: { $ifNull: ['$_id', 'Sin especificar'] },
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    res.json(agentsByDireccionGeneral);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get agents by direccion (Planta y Contratos)
// @route   GET /api/analytics/agents/by-direccion
// @access  Private/Admin
const getAgentsByDireccion = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const agentsByDireccion = await Agent.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$Dirección',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          direccion: { $ifNull: ['$_id', 'Sin especificar'] },
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    res.json(agentsByDireccion);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get agents by departamento (Planta y Contratos)
// @route   GET /api/analytics/agents/by-departamento
// @access  Private/Admin
const getAgentsByDepartamento = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const agentsByDepartamento = await Agent.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$Departamento',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          departamento: { $ifNull: ['$_id', 'Sin especificar'] },
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    res.json(agentsByDepartamento);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get agents by division (Planta y Contratos)
// @route   GET /api/analytics/agents/by-division
// @access  Private/Admin
const getAgentsByDivision = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const agentsByDivision = await Agent.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$División',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          division: { $ifNull: ['$_id', 'Sin especificar'] },
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    res.json(agentsByDivision);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ===== FUNCIONES PARA NEIKES Y BECAS =====

// @desc    Get agents by function for Neikes y Beca
// @route   GET /api/analytics/agents/by-function-neike-beca
// @access  Private/Admin
const getAgentsByFunctionNeikeBeca = async (req, res) => {
  try {
    const agentsByFunction = await Agent.aggregate([
      { $match: { plantilla: "Rama completa - Neikes y Beca" } },
      {
        $group: {
          _id: '$Funcion',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          function: '$_id',
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);
    res.json(agentsByFunction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get agents by employment type for Neikes y Beca
// @route   GET /api/analytics/agents/by-employment-type-neike-beca
// @access  Private/Admin
const getAgentsByEmploymentTypeNeikeBeca = async (req, res) => {
  try {
    const agentsByType = await Agent.aggregate([
      { $match: { plantilla: "Rama completa - Neikes y Beca" } },
      {
        $group: {
          _id: '$Situación de revista',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          type: { $ifNull: ['$_id', 'Sin especificar'] },
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);
    res.json(agentsByType);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get age distribution for Neikes y Beca
// @route   GET /api/analytics/agents/age-distribution-neike-beca
// @access  Private/Admin
const getAgeDistributionNeikeBeca = async (req, res) => {
  try {
    const agents = await Agent.find({ 
      'Fecha de nacimiento': { $exists: true, $ne: null, $ne: '' },
      plantilla: "Rama completa - Neikes y Beca"
    }).limit(1000);

    const currentDate = new Date();
    const ageRanges = {
      '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56-65': 0, '65+': 0
    };

    const scatterData = [];

    agents.forEach(agent => {
      try {
        let birthDate = agent['Fecha de nacimiento'];
        
        if (typeof birthDate === 'string') {
          birthDate = new Date(birthDate);
        }
        
        if (!(birthDate instanceof Date) || isNaN(birthDate.getTime())) {
          return;
        }
        
        const age = Math.floor((currentDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        
        if (age < 0 || age > 120) {
          return;
        }
        
        const func = agent['Funcion'] || 'Sin especificar';
        
        if (age >= 18 && age <= 25) ageRanges['18-25']++;
        else if (age >= 26 && age <= 35) ageRanges['26-35']++;
        else if (age >= 36 && age <= 45) ageRanges['36-45']++;
        else if (age >= 46 && age <= 55) ageRanges['46-55']++;
        else if (age >= 56 && age <= 65) ageRanges['56-65']++;
        else if (age > 65) ageRanges['65+']++;

        scatterData.push({
          age,
          function: func,
          id: agent._id
        });
      } catch (agentError) {
        // Silently skip invalid agents
      }
    });

    const ageRangeData = Object.entries(ageRanges).map(([range, count]) => ({
      range,
      count
    }));

    res.json({
      scatterData,
      rangeData: ageRangeData,
      totalAgents: scatterData.length,
      note: scatterData.length === 1000 ? 'Mostrando muestra de 1000 agentes para mejor rendimiento' : null
    });
  } catch (err) {
    console.error('Error en análisis de edad Neikes y Beca:', err.message);
    res.status(500).json({ 
      error: 'Error en análisis de edad Neikes y Beca',
      message: err.message 
    });
  }
};

// @desc    Get age distribution by function for Neikes y Beca
// @route   GET /api/analytics/agents/age-by-function-neike-beca
// @access  Private/Admin
const getAgeByFunctionNeikeBeca = async (req, res) => {
  try {
    const agents = await Agent.find({ 
      'Fecha de nacimiento': { $exists: true, $ne: null, $ne: '' },
      'Funcion': { $exists: true, $ne: null, $ne: '' },
      plantilla: "Rama completa - Neikes y Beca"
    }).limit(2000);

    const currentDate = new Date();
    const functionAgeData = {};

    agents.forEach(agent => {
      try {
        let birthDate = agent['Fecha de nacimiento'];
        
        if (typeof birthDate === 'string') {
          birthDate = new Date(birthDate);
        }
        
        if (!(birthDate instanceof Date) || isNaN(birthDate.getTime())) {
          return;
        }
        
        const age = Math.floor((currentDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        
        if (age < 0 || age > 120) {
          return;
        }
        
        const func = agent['Funcion'] || 'Sin especificar';
        
        if (!functionAgeData[func]) {
          functionAgeData[func] = { ages: [], count: 0 };
        }
        
        functionAgeData[func].ages.push(age);
        functionAgeData[func].count++;
      } catch (agentError) {
        // Silently skip invalid agents
      }
    });

    const result = Object.entries(functionAgeData).map(([func, data]) => {
      const avgAge = data.ages.reduce((sum, age) => sum + age, 0) / data.ages.length;
      return {
        function: func,
        count: data.count,
        avgAge: Math.round(avgAge * 100) / 100,
        ages: data.ages
      };
    }).sort((a, b) => b.count - a.count).slice(0, 20);

    res.json(result);
  } catch (err) {
    console.error('Error en análisis de edad por función Neikes y Beca:', err.message);
    res.status(500).json({ 
      error: 'Error en análisis de edad por función Neikes y Beca',
      message: err.message 
    });
  }
};

// @desc    Get age distribution by secretaria for Neikes y Beca
// @route   GET /api/analytics/agents/age-by-secretaria-neike-beca
// @access  Private/Admin
const getAgeBySecretariaNeikeBeca = async (req, res) => {
  try {
    const agents = await Agent.find({ 
      'Fecha de nacimiento': { $exists: true, $ne: null, $ne: '' },
      'Secretaria': { $exists: true, $ne: null, $ne: '' },
      plantilla: "Rama completa - Neikes y Beca"
    }).limit(2000);

    const currentDate = new Date();
    const secretariaAgeData = {};

    agents.forEach(agent => {
      try {
        let birthDate = agent['Fecha de nacimiento'];
        
        if (typeof birthDate === 'string') {
          birthDate = new Date(birthDate);
        }
        
        if (!(birthDate instanceof Date) || isNaN(birthDate.getTime())) {
          return;
        }
        
        const age = Math.floor((currentDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        
        if (age < 0 || age > 120) {
          return;
        }
        
        const secretaria = agent['Secretaria'] || 'Sin especificar';
        
        if (!secretariaAgeData[secretaria]) {
          secretariaAgeData[secretaria] = { ages: [], count: 0 };
        }
        
        secretariaAgeData[secretaria].ages.push(age);
        secretariaAgeData[secretaria].count++;
      } catch (agentError) {
        // Silently skip invalid agents
      }
    });

    const result = Object.entries(secretariaAgeData).map(([secretaria, data]) => {
      const avgAge = data.ages.reduce((sum, age) => sum + age, 0) / data.ages.length;
      return {
        secretaria: secretaria,
        count: data.count,
        avgAge: Math.round(avgAge * 100) / 100,
        ages: data.ages
      };
    }).sort((a, b) => b.count - a.count).slice(0, 15);

    res.json(result);
  } catch (err) {
    console.error('Error en análisis de edad por secretaría Neikes y Beca:', err.message);
    res.status(500).json({ 
      error: 'Error en análisis de edad por secretaría Neikes y Beca',
      message: err.message 
    });
  }
};

// @desc    Get agents by secretaria for Neikes y Beca
// @route   GET /api/analytics/agents/by-secretaria-neike-beca
// @access  Private/Admin
const getAgentsBySecretariaNeikeBeca = async (req, res) => {
  try {
    const agents = await Agent.find({ 
      'Secretaria': { $exists: true, $ne: null, $ne: '' },
      plantilla: "Rama completa - Neikes y Beca"
    }).limit(2000);

    const secretariaCount = {};
    
    agents.forEach(agent => {
      const secretaria = agent['Secretaria'] || 'Sin especificar';
      secretariaCount[secretaria] = (secretariaCount[secretaria] || 0) + 1;
    });

    const result = Object.entries(secretariaCount)
      .map(([secretaria, count]) => ({ secretaria, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    res.json(result);
  } catch (err) {
    console.error('Error en análisis de agentes por secretaría Neikes y Beca:', err.message);
    res.status(500).json({ 
      error: 'Error en análisis de agentes por secretaría Neikes y Beca',
      message: err.message 
    });
  }
};

// @desc    Get agents by dependency for Neikes y Beca
// @route   GET /api/analytics/agents/by-dependency-neike-beca
// @access  Private/Admin
const getAgentsByDependencyNeikeBeca = async (req, res) => {
  try {
    const agents = await Agent.find({ 
      'Dependencia': { $exists: true, $ne: null, $ne: '' },
      plantilla: "Rama completa - Neikes y Beca"
    }).limit(2000);

    const dependencyCount = {};
    
    agents.forEach(agent => {
      const dependency = agent['Dependencia'] || 'Sin especificar';
      dependencyCount[dependency] = (dependencyCount[dependency] || 0) + 1;
    });

    const result = Object.entries(dependencyCount)
      .map(([dependency, count]) => ({ dependency, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    res.json(result);
  } catch (err) {
    console.error('Error en análisis de agentes por dependencia Neikes y Beca:', err.message);
    res.status(500).json({ 
      error: 'Error en análisis de agentes por dependencia Neikes y Beca',
      message: err.message 
    });
  }
};

// @desc    Get agents by subsecretaria for Neikes y Beca
// @route   GET /api/analytics/agents/by-subsecretaria-neike-beca
// @access  Private/Admin
const getAgentsBySubsecretariaNeikeBeca = async (req, res) => {
  try {
    const agents = await Agent.find({ 
      'Subsecretaria': { $exists: true, $ne: null, $ne: '' },
      plantilla: "Rama completa - Neikes y Beca"
    }).limit(2000);

    const subsecretariaCount = {};
    
    agents.forEach(agent => {
      const subsecretaria = agent['Subsecretaria'] || 'Sin especificar';
      subsecretariaCount[subsecretaria] = (subsecretariaCount[subsecretaria] || 0) + 1;
    });

    const result = Object.entries(subsecretariaCount)
      .map(([subsecretaria, count]) => ({ subsecretaria, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    res.json(result);
  } catch (err) {
    console.error('Error en análisis de agentes por subsecretaría Neikes y Beca:', err.message);
    res.status(500).json({ 
      error: 'Error en análisis de agentes por subsecretaría Neikes y Beca',
      message: err.message 
    });
  }
};

// @desc    Get agents by direccion general for Neikes y Beca
// @route   GET /api/analytics/agents/by-direccion-general-neike-beca
// @access  Private/Admin
const getAgentsByDireccionGeneralNeikeBeca = async (req, res) => {
  try {
    const agents = await Agent.find({ 
      'Direccion General': { $exists: true, $ne: null, $ne: '' },
      plantilla: "Rama completa - Neikes y Beca"
    }).limit(2000);

    const direccionGeneralCount = {};
    
    agents.forEach(agent => {
      const direccionGeneral = agent['Direccion General'] || 'Sin especificar';
      direccionGeneralCount[direccionGeneral] = (direccionGeneralCount[direccionGeneral] || 0) + 1;
    });

    const result = Object.entries(direccionGeneralCount)
      .map(([direccionGeneral, count]) => ({ direccionGeneral, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    res.json(result);
  } catch (err) {
    console.error('Error en análisis de agentes por dirección general Neikes y Beca:', err.message);
    res.status(500).json({ 
      error: 'Error en análisis de agentes por dirección general Neikes y Beca',
      message: err.message 
    });
  }
};

// @desc    Get agents by direccion for Neikes y Beca
// @route   GET /api/analytics/agents/by-direccion-neike-beca
// @access  Private/Admin
const getAgentsByDireccionNeikeBeca = async (req, res) => {
  try {
    const agents = await Agent.find({ 
      'Direccion': { $exists: true, $ne: null, $ne: '' },
      plantilla: "Rama completa - Neikes y Beca"
    }).limit(2000);

    const direccionCount = {};
    
    agents.forEach(agent => {
      const direccion = agent['Direccion'] || 'Sin especificar';
      direccionCount[direccion] = (direccionCount[direccion] || 0) + 1;
    });

    const result = Object.entries(direccionCount)
      .map(([direccion, count]) => ({ direccion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    res.json(result);
  } catch (err) {
    console.error('Error en análisis de agentes por dirección Neikes y Beca:', err.message);
    res.status(500).json({ 
      error: 'Error en análisis de agentes por dirección Neikes y Beca',
      message: err.message 
    });
  }
};

// @desc    Get agents by departamento for Neikes y Beca
// @route   GET /api/analytics/agents/by-departamento-neike-beca
// @access  Private/Admin
const getAgentsByDepartamentoNeikeBeca = async (req, res) => {
  try {
    const agents = await Agent.find({ 
      'Departamento': { $exists: true, $ne: null, $ne: '' },
      plantilla: "Rama completa - Neikes y Beca"
    }).limit(2000);

    const departamentoCount = {};
    
    agents.forEach(agent => {
      const departamento = agent['Departamento'] || 'Sin especificar';
      departamentoCount[departamento] = (departamentoCount[departamento] || 0) + 1;
    });

    const result = Object.entries(departamentoCount)
      .map(([departamento, count]) => ({ departamento, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    res.json(result);
  } catch (err) {
    console.error('Error en análisis de agentes por departamento Neikes y Beca:', err.message);
    res.status(500).json({ 
      error: 'Error en análisis de agentes por departamento Neikes y Beca',
      message: err.message 
    });
  }
};

// @desc    Get agents by division for Neikes y Beca
// @route   GET /api/analytics/agents/by-division-neike-beca
// @access  Private/Admin
const getAgentsByDivisionNeikeBeca = async (req, res) => {
  try {
    const agents = await Agent.find({ 
      'Division': { $exists: true, $ne: null, $ne: '' },
      plantilla: "Rama completa - Neikes y Beca"
    }).limit(2000);

    const divisionCount = {};
    
    agents.forEach(agent => {
      const division = agent['Division'] || 'Sin especificar';
      divisionCount[division] = (divisionCount[division] || 0) + 1;
    });

    const result = Object.entries(divisionCount)
      .map(([division, count]) => ({ division, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    res.json(result);
  } catch (err) {
    console.error('Error en análisis de agentes por división Neikes y Beca:', err.message);
    res.status(500).json({
      error: 'Error en análisis de agentes por división Neikes y Beca',
      message: err.message
    });
  }
};

// -----------------------------------------------------------------------------
// Nuevas funciones de análisis para antigüedad, estudios y certificaciones
// -----------------------------------------------------------------------------

// @desc    Cantidad de agentes según rangos de antigüedad municipal
// @route   GET /api/analytics/agents/seniority
// @access  Private/Admin
const getAgentsBySeniority = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const agents = await Agent.find({
      ...match,
      'Años en la municipalidad': { $exists: true, $ne: null, $ne: '' }
    }).limit(5000);

    const ranges = {
      '1-10': 0,
      '11-20': 0,
      '21-30': 0,
      '31-40': 0,
      '41-50': 0
    };

    agents.forEach(agent => {
      const years = parseInt(agent['Años en la municipalidad'], 10);
      if (isNaN(years)) return;
      if (years <= 10) ranges['1-10']++;
      else if (years <= 20) ranges['11-20']++;
      else if (years <= 30) ranges['21-30']++;
      else if (years <= 40) ranges['31-40']++;
      else ranges['41-50']++;
    });

    const result = Object.entries(ranges).map(([range, count]) => ({ range, count }));
    res.json(result);
  } catch (err) {
    console.error('Error en análisis de antigüedad:', err.message);
    res.status(500).json({ error: 'Error en análisis de antigüedad', message: err.message });
  }
};

// Función auxiliar para contar estudios por tipo de columna
const countStudies = async (match, column) => {
  const res = await Agent.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        conTitulo: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: [`$${column}`, null] },
                  { $ne: [`$${column}`, ''] }
                ]
              },
              1,
              0
            ]
          }
        },
        total: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        conTitulo: 1,
        otros: { $subtract: ['$total', '$conTitulo'] }
      }
    }
  ]);
  return res[0] || { conTitulo: 0, otros: 0 };
};

// @desc    Cantidad de agentes según estudios secundarios
const getAgentsBySecondaryStudies = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const result = await countStudies(match, 'Estudios Secundario');
    res.json(result);
  } catch (err) {
    console.error('Error en estudios secundarios:', err.message);
    res.status(500).json({ error: 'Error en estudios secundarios', message: err.message });
  }
};

// @desc    Cantidad de agentes según estudios terciarios
const getAgentsByTertiaryStudies = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const result = await countStudies(match, 'Estudios Terciario');
    res.json(result);
  } catch (err) {
    console.error('Error en estudios terciarios:', err.message);
    res.status(500).json({ error: 'Error en estudios terciarios', message: err.message });
  }
};

// @desc    Cantidad de agentes según estudios universitarios
const getAgentsByUniversityStudies = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const result = await countStudies(match, 'Estudios Universitarios');
    res.json(result);
  } catch (err) {
    console.error('Error en estudios universitarios:', err.message);
    res.status(500).json({ error: 'Error en estudios universitarios', message: err.message });
  }
};

// @desc    Top 10 secretarías con más agentes con estudios universitarios
const getTopSecretariasByUniversity = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const result = await Agent.aggregate([
      {
        $match: {
          ...match,
          'Estudios Universitarios': { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$Secretaria',
          count: { $sum: 1 }
        }
      },
      { $project: { _id: 0, secretaria: '$_id', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(result);
  } catch (err) {
    console.error('Error en top secretarías universidad:', err.message);
    res.status(500).json({ error: 'Error en top secretarías universidad', message: err.message });
  }
};

// @desc    Top 10 secretarías con más agentes con estudios terciarios
const getTopSecretariasByTertiary = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const result = await Agent.aggregate([
      {
        $match: {
          ...match,
          'Estudios Terciario': { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$Secretaria',
          count: { $sum: 1 }
        }
      },
      { $project: { _id: 0, secretaria: '$_id', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(result);
  } catch (err) {
    console.error('Error en top secretarías terciario:', err.message);
    res.status(500).json({ error: 'Error en top secretarías terciario', message: err.message });
  }
};

// @desc    Cantidad de agentes según tipo de registración
const getAgentsByRegistrationType = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const raw = await Agent.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $cond: [
              { $or: [ { $eq: ['$Tipo de registración', null] }, { $eq: ['$Tipo de registración', ''] } ] },
              'Sin tipo de registración',
              '$Tipo de registración'
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const map = { SCANN: 'Scanner', PLANI: 'Planilla', BIOME: 'Biométrico' };
    const result = raw.map(r => ({
      tipo: map[r._id] || r._id,
      count: r.count
    }));

    res.json(result);
  } catch (err) {
    console.error('Error en tipos de registración:', err.message);
    res.status(500).json({ error: 'Error en tipos de registración', message: err.message });
  }
};

// @desc    Cantidad de agentes por horario de entrada
const getAgentsByEntryTime = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const result = await Agent.aggregate([
      {
        $match: {
          ...match,
          'Horario de entrada': { $exists: true, $ne: null, $ne: '' }
        }
      },
      { $group: { _id: '$Horario de entrada', count: { $sum: 1 } } },
      { $project: { _id: 0, time: '$_id', count: 1 } },
      { $sort: { count: -1 } }
    ]);
    res.json(result);
  } catch (err) {
    console.error('Error en horarios de entrada:', err.message);
    res.status(500).json({ error: 'Error en horarios de entrada', message: err.message });
  }
};

// @desc    Cantidad de agentes por horario de salida
const getAgentsByExitTime = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const result = await Agent.aggregate([
      {
        $match: {
          ...match,
          'Horario de salida': { $exists: true, $ne: null, $ne: '' }
        }
      },
      { $group: { _id: '$Horario de salida', count: { $sum: 1 } } },
      { $project: { _id: 0, time: '$_id', count: 1 } },
      { $sort: { count: -1 } }
    ]);
    res.json(result);
  } catch (err) {
    console.error('Error en horarios de salida:', err.message);
    res.status(500).json({ error: 'Error en horarios de salida', message: err.message });
  }
};

// @desc    Top 10 unidades de registración con más agentes
const getTopRegistrationUnits = async (req, res) => {
  try {
    const match = buildMatchStage(req.query);
    const result = await Agent.aggregate([
      {
        $match: {
          ...match,
          'Unidad de registración': { $exists: true, $ne: null, $ne: '' }
        }
      },
      { $group: { _id: '$Unidad de registración', count: { $sum: 1 } } },
      { $project: { _id: 0, unidad: '$_id', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(result);
  } catch (err) {
    console.error('Error en unidades de registración:', err.message);
    res.status(500).json({ error: 'Error en unidades de registración', message: err.message });
  }
};

// Función para notificar modificaciones en el dashboard
const notifyDashboardModification = async (req, res) => {
  try {
    const { fileName, totalRecords, secretaria, action } = req.body;
    
    if (!fileName) {
      return res.status(400).json({ 
        success: false, 
        message: 'El nombre del archivo es requerido' 
      });
    }

    const dashboardInfo = {
      action: action || 'modify',
      fileName,
      totalRecords: totalRecords || 0,
      secretaria: secretaria || 'General',
      uploadedBy: req.user?.username || 'Sistema'
    };

    const result = await emailService.notifyDashboardUpdate(dashboardInfo);
    
    res.json({
      success: true,
      message: 'Notificaciones enviadas correctamente',
      data: result
    });

  } catch (error) {
    console.error('Error enviando notificaciones de modificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error enviando notificaciones',
      error: error.message
    });
  }
};

module.exports = {
  getSecretarias,
  getSecretariaById,
  getResumen,
  compararSecretarias,
  getEstadisticasPorCampo,
  downloadSecretariaPDF,
  getHistorialSecretaria,
  getSecretariasAnalytics,
  getTotalAgents,
  getAgentsByFunction,
  getAgeDistribution,
  getAgeByFunction,
  getAgentsByEmploymentType,
  getAgentsByDependency,
  getAgentsBySecretaria,
  getAgentsBySubsecretaria,
  getAgentsByDireccionGeneral,
  getAgentsByDireccion,
  getAgentsByDepartamento,
  getAgentsByDivision,
  getAgeBySecretaria,
  getAgentsByFunctionNeikeBeca,
  getAgentsByEmploymentTypeNeikeBeca,
  getAgeDistributionNeikeBeca,
  getAgeByFunctionNeikeBeca,
  getAgeBySecretariaNeikeBeca,
  getAgentsBySecretariaNeikeBeca,
  getAgentsByDependencyNeikeBeca,
  getAgentsBySubsecretariaNeikeBeca,
  getAgentsByDireccionGeneralNeikeBeca,
  getAgentsByDireccionNeikeBeca,
  getAgentsByDepartamentoNeikeBeca,
  getAgentsByDivisionNeikeBeca,
  getAgentsBySeniority,
  getAgentsBySecondaryStudies,
  getAgentsByTertiaryStudies,
  getAgentsByUniversityStudies,
  getTopSecretariasByUniversity,
  getTopSecretariasByTertiary,
  getAgentsByRegistrationType,
  getAgentsByEntryTime,
  getAgentsByExitTime,
  getTopRegistrationUnits,
  notifyDashboardModification
};