import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AnalysisWizard from './pages/AnalysisWizard';
import AnalysisProcessing from './pages/AnalysisProcessing';
import Report from './pages/Report';
import Settings from './pages/Settings';
import { ToastProvider } from './components/Toast';
import './index.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="skeleton w-8 h-8 rounded-full" /></div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/analyze" element={<ProtectedRoute><Layout><AnalysisWizard /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      <Route path="/analysis/:id/processing" element={<ProtectedRoute><Layout><AnalysisProcessing /></Layout></ProtectedRoute>} />
      <Route path="/analysis/:id" element={<ProtectedRoute><Layout><Report /></Layout></ProtectedRoute>} />
      <Route path="/analysis/:id/:tab" element={<ProtectedRoute><Layout><Report /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
