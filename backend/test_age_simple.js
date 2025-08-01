const mongoose = require('mongoose');
require('dotenv').config();

async function testAgeSimple() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');
    
    const Agent = require('./models/Agent');
    
    // Test simple: obtener algunos agentes y calcular edad manualmente
    console.log('\n=== TEST SIMPLE DE EDAD ===');
    const agents = await Agent.find({ 'Fecha de nacimiento': { $exists: true, $ne: null } })
      .limit(5);
    
    console.log('Agentes encontrados:', agents.length);
    
    agents.forEach((agent, idx) => {
      console.log(`\n--- Agente ${idx + 1} ---`);
      console.log('ID:', agent._id);
      console.log('Nombre:', agent['Nombre y Apellido']);
      console.log('Fecha raw:', agent['Fecha de nacimiento']);
      console.log('Tipo de fecha:', typeof agent['Fecha de nacimiento']);
      console.log('Es Date?:', agent['Fecha de nacimiento'] instanceof Date);
      
      if (agent['Fecha de nacimiento']) {
        const birthDate = new Date(agent['Fecha de nacimiento']);
        console.log('Fecha convertida:', birthDate);
        console.log('Es válida?:', !isNaN(birthDate.getTime()));
        
        if (!isNaN(birthDate.getTime())) {
          const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
          console.log('Edad calculada:', age);
        }
      }
    });
    
    await mongoose.disconnect();
    console.log('\nDesconectado de MongoDB');
  } catch (err) {
    console.error('Error:', err);
  }
}

testAgeSimple();