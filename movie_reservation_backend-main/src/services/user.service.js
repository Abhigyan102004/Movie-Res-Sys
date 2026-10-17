const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const QRCode = require('qrcode');
const bcrypt =require('bcryptjs');

async function getUserProfile(userId) {
    const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
        }
    });

    if (!user) throw new AppError('User not found', 404);
    return user;
}

async function updateUserProfile(userId,data){
    const user=await prisma.user.update({
        where:{ id: parseInt(userId)},
        data: {
            name: data.name,
            email: data.email
        },
        select:{
            id:true, name:true, email:true, role:true,createdAt:true
        }
    });
    return user;
}

async function getUserReservations(userId) {
    const reservations = await prisma.reservation.findMany({
        where: { 
            userId: parseInt(userId),
            status: { not: 'CANCELLED' } 
        },
        include: {
            showtime: {
                include: {
                    movie: true,
                    screen: { include: { theatre: true } }
                }
            },
            reservedSeats: {
                include: { seat: true }
            },
            payment: true
        },
        orderBy: {
            showtime: { startTime: 'desc' }
        }
    });

    const now = new Date();
    const upcoming = [];
    const past = [];

    for (const res of reservations) {
        const qrData = JSON.stringify({ reservationId: res.id, userId: res.userId, status: res.status });
        const qrCodeBase64 = await QRCode.toDataURL(qrData);

        const formattedRes = {
            ...res,
            qrCode: qrCodeBase64
        };

        if (new Date(res.showtime.endTime) < now) {
            past.push(formattedRes);
        } else {
            upcoming.push(formattedRes);
        }
    }

    return { upcoming, past };
}

async function changePassword(userId, oldPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new AppError('Invalid current password', 400);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { password: hashedPassword }
    });
    return true;
}

async function deleteUserAccount(userId) {
    // Prisma will cascade delete reservations/payments if your schema is set up for it.
    // If not, you might have to delete reservations first!
    await prisma.user.delete({
        where: { id: parseInt(userId) }
    });
    return true;
}


module.exports = {
    getUserProfile,
    getUserReservations, updateUserProfile,
    changePassword,deleteUserAccount
};
