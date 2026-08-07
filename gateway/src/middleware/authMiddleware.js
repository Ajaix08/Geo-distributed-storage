const { verifyToken } = require('../utils/jwt');
const ApiError = require('../../../shared/utils/ApiError');
const asyncHandler = require('../../../shared/utils/asyncHandler');

// Protects routes by validating the JWT bearer token
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  const token = header.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    throw new ApiError(401, 'Not authorized, token invalid or expired');
  }
});

module.exports = { protect };
