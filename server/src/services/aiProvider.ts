import OpenAI from 'openai';
import { validateEnv } from '../utils/validateEnv.js';

export interface AIAnalysisInput {
  businessIdea: string;
  industry: string;
  location: { country: string; state: string; city: string };
  budget: number;
  budgetCurrency: string;
  businessScale: string;
  landAvailable: boolean;
  budgetIncludesLand: boolean;
  productionCapacity: string;
  floorSpace: string;
  utilities: { electricity: boolean; water: boolean; gas: boolean };
  equipmentCondition: string;
  businessExperience: string;
  targetCustomers: string;
  additionalRequirements: string;
  existingEquipment: any[];
  existingRules: any[];
}

export interface AIAnalysisOutput {
  feasibility: {
    businessOverview: string;
    targetCustomerSegments: string[];
    demandAssumptions: string[];
    localMarketFactors: string[];
    competitionAnalysis: string;
    differentiationStrategy: string;
    investmentEstimate: {
      totalSetupCost: number;
      monthlyOperatingCost: number;
      workingCapital: number;
    };
    revenueScenarios: {
      conservative: { monthlyRevenue: number; annualRevenue: number };
      base: { monthlyRevenue: number; annualRevenue: number };
      optimistic: { monthlyRevenue: number; annualRevenue: number };
    };
    breakEvenEstimate: {
      monthlyBreakEven: number;
      timeToBreakEven: string;
    };
    risks: {
      operational: string[];
      regulatory: string[];
      financial: string[];
      market: string[];
    };
    recommendations: string[];
    confidenceLevel: string;
  };
  equipment: Array<{
    name: string;
    category: string;
    isRequired: boolean;
    quantity: number;
    estimatedUnitCost: number;
    installationCost: number;
    specifications: Record<string, string>;
    capacity: string;
    powerRequirement: string;
    condition: 'new' | 'used';
    supplierName: string;
    supplierLocation: string;
    priceSource: string;
    verificationStatus: 'verified' | 'estimate' | 'unverified';
    notes: string;
  }>;
  licenses: Array<{
    name: string;
    description: string;
    mandatory: 'mandatory' | 'conditional' | 'recommended';
    applicabilityReason: string;
    authority: string;
    jurisdiction: 'central' | 'state' | 'local';
    officialUrl: string;
    documents: string[];
    dependencies: string[];
    fees: string;
    processingTime: string;
    verificationStatus: string;
  }>;
  budgetBreakdown: {
    premises: { items: Array<{ name: string; amount: number; type: string; notes: string }>; subtotal: number };
    machinery: { items: Array<{ name: string; amount: number; type: string; notes: string }>; subtotal: number };
    infrastructure: { items: Array<{ name: string; amount: number; type: string; notes: string }>; subtotal: number };
    regulatory: { items: Array<{ name: string; amount: number; type: string; notes: string }>; subtotal: number };
    operations: { items: Array<{ name: string; amount: number; type: string; notes: string }>; subtotal: number };
    financial: { items: Array<{ name: string; amount: number; type: string; notes: string }>; subtotal: number };
    totalStartupCost: number;
    monthlyOperatingCost: number;
    budgetSufficiency: {
      isSufficient: boolean;
      shortfall: number;
      recommendations: string[];
    };
  };
  roadmap: Array<{
    title: string;
    description: string;
    phase: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    dependencies: string[];
    estimatedDuration: string;
    responsiblePerson: string;
    order: number;
  }>;
  assumptions: string[];
  limitations: string[];
}

// AI provider interface for replaceability
export interface IAIProvider {
  analyze(input: AIAnalysisInput): Promise<AIAnalysisOutput>;
}

class OpenAIProvider implements IAIProvider {
  private client: OpenAI;
  private model: string;

  constructor() {
    const env = validateEnv();
    this.client = new OpenAI({
      apiKey: env.AI_API_KEY,
      baseURL: env.AI_BASE_URL,
    });
    this.model = env.AI_MODEL;
  }

  async analyze(input: AIAnalysisInput): Promise<AIAnalysisOutput> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(input);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 8000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty AI response');
    }

    const parsed = JSON.parse(content) as AIAnalysisOutput;
    return this.validateAndClean(parsed, input);
  }

  private buildSystemPrompt(): string {
    return `You are BizPilot AI, an expert business setup advisor for India. You analyze business ideas and generate comprehensive, structured reports.

CRITICAL RULES:
1. All costs must be in INR (Indian Rupees).
2. NEVER invent specific supplier contact information, phone numbers, or email addresses.
3. NEVER fabricate government fees or processing times — mark them as "Needs official verification" if unsure.
4. NEVER guarantee profitability or claim to have conducted market surveys.
5. For equipment prices, provide planning estimates and clearly label them. Use "Planning estimate based on industry data" as price source.
6. For licenses, reference actual Indian government portals where possible.
7. Separate verified facts from estimates and AI recommendations.
8. Use conservative financial assumptions.
9. Always recommend the user verify current requirements with the competent authority.
10. Consider the specific location, industry, scale, and budget constraints.

You must return valid JSON matching the specified schema. All monetary amounts must be numbers (not strings).`;
  }

  private buildUserPrompt(input: AIAnalysisInput): string {
    const equipmentContext = input.existingEquipment.length > 0
      ? `\n\nExisting equipment catalog entries that may be relevant:\n${JSON.stringify(input.existingEquipment.slice(0, 20), null, 2)}`
      : '';

    const rulesContext = input.existingRules.length > 0
      ? `\n\nExisting regulatory rules that may apply:\n${JSON.stringify(input.existingRules.slice(0, 30), null, 2)}`
      : '';

    return `Analyze this business idea and generate a comprehensive setup report.

BUSINESS IDEA: ${input.businessIdea}
INDUSTRY: ${input.industry}
LOCATION: ${input.location.city}, ${input.location.state}, ${input.location.country}
BUDGET: ₹${input.budget.toLocaleString('en-IN')} ${input.budgetCurrency}
BUSINESS SCALE: ${input.businessScale}
LAND AVAILABLE: ${input.landAvailable ? 'Yes' : 'No'}
BUDGET INCLUDES LAND: ${input.budgetIncludesLand ? 'Yes' : 'No'}
PRODUCTION CAPACITY: ${input.productionCapacity || 'Not specified'}
FLOOR SPACE: ${input.floorSpace || 'Not specified'}
UTILITIES: Electricity: ${input.utilities.electricity ? 'Yes' : 'No'}, Water: ${input.utilities.water ? 'Yes' : 'No'}, Gas: ${input.utilities.gas ? 'Yes' : 'No'}
EQUIPMENT CONDITION: ${input.equipmentCondition}
EXPERIENCE: ${input.businessExperience || 'Not specified'}
TARGET CUSTOMERS: ${input.targetCustomers || 'Not specified'}
ADDITIONAL REQUIREMENTS: ${input.additionalRequirements || 'None'}
${equipmentContext}${rulesContext}

Generate a comprehensive JSON report with these exact keys:
{
  "feasibility": {
    "businessOverview": "string",
    "targetCustomerSegments": ["string"],
    "demandAssumptions": ["string"],
    "localMarketFactors": ["string"],
    "competitionAnalysis": "string",
    "differentiationStrategy": "string",
    "investmentEstimate": { "totalSetupCost": number, "monthlyOperatingCost": number, "workingCapital": number },
    "revenueScenarios": {
      "conservative": { "monthlyRevenue": number, "annualRevenue": number },
      "base": { "monthlyRevenue": number, "annualRevenue": number },
      "optimistic": { "monthlyRevenue": number, "annualRevenue": number }
    },
    "breakEvenEstimate": { "monthlyBreakEven": number, "timeToBreakEven": "string" },
    "risks": { "operational": ["string"], "regulatory": ["string"], "financial": ["string"], "market": ["string"] },
    "recommendations": ["string"],
    "confidenceLevel": "string"
  },
  "equipment": [{ "name": "string", "category": "string", "isRequired": boolean, "quantity": number, "estimatedUnitCost": number, "installationCost": number, "specifications": {}, "capacity": "string", "powerRequirement": "string", "condition": "new|used", "supplierName": "string", "supplierLocation": "string", "priceSource": "Planning estimate", "verificationStatus": "estimate", "notes": "string" }],
  "licenses": [{ "name": "string", "description": "string", "mandatory": "mandatory|conditional|recommended", "applicabilityReason": "string", "authority": "string", "jurisdiction": "central|state|local", "officialUrl": "string", "documents": ["string"], "dependencies": ["string"], "fees": "string", "processingTime": "string", "verificationStatus": "string" }],
  "budgetBreakdown": {
    "premises": { "items": [{ "name": "string", "amount": number, "type": "one-time|monthly|annual", "notes": "string" }], "subtotal": number },
    "machinery": { "items": [...], "subtotal": number },
    "infrastructure": { "items": [...], "subtotal": number },
    "regulatory": { "items": [...], "subtotal": number },
    "operations": { "items": [...], "subtotal": number },
    "financial": { "items": [...], "subtotal": number },
    "totalStartupCost": number,
    "monthlyOperatingCost": number,
    "budgetSufficiency": { "isSufficient": boolean, "shortfall": number, "recommendations": ["string"] }
  },
  "roadmap": [{ "title": "string", "description": "string", "phase": "string", "priority": "critical|high|medium|low", "dependencies": ["string"], "estimatedDuration": "string", "responsiblePerson": "string", "order": number }],
  "assumptions": ["string"],
  "limitations": ["string"]
}

Be thorough, realistic, and location-specific. All amounts in INR.`;
  }

  private validateAndClean(output: AIAnalysisOutput, input: AIAnalysisInput): AIAnalysisOutput {
    // Ensure all numeric fields are numbers
    const ensureNumber = (val: any): number => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') return parseFloat(val) || 0;
      return 0;
    };

    // Validate and clean feasibility
    if (output.feasibility) {
      const f = output.feasibility;
      f.investmentEstimate = {
        totalSetupCost: ensureNumber(f.investmentEstimate?.totalSetupCost),
        monthlyOperatingCost: ensureNumber(f.investmentEstimate?.monthlyOperatingCost),
        workingCapital: ensureNumber(f.investmentEstimate?.workingCapital),
      };
      
      ['conservative', 'base', 'optimistic'].forEach(scenario => {
        const s = (f.revenueScenarios as any)?.[scenario];
        if (s) {
          (f.revenueScenarios as any)[scenario] = {
            monthlyRevenue: ensureNumber(s.monthlyRevenue),
            annualRevenue: ensureNumber(s.annualRevenue),
          };
        }
      });

      f.breakEvenEstimate = {
        monthlyBreakEven: ensureNumber(f.breakEvenEstimate?.monthlyBreakEven),
        timeToBreakEven: f.breakEvenEstimate?.timeToBreakEven || 'Not estimated',
      };
    }

    // Validate equipment
    if (Array.isArray(output.equipment)) {
      output.equipment = output.equipment.map(eq => ({
        ...eq,
        quantity: ensureNumber(eq.quantity) || 1,
        estimatedUnitCost: ensureNumber(eq.estimatedUnitCost),
        installationCost: ensureNumber(eq.installationCost),
        verificationStatus: eq.verificationStatus || 'estimate',
        priceSource: eq.priceSource || 'Planning estimate based on industry data',
        condition: eq.condition === 'used' ? 'used' : 'new',
      }));
    } else {
      output.equipment = [];
    }

    // Validate licenses
    if (Array.isArray(output.licenses)) {
      output.licenses = output.licenses.map(lic => ({
        ...lic,
        mandatory: (['mandatory', 'conditional', 'recommended'].includes(lic.mandatory) ? lic.mandatory : 'conditional') as any,
        jurisdiction: (['central', 'state', 'local'].includes(lic.jurisdiction) ? lic.jurisdiction : 'central') as any,
        verificationStatus: lic.verificationStatus || 'Needs official verification',
      }));
    } else {
      output.licenses = [];
    }

    // Validate budget breakdown
    if (output.budgetBreakdown) {
      const bb = output.budgetBreakdown;
      const categories = ['premises', 'machinery', 'infrastructure', 'regulatory', 'operations', 'financial'] as const;
      
      let recalculatedTotal = 0;
      for (const cat of categories) {
        if (!bb[cat]) {
          (bb as any)[cat] = { items: [], subtotal: 0 };
        }
        if (!Array.isArray(bb[cat].items)) {
          bb[cat].items = [];
        }
        bb[cat].items = bb[cat].items.map(item => ({
          ...item,
          amount: ensureNumber(item.amount),
        }));
        bb[cat].subtotal = bb[cat].items.reduce((sum, item) => sum + item.amount, 0);
        recalculatedTotal += bb[cat].subtotal;
      }
      
      bb.totalStartupCost = recalculatedTotal;
      bb.monthlyOperatingCost = ensureNumber(bb.monthlyOperatingCost);
      
      // Recalculate budget sufficiency
      bb.budgetSufficiency = {
        isSufficient: input.budget >= recalculatedTotal,
        shortfall: Math.max(0, recalculatedTotal - input.budget),
        recommendations: bb.budgetSufficiency?.recommendations || [],
      };
    }

    // Validate roadmap
    if (Array.isArray(output.roadmap)) {
      output.roadmap = output.roadmap.map((task, i) => ({
        ...task,
        order: task.order || i + 1,
        priority: (['critical', 'high', 'medium', 'low'].includes(task.priority) ? task.priority : 'medium') as any,
      }));
    } else {
      output.roadmap = [];
    }

    output.assumptions = output.assumptions || [];
    output.limitations = output.limitations || [];

    return output;
  }
}

// Fallback provider that generates a structured but clearly labeled template
class FallbackProvider implements IAIProvider {
  async analyze(input: AIAnalysisInput): Promise<AIAnalysisOutput> {
    const budget = input.budget;
    const machineryBudget = Math.round(budget * 0.35);
    const premisesBudget = input.landAvailable ? 0 : Math.round(budget * 0.25);
    const infraBudget = Math.round(budget * 0.10);
    const regulatoryBudget = Math.round(budget * 0.05);
    const operationsBudget = Math.round(budget * 0.15);
    const financialBudget = Math.round(budget * 0.10);

    const totalEstimate = machineryBudget + premisesBudget + infraBudget + regulatoryBudget + operationsBudget + financialBudget;

    return {
      feasibility: {
        businessOverview: `Analysis of "${input.businessIdea}" in ${input.location.city}, ${input.location.state}. This is a planning estimate generated without AI. For a detailed analysis, please configure the AI API key in the server environment.`,
        targetCustomerSegments: ['Local consumers', 'Businesses in the area', 'Wholesale buyers'],
        demandAssumptions: [
          'Demand estimation requires local market research — this has NOT been conducted',
          `Business scale: ${input.businessScale}`,
          'Actual demand should be verified through market surveys',
        ],
        localMarketFactors: [
          `Located in ${input.location.city}, ${input.location.state}`,
          'Local competition analysis required',
          'Market conditions should be independently verified',
        ],
        competitionAnalysis: 'A detailed competition analysis requires local market research. This report provides a structural framework for evaluation.',
        differentiationStrategy: 'To be determined based on detailed market analysis and your unique strengths.',
        investmentEstimate: {
          totalSetupCost: totalEstimate,
          monthlyOperatingCost: Math.round(budget * 0.08),
          workingCapital: Math.round(budget * 0.10),
        },
        revenueScenarios: {
          conservative: { monthlyRevenue: Math.round(budget * 0.05), annualRevenue: Math.round(budget * 0.60) },
          base: { monthlyRevenue: Math.round(budget * 0.08), annualRevenue: Math.round(budget * 0.96) },
          optimistic: { monthlyRevenue: Math.round(budget * 0.12), annualRevenue: Math.round(budget * 1.44) },
        },
        breakEvenEstimate: {
          monthlyBreakEven: Math.round(budget * 0.06),
          timeToBreakEven: '12-18 months (planning estimate)',
        },
        risks: {
          operational: ['Equipment sourcing and quality', 'Supply chain reliability', 'Skilled labor availability'],
          regulatory: ['Compliance requirements may vary by location', 'Processing times for approvals may vary'],
          financial: ['Budget sufficiency depends on actual equipment and premises costs', 'Working capital adequacy'],
          market: ['Demand assumptions need validation', 'Competition intensity unknown'],
        },
        recommendations: [
          'Configure the AI API key for a detailed, industry-specific analysis',
          'Conduct local market research to validate demand assumptions',
          'Obtain actual equipment quotations from suppliers',
          'Consult with a local business advisor or CA',
          'Verify all regulatory requirements with the relevant authorities',
        ],
        confidenceLevel: 'Low — Template-based planning estimate. Configure AI for detailed analysis.',
      },
      equipment: [
        {
          name: 'Primary Production Equipment',
          category: 'Production',
          isRequired: true,
          quantity: 1,
          estimatedUnitCost: Math.round(machineryBudget * 0.50),
          installationCost: Math.round(machineryBudget * 0.05),
          specifications: {},
          capacity: input.productionCapacity || 'To be determined',
          powerRequirement: 'To be assessed',
          condition: 'new',
          supplierName: 'To be sourced — obtain quotations from multiple suppliers',
          supplierLocation: input.location.state,
          priceSource: 'Planning estimate — obtain actual quotations',
          verificationStatus: 'estimate',
          notes: 'This is a placeholder. Configure AI API for industry-specific equipment recommendations.',
        },
        {
          name: 'Auxiliary Equipment',
          category: 'Support',
          isRequired: true,
          quantity: 1,
          estimatedUnitCost: Math.round(machineryBudget * 0.30),
          installationCost: Math.round(machineryBudget * 0.03),
          specifications: {},
          capacity: 'To match primary equipment',
          powerRequirement: 'To be assessed',
          condition: 'new',
          supplierName: 'To be sourced',
          supplierLocation: input.location.state,
          priceSource: 'Planning estimate',
          verificationStatus: 'estimate',
          notes: 'Placeholder entry — actual equipment needs depend on business type.',
        },
      ],
      licenses: [
        {
          name: 'GST Registration',
          description: 'Goods and Services Tax registration is required for businesses with turnover exceeding the threshold limit.',
          mandatory: 'mandatory',
          applicabilityReason: 'Required for most businesses in India with turnover above threshold',
          authority: 'Central Board of Indirect Taxes and Customs (CBIC)',
          jurisdiction: 'central',
          officialUrl: 'https://www.gst.gov.in/',
          documents: ['PAN Card', 'Aadhaar Card', 'Business address proof', 'Bank account details', 'Photographs'],
          dependencies: [],
          fees: 'Free registration — verify on official portal',
          processingTime: '3-7 working days (typical)',
          verificationStatus: 'Source available — verify current requirements on GST portal',
        },
        {
          name: 'Udyam Registration (MSME)',
          description: 'MSME registration for micro, small, and medium enterprises. Free online registration.',
          mandatory: 'recommended',
          applicabilityReason: 'Recommended for all MSMEs for government benefits and schemes',
          authority: 'Ministry of MSME',
          jurisdiction: 'central',
          officialUrl: 'https://udyamregistration.gov.in/',
          documents: ['Aadhaar Card', 'PAN Card', 'Business details'],
          dependencies: [],
          fees: 'Free — verify on official portal',
          processingTime: 'Instant to 2-3 working days',
          verificationStatus: 'Source available — verify current process on Udyam portal',
        },
        {
          name: 'Shop and Establishment License',
          description: 'Required for commercial establishments under state-specific Shops and Establishments Act.',
          mandatory: 'conditional',
          applicabilityReason: 'Required if operating from commercial premises — verify state-specific requirements',
          authority: `${input.location.state} Labour Department`,
          jurisdiction: 'state',
          officialUrl: '',
          documents: ['ID Proof', 'Address Proof', 'Rental Agreement', 'PAN Card'],
          dependencies: [],
          fees: 'Varies by state — check with local authority',
          processingTime: '7-15 working days (typical)',
          verificationStatus: 'Needs official verification — requirements vary by state',
        },
      ],
      budgetBreakdown: {
        premises: {
          items: input.landAvailable
            ? [{ name: 'Renovation/Setup', amount: Math.round(budget * 0.10), type: 'one-time', notes: 'Planning estimate' }]
            : [
              { name: 'Premises deposit/lease', amount: Math.round(premisesBudget * 0.60), type: 'one-time', notes: 'Planning estimate' },
              { name: 'Renovation/Setup', amount: Math.round(premisesBudget * 0.40), type: 'one-time', notes: 'Planning estimate' },
            ],
          subtotal: input.landAvailable ? Math.round(budget * 0.10) : premisesBudget,
        },
        machinery: {
          items: [
            { name: 'Primary Equipment', amount: Math.round(machineryBudget * 0.50), type: 'one-time', notes: 'Planning estimate' },
            { name: 'Auxiliary Equipment', amount: Math.round(machineryBudget * 0.30), type: 'one-time', notes: 'Planning estimate' },
            { name: 'Installation & Commissioning', amount: Math.round(machineryBudget * 0.10), type: 'one-time', notes: 'Planning estimate' },
            { name: 'Freight & Handling', amount: Math.round(machineryBudget * 0.10), type: 'one-time', notes: 'Planning estimate' },
          ],
          subtotal: machineryBudget,
        },
        infrastructure: {
          items: [
            { name: 'Electrical Installation', amount: Math.round(infraBudget * 0.40), type: 'one-time', notes: 'Planning estimate' },
            { name: 'Water & Plumbing', amount: Math.round(infraBudget * 0.25), type: 'one-time', notes: 'Planning estimate' },
            { name: 'IT & Office Setup', amount: Math.round(infraBudget * 0.20), type: 'one-time', notes: 'Planning estimate' },
            { name: 'Fire Safety', amount: Math.round(infraBudget * 0.15), type: 'one-time', notes: 'Planning estimate' },
          ],
          subtotal: infraBudget,
        },
        regulatory: {
          items: [
            { name: 'Registration & License Fees', amount: Math.round(regulatoryBudget * 0.40), type: 'one-time', notes: 'Planning estimate — verify actual fees' },
            { name: 'Professional Consultation (CA/Lawyer)', amount: Math.round(regulatoryBudget * 0.40), type: 'one-time', notes: 'Planning estimate' },
            { name: 'Testing & Certification', amount: Math.round(regulatoryBudget * 0.20), type: 'one-time', notes: 'If applicable' },
          ],
          subtotal: regulatoryBudget,
        },
        operations: {
          items: [
            { name: 'Initial Raw Materials/Inventory', amount: Math.round(operationsBudget * 0.30), type: 'one-time', notes: 'Planning estimate' },
            { name: 'Salaries (first 3 months)', amount: Math.round(operationsBudget * 0.35), type: 'one-time', notes: 'Planning estimate' },
            { name: 'Marketing & Branding', amount: Math.round(operationsBudget * 0.20), type: 'one-time', notes: 'Planning estimate' },
            { name: 'Insurance', amount: Math.round(operationsBudget * 0.15), type: 'annual', notes: 'Planning estimate' },
          ],
          subtotal: operationsBudget,
        },
        financial: {
          items: [
            { name: 'Working Capital Reserve', amount: Math.round(financialBudget * 0.60), type: 'one-time', notes: 'Recommended 3-month reserve' },
            { name: 'Contingency (10%)', amount: Math.round(financialBudget * 0.40), type: 'one-time', notes: 'For unexpected costs' },
          ],
          subtotal: financialBudget,
        },
        totalStartupCost: totalEstimate,
        monthlyOperatingCost: Math.round(budget * 0.08),
        budgetSufficiency: {
          isSufficient: budget >= totalEstimate,
          shortfall: Math.max(0, totalEstimate - budget),
          recommendations: budget >= totalEstimate
            ? ['Budget appears sufficient for the estimated setup costs', 'Obtain actual quotations to validate estimates']
            : [`Budget shortfall of ₹${(totalEstimate - budget).toLocaleString('en-IN')} estimated`, 'Consider phased implementation', 'Explore financing options'],
        },
      },
      roadmap: [
        { title: 'Validate Business Concept', description: 'Conduct market research and validate demand assumptions', phase: 'Planning', priority: 'critical', dependencies: [], estimatedDuration: '1-2 weeks', responsiblePerson: 'Business Owner', order: 1 },
        { title: 'Financial Planning', description: 'Finalize budget, explore financing if needed', phase: 'Planning', priority: 'critical', dependencies: ['Validate Business Concept'], estimatedDuration: '1-2 weeks', responsiblePerson: 'Business Owner / CA', order: 2 },
        { title: 'Secure Premises', description: 'Find and secure suitable business premises', phase: 'Setup', priority: 'high', dependencies: ['Financial Planning'], estimatedDuration: '2-4 weeks', responsiblePerson: 'Business Owner', order: 3 },
        { title: 'Business Registration', description: 'Complete GST, Udyam, and other required registrations', phase: 'Legal', priority: 'critical', dependencies: ['Financial Planning'], estimatedDuration: '2-3 weeks', responsiblePerson: 'CA / Business Owner', order: 4 },
        { title: 'Apply for Licenses', description: 'Submit applications for all required licenses and approvals', phase: 'Legal', priority: 'critical', dependencies: ['Business Registration', 'Secure Premises'], estimatedDuration: '4-8 weeks', responsiblePerson: 'Business Owner / Legal Advisor', order: 5 },
        { title: 'Equipment Procurement', description: 'Obtain quotations, compare suppliers, place orders', phase: 'Procurement', priority: 'high', dependencies: ['Secure Premises', 'Financial Planning'], estimatedDuration: '3-6 weeks', responsiblePerson: 'Business Owner', order: 6 },
        { title: 'Infrastructure Setup', description: 'Complete electrical, plumbing, IT, and safety installations', phase: 'Setup', priority: 'high', dependencies: ['Secure Premises'], estimatedDuration: '2-4 weeks', responsiblePerson: 'Contractor', order: 7 },
        { title: 'Equipment Installation', description: 'Install, test, and commission all equipment', phase: 'Setup', priority: 'high', dependencies: ['Equipment Procurement', 'Infrastructure Setup'], estimatedDuration: '1-3 weeks', responsiblePerson: 'Supplier / Technician', order: 8 },
        { title: 'Hire & Train Staff', description: 'Recruit and train necessary staff', phase: 'Operations', priority: 'medium', dependencies: ['Secure Premises'], estimatedDuration: '2-4 weeks', responsiblePerson: 'Business Owner / HR', order: 9 },
        { title: 'Pre-Launch Preparations', description: 'Final inspections, marketing, initial inventory', phase: 'Launch', priority: 'high', dependencies: ['Equipment Installation', 'Apply for Licenses', 'Hire & Train Staff'], estimatedDuration: '1-2 weeks', responsiblePerson: 'Business Owner', order: 10 },
        { title: 'Commence Operations', description: 'Begin operations only after all required approvals are in place', phase: 'Launch', priority: 'critical', dependencies: ['Pre-Launch Preparations'], estimatedDuration: 'Ongoing', responsiblePerson: 'Business Owner', order: 11 },
      ],
      assumptions: [
        'This is a template-based estimate — configure AI API for detailed analysis',
        'All costs are planning estimates and must be verified with actual quotations',
        'Regulatory requirements are indicative — verify with the competent authorities',
        'Revenue projections are purely illustrative and not based on market research',
        `Location: ${input.location.city}, ${input.location.state}, ${input.location.country}`,
        `Budget: ₹${input.budget.toLocaleString('en-IN')}`,
      ],
      limitations: [
        'AI provider not configured — using template-based analysis',
        'Equipment recommendations are generic — specific to industry analysis requires AI',
        'License requirements are basic — industry-specific rules require AI analysis',
        'No actual market data or supplier data was retrieved for this report',
      ],
    };
  }
}

// Factory function
export function createAIProvider(): IAIProvider {
  const env = validateEnv();
  if (env.AI_API_KEY && env.AI_API_KEY !== 'sk-your-openai-api-key-here' && env.AI_API_KEY.length > 10) {
    console.log('✅ AI Provider: OpenAI (' + env.AI_MODEL + ')');
    return new OpenAIProvider();
  }
  console.log('⚠️ AI Provider: Fallback (no API key configured)');
  return new FallbackProvider();
}
