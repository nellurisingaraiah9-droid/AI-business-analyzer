import { Router, Request, Response } from 'express';
import { Equipment } from '../models/Equipment.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Search equipment (public or authenticated)
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.industry) filter.industry = req.query.industry;
    if (req.query.search) {
      filter.$text = { $search: req.query.search as string };
    }

    const sortField = (req.query.sort as string) || 'name';
    const sortOrder = req.query.order === 'desc' ? -1 : 1;

    const [equipment, total] = await Promise.all([
      Equipment.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
      Equipment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { equipment, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    next(error);
  }
});

// Get single equipment
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ success: false, error: 'Equipment not found' });
    }
    res.json({ success: true, data: { equipment } });
  } catch (error) {
    next(error);
  }
});

export { router as equipmentRoutes };
