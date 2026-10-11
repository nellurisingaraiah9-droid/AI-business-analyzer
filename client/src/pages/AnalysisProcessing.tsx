import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analysisApi } from '../services/api';
import { Sparkles, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export default function AnalysisProcessing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState('queued');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Initializing analysis...');
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!id) return;

    const poll = async () => {
      try {
        const data = await analysisApi.status(id);
        setStatus(data.status);
        setProgress(data.progress);
        setMessage(data.progressMessage || 'Processing...');

        if (data.status === 'completed') {
          if (pollRef.current) clearInterval(pollRef.current);
          setTimeout(() => navigate(`/analysis/${id}`), 1000);
        } else if (data.status === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current);
          setError(data.errorMessage || 'Analysis failed');
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    };

    poll();
    pollRef.current = setInterval(poll, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [id, navigate]);

  const handleRetry = async () => {
    if (!id) return;
    setError('');
    setStatus('queued');
    setProgress(0);
    try {
      await analysisApi.refine(id);
      pollRef.current = setInterval(async () => {
        try {
          const data = await analysisApi.status(id);
          setStatus(data.status);
          setProgress(data.progress);
          setMessage(data.progressMessage || 'Processing...');
          if (data.status === 'completed') {
            if (pollRef.current) clearInterval(pollRef.current);
            setTimeout(() => navigate(`/analysis/${id}`), 1000);
          } else if (data.status === 'failed') {
            if (pollRef.current) clearInterval(pollRef.current);
            setError(data.errorMessage || 'Analysis failed');
          }
        } catch {}
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to retry');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-20 text-center animate-fadeIn">
      {status === 'failed' ? (
        <>
          <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-danger" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Analysis Failed</h2>
          <p className="text-sm text-text-secondary mb-6">{error}</p>
          <button onClick={handleRetry} className="btn-primary inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retry Analysis
          </button>
        </>
      ) : status === 'completed' ? (
        <>
          <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Analysis Complete!</h2>
          <p className="text-sm text-text-secondary">Redirecting to your report...</p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6 animate-pulse-gold">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Analyzing Your Business</h2>
          <p className="text-sm text-text-secondary mb-8">{message}</p>

          {/* Progress bar */}
          <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary">{progress}% complete</p>

          {/* Steps indicator */}
          <div className="mt-10 text-left space-y-3">
            {[
              { label: 'Validating input', at: 10 },
              { label: 'Retrieving equipment catalog', at: 20 },
              { label: 'Retrieving regulatory rules', at: 30 },
              { label: 'Running AI analysis', at: 40 },
              { label: 'Processing feasibility report', at: 60 },
              { label: 'Processing equipment', at: 70 },
              { label: 'Processing licenses', at: 80 },
              { label: 'Calculating budget', at: 85 },
              { label: 'Creating roadmap', at: 90 },
              { label: 'Finalizing report', at: 95 },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  progress > s.at ? 'bg-success/20' : progress >= s.at - 5 ? 'bg-accent/20' : 'bg-bg-elevated'
                }`}>
                  {progress > s.at ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  ) : progress >= s.at - 5 ? (
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-text-secondary/30" />
                  )}
                </div>
                <span className={`text-sm ${progress > s.at ? 'text-success' : progress >= s.at - 5 ? 'text-text-primary' : 'text-text-secondary/50'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
