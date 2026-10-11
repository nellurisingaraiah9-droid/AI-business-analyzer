import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFeasibilityReport extends Document {
  analysisId: Types.ObjectId;
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
    conservative: { monthlyRevenue: number; annualRevenue: number; };
    base: { monthlyRevenue: number; annualRevenue: number; };
    optimistic: { monthlyRevenue: number; annualRevenue: number; };
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
  alternativeConfigurations: string[];
  recommendations: string[];
  sourceReferences: { title: string; url: string; retrievedAt: string; }[];
  confidenceLevel: string;
  createdAt: Date;
  updatedAt: Date;
}

const feasibilityReportSchema = new Schema<IFeasibilityReport>({
  analysisId: { type: Schema.Types.ObjectId, ref: 'BusinessAnalysis', required: true, unique: true },
  businessOverview: { type: String, default: '' },
  targetCustomerSegments: [String],
  demandAssumptions: [String],
  localMarketFactors: [String],
  competitionAnalysis: { type: String, default: '' },
  differentiationStrategy: { type: String, default: '' },
  investmentEstimate: {
    totalSetupCost: { type: Number, default: 0 },
    monthlyOperatingCost: { type: Number, default: 0 },
    workingCapital: { type: Number, default: 0 },
  },
  revenueScenarios: {
    conservative: { monthlyRevenue: { type: Number, default: 0 }, annualRevenue: { type: Number, default: 0 } },
    base: { monthlyRevenue: { type: Number, default: 0 }, annualRevenue: { type: Number, default: 0 } },
    optimistic: { monthlyRevenue: { type: Number, default: 0 }, annualRevenue: { type: Number, default: 0 } },
  },
  breakEvenEstimate: {
    monthlyBreakEven: { type: Number, default: 0 },
    timeToBreakEven: { type: String, default: '' },
  },
  risks: {
    operational: [String],
    regulatory: [String],
    financial: [String],
    market: [String],
  },
  budgetSufficiency: {
    isSufficient: { type: Boolean, default: false },
    shortfall: { type: Number, default: 0 },
    recommendations: [String],
  },
  alternativeConfigurations: [String],
  recommendations: [String],
  sourceReferences: [{
    title: String,
    url: String,
    retrievedAt: String,
  }],
  confidenceLevel: { type: String, default: 'Planning estimate' },
}, { timestamps: true });

export const FeasibilityReport = mongoose.model<IFeasibilityReport>('FeasibilityReport', feasibilityReportSchema);
