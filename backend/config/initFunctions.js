const FunctionDefinition = require('../models/FunctionDefinition');
const defaultFunctions = require('./defaultFunctions');

async function initFunctions() {
  try {
    // Inserta o actualiza cada función por su nombre para asegurar
    // que las nuevas definiciones estén disponibles en la colección.
    await Promise.all(
      defaultFunctions.map(func =>
        FunctionDefinition.updateOne({ name: func.name }, { $set: func }, { upsert: true })
      )
    );
    console.log('Funciones sincronizadas');
  } catch (error) {
    console.error('Error al sincronizar funciones iniciales:', error.message);
  }
}

module.exports = initFunctions;
