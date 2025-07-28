// -----------------------------------------------------------------------------
// ARCHIVO: /routes/variableEspecifica.js
// -----------------------------------------------------------------------------

const express = require('express');
const router = express.Router();
const VariableEspecifica = require('../models/VariableEspecifica');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Lista de secretarías modelo (constante para el frontend)
const SECRETARIAS_MODELO = [
  'INTENDENCIA',
  'VICE-INTENDENCIA',
  'SEC. DE COORDINACION DE GOBIERNO',
  'SEC. DE HACIENDA',
  'SEC. DE DESARROLLO URBANO',
  'SEC. DE DESARROLLO ECONOMICO',
  'SEC. DE INFRAESTRUCTURA',
  'SEC. DE SALUD',
  'SEC. DE AMBIENTE Y DESARROLLO SUSTENTABLE',
  'SEC. DE MOVILIDAD URBANA Y SEGURIDAD CIUDADANA',
  'SEC. DE TURISMO Y DEPORTES',
  'SERVICIO JURIDICO PERMANENTE',
  'AUDITORIA MUNICIPAL',
  'ESCRIBANIA MUNICIPAL',
  'ADMINISTRACION GENERAL DEL TRIBUNAL DE FALTAS',
  'HONORABLE CONCEJO DELIBERANTE',
  'DEFENSORIA DE LOS VECINOS',
  'CAJA MUNICIPAL DE PRESTAMOS',
  'FUERA DE LA MCC',
  'COORDINACION DE ASUNTOS POLITICOS ESTRATEGICOS',
  'COORDINACIÓN DE RELACIONES TERRITORIALES',
  'SEC. DE CULTURA Y EDUCACION',
  'SEC. DE DESARROLLO HUMANO'
];

// Obtener lista de secretarías modelo
router.get('/secretarias', authenticateToken, async (req, res) => {
  try {
    res.json(SECRETARIAS_MODELO);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener secretarías modelo' });
  }
});

// Obtener todas las variables específicas
router.get('/', authenticateToken, async (req, res) => {
  try {
    const variables = await VariableEspecifica.find().sort({ nombre: 1 });
    res.json(variables);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener variables específicas' });
  }
});

// Obtener variables específicas por secretaría
router.get('/por-secretaria/:secretaria', authenticateToken, async (req, res) => {
  try {
    const { secretaria } = req.params;
    const variables = await VariableEspecifica.find({ 
      secretarias: secretaria,
      activo: true 
    }).sort({ nombre: 1 });
    res.json(variables);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener variables por secretaría' });
  }
});

// Crear una nueva variable específica (solo admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      nombre, 
      descripcion, 
      unidad_medida, 
      umbral_critico, 
      umbral_preventivo, 
      valor_maximo, 
      secretarias,
      activo 
    } = req.body;

    // Validaciones básicas
    if (!nombre || !unidad_medida) {
      return res.status(400).json({ 
        message: 'Nombre y unidad de medida son requeridos' 
      });
    }

    if (!secretarias || secretarias.length === 0) {
      return res.status(400).json({ 
        message: 'Debe seleccionar al menos una secretaría' 
      });
    }

    // Validar umbrales
    const critico = Number(umbral_critico);
    const preventivo = Number(umbral_preventivo);
    const maximo = Number(valor_maximo);

    if (critico >= preventivo) {
      return res.status(400).json({ 
        message: 'El umbral crítico debe ser menor que el umbral preventivo' 
      });
    }

    if (preventivo >= maximo) {
      return res.status(400).json({ 
        message: 'El umbral preventivo debe ser menor que el valor máximo' 
      });
    }

    // Validar que las secretarías sean válidas
    const secretariasInvalidas = secretarias.filter(s => !SECRETARIAS_MODELO.includes(s));
    if (secretariasInvalidas.length > 0) {
      return res.status(400).json({ 
        message: `Secretarías no válidas: ${secretariasInvalidas.join(', ')}` 
      });
    }

    const nueva = new VariableEspecifica({
      nombre,
      descripcion: descripcion || '',
      unidad_medida,
      umbral_critico: critico,
      umbral_preventivo: preventivo,
      valor_maximo: maximo,
      secretarias,
      activo: activo !== undefined ? activo : true,
    });

    await nueva.save();
    res.status(201).json(nueva);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: 'Ya existe una variable específica con ese nombre.' 
      });
    }
    res.status(500).json({ 
      message: 'Error al crear variable específica', 
      error: error.message 
    });
  }
});

// Editar una variable específica (solo admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      nombre, 
      descripcion, 
      unidad_medida, 
      umbral_critico, 
      umbral_preventivo, 
      valor_maximo, 
      secretarias,
      activo 
    } = req.body;

    const variable = await VariableEspecifica.findById(req.params.id);
    if (!variable) {
      return res.status(404).json({ message: 'Variable específica no encontrada' });
    }

    // Validar umbrales si se proporcionan
    if (umbral_critico !== undefined && umbral_preventivo !== undefined) {
      const critico = Number(umbral_critico);
      const preventivo = Number(umbral_preventivo);
      const maximo = Number(valor_maximo || variable.valor_maximo);

      if (critico >= preventivo) {
        return res.status(400).json({ 
          message: 'El umbral crítico debe ser menor que el umbral preventivo' 
        });
      }

      if (preventivo >= maximo) {
        return res.status(400).json({ 
          message: 'El umbral preventivo debe ser menor que el valor máximo' 
        });
      }
    }

    // Validar secretarías si se proporcionan
    if (secretarias && secretarias.length > 0) {
      const secretariasInvalidas = secretarias.filter(s => !SECRETARIAS_MODELO.includes(s));
      if (secretariasInvalidas.length > 0) {
        return res.status(400).json({ 
          message: `Secretarías no válidas: ${secretariasInvalidas.join(', ')}` 
        });
      }
    }

    // Actualizar campos
    if (nombre) variable.nombre = nombre;
    if (descripcion !== undefined) variable.descripcion = descripcion;
    if (unidad_medida) variable.unidad_medida = unidad_medida;
    if (umbral_critico !== undefined) variable.umbral_critico = Number(umbral_critico);
    if (umbral_preventivo !== undefined) variable.umbral_preventivo = Number(umbral_preventivo);
    if (valor_maximo !== undefined) variable.valor_maximo = Number(valor_maximo);
    if (secretarias && secretarias.length > 0) variable.secretarias = secretarias;
    if (activo !== undefined) variable.activo = activo;

    await variable.save();
    res.json(variable);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al editar variable específica', 
      error: error.message 
    });
  }
});

// Eliminar una variable específica (solo admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const variable = await VariableEspecifica.findByIdAndDelete(req.params.id);
    if (!variable) {
      return res.status(404).json({ message: 'Variable específica no encontrada' });
    }
    res.json({ message: 'Variable específica eliminada' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al eliminar variable específica', 
      error: error.message 
    });
  }
});

module.exports = router;
