// ============================================================
// Coach Engine Seed Script
// Seeds layout templates and sample coach types for the
// Coach Engine. Run after migration:
//
//   node prisma/seeds/coach-engine-seed.js
//
// Safe to run multiple times — uses upsert.
// ============================================================

import { PrismaClient } from '@prisma/client';
import { LAYOUT_CONFIGS, generateSeatDefinitions } from '../../src/modules/coach/layoutConfigs.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🚂 Seeding Coach Engine data...\n');

  // ── 1. Seed Layout Templates ──────────────────────────────
  console.log('📐 Seeding Layout Templates...');

  for (const [layoutType, config] of Object.entries(LAYOUT_CONFIGS)) {
    const seatDefs = generateSeatDefinitions(layoutType);

    const template = await prisma.layoutTemplate.upsert({
      where: { layoutType },
      update: {
        name: config.name,
        totalRows: config.totalRows || config.totalBays || config.totalCabins * 2,
        totalColumns: config.totalColumns,
        totalSeats: seatDefs.length,
        seatDefinitions: {
          layoutType,
          config: {
            isBayBased: config.isBayBased || false,
            isCabinBased: config.isCabinBased || false,
            aisleColumns: config.aisleColumns,
            legend: config.legend,
          },
          seats: seatDefs,
        },
      },
      create: {
        layoutType,
        name: config.name,
        totalRows: config.totalRows || config.totalBays || config.totalCabins * 2,
        totalColumns: config.totalColumns,
        totalSeats: seatDefs.length,
        seatDefinitions: {
          layoutType,
          config: {
            isBayBased: config.isBayBased || false,
            isCabinBased: config.isCabinBased || false,
            aisleColumns: config.aisleColumns,
            legend: config.legend,
          },
          seats: seatDefs,
        },
      },
    });

    console.log(`  ✅ ${layoutType} → ${template.name} (${template.totalSeats} seats)`);
  }

  // ── 2. Seed Coach Types ───────────────────────────────────
  console.log('\n🚃 Seeding Coach Types...');

  // Fetch layout template IDs
  const templates = await prisma.layoutTemplate.findMany();
  const templateMap = {};
  for (const t of templates) {
    templateMap[t.layoutType] = t.id;
  }

  const coachTypes = [
    {
      code: 'EC',
      name: 'Executive Chair Car',
      coachClass: 'EC',
      technology: 'VANDE_BHARAT',
      layoutType: 'CHAIR_2_2',
      seatsPerCoach: 56,
      hasAC: true,
      berthTiers: 0,
      baseFarePerKm: 3.50,
    },
    {
      code: 'CC',
      name: 'Chair Car',
      coachClass: 'CC',
      technology: 'LHB',
      layoutType: 'CHAIR_2_3',
      seatsPerCoach: 78,
      hasAC: true,
      berthTiers: 0,
      baseFarePerKm: 2.50,
    },
    {
      code: 'SL',
      name: 'Sleeper',
      coachClass: 'SL',
      technology: 'LHB',
      layoutType: 'SLEEPER_3_TIER',
      seatsPerCoach: 72,
      hasAC: false,
      berthTiers: 3,
      baseFarePerKm: 0.60,
    },
    {
      code: '3A',
      name: 'Third AC',
      coachClass: 'AC3',
      technology: 'LHB',
      layoutType: 'AC_3_TIER',
      seatsPerCoach: 72,
      hasAC: true,
      berthTiers: 3,
      baseFarePerKm: 1.40,
    },
    {
      code: '2A',
      name: 'Second AC',
      coachClass: 'AC2',
      technology: 'LHB',
      layoutType: 'AC_2_TIER',
      seatsPerCoach: 48,
      hasAC: true,
      berthTiers: 2,
      baseFarePerKm: 2.20,
    },
    {
      code: '1A',
      name: 'First AC',
      coachClass: 'AC1',
      technology: 'LHB',
      layoutType: 'FIRST_AC',
      seatsPerCoach: 24,
      hasAC: true,
      berthTiers: 2,
      baseFarePerKm: 4.00,
    },
    // Vande Bharat specific
    {
      code: 'CC-VB',
      name: 'Chair Car (Vande Bharat)',
      coachClass: 'CC',
      technology: 'VANDE_BHARAT',
      layoutType: 'CHAIR_2_3',
      seatsPerCoach: 78,
      hasAC: true,
      berthTiers: 0,
      baseFarePerKm: 2.80,
    },
    // ICF variants
    {
      code: 'SL-ICF',
      name: 'Sleeper (ICF)',
      coachClass: 'SL',
      technology: 'ICF',
      layoutType: 'SLEEPER_3_TIER',
      seatsPerCoach: 72,
      hasAC: false,
      berthTiers: 3,
      baseFarePerKm: 0.50,
    },
  ];

  for (const ct of coachTypes) {
    const templateId = templateMap[ct.layoutType] || null;

    await prisma.coachType.upsert({
      where: { code: ct.code },
      update: {
        name: ct.name,
        coachClass: ct.coachClass,
        technology: ct.technology,
        layoutType: ct.layoutType,
        layoutTemplateId: templateId,
        seatsPerCoach: ct.seatsPerCoach,
        hasAC: ct.hasAC,
        berthTiers: ct.berthTiers,
        baseFarePerKm: ct.baseFarePerKm,
      },
      create: {
        code: ct.code,
        name: ct.name,
        coachClass: ct.coachClass,
        technology: ct.technology,
        layoutType: ct.layoutType,
        layoutTemplateId: templateId,
        seatsPerCoach: ct.seatsPerCoach,
        hasAC: ct.hasAC,
        berthTiers: ct.berthTiers,
        baseFarePerKm: ct.baseFarePerKm,
      },
    });

    console.log(`  ✅ ${ct.code} → ${ct.name} (${ct.technology}, ${ct.layoutType})`);
  }

  console.log('\n✨ Coach Engine seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
