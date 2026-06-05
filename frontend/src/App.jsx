import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AskAI from './pages/AskAI';
import LoginPage from './pages/LoginPage';

// Protected route wrapper — redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Main App Router Configuration
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <div className="noise-bg" />
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ask"
          element={
            <ProtectedRoute>
              <AskAI />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            color: '#0f172a',
            border: '1px solid rgba(15,23,42,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
          },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
