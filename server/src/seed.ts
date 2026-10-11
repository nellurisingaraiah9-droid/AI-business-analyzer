/**
 * Database Seed Script
 * Seeds demo equipment, regulatory rules, and an admin user for development testing.
 * All demo data is clearly labeled.
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Equipment } from './models/Equipment.js';
import { RegulatoryRule } from './models/RegulatoryRule.js';
import { Supplier } from './models/Supplier.js';
import { validateEnv } from './utils/validateEnv.js';

const env = validateEnv();

async function seed() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Create admin user
  const adminExists = await User.findOne({ email: 'admin@bizpilot.ai' });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('Admin@123456', 12);
    await User.create({
      name: 'BizPilot Admin',
      email: 'admin@bizpilot.ai',
      passwordHash,
      role: 'admin',
    });
    console.log('✅ Admin user created (admin@bizpilot.ai / Admin@123456)');
  }

  // Create demo user
  const demoExists = await User.findOne({ email: 'demo@bizpilot.ai' });
  if (!demoExists) {
    const passwordHash = await bcrypt.hash('Demo@123456', 12);
    await User.create({
      name: 'Demo User',
      email: 'demo@bizpilot.ai',
      passwordHash,
      role: 'user',
    });
    console.log('✅ Demo user created (demo@bizpilot.ai / Demo@123456)');
  }

  // Seed equipment catalog for packaged drinking water plant
  const existingEquipment = await Equipment.countDocuments();
  if (existingEquipment === 0) {
    const equipmentData = [
      {
        name: 'Reverse Osmosis (RO) Plant - 1000 LPH',
        category: 'Water Treatment',
        industry: ['water_treatment', 'packaged_drinking_water', 'manufacturing'],
        description: 'Industrial RO system for water purification with 1000 liters per hour capacity. Includes pre-filters, RO membranes, and control panel.',
        specifications: { capacity: '1000 LPH', membranes: '4040 x 6', recovery: '60-70%', power: '3 HP' },
        capacity: '1000 LPH',
        powerRequirement: '3 HP / 2.2 kW',
        priceRange: { min: 150000, max: 350000, currency: 'INR' },
        priceSource: 'Industry estimate based on IndiaMART listings (2024). Verify with suppliers.',
        verificationStatus: 'estimate' as const,
      },
      {
        name: 'UV Sterilization System',
        category: 'Water Treatment',
        industry: ['water_treatment', 'packaged_drinking_water'],
        description: 'Ultraviolet water sterilization system for killing bacteria and viruses.',
        specifications: { capacity: '1000-2000 LPH', uvDose: '40 mJ/cm²', power: '80W' },
        capacity: '1000-2000 LPH',
        powerRequirement: '80W',
        priceRange: { min: 15000, max: 45000, currency: 'INR' },
        priceSource: 'Industry estimate. Verify with suppliers.',
        verificationStatus: 'estimate' as const,
      },
      {
        name: 'Ozonator',
        category: 'Water Treatment',
        industry: ['water_treatment', 'packaged_drinking_water'],
        description: 'Ozone generator for water disinfection and oxidation.',
        specifications: { output: '5-10 g/hr', power: '200W' },
        capacity: 'Suitable for 1000-2000 LPH plant',
        powerRequirement: '200W',
        priceRange: { min: 25000, max: 80000, currency: 'INR' },
        priceSource: 'Industry estimate. Verify with suppliers.',
        verificationStatus: 'estimate' as const,
      },
      {
        name: 'Bottle Filling Machine (20L Jar)',
        category: 'Packaging',
        industry: ['packaged_drinking_water', 'beverage'],
        description: 'Semi-automatic jar/bottle filling machine for 20-liter jars.',
        specifications: { capacity: '60-120 jars/hr', type: 'Semi-automatic' },
        capacity: '60-120 jars per hour',
        powerRequirement: '1 HP',
        priceRange: { min: 80000, max: 200000, currency: 'INR' },
        priceSource: 'Industry estimate. Verify with suppliers.',
        verificationStatus: 'estimate' as const,
      },
      {
        name: 'Bottle Filling Machine (1L Pet Bottle)',
        category: 'Packaging',
        industry: ['packaged_drinking_water', 'beverage'],
        description: 'Automatic rinser-filler-capper for 1-liter PET bottles.',
        specifications: { capacity: '20-40 BPM', type: 'Automatic' },
        capacity: '20-40 bottles per minute',
        powerRequirement: '3 HP',
        priceRange: { min: 250000, max: 600000, currency: 'INR' },
        priceSource: 'Industry estimate. Verify with suppliers.',
        verificationStatus: 'estimate' as const,
      },
      {
        name: 'Water Storage Tank (5000L SS)',
        category: 'Storage',
        industry: ['water_treatment', 'packaged_drinking_water', 'food_processing'],
        description: 'Stainless steel water storage tank, food-grade, 5000 liters capacity.',
        specifications: { material: 'SS 304', capacity: '5000L', grade: 'Food grade' },
        capacity: '5000 liters',
        powerRequirement: 'N/A',
        priceRange: { min: 30000, max: 80000, currency: 'INR' },
        priceSource: 'Industry estimate. Verify with suppliers.',
        verificationStatus: 'estimate' as const,
      },
      {
        name: 'Shrink Wrapping Machine',
        category: 'Packaging',
        industry: ['packaged_drinking_water', 'beverage', 'food_processing', 'manufacturing'],
        description: 'Semi-automatic shrink wrapping machine for packaging bottles in packs.',
        specifications: { type: 'Semi-automatic', speed: '5-10 packs/min' },
        capacity: '5-10 packs per minute',
        powerRequirement: '3 kW',
        priceRange: { min: 40000, max: 120000, currency: 'INR' },
        priceSource: 'Industry estimate. Verify with suppliers.',
        verificationStatus: 'estimate' as const,
      },
      {
        name: 'Label Printing Machine',
        category: 'Packaging',
        industry: ['packaged_drinking_water', 'beverage', 'food_processing'],
        description: 'Sticker/label printing and application machine for bottles.',
        specifications: { speed: '40-60 labels/min', type: 'Semi-automatic' },
        capacity: '40-60 labels per minute',
        powerRequirement: '0.5 HP',
        priceRange: { min: 35000, max: 100000, currency: 'INR' },
        priceSource: 'Industry estimate. Verify with suppliers.',
        verificationStatus: 'estimate' as const,
      },
      // General equipment
      {
        name: 'Commercial Mixer Grinder',
        category: 'Food Processing',
        industry: ['food_processing', 'restaurant', 'bakery'],
        description: 'Heavy-duty commercial mixer grinder for food processing operations.',
        specifications: { capacity: '5-10 kg', power: '2 HP', type: 'Heavy duty' },
        capacity: '5-10 kg batch',
        powerRequirement: '2 HP',
        priceRange: { min: 15000, max: 50000, currency: 'INR' },
        priceSource: 'Industry estimate.',
        verificationStatus: 'estimate' as const,
      },
      {
        name: 'Walk-in Cold Room',
        category: 'Storage',
        industry: ['food_processing', 'restaurant', 'dairy', 'agriculture'],
        description: 'Walk-in cold storage room for perishable goods.',
        specifications: { size: '10x10x8 ft', temperature: '0-8°C', compressor: '3 HP' },
        capacity: '2-3 MT storage',
        powerRequirement: '3 HP',
        priceRange: { min: 200000, max: 500000, currency: 'INR' },
        priceSource: 'Industry estimate.',
        verificationStatus: 'estimate' as const,
      },
    ];

    await Equipment.insertMany(equipmentData);
    console.log(`✅ Seeded ${equipmentData.length} equipment items`);
  }

  // Seed regulatory rules
  const existingRules = await RegulatoryRule.countDocuments();
  if (existingRules === 0) {
    const rulesData = [
      {
        name: 'GST Registration',
        description: 'Goods and Services Tax registration is mandatory for businesses with annual turnover exceeding ₹40 lakh (₹20 lakh for service providers and special category states).',
        industry: ['all'],
        activity: ['selling_goods', 'providing_services'],
        jurisdiction: 'central' as const,
        applicabilityConditions: ['Annual turnover exceeds ₹40 lakh for goods', 'Annual turnover exceeds ₹20 lakh for services', 'Mandatory for e-commerce sellers regardless of turnover'],
        exemptions: ['Businesses below threshold turnover (unless inter-state supply)'],
        authority: 'Central Board of Indirect Taxes and Customs (CBIC)',
        officialUrl: 'https://www.gst.gov.in/',
        informationSource: 'https://www.gst.gov.in/',
        documents: ['PAN Card', 'Aadhaar Card', 'Proof of business registration', 'Address proof of business premises', 'Bank account statement/cancelled cheque', 'Digital signature', 'Photographs of proprietor/partners/directors'],
        dependencies: ['PAN Card'],
        fees: 'Free — no registration fees',
        processingTime: '3-7 working days',
        renewalRequirements: 'Annual return filing (GSTR-9), monthly/quarterly returns',
        verificationStatus: 'verified' as const,
        sourceReferences: [{ title: 'GST Portal', url: 'https://www.gst.gov.in/' }],
        locationFilter: { states: [], cities: [] },
        scaleConditions: 'Based on turnover threshold',
      },
      {
        name: 'Udyam Registration (MSME)',
        description: 'Free online registration for micro, small, and medium enterprises. Provides access to government schemes, subsidies, and priority sector lending benefits.',
        industry: ['all'],
        activity: ['manufacturing', 'services'],
        jurisdiction: 'central' as const,
        applicabilityConditions: ['Micro enterprise: Investment up to ₹1 Cr, Turnover up to ₹5 Cr', 'Small enterprise: Investment up to ₹10 Cr, Turnover up to ₹50 Cr', 'Medium enterprise: Investment up to ₹50 Cr, Turnover up to ₹250 Cr'],
        exemptions: [],
        authority: 'Ministry of MSME',
        officialUrl: 'https://udyamregistration.gov.in/',
        informationSource: 'https://udyamregistration.gov.in/',
        documents: ['Aadhaar Card of proprietor/managing partner/director', 'PAN Card', 'GSTIN (if registered)'],
        dependencies: ['Aadhaar Card'],
        fees: 'Free — no registration fees',
        processingTime: 'Instant to 2-3 working days',
        renewalRequirements: 'No renewal required — update if details change',
        verificationStatus: 'verified' as const,
        sourceReferences: [{ title: 'Udyam Registration Portal', url: 'https://udyamregistration.gov.in/' }],
        locationFilter: { states: [], cities: [] },
        scaleConditions: 'Based on investment and turnover limits',
      },
      {
        name: 'FSSAI Food License/Registration',
        description: 'Food Safety and Standards Authority of India license or registration. Required for all food businesses in India.',
        industry: ['food_processing', 'restaurant', 'bakery', 'dairy', 'packaged_drinking_water', 'beverage'],
        activity: ['food_manufacturing', 'food_processing', 'food_service', 'food_storage', 'food_distribution'],
        jurisdiction: 'central' as const,
        applicabilityConditions: ['Basic registration: Turnover up to ₹12 lakh/year', 'State license: Turnover ₹12 lakh to ₹20 crore/year', 'Central license: Turnover above ₹20 crore/year or operating in multiple states'],
        exemptions: [],
        authority: 'Food Safety and Standards Authority of India (FSSAI)',
        officialUrl: 'https://foscos.fssai.gov.in/',
        informationSource: 'https://foscos.fssai.gov.in/',
        documents: ['Form A/B', 'Photo ID of FBO', 'Proof of possession of premises', 'Partnership deed/MOA/AOA', 'List of food items', 'Food safety management plan', 'NOC from municipality/local body', 'Water test report'],
        dependencies: [],
        fees: 'Basic: ₹100/year, State: ₹2,000-5,000/year, Central: ₹7,500/year — verify current fees',
        processingTime: '7-60 days depending on license type',
        renewalRequirements: 'Annual renewal required',
        verificationStatus: 'verified' as const,
        sourceReferences: [{ title: 'FoSCoS Portal', url: 'https://foscos.fssai.gov.in/' }],
        locationFilter: { states: [], cities: [] },
        scaleConditions: 'License type depends on turnover',
      },
      {
        name: 'BIS Certification (ISI Mark) for Packaged Drinking Water',
        description: 'Bureau of Indian Standards certification is mandatory for packaged drinking water (IS 14543) and mineral water (IS 13428).',
        industry: ['packaged_drinking_water'],
        activity: ['water_bottling', 'water_packaging'],
        jurisdiction: 'central' as const,
        applicabilityConditions: ['Mandatory for all packaged drinking water manufacturers', 'Must comply with IS 14543:2016 for packaged drinking water', 'Must comply with IS 13428:2005 for packaged natural mineral water'],
        exemptions: [],
        authority: 'Bureau of Indian Standards (BIS)',
        officialUrl: 'https://www.bis.gov.in/',
        informationSource: 'https://www.bis.gov.in/',
        documents: ['Application form', 'Factory plan', 'Manufacturing process flow', 'List of equipment', 'Quality control plan', 'Water source details', 'Water test reports', 'FSSAI license'],
        dependencies: ['FSSAI Food License/Registration'],
        fees: 'Application fee + marking fee — varies by scheme. Verify on BIS portal.',
        processingTime: '2-6 months (includes factory inspection)',
        renewalRequirements: 'Annual surveillance and renewal',
        verificationStatus: 'verified' as const,
        sourceReferences: [{ title: 'BIS Portal', url: 'https://www.bis.gov.in/' }],
        locationFilter: { states: [], cities: [] },
        scaleConditions: 'Mandatory regardless of scale for packaged water',
      },
      {
        name: 'Consent to Establish / Operate (Pollution Control)',
        description: 'Consent from State Pollution Control Board under the Water (Prevention and Control of Pollution) Act and the Air (Prevention and Control of Pollution) Act.',
        industry: ['manufacturing', 'food_processing', 'water_treatment', 'packaged_drinking_water'],
        activity: ['manufacturing', 'industrial_processing'],
        jurisdiction: 'state' as const,
        applicabilityConditions: ['Required for all manufacturing and industrial units', 'Consent to Establish (CTE) before setting up', 'Consent to Operate (CTO) before commencing production'],
        exemptions: ['Small service businesses without industrial operations may be exempt — verify with SPCB'],
        authority: 'State Pollution Control Board (SPCB)',
        officialUrl: '',
        informationSource: 'https://cpcb.nic.in/',
        documents: ['Application form', 'Site plan', 'Process flow diagram', 'Environmental management plan', 'Waste management plan', 'Water and power supply details', 'NOC from local body'],
        dependencies: [],
        fees: 'Varies by state and category of industry — verify with SPCB',
        processingTime: '30-120 days — varies by state',
        renewalRequirements: 'Periodic renewal required (typically every 5 years)',
        verificationStatus: 'needs_verification' as const,
        sourceReferences: [{ title: 'CPCB', url: 'https://cpcb.nic.in/' }],
        locationFilter: { states: [], cities: [] },
        scaleConditions: 'Depends on industry category (Red/Orange/Green/White)',
      },
      {
        name: 'Trade License (Municipal Corporation)',
        description: 'License from the local municipal body to operate a business within their jurisdiction.',
        industry: ['all'],
        activity: ['all'],
        jurisdiction: 'local' as const,
        applicabilityConditions: ['Required for businesses operating within municipal limits', 'Requirements vary by municipality'],
        exemptions: ['Some home-based businesses may be exempt — verify with local authority'],
        authority: 'Local Municipal Corporation / Municipality',
        officialUrl: '',
        informationSource: '',
        documents: ['Application form', 'ID proof', 'Address proof', 'Rent agreement', 'NOC from landlord', 'Property tax receipt'],
        dependencies: [],
        fees: 'Varies by municipality and business type',
        processingTime: '7-30 days — varies by municipality',
        renewalRequirements: 'Annual renewal',
        verificationStatus: 'needs_verification' as const,
        sourceReferences: [],
        locationFilter: { states: [], cities: [] },
        scaleConditions: '',
      },
      {
        name: 'Shop and Establishment Act Registration',
        description: 'Registration under the respective state\'s Shops and Establishments Act. Regulates working hours, leave, wages, and working conditions.',
        industry: ['all'],
        activity: ['retail', 'services', 'commercial_operations'],
        jurisdiction: 'state' as const,
        applicabilityConditions: ['Required for all shops and commercial establishments', 'Must register within 30 days of commencing business (in most states)'],
        exemptions: ['Manufacturing units registered under the Factories Act may be exempt'],
        authority: 'State Labour Department',
        officialUrl: '',
        informationSource: '',
        documents: ['Application form', 'Address proof of establishment', 'ID proof of employer', 'Details of employees'],
        dependencies: [],
        fees: 'Nominal fee — varies by state',
        processingTime: '7-15 working days',
        renewalRequirements: 'Varies by state — some require annual renewal',
        verificationStatus: 'needs_verification' as const,
        sourceReferences: [],
        locationFilter: { states: [], cities: [] },
        scaleConditions: '',
      },
      {
        name: 'Fire Safety NOC',
        description: 'No Objection Certificate from the fire department. Required for commercial and industrial premises.',
        industry: ['all'],
        activity: ['commercial_operations', 'manufacturing', 'food_service'],
        jurisdiction: 'local' as const,
        applicabilityConditions: ['Required for buildings above a certain height (varies by state)', 'Required for all manufacturing/industrial units', 'Required for restaurants, hotels, and public gathering places'],
        exemptions: ['Small establishments below threshold area may be exempt — verify locally'],
        authority: 'State/District Fire Services Department',
        officialUrl: '',
        informationSource: '',
        documents: ['Building plan', 'Fire safety equipment details', 'Electrical safety certificate', 'Emergency exit plan'],
        dependencies: [],
        fees: 'Varies by state and building category',
        processingTime: '15-45 days',
        renewalRequirements: 'Annual renewal in most states',
        verificationStatus: 'needs_verification' as const,
        sourceReferences: [],
        locationFilter: { states: [], cities: [] },
        scaleConditions: 'Based on building height, area, and occupancy type',
      },
    ];

    await RegulatoryRule.insertMany(rulesData);
    console.log(`✅ Seeded ${rulesData.length} regulatory rules`);
  }

  // Seed sample suppliers
  const existingSuppliers = await Supplier.countDocuments();
  if (existingSuppliers === 0) {
    const suppliersData = [
      {
        name: 'Demo Water Equipment Supplier (Unverified Lead)',
        location: { state: 'Andhra Pradesh', city: 'Hyderabad' },
        productCategories: ['water_treatment', 'ro_systems'],
        officialWebsite: '',
        contactInfo: 'This is a demo entry — obtain actual supplier contacts through industry directories or trade portals',
        verificationStatus: 'lead' as const,
        sourceReferences: [{ title: 'Demo data', url: '' }],
      },
    ];

    await Supplier.insertMany(suppliersData);
    console.log(`✅ Seeded ${suppliersData.length} sample suppliers`);
  }

  console.log('\n🎉 Database seeding complete!');
  console.log('  Admin: admin@bizpilot.ai / Admin@123456');
  console.log('  Demo:  demo@bizpilot.ai / Demo@123456');
  
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
