import { BusinessAnalysis, IBusinessAnalysis } from '../models/BusinessAnalysis.js';
import { FeasibilityReport } from '../models/FeasibilityReport.js';
import { AnalysisEquipment } from '../models/AnalysisEquipment.js';
import { ComplianceTask } from '../models/ComplianceTask.js';
import { SetupTask } from '../models/SetupTask.js';
import { Equipment } from '../models/Equipment.js';
import { RegulatoryRule } from '../models/RegulatoryRule.js';
import { createAIProvider, AIAnalysisInput } from './aiProvider.js';
import { recalculateBudget } from './budgetEngine.js';

export async function runAnalysisPipeline(analysisId: string): Promise<void> {
  const analysis = await BusinessAnalysis.findById(analysisId);
  if (!analysis) {
    throw new Error('Analysis not found');
  }

  try {
    // Step 1: Set status to processing
    analysis.status = 'processing';
    analysis.progress = 10;
    analysis.progressMessage = 'Validating input and normalizing business category...';
    await analysis.save();

    // Step 2: Retrieve relevant equipment records from DB
    analysis.progress = 20;
    analysis.progressMessage = 'Retrieving equipment catalog...';
    await analysis.save();

    const relevantEquipment = await Equipment.find({
      $or: [
        { industry: { $in: [analysis.industry, 'general'] } },
        { $text: { $search: analysis.businessIdea } },
      ],
    }).limit(30).lean();

    // Step 3: Retrieve relevant regulatory rules
    analysis.progress = 30;
    analysis.progressMessage = 'Retrieving regulatory rules...';
    await analysis.save();

    const relevantRules = await RegulatoryRule.find({
      $or: [
        { industry: { $in: [analysis.industry, 'general', 'all'] } },
        { 'locationFilter.states': { $in: [analysis.location.state, ''] } },
      ],
    }).limit(50).lean();

    // Step 4: Run AI analysis
    analysis.progress = 40;
    analysis.progressMessage = 'Running AI analysis...';
    await analysis.save();

    const aiProvider = createAIProvider();

    const aiInput: AIAnalysisInput = {
      businessIdea: analysis.businessIdea,
      industry: analysis.industry,
      location: analysis.location,
      budget: analysis.budget,
      budgetCurrency: analysis.budgetCurrency,
      businessScale: analysis.businessScale,
      landAvailable: analysis.landAvailable,
      budgetIncludesLand: analysis.budgetIncludesLand,
      productionCapacity: analysis.productionCapacity,
      floorSpace: analysis.floorSpace,
      utilities: analysis.utilities,
      equipmentCondition: analysis.equipmentCondition,
      businessExperience: analysis.businessExperience,
      targetCustomers: analysis.targetCustomers,
      additionalRequirements: analysis.additionalRequirements,
      existingEquipment: relevantEquipment,
      existingRules: relevantRules,
    };

    const aiResult = await aiProvider.analyze(aiInput);

    // Step 5: Process feasibility report
    analysis.progress = 60;
    analysis.progressMessage = 'Processing feasibility report...';
    await analysis.save();

    const feasibilityReport = await FeasibilityReport.findOneAndUpdate(
      { analysisId: analysis._id },
      {
        analysisId: analysis._id,
        ...aiResult.feasibility,
        budgetSufficiency: aiResult.budgetBreakdown.budgetSufficiency,
      },
      { upsert: true, new: true }
    );

    analysis.feasibilityReport = feasibilityReport._id;

    // Step 6: Process equipment
    analysis.progress = 70;
    analysis.progressMessage = 'Processing equipment recommendations...';
    await analysis.save();

    // Clear existing equipment for this analysis
    await AnalysisEquipment.deleteMany({ analysisId: analysis._id });

    if (aiResult.equipment.length > 0) {
      const equipmentDocs = aiResult.equipment.map(eq => ({
        analysisId: analysis._id,
        equipmentId: null,
        name: eq.name,
        category: eq.category,
        isRequired: eq.isRequired,
        quantity: eq.quantity,
        estimatedUnitCost: eq.estimatedUnitCost,
        installationCost: eq.installationCost,
        totalCost: eq.estimatedUnitCost * eq.quantity + eq.installationCost,
        specifications: eq.specifications,
        capacity: eq.capacity,
        powerRequirement: eq.powerRequirement,
        condition: eq.condition,
        supplierName: eq.supplierName,
        supplierLocation: eq.supplierLocation,
        priceSource: eq.priceSource,
        verificationStatus: eq.verificationStatus,
        notes: eq.notes,
        selectionStatus: 'selected',
      }));

      await AnalysisEquipment.insertMany(equipmentDocs);
    }

    // Step 7: Process licenses and compliance
    analysis.progress = 80;
    analysis.progressMessage = 'Processing license requirements...';
    await analysis.save();

    await ComplianceTask.deleteMany({ analysisId: analysis._id });

    if (aiResult.licenses.length > 0) {
      // Create or match regulatory rules
      for (const lic of aiResult.licenses) {
        let rule = await RegulatoryRule.findOne({ name: lic.name });
        
        if (!rule) {
          rule = await RegulatoryRule.create({
            name: lic.name,
            description: lic.description,
            industry: [analysis.industry],
            activity: [],
            jurisdiction: lic.jurisdiction,
            applicabilityConditions: [lic.applicabilityReason],
            authority: lic.authority,
            officialUrl: lic.officialUrl,
            documents: lic.documents,
            dependencies: lic.dependencies,
            fees: lic.fees,
            processingTime: lic.processingTime,
            verificationStatus: 'unverified',
            sourceReferences: lic.officialUrl ? [{ title: lic.name, url: lic.officialUrl }] : [],
          });
        }

        await ComplianceTask.create({
          userId: analysis.userId,
          analysisId: analysis._id,
          regulatoryRuleId: rule._id,
          name: lic.name,
          description: lic.description,
          mandatory: lic.mandatory,
          applicabilityReason: lic.applicabilityReason,
          authority: lic.authority,
          officialUrl: lic.officialUrl,
          documents: lic.documents,
          dependencies: lic.dependencies,
          fees: lic.fees,
          processingTime: lic.processingTime,
          verificationStatus: lic.verificationStatus,
          status: 'pending',
        });
      }
    }

    // Step 8: Process budget with deterministic engine
    analysis.progress = 85;
    analysis.progressMessage = 'Calculating budget breakdown...';
    await analysis.save();

    const finalBudget = recalculateBudget(aiResult.budgetBreakdown as any, analysis.budget);
    analysis.budgetBreakdown = finalBudget;

    // Step 9: Create setup roadmap
    analysis.progress = 90;
    analysis.progressMessage = 'Creating setup roadmap...';
    await analysis.save();

    await SetupTask.deleteMany({ analysisId: analysis._id });

    if (aiResult.roadmap.length > 0) {
      const roadmapDocs = aiResult.roadmap.map(task => ({
        analysisId: analysis._id,
        title: task.title,
        description: task.description,
        phase: task.phase,
        priority: task.priority,
        dependencies: task.dependencies,
        estimatedDuration: task.estimatedDuration,
        responsiblePerson: task.responsiblePerson,
        order: task.order,
        status: 'pending',
      }));

      await SetupTask.insertMany(roadmapDocs);
    }

    // Step 10: Store AI report and update status
    analysis.progress = 95;
    analysis.progressMessage = 'Finalizing report...';
    await analysis.save();

    analysis.aiReport = {
      assumptions: aiResult.assumptions,
      limitations: aiResult.limitations,
      generatedAt: new Date().toISOString(),
    };
    analysis.assumptions = {
      ...analysis.assumptions,
      aiAssumptions: aiResult.assumptions,
      limitations: aiResult.limitations,
    };

    analysis.status = 'completed';
    analysis.progress = 100;
    analysis.progressMessage = 'Analysis complete';
    await analysis.save();

  } catch (error: any) {
    console.error('Analysis pipeline error:', error);
    
    analysis.status = 'failed';
    analysis.errorMessage = error.message || 'Analysis failed';
    analysis.retryCount += 1;
    await analysis.save();

    throw error;
  }
}
