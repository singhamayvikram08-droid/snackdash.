import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Hexagon, Shield, Eye, CheckCircle2,
  RefreshCw, Zap, Server,
  Sliders, MessageSquare, Tag, Terminal, LogOut,
  ArrowUpRight, Power, AlertOctagon,
  Users, RotateCcw, Laptop,
  Activity, Radio, Copy, Check, Cpu, FileText
} from 'lucide-react';
import { useAuth } from '../utils/auth';
import { useSiteConfig, type ConsumerSiteConfig } from '../utils/siteConfig';
import { usePageSEO } from '../utils/usePageSEO';
import { 
  fetchLivenessProbe, 
  fetchReadinessProbe, 
  fetchStartupProbe, 
  toggleTrafficDrain,
  type LivenessProbeResult,
  type ReadinessProbeResult,
  type StartupProbeResult,
} from '../utils/probes';

interface AuditLog {
  id: string;
  ts: string;
  action: string;
  admin: string;
  type: 'update' | 'security' | 'lockdown';
}

const NextGenAiPortalPage = () => {
  usePageSEO({
    title: 'NEXT GEN AI — Master Administration & Consumer Site Control Portal',
    description: 'Autonomous Master Control Center for Next Gen AI. Admin-only portal to manage global announcements, hero configuration, feature kill-switches, pricing promotions, and site maintenance.',
  });

  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { config, updateConfig, resetConfig } = useSiteConfig();

  // Active Admin Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'hero' | 'announcement' | 'features' | 'pricing' | 'maintenance' | 'users' | 'probes' | 'audit'>('overview');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Cloud-Native Kubernetes Health Probes State (Admin Controlled)
  const [livenessData, setLivenessData] = useState<LivenessProbeResult | null>(null);
  const [readinessData, setReadinessData] = useState<ReadinessProbeResult | null>(null);
  const [startupData, setStartupData] = useState<StartupProbeResult | null>(null);
  const [isDraining, setIsDraining] = useState<boolean>(false);
  const [probingLive, setProbingLive] = useState<boolean>(false);
  const [probingReady, setProbingReady] = useState<boolean>(false);
  const [probingStartup, setProbingStartup] = useState<boolean>(false);
  const [autoPollProbes, setAutoPollProbes] = useState<boolean>(true);
  const [probeConsoleLogs, setProbeConsoleLogs] = useState<Array<{ text: string; type: 'info' | 'success' | 'warn' | 'error'; ts: string }>>([
    { text: '[INIT] Master Admin Health Probes subsystem online. CNCF Kubernetes v1.30 Matrix attached.', type: 'info', ts: new Date().toLocaleTimeString() },
  ]);
  const [copiedK8s, setCopiedK8s] = useState<boolean>(false);

  // Form states initialized from config
  const [formConfig, setFormConfig] = useState<ConsumerSiteConfig>(config);

  // Mock Registered Users list for admin control
  const [userDirectory, setUserDirectory] = useState([
    { id: 'usr-001', name: 'Amay Vikram Singh', email: 'developer@nexgen.io', role: 'Root Admin', tier: 'pro', status: 'ACTIVE' },
    { id: 'usr-002', name: 'Alex Vance', email: 'alex@blackmesa.gov', role: 'Enterprise Admin', tier: 'enterprise', status: 'ACTIVE' },
    { id: 'usr-003', name: 'Sarah Connor', email: 'sarah@cyberdyne.org', role: 'Member', tier: 'pro', status: 'ACTIVE' },
    { id: 'usr-004', name: 'David Bowman', email: 'david@discovery-one.io', role: 'Member', tier: 'free', status: 'ACTIVE' },
    { id: 'usr-005', name: 'Neo Anderson', email: 'neo@matrix-core.net', role: 'Member', tier: 'pro', status: 'SUSPENDED' },
  ]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'log-1', ts: new Date(Date.now() - 3600000).toLocaleTimeString(), action: 'Master Portal Initialized with CNCF Kubernetes Matrix', admin: 'Root Admin', type: 'security' },
    { id: 'log-2', ts: new Date(Date.now() - 1800000).toLocaleTimeString(), action: 'AI Chatbot Streaming Fallback Pool Configured', admin: 'Root Admin', type: 'update' },
  ]);

  // Keep local form in sync when config changes externally
  useEffect(() => {
    setFormConfig(config);
  }, [config]);

  // Check if current user is an authorized administrator
  const isAdmin = isAuthenticated && user && (user.role === 'Root Admin' || user.role === 'admin' || user.role === 'Enterprise Admin');

  // Redirection guard to dedicated /next-gen-ai/login if not authorized as Root Admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/next-gen-ai/login', { replace: true });
    }
  }, [isAdmin, navigate]);

  // Save changes to the Consumer Site
  const handleApplyConfig = (sectionName: string, updatedPart: Partial<ConsumerSiteConfig>) => {
    const next = updateConfig({
      ...updatedPart,
      updatedBy: user?.name || 'Root Admin',
    });
    setFormConfig(next);
    const ts = new Date().toLocaleTimeString();
    setAuditLogs(prev => [
      { id: `log-${Date.now()}`, ts, action: `Updated consumer site section: ${sectionName}`, admin: user?.name || 'Root Admin', type: 'update' },
      ...prev.slice(0, 20),
    ]);
    setSaveFeedback(`Consumer site successfully synchronized! (${sectionName} is live)`);
    setTimeout(() => setSaveFeedback(null), 3500);
  };

  const handleToggleMaintenance = () => {
    const nextState = !config.maintenanceMode.enabled;
    const next = updateConfig({
      maintenanceMode: {
        ...config.maintenanceMode,
        enabled: nextState,
      },
      updatedBy: user?.name || 'Root Admin',
    });
    setFormConfig(next);
    const ts = new Date().toLocaleTimeString();
    setAuditLogs(prev => [
      { id: `log-${Date.now()}`, ts, action: `Emergency Maintenance Mode toggled -> ${nextState ? 'LOCKED' : 'OPERATIONAL'}`, admin: user?.name || 'Root Admin', type: 'lockdown' },
      ...prev.slice(0, 20),
    ]);
    setSaveFeedback(nextState ? 'CONSUMER SITE LOCKED: Maintenance screen active for all visitors!' : 'CONSUMER SITE RESTORED: Full public operations resumed!');
    setTimeout(() => setSaveFeedback(null), 3500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to restore the consumer site to default factory settings?')) {
      resetConfig();
      setAuditLogs(prev => [
        { id: `log-${Date.now()}`, ts: new Date().toLocaleTimeString(), action: 'Factory defaults restored across consumer site', admin: user?.name || 'Root Admin', type: 'update' },
        ...prev.slice(0, 20),
      ]);
      setSaveFeedback('Consumer site restored to factory defaults.');
      setTimeout(() => setSaveFeedback(null), 3000);
    }
  };

  const handleToggleUserRole = (id: string) => {
    setUserDirectory(prev => prev.map(u => {
      if (u.id === id) {
        const nextRole = u.role === 'Root Admin' ? 'Member' : 'Root Admin';
        const nextTier = nextRole === 'Root Admin' ? 'enterprise' : 'pro';
        return { ...u, role: nextRole, tier: nextTier };
      }
      return u;
    }));
  };

  const handleToggleUserStatus = (id: string) => {
    setUserDirectory(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' };
      }
      return u;
    }));
  };

  // Kubernetes Probes Handlers
  const executeLivenessCheck = useCallback(async () => {
    setProbingLive(true);
    const start = performance.now();
    try {
      const data = await fetchLivenessProbe();
      const latency = (performance.now() - start).toFixed(1);
      setLivenessData(data);
      const ts = new Date().toLocaleTimeString();
      setProbeConsoleLogs(prev => [
        ...prev.slice(-15),
        { text: `[LIVENESS] GET /api/health/liveness -> HTTP ${data.statusCode} OK (${latency}ms) | Heap: ${data.checks.memory.heapUsedMB} MB / ${data.checks.memory.heapTotalMB} MB | Lag: ${data.checks.eventLoopLagMs}ms`, type: data.statusCode === 200 ? 'success' : 'error', ts }
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setProbeConsoleLogs(prev => [
        ...prev.slice(-15),
        { text: `[LIVENESS ERROR] GET /api/health/liveness failed: ${msg}`, type: 'error', ts: new Date().toLocaleTimeString() }
      ]);
    } finally {
      setProbingLive(false);
    }
  }, []);

  const executeReadinessCheck = useCallback(async () => {
    setProbingReady(true);
    const start = performance.now();
    try {
      const data = await fetchReadinessProbe();
      const latency = (performance.now() - start).toFixed(1);
      setReadinessData(data);
      setIsDraining(!data.acceptingTraffic);
      const ts = new Date().toLocaleTimeString();
      setProbeConsoleLogs(prev => [
        ...prev.slice(-15),
        { text: `[READINESS] GET /api/health/readiness -> HTTP ${data.statusCode} (${latency}ms) | Traffic: ${data.acceptingTraffic ? 'ACCEPTING' : 'DRAINING'} | AI: ${data.dependencies.aiGateway}`, type: data.statusCode === 200 ? 'success' : 'warn', ts }
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setProbeConsoleLogs(prev => [
        ...prev.slice(-15),
        { text: `[READINESS ERROR] GET /api/health/readiness failed: ${msg}`, type: 'error', ts: new Date().toLocaleTimeString() }
      ]);
    } finally {
      setProbingReady(false);
    }
  }, []);

  const executeStartupCheck = useCallback(async () => {
    setProbingStartup(true);
    const start = performance.now();
    try {
      const data = await fetchStartupProbe();
      const latency = (performance.now() - start).toFixed(1);
      setStartupData(data);
      const ts = new Date().toLocaleTimeString();
      setProbeConsoleLogs(prev => [
        ...prev.slice(-15),
        { text: `[STARTUP] GET /api/health/startup -> HTTP ${data.statusCode} (${latency}ms) | Boot Duration: ${data.bootDurationMs}ms | Subsystems: ${data.subsystems.length} initialized`, type: 'info', ts }
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setProbeConsoleLogs(prev => [
        ...prev.slice(-15),
        { text: `[STARTUP ERROR] GET /api/health/startup failed: ${msg}`, type: 'error', ts: new Date().toLocaleTimeString() }
      ]);
    } finally {
      setProbingStartup(false);
    }
  }, []);

  const handleToggleDrain = async () => {
    try {
      const nextDrain = !isDraining;
      await toggleTrafficDrain(nextDrain);
      setIsDraining(nextDrain);
      const ts = new Date().toLocaleTimeString();
      setProbeConsoleLogs(prev => [
        ...prev.slice(-15),
        {
          text: `[TRAFFIC DRAIN] Readiness state updated: ${nextDrain ? 'DRAINING (HTTP 503 Service Unavailable)' : 'RESTORED (HTTP 200 OK)'}`,
          type: nextDrain ? 'warn' : 'success',
          ts,
        },
      ]);
      await executeReadinessCheck();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setProbeConsoleLogs(prev => [
        ...prev.slice(-15),
        { text: `[TRAFFIC DRAIN ERROR] Failed to toggle drain status: ${msg}`, type: 'error', ts: new Date().toLocaleTimeString() }
      ]);
    }
  };

  const executeAllProbes = useCallback(async () => {
    await Promise.allSettled([
      executeLivenessCheck(),
      executeReadinessCheck(),
      executeStartupCheck()
    ]);
  }, [executeLivenessCheck, executeReadinessCheck, executeStartupCheck]);

  // Initial and auto-poll probe checks
  useEffect(() => {
    executeAllProbes();
  }, [executeAllProbes]);

  useEffect(() => {
    if (!autoPollProbes) return;
    const interval = setInterval(() => {
      executeAllProbes();
    }, 6000);
    return () => clearInterval(interval);
  }, [autoPollProbes, executeAllProbes]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#020205] text-white flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-[#ff0055] animate-spin" />
          <span className="text-xs text-gray-400">Verifying Next Gen AI Admin Clearance...</span>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW B: NEXT GEN AI MASTER CONTROL MATRIX (AUTHENTICATED ROOT ADMIN)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#030307] text-white flex flex-col font-sans selection:bg-[#00f0ff] selection:text-black">
      
      {/* ── 1. MASTER PORTAL HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#05050b]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <Link to="/next-gen-ai" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00f0ff] blur-md opacity-50 group-hover:opacity-100 transition-opacity rounded-full" />
              <Hexagon className="w-8 h-8 text-[#00f0ff] relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black uppercase tracking-wider text-white">NEXT GEN AI</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-gradient-to-r from-[#00f0ff]/20 to-[#a200ff]/20 border border-[#00f0ff]/40 text-[#00f0ff]">
                  MASTER PORTAL
                </span>
              </div>
              <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE CONSUMER CONTROLLER · CLEARANCE L5</span>
              </p>
            </div>
          </Link>
        </div>

        {/* Global Live Actions */}
        <div className="flex items-center gap-3">
          {/* Quick link to live consumer site */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-gray-200 hover:text-white transition-all"
            title="Open consumer site in new tab to observe live changes"
          >
            <Laptop className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Open Consumer Site</span>
            <ArrowUpRight className="w-3 h-3 text-gray-400" />
          </a>

          {/* Emergency Maintenance Lockdown Button */}
          <button
            onClick={handleToggleMaintenance}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-2 cursor-pointer shadow-md ${
              config.maintenanceMode.enabled
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{config.maintenanceMode.enabled ? 'LOCKDOWN: ACTIVE (UNLOCK)' : 'SITE LOCKDOWN'}</span>
          </button>

          {/* Admin User Profile & Sign Out */}
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#a200ff] flex items-center justify-center text-black font-black text-xs">
              {user?.avatar || 'RA'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-white">{user?.name || 'Amay Vikram Singh'}</div>
              <div className="text-[10px] font-mono text-[#00f0ff] uppercase">{user?.role || 'Root Admin'}</div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/next-gen-ai');
              }}
              title="Sign Out of Next Gen AI Portal"
              className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. PORTAL NAVIGATION TABS ── */}
      <div className="sticky top-[73px] z-40 bg-[#070712]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-2.5 overflow-x-auto no-scrollbar shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          {[
            { id: 'overview', label: 'Master Dashboard', icon: Server, badge: 'LIVE' },
            { id: 'announcement', label: 'Top Announcement Banner', icon: MessageSquare, badge: config.announcement.enabled ? 'ON' : 'OFF' },
            { id: 'hero', label: 'Hero Headline & Copy', icon: Sliders, badge: 'LIVE' },
            { id: 'features', label: 'Feature Kill-Switches', icon: Zap, badge: '4/4' },
            { id: 'pricing', label: 'Pricing & Discounts', icon: Tag, badge: config.pricing.discountActive ? '50% OFF' : 'NORMAL' },
            { id: 'maintenance', label: 'Maintenance Lockdown', icon: Power, badge: config.maintenanceMode.enabled ? 'LOCKED' : 'OFF' },
            { id: 'users', label: 'User & Access Matrix', icon: Users, badge: `${userDirectory.length}` },
            { id: 'probes', label: 'Health Probes (K8s)', icon: Activity, badge: readinessData?.statusCode === 503 ? 'DRAIN' : '3/3 UP' },
            { id: 'audit', label: 'Security & Audit Log', icon: Terminal, badge: `${auditLogs.length}` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'hero' | 'announcement' | 'features' | 'pricing' | 'maintenance' | 'users' | 'probes' | 'audit')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 select-none ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold shadow-lg shadow-[#00f0ff]/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/15'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-black' : 'text-[#00f0ff]'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                  activeTab === tab.id ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Toast */}
      <AnimatePresence>
        {saveFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 fill-black text-white" />
            <span>{saveFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. MAIN PORTAL WORKSPACE ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">

        {/* ══════════════════════════════════════════════════════════════
            TAB 1: MASTER OVERVIEW
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Master Portal Welcome Banner */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#00f0ff]/10 via-[#a200ff]/10 to-transparent border border-white/10 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 text-xs font-mono font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>NEXT GEN AI :: FULL REIGN CONTROLLER</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Consumer Site Command Center
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Every change made here broadcasts instantaneously via <code>BroadcastChannel</code> and persistent cloud state to the live consumer frontend. Control branding, announcements, feature killswitches, pricing promos, and emergency maintenance.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <button
                  onClick={handleResetDefaults}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-xs font-mono text-gray-300 hover:text-rose-300 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Factory Defaults</span>
                </button>
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-[#00f0ff]/20"
                >
                  <Eye className="w-4 h-4 fill-black" />
                  <span>View Live Consumer Site</span>
                </a>
              </div>
            </div>

            {/* Live Controller Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-3xl bg-[#070712] border border-white/10 space-y-2">
                <div className="text-xs font-mono text-gray-400 uppercase">Consumer Site State</div>
                <div className={`text-2xl font-black font-mono ${config.maintenanceMode.enabled ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {config.maintenanceMode.enabled ? 'LOCKED (MAINTENANCE)' : 'OPERATIONAL (200 OK)'}
                </div>
                <div className="text-[11px] text-gray-500">Public ingress gate</div>
              </div>

              <div className="p-6 rounded-3xl bg-[#070712] border border-white/10 space-y-2">
                <div className="text-xs font-mono text-gray-400 uppercase">Top Announcement</div>
                <div className="text-2xl font-black font-mono text-[#00f0ff]">
                  {config.announcement.enabled ? 'BROADCASTING' : 'DISABLED'}
                </div>
                <div className="text-[11px] text-gray-500">{config.announcement.badge} banner active</div>
              </div>

              <div className="p-6 rounded-3xl bg-[#070712] border border-white/10 space-y-2">
                <div className="text-xs font-mono text-gray-400 uppercase">AI Copilot Floating Bot</div>
                <div className="text-2xl font-black font-mono text-purple-400">
                  {config.features.enableChatbot ? 'ENABLED (LIVE)' : 'OFFLINE (KILLSWITCH)'}
                </div>
                <div className="text-[11px] text-gray-500">recursive/flint-v1.0 streaming</div>
              </div>

              <div className="p-6 rounded-3xl bg-[#070712] border border-white/10 space-y-2">
                <div className="text-xs font-mono text-gray-400 uppercase">Pricing Promo Engine</div>
                <div className="text-2xl font-black font-mono text-amber-400">
                  {config.pricing.discountActive ? `${config.pricing.discountPercent}% OFF ACTIVE` : 'STANDARD TIER'}
                </div>
                <div className="text-[11px] text-gray-500">Automatic cart discount override</div>
              </div>
            </div>

            {/* Quick Action Matrix Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-6 rounded-3xl bg-[#070712] border border-white/10 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#00f0ff]">
                    <MessageSquare className="w-5 h-5" />
                    <h3 className="font-extrabold text-base text-white">Announcement Broadcast</h3>
                  </div>
                  <p className="text-xs text-gray-400">
                    Instantly broadcast emergency notices, product launches, or discount tags on the consumer header.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('announcement')}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-gray-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Configure Announcement</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-[#070712] border border-white/10 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Sliders className="w-5 h-5" />
                    <h3 className="font-extrabold text-base text-white">Hero Copy & Brand Editor</h3>
                  </div>
                  <p className="text-xs text-gray-400">
                    Rewrite the main hero headline, gradient keywords, subtitle, and primary CTA button dynamically.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('hero')}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-gray-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Edit Hero Section</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-[#070712] border border-white/10 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-rose-400">
                    <Zap className="w-5 h-5" />
                    <h3 className="font-extrabold text-base text-white">Kill-Switches & Features</h3>
                  </div>
                  <p className="text-xs text-gray-400">
                    Toggle AI Copilot, 3D Spatial Cockpit, public signups, and heavy 3D canvas streams.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('features')}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-gray-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Manage Feature Flags</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-[#070712] border border-white/10 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Activity className="w-5 h-5" />
                    <h3 className="font-extrabold text-base text-white">Kubernetes Health Probes</h3>
                  </div>
                  <p className="text-xs text-gray-400">
                    Live CNCF container lifecycle checks (Liveness, Readiness, Startup) and zero-downtime traffic draining.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('probes')}
                  className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Inspect Health Probes</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 2: TOP ANNOUNCEMENT BANNER CONTROLLER
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'announcement' && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Top Announcement & Broadcast Banner</h2>
                <p className="text-xs text-gray-400">Broadcasts a persistent global banner at the top of the consumer site.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = !formConfig.announcement.enabled;
                    setFormConfig(p => ({ ...p, announcement: { ...p.announcement, enabled: next } }));
                    handleApplyConfig('Announcement Toggle', { announcement: { ...formConfig.announcement, enabled: next } });
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                    formConfig.announcement.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/5 text-gray-400 border-white/10'
                  }`}
                >
                  {formConfig.announcement.enabled ? 'BANNER: ACTIVE' : 'BANNER: DISABLED'}
                </button>
              </div>
            </div>

            {/* Live Preview */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Live Banner Preview on Consumer Site</span>
              <div className={`w-full py-2 px-4 rounded-xl flex flex-wrap items-center justify-center gap-2.5 text-xs font-medium border ${
                formConfig.announcement.type === 'promo' ? 'bg-gradient-to-r from-purple-500/20 via-[#00f0ff]/20 to-purple-500/20 border-purple-500/40 text-purple-200' :
                formConfig.announcement.type === 'alert' ? 'bg-rose-500/20 border-rose-500/40 text-rose-200' :
                formConfig.announcement.type === 'info' ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200' :
                'bg-gradient-to-r from-[#00f0ff]/20 via-[#a200ff]/20 to-[#ff0055]/20 border-[#00f0ff]/40 text-white'
              }`}>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/20 text-white">
                  {formConfig.announcement.badge || 'NOTICE'}
                </span>
                <span>{formConfig.announcement.text || 'Announcement text goes here...'}</span>
                <span className="underline font-bold text-xs ml-1 cursor-pointer">
                  {formConfig.announcement.actionText || 'Learn More →'}
                </span>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 rounded-3xl bg-[#070712] border border-white/10 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300">Badge Label</label>
                  <input
                    type="text"
                    value={formConfig.announcement.badge}
                    onChange={(e) => setFormConfig(p => ({ ...p, announcement: { ...p.announcement, badge: e.target.value } }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-mono outline-none focus:border-[#00f0ff]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300">Theme Style</label>
                  <select
                    value={formConfig.announcement.type}
                    onChange={(e) => setFormConfig(p => ({ ...p, announcement: { ...p.announcement, type: e.target.value as 'cyber' | 'promo' | 'alert' | 'info' } }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090915] border border-white/10 text-sm text-white font-mono outline-none focus:border-[#00f0ff]"
                  >
                    <option value="cyber">Cyber Multi-Color Gradient</option>
                    <option value="promo">Neon Purple Promo</option>
                    <option value="alert">Emergency Rose Alert</option>
                    <option value="info">Cyan Info</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-300">Announcement Broadcast Message</label>
                <input
                  type="text"
                  value={formConfig.announcement.text}
                  onChange={(e) => setFormConfig(p => ({ ...p, announcement: { ...p.announcement, text: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-mono outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300">Action Button Text</label>
                  <input
                    type="text"
                    value={formConfig.announcement.actionText}
                    onChange={(e) => setFormConfig(p => ({ ...p, announcement: { ...p.announcement, actionText: e.target.value } }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-mono outline-none focus:border-[#00f0ff]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300">Target Link or Anchor</label>
                  <input
                    type="text"
                    value={formConfig.announcement.actionLink}
                    onChange={(e) => setFormConfig(p => ({ ...p, announcement: { ...p.announcement, actionLink: e.target.value } }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-mono outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleApplyConfig('Announcement Banner', { announcement: formConfig.announcement })}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[#00f0ff]/20"
              >
                Apply Announcement to Consumer Site
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 3: HERO HEADLINE & COPY CONTROLLER
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'hero' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-2xl font-black text-white">Consumer Hero Section Controller</h2>
              <p className="text-xs text-gray-400">Controls the primary title, subtitle, status badge, and call-to-action on the homepage.</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#070712] border border-white/10 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300">Primary Headline Word</label>
                  <input
                    type="text"
                    value={formConfig.hero.customHeadline}
                    onChange={(e) => setFormConfig(p => ({ ...p, hero: { ...p.hero, customHeadline: e.target.value } }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-mono outline-none focus:border-[#00f0ff]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300">Gradient Keyword</label>
                  <input
                    type="text"
                    value={formConfig.hero.customGradientWord}
                    onChange={(e) => setFormConfig(p => ({ ...p, hero: { ...p.hero, customGradientWord: e.target.value } }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-mono outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-300">Status Badge Text</label>
                <input
                  type="text"
                  value={formConfig.hero.statusBadge}
                  onChange={(e) => setFormConfig(p => ({ ...p, hero: { ...p.hero, statusBadge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-mono outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-300">Subtitle Override (Leave blank for default autonomous bio)</label>
                <textarea
                  rows={3}
                  value={formConfig.hero.customSubtitle}
                  onChange={(e) => setFormConfig(p => ({ ...p, hero: { ...p.hero, customSubtitle: e.target.value } }))}
                  placeholder="Leave empty to use official system description, or enter custom marketing message..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-mono outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-300">Primary CTA Button Label</label>
                <input
                  type="text"
                  value={formConfig.hero.primaryCtaText}
                  onChange={(e) => setFormConfig(p => ({ ...p, hero: { ...p.hero, primaryCtaText: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-mono outline-none focus:border-[#00f0ff]"
                />
              </div>

              <button
                type="button"
                onClick={() => handleApplyConfig('Hero Section Copy', { hero: formConfig.hero })}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[#00f0ff]/20"
              >
                Apply Hero Changes to Consumer Site
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 4: FEATURE FLAGS & KILL-SWITCHES
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'features' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-2xl font-black text-white">Consumer Feature Flags & Kill-Switches</h2>
              <p className="text-xs text-gray-400">Instantly enable or disable individual capabilities on the public consumer site.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  key: 'enableChatbot',
                  title: 'AI Copilot Floating ChatBox',
                  desc: 'Renders the live OpenRouter streaming AI Copilot on the landing page and login screen.',
                  current: formConfig.features.enableChatbot,
                },
                {
                  key: 'enableCockpitSection',
                  title: '3D Spatial Cockpit Preview Section',
                  desc: 'Renders the interactive 3D WebGL Cockpit teaser section on the consumer homepage.',
                  current: formConfig.features.enableCockpitSection,
                },
                {
                  key: 'enablePublicSignups',
                  title: 'Public User Registrations',
                  desc: 'Allows new consumers to create accounts. When disabled, signups are set to private invite-only.',
                  current: formConfig.features.enablePublicSignups,
                },
                {
                  key: 'enableShowcaseStream',
                  title: 'Showcase Video & Shader Mesh',
                  desc: 'Renders high-definition spatial computing video streams on the landing page.',
                  current: formConfig.features.enableShowcaseStream,
                },
              ].map(feat => (
                <div key={feat.key} className="p-6 rounded-3xl bg-[#070712] border border-white/10 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm text-white">{feat.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        feat.current ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {feat.current ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = !feat.current;
                      const nextFeatures = { ...formConfig.features, [feat.key]: next };
                      setFormConfig(p => ({ ...p, features: nextFeatures }));
                      handleApplyConfig(`Feature Toggle: ${feat.title}`, { features: nextFeatures });
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                      feat.current
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    {feat.current ? 'Disable Feature' : 'Enable Feature'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 5: PRICING & PROMOTIONS ENGINE
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'pricing' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-2xl font-black text-white">Pricing & Promotional Campaign Controller</h2>
              <p className="text-xs text-gray-400">Injects site-wide discount tags and applies dynamic cart discounts on consumer pricing cards.</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#070712] border border-white/10 space-y-5">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
                <div>
                  <div className="text-sm font-bold text-white">Global Campaign Discount</div>
                  <div className="text-xs text-gray-400">When enabled, slashes pricing numbers across all consumer plans.</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !formConfig.pricing.discountActive;
                    setFormConfig(p => ({ ...p, pricing: { ...p.pricing, discountActive: next } }));
                    handleApplyConfig('Pricing Discount Toggle', { pricing: { ...formConfig.pricing, discountActive: next } });
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                    formConfig.pricing.discountActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/5 text-gray-400 border-white/10'
                  }`}
                >
                  {formConfig.pricing.discountActive ? 'DISCOUNT: ACTIVE' : 'DISCOUNT: INACTIVE'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300">Discount Percentage (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="90"
                    value={formConfig.pricing.discountPercent}
                    onChange={(e) => setFormConfig(p => ({ ...p, pricing: { ...p.pricing, discountPercent: Number(e.target.value) } }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-mono outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300">Promotional Badge Tag</label>
                  <input
                    type="text"
                    value={formConfig.pricing.promoTag}
                    onChange={(e) => setFormConfig(p => ({ ...p, pricing: { ...p.pricing, promoTag: e.target.value } }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-mono outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleApplyConfig('Pricing Campaign Settings', { pricing: formConfig.pricing })}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[#00f0ff]/20"
              >
                Publish Pricing Campaign
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 6: MAINTENANCE LOCKDOWN GATE
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6 max-w-4xl">
            <div className={`p-6 rounded-3xl border space-y-4 ${
              config.maintenanceMode.enabled ? 'bg-rose-500/10 border-rose-500/40' : 'bg-[#070712] border-white/10'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${config.maintenanceMode.enabled ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-gray-400'}`}>
                    <AlertOctagon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Emergency Consumer Site Lockdown</h2>
                    <p className="text-xs text-gray-400">Intercepts all public consumer visitors with a scheduled maintenance splash screen.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleMaintenance}
                  className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                    config.maintenanceMode.enabled
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {config.maintenanceMode.enabled ? 'Disable Lockdown (Restore Public)' : 'Activate Site Lockdown'}
                </button>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/5">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-300">Lockdown Screen Headline</label>
                  <input
                    type="text"
                    value={formConfig.maintenanceMode.title}
                    onChange={(e) => setFormConfig(p => ({ ...p, maintenanceMode: { ...p.maintenanceMode, title: e.target.value } }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-mono outline-none focus:border-rose-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-300">Lockdown Public Message</label>
                  <textarea
                    rows={2}
                    value={formConfig.maintenanceMode.message}
                    onChange={(e) => setFormConfig(p => ({ ...p, maintenanceMode: { ...p.maintenanceMode, message: e.target.value } }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-mono outline-none focus:border-rose-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-300">Estimated Resumption Time</label>
                  <input
                    type="text"
                    value={formConfig.maintenanceMode.estimatedUptime}
                    onChange={(e) => setFormConfig(p => ({ ...p, maintenanceMode: { ...p.maintenanceMode, estimatedUptime: e.target.value } }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-mono outline-none focus:border-rose-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyConfig('Maintenance Screen Copy', { maintenanceMode: formConfig.maintenanceMode })}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase font-bold transition-all cursor-pointer"
                >
                  Update Maintenance Screen Text
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 7: USER & ACCESS MATRIX
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Registered Users & Permission Governance</h2>
                <p className="text-xs text-gray-400">View registered accounts, grant or revoke Root Admin status, and suspend rogue consumers.</p>
              </div>
              <span className="text-xs font-mono text-gray-400">{userDirectory.length} Accounts Registered</span>
            </div>

            <div className="rounded-3xl bg-[#070712] border border-white/10 overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-gray-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Tier</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {userDirectory.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[11px] text-gray-500">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'Root Admin' ? 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/40' : 'bg-white/10 text-gray-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-[#00f0ff] uppercase">{u.tier}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleUserRole(u.id)}
                          className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-gray-300 hover:text-white transition-all cursor-pointer"
                        >
                          {u.role === 'Root Admin' ? 'Demote to Member' : 'Promote to Admin'}
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-2.5 py-1 rounded border text-[10px] transition-all cursor-pointer ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 6: CLOUD-NATIVE HEALTH PROBES (LIVENESS, READINESS, STARTUP)
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'probes' && (
          <motion.div
            key="probes"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 w-full max-w-full overflow-hidden"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff] text-xs font-bold uppercase tracking-widest mb-3">
                  <Activity className="w-3.5 h-3.5 text-[#00f0ff] animate-pulse" />
                  <span>CNCF KUBERNETES PROBES :: v1.30</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
                  <span>Health & Lifecycle Probes</span>
                </h1>
                <p className="text-gray-300 text-sm mt-1 max-w-3xl">
                  Inspect and trigger container lifecycle probes: <strong>Liveness</strong> (process vitality), <strong>Readiness</strong> (traffic ingress gate), and <strong>Startup</strong> (bootstrap protection) adhering to cloud-native microservice architecture.
                </p>
              </div>

              {/* Action Controls */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={() => setAutoPollProbes(!autoPollProbes)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    autoPollProbes 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                  title="Toggle 6-second automatic polling"
                >
                  <Radio className={`w-3.5 h-3.5 ${autoPollProbes ? 'animate-pulse text-emerald-400' : 'text-gray-500'}`} />
                  <span>{autoPollProbes ? 'Auto-Poll (6s): ACTIVE' : 'Auto-Poll: PAUSED'}</span>
                </button>

                <button
                  onClick={() => executeAllProbes()}
                  disabled={probingLive || probingReady || probingStartup}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#00f0ff]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${(probingLive || probingReady || probingStartup) ? 'animate-spin' : ''}`} />
                  <span>Execute All Probes</span>
                </button>
              </div>
            </div>

            {/* 3 Core Interactive Probe Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* CARD 1: LIVENESS PROBE */}
              <div className="rounded-3xl bg-[#080811] border border-white/10 p-6 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-[#00f0ff]/40 transition-all shadow-xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00f0ff] to-cyan-500" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff]">
                        <Zap className="w-4 h-4 fill-[#00f0ff]" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-white">Liveness Probe</h3>
                        <p className="text-[11px] font-mono text-[#00f0ff]">/api/health/liveness</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      HTTP {livenessData?.statusCode || 200} UP
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    Determines if the container is running and healthy. If this probe fails repeatedly, the kubelet kills the container and initiates a restart.
                  </p>

                  <div className="space-y-2.5 bg-black/40 rounded-2xl p-4 border border-white/5 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Process State:</span>
                      <span className="text-emerald-400 font-bold">{livenessData?.checks.process || 'RUNNING'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Heap Allocation:</span>
                      <span className="text-white">
                        {livenessData?.checks.memory.heapUsedMB || 74.4} / {livenessData?.checks.memory.heapTotalMB || 95.8} MB
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Heap Utilization:</span>
                      <span className="text-cyan-400">{livenessData?.checks.memory.heapUtilizationPct || 77.7}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Event Loop Lag:</span>
                      <span className="text-emerald-400">{livenessData?.checks.eventLoopLagMs || 0.65} ms</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <span className="text-gray-400">Process Uptime:</span>
                      <span className="text-[#00f0ff] font-bold">{livenessData?.uptimeSeconds || 360}s</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => executeLivenessCheck()}
                  disabled={probingLive}
                  className="w-full py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${probingLive ? 'animate-spin' : ''}`} />
                  <span>Execute Liveness Probe</span>
                </button>
              </div>

              {/* CARD 2: READINESS PROBE */}
              <div className="rounded-3xl bg-[#080811] border border-white/10 p-6 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-[#a200ff]/40 transition-all shadow-xl">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isDraining ? 'from-amber-400 to-rose-500' : 'from-[#a200ff] to-purple-500'}`} />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-white">Readiness Probe</h3>
                        <p className="text-[11px] font-mono text-purple-300">/api/health/readiness</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${isDraining ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'}`}>
                      HTTP {readinessData?.statusCode || (isDraining ? 503 : 200)} {isDraining ? 'DRAINING' : 'READY'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    Determines if the pod is ready to accept client requests. If this probe fails, the pod is removed from Kubernetes service load balancers without being killed.
                  </p>

                  <div className="space-y-2.5 bg-black/40 rounded-2xl p-4 border border-white/5 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Traffic Ingress:</span>
                      <span className={`font-bold ${isDraining ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {isDraining ? 'DRAINING (HTTP 503)' : 'ACCEPTING (HTTP 200)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">AI Upstream Gateway:</span>
                      <span className="text-emerald-400 font-bold">{readinessData?.dependencies.aiGateway || 'HEALTHY'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Rate Limiter Window:</span>
                      <span className="text-cyan-400">{readinessData?.dependencies.rateLimiter || 'INITIALIZED'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Zero-Trust RBAC:</span>
                      <span className="text-purple-400">{readinessData?.dependencies.zeroTrustRbac || 'ACTIVE'}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <span className="text-gray-400">Persistence Store:</span>
                      <span className="text-white font-bold">{readinessData?.dependencies.storage || 'CONNECTED'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => executeReadinessCheck()}
                    disabled={probingReady}
                    className="flex-1 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${probingReady ? 'animate-spin' : ''}`} />
                    <span>Test Probe</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleDrain}
                    className={`px-3 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                      isDraining
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                        : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                    }`}
                    title="Simulate Kubernetes pod traffic drain / failover (Toggles HTTP 200 vs 503)"
                  >
                    {isDraining ? 'Restore Traffic (200)' : 'Simulate Drain (503)'}
                  </button>
                </div>
              </div>

              {/* CARD 3: STARTUP PROBE */}
              <div className="rounded-3xl bg-[#080811] border border-white/10 p-6 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-[#ff0055]/40 transition-all shadow-xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0055] to-rose-500" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#ff0055]/10 border border-[#ff0055]/30 flex items-center justify-center text-[#ff0055]">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-white">Startup Probe</h3>
                        <p className="text-[11px] font-mono text-[#ff0055]">/api/health/startup</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      HTTP {startupData?.statusCode || 200} STARTED
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    Protects slow-starting containers. When configured, all other probes are disabled until this probe succeeds, preventing premature kills during model weights loading.
                  </p>

                  <div className="space-y-2 bg-black/40 rounded-2xl p-4 border border-white/5 font-mono text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-white/5">
                      <span className="text-gray-400">Boot Duration:</span>
                      <span className="text-emerald-400 font-bold">{startupData?.bootDurationMs || 28} ms</span>
                    </div>
                    <div className="space-y-1.5 pt-1 text-[11px]">
                      {(startupData?.subsystems || [
                        { name: 'Helmet Security Headers', initialized: true },
                        { name: 'Rate Limiter Sliding Window', initialized: true },
                        { name: 'OpenRouter AI Gateway Stream', initialized: true },
                        { name: 'RBAC Authorization Engine', initialized: true },
                        { name: 'Structured JSON Logging', initialized: true },
                      ]).map((sub, i) => (
                        <div key={i} className="flex items-center justify-between text-gray-300">
                          <span className="truncate">{sub.name}</span>
                          <span className="text-emerald-400 font-bold text-[10px]">READY</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => executeStartupCheck()}
                  disabled={probingStartup}
                  className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${probingStartup ? 'animate-spin' : ''}`} />
                  <span>Verify Startup Sequence</span>
                </button>
              </div>

            </div>

            {/* Live Interactive Probe Execution Console & Kubernetes Manifest */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Terminal Execution Logs */}
              <div className="rounded-3xl bg-[#06060c] border border-white/10 p-6 flex flex-col justify-between space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#00f0ff]" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">Live Probe Execution Console</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setProbeConsoleLogs([])}
                      className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-gray-400 hover:text-white transition-all cursor-pointer"
                    >
                      Clear Logs
                    </button>
                  </div>
                </div>

                {/* Log Terminal Window */}
                <div className="h-64 bg-black/80 rounded-2xl p-4 font-mono text-[11px] overflow-y-auto no-scrollbar space-y-2 border border-white/5">
                  {probeConsoleLogs.map((log, index) => (
                    <div 
                      key={index}
                      className={`leading-relaxed break-all ${
                        log.type === 'success' ? 'text-emerald-400' :
                        log.type === 'warn' ? 'text-amber-400' :
                        log.type === 'error' ? 'text-rose-400' : 'text-cyan-300'
                      }`}
                    >
                      <span className="text-gray-500 mr-2">[{log.ts}]</span>
                      <span>{log.text}</span>
                    </div>
                  ))}
                  {probeConsoleLogs.length === 0 && (
                    <div className="text-gray-600 italic">No logs recorded. Execute a probe check above.</div>
                  )}
                </div>

                {/* Shortcut Curl Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-[11px] font-mono text-gray-500">Quick Test:</span>
                  {[
                    { label: 'curl /live', action: executeLivenessCheck },
                    { label: 'curl /ready', action: executeReadinessCheck },
                    { label: 'curl /startup', action: executeStartupCheck },
                    { label: 'curl /health', action: executeAllProbes },
                  ].map((btn, i) => (
                    <button
                      key={i}
                      onClick={btn.action}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#00f0ff]/15 border border-white/10 hover:border-[#00f0ff]/30 text-[10px] font-mono text-gray-300 hover:text-[#00f0ff] transition-all cursor-pointer"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kubernetes Deployment YAML Manifest Viewer */}
              <div className="rounded-3xl bg-[#06060c] border border-white/10 p-6 flex flex-col justify-between space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">Kubernetes Manifest Spec (k8s/deployment.yaml)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const yamlContent = `startupProbe:
  httpGet:
    path: /api/health/startup
    port: 5173
  initialDelaySeconds: 2
  periodSeconds: 3
  timeoutSeconds: 2
  failureThreshold: 20
livenessProbe:
  httpGet:
    path: /api/health/liveness
    port: 5173
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 3
readinessProbe:
  httpGet:
    path: /api/health/readiness
    port: 5173
  initialDelaySeconds: 3
  periodSeconds: 5
  timeoutSeconds: 2
  failureThreshold: 2`;
                        navigator.clipboard.writeText(yamlContent);
                        setCopiedK8s(true);
                        setTimeout(() => setCopiedK8s(false), 2000);
                      }}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedK8s ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                          <span>Copy YAML</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Preformatted YAML Spec */}
                <div className="h-64 bg-black/80 rounded-2xl p-4 font-mono text-[11px] overflow-y-auto no-scrollbar border border-white/5 text-gray-300 leading-relaxed">
                  <span className="text-gray-500"># Container Health Probes Specification</span>{'\n'}
                  <span className="text-purple-400">startupProbe:</span>{'\n'}
                  {'  '}<span className="text-cyan-400">httpGet:</span>{'\n'}
                  {'    '}<span className="text-gray-400">path:</span> <span className="text-emerald-400">/api/health/startup</span>{'\n'}
                  {'    '}<span className="text-gray-400">port:</span> <span className="text-amber-400">5173</span>{'\n'}
                  {'  '}<span className="text-gray-400">initialDelaySeconds:</span> <span className="text-amber-400">2</span>{'\n'}
                  {'  '}<span className="text-gray-400">periodSeconds:</span> <span className="text-amber-400">3</span>{'\n'}
                  {'  '}<span className="text-gray-400">failureThreshold:</span> <span className="text-amber-400">20</span>{'\n\n'}
                  <span className="text-purple-400">livenessProbe:</span>{'\n'}
                  {'  '}<span className="text-cyan-400">httpGet:</span>{'\n'}
                  {'    '}<span className="text-gray-400">path:</span> <span className="text-emerald-400">/api/health/liveness</span>{'\n'}
                  {'    '}<span className="text-gray-400">port:</span> <span className="text-amber-400">5173</span>{'\n'}
                  {'  '}<span className="text-gray-400">initialDelaySeconds:</span> <span className="text-amber-400">5</span>{'\n'}
                  {'  '}<span className="text-gray-400">periodSeconds:</span> <span className="text-amber-400">10</span>{'\n'}
                  {'  '}<span className="text-gray-400">failureThreshold:</span> <span className="text-amber-400">3</span>{'\n\n'}
                  <span className="text-purple-400">readinessProbe:</span>{'\n'}
                  {'  '}<span className="text-cyan-400">httpGet:</span>{'\n'}
                  {'    '}<span className="text-gray-400">path:</span> <span className="text-emerald-400">/api/health/readiness</span>{'\n'}
                  {'    '}<span className="text-gray-400">port:</span> <span className="text-amber-400">5173</span>{'\n'}
                  {'  '}<span className="text-gray-400">initialDelaySeconds:</span> <span className="text-amber-400">3</span>{'\n'}
                  {'  '}<span className="text-gray-400">periodSeconds:</span> <span className="text-amber-400">5</span>{'\n'}
                  {'  '}<span className="text-gray-400">failureThreshold:</span> <span className="text-amber-400">2</span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-2 border-t border-white/5">
                  <span>Conforming to CNCF Cloud Native Standards</span>
                  <span className="text-emerald-400">Zero-Downtime Rolling Update</span>
                </div>
              </div>

            </div>
          </motion.div>
        )}



        {/* ══════════════════════════════════════════════════════════════
            TAB 8: SECURITY & AUDIT LOG
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Security & Configuration Audit Stream</h2>
                <p className="text-xs text-gray-400">Cryptographically correlated history of all modifications applied to the live consumer frontend.</p>
              </div>
              <button
                onClick={() => setAuditLogs([])}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                Clear History
              </button>
            </div>

            <div className="rounded-3xl bg-[#06060c] border border-white/10 p-6 font-mono text-xs space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">[{log.ts}]</span>
                    <span className={`font-bold ${
                      log.type === 'lockdown' ? 'text-rose-400' : log.type === 'security' ? 'text-[#ff0055]' : 'text-cyan-300'
                    }`}>
                      {log.action}
                    </span>
                  </div>
                  <span className="text-gray-400 text-[11px]">Operator: <strong>{log.admin}</strong></span>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-gray-500 italic text-center py-6">No audit records in session.</div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default NextGenAiPortalPage;
