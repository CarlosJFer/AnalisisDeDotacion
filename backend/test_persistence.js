const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Función para hacer login y obtener token
async function login() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin1234'
    });
    
    console.log('Login exitoso:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message);
    return null;
  }
}

// Función para actualizar email
async function updateEmail(token, newEmail) {
  try {
    const response = await axios.put(`${API_BASE_URL}/auth/update-email`, 
      { newEmail },
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log('Email actualizado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error actualizando email:', error.response?.data || error.message);
    return null;
  }
}

// Función para actualizar notificaciones
async function updateNotifications(token, enabled) {
  try {
    const response = await axios.put(`${API_BASE_URL}/auth/update-notifications`, 
      { notificationsEnabled: enabled },
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log('Notificaciones actualizadas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error actualizando notificaciones:', error.response?.data || error.message);
    return null;
  }
}

// Función para obtener información del usuario
async function getUserInfo(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, 
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log('Información del usuario:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo información del usuario:', error.response?.data || error.message);
    return null;
  }
}

// Función principal de prueba
async function testPersistence() {
  console.log('=== Iniciando pruebas de persistencia ===\n');
  
  // 1. Login
  const token = await login();
  if (!token) {
    console.error('No se pudo obtener el token. Abortando pruebas.');
    return;
  }
  
  // 2. Obtener información inicial del usuario
  console.log('\n--- Información inicial del usuario ---');
  const initialUserInfo = await getUserInfo(token);
  
  // 3. Actualizar email
  console.log('\n--- Actualizando email ---');
  const emailResult = await updateEmail(token, 'test@example.com');
  
  // 4. Verificar que el email se actualizó
  console.log('\n--- Verificando email actualizado ---');
  const userInfoAfterEmail = await getUserInfo(token);
  
  // 5. Actualizar notificaciones
  console.log('\n--- Actualizando notificaciones ---');
  const notificationsResult = await updateNotifications(token, false);
  
  // 6. Verificar que las notificaciones se actualizaron
  console.log('\n--- Verificando notificaciones actualizadas ---');
  const finalUserInfo = await getUserInfo(token);
  
  // 7. Resumen
  console.log('\n=== Resumen de pruebas ===');
  console.log('Email inicial:', initialUserInfo?.email || 'No configurado');
  console.log('Email después de actualizar:', userInfoAfterEmail?.email || 'No configurado');
  console.log('Email final:', finalUserInfo?.email || 'No configurado');
  console.log('Notificaciones iniciales:', initialUserInfo?.notificationsEnabled);
  console.log('Notificaciones finales:', finalUserInfo?.notificationsEnabled);
  
  console.log('\n=== Pruebas completadas ===');
}

// Ejecutar las pruebas
testPersistence().catch(console.error); 