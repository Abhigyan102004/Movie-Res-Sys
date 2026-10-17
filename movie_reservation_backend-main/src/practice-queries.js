const prisma = require('./config/database');

async function main() {
  console.log('\n========== PRISMA QUERY PRACTICE ==========\n');

  // ===== 1. BASIC QUERIES =====
  console.log('1. All movies:');
  const allMovies = await prisma.movie.findMany();
  allMovies.forEach(m => console.log(`   - ${m.title} (${m.genre})`));

  // ===== 2. FILTERING =====
  console.log('\n2. Movies NOW_SHOWING:');
  const nowShowing = await prisma.movie.findMany({
    where: { status: 'NOW_SHOWING' }
  });
  nowShowing.forEach(m => console.log(`   - ${m.title}`));

  // ===== 3. FIND ONE =====
  console.log('\n3. Find movie by title (contains):');
  const foundMovie = await prisma.movie.findFirst({
    where: { 
      title: { contains: 'Avengers' }
    }
  });
  console.log(`   Found: ${foundMovie?.title || 'Not found'}`);

  // ===== 4. SELECT SPECIFIC FIELDS =====
  console.log('\n4. Movies with only title and rating:');
  const movieTitles = await prisma.movie.findMany({
    select: {
      title: true,
      rating: true
    }
  });
  movieTitles.forEach(m => console.log(`   - ${m.title}: ${m.rating}/10`));

  // ===== 5. INCLUDE RELATIONS =====
  console.log('\n5. Theatres with their screens:');
  const theatres = await prisma.theatre.findMany({
    include: { screens: true }
  });
  theatres.forEach(t => {
    console.log(`   ${t.name} (${t.city}):`);
    t.screens.forEach(s => console.log(`     - ${s.name}: ${s.totalSeats} seats`));
  });

  // ===== 6. NESTED INCLUDES =====
  console.log('\n6. Showtimes with movie and theatre info:');
  const showtimes = await prisma.showtime.findMany({
    include: {
      movie: true,
      screen: {
        include: { theatre: true }
      }
    }
  });
  showtimes.forEach(st => {
    const time = st.startTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    console.log(`   - ${st.movie.title} at ${time}`);
    console.log(`     ${st.screen.theatre.name} - ${st.screen.name} - ₹${st.price}`);
  });

  // ===== 7. COUNT =====
  console.log('\n7. Counts:');
  const userCount = await prisma.user.count();
  const movieCount = await prisma.movie.count();
  const seatCount = await prisma.seat.count();
  console.log(`   Users: ${userCount}`);
  console.log(`   Movies: ${movieCount}`);
  console.log(`   Total Seats: ${seatCount}`);

  // ===== 8. COUNT WITH FILTER =====
  console.log('\n8. VIP seats count:');
  const vipCount = await prisma.seat.count({
    where: { seatType: 'VIP' }
  });
  console.log(`   VIP Seats: ${vipCount}`);

  // ===== 9. GROUP BY =====
  console.log('\n9. Seats grouped by type:');
  const seatsByType = await prisma.seat.groupBy({
    by: ['seatType'],
    _count: { id: true }
  });
  seatsByType.forEach(group => {
    console.log(`   ${group.seatType}: ${group._count.id} seats`);
  });

  // ===== 10. ORDER BY =====
  console.log('\n10. Movies ordered by rating (highest first):');
  const topRated = await prisma.movie.findMany({
    where: { rating: { not: null } },
    orderBy: { rating: 'desc' },
    take: 3
  });
  topRated.forEach((m, i) => console.log(`   ${i + 1}. ${m.title} - ${m.rating}/10`));

  // ===== 11. PAGINATION =====
  console.log('\n11. Seats with pagination (page 2, 10 per page):');
  const page = 2;
  const perPage = 10;
  const paginatedSeats = await prisma.seat.findMany({
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: [{ row: 'asc' }, { number: 'asc' }]
  });
  console.log(`   Page ${page}: ${paginatedSeats.map(s => `${s.row}${s.number}`).join(', ')}`);

  // ===== 12. COMPLEX QUERY =====
  console.log('\n12. Screens with seat count by type:');
  const screens = await prisma.screen.findMany({
    include: {
      theatre: true,
      seats: true
    }
  });
  screens.forEach(screen => {
    const vip = screen.seats.filter(s => s.seatType === 'VIP').length;
    const premium = screen.seats.filter(s => s.seatType === 'PREMIUM').length;
    const regular = screen.seats.filter(s => s.seatType === 'REGULAR').length;
    console.log(`   ${screen.theatre.name} - ${screen.name}:`);
    console.log(`     VIP: ${vip}, Premium: ${premium}, Regular: ${regular}`);
  });

  // ===== 13. FIND UNIQUE =====
  console.log('\n13. Find user by email:');
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  });
  console.log(`   Found: ${admin?.name} (${admin?.role})`);

  // ===== 14. EXISTS CHECK =====
  console.log('\n14. Check if movie exists:');
  const exists = await prisma.movie.findFirst({
    where: { title: 'Dhurandhar' }
  });
  console.log(`   "Inception" exists: ${exists ? 'Yes' : 'No'}`);

  console.log('\n========== QUERIES COMPLETE ==========\n');


// all admins
const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' }
});
admins.forEach(a=> console.log(`   - ${a.name} (${a.email})`));

}
  main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());