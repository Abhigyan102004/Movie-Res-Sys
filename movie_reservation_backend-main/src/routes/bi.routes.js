const express = require('express');
const router = express.Router();
const biController = require('../controllers/bi.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('ADMIN'));

router.get('/kpis', biController.getKPIs);
router.get('/funnel', biController.getSalesFunnel);
router.get('/revenue-by-movie', biController.getRevenueByMovie);
router.get('/popular-showtimes', biController.getPopularShowtimes);
router.get('/seat-popularity', biController.getSeatPopularity);
router.get('/venue-matrix', biController.getVenueMovieMatrix);

module.exports = router;
