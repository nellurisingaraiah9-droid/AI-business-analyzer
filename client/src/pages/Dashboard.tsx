import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { analysisApi } from '../services/api';
import type { Analysis } from '../types';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
  Plus, FileText, Clock, CheckCircle2, XCircle, Loader2, 
  BarChart3, ArrowRight, Search, Trash2, Calendar
} from 'lucide-react';

const statusConfig = {
  draft: { icon: FileText, color: 'text-text-secondary', bg: 'bg-bg-elevated', label: 'Draft' },
  queued: { icon: Clock, color: 'text-info', bg: 'bg-info/10', label: 'Queued' },
  processing: { icon: Loader2, color: 'text-warning', bg: 'bg-warning/10', label: 'Processing' },
  completed: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', label: 'Completed' },
  failed: { icon: XCircle, color: 'text-danger', bg: 'bg-danger/10', label: 'Failed' },
};

function formatRelativeTime(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing' | 'draft' | 'failed'>('all');
  
  // Delete dialog state
  const [analysisToDelete, setAnalysisToDelete] = useState<Analysis | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const data = await analysisApi.list(1);
      setAnalyses(data.analyses);
    } catch (err) {
      console.error('Failed to load analyses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!analysisToDelete) return;
    setIsDeleting(true);
    try {
      await analysisApi.delete(analysisToDelete._id);
      setAnalyses(prev => prev.filter(a => a._id !== analysisToDelete._id));
      toast.success('Analysis deleted successfully');
      setAnalysisToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete analysis');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatBudget = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const filteredAnalyses = useMemo(() => {
    return analyses.filter(a => {
      const matchesSearch = 
        a.businessIdea.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.location.state.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'processing') return a.status === 'processing' || a.status === 'queued';
      return a.status === statusFilter;
    });
  }, [analyses, searchQuery, statusFilter]);

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Manage and track your business feasibility analyses</p>
        </div>
        <Link to="/analyze" className="btn-primary flex items-center justify-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New Analysis
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Analyses', value: analyses.length, icon: BarChart3, color: 'text-accent' },
          { label: 'Completed', value: analyses.filter(a => a.status === 'completed').length, icon: CheckCircle2, color: 'text-success' },
          { label: 'In Progress', value: analyses.filter(a => a.status === 'processing' || a.status === 'queued').length, icon: Loader2, color: 'text-warning' },
          { label: 'Drafts', value: analyses.filter(a => a.status === 'draft').length, icon: FileText, color: 'text-text-secondary' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-secondary">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by idea, industry, or location..."
            className="w-full pl-10 pr-4 py-2 text-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'completed', label: 'Completed' },
            { id: 'processing', label: 'In Progress' },
            { id: 'draft', label: 'Draft' },
            { id: 'failed', label: 'Failed' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analyses List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card">
              <div className="skeleton h-5 w-3/4 mb-3" />
              <div className="skeleton h-4 w-1/2 mb-2" />
              <div className="skeleton h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : analyses.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No Analyses Yet</h3>
          <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
            Start by creating your first business analysis. Enter your business idea, location, and budget to get a comprehensive report.
          </p>
          <Link to="/analyze" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Your First Analysis
          </Link>
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-sm text-text-secondary">No analyses matching your search or filters.</p>
          <button
            onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
            className="text-xs text-accent mt-2 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAnalyses.map(analysis => {
            const status = statusConfig[analysis.status];
            const Icon = status.icon;
            const linkTo = analysis.status === 'completed'
              ? `/analysis/${analysis._id}`
              : analysis.status === 'processing' || analysis.status === 'queued'
              ? `/analysis/${analysis._id}/processing`
              : `/analysis/${analysis._id}`;

            return (
              <div
                key={analysis._id}
                className="card flex items-center gap-4 hover:border-accent/40 transition-all group relative"
              >
                <Link to={linkTo} className="flex-1 flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-lg ${status.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${status.color} ${analysis.status === 'processing' ? 'animate-spin' : ''}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                      {analysis.businessIdea}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-text-secondary">
                      <span>{analysis.industry}</span>
                      <span>•</span>
                      <span>{analysis.location.city}, {analysis.location.state}</span>
                      <span>•</span>
                      <span className="text-accent font-medium">{formatBudget(analysis.budget)}</span>
                      {analysis.createdAt && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[11px] text-text-secondary">
                            <Calendar className="w-3 h-3" />
                            {formatRelativeTime(analysis.createdAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`badge ${status.bg} ${status.color}`}>{status.label}</span>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setAnalysisToDelete(analysis);
                    }}
                    title="Delete Analysis"
                    className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link to={linkTo} className="text-text-secondary hover:text-accent p-1">
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!analysisToDelete}
        title="Delete Analysis"
        message={`Are you sure you want to delete "${analysisToDelete?.businessIdea.substring(0, 50)}..."? This will permanently remove the feasibility report, equipment lists, and setup roadmap.`}
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setAnalysisToDelete(null)}
      />
    </div>
  );
}
