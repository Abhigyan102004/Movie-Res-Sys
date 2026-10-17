const prisma = require('../config/database');

async function getKPIs(req, res, next) {
    try {
        // totalRevenue (confirmed)
        const revenueAgg = await prisma.reservation.aggregate({
            _sum: { totalAmount: true },
            where: { status: 'CONFIRMED' }
        });
        const totalRevenue = revenueAgg._sum.totalAmount || 0;

        // total ticks sold
        const ticketsSold = await prisma.reservation.count({
            where: { status: 'CONFIRMED' }
        });

        // Calc active showtimes
        const activeShowtimes = await prisma.showtime.count({
            where: { endTime: { gt: new Date() } }
        });

        // total users
        const totalUsers = await prisma.user.count();

        res.json({
            totalRevenue,
            ticketsSold,
            activeShowtimes,
            totalUsers
        });
    } catch (err) {
        next(err);
    }
}

// sales funnel
async function getSalesFunnel(req, res, next) {
    try {
        // group by status
        const funnelData = await prisma.reservation.groupBy({
            by: ['status'],
            _count: {
                id: true
            }
        });

        // chart
        const formattedData = funnelData.map(item => ({
            name: item.status,
            value: item._count.id,
            fill: item.status === 'CONFIRMED' ? '#22c55e' : item.status === 'PENDING' ? '#f59e0b' : '#ef4444'
        }));

        res.json(formattedData);
    } catch (err) {
        next(err);
    }
}

// revenue by movie
async function getRevenueByMovie(req, res, next) {
    try {
        const reservations = await prisma.reservation.findMany({
            where: { status: 'CONFIRMED' },
            include: {
                showtime: {
                    include: { movie: true }
                }
            }
        });

        const movieRevenueMap = {};

        reservations.forEach(res => {
            const movieTitle = res.showtime.movie.title;
            const amount = parseFloat(res.totalAmount);
            
            if (!movieRevenueMap[movieTitle]) {
                movieRevenueMap[movieTitle] = 0;
            }
            movieRevenueMap[movieTitle] += amount;
        });

        const formattedData = Object.keys(movieRevenueMap).map(title => ({
            name: title,
            revenue: movieRevenueMap[title]
        })).sort((a, b) => b.revenue - a.revenue);

        res.json(formattedData);
    } catch (err) {
        next(err);
    }
}

// Popular Showtimes (Area Chart)
async function getPopularShowtimes(req, res, next) {
    try {
        const reservations = await prisma.reservation.findMany({
            where: { status: 'CONFIRMED' },
            include: { showtime: true }
        });
        
        let buckets = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
        reservations.forEach(r => {
            if (!r.showtime) return;
            const hour = new Date(r.showtime.startTime).getHours();
            if (hour >= 6 && hour < 12) buckets.Morning++;
            else if (hour >= 12 && hour < 17) buckets.Afternoon++;
            else if (hour >= 17 && hour < 21) buckets.Evening++;
            else buckets.Night++;
        });
        
        const formattedData = Object.keys(buckets).map(key => ({
            timeOfDay: key,
            tickets: buckets[key]
        }));
        res.json(formattedData);
    } catch (err) { next(err); }
}

// Seat Popularity (Heatmap)
async function getSeatPopularity(req, res, next) {
    try {
        const reservedSeats = await prisma.reservedSeat.findMany({
            include: { seat: true }
        });
        
        const seatCounts = {};
        reservedSeats.forEach(rs => {
            if (!rs.seat) return;
            const key = `${rs.seat.row}-${rs.seat.number}`;
            seatCounts[key] = (seatCounts[key] || 0) + 1;
        });
        
        res.json(seatCounts);
    } catch (err) { next(err); }
}

// Venue vs Movie Performance (Matrix)
async function getVenueMovieMatrix(req, res, next) {
    try {
        const reservations = await prisma.reservation.findMany({
            where: { status: 'CONFIRMED' },
            include: {
                showtime: {
                    include: { 
                        movie: true, 
                        screen: { include: { theatre: true } } 
                    }
                }
            }
        });
        
        const matrix = {};
        const allMovies = new Set();
        
        reservations.forEach(r => {
            if (!r.showtime || !r.showtime.screen || !r.showtime.screen.theatre || !r.showtime.movie) return;
            const theatreName = r.showtime.screen.theatre.name;
            const movieTitle = r.showtime.movie.title;
            const amount = parseFloat(r.totalAmount);
            
            allMovies.add(movieTitle);
            if (!matrix[theatreName]) matrix[theatreName] = {};
            if (!matrix[theatreName][movieTitle]) matrix[theatreName][movieTitle] = 0;
            
            matrix[theatreName][movieTitle] += amount;
        });
        
        res.json({
            movies: Array.from(allMovies),
            matrix
        });
    } catch (err) { next(err); }
}

module.exports = {
    getKPIs,
    getSalesFunnel,
    getRevenueByMovie,
    getPopularShowtimes,
    getSeatPopularity,
    getVenueMovieMatrix
};
