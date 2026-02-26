import { PrismaClient, OccupationStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const FILM_IDS = [
    'tt15239678', // Dune: Part Two (2024)
    'tt15398776', // Oppenheimer (2023)
    'tt1517268', // Barbie (2023)
    'tt1877830', // The Batman (2022)
    'tt1630029', // Avatar: The Way of Water (2022)
    'tt1745960', // Top Gun: Maverick (2022)
    'tt10872600', // Spider-Man: No Way Home (2021)
    'tt1375666', // Inception (2010)
    'tt0816692', // Interstellar (2014)
    'tt0468569', // The Dark Knight (2008)
];

const TIME_SLOTS = [10, 13, 16, 19];

const CINEMAS = [
    {
        name: 'Pathé Bercy',
        address: '2 Cour Saint-Émilion',
        city: 'Paris',
        postalCode: '75012',
        rooms: 4,
        ticketPrice: 13.9,
    },
    {
        name: 'UGC Confluence',
        address: '80 Quai Perrache',
        city: 'Lyon',
        postalCode: '69002',
        rooms: 3,
        ticketPrice: 12.5,
    },
    {
        name: 'Gaumont Prado',
        address: '36 Avenue du Prado',
        city: 'Marseille',
        postalCode: '13006',
        rooms: 3,
        ticketPrice: 12.1,
    },
    {
        name: 'CGR Bordeaux',
        address: '13-15 Rue Georges Bonnac',
        city: 'Bordeaux',
        postalCode: '33000',
        rooms: 4,
        ticketPrice: 11.5,
    },
    {
        name: 'Kinepolis Lomme',
        address: 'Rue du Grand But',
        city: 'Lille',
        postalCode: '59160',
        rooms: 3,
        ticketPrice: 11.9,
    },
];

async function main() {
    console.log('Starting seed...');

    await prisma.seatOccupation.deleteMany();
    await prisma.session.deleteMany();
    await prisma.seat.deleteMany();
    await prisma.room.deleteMany();
    await prisma.cinema.deleteMany();

    const allRooms: Array<{ id: string; cinemaName: string }> = [];

    for (const cinemaData of CINEMAS) {
        const cinema = await prisma.cinema.create({
            data: {
                name: cinemaData.name,
                address: cinemaData.address,
                city: cinemaData.city,
                postalCode: cinemaData.postalCode,
                ticketPrice: cinemaData.ticketPrice,
            },
        });

        for (let roomNum = 1; roomNum <= cinemaData.rooms; roomNum++) {
            const room = await prisma.room.create({
                data: {
                    name: `Salle ${roomNum}`,
                    cinemaId: cinema.id,
                },
            });

            // 6 rangées (A-F) x 12 sièges = 72 sièges par salle
            const seats: Array<{
                row: string;
                number: number;
                roomId: string;
            }> = [];
            for (let row = 0; row < 6; row++) {
                const rowLetter = String.fromCharCode(65 + row);
                for (let seatNum = 1; seatNum <= 12; seatNum++) {
                    seats.push({
                        row: rowLetter,
                        number: seatNum,
                        roomId: room.id,
                    });
                }
            }

            await prisma.seat.createMany({ data: seats });
            allRooms.push({ id: room.id, cinemaName: cinema.name });
        }
    }

    console.log(
        `${CINEMAS.length} cinemas created with ${allRooms.length} rooms`,
    );

    // Create ~20 sessions over the next 5 days
    const sessions: Array<{
        id: string;
        filmId: string;
        roomId: string;
        startTime: Date;
        endTime: Date;
    }> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 0; day < 5; day++) {
        const sessionDate = new Date(today);
        sessionDate.setDate(today.getDate() + day);

        // 4-5 sessions per day across different rooms
        const sessionsPerDay = day < 4 ? 5 : 4;

        for (let i = 0; i < sessionsPerDay; i++) {
            const room = allRooms[Math.floor(Math.random() * allRooms.length)];
            const filmId =
                FILM_IDS[Math.floor(Math.random() * FILM_IDS.length)];
            const timeSlot = TIME_SLOTS[i % TIME_SLOTS.length];

            const startTime = new Date(sessionDate);
            startTime.setHours(timeSlot, 0, 0, 0);

            const endTime = new Date(startTime);
            endTime.setHours(startTime.getHours() + 2, 30, 0, 0);

            const session = await prisma.session.create({
                data: {
                    filmId,
                    roomId: room.id,
                    startTime,
                    endTime,
                },
            });

            sessions.push(session);
        }
    }

    console.log(`${sessions.length} sessions created`);

    // Create seat occupations for all sessions
    let totalBookings = 0;

    for (const session of sessions) {
        const seats = await prisma.seat.findMany({
            where: { roomId: session.roomId },
        });

        // Create seat occupations (all FREE initially)
        const occupations = seats.map((seat) => ({
            sessionId: session.id,
            seatId: seat.id,
            status: OccupationStatus.FREE,
        }));

        await prisma.seatOccupation.createMany({ data: occupations });

        // Book random seats for some sessions (30% of sessions have bookings)
        if (Math.random() < 0.3) {
            const numBookings = Math.floor(Math.random() * 8) + 2; // 2-10 seats
            const shuffledSeats = seats.sort(() => Math.random() - 0.5);
            const seatsToBook = shuffledSeats.slice(0, numBookings);

            for (const seat of seatsToBook) {
                await prisma.seatOccupation.update({
                    where: {
                        sessionId_seatId: {
                            sessionId: session.id,
                            seatId: seat.id,
                        },
                    },
                    data: {
                        status: OccupationStatus.OCCUPIED,
                        userId: `user-${Math.floor(Math.random() * 100)}`,
                    },
                });
                totalBookings++;
            }
        }
    }

    console.log(`${totalBookings} seats booked across sessions`);
    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await pool.end();
        await prisma.$disconnect();
    });
