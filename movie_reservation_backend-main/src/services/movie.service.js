const prisma = require('../config/database');
const AppError = require('../utils/AppError');

async function getAllMovies({ status, genre, search, page = 1, limit = 20 }) {
    const where = {};
    if (status) {
        where.status = status;
    }
    if (genre) {
        where.genre = { contains: genre };
    }
    if (search) {
        where.title = { contains: search };
    }

    const take = parseInt(limit) || 20;
    const skip = (parseInt(page) - 1) * take;

    const [movies, total] = await Promise.all([
        prisma.movie.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
        prisma.movie.count({ where })

    ]);

    return { movies, total, page: parseInt(page) || 1, limit: take };
}

async function getMovieById(id) {
    const movie = await prisma.movie.findUnique({
        where: { id: parseInt(id) },
        include: { showtimes: { include: { screen: { include: { theatre: true } } } } },
    });
    if (!movie) {
        throw new AppError('Movie not found', 404);
    }
    return movie;
}

async function createMovie(data) {
    const movie = await prisma.movie.create({ data });
    return movie;
}

async function updateMovie(id, data) {
    const existing = await prisma.movie.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
        throw new AppError('Movie not found', 404);
    }

    const movie = await prisma.movie.update({
        where: { id: parseInt(id) },
        data,
        include: { showtimes: true },
    });
    return movie;
}

async function deleteMovie(id) {
    const existing = await prisma.movie.findUnique({ where: { id: parseInt(id) } });

    if (!existing) {
        throw new AppError('Movie not found', 404);
    }

    // NEW: Stop deletion if people have paid for tickets to this movie
    const activeReservations = await prisma.reservation.findFirst({
        where: {
            showtime: { movieId: parseInt(id) },
            status: 'CONFIRMED'
        }
    });

    if (activeReservations) {
        throw new AppError('Cannot delete: Movie has active confirmed bookings.', 409);
    }

    await prisma.movie.delete({ where: { id: parseInt(id) } });
    return existing;
}


module.exports = { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };


