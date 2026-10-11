import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComplianceTask extends Document {
  userId: Types.ObjectId;
  analysisId: Types.ObjectId;
  regulatoryRuleId: Types.ObjectId;
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
  dueDate: Date | null;
  notes: string;
  verificationStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const complianceTaskSchema = new Schema<IComplianceTask>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  analysisId: { type: Schema.Types.ObjectId, ref: 'BusinessAnalysis', required: true, index: true },
  regulatoryRuleId: { type: Schema.Types.ObjectId, ref: 'RegulatoryRule', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'not_applicable'], default: 'pending' },
  mandatory: { type: String, enum: ['mandatory', 'conditional', 'recommended'], default: 'mandatory' },
  applicabilityReason: { type: String, default: '' },
  authority: { type: String, default: '' },
  officialUrl: { type: String, default: '' },
  documents: [String],
  dependencies: [String],
  fees: { type: String, default: '' },
  processingTime: { type: String, default: '' },
  dueDate: { type: Date, default: null },
  notes: { type: String, default: '' },
  verificationStatus: { type: String, default: 'Needs official verification' },
}, { timestamps: true });

complianceTaskSchema.index({ userId: 1, analysisId: 1 });

export const ComplianceTask = mongoose.model<IComplianceTask>('ComplianceTask', complianceTaskSchema);
