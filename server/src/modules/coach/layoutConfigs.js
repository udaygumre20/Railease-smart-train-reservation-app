// ============================================================
// Layout Configurations
// Structural blueprints for every reserved coach class used by
// Indian Railways. The SeatRenderer reads these configs to
// generate correct seat matrices without hardcoded UI logic.
//
// Adding a new coach type = adding an entry here + an enum.
// ============================================================

/**
 * @typedef {object} SeatDef
 * @property {number}  offset    - 1-based position within the bay
 * @property {string}  labelSuffix - Letter suffix for the seat label (A, B, C…)
 * @property {string}  type      - SeatType enum value
 * @property {string}  position  - SeatPosition enum value
 * @property {number}  row       - Row within the bay (1-based)
 * @property {number}  col       - Column (1-based, includes aisle gap)
 */

/**
 * Master layout configuration map.
 * Keys match the LayoutType Prisma enum exactly.
 */
export const LAYOUT_CONFIGS = {
  // ── Executive Chair Car (EC) — 2+2 seating ────────────────
  CHAIR_2_2: {
    name: 'Executive Chair Car',
    totalRows: 14,
    totalColumns: 5, // 2 seats + aisle + 2 seats
    aisleColumns: [3],
    seatsPerRow: 4,
    totalSeats: 56,
    legend: { W: 'Window', A: 'Aisle' },
    seatDefs: [
      { offset: 1, labelSuffix: 'A', type: 'WINDOW_SEAT',  position: 'WINDOW', row: 1, col: 1 },
      { offset: 2, labelSuffix: 'B', type: 'AISLE_SEAT',   position: 'AISLE',  row: 1, col: 2 },
      // col 3 = aisle
      { offset: 3, labelSuffix: 'C', type: 'AISLE_SEAT',   position: 'AISLE',  row: 1, col: 4 },
      { offset: 4, labelSuffix: 'D', type: 'WINDOW_SEAT',  position: 'WINDOW', row: 1, col: 5 },
    ],
  },

  // ── Chair Car (CC) — 2+3 seating ──────────────────────────
  CHAIR_2_3: {
    name: 'Chair Car',
    totalRows: 18,
    totalColumns: 6, // 2 seats + aisle + 3 seats
    aisleColumns: [3],
    seatsPerRow: 5,
    totalSeats: 78, // Vande Bharat: row 1 may have only 3 seats → adjusted at seed time
    legend: { W: 'Window', A: 'Aisle', M: 'Middle' },
    seatDefs: [
      { offset: 1, labelSuffix: 'A', type: 'WINDOW_SEAT',  position: 'WINDOW', row: 1, col: 1 },
      { offset: 2, labelSuffix: 'B', type: 'AISLE_SEAT',   position: 'AISLE',  row: 1, col: 2 },
      // col 3 = aisle
      { offset: 3, labelSuffix: 'C', type: 'AISLE_SEAT',   position: 'AISLE',  row: 1, col: 4 },
      { offset: 4, labelSuffix: 'D', type: 'MIDDLE_SEAT',  position: 'MIDDLE', row: 1, col: 5 },
      { offset: 5, labelSuffix: 'E', type: 'WINDOW_SEAT',  position: 'WINDOW', row: 1, col: 6 },
    ],
  },

  // ── Sleeper (SL) — 3-tier + side berths ───────────────────
  SLEEPER_3_TIER: {
    name: 'Sleeper',
    isBayBased: true,
    totalBays: 9,
    seatsPerBay: 8,
    totalRows: 9,
    totalColumns: 8, // 3(LB,MB,UB) + aisle + 3(LB,MB,UB) + 2(SL,SU)
    aisleColumns: [4],
    totalSeats: 72,
    legend: { LB: 'Lower Berth', MB: 'Middle Berth', UB: 'Upper Berth', SL: 'Side Lower', SU: 'Side Upper' },
    seatDefs: [
      { offset: 1, labelSuffix: 'LB', type: 'LOWER',      position: 'WINDOW', row: 1, col: 1 },
      { offset: 2, labelSuffix: 'MB', type: 'MIDDLE',     position: 'MIDDLE', row: 1, col: 2 },
      { offset: 3, labelSuffix: 'UB', type: 'UPPER',      position: 'WINDOW', row: 1, col: 3 },
      // col 4 = aisle
      { offset: 4, labelSuffix: 'LB', type: 'LOWER',      position: 'AISLE',  row: 1, col: 5 },
      { offset: 5, labelSuffix: 'MB', type: 'MIDDLE',     position: 'MIDDLE', row: 1, col: 6 },
      { offset: 6, labelSuffix: 'UB', type: 'UPPER',      position: 'AISLE',  row: 1, col: 7 },
      { offset: 7, labelSuffix: 'SL', type: 'SIDE_LOWER', position: 'WINDOW', row: 1, col: 8 },
      { offset: 8, labelSuffix: 'SU', type: 'SIDE_UPPER', position: 'WINDOW', row: 1, col: 8 },
    ],
  },

  // ── Third AC (3A) — 3-tier + side berths (AC equipped) ────
  AC_3_TIER: {
    name: 'Third AC',
    isBayBased: true,
    totalBays: 9,
    seatsPerBay: 8,
    totalRows: 9,
    totalColumns: 8,
    aisleColumns: [4],
    totalSeats: 72,
    legend: { LB: 'Lower Berth', MB: 'Middle Berth', UB: 'Upper Berth', SL: 'Side Lower', SU: 'Side Upper' },
    seatDefs: [
      { offset: 1, labelSuffix: 'LB', type: 'LOWER',      position: 'WINDOW', row: 1, col: 1 },
      { offset: 2, labelSuffix: 'MB', type: 'MIDDLE',     position: 'MIDDLE', row: 1, col: 2 },
      { offset: 3, labelSuffix: 'UB', type: 'UPPER',      position: 'WINDOW', row: 1, col: 3 },
      // col 4 = aisle
      { offset: 4, labelSuffix: 'LB', type: 'LOWER',      position: 'AISLE',  row: 1, col: 5 },
      { offset: 5, labelSuffix: 'MB', type: 'MIDDLE',     position: 'MIDDLE', row: 1, col: 6 },
      { offset: 6, labelSuffix: 'UB', type: 'UPPER',      position: 'AISLE',  row: 1, col: 7 },
      { offset: 7, labelSuffix: 'SL', type: 'SIDE_LOWER', position: 'WINDOW', row: 1, col: 8 },
      { offset: 8, labelSuffix: 'SU', type: 'SIDE_UPPER', position: 'WINDOW', row: 1, col: 8 },
    ],
  },

  // ── Second AC (2A) — 2-tier + side berths ─────────────────
  AC_2_TIER: {
    name: 'Second AC',
    isBayBased: true,
    totalBays: 8,
    seatsPerBay: 6,
    totalRows: 8,
    totalColumns: 6, // 2(LB,UB) + aisle + 2(LB,UB) + 2(SL,SU)
    aisleColumns: [3],
    totalSeats: 48,
    legend: { LB: 'Lower Berth', UB: 'Upper Berth', SL: 'Side Lower', SU: 'Side Upper' },
    seatDefs: [
      { offset: 1, labelSuffix: 'LB', type: 'LOWER', position: 'WINDOW', row: 1, col: 1 },
      { offset: 2, labelSuffix: 'UB', type: 'UPPER', position: 'WINDOW', row: 1, col: 2 },
      // col 3 = aisle
      { offset: 3, labelSuffix: 'LB', type: 'LOWER', position: 'AISLE',  row: 1, col: 4 },
      { offset: 4, labelSuffix: 'UB', type: 'UPPER', position: 'AISLE',  row: 1, col: 5 },
      { offset: 5, labelSuffix: 'SL', type: 'SIDE_LOWER', position: 'WINDOW', row: 1, col: 6 },
      { offset: 6, labelSuffix: 'SU', type: 'SIDE_UPPER', position: 'WINDOW', row: 1, col: 6 },
    ],
  },

  // ── First AC (1A) — Cabin/Coupe ───────────────────────────
  FIRST_AC: {
    name: 'First AC',
    isCabinBased: true,
    totalCabins: 6,
    seatsPerCabin: 4, // 2 lower + 2 upper in a 4-berth cabin
    seatsPerCoupe: 2, // 1 lower + 1 upper in a 2-berth coupe
    totalRows: 6,
    totalColumns: 4,
    aisleColumns: [],
    totalSeats: 24, // 6 cabins × 4 berths (can vary)
    legend: { LB: 'Lower Berth', UB: 'Upper Berth', CB: 'Cabin', CP: 'Coupe' },
    seatDefs: [
      { offset: 1, labelSuffix: 'LB', type: 'CABIN_BERTH', position: 'WINDOW', row: 1, col: 1, cabin: 1 },
      { offset: 2, labelSuffix: 'UB', type: 'CABIN_BERTH', position: 'WINDOW', row: 1, col: 2, cabin: 1 },
      { offset: 3, labelSuffix: 'LB', type: 'CABIN_BERTH', position: 'WINDOW', row: 2, col: 1, cabin: 1 },
      { offset: 4, labelSuffix: 'UB', type: 'CABIN_BERTH', position: 'WINDOW', row: 2, col: 2, cabin: 1 },
    ],
  },
};

/**
 * Get layout config by LayoutType enum value.
 *
 * @param {string} layoutType - LayoutType enum value
 * @returns {object} Layout configuration
 * @throws {Error} If layout type is unknown
 */
export const getLayoutConfig = (layoutType) => {
  const config = LAYOUT_CONFIGS[layoutType];
  if (!config) {
    throw new Error(`Unknown layout type: ${layoutType}. Valid types: ${Object.keys(LAYOUT_CONFIGS).join(', ')}`);
  }
  return config;
};

/**
 * Generate seat definitions for a full coach based on layout config.
 * This is used during coach/seat seeding and admin coach creation.
 *
 * @param {string} layoutType - LayoutType enum value
 * @returns {object[]} Array of seat definition objects ready for DB insertion
 */
export const generateSeatDefinitions = (layoutType) => {
  const config = getLayoutConfig(layoutType);
  const seats = [];

  if (config.isBayBased) {
    // Bay-based layouts (SL, 3A, 2A): repeat seatDefs for each bay
    for (let bay = 0; bay < config.totalBays; bay++) {
      for (const def of config.seatDefs) {
        const seatNumber = bay * config.seatsPerBay + def.offset;
        seats.push({
          seatNumber,
          seatLabel: `${seatNumber}`,
          seatType: def.type,
          position: def.position,
          rowNumber: bay + 1,
          columnNumber: def.col,
          cabin: null,
          coupe: null,
          isAccessible: false,
          reservedFor: 'NONE',
        });
      }
    }
  } else if (config.isCabinBased) {
    // Cabin-based layout (1A): repeat seatDefs for each cabin
    for (let cab = 0; cab < config.totalCabins; cab++) {
      for (const def of config.seatDefs) {
        const seatNumber = cab * config.seatsPerCabin + def.offset;
        seats.push({
          seatNumber,
          seatLabel: `${seatNumber}`,
          seatType: def.type,
          position: def.position,
          rowNumber: def.row + (cab * 2), // 2 rows per cabin
          columnNumber: def.col,
          cabin: cab + 1,
          coupe: null,
          isAccessible: false,
          reservedFor: 'NONE',
        });
      }
    }
  } else {
    // Row-based layouts (EC, CC): repeat seatDefs for each row
    for (let row = 0; row < config.totalRows; row++) {
      for (const def of config.seatDefs) {
        const seatNumber = row * config.seatsPerRow + def.offset;
        seats.push({
          seatNumber,
          seatLabel: `${row + 1}${def.labelSuffix}`,
          seatType: def.type,
          position: def.position,
          rowNumber: row + 1,
          columnNumber: def.col,
          cabin: null,
          coupe: null,
          isAccessible: false,
          reservedFor: 'NONE',
        });
      }
    }
  }

  return seats;
};
