import { ApiError } from './ApiError.js';

const UNIQUE_VIOLATION = '23505';

// Use in a catch block. Two requests can pass the "does it exist?" check at the same
// moment, so the database's unique constraint is the final guard. Turns that failure
// into a clear 409 and rethrows anything else untouched.
export const throwConflictOnDuplicate = (error, message) => {
  throw error.code === UNIQUE_VIOLATION ? ApiError.conflict(message) : error;
};
