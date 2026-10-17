const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, reservationController.createReservation);

module.exports = router;
