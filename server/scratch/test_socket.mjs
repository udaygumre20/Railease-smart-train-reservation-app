import http from 'http';
import { io as Client } from 'socket.io-client';

const BASE_URL = 'http://localhost:5000/api/v1';
const SOCKET_URL = 'http://localhost:5000';
const results = [];
let testNumber = 0;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function log(name, expected, actual, passed, detail = '') {
  testNumber++;
  const icon = passed ? '✅' : '❌';
  results.push({ testNumber, name, expected, actual, passed, detail });
  console.log(`${icon} Test ${testNumber}: ${name} | Expected: ${expected} | Got: ${actual}${detail ? ' | ' + detail : ''}`);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  let accessToken = null, userId = null;
  let trainId = null, station1Id = null, station2Id = null, routeId = null, scheduleId = null, coachTypeId = null;

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  RailEase — Socket.IO Real-time Module — Test Suite');
  console.log('════════════════════════════════════════════════════════════\n');

  console.log('── Setup: Creating Prerequisites ───────────────────────────\n');

  const ts = Date.now();
  const regRes = await request('POST', '/auth/register', {
    firstName: 'Socket', lastName: 'Tester',
    email: `sockettest${ts}@railease.com`,
    password: 'TestPass@123',
    phone: `9${String(ts).slice(-9)}`,
  });

  const loginRes = await request('POST', '/auth/login', {
    email: `sockettest${ts}@railease.com`,
    password: 'TestPass@123',
  });
  accessToken = loginRes.body?.data?.accessToken;
  userId = loginRes.body?.data?.user?.id;

  const { default: prisma } = await import('file:///C:/Users/ASUS/OneDrive/Desktop/RailEase/server/src/database/client.js');

  const train = await prisma.train.create({ data: { trainNumber: `S${String(ts).slice(-4)}`, name: 'Socket Express' } });
  trainId = train.id;

  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const s1 = await prisma.station.create({ data: { code: `SA${rand}`, name: 'Station A', city: 'City', state: 'State' } });
  station1Id = s1.id;
  const s2 = await prisma.station.create({ data: { code: `SB${rand}`, name: 'Station B', city: 'City', state: 'State' } });
  station2Id = s2.id;

  const route = await prisma.route.create({
    data: {
      name: 'Socket Route', code: `SRT-${ts}`, totalDistance: 100,
      stops: {
        create: [
          { stationId: station1Id, sequenceNumber: 1, distanceFromOrigin: 0, departureTime: '08:00', haltDuration: 0, dayOffset: 0 },
          { stationId: station2Id, sequenceNumber: 2, distanceFromOrigin: 100, arrivalTime: '10:00', departureTime: '10:15', haltDuration: 15, dayOffset: 0 },
        ]
      }
    }
  });
  routeId = route.id;

  const futureFrom = new Date(Date.now() - 86400000).toISOString();
  const futureTo = new Date(Date.now() + 8640000000).toISOString();
  const schedule = await prisma.trainRoute.create({
    data: {
      trainId, routeId, runDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
      effectiveFrom: futureFrom, effectiveTo: futureTo, isActive: true
    }
  });
  scheduleId = schedule.id;

  const coachType = await prisma.coachType.create({
    data: { code: `SL${rand}`, name: 'Sleeper Class', seatsPerCoach: 72, hasAC: false, berthTiers: 3, baseFarePerKm: 1.0 }
  });
  coachTypeId = coachType.id;

  await prisma.coach.create({
    data: { coachNumber: 'S1', trainId, coachTypeId, sequence: 1, totalSeats: 72 }
  });

  const today = new Date();
  today.setDate(today.getDate() + 2); // 2 days in future
  const journeyDate = today;

  // Create Booking
  const booking = await prisma.booking.create({
    data: {
      userId, trainId, boardingStationId: station1Id, alightingStationId: station2Id, journeyDate,
      totalPassengers: 2, totalFare: 200, status: 'PENDING', coachPreference: coachType.code
    }
  });

  // Create Payment Order
  const pRes = await request('POST', '/payments/create-order', { bookingId: booking.id }, accessToken);
  const razorpayOrderId = pRes.body?.data?.razorpayOrderId;

  console.log('  ✔ Prerequisites seeded successfully\n');

  console.log('── Socket.IO Tests ─────────────────────────────────────────\n');

  // Connect unauthorized socket
  let unauthorizedError = false;
  const unauthSocket = Client(SOCKET_URL, {
    auth: { token: 'invalid.token.here' },
    reconnection: false
  });
  unauthSocket.on('connect_error', (err) => { unauthorizedError = true; });
  await sleep(1000);
  log('Unauthorized Socket Connection', true, unauthorizedError, unauthorizedError === true, 'Socket should reject invalid tokens');

  // Connect authorized socket
  let socketConnected = false;
  const socket = Client(SOCKET_URL, {
    auth: { token: accessToken }
  });

  socket.on('connect', () => { socketConnected = true; });
  
  await sleep(1000);
  log('Authorized Socket Connection', true, socketConnected, socketConnected === true, 'Socket should connect with valid JWT');

  // Join Room
  socket.emit('join:schedule', { scheduleId });
  console.log('  Joined schedule room');

  // Listeners
  let bookingConfirmedEvent = null;
  let seatAvailabilityUpdatedEvent = null;
  let bookingCancelledEvent = null;

  socket.on('bookingConfirmed', (data) => { bookingConfirmedEvent = data; });
  socket.on('seatAvailabilityUpdated', (data) => { seatAvailabilityUpdatedEvent = data; });
  socket.on('bookingCancelled', (data) => { bookingCancelledEvent = data; });

  // Simulate Payment Verification -> triggers Booking Confirmed & Seat Availability Updated
  const crypto = await import('crypto');
  const paymentId = `pay_SocketTest${Date.now()}`;
  const signature = crypto.default.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${razorpayOrderId}|${paymentId}`)
    .digest('hex');

  const verifyRes = await request('POST', '/payments/verify', {
    bookingId: booking.id,
    razorpayOrderId,
    razorpayPaymentId: paymentId,
    razorpaySignature: signature
  }, accessToken);
  console.log('Verify Response:', verifyRes.status, verifyRes.body);

  await sleep(2000); // Wait for events

  const isConfirmedEventValid = bookingConfirmedEvent && bookingConfirmedEvent.bookingId === booking.id && bookingConfirmedEvent.status === 'CONFIRMED';
  log('Receive bookingConfirmed Event', true, !!bookingConfirmedEvent, !!bookingConfirmedEvent, 'User specific room receives event');

  const isSeatEventValid = seatAvailabilityUpdatedEvent && seatAvailabilityUpdatedEvent.scheduleId === scheduleId && seatAvailabilityUpdatedEvent.bookedSeats === 2;
  log('Receive seatAvailabilityUpdated on Payment', true, !!seatAvailabilityUpdatedEvent, !!seatAvailabilityUpdatedEvent, `Booked Seats: ${seatAvailabilityUpdatedEvent?.bookedSeats}`);

  // Cancel the booking -> triggers Booking Cancelled & Seat Availability Updated
  seatAvailabilityUpdatedEvent = null; // reset
  const cancelRes = await request('PATCH', `/bookings/${booking.id}/cancel`, null, accessToken);
  console.log('Cancel Response:', cancelRes.status, cancelRes.body);

  await sleep(2000); // Wait for events

  const isCancelledEventValid = bookingCancelledEvent && bookingCancelledEvent.bookingId === booking.id;
  log('Receive bookingCancelled Event', true, !!bookingCancelledEvent, !!bookingCancelledEvent, 'Schedule room receives cancellation broadcast');

  const isSeatCancelledEventValid = seatAvailabilityUpdatedEvent && seatAvailabilityUpdatedEvent.bookedSeats === 0;
  log('Receive seatAvailabilityUpdated on Cancel', true, !!seatAvailabilityUpdatedEvent, !!seatAvailabilityUpdatedEvent, `Booked Seats now: ${seatAvailabilityUpdatedEvent?.bookedSeats}`);

  // Leave room
  socket.emit('leave:schedule', { scheduleId });
  socket.disconnect();

  await prisma.$disconnect();

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  TEST SUMMARY');
  console.log('════════════════════════════════════════════════════════════\n');

  const passedCount = results.filter(r => r.passed).length;
  const total = results.length;
  console.log(`  Passed: ${passedCount}/${total}`);
}

run().catch(console.error);
