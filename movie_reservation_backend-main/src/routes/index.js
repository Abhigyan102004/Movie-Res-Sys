const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const movieRoutes = require('./movies.routes');
const theatreRoutes = require('./theatres.routes');
const userRoutes = require('./users.routes');
const showtimeRoutes = require('./showtimes.routes');
const reservationRoutes = require('./reservation.routes');
const paymentRoutes = require('./payments.routes');
const adminRoutes = require('./admin.routes');
const biRoutes = require('./bi.routes');

router.use('/admin/bi', biRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes);
router.use('/reservations', reservationRoutes);
router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/theatres', theatreRoutes);
router.use('/users', userRoutes);
router.use('/showtimes', showtimeRoutes);

module.exports = router;