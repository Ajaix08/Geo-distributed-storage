const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { REGIONS } = require('../../../shared/config/regions');
const { selectReplicaServer } = require('./serverSelectionService');
const logger = require('../../../shared/logger');
const File = require('../models/File');

/**
 * Fire-and-forget replication: after the primary upload succeeds, copy the
 * file to one healthy backup region and update MongoDB once it completes.
 * Runs asynchronously so it never blocks the user's upload response.
 */
async function replicateFile({ fileDoc, localFilePath, primaryRegion }) {
  const replicaRegion = selectReplicaServer(primaryRegion);
  if (!replicaRegion) {
    logger.warn('No healthy replica region available, skipping replication', {
      fileId: fileDoc._id.toString(),
    });
    fileDoc.replicationStatus = 'failed';
    await fileDoc.save();
    return;
  }

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(localFilePath), fileDoc.storedName);
    form.append('storedName', fileDoc.storedName);

    await axios.post(`${REGIONS[replicaRegion].url}/upload`, form, {
      headers: form.getHeaders(),
      timeout: 15000,
    });

    fileDoc.replicatedServers = Array.from(new Set([...(fileDoc.replicatedServers || []), replicaRegion]));
    fileDoc.replicationStatus = 'completed';
    await fileDoc.save();

    logger.info('Replication completed', {
      fileId: fileDoc._id.toString(),
      replicaRegion,
    });
  } catch (err) {
    fileDoc.replicationStatus = 'failed';
    await fileDoc.save();
    logger.error('Replication failed', { fileId: fileDoc._id.toString(), error: err.message });
  }
}

module.exports = { replicateFile };
