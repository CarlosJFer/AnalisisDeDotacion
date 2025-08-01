const mongoose = require('mongoose');

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
    console.log('MongoDB conectado con configuración optimizada');
    
    // Configurar eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('Error de conexión MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB desconectado');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconectado');
    });
    
  } catch (err) {
    console.error('Error conectando a MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
