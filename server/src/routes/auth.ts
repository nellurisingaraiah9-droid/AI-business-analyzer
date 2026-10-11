import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { validate } from '../middleware/validate.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '../validators/schemas.js';
import { AppError } from '../middleware/errorHandler.js';
import { validateEnv } from '../utils/validateEnv.js';

const router = Router();

// Register
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    const env = validateEnv();
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const env = validateEnv();
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
});

// Get current user
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  res.json({
    success: true,
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    },
  });
});

export { router as authRoutes };
