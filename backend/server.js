const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const logger = require('./utils/logger');
require('dotenv').config();
const connectDB = require('./config/db'); // Importar la función centralizada

// Importar rutas
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/uploadRoutes');
const analyticsRoutes = require('./routes/analytics');
const expedientesRoutes = require('./routes/expedientes');
const dependencyRoutes = require('./routes/dependency');
const notificationRoutes = require('./routes/notifications');
const variableRoutes = require('./routes/variables');
const variableValueRoutes = require('./routes/variableValues');
const variableEspecificaRoutes = require('./routes/variableEspecifica');
const importTemplateRoutes = require('./routes/importTemplates');
const adminRoutes = require('./routes/adminRoutes');
const functionRoutes = require('./routes/functions');
const chartConfigRoutes = require('./routes/chartConfigRoutes');
const metricsRoutes = require('./routes/metrics');
const initFunctions = require('./config/initFunctions');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (para archivos subidos si es necesario)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión a MongoDB Atlas usando la función centralizada
connectDB().then(initFunctions);

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/analytics', expedientesRoutes);
app.use('/api/dependencies', dependencyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/variables', variableRoutes);
app.use('/api/variable-values', variableValueRoutes);
app.use('/api/variables-especificas', variableEspecificaRoutes);
app.use('/api/templates', importTemplateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/functions', functionRoutes);
app.use('/api/chart-configs', chartConfigRoutes);
app.use('/api/metrics', metricsRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'API de Análisis de Dotación',
    version: '1.0.0',
    status: 'funcionando correctamente',
    endpoints: {
      auth: '/api/auth',
      upload: '/api/upload',
      analytics: '/api/analytics',
      dependencies: '/api/dependencies',
      notifications: '/api/notifications',
    },
  });
});

// Ruta para verificar el estado de la API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
  });
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Ruta no encontrada',
    availableRoutes: {
      auth: '/api/auth',
      upload: '/api/upload',
      analytics: '/api/analytics',
      dependencies: '/api/dependencies',
      notifications: '/api/notifications',
    },
  });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  logger.error('Error:', err.stack);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Archivo demasiado grande' });
    }
  }

  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno',
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  logger.info(`Servidor escuchando en http://localhost:${PORT} (salud: /api/health)`);
});

module.exports = app;

