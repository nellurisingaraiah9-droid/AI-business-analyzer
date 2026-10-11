import mongoose, { Schema, Document } from 'mongoose';

export interface IRegulatoryRule extends Document {
  name: string;
  description: string;
  industry: string[];
  activity: string[];
  jurisdiction: 'central' | 'state' | 'local';
  applicabilityConditions: string[];
  exemptions: string[];
  authority: string;
  officialUrl: string;
  informationSource: string;
  documents: string[];
  dependencies: string[];
  fees: string;
  processingTime: string;
  renewalRequirements: string;
  effectiveDate: string;
  lastVerifiedAt: string;
  verificationStatus: 'verified' | 'needs_verification' | 'unverified';
  sourceReferences: { title: string; url: string; }[];
  locationFilter: {
    states: string[];
    cities: string[];
  };
  scaleConditions: string;
  createdAt: Date;
  updatedAt: Date;
}

const regulatoryRuleSchema = new Schema<IRegulatoryRule>({
  name: { type: String, required: true, index: true },
  description: { type: String, default: '' },
  industry: [{ type: String, index: true }],
  activity: [String],
  jurisdiction: { type: String, enum: ['central', 'state', 'local'], required: true },
  applicabilityConditions: [String],
  exemptions: [String],
  authority: { type: String, default: '' },
  officialUrl: { type: String, default: '' },
  informationSource: { type: String, default: '' },
  documents: [String],
  dependencies: [String],
  fees: { type: String, default: '' },
  processingTime: { type: String, default: '' },
  renewalRequirements: { type: String, default: '' },
  effectiveDate: { type: String, default: '' },
  lastVerifiedAt: { type: String, default: '' },
  verificationStatus: { type: String, enum: ['verified', 'needs_verification', 'unverified'], default: 'unverified' },
  sourceReferences: [{
    title: String,
    url: String,
  }],
  locationFilter: {
    states: [String],
    cities: [String],
  },
  scaleConditions: { type: String, default: '' },
}, { timestamps: true });

regulatoryRuleSchema.index({ industry: 1, jurisdiction: 1 });
regulatoryRuleSchema.index({ name: 'text', description: 'text' });

export const RegulatoryRule = mongoose.model<IRegulatoryRule>('RegulatoryRule', regulatoryRuleSchema);
