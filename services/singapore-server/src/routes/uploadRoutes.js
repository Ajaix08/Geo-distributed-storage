const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../../../../shared/utils/ApiError');
const asyncHandler = require('../../../../shared/utils/asyncHandler');
const logger = require('../../../../shared/logger');

module.exports = function buildUploadRoutes(storageDir, region) {
  const router = express.Router();

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, storageDir),
    // Honor the storedName the gateway generated (uuid + original extension)
    // so the same filename is used consistently across primary + replicas.
    filename: (req, file, cb) => {
      const name = req.body.storedName || `${Date.now()}-${file.originalname}`;
      cb(null, name);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB, mirrors gateway limit
  });

  // POST /upload — accepts a file from the gateway (primary write or replica write)
  router.post(
    '/upload',
    upload.single('file'),
    asyncHandler(async (req, res) => {
      if (!req.file) throw new ApiError(400, 'No file provided');

      logger.info('File stored', {
        requestId: req.id,
        region,
        storedName: req.file.filename,
        size: req.file.size,
      });

      res.status(201).json({
        success: true,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        server: region,
      });
    })
  );

  // GET /files/:id — metadata lookup for a stored file by its stored filename
  router.get(
    '/files/:id',
    asyncHandler(async (req, res) => {
      const filePath = path.join(storageDir, req.params.id);
      if (!fs.existsSync(filePath)) throw new ApiError(404, 'File not found on this server');
      const stats = fs.statSync(filePath);
      res.json({
        success: true,
        filename: req.params.id,
        size: stats.size,
        server: region,
      });
    })
  );

  // GET /download/:filename — streams the raw file back to the gateway
  router.get('/download/:filename', (req, res, next) => {
    // Prevent path traversal — only allow the bare filename
    const safeName = path.basename(req.params.filename);
    const filePath = path.join(storageDir, safeName);

    if (!fs.existsSync(filePath)) {
      return next(new ApiError(404, 'File not found on this server'));
    }

    logger.info('File served', { requestId: req.id, region, filename: safeName });
    res.sendFile(filePath);
  });

  return router;
};
