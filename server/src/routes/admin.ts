import { Router, Response } from 'express';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { adminEquipmentSchema, adminRegulatoryRuleSchema } from '../validators/schemas.js';
import { Equipment } from '../models/Equipment.js';
import { RegulatoryRule } from '../models/RegulatoryRule.js';
import { User } from '../models/User.js';
import { BusinessAnalysis } from '../models/BusinessAnalysis.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

// Admin overview
router.get('/overview', async (_req: AuthRequest, res: Response, next) => {
  try {
    const [userCount, analysisCount, equipmentCount, ruleCount] = await Promise.all([
      User.countDocuments(),
      BusinessAnalysis.countDocuments(),
      Equipment.countDocuments(),
      RegulatoryRule.countDocuments(),
    ]);

    const recentAnalyses = await BusinessAnalysis.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .select('businessIdea industry status createdAt');

    res.json({
      success: true,
      data: {
        stats: { users: userCount, analyses: analysisCount, equipment: equipmentCount, rules: ruleCount },
        recentAnalyses,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Equipment CRUD
router.post('/equipment', validate(adminEquipmentSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const equipment = await Equipment.create(req.body);
    res.status(201).json({ success: true, data: { equipment } });
  } catch (error) {
    next(error);
  }
});

router.patch('/equipment/:id', validate(adminEquipmentSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!equipment) throw new AppError('Equipment not found', 404);
    res.json({ success: true, data: { equipment } });
  } catch (error) {
    next(error);
  }
});

// Regulatory rules CRUD
router.post('/regulatory-rules', validate(adminRegulatoryRuleSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const rule = await RegulatoryRule.create(req.body);
    res.status(201).json({ success: true, data: { rule } });
  } catch (error) {
    next(error);
  }
});

router.patch('/regulatory-rules/:id', validate(adminRegulatoryRuleSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const rule = await RegulatoryRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rule) throw new AppError('Rule not found', 404);
    res.json({ success: true, data: { rule } });
  } catch (error) {
    next(error);
  }
});

export { router as adminRoutes };
