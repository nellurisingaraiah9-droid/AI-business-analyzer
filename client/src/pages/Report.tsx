import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { analysisApi, complianceApi, setupTaskApi } from '../services/api';
import type { FullReport } from '../types';
import { useToast } from '../components/Toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  BarChart3, Package, Shield, Map, Target, IndianRupee,
  CheckCircle2, Clock, AlertTriangle, ExternalLink, ChevronDown, ChevronRight,
  RefreshCw, ArrowLeft, Sparkles, TrendingUp, AlertCircle, Info, Printer, Users
} from 'lucide-react';

const TABS = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'feasibility', label: 'Feasibility', icon: Target },
  { key: 'equipment', label: 'Equipment', icon: Package },
  { key: 'budget', label: 'Budget', icon: IndianRupee },
  { key: 'licenses', label: 'Licenses', icon: Shield },
  { key: 'roadmap', label: 'Roadmap', icon: Map },
];

const CHART_COLORS = ['#D4AF37', '#E6C65A', '#22C55E', '#3B82F6', '#F59E0B', '#EF4444'];
const priorityColors = { critical: 'text-danger', high: 'text-warning', medium: 'text-info', low: 'text-text-secondary' };
const mandatoryBadge = { mandatory: 'badge-danger', conditional: 'badge-warning', recommended: 'badge-info' };

function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function Report() {
  const { id, tab } = useParams<{ id: string; tab?: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reRunning, setReRunning] = useState(false);
  const [activeTab, setActiveTab] = useState(tab || 'overview');
  const [expandedLicense, setExpandedLicense] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadReport();
  }, [id]);

  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  const loadReport = async () => {
    try {
      const data = await analysisApi.report(id!);
      setReport(data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (key: string) => {
    setActiveTab(key);
    navigate(`/analysis/${id}/${key}`, { replace: true });
  };

  const updateComplianceTask = async (taskId: string, status: string) => {
    try {
      await complianceApi.update(taskId, { status });
      loadReport();
    } catch (err) { console.error(err); }
  };

  const updateSetupTask = async (taskId: string, status: string) => {
    try {
      await setupTaskApi.update(taskId, { status });
      loadReport();
    } catch (err) { console.error(err); }
  };

  const handleReRun = async () => {
    if (!id) return;
    setReRunning(true);
    try {
      await analysisApi.refine(id);
      toast.success('Analysis queued for reprocessing');
      navigate(`/analysis/${id}/processing`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to re-run analysis');
      setReRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="skeleton h-8 w-64 mb-4" />
        <div className="skeleton h-4 w-96 mb-8" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <h2 className="text-xl font-bold text-text-primary mb-2">Report Not Found</h2>
        <Link to="/dashboard" className="btn-primary mt-4 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  const { analysis, feasibility, equipment, licenses, roadmap, budgetBreakdown } = report;

  // Budget chart data
  const budgetChartData = budgetBreakdown ? [
    { name: 'Premises', value: budgetBreakdown.premises.subtotal },
    { name: 'Machinery', value: budgetBreakdown.machinery.subtotal },
    { name: 'Infrastructure', value: budgetBreakdown.infrastructure.subtotal },
    { name: 'Regulatory', value: budgetBreakdown.regulatory.subtotal },
    { name: 'Operations', value: budgetBreakdown.operations.subtotal },
    { name: 'Financial', value: budgetBreakdown.financial.subtotal },
  ].filter(d => d.value > 0) : [];

  const revenueChartData = feasibility ? [
    { name: 'Conservative', monthly: feasibility.revenueScenarios.conservative.monthlyRevenue, annual: feasibility.revenueScenarios.conservative.annualRevenue },
    { name: 'Base', monthly: feasibility.revenueScenarios.base.monthlyRevenue, annual: feasibility.revenueScenarios.base.annualRevenue },
    { name: 'Optimistic', monthly: feasibility.revenueScenarios.optimistic.monthlyRevenue, annual: feasibility.revenueScenarios.optimistic.annualRevenue },
  ] : [];

  const completedRoadmap = roadmap.filter(t => t.status === 'completed').length;
  const totalEquipmentCost = equipment.filter(e => e.selectionStatus === 'selected').reduce((s, e) => s + e.totalCost, 0);

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <button onClick={() => navigate('/dashboard')} className="text-text-secondary hover:text-text-primary text-sm flex items-center gap-1 mb-2 no-print cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </button>
          <h1 className="text-xl font-bold text-text-primary">{analysis.businessIdea.slice(0, 90)}{analysis.businessIdea.length > 90 ? '...' : ''}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-text-secondary">
            <span>{analysis.industry}</span>
            <span>•</span>
            <span>{analysis.location.city}, {analysis.location.state}</span>
            <span>•</span>
            <span className="text-accent font-medium">{formatINR(analysis.budget)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto no-print">
          <button
            onClick={() => window.print()}
            className="btn-secondary flex items-center gap-2 text-xs py-2 px-3.5"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4 text-text-secondary" />
            Print / PDF
          </button>
          <button
            onClick={handleReRun}
            disabled={reRunning}
            className="btn-primary flex items-center gap-2 text-xs py-2 px-3.5"
            title="Re-run Analysis Pipeline"
          >
            <RefreshCw className={`w-4 h-4 ${reRunning ? 'animate-spin' : ''}`} />
            {reRunning ? 'Queueing...' : 'Re-run Analysis'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-6 border-b border-border-subtle no-print">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap transition-all border-b-2 -mb-[2px]
                ${activeTab === t.key
                  ? 'text-accent border-accent bg-accent/5'
                  : 'text-text-secondary border-transparent hover:text-text-primary hover:border-border-subtle'
                }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card">
                <p className="text-xs text-text-secondary mb-1">Total Setup Cost</p>
                <p className="text-lg font-bold text-accent">{budgetBreakdown ? formatINR(budgetBreakdown.totalStartupCost) : '—'}</p>
                {budgetBreakdown && (
                  <span className={`text-xs ${budgetBreakdown.budgetSufficiency.isSufficient ? 'text-success' : 'text-danger'}`}>
                    {budgetBreakdown.budgetSufficiency.isSufficient ? '✓ Within budget' : `⚠ Shortfall: ${formatINR(budgetBreakdown.budgetSufficiency.shortfall)}`}
                  </span>
                )}
              </div>
              <div className="card">
                <p className="text-xs text-text-secondary mb-1">Equipment Items</p>
                <p className="text-lg font-bold text-text-primary">{equipment.filter(e => e.selectionStatus === 'selected').length}</p>
                <p className="text-xs text-text-secondary">Total: {formatINR(totalEquipmentCost)}</p>
              </div>
              <div className="card">
                <p className="text-xs text-text-secondary mb-1">Licenses Required</p>
                <p className="text-lg font-bold text-text-primary">{licenses.length}</p>
                <p className="text-xs text-text-secondary">{licenses.filter(l => l.mandatory === 'mandatory').length} mandatory</p>
              </div>
              <div className="card">
                <p className="text-xs text-text-secondary mb-1">Roadmap Progress</p>
                <p className="text-lg font-bold text-text-primary">{completedRoadmap}/{roadmap.length}</p>
                <div className="w-full h-1.5 bg-bg-elevated rounded-full mt-2">
                  <div className="h-full bg-success rounded-full transition-all" style={{ width: `${roadmap.length ? (completedRoadmap / roadmap.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            {/* Budget Pie Chart */}
            {budgetChartData.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Budget Allocation</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={budgetChartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                        {budgetChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => formatINR(Number(v) || 0)} contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(212,175,55,0.22)', borderRadius: '8px', color: '#F5F0E6' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Key Info */}
            {feasibility && (
              <div className="card">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Business Overview</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feasibility.businessOverview}</p>
                {feasibility.confidenceLevel && (
                  <div className="mt-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-info" />
                    <span className="text-xs text-info">{feasibility.confidenceLevel}</span>
                  </div>
                )}
              </div>
            )}

            {/* AI Assumptions & Limitations */}
            {analysis.aiReport && (
              <div className="grid md:grid-cols-2 gap-4">
                {analysis.aiReport.assumptions?.length > 0 && (
                  <div className="card">
                    <h3 className="text-sm font-semibold text-warning mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Key Assumptions
                    </h3>
                    <ul className="space-y-1.5">
                      {analysis.aiReport.assumptions.map((a: string, i: number) => (
                        <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                          <span className="text-warning mt-0.5">•</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.aiReport.limitations?.length > 0 && (
                  <div className="card">
                    <h3 className="text-sm font-semibold text-info mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4" /> Limitations
                    </h3>
                    <ul className="space-y-1.5">
                      {analysis.aiReport.limitations.map((l: string, i: number) => (
                        <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                          <span className="text-info mt-0.5">•</span> {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* FEASIBILITY TAB */}
        {activeTab === 'feasibility' && feasibility && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Business Overview</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{feasibility.businessOverview}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="card">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Target Customers</h3>
                <div className="flex flex-wrap gap-2">
                  {feasibility.targetCustomerSegments.map((s, i) => (
                    <span key={i} className="badge badge-accent">{s}</span>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Local Market Factors</h3>
                <ul className="space-y-1.5">
                  {feasibility.localMarketFactors.map((f, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Competition & Differentiation */}
            {(feasibility.competitionAnalysis || feasibility.differentiationStrategy) && (
              <div className="grid md:grid-cols-2 gap-4">
                {feasibility.competitionAnalysis && (
                  <div className="card">
                    <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-warning" /> Competition Analysis
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{feasibility.competitionAnalysis}</p>
                  </div>
                )}
                {feasibility.differentiationStrategy && (
                  <div className="card">
                    <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent" /> Differentiation Strategy
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{feasibility.differentiationStrategy}</p>
                  </div>
                )}
              </div>
            )}

            {/* Revenue Scenarios */}
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Revenue Scenarios</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData}>
                    <XAxis dataKey="name" stroke="#A3A3A3" fontSize={12} />
                    <YAxis stroke="#A3A3A3" fontSize={12} tickFormatter={(v) => formatINR(v)} />
                    <Tooltip formatter={(v: any) => formatINR(Number(v) || 0)} contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(212,175,55,0.22)', borderRadius: '8px', color: '#F5F0E6' }} />
                    <Legend />
                    <Bar dataKey="monthly" name="Monthly" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="annual" name="Annual" fill="#22C55E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Investment & Break-even */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="card text-center">
                <p className="text-xs text-text-secondary mb-1">Total Setup Cost</p>
                <p className="text-xl font-bold text-accent">{formatINR(feasibility.investmentEstimate.totalSetupCost)}</p>
              </div>
              <div className="card text-center">
                <p className="text-xs text-text-secondary mb-1">Monthly Operating Cost</p>
                <p className="text-xl font-bold text-warning">{formatINR(feasibility.investmentEstimate.monthlyOperatingCost)}</p>
              </div>
              <div className="card text-center">
                <p className="text-xs text-text-secondary mb-1">Break-even Time</p>
                <p className="text-xl font-bold text-success">{feasibility.breakEvenEstimate.timeToBreakEven}</p>
              </div>
            </div>

            {/* Risks */}
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Risk Assessment</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(feasibility.risks).map(([key, items]) => (
                  <div key={key}>
                    <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 capitalize">{key} Risks</h4>
                    <ul className="space-y-1">
                      {(items as string[]).map((r, i) => (
                        <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" /> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {feasibility.recommendations.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" /> Recommendations
                </h3>
                <ul className="space-y-2">
                  {feasibility.recommendations.map((r, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* EQUIPMENT TAB */}
        {activeTab === 'equipment' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Equipment Recommendations ({equipment.filter(e => e.selectionStatus === 'selected').length} items)</h3>
              <p className="text-sm text-accent font-semibold">Total: {formatINR(totalEquipmentCost)}</p>
            </div>

            {equipment.length === 0 ? (
              <div className="card text-center py-10">
                <Package className="w-8 h-8 text-text-secondary mx-auto mb-3" />
                <p className="text-sm text-text-secondary">No equipment recommendations yet.</p>
              </div>
            ) : (
              equipment.filter(e => e.selectionStatus !== 'removed').map(eq => (
                <div key={eq._id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-text-primary">{eq.name}</h4>
                        {eq.isRequired && <span className="badge badge-danger text-[10px]">Required</span>}
                        <span className={`badge text-[10px] ${eq.verificationStatus === 'verified' ? 'badge-success' : eq.verificationStatus === 'estimate' ? 'badge-warning' : 'badge-info'}`}>
                          {eq.verificationStatus === 'verified' ? 'Verified' : eq.verificationStatus === 'estimate' ? 'Estimate' : 'Unverified'}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">{eq.category} • Qty: {eq.quantity} • {eq.condition === 'new' ? 'New' : 'Used'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-accent">{formatINR(eq.totalCost)}</p>
                      <p className="text-[10px] text-text-secondary">Unit: {formatINR(eq.estimatedUnitCost)}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {eq.capacity && <div><span className="text-text-secondary">Capacity:</span> <span className="text-text-primary">{eq.capacity}</span></div>}
                    {eq.powerRequirement && <div><span className="text-text-secondary">Power:</span> <span className="text-text-primary">{eq.powerRequirement}</span></div>}
                    {eq.supplierName && <div><span className="text-text-secondary">Supplier:</span> <span className="text-text-primary">{eq.supplierName}</span></div>}
                    {eq.installationCost > 0 && <div><span className="text-text-secondary">Installation:</span> <span className="text-text-primary">{formatINR(eq.installationCost)}</span></div>}
                  </div>

                  {Object.keys(eq.specifications).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(eq.specifications).map(([k, v]) => (
                        <span key={k} className="text-[10px] px-2 py-0.5 rounded bg-bg-elevated text-text-secondary">
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-3 text-[10px] text-text-secondary">
                    <span>📋 {eq.priceSource}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* BUDGET TAB */}
        {activeTab === 'budget' && budgetBreakdown && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card text-center">
                <p className="text-xs text-text-secondary mb-1">Available Budget</p>
                <p className="text-xl font-bold text-text-primary">{formatINR(analysis.budget)}</p>
              </div>
              <div className="card text-center">
                <p className="text-xs text-text-secondary mb-1">Total Startup Cost</p>
                <p className="text-xl font-bold text-accent">{formatINR(budgetBreakdown.totalStartupCost)}</p>
              </div>
              <div className="card text-center">
                <p className="text-xs text-text-secondary mb-1">Monthly Operating</p>
                <p className="text-xl font-bold text-warning">{formatINR(budgetBreakdown.monthlyOperatingCost)}</p>
              </div>
              <div className={`card text-center ${budgetBreakdown.budgetSufficiency.isSufficient ? 'border-success/30' : 'border-danger/30'}`}>
                <p className="text-xs text-text-secondary mb-1">{budgetBreakdown.budgetSufficiency.isSufficient ? 'Surplus' : 'Shortfall'}</p>
                <p className={`text-xl font-bold ${budgetBreakdown.budgetSufficiency.isSufficient ? 'text-success' : 'text-danger'}`}>
                  {formatINR(budgetBreakdown.budgetSufficiency.isSufficient ? (budgetBreakdown.budgetSufficiency as any).surplus || 0 : budgetBreakdown.budgetSufficiency.shortfall)}
                </p>
              </div>
            </div>

            {/* Pie Chart */}
            {budgetChartData.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Cost Distribution</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={budgetChartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                        {budgetChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => formatINR(Number(v) || 0)} contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(212,175,55,0.22)', borderRadius: '8px', color: '#F5F0E6' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Detailed Breakdown */}
            {(['premises', 'machinery', 'infrastructure', 'regulatory', 'operations', 'financial'] as const).map(cat => {
              const category = budgetBreakdown[cat];
              if (!category || category.items.length === 0) return null;
              return (
                <div key={cat} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-text-primary capitalize">{cat}</h3>
                    <span className="text-sm font-bold text-accent">{formatINR(category.subtotal)}</span>
                  </div>
                  <div className="space-y-2">
                    {category.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-border-subtle last:border-0">
                        <div>
                          <p className="text-sm text-text-primary">{item.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-text-secondary capitalize">{item.type}</span>
                            {item.notes && <span className="text-[10px] text-text-secondary">• {item.notes}</span>}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-text-primary">{formatINR(item.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Recommendations */}
            {budgetBreakdown.budgetSufficiency.recommendations.length > 0 && (
              <div className="card border-accent/30">
                <h3 className="text-sm font-semibold text-accent mb-3">Budget Recommendations</h3>
                <ul className="space-y-2">
                  {budgetBreakdown.budgetSufficiency.recommendations.map((r, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* LICENSES TAB */}
        {activeTab === 'licenses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Licenses & Registrations ({licenses.length})</h3>
              <div className="flex gap-2 text-xs">
                <span className="badge badge-danger">{licenses.filter(l => l.mandatory === 'mandatory').length} Mandatory</span>
                <span className="badge badge-warning">{licenses.filter(l => l.mandatory === 'conditional').length} Conditional</span>
                <span className="badge badge-info">{licenses.filter(l => l.mandatory === 'recommended').length} Recommended</span>
              </div>
            </div>

            {licenses.length === 0 ? (
              <div className="card text-center py-10">
                <Shield className="w-8 h-8 text-text-secondary mx-auto mb-3" />
                <p className="text-sm text-text-secondary">No license information available.</p>
              </div>
            ) : (
              licenses.map(lic => (
                <div key={lic._id} className="card">
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedLicense(expandedLicense === lic._id ? null : lic._id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-text-primary">{lic.name}</h4>
                        <span className={`badge text-[10px] ${mandatoryBadge[lic.mandatory]}`}>{lic.mandatory}</span>
                      </div>
                      <p className="text-xs text-text-secondary">{lic.authority} • {lic.applicabilityReason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={lic.status}
                        onClick={e => e.stopPropagation()}
                        onChange={e => updateComplianceTask(lic._id, e.target.value)}
                        className="text-xs py-1 px-2"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="not_applicable">N/A</option>
                      </select>
                      {expandedLicense === lic._id ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                    </div>
                  </div>

                  {expandedLicense === lic._id && (
                    <div className="mt-4 space-y-3 animate-fadeIn border-t border-border-subtle pt-4">
                      <p className="text-sm text-text-secondary">{lic.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-3 text-xs">
                        {lic.fees && <div><span className="text-text-secondary">Fees:</span> <span className="text-text-primary">{lic.fees}</span></div>}
                        {lic.processingTime && <div><span className="text-text-secondary">Processing Time:</span> <span className="text-text-primary">{lic.processingTime}</span></div>}
                        <div><span className="text-text-secondary">Verification:</span> <span className="text-info">{lic.verificationStatus}</span></div>
                      </div>

                      {lic.documents.length > 0 && (
                        <div>
                          <h5 className="text-xs font-semibold text-text-secondary mb-1">Required Documents</h5>
                          <div className="flex flex-wrap gap-1.5">
                            {lic.documents.map((d, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-bg-elevated text-text-secondary">{d}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {lic.officialUrl && (
                        <a
                          href={lic.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover"
                        >
                          <ExternalLink className="w-3 h-3" /> Official Portal
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ROADMAP TAB */}
        {activeTab === 'roadmap' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Setup Roadmap ({completedRoadmap}/{roadmap.length} completed)</h3>
              <div className="w-32 h-2 bg-bg-elevated rounded-full">
                <div className="h-full bg-success rounded-full transition-all" style={{ width: `${roadmap.length ? (completedRoadmap / roadmap.length) * 100 : 0}%` }} />
              </div>
            </div>

            {roadmap.length === 0 ? (
              <div className="card text-center py-10">
                <Map className="w-8 h-8 text-text-secondary mx-auto mb-3" />
                <p className="text-sm text-text-secondary">No roadmap available.</p>
              </div>
            ) : (
              roadmap.map((task, i) => (
                <div key={task._id} className={`card ${task.status === 'completed' ? 'border-success/20 opacity-80' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                        ${task.status === 'completed' ? 'bg-success/20 text-success' 
                          : task.status === 'in_progress' ? 'bg-accent/20 text-accent' 
                          : 'bg-bg-elevated text-text-secondary'}`}>
                        {task.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : task.order}
                      </div>
                      {i < roadmap.length - 1 && <div className={`w-0.5 h-8 mt-1 ${task.status === 'completed' ? 'bg-success/30' : 'bg-bg-elevated'}`} />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm font-semibold ${task.status === 'completed' ? 'text-success line-through' : 'text-text-primary'}`}>
                          {task.title}
                        </h4>
                        <span className={`text-[10px] font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                      </div>
                      <p className="text-xs text-text-secondary mb-2">{task.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-text-secondary">
                        {task.phase && <span className="badge badge-accent">{task.phase}</span>}
                        {task.estimatedDuration && <span><Clock className="w-3 h-3 inline mr-0.5" />{task.estimatedDuration}</span>}
                        {task.responsiblePerson && <span>👤 {task.responsiblePerson}</span>}
                      </div>
                      {task.dependencies.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {task.dependencies.map((d, j) => (
                            <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-secondary">← {d}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <select
                      value={task.status}
                      onChange={e => updateSetupTask(task._id, e.target.value)}
                      className="text-xs py-1 px-2"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="skipped">Skipped</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
