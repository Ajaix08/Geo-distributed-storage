process.env.SERVICE_NAME = process.env.REGION_NAME || 'india-server';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const uploadRoutes = require('./routes/uploadRoutes');
const logger = require('../../../shared/logger');
const requestId = require('../../../shared/middleware/requestId');
const errorHandler = require('../../../shared/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5001;
const REGION = process.env.REGION_NAME || 'india';
const STORAGE_DIR = path.resolve(process.env.STORAGE_DIR || path.join(process.cwd(), 'storage', 'uploads'));

// Ensure storage directory exists on boot
fs.mkdirSync(STORAGE_DIR, { recursive: true });

app.use(helmet());
app.use(cors());
app.use(requestId);

app.use('/', uploadRoutes(STORAGE_DIR, REGION));

app.get('/health', (req, res) => {
  res.json({ status: 'UP', region: REGION, timestamp: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`${REGION} regional server listening on port ${PORT}`, { storageDir: STORAGE_DIR });
});
