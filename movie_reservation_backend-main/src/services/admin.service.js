const prisma=require('../config/database');

async function getDashboardStats({ startDate, endDate } = {}) {
    const dateFilter = {};
    if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.createdAt.lte = end;
        }
    }

    const revenueAgg = await prisma.reservation.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'CONFIRMED', ...dateFilter }
    });

    const ticketsSold = await prisma.reservedSeat.count({
        where: { reservation: { status: 'CONFIRMED', ...dateFilter } }
    });

    const totalUsers = await prisma.user.count({
        where: { role: 'USER', ...dateFilter }
    });

    const movies = await prisma.movie.findMany({
        select: {
            title: true,
            showtimes: {
                select: {
                    reservations: {
                        where: { status: 'CONFIRMED', ...dateFilter },
                        select: { totalAmount: true, reservedSeats: true }
                    }
                }
            }
        }
    });

    const revenueByMovie = movies.map(movie => {
        let movieRevenue = 0;
        let tickets = 0;
        movie.showtimes.forEach(showtime => {
            showtime.reservations.forEach(res => {
                movieRevenue += parseFloat(res.totalAmount);
                tickets += res.reservedSeats.length;
            });
        });
        return {
            title: movie.title,
            revenue: movieRevenue,
            tickets
        };
    }).filter(movie => movie.revenue > 0).sort((a,b) => b.revenue - a.revenue);

    return {
        totalRevenue: revenueAgg._sum.totalAmount ? parseFloat(revenueAgg._sum.totalAmount) : 0,
        ticketsSold, 
        totalUsers, 
        revenueByMovie
    };
}

module.exports = { getDashboardStats };
