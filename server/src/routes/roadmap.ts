import { Router, Response } from 'express';
import { SetupTask } from '../models/SetupTask.js';
import { BusinessAnalysis } from '../models/BusinessAnalysis.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateSetupTaskSchema } from '../validators/schemas.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

router.use(authenticate);

// Get roadmap for analysis
router.get('/analyses/:id/roadmap', async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await BusinessAnalysis.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    }).select('_id');

    if (!analysis) throw new AppError('Analysis not found', 404);

    const tasks = await SetupTask.find({ analysisId: analysis._id }).sort({ order: 1 });
    
    const summary = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
    };

    res.json({ success: true, data: { summary, tasks } });
  } catch (error) {
    next(error);
  }
});

// Update setup task
router.patch('/setup-tasks/:id', validate(updateSetupTaskSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const task = await SetupTask.findById(req.params.id);
    if (!task) throw new AppError('Task not found', 404);

    // Verify ownership via analysis
    const analysis = await BusinessAnalysis.findOne({
      _id: task.analysisId,
      userId: req.user!._id,
    }).select('_id');

    if (!analysis) throw new AppError('Not authorized', 403);

    if (req.body.status) task.status = req.body.status;
    if (req.body.notes !== undefined) task.notes = req.body.notes;
    
    await task.save();
    res.json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
});

export { router as roadmapRoutes };
