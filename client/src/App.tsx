/* App.tsx: Core application router with lazy loading and authentication guards. */
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSettingsStore } from './hooks/useSettingsStore';
import { useAuthStore } from './hooks/useAuthStore';

// Components
import AppLayout from './components/layout/AppLayout';

// Lazy Loaded Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const RecoverPage = lazy(() => import('./pages/auth/RecoverPage'));
const VerifyPage = lazy(() => import('./pages/auth/VerifyPage'));
const OAuthSuccessPage = lazy(() => import('./pages/auth/OAuthSuccessPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const GradePlannerPage = lazy(() => import('./pages/GradePlannerPage'));
const BurnoutPage = lazy(() => import('./pages/BurnoutPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const AdvisorPage = lazy(() => import('./pages/AdvisorPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

const PageLoader = () => (
  <div className="full-page-loader">
    <Loader2 className="spin" size={48} color="var(--active-accent)" />
  </div>
);

const ProtectedRoute = ({ children, requireOnboarding = true, allowedRoles }: { children: React.ReactNode, requireOnboarding?: boolean, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireOnboarding && user && !user.onboardingCompleted && user.role !== 'advisor') return <Navigate to="/onboarding" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to={user.role === 'advisor' ? "/advisor" : "/dashboard"} replace />;
  return <>{children}</>;
};

function App() {
  const { theme, accentColor, fontSize } = useSettingsStore();
  const fontSizeMap: Record<string, string> = { sm: '14px', base: '16px', lg: '18px', xl: '20px' };

  return (
    <div className={`app-root theme-${theme}`} style={{ '--active-accent': accentColor, fontSize: fontSizeMap[fontSize] || '16px' } as React.CSSProperties}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/recover" element={<RecoverPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/auth/success" element={<OAuthSuccessPage />} />
            <Route path="/onboarding" element={<ProtectedRoute requireOnboarding={false}><OnboardingPage /></ProtectedRoute>} />
            
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/grade-planner" element={<GradePlannerPage />} />
              <Route path="/burnout" element={<BurnoutPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/advisor" element={<AdvisorPage />} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
