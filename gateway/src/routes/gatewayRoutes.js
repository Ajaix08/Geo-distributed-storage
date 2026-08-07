const express = require('express');
const { getRegistry } = require('../services/healthCheckService');
const { REGIONS } = require('../../../shared/config/regions');

const router = express.Router();

/**
 * @openapi
 * /api/gateway/health:
 *   get:
 *     summary: Health/latency status of all regional servers
 *     tags: [Gateway]
 *     responses:
 *       200: { description: Per-region status and latency }
 */
router.get('/health', (req, res) => {
  const registry = getRegistry();
  const payload = Object.fromEntries(
    Object.keys(REGIONS).map((region) => [region, {
      status: registry[region]?.status || 'UNKNOWN',
      latency: registry[region]?.latency ?? null,
    }])
  );

  res.json(payload);
});

module.exports = router;
