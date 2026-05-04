// A simple custom error class that carries an HTTP status code alongside the message.
// Controllers throw this instead of a plain Error so the error handler knows what status to send back.
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
