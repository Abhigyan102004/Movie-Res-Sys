const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');

function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    authConfig.jwtSecret,
    { expiresIn: authConfig.jwtExpiresIn }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.id },
    authConfig.jwtRefreshSecret,
    { expiresIn: authConfig.jwtRefreshExpiresIn }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, authConfig.jwtSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, authConfig.jwtRefreshSecret);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};