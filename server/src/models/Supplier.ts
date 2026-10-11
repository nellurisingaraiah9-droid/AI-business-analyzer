import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  location: { state: string; city: string; };
  productCategories: string[];
  officialWebsite: string;
  contactInfo: string;
  verificationStatus: 'verified' | 'unverified' | 'lead';
  sourceReferences: { title: string; url: string; }[];
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>({
  name: { type: String, required: true },
  location: {
    state: { type: String, default: '' },
    city: { type: String, default: '' },
  },
  productCategories: [String],
  officialWebsite: { type: String, default: '' },
  contactInfo: { type: String, default: '' },
  verificationStatus: { type: String, enum: ['verified', 'unverified', 'lead'], default: 'lead' },
  sourceReferences: [{
    title: String,
    url: String,
  }],
}, { timestamps: true });

supplierSchema.index({ productCategories: 1 });

export const Supplier = mongoose.model<ISupplier>('Supplier', supplierSchema);
