// ============================================================
// Password Hashing Helper
// Wraps bcrypt for password hashing and comparison.
// Uses 12 salt rounds (strong security without excessive latency).
// ============================================================

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a plaintext password.
 *
 * @param {string} plainPassword - The raw password to hash.
 * @returns {Promise<string>} The bcrypt hash.
 */
export const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

/**
 * Compare a plaintext password against a bcrypt hash.
 *
 * @param {string} plainPassword  - The raw password to verify.
 * @param {string} hashedPassword - The stored bcrypt hash.
 * @returns {Promise<boolean>} True if the password matches.
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
