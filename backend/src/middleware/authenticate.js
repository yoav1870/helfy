import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors.js';

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Invalid or expired token'));
    } else {
      next(error);
    }
  }
};

export default authenticate;
