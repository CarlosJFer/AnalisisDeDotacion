const AnalysisData = require('../models/AnalysisData');
const Agent = require('../models/Agent'); // Importamos el modelo Agent
const PDFDocument = require('pdfkit');

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
    const totalAgents = await Agent.countDocuments();
    res.json({ total: totalAgents });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get agents grouped by function
// @route   GET /api/analytics/agents/by-function
// @access  Private/Admin
const getAgentsByFunction = async (req, res) => {
  try {
    const agentsByFunction = await Agent.aggregate([
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

// @desc    Get age distribution with scatter plot data
// @route   GET /api/analytics/agents/age-distribution
// @access  Private/Admin
const getAgeDistribution = async (req, res) => {
  try {
    console.log('Iniciando análisis de edad simplificado...');
    
    // Método simple sin agregación para evitar problemas de fechas
    const agents = await Agent.find({ 
      'Fecha de nacimiento': { $exists: true, $ne: null, $ne: '' } 
    }).limit(1000);
    
    console.log(`Encontrados ${agents.length} agentes con fecha de nacimiento`);

    const currentDate = new Date();
    const ageRanges = {
      '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56-65': 0, '65+': 0
    };

    const scatterData = [];

    agents.forEach(agent => {
      try {
        let birthDate = agent['Fecha de nacimiento'];
        
        // Convertir a Date si es string
        if (typeof birthDate === 'string') {
          birthDate = new Date(birthDate);
        }
        
        // Validar que sea una fecha válida
        if (!(birthDate instanceof Date) || isNaN(birthDate.getTime())) {
          return; // Saltar este agente
        }
        
        const age = Math.floor((currentDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        
        // Validar edad razonable
        if (age < 0 || age > 120) {
          return; // Saltar este agente
        }
        
        const func = agent['Funcion'] || 'Sin especificar';
        
        // Contar rangos
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
        console.log(`Error procesando agente ${agent._id}:`, agentError.message);
      }
    });

    const ageRangeData = Object.entries(ageRanges).map(([range, count]) => ({
      range,
      count
    }));

    console.log(`Análisis completado. Procesados: ${scatterData.length} agentes válidos`);
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

// @desc    Get age distribution by function
// @route   GET /api/analytics/agents/age-by-function
// @access  Private/Admin
const getAgeByFunction = async (req, res) => {
  try {
    console.log('Iniciando análisis de edad por función simplificado...');
    
    // Método simple sin agregación
    const agents = await Agent.find({ 
      'Fecha de nacimiento': { $exists: true, $ne: null, $ne: '' },
      'Funcion': { $exists: true, $ne: null, $ne: '' }
    }).limit(2000);
    
    console.log(`Encontrados ${agents.length} agentes`);

    const currentDate = new Date();
    const functionAgeData = {};

    agents.forEach(agent => {
      try {
        let birthDate = agent['Fecha de nacimiento'];
        
        // Convertir a Date si es string
        if (typeof birthDate === 'string') {
          birthDate = new Date(birthDate);
        }
        
        // Validar que sea una fecha válida
        if (!(birthDate instanceof Date) || isNaN(birthDate.getTime())) {
          return; // Saltar este agente
        }
        
        const age = Math.floor((currentDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        
        // Validar edad razonable
        if (age < 0 || age > 120) {
          return; // Saltar este agente
        }
        
        const func = agent['Funcion'] || 'Sin especificar';
        
        if (!functionAgeData[func]) {
          functionAgeData[func] = { ages: [], count: 0 };
        }
        
        functionAgeData[func].ages.push(age);
        functionAgeData[func].count++;
      } catch (agentError) {
        console.log(`Error procesando agente ${agent._id}:`, agentError.message);
      }
    });

    // Calcular promedio de edad por función
    const result = Object.entries(functionAgeData).map(([func, data]) => {
      const avgAge = data.ages.reduce((sum, age) => sum + age, 0) / data.ages.length;
      return {
        function: func,
        count: data.count,
        avgAge: Math.round(avgAge * 100) / 100,
        ages: data.ages
      };
    }).sort((a, b) => b.count - a.count).slice(0, 20); // Top 20

    console.log(`Análisis completado para ${result.length} funciones`);
    res.json(result);
  } catch (err) {
    console.error('Error en análisis de edad por función:', err.message);
    res.status(500).json({ 
      error: 'Error en análisis de edad por función',
      message: err.message 
    });
  }
};

// @desc    Get agents by employment type (planta permanente, etc.)
// @route   GET /api/analytics/agents/by-employment-type
// @access  Private/Admin
const getAgentsByEmploymentType = async (req, res) => {
  try {
    const agentsByType = await Agent.aggregate([
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

// @desc    Get agents by dependency
// @route   GET /api/analytics/agents/by-dependency
// @access  Private/Admin
const getAgentsByDependency = async (req, res) => {
  try {
    const agentsByDependency = await Agent.aggregate([
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

// @desc    Get agents by secretaria
// @route   GET /api/analytics/agents/by-secretaria
// @access  Private/Admin
const getAgentsBySecretaria = async (req, res) => {
  try {
    const agentsBySecretaria = await Agent.aggregate([
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

// @desc    Get agents by subsecretaria
// @route   GET /api/analytics/agents/by-subsecretaria
// @access  Private/Admin
const getAgentsBySubsecretaria = async (req, res) => {
  try {
    const agentsBySubsecretaria = await Agent.aggregate([
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

// @desc    Get agents by direccion general
// @route   GET /api/analytics/agents/by-direccion-general
// @access  Private/Admin
const getAgentsByDireccionGeneral = async (req, res) => {
  try {
    const agentsByDireccionGeneral = await Agent.aggregate([
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

// @desc    Get agents by direccion
// @route   GET /api/analytics/agents/by-direccion
// @access  Private/Admin
const getAgentsByDireccion = async (req, res) => {
  try {
    const agentsByDireccion = await Agent.aggregate([
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

// @desc    Get agents by departamento
// @route   GET /api/analytics/agents/by-departamento
// @access  Private/Admin
const getAgentsByDepartamento = async (req, res) => {
  try {
    const agentsByDepartamento = await Agent.aggregate([
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

// @desc    Get agents by division
// @route   GET /api/analytics/agents/by-division
// @access  Private/Admin
const getAgentsByDivision = async (req, res) => {
  try {
    const agentsByDivision = await Agent.aggregate([
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
  getAgentsByDivision
};