import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISetupTask extends Document {
  analysisId: Types.ObjectId;
  title: string;
  description: string;
  phase: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dependencies: string[];
  estimatedDuration: string;
  responsiblePerson: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  documents: string[];
  authorityLink: string;
  order: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const setupTaskSchema = new Schema<ISetupTask>({
  analysisId: { type: Schema.Types.ObjectId, ref: 'BusinessAnalysis', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  phase: { type: String, default: '' },
  priority: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' },
  dependencies: [String],
  estimatedDuration: { type: String, default: '' },
  responsiblePerson: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'skipped'], default: 'pending' },
  documents: [String],
  authorityLink: { type: String, default: '' },
  order: { type: Number, default: 0 },
  notes: { type: String, default: '' },
}, { timestamps: true });

setupTaskSchema.index({ analysisId: 1, order: 1 });

export const SetupTask = mongoose.model<ISetupTask>('SetupTask', setupTaskSchema);
