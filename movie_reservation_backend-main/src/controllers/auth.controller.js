const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({
      success: true,
      data: user,
      message: 'User registered successfully',
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken, // body is fine for sprint speed
      },
      message: 'Login successful',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };