import authService from '../services/authService.js';
import { formatError } from '../utils/responseFormatter.js';
import STATUS_CODES from '../constants/statusCodes.js';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return formatError(res, STATUS_CODES.UNAUTHORIZED, 'Access denied. Authorization header with Bearer token is required.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return formatError(res, STATUS_CODES.UNAUTHORIZED, 'Access denied. Token missing from authorization header.');
    }

    const decoded = authService.verifyToken(token);
    req.user = decoded; // Contains id and role
    next();
  } catch (error) {
    return formatError(res, STATUS_CODES.UNAUTHORIZED, error.message || 'Invalid or expired token.');
  }
};

export default authMiddleware;
