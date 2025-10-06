const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  getNotificationStats,
} = require('../controllers/notificationController');

// Middleware: soporta token por query param en SSE (?token=...)
function sseTokenMiddleware(req, res, next) {
  if (!req.headers['authorization'] && req.query && req.query.token) {
    req.headers['authorization'] = 'Bearer ' + req.query.token;
  }
  next();
}

// SSE: Notificaciones en tiempo real
router.get('/stream', sseTokenMiddleware, authenticateToken, async (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();

  const userId = req.user.userId || req.user._id;

  const sendNotifications = async () => {
    try {
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
      const unreadCount = await Notification.countDocuments({ userId, read: false });
      res.write(`data: ${JSON.stringify({ notifications, unreadCount })}\n\n`);
    } catch (err) {
      console.error('Error en sendNotifications SSE:', err);
      // Mantener viva la conexión
      res.write(`data: ${JSON.stringify({ ping: true })}\n\n`);
    }
  };

  // primer push inmediato
  await sendNotifications();
  // refresco periódico
  const interval = setInterval(sendNotifications, 10000);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

// Endpoints REST (autenticación por ruta)
router.get('/', authenticateToken, getNotifications);
router.get('/stats', authenticateToken, getNotificationStats);
router.post('/', authenticateToken, createNotification);
router.put('/:id/read', authenticateToken, markAsRead);
router.put('/read-all', authenticateToken, markAllAsRead);
router.delete('/:id', authenticateToken, deleteNotification);
router.delete('/read', authenticateToken, deleteReadNotifications);

module.exports = router;

