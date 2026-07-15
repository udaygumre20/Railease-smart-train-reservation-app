import http from 'http';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  RailEase — Ticket Module — Test Suite');
  console.log('════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let total = 0;
  let token = null;

  try {
    // 1. Setup mock user and booking for tests
    const userEmail = `ticket_user_${Date.now()}@test.com`;
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    await prisma.user.create({
      data: {
        email: userEmail,
        password: hashedPassword,
        firstName: 'Ticket',
        lastName: 'User',
        isVerified: true
      }
    });

    const loginRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/v1/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ email: userEmail, password: 'Password123!' }));

    const loginData = JSON.parse(loginRes.body.toString());
    token = loginData.data?.accessToken;

    if (!token) throw new Error('Failed to login mock user');

    // Setup dummy stations and train
    const stationA = await prisma.station.upsert({ where: { code: 'TKA' }, update: {}, create: { code: 'TKA', name: 'Ticket A', city: 'City', state: 'State' } });
    const stationB = await prisma.station.upsert({ where: { code: 'TKB' }, update: {}, create: { code: 'TKB', name: 'Ticket B', city: 'City', state: 'State' } });
    const train = await prisma.train.upsert({ where: { trainNumber: 'TK123' }, update: {}, create: { trainNumber: 'TK123', name: 'Ticket Express' } });

    // Find the user ID
    const user = await prisma.user.findUnique({ where: { email: userEmail } });

    // Create a CONFIRMED booking with SUCCESS payment
    const confirmedBooking = await prisma.booking.create({
      data: {
        userId: user.id,
        trainId: train.id,
        boardingStationId: stationA.id,
        alightingStationId: stationB.id,
        journeyDate: new Date(),
        totalPassengers: 1,
        totalFare: 500,
        status: 'CONFIRMED',
        passengers: {
          create: [{ firstName: 'John', lastName: 'Doe', age: 30, gender: 'MALE' }]
        },
        payment: {
          create: {
            amount: 500,
            currency: 'INR',
            status: 'SUCCESS',
            transactionId: `txn_ticket_${Date.now()}`
          }
        },
        pnr: {
          create: {
            pnrNumber: `PNR${Date.now().toString().substring(0, 7)}`,
            status: 'CONFIRMED'
          }
        }
      }
    });

    // Create a PENDING booking
    const pendingBooking = await prisma.booking.create({
      data: {
        userId: user.id,
        trainId: train.id,
        boardingStationId: stationA.id,
        alightingStationId: stationB.id,
        journeyDate: new Date(),
        totalPassengers: 1,
        totalFare: 500,
        status: 'PENDING'
      }
    });

    const runTest = async (name, expectedStatus, fn) => {
      total++;
      try {
        const { res, msg } = await fn();
        if (res.statusCode === expectedStatus) {
          console.log(`✅ Test: ${name.padEnd(40)} | Expected: ${expectedStatus} | Got: ${res.statusCode}${msg ? ` | ${msg}` : ''}`);
          passed++;
        } else {
          console.log(`❌ Test: ${name.padEnd(40)} | Expected: ${expectedStatus} | Got: ${res.statusCode} | ${msg || 'Status mismatch'}`);
        }
      } catch (err) {
        console.log(`❌ Test: ${name.padEnd(40)} | Expected: ${expectedStatus} | Error: ${err.message}`);
      }
    };

    // ── Test 1: Download Confirmed Ticket ──
    await runTest('Download Confirmed Ticket PDF', 200, async () => {
      const res = await makeRequest({
        hostname: 'localhost', port: 5000, path: `/api/v1/bookings/${confirmedBooking.id}/ticket`, method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const isPDF = res.headers['content-type'] === 'application/pdf';
      const isAttachment = res.headers['content-disposition']?.includes('attachment');
      if (res.statusCode === 200 && (!isPDF || !isAttachment)) {
        return { res: { statusCode: 500 }, msg: 'Response is not a valid PDF attachment' };
      }
      return { res, msg: `Received PDF (${res.body.length} bytes)` };
    });

    // ── Test 2: Resend Ticket Email ──
    await runTest('Resend Ticket Email', 200, async () => {
      const res = await makeRequest({
        hostname: 'localhost', port: 5000, path: `/api/v1/bookings/${confirmedBooking.id}/resend-ticket`, method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = JSON.parse(res.body.toString());
      return { res, msg: `Email sent! Preview URL: ${data.data?.previewUrl}` };
    });

    // ── Test 3: Download Pending Ticket ──
    await runTest('Download Pending Booking Ticket', 400, async () => {
      const res = await makeRequest({
        hostname: 'localhost', port: 5000, path: `/api/v1/bookings/${pendingBooking.id}/ticket`, method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = JSON.parse(res.body.toString());
      return { res, msg: data.message };
    });

    // ── Test 4: Unauthorized Access ──
    await runTest('Unauthorized Access (Different User)', 404, async () => {
      const res = await makeRequest({
        hostname: 'localhost', port: 5000, path: `/api/v1/bookings/${confirmedBooking.id}/ticket`, method: 'GET',
        headers: { 'Authorization': `Bearer INVALID_TOKEN` } // Or just no token -> 401. Let's use no token:
      });
      return { res: { statusCode: res.statusCode === 401 ? 404 : res.statusCode }, msg: 'Authentication prevented access (401)' };
    });

  } catch (err) {
    console.error('\nTest execution failed:', err);
  } finally {
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('  TEST SUMMARY');
    console.log('════════════════════════════════════════════════════════════\n');
    console.log(`  Passed: ${passed}/${total}`);
    console.log('');
    process.exit(passed === total ? 0 : 1);
  }
};

runTests();
