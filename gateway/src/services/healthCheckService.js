const axios = require('axios');
const { REGIONS } = require('../../../shared/config/regions');
const logger = require('../../../shared/logger');
const env = require('../config/env');

/**
 * In-memory health/latency registry for all regional servers.
 * Structure: { india: { status: 'UP'|'DOWN', latency: number|null, lastChecked } }
 */
const registry = Object.fromEntries(
  Object.keys(REGIONS).map((r) => [r, { status: 'UNKNOWN', latency: null, lastChecked: null }])
);

async function pingRegion(regionName) {
  const region = REGIONS[regionName];
  const start = Date.now();
  try {
    await axios.get(`${region.url}/health`, { timeout: 3000 });
    const latency = Date.now() - start;
    registry[regionName] = { status: 'UP', latency, lastChecked: new Date().toISOString() };
  } catch (err) {
    registry[regionName] = { status: 'DOWN', latency: null, lastChecked: new Date().toISOString() };
    logger.warn(`Health check failed for ${regionName}`, { error: err.message });
  }
}

async function pingAllRegions() {
  await Promise.all(Object.keys(REGIONS).map(pingRegion));
}

function startHealthMonitor() {
  pingAllRegions(); // run once immediately on boot
  setInterval(pingAllRegions, env.HEALTH_CHECK_INTERVAL_MS);
  logger.info('Health monitor started', { intervalMs: env.HEALTH_CHECK_INTERVAL_MS });
}

function getRegistry() {
  return registry;
}

function getHealthyServers() {
  return Object.entries(registry)
    .filter(([, v]) => v.status === 'UP')
    .map(([name]) => name);
}

module.exports = { startHealthMonitor, getRegistry, getHealthyServers, pingAllRegions };
