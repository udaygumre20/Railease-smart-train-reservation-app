
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000/api/v1';

async function testAPIs() {
  console.log('🧪 Starting API Tests...\n');

  // 1. Health Check
  const healthRes = await fetch(`${API_URL}/health`);
  const health = await healthRes.json();
  console.log('Health Check:', health.success ? '✅ PASSED' : '❌ FAILED');

  // 2. Fetch a train and coach to test public endpoints
  const train = await prisma.train.findFirst({
    include: { coaches: true }
  });

  if (!train || train.coaches.length === 0) {
    console.log('⚠️ No trains or coaches found in DB. Cannot test coach endpoints fully.');
    return;
  }

  const coach = train.coaches[0];

  // 3. Test GET Coaches by Train
  const coachesRes = await fetch(`${API_URL}/trains/${train.id}/coaches`);
  const coachesData = await coachesRes.json();
  console.log('GET Coaches by Train:', coachesData.success ? '✅ PASSED' : '❌ FAILED');

  // 4. Test GET Coach Details
  const detailsRes = await fetch(`${API_URL}/coaches/${coach.id}`);
  const detailsData = await detailsRes.json();
  console.log('GET Coach Details:', detailsData.success ? '✅ PASSED' : '❌ FAILED');

  // 5. Test GET Seat Map
  const seatMapRes = await fetch(`${API_URL}/coaches/${coach.id}/seat-map`);
  const seatMapData = await seatMapRes.json();
  console.log('GET Seat Map:', seatMapData.success ? '✅ PASSED' : '❌ FAILED');

  console.log('\n✨ API Testing completed.');
  process.exit(0);
}

testAPIs().catch(err => {
  console.error('Error during testing:', err);
  process.exit(1);
});
