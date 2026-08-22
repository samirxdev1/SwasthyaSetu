import { formatError } from '../utils/responseFormatter.js';
import STATUS_CODES from '../constants/statusCodes.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || STATUS_CODES.INTERNAL_SERVER_ERROR;
  const message = err.message || 'An unexpected error occurred on the server';

  if (statusCode >= 500) {
    console.error('💥 Unhandled Server Error [500]:', err);
  } else {
    console.warn(`⚠️ Client Request Error [${statusCode}] ${req.method} ${req.originalUrl}: ${message}`);
  }

  return formatError(res, statusCode, message, err.errors || null);
};

export default errorHandler;
