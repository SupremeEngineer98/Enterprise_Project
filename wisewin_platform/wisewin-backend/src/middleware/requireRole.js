// A middleware factory that restricts access to certain roles.
// Usage: requireRole("Administrator", "Super user") — pass any number of allowed roles.
// Works together with authMiddleware which must run first to populate req.user.
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    // If authMiddleware didn't run or failed, req.user won't exist
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check whether the logged-in user's role is in the allowed list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}
