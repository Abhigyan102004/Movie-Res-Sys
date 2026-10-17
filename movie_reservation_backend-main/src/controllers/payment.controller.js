const prisma = require('../config/database');
const emailService=require('../services/email.service');
const QRCode=require('qrcode');
const stripe = require('../config/stripe');

async function processWebhookEvent(event) {
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const reservationId = parseInt(paymentIntent.metadata.reservationId);

        // IDEMPOTENCY & RACE-CONDITION CHECK: Atomic update using DB row-locking
        const updateResult = await prisma.reservation.updateMany({
            where: { 
                id: reservationId,
                status: 'PENDING' 
            },
            data: { status: 'CONFIRMED' }
        });

        // If count is 0, another webhook already updated it to CONFIRMED!
        if (updateResult.count === 0) {
            console.log(`Reservation ${reservationId} is already confirmed. Skipping duplicate webhook.`);
            return;
        }

        // We know we are the ONE successful process, so we can safely update payment
        await prisma.payment.updateMany({
            where: { 
                reservationId: reservationId,
                status: 'PENDING'
            },
            data: { status: 'COMPLETED' }
        });

        const fullReservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                user: true,
                showtime: {
                    include: {
                        movie: true,
                        screen: { include: { theatre: true } }
                    }
                }
            }
        });

        const qrData = JSON.stringify({
            reservationId: fullReservation.id,
            userId: fullReservation.userId,
            status: fullReservation.status
        });
        const qrCodeBase64 = await QRCode.toDataURL(qrData);

        await emailService.sendTicketEmail(fullReservation.user.email, fullReservation.showtime.movie.title, fullReservation.showtime, qrCodeBase64);

        console.log(`Reservation ${reservationId} has been confirmed!`);
    }
}

async function handleWebhook(req, res, next) {
    try {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err) {
            console.error(' Webhook signature verification failed.', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        await processWebhookEvent(event);

        res.json({ received: true });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    handleWebhook,
    processWebhookEvent
};
