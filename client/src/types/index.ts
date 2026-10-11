export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AnalysisLocation {
  country: string;
  state: string;
  city: string;
}

export interface AnalysisUtilities {
  electricity: boolean;
  water: boolean;
  gas: boolean;
}

export interface AnalysisFormData {
  businessIdea: string;
  industry: string;
  location: AnalysisLocation;
  budget: number;
  budgetCurrency: string;
  businessScale: string;
  fundingSource: string;
  landAvailable: boolean;
  budgetIncludesLand: boolean;
  productionCapacity: string;
  floorSpace: string;
  utilities: AnalysisUtilities;
  equipmentCondition: 'new' | 'used' | 'both';
  expectedOpeningDate: string;
  businessExperience: string;
  targetCustomers: string;
  additionalRequirements: string;
}

export interface Analysis {
  _id: string;
  userId: string;
  businessIdea: string;
  industry: string;
  location: AnalysisLocation;
  budget: number;
  budgetCurrency: string;
  businessScale: string;
  status: 'draft' | 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  progressMessage: string;
  errorMessage: string;
  budgetBreakdown: BudgetBreakdown | null;
  aiReport: any;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetLineItem {
  name: string;
  amount: number;
  type: 'one-time' | 'monthly' | 'annual' | 'refundable';
  notes: string;
}

export interface BudgetCategory {
  items: BudgetLineItem[];
  subtotal: number;
}

export interface BudgetBreakdown {
  premises: BudgetCategory;
  machinery: BudgetCategory;
  infrastructure: BudgetCategory;
  regulatory: BudgetCategory;
  operations: BudgetCategory;
  financial: BudgetCategory;
  totalStartupCost: number;
  monthlyOperatingCost: number;
  budgetSufficiency: {
    isSufficient: boolean;
    shortfall: number;
    surplus?: number;
    recommendations: string[];
  };
}

export interface FeasibilityReport {
  _id: string;
  analysisId: string;
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
  budgetSufficiency: {
    isSufficient: boolean;
    shortfall: number;
    recommendations: string[];
  };
  recommendations: string[];
  confidenceLevel: string;
}

export interface AnalysisEquipment {
  _id: string;
  analysisId: string;
  name: string;
  category: string;
  isRequired: boolean;
  quantity: number;
  estimatedUnitCost: number;
  installationCost: number;
  totalCost: number;
  specifications: Record<string, string>;
  capacity: string;
  powerRequirement: string;
  condition: 'new' | 'used';
  supplierName: string;
  supplierLocation: string;
  supplierWebsite: string;
  priceSource: string;
  verificationStatus: 'verified' | 'estimate' | 'unverified';
  notes: string;
  selectionStatus: 'selected' | 'alternative' | 'removed';
}

export interface ComplianceTask {
  _id: string;
  analysisId: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'not_applicable';
  mandatory: 'mandatory' | 'conditional' | 'recommended';
  applicabilityReason: string;
  authority: string;
  officialUrl: string;
  documents: string[];
  dependencies: string[];
  fees: string;
  processingTime: string;
  verificationStatus: string;
  notes: string;
}

export interface SetupTask {
  _id: string;
  analysisId: string;
  title: string;
  description: string;
  phase: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dependencies: string[];
  estimatedDuration: string;
  responsiblePerson: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  order: number;
  notes: string;
}

export interface FullReport {
  analysis: Analysis;
  feasibility: FeasibilityReport | null;
  equipment: AnalysisEquipment[];
  licenses: ComplianceTask[];
  roadmap: SetupTask[];
  budgetBreakdown: BudgetBreakdown | null;
}
