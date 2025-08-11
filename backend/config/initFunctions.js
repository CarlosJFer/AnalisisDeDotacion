const FunctionDefinition = require('../models/FunctionDefinition');
const defaultFunctions = require('./defaultFunctions');

async function initFunctions() {
  const count = await FunctionDefinition.estimatedDocumentCount();
  if (count === 0) {
    try {
      await FunctionDefinition.insertMany(defaultFunctions);
      console.log('Funciones iniciales cargadas');
    } catch (error) {
      console.error('Error al cargar funciones iniciales:', error.message);
    }
  }
}

module.exports = initFunctions;
