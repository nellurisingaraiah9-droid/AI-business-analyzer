import { useEffect, useState } from 'react';
import { profileApi } from '../services/api';
import { useToast } from '../components/Toast';
import { User, Lock } from 'lucide-react';

export default function Settings() {
  const toast = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile edit state
  const [name, setName] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileApi.get();
      setProfile(data.user);
      setStats(data.stats);
      setName(data.user.name);
    } catch (err: any) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setUpdatingProfile(true);
    try {
      const res = await profileApi.update(name);
      setProfile((prev: any) => ({ ...prev, name: res.user.name }));
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setUpdatingPassword(true);
    try {
      await profileApi.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-fadeIn">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="skeleton h-48 w-full" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Account Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your account credentials and preferences</p>
      </div>

      {/* Account Overview Card */}
      <div className="card flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-bg-primary text-2xl font-black shadow-lg shadow-accent/20">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-text-primary">{profile?.name}</h2>
              <span className="badge badge-accent uppercase text-[10px] tracking-wider">{profile?.role}</span>
            </div>
            <p className="text-sm text-text-secondary mt-0.5">{profile?.email}</p>
            {profile?.createdAt && (
              <p className="text-xs text-text-secondary/70 mt-1">
                Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border-subtle pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
          <div className="text-center px-3">
            <span className="block text-2xl font-bold text-accent">{stats?.totalAnalyses || 0}</span>
            <span className="text-xs text-text-secondary">Analyses</span>
          </div>
          <div className="text-center px-3 border-l border-border-subtle">
            <span className="block text-2xl font-bold text-success">{stats?.completedAnalyses || 0}</span>
            <span className="text-xs text-text-secondary">Completed</span>
          </div>
          <div className="text-center px-3 border-l border-border-subtle">
            <span className="block text-2xl font-bold text-warning">{stats?.processingAnalyses || 0}</span>
            <span className="text-xs text-text-secondary">Processing</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Information Form */}
        <div className="card p-6">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border-subtle">
            <User className="w-5 h-5 text-accent" />
            <h3 className="text-base font-semibold text-text-primary">Personal Information</h3>
          </div>

          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Email Address</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full opacity-60 cursor-not-allowed bg-bg-secondary"
              />
              <span className="block text-[11px] text-text-secondary mt-1">Email address cannot be changed</span>
            </div>

            <button
              type="submit"
              disabled={updatingProfile || name === profile?.name}
              className="btn-primary w-full mt-2"
            >
              {updatingProfile ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card p-6">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border-subtle">
            <Lock className="w-5 h-5 text-accent" />
            <h3 className="text-base font-semibold text-text-primary">Change Password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                className="w-full"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full"
                placeholder="Re-enter new password"
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword || !currentPassword || !newPassword}
              className="btn-secondary w-full mt-2 hover:border-accent"
            >
              {updatingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
