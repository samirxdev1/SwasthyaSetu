import { formatError } from '../utils/responseFormatter.js';
import STATUS_CODES from '../constants/statusCodes.js';

export const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return formatError(res, STATUS_CODES.UNAUTHORIZED, 'Access denied. User role not identified.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return formatError(
        res,
        STATUS_CODES.FORBIDDEN,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
      );
    }

    next();
  };
};

export default roleCheck;
