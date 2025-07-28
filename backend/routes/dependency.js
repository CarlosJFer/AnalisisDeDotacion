// -----------------------------------------------------------------------------
// ARCHIVO: /routes/dependency.js
// -----------------------------------------------------------------------------

const express = require('express');
const router = express.Router();
const Dependency = require('../models/Dependency');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Obtener todas las dependencias (secretarías)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const dependencias = await Dependency.find().sort({ nombre: 1 });
    res.json(dependencias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener dependencias' });
  }
});

// Crear una nueva dependencia (solo admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nombre, codigo, descripcion, idPadre, orden, nivel, activo, funcion } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'Nombre es requerido' });
    }
    
    // Generar código automáticamente si no se proporciona
    let finalCodigo = codigo;
    if (!finalCodigo) {
      // Generar código basado en el nombre: tomar primeras letras y agregar número
      const baseCode = nombre
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '') // Remover caracteres especiales
        .substring(0, 3); // Tomar primeras 3 letras
      
      // Buscar un código único
      let counter = 1;
      let isUnique = false;
      while (!isUnique) {
        finalCodigo = `${baseCode}${counter.toString().padStart(3, '0')}`;
        const existing = await Dependency.findOne({ codigo: finalCodigo });
        if (!existing) {
          isUnique = true;
        } else {
          counter++;
        }
      }
    }
    
    const nueva = new Dependency({
      nombre,
      codigo: finalCodigo,
      descripcion: descripcion || '',
      funcion: funcion || '',
      idPadre: idPadre === '' ? null : idPadre,
      orden: orden !== undefined ? orden : 999,
      nivel: nivel !== undefined ? nivel : 1,
      activo: activo !== undefined ? activo : true,
    });
    await nueva.save();
    res.status(201).json(nueva);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.codigo) {
      return res.status(409).json({ message: 'Ya existe una dependencia con ese código.' });
    }
    res.status(500).json({ message: 'Error al crear dependencia', error: error.message });
  }
});

// Editar una dependencia (solo admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nombre, codigo, descripcion, activo, idPadre, orden, nivel, funcion } = req.body;
    const dep = await Dependency.findById(req.params.id);
    if (!dep) return res.status(404).json({ message: 'Dependencia no encontrada' });
    if (nombre) dep.nombre = nombre;
    if (codigo) dep.codigo = codigo;
    if (descripcion !== undefined) dep.descripcion = descripcion;
    if (funcion !== undefined) dep.funcion = funcion;
    if (activo !== undefined) dep.activo = activo;
    if (idPadre !== undefined) dep.idPadre = idPadre === '' ? null : idPadre;
    if (orden !== undefined) dep.orden = orden;
    if (nivel !== undefined) dep.nivel = nivel;
    await dep.save();
    res.json(dep);
  } catch (error) {
    res.status(500).json({ message: 'Error al editar dependencia', error: error.message });
  }
});

// Eliminar una dependencia (solo admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const dep = await Dependency.findByIdAndDelete(req.params.id);
    if (!dep) return res.status(404).json({ message: 'Dependencia no encontrada' });
    res.json({ message: 'Dependencia eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar dependencia', error: error.message });
  }
});

// Obtener el árbol jerárquico de dependencias
router.get('/tree', authenticateToken, async (req, res) => {
  try {
    const dependencias = await Dependency.find({ activo: true }).lean();
    // Construir mapa de dependencias por id
    const depMap = new Map(dependencias.map(dep => [String(dep._id), dep]));
    // Construir árbol recursivo
    function buildTree(parentId = null) {
      return dependencias
        .filter(dep => dep.idPadre === parentId)
        .sort((a, b) => (a.orden || 999) - (b.orden || 999))
        .map(dep => ({
          ...dep,
          children: buildTree(String(dep._id)),
        }));
    }
    const tree = buildTree(null);
    res.json(tree);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener árbol de dependencias', error: error.message });
  }
});

// Obtener la lista plana de dependencias activas
router.get('/flat', authenticateToken, async (req, res) => {
  try {
    const dependencias = await Dependency.find({ activo: true }).lean();
    res.json(dependencias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener dependencias planas', error: error.message });
  }
});

module.exports = router;
