import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-bg-primary" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
          <p className="text-sm text-text-secondary mt-1">Sign in to your BizPilot AI account</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:text-accent-hover font-medium">
              Create one
            </Link>
          </p>
        </div>

        {/* Demo Credentials Quick-Fill Banner */}
        <div className="mt-6 p-4 rounded-xl bg-bg-secondary border border-border-subtle">
          <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">⚡ Quick Test Accounts</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('demo@bizpilot.ai');
                setPassword('Demo@123456');
              }}
              className="px-3 py-2 text-left rounded-lg bg-bg-elevated hover:border-accent/40 border border-border-subtle transition-all"
            >
              <span className="block text-xs font-medium text-text-primary">Demo User</span>
              <span className="block text-[11px] text-text-secondary truncate">demo@bizpilot.ai</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@bizpilot.ai');
                setPassword('Admin@123456');
              }}
              className="px-3 py-2 text-left rounded-lg bg-bg-elevated hover:border-accent/40 border border-border-subtle transition-all"
            >
              <span className="block text-xs font-medium text-text-primary">Admin User</span>
              <span className="block text-[11px] text-text-secondary truncate">admin@bizpilot.ai</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
