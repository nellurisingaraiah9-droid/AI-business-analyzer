import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBusinessAnalysis extends Document {
  userId: Types.ObjectId;
  businessIdea: string;
  industry: string;
  location: {
    country: string;
    state: string;
    city: string;
  };
  budget: number;
  budgetCurrency: string;
  businessScale: string;
  fundingSource: string;
  landAvailable: boolean;
  budgetIncludesLand: boolean;
  productionCapacity: string;
  floorSpace: string;
  utilities: {
    electricity: boolean;
    water: boolean;
    gas: boolean;
  };
  equipmentCondition: 'new' | 'used' | 'both';
  expectedOpeningDate: string;
  businessExperience: string;
  targetCustomers: string;
  additionalRequirements: string;
  status: 'draft' | 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  progressMessage: string;
  assumptions: Record<string, any>;
  feasibilityReport: Types.ObjectId | null;
  budgetBreakdown: any;
  aiReport: any;
  errorMessage: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const businessAnalysisSchema = new Schema<IBusinessAnalysis>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  businessIdea: { type: String, required: true, maxlength: 2000 },
  industry: { type: String, required: true },
  location: {
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
  },
  budget: { type: Number, required: true, min: 0 },
  budgetCurrency: { type: String, default: 'INR' },
  businessScale: { type: String, default: 'small' },
  fundingSource: { type: String, default: '' },
  landAvailable: { type: Boolean, default: false },
  budgetIncludesLand: { type: Boolean, default: false },
  productionCapacity: { type: String, default: '' },
  floorSpace: { type: String, default: '' },
  utilities: {
    electricity: { type: Boolean, default: true },
    water: { type: Boolean, default: true },
    gas: { type: Boolean, default: false },
  },
  equipmentCondition: { type: String, enum: ['new', 'used', 'both'], default: 'new' },
  expectedOpeningDate: { type: String, default: '' },
  businessExperience: { type: String, default: '' },
  targetCustomers: { type: String, default: '' },
  additionalRequirements: { type: String, default: '' },
  status: {
    type: String,
    enum: ['draft', 'queued', 'processing', 'completed', 'failed'],
    default: 'draft',
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  progressMessage: { type: String, default: '' },
  assumptions: { type: Schema.Types.Mixed, default: {} },
  feasibilityReport: { type: Schema.Types.ObjectId, ref: 'FeasibilityReport', default: null },
  budgetBreakdown: { type: Schema.Types.Mixed, default: null },
  aiReport: { type: Schema.Types.Mixed, default: null },
  errorMessage: { type: String, default: '' },
  retryCount: { type: Number, default: 0 },
}, { timestamps: true });

businessAnalysisSchema.index({ userId: 1, createdAt: -1 });
businessAnalysisSchema.index({ status: 1 });

export const BusinessAnalysis = mongoose.model<IBusinessAnalysis>('BusinessAnalysis', businessAnalysisSchema);
