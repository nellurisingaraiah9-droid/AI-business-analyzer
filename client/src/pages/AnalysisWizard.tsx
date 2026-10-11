import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisApi } from '../services/api';
import type { AnalysisFormData } from '../types';
import { ArrowLeft, ArrowRight, Sparkles, Building2, IndianRupee, Settings2, MessageSquare } from 'lucide-react';

const INDUSTRIES = [
  'Manufacturing', 'Food Processing', 'Restaurant / Cafe', 'Packaged Drinking Water',
  'Agriculture / Agribusiness', 'Retail Shop', 'IT / Software', 'Warehousing / Logistics',
  'Healthcare / Pharmacy', 'Education / Coaching', 'Salon / Spa', 'Bakery / Confectionery',
  'Dairy / Dairy Products', 'Textile / Garments', 'Construction', 'Event Management',
  'E-commerce', 'Consulting / Services', 'Automobile / Auto Parts', 'Other',
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh',
  'Andaman & Nicobar', 'Chandigarh', 'Dadra & Nagar Haveli', 'Lakshadweep', 'Puducherry',
];

const STEPS = [
  { title: 'Business Details', icon: Building2, desc: 'What business do you want to start?' },
  { title: 'Financial Info', icon: IndianRupee, desc: 'Budget and funding details' },
  { title: 'Operations', icon: Settings2, desc: 'Capacity and infrastructure' },
  { title: 'Additional Info', icon: MessageSquare, desc: 'Experience and preferences' },
];

const defaultFormData: AnalysisFormData = {
  businessIdea: '',
  industry: '',
  location: { country: 'India', state: '', city: '' },
  budget: 0,
  budgetCurrency: 'INR',
  businessScale: 'small',
  fundingSource: '',
  landAvailable: false,
  budgetIncludesLand: false,
  productionCapacity: '',
  floorSpace: '',
  utilities: { electricity: true, water: true, gas: false },
  equipmentCondition: 'new',
  expectedOpeningDate: '',
  businessExperience: '',
  targetCustomers: '',
  additionalRequirements: '',
};

export default function AnalysisWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<AnalysisFormData>(defaultFormData);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field: string, value: any) => {
    setForm(prev => {
      const keys = field.split('.');
      if (keys.length === 2) {
        return { ...prev, [keys[0]]: { ...(prev as any)[keys[0]], [keys[1]]: value } };
      }
      return { ...prev, [field]: value };
    });
  };

  const validateStep = () => {
    switch (step) {
      case 0:
        if (!form.businessIdea || form.businessIdea.length < 10) return 'Please describe your business idea (at least 10 characters)';
        if (!form.industry) return 'Please select an industry';
        if (!form.location.state) return 'Please select a state';
        if (!form.location.city) return 'Please enter a city';
        return null;
      case 1:
        if (!form.budget || form.budget <= 0) return 'Please enter your budget';
        return null;
      default:
        return null;
    }
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setError('');
    setStep(s => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);

    try {
      const analysis = await analysisApi.create(form);
      // Immediately run the analysis
      await analysisApi.run(analysis._id);
      navigate(`/analysis/${analysis._id}/processing`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create analysis');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Analyze Your Business Idea</h1>
        <p className="text-sm text-text-secondary mt-1">Fill in the details and our AI will generate a comprehensive report.</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div key={i} className="flex items-center flex-1">
              <button
                onClick={() => i < step ? setStep(i) : null}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium w-full transition-all
                  ${isActive ? 'bg-accent/10 text-accent border border-accent/30' 
                    : isDone ? 'bg-success/10 text-success border border-success/20 cursor-pointer' 
                    : 'bg-bg-elevated text-text-secondary border border-transparent'}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline truncate">{s.title}</span>
              </button>
              {i < STEPS.length - 1 && <div className={`w-4 h-px mx-1 ${isDone ? 'bg-success' : 'bg-bg-elevated'}`} />}
            </div>
          );
        })}
      </div>

      {/* Form */}
      <div className="card p-6">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Step 0: Business Details */}
        {step === 0 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <label htmlFor="business-idea" className="block text-sm font-medium text-text-secondary mb-1.5">Business Idea *</label>
              <textarea
                id="business-idea"
                value={form.businessIdea}
                onChange={e => update('businessIdea', e.target.value)}
                placeholder="Describe your business idea in detail. E.g., 'I want to start a packaged drinking water manufacturing plant in Guntur, Andhra Pradesh, India, with a budget of ₹20 lakh.'"
                rows={4}
                className="w-full resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-text-secondary mt-1">{form.businessIdea.length}/2000</p>
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-text-secondary mb-1.5">Industry *</label>
              <select id="industry" value={form.industry} onChange={e => update('industry', e.target.value)} className="w-full">
                <option value="">Select industry</option>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-text-secondary mb-1.5">State *</label>
                <select id="state" value={form.location.state} onChange={e => update('location.state', e.target.value)} className="w-full">
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-text-secondary mb-1.5">City / District *</label>
                <input
                  id="city"
                  type="text"
                  value={form.location.city}
                  onChange={e => update('location.city', e.target.value)}
                  placeholder="E.g., Guntur"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="scale" className="block text-sm font-medium text-text-secondary mb-1.5">Business Scale</label>
              <select id="scale" value={form.businessScale} onChange={e => update('businessScale', e.target.value)} className="w-full">
                <option value="micro">Micro (Home-based / Very small)</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 1: Financial */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-text-secondary mb-1.5">Total Available Budget (₹ INR) *</label>
              <input
                id="budget"
                type="number"
                value={form.budget || ''}
                onChange={e => update('budget', parseFloat(e.target.value) || 0)}
                placeholder="E.g., 2000000 for ₹20 lakh"
                className="w-full"
                min={0}
              />
              {form.budget > 0 && (
                <p className="text-xs text-accent mt-1">
                  ₹{form.budget.toLocaleString('en-IN')}
                  {form.budget >= 10000000 ? ` (₹${(form.budget / 10000000).toFixed(2)} Crore)` 
                    : form.budget >= 100000 ? ` (₹${(form.budget / 100000).toFixed(2)} Lakh)` : ''}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="funding" className="block text-sm font-medium text-text-secondary mb-1.5">Funding Source (Optional)</label>
              <select id="funding" value={form.fundingSource} onChange={e => update('fundingSource', e.target.value)} className="w-full">
                <option value="">Select source</option>
                <option value="self">Self-funded / Savings</option>
                <option value="bank_loan">Bank Loan</option>
                <option value="investor">Investor / Partner</option>
                <option value="government_scheme">Government Scheme</option>
                <option value="mixed">Mixed Sources</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 rounded-lg bg-bg-elevated border border-border-subtle cursor-pointer hover:border-accent/30 transition-colors">
                <input
                  type="checkbox"
                  checked={form.landAvailable}
                  onChange={e => update('landAvailable', e.target.checked)}
                  className="w-4 h-4 accent-accent"
                />
                <div>
                  <p className="text-sm text-text-primary font-medium">Land / Premises Available</p>
                  <p className="text-xs text-text-secondary">I already have a location</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-bg-elevated border border-border-subtle cursor-pointer hover:border-accent/30 transition-colors">
                <input
                  type="checkbox"
                  checked={form.budgetIncludesLand}
                  onChange={e => update('budgetIncludesLand', e.target.checked)}
                  className="w-4 h-4 accent-accent"
                />
                <div>
                  <p className="text-sm text-text-primary font-medium">Budget Includes Land</p>
                  <p className="text-xs text-text-secondary">Land/building cost is in the budget</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Operations */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-text-secondary mb-1.5">Expected Production Capacity / Scale</label>
              <input
                id="capacity"
                type="text"
                value={form.productionCapacity}
                onChange={e => update('productionCapacity', e.target.value)}
                placeholder="E.g., 1000 liters per hour, 100 covers per day"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="floor-space" className="block text-sm font-medium text-text-secondary mb-1.5">Available Floor Space</label>
              <input
                id="floor-space"
                type="text"
                value={form.floorSpace}
                onChange={e => update('floorSpace', e.target.value)}
                placeholder="E.g., 2000 sq ft"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Available Utilities</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'electricity', label: 'Electricity' },
                  { key: 'water', label: 'Water Supply' },
                  { key: 'gas', label: 'Gas Supply' },
                ].map(u => (
                  <label key={u.key} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-elevated border border-border-subtle cursor-pointer hover:border-accent/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={(form.utilities as any)[u.key]}
                      onChange={e => update(`utilities.${u.key}`, e.target.checked)}
                      className="w-4 h-4 accent-accent"
                    />
                    <span className="text-sm text-text-primary">{u.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="equip-condition" className="block text-sm font-medium text-text-secondary mb-1.5">Equipment Condition</label>
              <select id="equip-condition" value={form.equipmentCondition} onChange={e => update('equipmentCondition', e.target.value)} className="w-full">
                <option value="new">New Equipment Only</option>
                <option value="used">Used / Refurbished</option>
                <option value="both">Both New and Used</option>
              </select>
            </div>

            <div>
              <label htmlFor="opening-date" className="block text-sm font-medium text-text-secondary mb-1.5">Expected Opening Date (Optional)</label>
              <input
                id="opening-date"
                type="text"
                value={form.expectedOpeningDate}
                onChange={e => update('expectedOpeningDate', e.target.value)}
                placeholder="E.g., Q1 2025, March 2025"
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Step 3: Additional Info */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-text-secondary mb-1.5">Business Experience (Optional)</label>
              <textarea
                id="experience"
                value={form.businessExperience}
                onChange={e => update('businessExperience', e.target.value)}
                placeholder="Describe your relevant business or industry experience"
                rows={3}
                className="w-full resize-none"
              />
            </div>

            <div>
              <label htmlFor="target" className="block text-sm font-medium text-text-secondary mb-1.5">Target Customers (Optional)</label>
              <textarea
                id="target"
                value={form.targetCustomers}
                onChange={e => update('targetCustomers', e.target.value)}
                placeholder="Who are your target customers? E.g., households, offices, hotels, hospitals"
                rows={2}
                className="w-full resize-none"
              />
            </div>

            <div>
              <label htmlFor="additional" className="block text-sm font-medium text-text-secondary mb-1.5">Additional Requirements (Optional)</label>
              <textarea
                id="additional"
                value={form.additionalRequirements}
                onChange={e => update('additionalRequirements', e.target.value)}
                placeholder="Any specific requirements, constraints, or preferences"
                rows={3}
                className="w-full resize-none"
              />
            </div>

            {/* Review Summary */}
            <div className="card-elevated p-4 mt-4">
              <h3 className="text-sm font-semibold text-accent mb-3">Review Summary</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-text-secondary text-xs">Industry</p>
                  <p className="text-text-primary font-medium">{form.industry || '—'}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs">Location</p>
                  <p className="text-text-primary font-medium">{form.location.city}, {form.location.state}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs">Budget</p>
                  <p className="text-accent font-medium">₹{form.budget.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs">Scale</p>
                  <p className="text-text-primary font-medium capitalize">{form.businessScale}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-text-secondary text-xs">Business Idea</p>
                <p className="text-text-primary text-sm mt-0.5">{form.businessIdea}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={prevStep}
          disabled={step === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-30"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button onClick={nextStep} className="btn-primary flex items-center gap-2">
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary flex items-center gap-2"
          >
            {submitting ? (
              <>Analyzing... <Sparkles className="w-4 h-4 animate-spin" /></>
            ) : (
              <>Analyze My Business <Sparkles className="w-4 h-4" /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
