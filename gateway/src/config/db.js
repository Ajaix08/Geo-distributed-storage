const mongoose = require('mongoose');
const logger = require('../../../shared/logger');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://mongodb:27017/geo_storage';
  try {
    await mongoose.connect(uri);
    logger.info('MongoDB connected', { uri: uri.replace(/\/\/.*@/, '//***@') });
  } catch (err) {
    logger.error('MongoDB connection failed', { error: err.message });
    // Retry after a delay instead of crashing immediately — useful when
    // mongo container is still starting up in docker-compose.
    setTimeout(connectDB, 5000);
  }
}

module.exports = connectDB;
