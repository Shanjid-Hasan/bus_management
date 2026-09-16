/**
 * Seed sample buses into MongoDB.
 *
 * Usage:
 *   npm run seed            — seed only if the buses collection is empty
 *   npm run seed -- --force — wipe the buses collection first, then reseed
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('../config/db');
const Bus = require('../models/Bus');

// Returns a Date `daysFromNow` days ahead of today, anchored to UTC midnight.
// The frontend's date filter is UTC-based (built with toISOString()), so the
// seed data must line up with UTC "today" rather than the server's local
// calendar day, or the two can disagree depending on the server's timezone.
const dateInDays = (daysFromNow) => {
  const now = new Date();
  const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  base.setUTCDate(base.getUTCDate() + daysFromNow);
  return base;
};

// { dayOffset } is resolved to an actual journeyDate at seed time so the
// sample data always looks "current" no matter when this script runs.
const rawBuses = [
  // ── Dhaka → Rajshahi ──────────────────────────────────────────
  { operator: 'Green Line Paribahan', busNumber: 'GL-101', coachType: 'AC', source: 'Dhaka', destination: 'Rajshahi', dayOffset: 0, departureTime: '06:30', arrivalTime: '12:00', duration: '5h 30m', fare: 850, totalSeats: 36 },
  { operator: 'Shohagh Paribahan', busNumber: 'SH-204', coachType: 'Non-AC', source: 'Dhaka', destination: 'Rajshahi', dayOffset: 0, departureTime: '10:00', arrivalTime: '15:30', duration: '5h 30m', fare: 650, totalSeats: 40 },
  { operator: 'Ena Transport', busNumber: 'EN-318', coachType: 'Non-AC', source: 'Dhaka', destination: 'Rajshahi', dayOffset: 0, departureTime: '21:45', arrivalTime: '03:15', duration: '5h 30m', fare: 600, totalSeats: 40 },
  { operator: 'Green Line Paribahan', busNumber: 'GL-102', coachType: 'AC', source: 'Dhaka', destination: 'Rajshahi', dayOffset: 1, departureTime: '07:15', arrivalTime: '12:45', duration: '5h 30m', fare: 880, totalSeats: 36 },
  { operator: 'Shohagh Paribahan', busNumber: 'SH-205', coachType: 'Non-AC', source: 'Dhaka', destination: 'Rajshahi', dayOffset: 2, departureTime: '09:00', arrivalTime: '14:30', duration: '5h 30m', fare: 650, totalSeats: 40 },

  // ── Dhaka → Chittagong ────────────────────────────────────────
  { operator: 'Hanif Enterprise', busNumber: 'HN-410', coachType: 'AC', source: 'Dhaka', destination: 'Chittagong', dayOffset: 0, departureTime: '08:15', arrivalTime: '13:00', duration: '4h 45m', fare: 950, totalSeats: 32 },
  { operator: 'Soudia Coach', busNumber: 'SD-512', coachType: 'AC', source: 'Dhaka', destination: 'Chittagong', dayOffset: 0, departureTime: '13:30', arrivalTime: '18:15', duration: '4h 45m', fare: 900, totalSeats: 32 },
  { operator: 'Shyamoli Paribahan', busNumber: 'SY-620', coachType: 'Non-AC', source: 'Dhaka', destination: 'Chittagong', dayOffset: 1, departureTime: '11:00', arrivalTime: '15:45', duration: '4h 45m', fare: 750, totalSeats: 40 },
  { operator: 'Hanif Enterprise', busNumber: 'HN-411', coachType: 'AC', source: 'Dhaka', destination: 'Chittagong', dayOffset: 2, departureTime: '06:00', arrivalTime: '10:45', duration: '4h 45m', fare: 950, totalSeats: 32 },

  // ── Dhaka → Sylhet ────────────────────────────────────────────
  { operator: 'Desh Travels', busNumber: 'DT-701', coachType: 'AC', source: 'Dhaka', destination: 'Sylhet', dayOffset: 0, departureTime: '14:30', arrivalTime: '19:45', duration: '5h 15m', fare: 900, totalSeats: 32 },
  { operator: 'Shohagh Paribahan', busNumber: 'SH-206', coachType: 'Non-AC', source: 'Dhaka', destination: 'Sylhet', dayOffset: 1, departureTime: '08:30', arrivalTime: '13:45', duration: '5h 15m', fare: 700, totalSeats: 40 },
  { operator: 'Ena Transport', busNumber: 'EN-319', coachType: 'AC', source: 'Dhaka', destination: 'Sylhet', dayOffset: 3, departureTime: '22:00', arrivalTime: '03:15', duration: '5h 15m', fare: 920, totalSeats: 32 },

  // ── Dhaka → Khulna ────────────────────────────────────────────
  { operator: 'Sundarban Express', busNumber: 'SB-801', coachType: 'AC', source: 'Dhaka', destination: 'Khulna', dayOffset: 0, departureTime: '09:45', arrivalTime: '15:00', duration: '5h 15m', fare: 870, totalSeats: 32 },
  { operator: 'Eagle Paribahan', busNumber: 'EG-902', coachType: 'Non-AC', source: 'Dhaka', destination: 'Khulna', dayOffset: 1, departureTime: '12:15', arrivalTime: '17:30', duration: '5h 15m', fare: 620, totalSeats: 40 },

  // ── Dhaka → Barisal ───────────────────────────────────────────
  { operator: 'Sakura Paribahan', busNumber: 'SK-150', coachType: 'Non-AC', source: 'Dhaka', destination: 'Barisal', dayOffset: 0, departureTime: '16:00', arrivalTime: '20:30', duration: '4h 30m', fare: 550, totalSeats: 40 },
  { operator: 'Green Line Paribahan', busNumber: 'GL-160', coachType: 'AC', source: 'Dhaka', destination: 'Barisal', dayOffset: 2, departureTime: '10:30', arrivalTime: '15:00', duration: '4h 30m', fare: 800, totalSeats: 36 },

  // ── Return legs ───────────────────────────────────────────────
  { operator: 'Green Line Paribahan', busNumber: 'GL-201', coachType: 'AC', source: 'Rajshahi', destination: 'Dhaka', dayOffset: 0, departureTime: '07:00', arrivalTime: '12:30', duration: '5h 30m', fare: 850, totalSeats: 36 },
  { operator: 'Hanif Enterprise', busNumber: 'HN-420', coachType: 'AC', source: 'Chittagong', destination: 'Dhaka', dayOffset: 0, departureTime: '15:00', arrivalTime: '19:45', duration: '4h 45m', fare: 950, totalSeats: 32 },
  { operator: 'Desh Travels', busNumber: 'DT-710', coachType: 'AC', source: 'Sylhet', destination: 'Dhaka', dayOffset: 1, departureTime: '06:30', arrivalTime: '11:45', duration: '5h 15m', fare: 900, totalSeats: 32 },
];

const sampleBuses = rawBuses.map(({ dayOffset, ...bus }) => ({
  ...bus,
  journeyDate: dateInDays(dayOffset),
  availableSeats: bus.totalSeats - Math.floor(Math.random() * (bus.totalSeats * 0.4)),
  status: 'scheduled',
}));

const run = async () => {
  try {
    await connectDB();

    const existingCount = await Bus.countDocuments();
    const force = process.argv.includes('--force');

    if (existingCount > 0 && !force) {
      console.log(`ℹ️  Buses collection already has ${existingCount} document(s). Skipping seed.`);
      console.log('   Run "npm run seed -- --force" to wipe and reseed.');
      process.exit(0);
    }

    if (existingCount > 0 && force) {
      await Bus.deleteMany({});
      console.log('🗑️  Cleared existing buses.');
    }

    const created = await Bus.insertMany(sampleBuses);
    console.log(`✅ Seeded ${created.length} sample buses.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

run();