import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Plus, Settings, LogOut, Menu, Sparkles } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analyze', label: 'New Analysis', icon: Plus },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-bg-primary">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-bg-secondary border-r border-border-subtle z-50
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border-subtle">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-bg-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold text-text-primary">BizPilot AI</h1>
            <p className="text-[10px] text-text-secondary">Business Intelligence</p>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-accent/10 text-accent border border-accent/20' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'}`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border-subtle">
          <Link
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg hover:bg-bg-elevated transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
              <p className="text-xs text-text-secondary truncate">{user?.email}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-text-secondary hover:text-danger hover:bg-danger/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-bg-secondary border-b border-border-subtle">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-bg-elevated">
            <Menu className="w-5 h-5 text-text-primary" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold text-text-primary">BizPilot AI</span>
          </div>
          <div className="w-8" />
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
