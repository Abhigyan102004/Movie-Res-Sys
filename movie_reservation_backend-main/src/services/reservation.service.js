const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const stripe = require('../config/stripe');
const { redisClient } = require('../config/redis');

async function createReservation(userId, showtimeId, seatIds) {
    const showtime = await prisma.showtime.findUnique({
        where: { id: parseInt(showtimeId) }
    });
    if (!showtime) throw new AppError('Showtime not found', 404);

    for (const seatId of seatIds) {
        const lockKey = `lock:showtime:${showtimeId}:seat:${seatId}`;
        const lockedBy = await redisClient.get(lockKey);

        if (lockedBy !== userId.toString()) {
            throw new AppError(`You do not hold the lock for seat ${seatId}. Please lock it first.`, 403);
        }
    }

    const totalAmount = parseFloat(showtime.price) * seatIds.length;

    const reservation = await prisma.$transaction(async (tx) => {
        const newRes = await tx.reservation.create({
            data: {
                userId: parseInt(userId),
                showtimeId: parseInt(showtimeId),
                totalAmount: totalAmount,
                status: 'PENDING',
                reservedSeats: {
                    create: seatIds.map(seatId => ({ seatId: parseInt(seatId) }))
                }
            }
        });
        return newRes;
    });

    const amountInCents = Math.round(totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: {
            reservationId: reservation.id.toString(),
            userId: userId.toString()
        }
    });

    await prisma.payment.create({
        data: {
            reservationId: reservation.id,
            stripePaymentId: paymentIntent.id,
            amount: totalAmount,
            status: 'PENDING'
        }
    });

    return {
        reservation,
        clientSecret: paymentIntent.client_secret
    };
}

module.exports = {
    createReservation
};
