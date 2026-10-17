require('dotenv').config();

const express = require('express');
const app = express();
app.set('trust proxy', 1); // Required for Render & Rate Limiting
const port = process.env.PORT || 3000;
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const { connectRedis } = require('./config/redis');
const { globalLimiter } = require('./middleware/rateLimiter');
const prisma=require('./config/database');

const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const paymentController = require('./controllers/payment.controller');

app.use(cors());           // reqs from react frontend
app.use(helmet());         // security headers for api
app.use(morgan('dev'));    // logs every req

app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

app.use(express.json());   // json parsed in request body 
app.use(globalLimiter);    // rate limiting for all reqs

app.get('/', (req, res) => {
    res.json({ message: 'MovieReservation API' });
});

app.use('/api', routes);
app.use(errorHandler);

// Only start the live server automatically if we are NOT in a test environment
if (process.env.NODE_ENV !== 'test') {
    connectRedis().then(() => {
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });

                    // Background job to clean up abandoned PENDING reservations
            setInterval(async () => {
                try {
                    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
                    const result = await prisma.reservation.updateMany({
                        where: {
                            status: 'PENDING',
                            createdAt: { lt: tenMinsAgo }
                        },
                        data: { status: 'CANCELLED' }
                    });
                    if (result.count > 0) {
                        console.log(`Cleanup: Cancelled ${result.count} abandoned PENDING reservations.`);
                    }
                } catch (err) {
                    console.error('Error during reservation cleanup job:', err);
                }
            }, 60 * 1000); // Runs every 1 minute


    }).catch((error) => {
        console.log(`Failed to start server on port ${port}`, error);
    });
}

// Export the app so our test suite can use it!
module.exports = app;
