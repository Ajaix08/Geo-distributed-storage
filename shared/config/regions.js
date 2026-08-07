// Single source of truth for regional server metadata, shared by the
// gateway (for routing) and can be imported by scripts/tests.
const REGIONS = {
  india: {
    name: 'india',
    label: 'India (Mumbai)',
    url: process.env.INDIA_SERVER_URL || 'http://india-server:5001',
  },
  singapore: {
    name: 'singapore',
    label: 'Singapore',
    url: process.env.SINGAPORE_SERVER_URL || 'http://singapore-server:5002',
  },
  germany: {
    name: 'germany',
    label: 'Germany (Frankfurt)',
    url: process.env.GERMANY_SERVER_URL || 'http://germany-server:5003',
  },
};

module.exports = { REGIONS };
