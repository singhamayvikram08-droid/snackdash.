import { StrictMode, Suspense, lazy, Component, useEffect, type ReactNode, type ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './index.css';
import CookieConsentBanner from './components/CookieConsentBanner';
import ProtectedRoute from './components/ProtectedRoute';
import { analytics } from './utils/analytics';

import App from './App';

// Code-splitting routes for optimal PageSpeed & First Contentful Paint
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CockpitPage = lazy(() => import('./pages/CockpitPage'));
const DocsPage = lazy(() => import('./pages/DocsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const NextGenAiPortalPage = lazy(() => import('./pages/NextGenAiPortalPage'));
const NextGenAiLoginPage = lazy(() => import('./pages/NextGenAiLoginPage'));

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[NexGen ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030305] text-white flex flex-col items-center justify-center p-6 text-center selection:bg-[#00f0ff] selection:text-black">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00f0ff] to-[#a200ff] flex items-center justify-center mb-6 shadow-xl shadow-[#00f0ff]/20">
            <svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2">
            Spatial Engine Synchronized
          </h1>
          <p className="text-gray-400 text-sm max-w-md mb-8 leading-relaxed">
            A background graphics thread requested a reload. Click below to re-enter your workspace cleanly.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-6 py-3 rounded-2xl bg-[#00f0ff] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-lg cursor-pointer"
            >
              Reload Spatial Core
            </button>
            <a
              href="/"
              className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Return Home
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const PageLoader = () => (
  <div className="min-h-screen bg-[#030305] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-2xl border-2 border-[#00f0ff]/20 border-t-[#00f0ff] animate-spin" />
      <span className="text-[10px] uppercase font-mono tracking-widest text-[#00f0ff] animate-pulse">
        Initializing Spatial Core...
      </span>
    </div>
  </div>
);

const AnalyticsTracker = () => {
  const location = useLocation();
  useEffect(() => {
    analytics.trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <BrowserRouter>
        <AnalyticsTracker />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route
              path="/cockpit"
              element={
                <ProtectedRoute featureName="3D Spatial Cockpit">
                  <CockpitPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute featureName="NextGen Platform Dashboard">
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/next-gen-ai/login" element={<NextGenAiLoginPage />} />
            <Route path="/admin/login" element={<NextGenAiLoginPage />} />
            <Route path="/next-gen-ai" element={<NextGenAiPortalPage />} />
            <Route path="/admin" element={<NextGenAiPortalPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <CookieConsentBanner />
      </BrowserRouter>
    </RootErrorBoundary>
  </StrictMode>,
);
