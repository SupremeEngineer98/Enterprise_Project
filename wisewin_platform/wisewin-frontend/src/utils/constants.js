// Shared constants used throughout the frontend.
// Using these instead of raw strings prevents typos and makes it easier to rename things later.

// The three user roles in the system
export const ROLES = {
  ADMIN: "Administrator",
  SUPER_USER: "Super user",
  USER: "User",
};

// Possible states a quiz attempt can be in
export const ATTEMPT_STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  ABANDONED: "ABANDONED",
};
