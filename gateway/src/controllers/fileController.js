const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const File = require('../models/File');
const { REGIONS } = require('../../../shared/config/regions');
const { selectBestServer } = require('../services/serverSelectionService');
const { replicateFile } = require('../services/replicationService');
const { getRegistry } = require('../services/healthCheckService');
const ApiError = require('../../../shared/utils/ApiError');
const asyncHandler = require('../../../shared/utils/asyncHandler');
const logger = require('../../../shared/logger');

// POST /api/files/upload  — routes the incoming file to the nearest healthy region
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file provided');

  const userRegion = req.headers['x-region'];
  const primaryRegion = selectBestServer(userRegion);
  if (!primaryRegion) throw new ApiError(503, 'No regional server is currently available');

  const storedName = `${uuidv4()}${path.extname(req.file.originalname)}`;
  const cleanupTempFile = () => fs.unlink(req.file.path, () => {});

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), storedName);
    form.append('storedName', storedName);

    await axios.post(`${REGIONS[primaryRegion].url}/upload`, form, {
      headers: form.getHeaders(),
      timeout: 20000,
    });
    const fileDoc = await File.create({
      userId: req.user.id,
      originalName: req.file.originalname,
      storedName,
      mimeType: req.file.mimetype,
      size: req.file.size,
      primaryServer: primaryRegion,
      replicatedServers: [],
      replicationStatus: 'pending',
    });

    logger.info('File uploaded', {
      requestId: req.id,
      userId: req.user.id,
      fileId: fileDoc._id.toString(),
      primaryRegion,
      size: req.file.size,
    });

    // Replicate asynchronously — do not block the response on it
    replicateFile({ fileDoc, localFilePath: req.file.path, primaryRegion }).finally(cleanupTempFile);

    res.status(201).json({
      success: true,
      file: {
        id: fileDoc._id,
        originalName: fileDoc.originalName,
        size: fileDoc.size,
        primaryServer: fileDoc.primaryServer,
        uploadDate: fileDoc.uploadDate,
      },
    });
  } catch (err) {
    cleanupTempFile();

    if (err instanceof ApiError) {
      throw err;
    }

    logger.error('Primary upload failed', { requestId: req.id, primaryRegion, error: err.message });
    throw new ApiError(502, `Upload to ${primaryRegion} server failed`);
  }
});

// GET /api/files — list the authenticated user's files
const listFiles = asyncHandler(async (req, res) => {
  const files = await File.find({ userId: req.user.id }).sort({ uploadDate: -1 });
  res.json({ success: true, files });
});

// GET /api/files/:id/download — streams from primary, falls back to a replica if primary is down
const downloadFile = asyncHandler(async (req, res) => {
  const file = await File.findOne({ _id: req.params.id, userId: req.user.id });
  if (!file) throw new ApiError(404, 'File not found');

  const registry = getRegistry();
  const candidateServers = [file.primaryServer, ...file.replicatedServers].filter(
    (region, idx, arr) => arr.indexOf(region) === idx
  );

  // Try primary first, only fall back to replicas that are currently healthy
  const orderedServers = candidateServers.sort((a, b) => {
    const aUp = registry[a]?.status === 'UP' ? 0 : 1;
    const bUp = registry[b]?.status === 'UP' ? 0 : 1;
    return aUp - bUp;
  });

  for (const region of orderedServers) {
    try {
      const upstream = await axios.get(`${REGIONS[region].url}/download/${file.storedName}`, {
        responseType: 'stream',
        timeout: 15000,
      });

      logger.info('File downloaded', {
        requestId: req.id,
        fileId: file._id.toString(),
        source: region,
        wasPrimary: region === file.primaryServer,
      });

      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimeType);
      upstream.data.pipe(res);
      return;
    } catch (err) {
      logger.warn('Download attempt failed, trying next server', {
        fileId: file._id.toString(),
        region,
        error: err.message,
      });
    }
  }

  throw new ApiError(503, 'File is currently unavailable on all servers');
});

module.exports = { uploadFile, listFiles, downloadFile };
