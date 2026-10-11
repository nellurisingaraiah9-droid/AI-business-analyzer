/**
 * Auto-seed function for in-memory database.
 * Extracted from seed.ts so it can be imported without running the full script.
 */
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Equipment } from './models/Equipment.js';
import { RegulatoryRule } from './models/RegulatoryRule.js';

export async function autoSeed() {
  // Create admin user
  const adminExists = await User.findOne({ email: 'admin@bizpilot.ai' });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('Admin@123456', 12);
    await User.create({ name: 'BizPilot Admin', email: 'admin@bizpilot.ai', passwordHash, role: 'admin' });
  }

  // Create demo user
  const demoExists = await User.findOne({ email: 'demo@bizpilot.ai' });
  if (!demoExists) {
    const passwordHash = await bcrypt.hash('Demo@123456', 12);
    await User.create({ name: 'Demo User', email: 'demo@bizpilot.ai', passwordHash, role: 'user' });
  }

  // Seed equipment
  const eqCount = await Equipment.countDocuments();
  if (eqCount === 0) {
    await Equipment.insertMany([
      {
        name: 'Reverse Osmosis (RO) Plant - 1000 LPH',
        category: 'Water Treatment',
        industry: ['water_treatment', 'packaged_drinking_water', 'manufacturing'],
        description: 'Industrial RO system for water purification, 1000 liters per hour.',
        specifications: { capacity: '1000 LPH', membranes: '4040 x 6', recovery: '60-70%', power: '3 HP' },
        capacity: '1000 LPH',
        powerRequirement: '3 HP / 2.2 kW',
        priceRange: { min: 150000, max: 350000, currency: 'INR' },
        priceSource: 'Industry estimate. Verify with suppliers.',
        verificationStatus: 'estimate',
      },
      {
        name: 'UV Sterilization System',
        category: 'Water Treatment',
        industry: ['water_treatment', 'packaged_drinking_water'],
        description: 'UV water sterilization for killing bacteria and viruses.',
        specifications: { capacity: '1000-2000 LPH', uvDose: '40 mJ/cm²' },
        capacity: '1000-2000 LPH',
        powerRequirement: '80W',
        priceRange: { min: 15000, max: 45000, currency: 'INR' },
        priceSource: 'Industry estimate.',
        verificationStatus: 'estimate',
      },
      {
        name: 'Bottle Filling Machine (20L Jar)',
        category: 'Packaging',
        industry: ['packaged_drinking_water', 'beverage'],
        description: 'Semi-automatic jar filling machine for 20-liter jars.',
        specifications: { capacity: '60-120 jars/hr', type: 'Semi-automatic' },
        capacity: '60-120 jars/hr',
        powerRequirement: '1 HP',
        priceRange: { min: 80000, max: 200000, currency: 'INR' },
        priceSource: 'Industry estimate.',
        verificationStatus: 'estimate',
      },
      {
        name: 'Water Storage Tank (5000L SS)',
        category: 'Storage',
        industry: ['water_treatment', 'packaged_drinking_water', 'food_processing'],
        description: 'Stainless steel food-grade water storage tank.',
        specifications: { material: 'SS 304', capacity: '5000L' },
        capacity: '5000 liters',
        powerRequirement: 'N/A',
        priceRange: { min: 30000, max: 80000, currency: 'INR' },
        priceSource: 'Industry estimate.',
        verificationStatus: 'estimate',
      },
      {
        name: 'Commercial Mixer Grinder',
        category: 'Food Processing',
        industry: ['food_processing', 'restaurant', 'bakery'],
        description: 'Heavy-duty commercial mixer grinder.',
        specifications: { capacity: '5-10 kg', power: '2 HP' },
        capacity: '5-10 kg batch',
        powerRequirement: '2 HP',
        priceRange: { min: 15000, max: 50000, currency: 'INR' },
        priceSource: 'Industry estimate.',
        verificationStatus: 'estimate',
      },
    ]);
  }

  // Seed regulatory rules
  const ruleCount = await RegulatoryRule.countDocuments();
  if (ruleCount === 0) {
    await RegulatoryRule.insertMany([
      {
        name: 'GST Registration',
        description: 'Goods and Services Tax registration. Mandatory for businesses exceeding turnover threshold.',
        industry: ['all'],
        activity: ['selling_goods', 'providing_services'],
        jurisdiction: 'central',
        applicabilityConditions: ['Annual turnover exceeds ₹40 lakh for goods', 'Annual turnover exceeds ₹20 lakh for services'],
        authority: 'CBIC',
        officialUrl: 'https://www.gst.gov.in/',
        documents: ['PAN Card', 'Aadhaar Card', 'Business address proof', 'Bank account details', 'Photographs'],
        fees: 'Free',
        processingTime: '3-7 working days',
        verificationStatus: 'verified',
        sourceReferences: [{ title: 'GST Portal', url: 'https://www.gst.gov.in/' }],
        locationFilter: { states: [], cities: [] },
      },
      {
        name: 'Udyam Registration (MSME)',
        description: 'Free MSME registration for government benefits and schemes.',
        industry: ['all'],
        activity: ['manufacturing', 'services'],
        jurisdiction: 'central',
        applicabilityConditions: ['Micro, Small, or Medium enterprise by investment and turnover criteria'],
        authority: 'Ministry of MSME',
        officialUrl: 'https://udyamregistration.gov.in/',
        documents: ['Aadhaar Card', 'PAN Card'],
        fees: 'Free',
        processingTime: 'Instant to 2-3 days',
        verificationStatus: 'verified',
        sourceReferences: [{ title: 'Udyam Portal', url: 'https://udyamregistration.gov.in/' }],
        locationFilter: { states: [], cities: [] },
      },
      {
        name: 'FSSAI Food License',
        description: 'Required for all food businesses in India.',
        industry: ['food_processing', 'restaurant', 'bakery', 'dairy', 'packaged_drinking_water', 'beverage'],
        activity: ['food_manufacturing', 'food_service'],
        jurisdiction: 'central',
        applicabilityConditions: ['All food business operators'],
        authority: 'FSSAI',
        officialUrl: 'https://foscos.fssai.gov.in/',
        documents: ['Photo ID', 'Business proof', 'Food safety plan'],
        fees: '₹100-7,500/year depending on license type',
        processingTime: '7-60 days',
        verificationStatus: 'verified',
        sourceReferences: [{ title: 'FoSCoS Portal', url: 'https://foscos.fssai.gov.in/' }],
        locationFilter: { states: [], cities: [] },
      },
      {
        name: 'BIS Certification (Packaged Water)',
        description: 'Mandatory ISI mark for packaged drinking water (IS 14543).',
        industry: ['packaged_drinking_water'],
        activity: ['water_bottling'],
        jurisdiction: 'central',
        applicabilityConditions: ['All packaged drinking water manufacturers'],
        authority: 'Bureau of Indian Standards (BIS)',
        officialUrl: 'https://www.bis.gov.in/',
        documents: ['Application form', 'Factory plan', 'Quality control plan', 'FSSAI license'],
        dependencies: ['FSSAI Food License'],
        fees: 'Varies — verify on BIS portal',
        processingTime: '2-6 months',
        verificationStatus: 'verified',
        sourceReferences: [{ title: 'BIS Portal', url: 'https://www.bis.gov.in/' }],
        locationFilter: { states: [], cities: [] },
      },
      {
        name: 'Pollution Control Board Consent',
        description: 'Consent to Establish and Consent to Operate from State Pollution Control Board.',
        industry: ['manufacturing', 'food_processing', 'water_treatment', 'packaged_drinking_water'],
        activity: ['manufacturing', 'industrial_processing'],
        jurisdiction: 'state',
        applicabilityConditions: ['All manufacturing/industrial units'],
        authority: 'State Pollution Control Board',
        officialUrl: '',
        informationSource: 'https://cpcb.nic.in/',
        documents: ['Application form', 'Site plan', 'Process flow', 'Waste management plan'],
        fees: 'Varies by state and category',
        processingTime: '30-120 days',
        verificationStatus: 'needs_verification',
        sourceReferences: [{ title: 'CPCB', url: 'https://cpcb.nic.in/' }],
        locationFilter: { states: [], cities: [] },
      },
    ]);
  }

  console.log('✅ Demo data seeded (admin@bizpilot.ai / Admin@123456, demo@bizpilot.ai / Demo@123456)');
}
