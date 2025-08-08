const nodemailer = require('nodemailer');
const User = require('../models/User');
const Notification = require('../models/Notification');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Solo configurar si las credenciales están disponibles
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || 
        process.env.EMAIL_USER === 'tu-email@gmail.com' || 
        process.env.EMAIL_PASSWORD === 'tu-app-password') {
      console.log('⚠️  Servicio de email no configurado - usando modo de desarrollo');
      console.log('   Para habilitar emails, configura EMAIL_USER y EMAIL_PASSWORD en .env');
      this.transporter = null;
      return;
    }

    // Configuración para Gmail (puedes cambiar por otro proveedor)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Verificar la conexión solo si está configurado
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Error configurando el servicio de email:', error.message);
        console.log('   Verifica tus credenciales de Gmail en el archivo .env');
        this.transporter = null;
      } else {
        console.log('✅ Servicio de email configurado correctamente');
      }
    });
  }

  async sendDashboardUpdateNotification(users, dashboardInfo) {
    // Si no hay transporter configurado, solo simular el envío
    if (!this.transporter) {
      console.log('📧 Simulando envío de emails (servicio no configurado)');
      return users.map(() => ({ status: 'fulfilled', value: 'simulated' }));
    }

    const emailPromises = users.map(user => this.sendEmail(user, dashboardInfo));
    const results = await Promise.allSettled(emailPromises);
    
    // Log de resultados
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Error enviando email a ${users[index].email}:`, result.reason);
      } else {
        console.log(`Email enviado exitosamente a ${users[index].email}`);
      }
    });

    return results;
  }

  async sendEmail(user, dashboardInfo) {
    if (!this.transporter) {
      throw new Error('Servicio de email no configurado');
    }

    if (!user.email || !user.notificationsEnabled) {
      throw new Error('Usuario sin email o notificaciones deshabilitadas');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@analisis-dotacion.com',
      to: user.email,
      subject: 'Actualización en el Dashboard de Análisis Municipal',
      html: this.generateEmailTemplate(user, dashboardInfo)
    };

    return await this.transporter.sendMail(mailOptions);
  }

  generateEmailTemplate(user, dashboardInfo) {
    const { action, fileName, totalRecords, secretaria, uploadedBy } = dashboardInfo;
    
    const actionText = action === 'upload' ? 'cargado' : 'modificado';
    const actionTitle = action === 'upload' ? 'Nuevo Dashboard Cargado' : 'Dashboard Modificado';

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificación - Dashboard Actualizado</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #4CAF50;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #2E7D32;
                margin: 0;
                font-size: 24px;
            }
            .content {
                margin-bottom: 30px;
            }
            .highlight {
                background-color: #E8F5E8;
                padding: 15px;
                border-radius: 5px;
                border-left: 4px solid #4CAF50;
                margin: 20px 0;
            }
            .details {
                background-color: #f9f9f9;
                padding: 20px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .details h3 {
                margin-top: 0;
                color: #2E7D32;
            }
            .button {
                display: inline-block;
                background-color: #4CAF50;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
                text-align: center;
            }
            .button:hover {
                background-color: #45a049;
            }
            .footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 14px;
            }
            .icon {
                font-size: 48px;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="icon">📊</div>
                <h1>${actionTitle}</h1>
            </div>
            
            <div class="content">
                <p>Hola <strong>${user.username}</strong>,</p>
                
                <p>Te informamos que se ha ${actionText} información en el Dashboard de Análisis Municipal.</p>
                
                <div class="highlight">
                    <strong>¡Hay nuevos datos disponibles para revisar!</strong>
                </div>
                
                <div class="details">
                    <h3>Detalles de la actualización:</h3>
                    <ul>
                        <li><strong>Archivo:</strong> ${fileName}</li>
                        <li><strong>Total de registros:</strong> ${totalRecords}</li>
                        ${secretaria ? `<li><strong>Secretaría:</strong> ${secretaria}</li>` : ''}
                        <li><strong>Cargado por:</strong> ${uploadedBy}</li>
                        <li><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</li>
                    </ul>
                </div>
                
                <p>Para revisar los nuevos datos y análisis, accede al dashboard haciendo clic en el siguiente botón:</p>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">
                        Ver Dashboard
                    </a>
                </div>
                
                <p><strong>Nota:</strong> Este enlace te llevará directamente al dashboard donde podrás ver todos los análisis actualizados.</p>
            </div>
            
            <div class="footer">
                <p>Este es un mensaje automático del Sistema de Análisis de Dotación Municipal.</p>
                <p>Si no deseas recibir estas notificaciones, puedes desactivarlas desde tu perfil en la aplicación.</p>
                <p>© ${new Date().getFullYear()} Análisis de Dotación Municipal</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  async notifyDashboardUpdate(dashboardInfo) {
    try {
      // Crear notificaciones en la base de datos solo para usuarios con notificaciones habilitadas
      const usersForNotifications = await User.find({ 
        isActive: true,
        notificationsEnabled: true 
      });
      
      const notificationPromises = usersForNotifications.map(user => {
        const notification = new Notification({
          userId: user._id,
          type: 'info',
          title: dashboardInfo.action === 'upload' ? 'Nuevo Dashboard Cargado' : 'Dashboard Actualizado',
          message: `Se ha ${dashboardInfo.action === 'upload' ? 'cargado' : 'modificado'} el archivo "${dashboardInfo.fileName}" con ${dashboardInfo.totalRecords} registros.`,
          data: {
            fileName: dashboardInfo.fileName,
            totalRecords: dashboardInfo.totalRecords,
            secretaria: dashboardInfo.secretaria,
            uploadedBy: dashboardInfo.uploadedBy,
            action: dashboardInfo.action
          },
          priority: 'medium'
        });
        return notification.save();
      });

      await Promise.all(notificationPromises);
      console.log(`📱 Notificaciones creadas para ${usersForNotifications.length} usuarios con notificaciones habilitadas`);

      // Intentar enviar emails solo si el servicio está configurado
      let emailResults = [];
      if (this.transporter) {
        // Obtener usuarios con email y notificaciones habilitadas
        const usersWithEmail = await User.find({
          isActive: true,
          email: { $exists: true, $ne: null, $ne: '' },
          notificationsEnabled: true
        });

        console.log(`📧 Enviando emails a ${usersWithEmail.length} usuarios con notificaciones habilitadas`);
        emailResults = await this.sendDashboardUpdateNotification(usersWithEmail, dashboardInfo);
      } else {
        console.log('📧 Emails no enviados - servicio no configurado');
        emailResults = [];
      }

      return {
        emailsSent: emailResults.filter(r => r.status === 'fulfilled').length,
        emailsFailed: emailResults.filter(r => r.status === 'rejected').length,
        notificationsCreated: usersForNotifications.length,
        emailServiceConfigured: !!this.transporter
      };

    } catch (error) {
      console.error('Error enviando notificaciones:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();