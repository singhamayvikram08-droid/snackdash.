import { useState, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight,
  Hexagon, CheckCircle2, Zap, Plus, X, Cpu, Activity, ShieldCheck, CreditCard
} from 'lucide-react';
import Magnetic from '../components/Magnetic';
import { analytics } from '../utils/analytics';
import { setStoredAuth, type UserSession } from '../utils/auth';
import { authRateLimiter, sanitizeInput, logAdminAction } from '../utils/security';
import { usePageSEO } from '../utils/usePageSEO';
import ChatBox from '../components/ChatBox';
import CaptchaWidget from '../components/CaptchaWidget';

/* ═══════════════════════════════════════
   INLINE SOCIAL ICONS
   ═══════════════════════════════════════ */
const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
    <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
    <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
    <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.24 5.35l4.037-3.082Z"/>
  </svg>
);

const GithubIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"/>
  </svg>
);

/* ═══════════════════════════════════════
   FLOATING PARTICLE BACKGROUND
   ═══════════════════════════════════════ */
const ParticleField = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#00f0ff]/15 blur-[140px]" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#a200ff]/15 blur-[140px]" />
  </div>
);

/* ═══════════════════════════════════════
   INPUT FIELD WITH HIGH CONTRAST & ACCESSIBILITY
   ═══════════════════════════════════════ */
interface FieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  error?: string;
  showToggle?: boolean;
  onToggle?: () => void;
  visible?: boolean;
  autoComplete?: string;
}

interface LoginLocationState {
  planId?: string;
  planName?: string;
  purchaseIntent?: boolean;
  from?: string;
  fromDashboard?: boolean;
  featureName?: string;
  requireLoginFirst?: boolean;
}

interface SocialAccount {
  name: string;
  email: string;
  avatar?: string;
  tier?: string;
  isPro?: boolean;
}

const Field = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  icon: Icon, 
  placeholder, 
  error, 
  showToggle, 
  onToggle, 
  visible,
  autoComplete 
}: FieldProps) => {
  const inputId = useId();

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-xs font-bold text-gray-200 uppercase tracking-wider">
          {label}
        </label>
        {error && (
          <span className="text-[11px] font-semibold text-[#ff4d6d] flex items-center gap-1" role="alert">
            <span>⚠</span> {error}
          </span>
        )}
      </div>

      <div className={`relative flex items-center rounded-2xl border transition-all duration-200 ${
        error
          ? 'border-[#ff0055] bg-[#ff0055]/10 shadow-[0_0_15px_rgba(255,0,85,0.2)]'
          : 'border-white/10 bg-white/[0.04] focus-within:border-[#00f0ff] focus-within:bg-[#00f0ff]/5 focus-within:ring-1 focus-within:ring-[#00f0ff]'
      }`}>
        <Icon className="absolute left-4 w-4 h-4 text-gray-300 pointer-events-none" />
        <input
          id={inputId}
          type={showToggle ? (visible ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          className="w-full bg-transparent pl-12 pr-12 py-3.5 text-sm text-white placeholder-gray-500 outline-none font-medium"
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="absolute right-4 text-gray-300 hover:text-white transition-colors p-1"
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   PASSWORD STRENGTH METER
   ═══════════════════════════════════════ */
const PasswordStrengthMeter = ({ password }: { password: string }) => {
  if (!password) return null;

  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const levels = [
    { label: 'Too short', color: 'bg-red-500', text: 'text-red-400' },
    { label: 'Weak', color: 'bg-orange-500', text: 'text-orange-400' },
    { label: 'Medium', color: 'bg-yellow-400', text: 'text-yellow-400' },
    { label: 'Strong', color: 'bg-green-400', text: 'text-green-400' },
  ];

  const current = levels[Math.min(strength - 1, 3)] || levels[0];

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center justify-between text-[11px] font-semibold">
        <span className="text-gray-300">Password strength:</span>
        <span className={current.text}>{current.label}</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[0, 1, 2, 3].map(step => (
          <div
            key={step}
            className={`rounded-full transition-colors duration-300 ${
              step < strength ? current.color : 'bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   MAIN LOGIN / REGISTER PAGE
   ═══════════════════════════════════════ */
const LoginPage = () => {
  usePageSEO({
    title: 'Developer Authentication — NexGen AI Core Portal',
    description: 'Log in or create a developer account to dispatch neural workloads to 14,029 edge nodes, access the 3D WebGL Matrix Cockpit, and manage cloud clusters.'
  });

  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const searchFrom = searchParams.get('from') || searchParams.get('redirect');
  const searchFeature = searchParams.get('feature');
  const searchRequireLogin = searchParams.get('requireLoginFirst') === 'true';
  const searchFromDashboard = searchParams.get('fromDashboard') === 'true';
  const searchRequireAuth = searchParams.get('requireAuth');
  const locState = location.state as LoginLocationState | null;
  const searchPlanId = searchParams.get('plan') || locState?.planId;
  const searchPlanName = searchParams.get('planName') || locState?.planName;
  const isPurchaseFlow = Boolean(
    searchRequireAuth === 'purchase' ||
    locState?.purchaseIntent ||
    searchPlanId
  );

  const from = locState?.from || searchFrom || '/dashboard';
  const fromDashboard = Boolean(
    locState?.fromDashboard ||
    searchFromDashboard ||
    (typeof window !== 'undefined' && window.location.search.includes('fromDashboard'))
  );
  const featureName =
    locState?.featureName ||
    searchFeature ||
    (from === '/cockpit' ? 'Launch 3D Cockpit' : undefined);
  const requireLoginFirst = Boolean(
    locState?.requireLoginFirst ||
    searchRequireLogin ||
    from === '/cockpit' ||
    (typeof window !== 'undefined' && window.location.search.includes('cockpit'))
  );

  const [mode, setMode] = useState<'login' | 'register'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('mode=login')) return 'login';
      if (window.location.search.includes('mode=register')) return 'register';
    }
    // Automatically default to 'login' mode when asked to log in first before purchase, cockpit or coming from dashboard logo
    if (isPurchaseFlow || requireLoginFirst || from === '/cockpit' || fromDashboard) return 'login';
    return 'register';
  });
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authProvider, setAuthProvider] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // Anti-Spam / Bot Protection
  const [honeypot, setHoneypot] = useState('');
  const [pageLoadedAt] = useState(() => Date.now());
  const lastSubmitAt = useRef<number>(0);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
    // Clear field-specific error as user types
    if (errors[key]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
    if (serverError) setServerError(null);
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (mode === 'register') {
      if (!form.name.trim()) e.name = 'Full name is required';
      else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      e.email = 'Email address is required';
    } else if (!emailRegex.test(form.email)) {
      e.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      e.password = 'Password is required';
    } else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters';
    }

    if (mode === 'register') {
      if (!form.confirm) {
        e.confirm = 'Please confirm your password';
      } else if (form.password !== form.confirm) {
        e.confirm = 'Passwords do not match';
      }
    }

    return e;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Bot Trap check
    if (honeypot.trim()) {
      console.warn('Bot submission caught via honeypot.');
      return;
    }

    // 2. Sliding window rate limiting check
    const now = Date.now();
    lastSubmitAt.current = now;
    const rateCheck = authRateLimiter.checkLimit(form.email ? form.email.toLowerCase() : 'global_login_ip');
    if (!rateCheck.allowed) {
      setServerError(`Too many attempts. Rate limit enforced: please wait ${Math.ceil(rateCheck.retryAfterMs / 1000)} seconds.`);
      return;
    }

    // 3. Human timing check (> 400ms)
    if (now - pageLoadedAt < 400) {
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    if (!captchaVerified) {
      setServerError('Please complete the Neural Bot Defense challenge below before proceeding.');
      return;
    }

    setErrors({});
    setServerError(null);
    setLoading(true);

    const cleanEmail = sanitizeInput(form.email);
    const cleanName = sanitizeInput(form.name);

    const userSession = {
      name: mode === 'register' ? (cleanName || 'Amay Vikram Singh') : (cleanEmail.split('@')[0] || 'Amay Vikram Singh'),
      email: cleanEmail,
      role: 'Pro Member',
    };
    setStoredAuth(userSession);
    logAdminAction('AUTH_LOGIN_SUCCESS', userSession as unknown as UserSession, '/dashboard', 'SUCCESS', { mode, email: cleanEmail });

    analytics.trackEvent('auth_submit', { mode, email: cleanEmail });

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      analytics.trackEvent('auth_success', { mode });
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1400);
    }, 1000);
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setErrors({});
    setServerError(null);
    setSubmitted(false);
    setForm({ name: '', email: '', password: '', confirm: '' });
  };

  const handleSocialLogin = (provider: string) => {
    setAuthProvider(provider);
    setShowAuthModal(true);
  };

  const completeSocialLogin = (account: SocialAccount) => {
    setSelectedAccount(account);
    setShowAuthModal(false);
    setLoading(true);
    setStoredAuth({
      name: account.name,
      email: account.email,
      role: 'Pro Member',
      avatar: account.avatar || 'AS',
    });
    analytics.trackEvent('oauth_login', { provider: authProvider, account: account.email });
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1400);
    }, 800);
  };

  const handleQuickDemoLogin = (name: string, email: string, avatar: string) => {
    setLoading(true);
    setStoredAuth({ name, email, role: 'Pro Member', avatar });
    analytics.trackEvent('quick_demo_login', { email });
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1200);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white flex flex-col lg:flex-row relative font-sans selection:bg-[#00f0ff] selection:text-black overflow-y-auto">
      <ParticleField />

      {/* ── LEFT PANEL (Branding, Metrics & Value Props) ──────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-full lg:w-[48%] xl:w-[44%] border-r border-white/5 p-10 xl:p-16 relative z-10 bg-[#050508]/80 backdrop-blur-xl min-h-screen">
        <Link to="/" className="flex items-center gap-3 group w-max">
          <div className="relative">
            <div className="absolute inset-0 bg-[#00f0ff] blur-md opacity-40 group-hover:opacity-80 transition-opacity rounded-full" />
            <Hexagon className="text-[#00f0ff] relative z-10 w-9 h-9" />
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase text-white">
            Nex<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#a200ff]">Gen</span>
          </span>
          <span className="ml-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-gray-300 uppercase tracking-widest">
            v2.4 Core
          </span>
        </Link>

        {/* Center Content with non-colliding responsive cards */}
        <div className="space-y-8 my-auto py-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff] text-xs font-bold uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5" /> Synchronized Workspace
            </div>
            <h2 className="text-4xl xl:text-5xl font-black tracking-tight text-white leading-tight">
              Virtualize Reality with Sub-ms Speed.
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">
              Access your autonomous 3D development engine, manage live clusters, and deploy microservices with unified quantum encryption.
            </p>
          </div>

          {/* Clean, Non-Colliding Responsive Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#090912] border border-white/10 shadow-lg space-y-3">
              <div className="flex items-center justify-between text-[#00f0ff]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300">Cluster Latency</span>
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black text-white">
                0.86<span className="text-sm font-semibold text-gray-400 ml-1">ms</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#00f0ff] rounded-full w-4/5 animate-pulse" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#090912] border border-white/10 shadow-lg space-y-3">
              <div className="flex items-center justify-between text-[#a200ff]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300">Active Nodes</span>
                <Activity className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black text-white">
                14.0K+ <span className="text-green-400 text-xs font-bold">100% OK</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#a200ff] rounded-full w-full" />
              </div>
            </div>
          </div>

          {/* Value Checklist */}
          <div className="space-y-3 pt-2">
            {[
              'Enterprise-Grade Quantum Encryption Active',
              'SOC 2 Type II Certified & GDPR Ready',
              'Distributed Edge Nodes in 38 Availability Zones',
            ].map((txt, i) => (
              <div key={i} className="flex items-center gap-3 text-xs font-semibold text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-[#00f0ff] shrink-0" />
                <span>{txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
          <span>NexGen Cloud Services Inc.</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Auth Form Container) ────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16 relative z-10 w-full min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden w-full max-w-md flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer" title="Return to NexGen AI Home">
            <Hexagon className="text-[#00f0ff] w-7 h-7 group-hover:scale-110 transition-transform" />
            <span className="font-black text-lg tracking-tight uppercase text-white">NexGen</span>
          </Link>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 uppercase tracking-widest">
            Core Portal
          </span>
        </div>

        {/* Form Card or Success View */}
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {submitted ? (
              /* Success Screen */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 sm:p-10 rounded-3xl bg-[#090914] border border-white/10 text-center space-y-6 shadow-2xl"
              >
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#00f0ff] to-[#a200ff] flex items-center justify-center shadow-xl shadow-[#00f0ff]/30">
                  <CheckCircle2 className="w-10 h-10 text-black stroke-[3px]" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                    {selectedAccount 
                      ? `Access Granted: ${selectedAccount.name}` 
                      : (mode === 'login' ? 'Authentication Complete' : 'Virtual Identity Created')}
                  </h2>
                  <p className="text-xs text-gray-300">
                    Initializing your synchronized spatial workspace...
                  </p>
                </div>

                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#00f0ff] to-[#a200ff]"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.8, ease: 'easeInOut' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => navigate(from, { replace: true })}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-[#00f0ff]/20"
                >
                  {isPurchaseFlow
                    ? `Continue to ${searchPlanName || 'Plan'} Checkout →`
                    : from === '/cockpit'
                    ? 'Enter 3D Spatial Cockpit Now →'
                    : from === '/'
                    ? 'Proceed to Main Site Now →'
                    : 'Enter Workspace Dashboard Now →'}
                </button>
              </motion.div>
            ) : (
              /* Main Form Card */
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-10 rounded-3xl bg-[#08080f]/90 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/80 space-y-6"
              >
                {/* Feature / Purchase Access Banner */}
                {isPurchaseFlow ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#00f0ff]/15 via-[#a200ff]/15 to-transparent border border-[#00f0ff]/40 flex items-start gap-3.5 shadow-[0_0_25px_rgba(0,240,255,0.15)]">
                    <div className="w-8 h-8 rounded-xl bg-[#00f0ff]/20 border border-[#00f0ff]/40 flex items-center justify-center shrink-0 mt-0.5">
                      <CreditCard className="w-4 h-4 text-[#00f0ff]" />
                    </div>
                    <div className="text-left space-y-1">
                      <div className="text-xs font-black uppercase tracking-wider text-[#00f0ff] flex items-center gap-1.5">
                        <span>Sign In or Create Account</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <div className="text-xs text-gray-200 leading-relaxed">
                        Please <strong className="text-white">sign in</strong> or <strong className="text-[#00f0ff]">create an account</strong> to purchase the <span className="text-[#00f0ff] font-bold">{searchPlanName || 'subscription plan'}</span>. Once authenticated, you will immediately continue to checkout.
                      </div>
                    </div>
                  </div>
                ) : requireLoginFirst ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#00f0ff]/15 via-[#a200ff]/10 to-transparent border border-[#00f0ff]/40 flex items-start gap-3.5 shadow-[0_0_25px_rgba(0,240,255,0.15)]">
                    <div className="w-8 h-8 rounded-xl bg-[#00f0ff]/20 border border-[#00f0ff]/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Lock className="w-4 h-4 text-[#00f0ff]" />
                    </div>
                    <div className="text-left space-y-1">
                      <div className="text-xs font-black uppercase tracking-wider text-[#00f0ff] flex items-center gap-1.5">
                        <span>Please Log In First</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <div className="text-xs text-gray-200 leading-relaxed">
                        Authentication is required before using <span className="text-[#00f0ff] font-bold">{featureName || 'Launch 3D Cockpit'}</span>. Please log in or register below to access the 3D Cockpit.
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Mode Selector Tabs (Sign In or Create Account) */}
                <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrors({});
                      setServerError(null);
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      mode === 'login'
                        ? 'bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrors({});
                      setServerError(null);
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      mode === 'register'
                        ? 'bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Header */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00f0ff]" />
                    {isPurchaseFlow
                      ? (mode === 'login' ? 'Checkout Authentication' : 'Create Account to Purchase')
                      : (mode === 'login' ? 'Secure Authentication' : 'Create Developer ID')}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                    {isPurchaseFlow
                      ? (mode === 'login' ? 'Sign In to Purchase' : 'Create Account to Purchase')
                      : (mode === 'login' ? 'Access Core ID' : 'Get Started')}
                  </h1>
                  <p className="text-xs text-gray-300">
                    {mode === 'login' ? "Don't have a virtual identity? " : 'Already registered? '}
                    <button
                      type="button"
                      onClick={switchMode}
                      className="text-[#00f0ff] hover:underline font-bold uppercase tracking-wider text-xs ml-1 cursor-pointer"
                    >
                      {mode === 'login' ? 'Create Account' : 'Sign In'}
                    </button>
                  </p>
                </div>

                {/* OAuth Social Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <GoogleIcon />, label: 'Google' },
                    { icon: <GithubIcon />, label: 'GitHub' },
                  ].map(({ icon, label }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleSocialLogin(label)}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      {icon}
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="uppercase tracking-widest text-[10px]">Or continue with email</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Server Error Alert */}
                {serverError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold" role="alert">
                    {serverError}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot field (hidden from humans, catches bots) */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      name="website_verify_hp"
                      value={honeypot}
                      onChange={e => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {mode === 'register' && (
                    <Field
                      label="Full Identity Name"
                      value={form.name}
                      onChange={set('name')}
                      icon={User}
                      placeholder="e.g. Amay Vikram Singh"
                      error={errors.name}
                      autoComplete="name"
                    />
                  )}

                  <Field
                    label="Access Email Address"
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    icon={Mail}
                    placeholder="name@company.com"
                    error={errors.email}
                    autoComplete="email"
                  />

                  <Field
                    label="Secret Key Phrase (Password)"
                    value={form.password}
                    onChange={set('password')}
                    icon={Lock}
                    placeholder="At least 8 characters"
                    error={errors.password}
                    showToggle
                    onToggle={() => setShowPw(p => !p)}
                    visible={showPw}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />

                  {mode === 'register' && form.password && (
                    <PasswordStrengthMeter password={form.password} />
                  )}

                  {mode === 'register' && (
                    <Field
                      label="Confirm Secret Key Phrase"
                      value={form.confirm}
                      onChange={set('confirm')}
                      icon={Lock}
                      placeholder="Re-enter password"
                      error={errors.confirm}
                      showToggle
                      onToggle={() => setShowConfirm(p => !p)}
                      visible={showConfirm}
                      autoComplete="new-password"
                    />
                  )}

                  {mode === 'login' && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setServerError('Password reset link sent to demo registered email.');
                          setTimeout(() => setServerError(null), 4000);
                        }}
                        className="text-xs font-semibold text-[#00f0ff] hover:underline"
                      >
                        Forgot secret key?
                      </button>
                    </div>
                  )}

                  {/* Cryptographic CAPTCHA & Anti-Bot Challenge */}
                  <div className="pt-1">
                    <CaptchaWidget
                      onVerified={() => {
                        setCaptchaVerified(true);
                        if (serverError && serverError.includes('Neural Bot Defense')) {
                          setServerError(null);
                        }
                      }}
                      onReset={() => setCaptchaVerified(false)}
                    />
                  </div>

                  {/* Primary Call to Action Button */}
                  <Magnetic strength={0.15} className="w-full pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00f0ff] via-[#a200ff] to-[#ff0055] text-white font-extrabold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-[#00f0ff]/20"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          <span>Validating Credentials...</span>
                        </>
                      ) : (
                        <>
                          <span>{mode === 'login' ? 'Initiate Access' : 'Register Core ID'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </Magnetic>
                </form>

                {/* 1-Click Fast Test Login */}
                <div className="pt-2">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span className="font-mono uppercase tracking-wider">Quick Test Login</span>
                      <span className="text-emerald-400 font-bold">1-Click Auth</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('Amay Vikram Singh', 'amay@nexgen.ai', 'AS')}
                      className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center justify-between transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#a200ff] text-black font-black text-[10px] flex items-center justify-center">
                          A
                        </div>
                        <span className="text-gray-200 group-hover:text-white">Amay Vikram Singh (Pro Member)</span>
                      </div>
                      <span className="text-[#00f0ff] text-[11px] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Continue →
                      </span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                  By connecting, you agree to our{' '}
                  <Link to="/terms" className="text-gray-200 hover:text-[#00f0ff] underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-gray-200 hover:text-[#00f0ff] underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Social Auth Selection Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#0a0a12] rounded-3xl border border-white/10 p-6 space-y-6 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-2 pt-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center scale-125 mb-4">
                  {authProvider === 'Google' ? <GoogleIcon /> : <GithubIcon />}
                </div>
                <h3 className="text-xl font-bold text-white">Continue with {authProvider}</h3>
                <p className="text-xs text-gray-300">Choose an identity to authenticate</p>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'Amay Vikram Singh', email: 'amay.vikram@gmail.com', avatar: 'AS' },
                  { name: 'Developer Account', email: 'singhamayvikram08@gmail.com', avatar: 'AV' },
                ].map((acc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => completeSocialLogin(acc)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/10 border border-white/5 text-left transition-all group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs flex items-center justify-center shrink-0">
                      {acc.avatar}
                    </div>
                    <div className="flex-1 truncate">
                      <div className="text-xs font-bold text-white group-hover:text-[#00f0ff] transition-colors">{acc.name}</div>
                      <div className="text-[11px] text-gray-400 truncate">{acc.email}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => completeSocialLogin({ name: 'Guest Developer', email: 'dev@nexgen.io', avatar: 'GD' })}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-dashed border-white/10 hover:border-[#00f0ff]/40 text-xs font-bold text-[#00f0ff] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Authenticate Another Account</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent AI Copilot Assistant */}
      <ChatBox />
    </div>
  );
};

export default LoginPage;
