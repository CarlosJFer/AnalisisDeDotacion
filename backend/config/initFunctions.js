const FunctionDefinition = require('../models/FunctionDefinition');
const defaultFunctions = require('./defaultFunctions');
const logger = require('../utils/logger');

async function initFunctions() {
  try {
    // Inserta o actualiza cada función por su nombre para asegurar
    // que las nuevas definiciones estén disponibles en la colección.
    await Promise.all(
      defaultFunctions.map(func =>
        FunctionDefinition.updateOne({ name: func.name }, { $set: func }, { upsert: true })
      )
    );
    logger.debug('Funciones sincronizadas');
  } catch (error) {
    logger.error('Error al sincronizar funciones iniciales:', error.message);
  }
}

module.exports = initFunctions;
