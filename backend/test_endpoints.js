const mongoose = require('mongoose');
const Agent = require('./models/Agent');

async function testEndpoints() {
  try {
    await mongoose.connect('mongodb+srv://carlosfernandezws:27a25b34c@analisisdedotacion.wurdfp5.mongodb.net/?retryWrites=true&w=majority&appName=AnalisisDeDotacion');
    console.log('Conectado a MongoDB');
    
    console.log('\n=== PROBANDO ENDPOINTS ===\n');
    
    // Test 1: Total de agentes
    const totalAgents = await Agent.countDocuments();
    console.log('1. Total de agentes:', totalAgents);
    
    // Test 2: Agentes por función
    const agentsByFunction = await Agent.aggregate([
      {
        $group: {
          _id: '$Funcion',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          function: '$_id',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    console.log('2. Agentes por función (top 5):', agentsByFunction.slice(0, 5));
    
    // Test 3: Agentes por situación de revista
    const agentsByType = await Agent.aggregate([
      {
        $group: {
          _id: '$Situación de revista',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          type: { $ifNull: ['$_id', 'Sin especificar'] },
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    console.log('3. Agentes por situación de revista:', agentsByType);
    
    // Test 4: Agentes por secretaría
    const agentsBySecretaria = await Agent.aggregate([
      {
        $group: {
          _id: '$Secretaria',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          secretaria: { $ifNull: ['$_id', 'Sin especificar'] },
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    console.log('4. Agentes por secretaría (top 5):', agentsBySecretaria.slice(0, 5));
    
    // Test 5: Agentes por subsecretaría
    const agentsBySubsecretaria = await Agent.aggregate([
      {
        $group: {
          _id: '$Subsecretaria',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          subsecretaria: { $ifNull: ['$_id', 'Sin especificar'] },
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    console.log('5. Agentes por subsecretaría (top 5):', agentsBySubsecretaria.slice(0, 5));
    
    // Test 6: Agentes por dirección general
    const agentsByDireccionGeneral = await Agent.aggregate([
      {
        $group: {
          _id: '$Dirección general',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          direccionGeneral: { $ifNull: ['$_id', 'Sin especificar'] },
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    console.log('6. Agentes por dirección general (top 5):', agentsByDireccionGeneral.slice(0, 5));
    
    // Test 7: Agentes por dirección
    const agentsByDireccion = await Agent.aggregate([
      {
        $group: {
          _id: '$Dirección',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          direccion: { $ifNull: ['$_id', 'Sin especificar'] },
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    console.log('7. Agentes por dirección (top 5):', agentsByDireccion.slice(0, 5));
    
    // Test 8: Agentes por departamento
    const agentsByDepartamento = await Agent.aggregate([
      {
        $group: {
          _id: '$Departamento',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          departamento: { $ifNull: ['$_id', 'Sin especificar'] },
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    console.log('8. Agentes por departamento (top 5):', agentsByDepartamento.slice(0, 5));
    
    // Test 9: Agentes por división
    const agentsByDivision = await Agent.aggregate([
      {
        $group: {
          _id: '$División',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          division: { $ifNull: ['$_id', 'Sin especificar'] },
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    console.log('9. Agentes por división (top 5):', agentsByDivision.slice(0, 5));
    
    console.log('\n=== TODOS LOS TESTS COMPLETADOS ===');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testEndpoints();