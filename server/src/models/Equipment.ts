import mongoose, { Schema, Document } from 'mongoose';

export interface IEquipment extends Document {
  name: string;
  category: string;
  industry: string[];
  description: string;
  specifications: Record<string, string>;
  capacity: string;
  powerRequirement: string;
  priceRange: { min: number; max: number; currency: string; };
  priceSource: string;
  maintenanceNotes: string;
  installationNotes: string;
  verificationStatus: 'verified' | 'unverified' | 'estimate';
  lastVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const equipmentSchema = new Schema<IEquipment>({
  name: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  industry: [{ type: String, index: true }],
  description: { type: String, default: '' },
  specifications: { type: Schema.Types.Mixed, default: {} },
  capacity: { type: String, default: '' },
  powerRequirement: { type: String, default: '' },
  priceRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
  },
  priceSource: { type: String, default: '' },
  maintenanceNotes: { type: String, default: '' },
  installationNotes: { type: String, default: '' },
  verificationStatus: { type: String, enum: ['verified', 'unverified', 'estimate'], default: 'estimate' },
  lastVerifiedAt: { type: Date, default: null },
}, { timestamps: true });

equipmentSchema.index({ name: 'text', description: 'text', category: 'text' });

export const Equipment = mongoose.model<IEquipment>('Equipment', equipmentSchema);
