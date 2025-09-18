const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const options = {
      bufferCommands: true, // Cambiar a true para evitar problemas de conexión
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000, // 30 segundos
      socketTimeoutMS: 45000, // 45 segundos
      family: 4, // Usar IPv4
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(process.env.MONGO_URI, options);
    logger.info('MongoDB conectado con configuración optimizada');
    
    // Configurar eventos de conexión
    mongoose.connection.on('error', (err) => {
      logger.error('Error de conexión MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB desconectado');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconectado');
    });
    
  } catch (err) {
    logger.error('Error conectando a MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
