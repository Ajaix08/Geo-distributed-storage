const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const ApiError = require('../../../shared/utils/ApiError');
const asyncHandler = require('../../../shared/utils/asyncHandler');
const logger = require('../../../shared/logger');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const user = await User.create({ name, email, password });
  const token = signToken({ id: user._id, email: user.email });

  logger.info('User registered', { requestId: req.id, userId: user._id.toString() });

  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken({ id: user._id, email: user.email });

  logger.info('User logged in', { requestId: req.id, userId: user._id.toString() });

  res.status(200).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

module.exports = { register, login };
