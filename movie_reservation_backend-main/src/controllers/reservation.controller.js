const reservationService = require('../services/reservation.service');

async function createReservation(req, res, next) {
    try {
        const userId = req.user.id;
        const { showtimeId, seatIds } = req.body;

        const result = await reservationService.createReservation(userId, showtimeId, seatIds);

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createReservation
}