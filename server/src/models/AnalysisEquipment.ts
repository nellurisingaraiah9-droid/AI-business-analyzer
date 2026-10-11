import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAnalysisEquipment extends Document {
  analysisId: Types.ObjectId;
  equipmentId: Types.ObjectId | null;
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
  lastVerifiedAt: string;
  notes: string;
  selectionStatus: 'selected' | 'alternative' | 'removed';
  createdAt: Date;
  updatedAt: Date;
}

const analysisEquipmentSchema = new Schema<IAnalysisEquipment>({
  analysisId: { type: Schema.Types.ObjectId, ref: 'BusinessAnalysis', required: true, index: true },
  equipmentId: { type: Schema.Types.ObjectId, ref: 'Equipment', default: null },
  name: { type: String, required: true },
  category: { type: String, default: '' },
  isRequired: { type: Boolean, default: true },
  quantity: { type: Number, default: 1, min: 0 },
  estimatedUnitCost: { type: Number, default: 0 },
  installationCost: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  specifications: { type: Schema.Types.Mixed, default: {} },
  capacity: { type: String, default: '' },
  powerRequirement: { type: String, default: '' },
  condition: { type: String, enum: ['new', 'used'], default: 'new' },
  supplierName: { type: String, default: '' },
  supplierLocation: { type: String, default: '' },
  supplierWebsite: { type: String, default: '' },
  priceSource: { type: String, default: '' },
  verificationStatus: { type: String, enum: ['verified', 'estimate', 'unverified'], default: 'estimate' },
  lastVerifiedAt: { type: String, default: '' },
  notes: { type: String, default: '' },
  selectionStatus: { type: String, enum: ['selected', 'alternative', 'removed'], default: 'selected' },
}, { timestamps: true });

analysisEquipmentSchema.index({ analysisId: 1, selectionStatus: 1 });

export const AnalysisEquipment = mongoose.model<IAnalysisEquipment>('AnalysisEquipment', analysisEquipmentSchema);
