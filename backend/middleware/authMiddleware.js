const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = (req, res, next) => {
  let token = null;
  // Buscar primero en header Authorization
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  // Si no hay token en el header, buscar en query param
  if (!token && req.query.token) {
    token = req.query.token;
  }
  if (!token) return res.status(401).json({ message: 'Token requerido' });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.error('Error verificando token:', err);
      return res.status(403).json({ message: 'Token inválido' });
    }
    try {
      // El token contiene userId, no _id
      const userId = decoded.userId;
      if (!userId) {
        console.error('Token no contiene userId:', decoded);
        return res.status(401).json({ message: 'Token malformado' });
      }
      
      const user = await User.findById(userId);
      if (!user) {
        console.error('Usuario no encontrado para ID:', userId);
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }
      
      // Asignar el usuario completo a req.user
      req.user = user;
      next();
    } catch (e) {
      console.error('Error al cargar usuario autenticado:', e);
      return res.status(500).json({ message: 'Error al cargar usuario autenticado' });
    }
  });
};

const requireAdmin = async (req, res, next) => {
  try {
    // req.user ya contiene el usuario completo del middleware authenticateToken
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso solo para administradores' });
    }
    next();
  } catch (error) {
    console.error('Error en requireAdmin:', error);
    res.status(500).json({ message: 'Error de autenticación' });
  }
};

module.exports = { authenticateToken, requireAdmin };