const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';
const TEST_TOKEN = 'your-test-token-here'; // Reemplazar con un token válido

const testNotifications = async () => {
  console.log('🧪 Probando funcionalidad de notificaciones...\n');

  try {
    // 1. Probar activar notificaciones
    console.log('📡 Activando notificaciones...');
    const enableResponse = await axios.put(`${BASE_URL}/auth/update-notifications`, {
      notificationsEnabled: true
    }, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (enableResponse.status === 200) {
      console.log('✅ Notificaciones activadas correctamente');
      console.log(`   Respuesta: ${enableResponse.data.message}`);
    }

    // 2. Probar desactivar notificaciones
    console.log('\n📡 Desactivando notificaciones...');
    const disableResponse = await axios.put(`${BASE_URL}/auth/update-notifications`, {
      notificationsEnabled: false
    }, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (disableResponse.status === 200) {
      console.log('✅ Notificaciones desactivadas correctamente');
      console.log(`   Respuesta: ${disableResponse.data.message}`);
    }

    // 3. Verificar el estado actual del usuario
    console.log('\n📡 Verificando estado del usuario...');
    const userResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    if (userResponse.status === 200) {
      console.log('✅ Estado del usuario obtenido');
      console.log(`   Notificaciones habilitadas: ${userResponse.data.notificationsEnabled}`);
      console.log(`   Usuario: ${userResponse.data.username}`);
      console.log(`   Email: ${userResponse.data.email}`);
    }

  } catch (error) {
    if (error.response) {
      console.log(`❌ Error ${error.response.status}: ${error.response.data.message || 'Error desconocido'}`);
    } else {
      console.log(`❌ Error de conexión: ${error.message}`);
    }
  }

  console.log('\n🏁 Pruebas completadas.');
};

// Ejecutar pruebas
testNotifications().catch(console.error); 