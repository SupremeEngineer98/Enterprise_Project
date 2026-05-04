// Global error handler — sits at the end of the middleware chain.
// Any time a controller calls next(error), Express routes the error here.
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  // Don't flood test output with stack traces — only log in non-test environments
  if (process.env.NODE_ENV !== "test") {
    console.error(err);
  }

  res.status(statusCode).json({ message });
}
