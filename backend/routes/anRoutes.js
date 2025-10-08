const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/authMiddleware');
const { uploadANFiles, getLatestRecords } = require('../controllers/anController');

// Store AN uploads in a separate folder to keep them isolated
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join('uploads', 'an');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten archivos Excel (.xls, .xlsx)'), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/upload', authenticateToken, upload.array('archivos'), uploadANFiles);
router.get('/records', authenticateToken, getLatestRecords);

module.exports = router;

