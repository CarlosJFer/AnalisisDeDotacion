const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Función para hacer login y obtener token
async function login() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin1234'
    });
    
    console.log('✅ Login exitoso');
    console.log('Token:', response.data.token ? 'Presente' : 'Ausente');
    console.log('Usuario completo:', JSON.stringify(response.data, null, 2));
    return response.data.token;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
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
    
    console.log('✅ Información del usuario obtenida:');
    console.log('Email:', response.data.email || 'No configurado');
    console.log('Notificaciones:', response.data.notificationsEnabled);
    console.log('Usuario completo:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo información del usuario:', error.response?.data || error.message);
    return null;
  }
}

// Función para actualizar email
async function updateEmail(token, newEmail) {
  try {
    console.log(`🔄 Actualizando email a: ${newEmail}`);
    const response = await axios.put(`${API_BASE_URL}/auth/update-email`, 
      { newEmail },
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log('✅ Email actualizado exitosamente');
    console.log('Respuesta del servidor:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Error actualizando email:', error.response?.data || error.message);
    return null;
  }
}

// Función para actualizar notificaciones
async function updateNotifications(token, enabled) {
  try {
    console.log(`🔄 Actualizando notificaciones a: ${enabled}`);
    const response = await axios.put(`${API_BASE_URL}/auth/update-notifications`, 
      { notificationsEnabled: enabled },
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log('✅ Notificaciones actualizadas exitosamente');
    console.log('Respuesta del servidor:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Error actualizando notificaciones:', error.response?.data || error.message);
    return null;
  }
}

// Función para verificar persistencia
async function verifyPersistence(token) {
  console.log('\n🔍 Verificando persistencia...');
  
  // Obtener información actual
  const currentInfo = await getUserInfo(token);
  if (!currentInfo) {
    console.error('❌ No se pudo obtener información del usuario');
    return false;
  }
  
  console.log('\n📊 Estado actual:');
  console.log('- Email:', currentInfo.email || 'No configurado');
  console.log('- Notificaciones:', currentInfo.notificationsEnabled);
  
  return true;
}

// Función principal de debug
async function debugPersistence() {
  console.log('=== DEBUG PERSISTENCIA ===\n');
  
  // 1. Login
  console.log('1️⃣ Iniciando sesión...');
  const token = await login();
  if (!token) {
    console.error('❌ No se pudo obtener el token. Abortando.');
    return;
  }
  
  // 2. Verificar estado inicial
  console.log('\n2️⃣ Verificando estado inicial...');
  const initialInfo = await getUserInfo(token);
  if (!initialInfo) {
    console.error('❌ No se pudo obtener información inicial');
    return;
  }
  
  // 3. Actualizar email
  console.log('\n3️⃣ Actualizando email...');
  const emailResult = await updateEmail(token, 'test@debug.com');
  if (!emailResult) {
    console.error('❌ No se pudo actualizar el email');
    return;
  }
  
  // 4. Verificar email actualizado
  console.log('\n4️⃣ Verificando email actualizado...');
  await verifyPersistence(token);
  
  // 5. Actualizar notificaciones
  console.log('\n5️⃣ Actualizando notificaciones...');
  const notificationsResult = await updateNotifications(token, false);
  if (!notificationsResult) {
    console.error('❌ No se pudo actualizar las notificaciones');
    return;
  }
  
  // 6. Verificar notificaciones actualizadas
  console.log('\n6️⃣ Verificando notificaciones actualizadas...');
  await verifyPersistence(token);
  
  // 7. Verificación final
  console.log('\n7️⃣ Verificación final...');
  const finalInfo = await getUserInfo(token);
  
  console.log('\n=== RESUMEN FINAL ===');
  console.log('Email inicial:', initialInfo.email || 'No configurado');
  console.log('Email final:', finalInfo.email || 'No configurado');
  console.log('Notificaciones iniciales:', initialInfo.notificationsEnabled);
  console.log('Notificaciones finales:', finalInfo.notificationsEnabled);
  
  // Verificar si los cambios persistieron
  const emailPersisted = finalInfo.email === 'test@debug.com';
  const notificationsPersisted = finalInfo.notificationsEnabled === false;
  
  console.log('\n=== RESULTADOS ===');
  console.log('Email persistió:', emailPersisted ? '✅ SÍ' : '❌ NO');
  console.log('Notificaciones persistieron:', notificationsPersisted ? '✅ SÍ' : '❌ NO');
  
  if (!emailPersisted || !notificationsPersisted) {
    console.log('\n⚠️ PROBLEMA DETECTADO: Los cambios no persistieron en la base de datos');
    console.log('Posibles causas:');
    console.log('1. El modelo User no tiene los campos correctos');
    console.log('2. Las rutas no están guardando correctamente');
    console.log('3. Problema con la base de datos');
  } else {
    console.log('\n✅ TODO FUNCIONA CORRECTAMENTE EN EL BACKEND');
  }
}

// Ejecutar el debug
debugPersistence().catch(console.error); 