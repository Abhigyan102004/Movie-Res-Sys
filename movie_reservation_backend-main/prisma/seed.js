const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const bcrypt = require('bcryptjs');

async function main() {
    console.log('Seeding the database...');

    await prisma.seatLock.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.reservedSeat.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.showtime.deleteMany();
    await prisma.seat.deleteMany();
    await prisma.screen.deleteMany();
    await prisma.movie.deleteMany();
    await prisma.theatre.deleteMany();
    await prisma.user.deleteMany();

    console.log('cleaning done');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // users
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            passwordHash: hashedPassword,
            name: 'Admin Account',
            role: 'ADMIN'
        },
    });

    console.log('Admin user created:', adminUser.email);

    console.log('\nSeed completed!');
}

main()
    .catch((e) => {
        console.error('seed failed', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
