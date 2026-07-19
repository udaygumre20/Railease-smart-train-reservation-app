// ============================================================
// Seat Recommendation Engine
// Smart seat selection based on passenger preferences.
// Scores candidate seat groups against a weighted preference
// matrix and returns the top recommendations.
//
// Supports: WINDOW, LOWER_BERTH, TOGETHER, NEAR_EXIT,
//           NEAR_WASHROOM, SENIOR_CITIZEN, ACCESSIBLE
// ============================================================

import { getLayoutConfig } from './layoutConfigs.js';

/**
 * Preference weights for scoring.
 * Higher weight = more influential in the final score.
 */
const PREFERENCE_WEIGHTS = {
  WINDOW: 20,
  LOWER_BERTH: 20,
  TOGETHER: 25,
  NEAR_EXIT: 10,
  NEAR_WASHROOM: 10,
  SENIOR_CITIZEN: 15,
  ACCESSIBLE: 30,
};

/**
 * Generate smart seat recommendations.
 *
 * @param {object} params
 * @param {string} params.layoutType       - LayoutType enum
 * @param {object[]} params.availableSeats - Seats with status=AVAILABLE
 * @param {number} params.passengerCount   - Number of seats needed
 * @param {string[]} params.preferences    - Array of preference keys
 * @param {number} [params.maxResults=3]   - Max recommendations to return
 * @returns {{ recommendations: object[] }}
 */
export const recommendSeats = ({
  layoutType,
  availableSeats,
  passengerCount,
  preferences = [],
  maxResults = 3,
}) => {
  const config = getLayoutConfig(layoutType);

  // 1. Apply mandatory filters
  let candidates = [...availableSeats];

  if (preferences.includes('ACCESSIBLE')) {
    candidates = candidates.filter((s) => s.isAccessible);
  }

  if (candidates.length < passengerCount) {
    return { recommendations: [], message: 'Insufficient seats matching mandatory criteria' };
  }

  // 2. Generate candidate groups
  const groups = generateCandidateGroups(candidates, passengerCount, preferences, config);

  // 3. Score each group
  const scored = groups.map((group) => ({
    seats: group,
    score: scoreGroup(group, preferences, config),
    reason: buildReason(group, preferences),
  }));

  // 4. Sort by score descending, take top N
  scored.sort((a, b) => b.score - a.score);

  const recommendations = scored.slice(0, maxResults).map((r) => ({
    score: r.score,
    reason: r.reason,
    seats: r.seats.map((s) => ({
      seatId: s.id,
      seatNumber: s.seatNumber,
      seatLabel: s.seatLabel || `${s.seatNumber}`,
      seatType: s.seatType,
      position: s.position,
      rowNumber: s.rowNumber,
      cabin: s.cabin,
      isAccessible: s.isAccessible,
      reservedFor: s.reservedFor,
    })),
  }));

  return { recommendations };
};

/**
 * Generate candidate seat groups.
 * For TOGETHER preference, finds adjacent seats in the same row/bay.
 * Otherwise, generates single-seat permutations.
 *
 * @param {object[]} seats
 * @param {number} count
 * @param {string[]} preferences
 * @param {object} config
 * @returns {object[][]}
 */
const generateCandidateGroups = (seats, count, preferences, config) => {
  if (count === 1) {
    return seats.map((s) => [s]);
  }

  const wantTogether = preferences.includes('TOGETHER');
  const groups = [];

  if (wantTogether) {
    // Group seats by row (or bay for bay-based layouts)
    const rowMap = new Map();
    for (const seat of seats) {
      const key = seat.rowNumber || 0;
      if (!rowMap.has(key)) rowMap.set(key, []);
      rowMap.get(key).push(seat);
    }

    // Find rows that have enough adjacent seats
    for (const [, rowSeats] of rowMap) {
      if (rowSeats.length < count) continue;

      // Sort by column to find adjacency
      const sorted = rowSeats.sort((a, b) => (a.columnNumber || 0) - (b.columnNumber || 0));

      // Sliding window to find adjacent groups
      for (let i = 0; i <= sorted.length - count; i++) {
        const group = sorted.slice(i, i + count);

        // Verify adjacency (columns should be consecutive, ignoring aisles)
        const cols = group.map((s) => s.columnNumber || 0);
        const maxGap = Math.max(...cols) - Math.min(...cols);

        // Allow a gap of count + 1 (to account for aisle columns)
        if (maxGap <= count + 1) {
          groups.push(group);
        }
      }
    }
  }

  // If no TOGETHER groups found or not requested, generate combinations
  if (groups.length === 0) {
    // Simple greedy: sort by individual score, take top groups
    const sortedByPreference = seats.sort((a, b) => {
      return scoreSeat(b, preferences, config) - scoreSeat(a, preferences, config);
    });

    // Take overlapping windows of `count` seats as separate candidate groups
    const step = Math.max(1, Math.floor(count / 2));
    for (let i = 0; i <= sortedByPreference.length - count; i += step) {
      groups.push(sortedByPreference.slice(i, i + count));
      if (groups.length >= 10) break; // Cap candidate generation
    }
  }

  return groups;
};

/**
 * Score a group of seats against preferences.
 *
 * @param {object[]} group
 * @param {string[]} preferences
 * @param {object} config
 * @returns {number} Score (0-100)
 */
const scoreGroup = (group, preferences, config) => {
  if (preferences.length === 0) return 50; // Default neutral score

  let totalWeight = 0;
  let earnedWeight = 0;

  for (const pref of preferences) {
    const weight = PREFERENCE_WEIGHTS[pref] || 0;
    totalWeight += weight;

    switch (pref) {
      case 'WINDOW':
        earnedWeight += weight * (group.filter((s) => s.position === 'WINDOW').length / group.length);
        break;

      case 'LOWER_BERTH':
        earnedWeight += weight * (group.filter((s) => s.seatType === 'LOWER').length / group.length);
        break;

      case 'TOGETHER': {
        // Check if all seats share the same row
        const rows = new Set(group.map((s) => s.rowNumber));
        earnedWeight += rows.size === 1 ? weight : weight * 0.3;
        break;
      }

      case 'NEAR_EXIT': {
        const totalRows = config.totalRows || config.totalBays || 10;
        const exitRows = group.filter(
          (s) => (s.rowNumber || 0) <= 2 || (s.rowNumber || 0) >= totalRows - 1
        );
        earnedWeight += weight * (exitRows.length / group.length);
        break;
      }

      case 'NEAR_WASHROOM': {
        const maxRow = config.totalRows || config.totalBays || 10;
        const washroomSeats = group.filter(
          (s) => (s.rowNumber || 0) >= maxRow - 1
        );
        earnedWeight += weight * (washroomSeats.length / group.length);
        break;
      }

      case 'SENIOR_CITIZEN':
        earnedWeight += weight * (group.filter(
          (s) => s.seatType === 'LOWER' || s.reservedFor === 'SENIOR_RESERVED'
        ).length / group.length);
        break;

      case 'ACCESSIBLE':
        earnedWeight += weight * (group.filter((s) => s.isAccessible).length / group.length);
        break;

      default:
        break;
    }
  }

  // Normalize to 0-100
  return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 50;
};

/**
 * Score a single seat (used for sorting in non-TOGETHER mode).
 *
 * @param {object} seat
 * @param {string[]} preferences
 * @param {object} config
 * @returns {number}
 */
const scoreSeat = (seat, preferences, config) => {
  return scoreGroup([seat], preferences, config);
};

/**
 * Build a human-readable reason string for a recommendation.
 *
 * @param {object[]} group
 * @param {string[]} preferences
 * @returns {string}
 */
const buildReason = (group, preferences) => {
  const parts = [];

  if (preferences.includes('TOGETHER')) {
    const rows = new Set(group.map((s) => s.rowNumber));
    if (rows.size === 1) {
      parts.push(`${group.length} seats together in row ${[...rows][0]}`);
    } else {
      parts.push(`${group.length} seats across ${rows.size} rows`);
    }
  }

  if (preferences.includes('WINDOW')) {
    const windowCount = group.filter((s) => s.position === 'WINDOW').length;
    if (windowCount > 0) parts.push(`${windowCount} window seat${windowCount > 1 ? 's' : ''}`);
  }

  if (preferences.includes('LOWER_BERTH')) {
    const lowerCount = group.filter((s) => s.seatType === 'LOWER').length;
    if (lowerCount > 0) parts.push(`${lowerCount} lower berth${lowerCount > 1 ? 's' : ''}`);
  }

  if (preferences.includes('ACCESSIBLE')) {
    const accCount = group.filter((s) => s.isAccessible).length;
    if (accCount > 0) parts.push(`${accCount} accessible seat${accCount > 1 ? 's' : ''}`);
  }

  if (preferences.includes('SENIOR_CITIZEN')) {
    const srCount = group.filter(
      (s) => s.seatType === 'LOWER' || s.reservedFor === 'SENIOR_RESERVED'
    ).length;
    if (srCount > 0) parts.push(`${srCount} senior-friendly seat${srCount > 1 ? 's' : ''}`);
  }

  return parts.length > 0 ? parts.join(', ') : 'Best available seats';
};
