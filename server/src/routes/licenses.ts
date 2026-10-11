import { Router, Request, Response } from 'express';
import { RegulatoryRule } from '../models/RegulatoryRule.js';
import { ComplianceTask } from '../models/ComplianceTask.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateComplianceTaskSchema } from '../validators/schemas.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Search licenses (public)
router.get('/licenses/search', async (req: Request, res: Response, next) => {
  try {
    const filter: any = {};
    if (req.query.industry) filter.industry = req.query.industry;
    if (req.query.jurisdiction) filter.jurisdiction = req.query.jurisdiction;
    if (req.query.state) {
      filter.$or = [
        { 'locationFilter.states': req.query.state },
        { 'locationFilter.states': { $size: 0 } },
      ];
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search as string };
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const [rules, total] = await Promise.all([
      RegulatoryRule.find(filter).skip(skip).limit(limit),
      RegulatoryRule.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { rules, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    next(error);
  }
});

// Get single license
router.get('/licenses/:id', async (req: Request, res: Response, next) => {
  try {
    const rule = await RegulatoryRule.findById(req.params.id);
    if (!rule) return res.status(404).json({ success: false, error: 'License not found' });
    res.json({ success: true, data: { rule } });
  } catch (error) {
    next(error);
  }
});

// Update compliance task (authenticated)
router.patch('/compliance-tasks/:id', authenticate, validate(updateComplianceTaskSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const task = await ComplianceTask.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!task) throw new AppError('Compliance task not found', 404);

    if (req.body.status) task.status = req.body.status;
    if (req.body.notes !== undefined) task.notes = req.body.notes;
    if (req.body.dueDate) task.dueDate = new Date(req.body.dueDate);
    
    await task.save();
    res.json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
});

export { router as licenseRoutes };
