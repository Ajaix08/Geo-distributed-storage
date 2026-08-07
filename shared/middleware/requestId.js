const { v4: uuidv4 } = require('uuid');

// Attaches a unique requestId to every request for traceability across services
function requestId(req, res, next) {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('x-request-id', req.id);
  next();
}

module.exports = requestId;
