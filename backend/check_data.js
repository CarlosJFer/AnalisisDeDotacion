const mongoose = require('mongoose');
const Agent = require('./models/Agent');

async function checkData() {
  try {
    await mongoose.connect('mongodb+srv://carlosfernandezws:27a25b34c@analisisdedotacion.wurdfp5.mongodb.net/?retryWrites=true&w=majority&appName=AnalisisDeDotacion');
    console.log('Conectado a MongoDB');
    
    const count = await Agent.countDocuments();
    console.log('Total de agentes:', count);
    
    if (count > 0) {
      const sample = await Agent.findOne();
      console.log('Agente de muestra:');
      console.log(JSON.stringify(sample, null, 2));
      
      // Verificar campos específicos
      const fieldsCheck = await Agent.findOne({}, {
        'Función que cumple': 1,
        'Situación de revista': 1,
        'Secretaria donde trabaja': 1,
        'Subsecretaria donde trabaja': 1,
        'Dirección general donde trabaja': 1,
        'Dirección donde trabaja': 1,
        'Departamento donde trabaja': 1,
        'División donde trabaja': 1,
        'Fecha de nacimiento': 1
      });
      console.log('\nCampos específicos:');
      console.log(JSON.stringify(fieldsCheck, null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();