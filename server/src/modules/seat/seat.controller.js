// ============================================================
// Seat Controller
// HTTP layer for seat locking and management endpoints.
// Delegates to seat.service.js for all business logic.
// ============================================================

import * as seatService from './seat.service.js';

// ── LOCK SEAT(S) ───────────────────────────────────────────

/**
 * POST /api/v1/seats/lock
 * Body: { seatIds, trainId, journeyDate }
 */
export const lockSeats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await seatService.lockSeats({
      ...req.body,
      userId,
    });

    res.status(200).json({
      success: true,
      message: 'Seat(s) locked successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ── UNLOCK SEAT ────────────────────────────────────────────

/**
 * DELETE /api/v1/seats/lock/:lockId
 */
export const unlockSeat = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { lockId } = req.params;

    const result = await seatService.unlockSeat(lockId, userId);

    res.status(200).json({
      success: true,
      message: 'Seat lock released',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET USER'S ACTIVE LOCKS ────────────────────────────────

/**
 * GET /api/v1/seats/locks?trainId=...&journeyDate=...
 */
export const getUserLocks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { trainId, journeyDate } = req.query;

    const locks = await seatService.getUserLocks(userId, trainId, journeyDate);

    res.status(200).json({
      success: true,
      data: { locks },
    });
  } catch (error) {
    next(error);
  }
};
