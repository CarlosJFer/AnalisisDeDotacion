# Sistema de Notificaciones - Análisis de Dotación Municipal

## Funcionalidades Implementadas

### ✅ Notificaciones por Email
- **Envío automático** cuando se cargan nuevos dashboards
- **Envío automático** cuando se modifican dashboards existentes
- **Plantilla HTML personalizada** con información detallada
- **Configuración por usuario** (activar/desactivar en perfil)

### ✅ Notificaciones en la Aplicación
- **Campanita mejorada** con contador de notificaciones no leídas
- **Panel de notificaciones** con diseño moderno y funcional
- **Gestión de notificaciones** (marcar como leída, eliminar, marcar todas como leídas)
- **Notificaciones en tiempo real** via Server-Sent Events (SSE)
- **Persistencia** en base de datos MongoDB

### ✅ Configuración de Usuario
- **Toggle en el perfil** para activar/desactivar notificaciones
- **Configuración de email** para usuarios (no admins)
- **Preferencias persistentes** guardadas en la base de datos

## Configuración del Backend

### 1. Variables de Entorno

Crea un archivo `.env` en la carpeta `backend` con las siguientes variables:

```env
# Configuración de Email para notificaciones
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password-de-gmail

# URL del frontend (para enlaces en emails)
FRONTEND_URL=http://localhost:5173

# Otras variables existentes...
MONGODB_URI=mongodb://localhost:27017/analisis-dotacion
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
PORT=5000
```

### 2. Configuración de Gmail

Para usar Gmail como proveedor de email:

1. **Habilita la verificación en 2 pasos** en tu cuenta de Gmail
2. **Genera una contraseña de aplicación**:
   - Ve a tu cuenta de Google
   - Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones
   - Genera una nueva contraseña para "Correo"
   - Usa esta contraseña en `EMAIL_PASSWORD`

### 3. Instalación de Dependencias

```bash
cd backend
npm install nodemailer
```

### 4. Estructura de Archivos Agregados/Modificados

```
backend/
├── services/
│   └── emailService.js          # Nuevo: Servicio de envío de emails
├── controllers/
│   ├── uploadController.js      # Modificado: Agregadas notificaciones
│   └── analyticsController.js   # Modificado: Endpoint para notificar modificaciones
├── routes/
│   └── analytics.js            # Modificado: Nueva ruta para notificaciones
├── models/
│   ├── Notification.js         # Existente: Modelo de notificaciones
│   └── User.js                 # Existente: Ya tenía configuración de notificaciones
└── .env.example                # Nuevo: Ejemplo de configuración
```

## Configuración del Frontend

### 1. Componentes Agregados/Modificados

```
frontend/src/components/
├── NotificationBell.jsx         # Nuevo: Campanita mejorada
└── Navbar.jsx                  # Modificado: Integra el nuevo componente
```

### 2. Funcionalidades del Frontend

- **NotificationBell**: Componente independiente con toda la lógica de notificaciones
- **Diseño responsive** que se adapta al tema claro/oscuro
- **Animaciones suaves** y feedback visual
- **Gestión completa** de notificaciones desde la campanita

## Flujo de Funcionamiento

### 1. Carga de Dashboard (Upload)
```
Usuario sube archivo → uploadController.js → 
Procesa datos → Guarda en BD → 
emailService.notifyDashboardUpdate() → 
Envía emails + Crea notificaciones en BD
```

### 2. Modificación de Dashboard
```
Admin modifica dashboard → 
POST /api/analytics/notify-dashboard-modification → 
emailService.notifyDashboardUpdate() → 
Envía emails + Crea notificaciones en BD
```

### 3. Visualización de Notificaciones
```
Usuario abre campanita → 
GET /api/notifications → 
Muestra notificaciones → 
SSE mantiene conexión en tiempo real
```

## Endpoints de API

### Notificaciones
- `GET /api/notifications` - Obtener notificaciones del usuario
- `GET /api/notifications/stats` - Estadísticas de notificaciones
- `PUT /api/notifications/:id/read` - Marcar como leída
- `PUT /api/notifications/read-all` - Marcar todas como leídas
- `DELETE /api/notifications/:id` - Eliminar notificación
- `GET /api/notifications/stream` - Stream SSE en tiempo real

### Dashboard
- `POST /api/analytics/notify-dashboard-modification` - Notificar modificación manual

## Personalización

### Plantilla de Email
Edita `backend/services/emailService.js` en el método `generateEmailTemplate()` para personalizar:
- Diseño del email
- Contenido del mensaje
- Enlaces y botones
- Estilos CSS

### Tipos de Notificación
En `backend/models/Notification.js` puedes agregar nuevos tipos:
```javascript
type: {
  type: String,
  enum: ['info', 'warning', 'error', 'success', 'dashboard'], // Agregar nuevos tipos
  default: 'info'
}
```

### Configuración de Usuario
En `backend/models/User.js` ya existe la estructura para preferencias:
```javascript
preferences: {
  notifications: {
    email: Boolean,
    desktop: Boolean,
    dataChanges: Boolean,
    // Agregar nuevas preferencias aquí
  }
}
```

## Pruebas

### 1. Probar Envío de Email
```bash
# En el backend
node -e "
const emailService = require('./services/emailService');
emailService.notifyDashboardUpdate({
  action: 'upload',
  fileName: 'test.xlsx',
  totalRecords: 100,
  secretaria: 'Test',
  uploadedBy: 'Admin'
}).then(console.log).catch(console.error);
"
```

### 2. Probar Notificaciones en la App
1. Sube un archivo Excel
2. Verifica que aparezca la notificación en la campanita
3. Prueba marcar como leída/eliminar

### 3. Probar Configuración de Usuario
1. Ve al perfil (ícono de configuración)
2. Activa/desactiva las notificaciones
3. Configura un email (solo usuarios no admin)

## Solución de Problemas

### Email no se envía
1. Verifica las credenciales en `.env`
2. Asegúrate de usar una contraseña de aplicación de Gmail
3. Revisa los logs del servidor para errores

### Notificaciones no aparecen
1. Verifica que el usuario tenga notificaciones habilitadas
2. Revisa la conexión SSE en las herramientas de desarrollador
3. Verifica que el modelo Notification esté funcionando

### Campanita no se actualiza
1. Verifica que el contexto NotificationContext esté funcionando
2. Revisa que el componente NotificationBell esté importado correctamente
3. Verifica la conexión WebSocket/SSE

## Próximas Mejoras

- [ ] Notificaciones push del navegador
- [ ] Configuración de horarios para envío de emails
- [ ] Plantillas de email personalizables desde la UI
- [ ] Notificaciones por Slack/Teams
- [ ] Dashboard de administración de notificaciones
- [ ] Métricas de entrega de emails

## Soporte

Si tienes problemas con la implementación:
1. Revisa los logs del servidor
2. Verifica la configuración de variables de entorno
3. Asegúrate de que todas las dependencias estén instaladas
4. Prueba con un email de prueba primero