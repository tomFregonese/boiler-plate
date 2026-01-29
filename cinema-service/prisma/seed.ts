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
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    '550e8400-e29b-41d4-a716-446655440000',
    '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
    'c56a4180-65aa-42ec-a945-5fd21dec0538',
    'a3bb189e-8bf9-3888-9912-ace4e6543002',
    '6ecd8c99-4036-403d-bf84-cf8400f67836',
];

const TIME_SLOTS = [10, 13, 16, 19];

const CINEMAS = [
    {
        name: 'Pathé Bercy',
        address: '2 Cour Saint-Émilion',
        city: 'Paris',
        postalCode: '75012',
        rooms: 4,
    },
    {
        name: 'UGC Confluence',
        address: '80 Quai Perrache',
        city: 'Lyon',
        postalCode: '69002',
        rooms: 3,
    },
    {
        name: 'Gaumont Prado',
        address: '36 Avenue du Prado',
        city: 'Marseille',
        postalCode: '13006',
        rooms: 3,
    },
    {
        name: 'CGR Bordeaux',
        address: '13-15 Rue Georges Bonnac',
        city: 'Bordeaux',
        postalCode: '33000',
        rooms: 4,
    },
    {
        name: 'Kinepolis Lomme',
        address: 'Rue du Grand But',
        city: 'Lille',
        postalCode: '59160',
        rooms: 3,
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

            const session = await prisma.session.create({
                data: {
                    filmId,
                    roomId: room.id,
                    startTime,
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
