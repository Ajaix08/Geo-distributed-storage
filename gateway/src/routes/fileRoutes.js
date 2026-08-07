const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { uploadFile, listFiles, downloadFile } = require('../controllers/fileController');
const ApiError = require('../../../shared/utils/ApiError');
const env = require('../config/env');
const fs = require('fs');
const os = require('os');

const router = express.Router();

// Reject executables and only allow common document/image/archive types
const ALLOWED_MIME_PREFIXES = ['image/', 'video/', 'audio/', 'text/'];
const ALLOWED_MIME_EXACT = [
  'application/pdf',
  'application/zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/json',
];
const BLOCKED_EXTENSIONS = ['.exe', '.sh', '.bat', '.cmd', '.msi', '.dll', '.com', '.bin'];
const TEMP_UPLOAD_DIR = path.join(os.tmpdir(), 'geo-distributed-storage', 'gateway-uploads');

fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });

const upload = multer({
  dest: TEMP_UPLOAD_DIR,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      return cb(new ApiError(400, `File type "${ext}" is not allowed`));
    }
    const mimeOk =
      ALLOWED_MIME_EXACT.includes(file.mimetype) ||
      ALLOWED_MIME_PREFIXES.some((prefix) => file.mimetype.startsWith(prefix));
    if (!mimeOk) {
      return cb(new ApiError(400, `MIME type "${file.mimetype}" is not allowed`));
    }
    cb(null, true);
  },
});

/**
 * @openapi
 * /api/files/upload:
 *   post:
 *     summary: Upload a file (routed to nearest healthy regional server)
 *     tags: [Files]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: File uploaded and metadata stored }
 */
router.post('/upload', protect, upload.single('file'), uploadFile);

/**
 * @openapi
 * /api/files:
 *   get:
 *     summary: List the authenticated user's files
 *     tags: [Files]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of files }
 */
router.get('/', protect, listFiles);

/**
 * @openapi
 * /api/files/{id}/download:
 *   get:
 *     summary: Download a file (falls back to replica if primary is down)
 *     tags: [Files]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: File stream }
 */
router.get('/:id/download', protect, downloadFile);

module.exports = router;
