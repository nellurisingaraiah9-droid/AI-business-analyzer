import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { BusinessAnalysis } from '../models/BusinessAnalysis.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema } from '../validators/schemas.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

router.use(authenticate);

// Get current profile with stats
router.get('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await User.findById(req.user!._id).select('-passwordHash');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const [totalAnalyses, completedAnalyses, processingAnalyses] = await Promise.all([
      BusinessAnalysis.countDocuments({ userId: user._id }),
      BusinessAnalysis.countDocuments({ userId: user._id, status: 'completed' }),
      BusinessAnalysis.countDocuments({ userId: user._id, status: { $in: ['queued', 'processing'] } }),
    ]);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        stats: {
          totalAnalyses,
          completedAnalyses,
          processingAnalyses,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update profile name
router.patch('/', validate(updateProfileSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.name = req.body.name;
    await user.save();

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: 'Profile updated successfully',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.patch('/password', validate(changePasswordSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await bcrypt.compare(req.body.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Incorrect current password', 400);
    }

    user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    await user.save();

    res.json({
      success: true,
      data: { message: 'Password updated successfully' },
    });
  } catch (error) {
    next(error);
  }
});

export { router as profileRoutes };
