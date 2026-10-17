const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/me', authenticate, userController.getProfile);
router.get('/me/reservations',authenticate,userController.getReservations);
router.put('/me', authenticate, userController.updateProfile);

// PUT update password
router.put('/me/password', authenticate, userController.updatePassword);

// DELETE account
router.delete('/me', authenticate, userController.deleteAccount);

module.exports = router;