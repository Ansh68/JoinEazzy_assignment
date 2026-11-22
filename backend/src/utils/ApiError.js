export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest = (message = 'Bad request', errors) => new ApiError(400, message, errors);
  static unauthorized = (message = 'Unauthorized') => new ApiError(401, message);
  static forbidden = (message = 'Forbidden') => new ApiError(403, message);
  static notFound = (message = 'Not found') => new ApiError(404, message);
  static conflict = (message = 'Conflict') => new ApiError(409, message);
}
