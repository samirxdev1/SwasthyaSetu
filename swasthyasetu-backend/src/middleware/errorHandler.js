import { formatError } from '../utils/responseFormatter.js';
import STATUS_CODES from '../constants/statusCodes.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  const statusCode = err.statusCode || err.status || STATUS_CODES.INTERNAL_SERVER_ERROR;
  const message = err.message || 'An unexpected error occurred on the server';

  return formatError(res, statusCode, message, err.errors || null);
};

export default errorHandler;
