const { REGIONS } = require('../../../shared/config/regions');
const { getRegistry, getHealthyServers } = require('./healthCheckService');
const logger = require('../../../shared/logger');

/**
 * Server Selection Service
 * -------------------------------------------------------------------------
 * Phase 1: honor an explicit `x-region` header from the client (fast path,
 *          e.g. the frontend already knows the user's approximate region).
 * Phase 2: if no header, or the requested region is unhealthy, fall back to
 *          picking the healthy server with the lowest measured latency.
 *
 * This is the single abstraction the gateway routes call — everything else
 * (health polling, failover) is hidden behind it.
 */
function selectBestServer(userRegion) {
  const registry = getRegistry();
  const healthy = getHealthyServers();

  if (healthy.length === 0) {
    logger.error('No healthy regional servers available');
    return null;
  }

  // Phase 1: explicit region requested and it's currently healthy
  if (userRegion && REGIONS[userRegion] && registry[userRegion]?.status === 'UP') {
    return userRegion;
  }

  if (userRegion && REGIONS[userRegion]) {
    logger.warn(`Requested region "${userRegion}" is unavailable, falling back to lowest latency`);
  }

  // Phase 2: lowest-latency healthy server
  const best = healthy.reduce((lowest, region) => {
    const latency = registry[region].latency ?? Infinity;
    const lowestLatency = registry[lowest]?.latency ?? Infinity;
    return latency < lowestLatency ? region : lowest;
  }, healthy[0]);

  return best;
}

// Picks a backup region (different from primary) for async replication
function selectReplicaServer(primaryRegion) {
  const healthy = getHealthyServers().filter((r) => r !== primaryRegion);
  if (healthy.length === 0) return null;
  const registry = getRegistry();
  return healthy.reduce((lowest, region) => {
    const latency = registry[region].latency ?? Infinity;
    const lowestLatency = registry[lowest]?.latency ?? Infinity;
    return latency < lowestLatency ? region : lowest;
  }, healthy[0]);
}

module.exports = { selectBestServer, selectReplicaServer };
