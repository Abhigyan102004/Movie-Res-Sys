const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const {authLimiter} = require('../middleware/rateLimiter');

router.post('/register', validate(registerSchema),authLimiter, authController.register);

router.post('/login', validate(loginSchema),authLimiter, authController.login);

module.exports = router;