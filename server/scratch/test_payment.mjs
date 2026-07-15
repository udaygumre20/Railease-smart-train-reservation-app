import http from 'http';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const PORT = 5000;

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const log = (testName, expected, got, passed, detail = '') => {
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} Test: ${testName.padEnd(45)} | Expected: ${expected} | Got: ${got} | ${detail}`);
};

const runTests = async () => {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  RailEase — Payment Module — Test Suite');
  console.log('════════════════════════════════════════════════════════════\n');

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.log('⚠️  WARNING: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set in .env');
    console.log('⚠️  Some tests might fail due to Razorpay SDK validation.\n');
  }

  // Ensure test users exist
  let user1 = await prisma.user.findUnique({ where: { email: 'paymentuser@test.com' } });
  if (!user1) {
    user1 = await prisma.user.create({
      data: {
        email: 'paymentuser@test.com',
        password: 'hashed_password', // Mocked
        firstName: 'Payment',
        lastName: 'Tester',
        role: 'USER',
        isVerified: true
      }
    });
  }

  let user2 = await prisma.user.findUnique({ where: { email: 'paymenthacker@test.com' } });
  if (!user2) {
    user2 = await prisma.user.create({
      data: {
        email: 'paymenthacker@test.com',
        password: 'hashed_password',
        firstName: 'Hacker',
        lastName: 'User',
        role: 'USER',
        isVerified: true
      }
    });
  }

  // Get tokens
  let token1, token2;
  // We can just generate them manually if needed, or use the login API (we don't have the plain password).
  // I will just create the booking manually using Prisma and then test the payment API.
  // Wait, I need a valid JWT token to hit the endpoints!
  // Let's use the login API by creating a real user through register API.
  await prisma.user.deleteMany({ where: { email: { in: ['pay1@test.com', 'pay2@test.com'] } } }).catch(() => {});
  
  await request('POST', '/auth/register', {
    email: 'pay1@test.com',
    password: 'Password123!',
    firstName: 'Pay',
    lastName: 'One',
    phone: '9876543110'
  });
  
  await request('POST', '/auth/register', {
    email: 'pay2@test.com',
    password: 'Password123!',
    firstName: 'Pay',
    lastName: 'Two',
    phone: '9876543111'
  });

  const login1 = await request('POST', '/auth/login', { email: 'pay1@test.com', password: 'Password123!' });
  token1 = login1.body?.data?.accessToken;
  const user1Id = login1.body?.data?.user?.id;

  const login2 = await request('POST', '/auth/login', { email: 'pay2@test.com', password: 'Password123!' });
  token2 = login2.body?.data?.accessToken;

  // Create mock prerequisite records for a Booking
  const stationA = await prisma.station.upsert({ 
    where: { code: 'PYA' },
    update: {},
    create: { code: 'PYA', name: 'Pay A', city: 'City', state: 'State' } 
  });
  const stationB = await prisma.station.upsert({ 
    where: { code: 'PYB' },
    update: {},
    create: { code: 'PYB', name: 'Pay B', city: 'City', state: 'State' } 
  });
  
  const train = await prisma.train.upsert({ 
    where: { trainNumber: 'PAY123' },
    update: {},
    create: { trainNumber: 'PAY123', name: 'Pay Express' } 
  });

  // Create a PENDING booking directly in the DB
  const booking = await prisma.booking.create({
    data: {
      userId: user1Id,
      trainId: train.id,
      boardingStationId: stationA.id,
      alightingStationId: stationB.id,
      journeyDate: new Date(),
      totalPassengers: 2,
      totalFare: 500.00,
      status: 'PENDING',
      quota: 'GENERAL'
    }
  });

  let passedTests = 0;
  let totalTests = 0;
  let razorpayOrderId = null;

  // Test 1: Create Payment Order
  {
    totalTests++;
    const res = await request('POST', '/payments/create-order', { bookingId: booking.id }, token1);
    
    // Check if the endpoint responds correctly.
    // If Razorpay keys are invalid, Razorpay throws an error and our app returns a 500 (or similar).
    // Let's assume it passes or at least we get a response.
    const passed = res.status === 201 && res.body?.data?.razorpayOrderId;
    if (passed) {
      razorpayOrderId = res.body.data.razorpayOrderId;
      passedTests++;
    }
    log('Create Payment Order', 201, res.status, passed, passed ? `Order ID: ${razorpayOrderId}` : res.body?.message || JSON.stringify(res.body));
  }

  // Test 2: Unauthorized Booking Access (User 2 tries to create order for User 1's booking)
  {
    totalTests++;
    const res = await request('POST', '/payments/create-order', { bookingId: booking.id }, token2);
    const passed = res.status === 404;
    if (passed) passedTests++;
    log('Unauthorized Booking Access (Create)', 404, res.status, passed, res.body?.message);
  }

  // Generate a valid mock signature for verification
  const dummyPaymentId = 'pay_Test123456';
  const validSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${dummyPaymentId}`)
    .digest('hex');

  // Test 3: Invalid Signature Verification
  if (razorpayOrderId) {
    totalTests++;
    const res = await request('POST', '/payments/verify', {
      bookingId: booking.id,
      razorpayOrderId,
      razorpayPaymentId: dummyPaymentId,
      razorpaySignature: 'invalid_signature_string'
    }, token1);
    const passed = res.status === 400 || res.status === 422; // Validation or logic error
    if (passed) passedTests++;
    log('Invalid Signature Verification', '400/422', res.status, passed, res.body?.message);
  } else {
    console.log('Skipping verification tests due to failed order creation.');
  }

  // Test 4: Successful Payment Verification
  if (razorpayOrderId) {
    totalTests++;
    const res = await request('POST', '/payments/verify', {
      bookingId: booking.id,
      razorpayOrderId,
      razorpayPaymentId: dummyPaymentId,
      razorpaySignature: validSignature
    }, token1);
    const passed = res.status === 200 && res.body?.data?.payment?.status === 'SUCCESS';
    if (passed) passedTests++;
    log('Successful Payment Verification', 200, res.status, passed, res.body?.message);

    // Verify booking status was updated to CONFIRMED
    const updatedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
    if (updatedBooking.status === 'CONFIRMED') {
      console.log('  -> Booking status successfully updated to CONFIRMED');
    } else {
      console.log('  -> ERROR: Booking status was not updated to CONFIRMED');
    }
  }

  // Test 5: Duplicate Verification Prevention
  if (razorpayOrderId) {
    totalTests++;
    const res = await request('POST', '/payments/verify', {
      bookingId: booking.id,
      razorpayOrderId,
      razorpayPaymentId: dummyPaymentId,
      razorpaySignature: validSignature
    }, token1);
    const passed = res.status === 409;
    if (passed) passedTests++;
    log('Duplicate Verification Prevention', 409, res.status, passed, res.body?.message);
  }

  // Test 6: Get Payment Status
  {
    totalTests++;
    const res = await request('GET', `/payments/bookings/${booking.id}`, null, token1);
    const passed = res.status === 200 && res.body?.data?.payment;
    if (passed) passedTests++;
    log('Get Payment By Booking', 200, res.status, passed, `Status: ${res.body?.data?.payment?.status}`);
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  TEST SUMMARY');
  console.log('════════════════════════════════════════════════════════════\n');
  console.log(`  Passed: ${passedTests}/${totalTests}\n`);

  process.exit(passedTests === totalTests ? 0 : 1);
};

runTests();
