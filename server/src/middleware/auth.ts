import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { AppError } from './errorHandler.js';
import { validateEnv } from '../utils/validateEnv.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const env = validateEnv();
    
    // Check Authorization header first, then cookie
    let token: string | undefined;
    
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };
    
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Invalid or expired token', 401));
  }
};

export const requireAdmin = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};
