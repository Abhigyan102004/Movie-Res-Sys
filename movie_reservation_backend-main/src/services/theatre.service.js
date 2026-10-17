const prisma = require('../config/database');
const AppError = require('../utils/AppError');

async function getAllTheatres({ city }) {
    const where = {};
    if (city) {
        where.city = city;
    }

    const theatres = await prisma.theatre.findMany({ where, include: { screens: true }, });

    return theatres;
}

async function getTheatreById(id) {
    const theatre = await prisma.theatre.findUnique({
        where: { id: parseInt(id) },
        include: {
            screens: {
                include: { seats: true },
            },
        },
    });

    if (!theatre) {
        throw new AppError('Theatre not found', 404);
    }
    return theatre;
}

async function createTheatre(data) {
    const theatre = await prisma.theatre.create({ data });
    return theatre;
}

async function updateTheatre(id, data) {
    const existing = await prisma.theatre.findUnique({
        where: { id: parseInt(id) },
    });

    if (!existing) {
        throw new AppError('Theatre not found', 404);
    }

    const theatre = await prisma.theatre.update({
        where: { id: parseInt(id) },
        data,
    });

    return theatre;
}

async function deleteTheatre(id) {
    const existing = await prisma.theatre.findUnique({ where: { id: parseInt(id) } });

    if (!existing) {
        throw new AppError('Theatre not found', 404);
    }

    // NEW: Stop deletion if people have paid for tickets at any screen in this theatre
    const activeReservations = await prisma.reservation.findFirst({
        where: {
            showtime: { screen: { theatreId: parseInt(id) } },
            status: 'CONFIRMED'
        }
    });

    if (activeReservations) {
        throw new AppError('Cannot delete: Theatre has active confirmed bookings.', 409);
    }

    await prisma.theatre.delete({ where: { id: parseInt(id) } });
    return existing;
}


async function createScreen(theatreId, data) {
    const theatre = await prisma.theatre.findUnique({
        where: { id: parseInt(theatreId) },
    });

    if (!theatre) {
        throw new AppError('Theatre not found', 404);
    }

    const screen = await prisma.screen.create({
        data: {
            ...data,
            theatreId: parseInt(theatreId),
        },
    });

    const seatsPerRow = 10;
    const numRows = Math.ceil(data.totalSeats / seatsPerRow);
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    const seatsToCreate = [];
    let seatCount = 0;
    
    for (let r = 0; r < numRows; r++) {
        const rowChar = alphabet[r % 26]; 
        for (let n = 1; n <= seatsPerRow; n++) {
            if (seatCount >= data.totalSeats) break; // Stop when we hit the total
            seatsToCreate.push({
                screenId: screen.id,
                row: rowChar,
                number: n,
                seatType: 'REGULAR'
            });
            seatCount++;
        }
    }
    // Insert all generated seats into the database at once
    if (seatsToCreate.length > 0) {
        await prisma.seat.createMany({
            data: seatsToCreate
        });
    }
    // =================================
    return screen;
}

async function deleteScreen(screenId) {
    const existing = await prisma.screen.findUnique({ where: { id: parseInt(screenId) } });

    if (!existing) {
        throw new AppError('Screen not found', 404);
    }

    // Stop deletion if people have paid for tickets at this screen
    const activeReservations = await prisma.reservation.findFirst({
        where: {
            showtime: { screenId: parseInt(screenId) },
            status: 'CONFIRMED'
        }
    });

    if (activeReservations) {
        throw new AppError('Cannot delete: Screen has active confirmed bookings.', 409);
    }

    await prisma.screen.delete({ where: { id: parseInt(screenId) } });
    return existing;
}



module.exports = { getAllTheatres, getTheatreById, createTheatre, updateTheatre, deleteTheatre, createScreen ,deleteScreen};