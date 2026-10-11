import { Router, Response } from 'express';
import { BusinessAnalysis } from '../models/BusinessAnalysis.js';
import { FeasibilityReport } from '../models/FeasibilityReport.js';
import { AnalysisEquipment } from '../models/AnalysisEquipment.js';
import { ComplianceTask } from '../models/ComplianceTask.js';
import { SetupTask } from '../models/SetupTask.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createAnalysisSchema, updateAssumptionsSchema, updateEquipmentSchema } from '../validators/schemas.js';
import { AppError } from '../middleware/errorHandler.js';
import { runAnalysisPipeline } from '../services/analysisPipeline.js';
import { recalculateBudget, updateEquipmentInBudget } from '../services/budgetEngine.js';

const router = Router();

// All analysis routes require authentication
router.use(authenticate);

// Create analysis
router.post('/', validate(createAnalysisSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await BusinessAnalysis.create({
      userId: req.user!._id,
      ...req.body,
      status: 'draft',
    });

    res.status(201).json({
      success: true,
      data: { analysis },
    });
  } catch (error) {
    next(error);
  }
});

// List user's analyses
router.get('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const filter: any = { userId: req.user!._id };
    if (req.query.status) filter.status = req.query.status;

    const [analyses, total] = await Promise.all([
      BusinessAnalysis.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-aiReport -budgetBreakdown'),
      BusinessAnalysis.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { analyses, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    next(error);
  }
});

// Get single analysis
router.get('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await BusinessAnalysis.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!analysis) {
      throw new AppError('Analysis not found', 404);
    }

    res.json({ success: true, data: { analysis } });
  } catch (error) {
    next(error);
  }
});

// Delete analysis
router.delete('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await BusinessAnalysis.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!analysis) {
      throw new AppError('Analysis not found', 404);
    }

    await Promise.all([
      BusinessAnalysis.deleteOne({ _id: analysis._id }),
      FeasibilityReport.deleteMany({ analysisId: analysis._id }),
      AnalysisEquipment.deleteMany({ analysisId: analysis._id }),
      ComplianceTask.deleteMany({ analysisId: analysis._id }),
      SetupTask.deleteMany({ analysisId: analysis._id }),
    ]);

    res.json({
      success: true,
      data: { message: 'Analysis deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
});

// Run analysis
router.post('/:id/run', async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await BusinessAnalysis.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!analysis) {
      throw new AppError('Analysis not found', 404);
    }

    if (analysis.status === 'processing') {
      throw new AppError('Analysis is already processing', 400);
    }

    // Run pipeline (in-process for now; BullMQ can be added when Redis is configured)
    analysis.status = 'queued';
    analysis.progress = 0;
    analysis.errorMessage = '';
    await analysis.save();

    // Run async but respond immediately
    runAnalysisPipeline(analysis._id.toString()).catch(err => {
      console.error('Pipeline error:', err);
    });

    res.json({
      success: true,
      data: {
        analysisId: analysis._id,
        status: 'queued',
        message: 'Analysis has been queued for processing',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get analysis status
router.get('/:id/status', async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await BusinessAnalysis.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    }).select('status progress progressMessage errorMessage');

    if (!analysis) {
      throw new AppError('Analysis not found', 404);
    }

    res.json({ success: true, data: { status: analysis.status, progress: analysis.progress, progressMessage: analysis.progressMessage, errorMessage: analysis.errorMessage } });
  } catch (error) {
    next(error);
  }
});

// Get full report
router.get('/:id/report', async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await BusinessAnalysis.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!analysis) {
      throw new AppError('Analysis not found', 404);
    }

    const [feasibility, equipment, licenses, roadmap] = await Promise.all([
      FeasibilityReport.findOne({ analysisId: analysis._id }),
      AnalysisEquipment.find({ analysisId: analysis._id, selectionStatus: { $ne: 'removed' } }),
      ComplianceTask.find({ analysisId: analysis._id }),
      SetupTask.find({ analysisId: analysis._id }).sort({ order: 1 }),
    ]);

    res.json({
      success: true,
      data: {
        analysis,
        feasibility,
        equipment,
        licenses,
        roadmap,
        budgetBreakdown: analysis.budgetBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get feasibility
router.get('/:id/feasibility', async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await BusinessAnalysis.findOne({ _id: req.params.id, userId: req.user!._id }).select('_id');
    if (!analysis) throw new AppError('Analysis not found', 404);

    const feasibility = await FeasibilityReport.findOne({ analysisId: analysis._id });
    if (!feasibility) throw new AppError('Feasibility report not generated yet', 404);

    res.json({ success: true, data: { feasibility } });
  } catch (error) {
    next(error);
  }
});

// Update assumptions
router.patch('/:id/assumptions', validate(updateAssumptionsSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await BusinessAnalysis.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!analysis) throw new AppError('Analysis not found', 404);

    analysis.assumptions = { ...analysis.assumptions, ...req.body.assumptions };
    await analysis.save();

    res.json({ success: true, data: { assumptions: analysis.assumptions } });
  } catch (error) {
    next(error);
  }
});

// Recalculate budget
router.post('/:id/recalculate', async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await BusinessAnalysis.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!analysis) throw new AppError('Analysis not found', 404);
    if (!analysis.budgetBreakdown) throw new AppError('No budget breakdown available', 400);

    // Get current equipment selections
    const equipment = await AnalysisEquipment.find({
      analysisId: analysis._id,
      selectionStatus: 'selected',
    });

    // Update machinery category from equipment
    let breakdown = analysis.budgetBreakdown;
    if (equipment.length > 0) {
      breakdown = updateEquipmentInBudget(breakdown, equipment.map(eq => ({
        name: eq.name,
        totalCost: eq.totalCost,
        installationCost: eq.installationCost,
      })));
    }

    // Recalculate
    breakdown = recalculateBudget(breakdown, analysis.budget);
    analysis.budgetBreakdown = breakdown;
    analysis.markModified('budgetBreakdown');
    await analysis.save();

    res.json({ success: true, data: { budgetBreakdown: breakdown } });
  } catch (error) {
    next(error);
  }
});

// Get analysis equipment
router.get('/:id/equipment', async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await BusinessAnalysis.findOne({ _id: req.params.id, userId: req.user!._id }).select('_id');
    if (!analysis) throw new AppError('Analysis not found', 404);

    const equipment = await AnalysisEquipment.find({ analysisId: analysis._id });
    res.json({ success: true, data: { equipment } });
  } catch (error) {
    next(error);
  }
});

// Update analysis equipment
router.patch('/:id/equipment', validate(updateEquipmentSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await BusinessAnalysis.findOne({ _id: req.params.id, userId: req.user!._id }).select('_id');
    if (!analysis) throw new AppError('Analysis not found', 404);

    for (const item of req.body.items) {
      const update: any = {};
      if (item.quantity !== undefined) update.quantity = item.quantity;
      if (item.estimatedUnitCost !== undefined) update.estimatedUnitCost = item.estimatedUnitCost;
      if (item.installationCost !== undefined) update.installationCost = item.installationCost;
      if (item.selectionStatus !== undefined) update.selectionStatus = item.selectionStatus;

      if (item.quantity !== undefined || item.estimatedUnitCost !== undefined) {
        const eq = await AnalysisEquipment.findById(item.id);
        if (eq) {
          const qty = item.quantity ?? eq.quantity;
          const unitCost = item.estimatedUnitCost ?? eq.estimatedUnitCost;
          const instCost = item.installationCost ?? eq.installationCost;
          update.totalCost = qty * unitCost + instCost;
        }
      }

      await AnalysisEquipment.findOneAndUpdate(
        { _id: item.id, analysisId: analysis._id },
        { $set: update }
      );
    }

    const equipment = await AnalysisEquipment.find({ analysisId: analysis._id });
    res.json({ success: true, data: { equipment } });
  } catch (error) {
    next(error);
  }
});

// Get analysis licenses
router.get('/:id/licenses', async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await BusinessAnalysis.findOne({ _id: req.params.id, userId: req.user!._id }).select('_id');
    if (!analysis) throw new AppError('Analysis not found', 404);

    const licenses = await ComplianceTask.find({ analysisId: analysis._id });
    res.json({ success: true, data: { licenses } });
  } catch (error) {
    next(error);
  }
});

// Get compliance report
router.get('/:id/compliance-report', async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await BusinessAnalysis.findOne({ _id: req.params.id, userId: req.user!._id }).select('_id');
    if (!analysis) throw new AppError('Analysis not found', 404);

    const tasks = await ComplianceTask.find({ analysisId: analysis._id });
    
    const summary = {
      total: tasks.length,
      mandatory: tasks.filter(t => t.mandatory === 'mandatory').length,
      conditional: tasks.filter(t => t.mandatory === 'conditional').length,
      recommended: tasks.filter(t => t.mandatory === 'recommended').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
    };

    res.json({ success: true, data: { summary, tasks } });
  } catch (error) {
    next(error);
  }
});

// Refine analysis
router.post('/:id/refine', async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await BusinessAnalysis.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!analysis) throw new AppError('Analysis not found', 404);

    if (analysis.status !== 'completed' && analysis.status !== 'failed') {
      throw new AppError('Can only refine completed or failed analyses', 400);
    }

    // Reset and re-run
    analysis.status = 'queued';
    analysis.progress = 0;
    analysis.errorMessage = '';
    await analysis.save();

    runAnalysisPipeline(analysis._id.toString()).catch(err => {
      console.error('Refine pipeline error:', err);
    });

    res.json({
      success: true,
      data: { analysisId: analysis._id, status: 'queued', message: 'Analysis refinement queued' },
    });
  } catch (error) {
    next(error);
  }
});

// Supplier compare
router.post('/:id/suppliers/compare', async (req: AuthRequest, res: Response, next) => {
  try {
    const analysis = await BusinessAnalysis.findOne({ _id: req.params.id, userId: req.user!._id }).select('_id');
    if (!analysis) throw new AppError('Analysis not found', 404);

    const equipment = await AnalysisEquipment.find({ 
      analysisId: analysis._id,
      selectionStatus: 'selected',
    });

    // Group equipment by supplier
    const supplierMap: Record<string, any[]> = {};
    for (const eq of equipment) {
      const supplier = eq.supplierName || 'Unspecified';
      if (!supplierMap[supplier]) supplierMap[supplier] = [];
      supplierMap[supplier].push({
        name: eq.name,
        unitCost: eq.estimatedUnitCost,
        totalCost: eq.totalCost,
        verificationStatus: eq.verificationStatus,
      });
    }

    const comparison = Object.entries(supplierMap).map(([name, items]) => ({
      supplierName: name,
      itemCount: items.length,
      totalCost: items.reduce((sum, i) => sum + i.totalCost, 0),
      items,
    }));

    res.json({ success: true, data: { comparison } });
  } catch (error) {
    next(error);
  }
});

export { router as analysisRoutes };
