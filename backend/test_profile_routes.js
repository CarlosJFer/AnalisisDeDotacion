const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';
const TEST_TOKEN = 'your-test-token-here'; // Reemplazar con un token válido

const testProfileRoutes = async () => {
  const routes = [
    {
      method: 'PUT',
      path: '/auth/update-username',
      data: { newUsername: 'testuser123' },
      description: 'Actualizar nombre de usuario'
    },
    {
      method: 'PUT',
      path: '/auth/update-email',
      data: { newEmail: 'test@example.com' },
      description: 'Actualizar email'
    },
    {
      method: 'PUT',
      path: '/auth/update-notifications',
      data: { notificationsEnabled: true },
      description: 'Actualizar notificaciones'
    },
    {
      method: 'DELETE',
      path: '/auth/delete-email',
      description: 'Eliminar email'
    },
    {
      method: 'PUT',
      path: '/auth/change-password',
      data: { currentPassword: 'oldpass', newPassword: 'newpass123' },
      description: 'Cambiar contraseña'
    }
  ];

  console.log('🧪 Probando rutas del perfil...\n');

  for (const route of routes) {
    try {
      console.log(`📡 Probando: ${route.description}`);
      console.log(`   Método: ${route.method} ${route.path}`);
      
      const config = {
        method: route.method,
        url: `${BASE_URL}${route.path}`,
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      };

      if (route.data) {
        config.data = route.data;
      }

      const response = await axios(config);
      
      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ ${route.description} - OK`);
        if (response.data.message) {
          console.log(`   Mensaje: ${response.data.message}`);
        }
      } else {
        console.log(`❌ ${route.description} - Error: ${response.status}`);
      }
    } catch (error) {
      if (error.response) {
        console.log(`❌ ${route.description} - Error ${error.response.status}: ${error.response.data.message || 'Error desconocido'}`);
      } else {
        console.log(`❌ ${route.description} - Error de conexión: ${error.message}`);
      }
    }
    console.log(''); // Línea en blanco para separar
  }

  console.log('🏁 Pruebas completadas.');
};

// Ejecutar pruebas
testProfileRoutes().catch(console.error); 