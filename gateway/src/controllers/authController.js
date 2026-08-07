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

const axios = require('axios');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const crypto = require('crypto');

// Redirects user to Google's OAuth2 consent page
const googleAuth = (req, res) => {
  const redirectUri = `${env.BACKEND_URL || `http://localhost:${env.PORT}`}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });
  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};

// Handles the OAuth2 callback from Google, exchanges code, creates/returns JWT
const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  if (!code) throw new ApiError(400, 'Missing code from Google');

  const redirectUri = `${env.BACKEND_URL || `http://localhost:${env.PORT}`}/api/auth/google/callback`;

  // Exchange code for tokens
  const tokenResp = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  }).toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  const { id_token } = tokenResp.data;
  if (!id_token) throw new ApiError(500, 'Failed to obtain id_token from Google');

  const decoded = jwt.decode(id_token);
  const email = decoded?.email;
  const name = decoded?.name || decoded?.email?.split('@')[0];
  if (!email) throw new ApiError(500, 'Google account did not return an email');

  let user = await User.findOne({ email });
  if (!user) {
    // create local user with a random password
    const randomPwd = crypto.randomBytes(16).toString('hex');
    user = await User.create({ name, email, password: randomPwd });
    logger.info('Created user via Google OAuth', { requestId: req.id, userId: user._id.toString() });
  }

  const token = signToken({ id: user._id, email: user.email });

  // Redirect back to frontend with token and basic user info
  const redirectTo = `${env.FRONTEND_URL}/auth/google/success?token=${encodeURIComponent(token)}&name=${encodeURIComponent(
    user.name,
  )}&email=${encodeURIComponent(user.email)}`;
  return res.redirect(redirectTo);
});

module.exports = { register, login, googleAuth, googleCallback };
