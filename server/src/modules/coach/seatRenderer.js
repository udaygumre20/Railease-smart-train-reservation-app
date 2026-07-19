// ============================================================
// Seat Renderer
// Universal seat matrix generator. Takes a layoutType and
// raw seat data, produces a structured 2D grid suitable for
// frontend rendering. No train-specific UI is hardcoded.
//
// Usage: renderSeatMap(layoutType, seatData)
// ============================================================

import { getLayoutConfig } from './layoutConfigs.js';

/**
 * Render a seat map for a coach.
 *
 * The renderer reads the layout config and maps DB seat records
 * into a 2D grid with aisle gaps represented as `null` cells.
 * Each seat cell carries its real-time availability status.
 *
 * @param {string} layoutType   - LayoutType enum value
 * @param {object[]} seatData   - Array of Seat records (with optional availability joined)
 * @param {object} [options]
 * @param {string} [options.trainId]      - Train ID for filtering availability
 * @param {string} [options.journeyDate]  - Journey date for filtering availability
 * @returns {{ grid: Array<{ rowNumber: number, seats: Array<object|null> }>, metadata: object }}
 */
export const renderSeatMap = (layoutType, seatData, options = {}) => {
  const config = getLayoutConfig(layoutType);

  // Build a lookup map: `${rowNumber}-${columnNumber}` → seat
  const seatLookup = new Map();
  for (const seat of seatData) {
    if (seat.rowNumber != null && seat.columnNumber != null) {
      const key = `${seat.rowNumber}-${seat.columnNumber}`;
      // For bay-based layouts where SL/SU share a column, store as array
      if (seatLookup.has(key)) {
        const existing = seatLookup.get(key);
        if (Array.isArray(existing)) {
          existing.push(seat);
        } else {
          seatLookup.set(key, [existing, seat]);
        }
      } else {
        seatLookup.set(key, seat);
      }
    }
  }

  const totalRows = config.isBayBased
    ? config.totalBays
    : config.isCabinBased
      ? config.totalCabins * 2 // 2 rows per cabin
      : config.totalRows;

  const grid = [];

  for (let row = 1; row <= totalRows; row++) {
    const rowSeats = [];

    for (let col = 1; col <= config.totalColumns; col++) {
      // Check if this column is an aisle gap
      if (config.aisleColumns.includes(col)) {
        rowSeats.push(null); // Aisle marker
        continue;
      }

      const key = `${row}-${col}`;
      const seatOrSeats = seatLookup.get(key);

      if (!seatOrSeats) {
        rowSeats.push(null); // Empty cell
        continue;
      }

      // Handle stacked berths (SL/SU in same column)
      const seatsArray = Array.isArray(seatOrSeats) ? seatOrSeats : [seatOrSeats];

      for (const seat of seatsArray) {
        rowSeats.push(formatSeatCell(seat, options));
      }
    }

    grid.push({
      rowNumber: row,
      bayNumber: config.isBayBased ? row : undefined,
      cabinNumber: config.isCabinBased ? Math.ceil(row / 2) : undefined,
      seats: rowSeats,
    });
  }

  return {
    grid,
    metadata: {
      layoutType,
      layoutName: config.name,
      totalRows,
      totalColumns: config.totalColumns,
      totalSeats: seatData.length,
      aisleColumns: config.aisleColumns,
      legend: config.legend,
    },
  };
};

/**
 * Format a single seat record into a renderable cell object.
 *
 * @param {object} seat - Seat record from DB
 * @param {object} options
 * @returns {object} Formatted seat cell
 */
const formatSeatCell = (seat, options = {}) => {
  // Determine status from SeatAvailability if available
  let status = 'AVAILABLE';

  if (seat.availability && seat.availability.length > 0) {
    // Find matching availability for the requested journey
    const match = seat.availability.find((a) => {
      const matchesTrain = !options.trainId || a.trainId === options.trainId;
      const matchesDate = !options.journeyDate || isSameDate(a.journeyDate, options.journeyDate);
      return matchesTrain && matchesDate;
    });
    if (match) {
      status = match.status;
    }
  } else if (!seat.isAvailable) {
    status = 'BOOKED';
  }

  return {
    seatId: seat.id,
    seatNumber: seat.seatNumber,
    seatLabel: seat.seatLabel || `${seat.seatNumber}`,
    seatType: seat.seatType,
    position: seat.position,
    rowNumber: seat.rowNumber,
    columnNumber: seat.columnNumber,
    status,
    reservedFor: seat.reservedFor || 'NONE',
    isAccessible: seat.isAccessible || false,
    cabin: seat.cabin,
    coupe: seat.coupe,
  };
};

/**
 * Check if two dates represent the same calendar day.
 *
 * @param {Date|string} date1
 * @param {Date|string} date2
 * @returns {boolean}
 */
const isSameDate = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};
