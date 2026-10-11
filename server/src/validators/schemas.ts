import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});

export const createAnalysisSchema = z.object({
  businessIdea: z.string().min(10).max(2000),
  industry: z.string().min(1).max(100),
  location: z.object({
    country: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    city: z.string().min(1).max(100),
  }),
  budget: z.number().positive().max(100000000000),
  budgetCurrency: z.string().default('INR'),
  businessScale: z.string().default('small'),
  fundingSource: z.string().max(200).default(''),
  landAvailable: z.boolean().default(false),
  budgetIncludesLand: z.boolean().default(false),
  productionCapacity: z.string().max(500).default(''),
  floorSpace: z.string().max(200).default(''),
  utilities: z.object({
    electricity: z.boolean().default(true),
    water: z.boolean().default(true),
    gas: z.boolean().default(false),
  }).default({}),
  equipmentCondition: z.enum(['new', 'used', 'both']).default('new'),
  expectedOpeningDate: z.string().max(100).default(''),
  businessExperience: z.string().max(500).default(''),
  targetCustomers: z.string().max(500).default(''),
  additionalRequirements: z.string().max(1000).default(''),
});

export const updateAssumptionsSchema = z.object({
  assumptions: z.record(z.any()),
});

export const updateEquipmentSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number().min(0).optional(),
    estimatedUnitCost: z.number().min(0).optional(),
    installationCost: z.number().min(0).optional(),
    selectionStatus: z.enum(['selected', 'alternative', 'removed']).optional(),
  })),
});

export const updateComplianceTaskSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'not_applicable']).optional(),
  notes: z.string().max(1000).optional(),
  dueDate: z.string().optional(),
});

export const updateSetupTaskSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'skipped']).optional(),
  notes: z.string().max(1000).optional(),
});

export const adminEquipmentSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  industry: z.array(z.string()),
  description: z.string().max(2000).default(''),
  specifications: z.record(z.string()).default({}),
  capacity: z.string().max(200).default(''),
  powerRequirement: z.string().max(200).default(''),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().default('INR'),
  }),
  priceSource: z.string().max(500).default(''),
  maintenanceNotes: z.string().max(1000).default(''),
  installationNotes: z.string().max(1000).default(''),
  verificationStatus: z.enum(['verified', 'unverified', 'estimate']).default('estimate'),
});

export const adminRegulatoryRuleSchema = z.object({
  name: z.string().min(1).max(300),
  description: z.string().max(2000).default(''),
  industry: z.array(z.string()),
  activity: z.array(z.string()).default([]),
  jurisdiction: z.enum(['central', 'state', 'local']),
  applicabilityConditions: z.array(z.string()).default([]),
  exemptions: z.array(z.string()).default([]),
  authority: z.string().max(300).default(''),
  officialUrl: z.string().max(500).default(''),
  informationSource: z.string().max(500).default(''),
  documents: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  fees: z.string().max(500).default(''),
  processingTime: z.string().max(200).default(''),
  renewalRequirements: z.string().max(500).default(''),
  verificationStatus: z.enum(['verified', 'needs_verification', 'unverified']).default('unverified'),
  locationFilter: z.object({
    states: z.array(z.string()).default([]),
    cities: z.array(z.string()).default([]),
  }).default({}),
  scaleConditions: z.string().max(500).default(''),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});
