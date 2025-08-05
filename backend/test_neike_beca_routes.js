const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';
const TEST_TOKEN = 'your-test-token-here'; // Reemplazar con un token válido

const testRoutes = async () => {
  const routes = [
    '/analytics/agents/by-secretaria-neike-beca',
    '/analytics/agents/by-dependency-neike-beca',
    '/analytics/agents/by-subsecretaria-neike-beca',
    '/analytics/agents/by-direccion-general-neike-beca',
    '/analytics/agents/by-direccion-neike-beca',
    '/analytics/agents/by-departamento-neike-beca',
    '/analytics/agents/by-division-neike-beca'
  ];

  console.log('🧪 Probando rutas de Neikes y Beca...\n');

  for (const route of routes) {
    try {
      console.log(`📡 Probando: ${route}`);
      const response = await axios.get(`${BASE_URL}${route}`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      
      if (response.status === 200) {
        console.log(`✅ ${route} - OK (${response.data.length} resultados)`);
      } else {
        console.log(`❌ ${route} - Error: ${response.status}`);
      }
    } catch (error) {
      if (error.response) {
        console.log(`❌ ${route} - Error ${error.response.status}: ${error.response.data.message || 'Error desconocido'}`);
      } else {
        console.log(`❌ ${route} - Error de conexión: ${error.message}`);
      }
    }
  }

  console.log('\n🏁 Pruebas completadas.');
};

// Ejecutar pruebas
testRoutes().catch(console.error); 