import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Check, Sliders, Cpu, Activity, Sparkles, Lock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { analytics } from '../utils/analytics';

export interface CookiePreferences {
  essential: boolean;
  telemetry: boolean;
  spatialCache: boolean;
  personalization: boolean;
  timestamp: string;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  telemetry: true,
  spatialCache: true,
  personalization: false,
  timestamp: new Date().toISOString(),
};

const CookieConsentBanner = () => {
  const location = useLocation();
  const isCockpit = location.pathname.startsWith('/cockpit');

  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('nexgen_cookie_consent');
  });

  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    try {
      const saved = localStorage.getItem('nexgen_cookie_consent');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_PREFERENCES;
  });

  // Listen for global open requests (e.g. from footer link or settings)
  useEffect(() => {
    const handleOpen = () => {
      setShowPreferencesModal(true);
      setIsVisible(true);
    };
    window.addEventListener('open-cookie-preferences', handleOpen);
    return () => window.removeEventListener('open-cookie-preferences', handleOpen);
  }, []);

  const saveAndClose = (prefs: CookiePreferences, trackType: string) => {
    const data = { ...prefs, timestamp: new Date().toISOString() };
    localStorage.setItem('nexgen_cookie_consent', JSON.stringify(data));
    setPreferences(data);
    setIsVisible(false);
    setShowPreferencesModal(false);
    analytics.trackEvent('cookie_consent_saved', { type: trackType });
  };

  const handleAcceptAll = () => {
    saveAndClose(
      {
        essential: true,
        telemetry: true,
        spatialCache: true,
        personalization: true,
        timestamp: new Date().toISOString(),
      },
      'all'
    );
  };

  const handleEssentialOnly = () => {
    saveAndClose(
      {
        essential: true,
        telemetry: false,
        spatialCache: false,
        personalization: false,
        timestamp: new Date().toISOString(),
      },
      'essential_only'
    );
  };

  const handleSaveCustom = () => {
    saveAndClose(preferences, 'custom_preferences');
  };

  // Keep 3D Cockpit 100% distraction-free from floating cookie banners
  if (isCockpit && !showPreferencesModal) {
    return null;
  }

  return (
    <>
      {/* ── 1. Compact Starting Banner (Visible on Initial Load) ─────── */}
      <AnimatePresence>
        {isVisible && !showPreferencesModal && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed z-[45] ${
              isCockpit
                ? 'top-20 right-4 max-w-sm'
                : 'bottom-20 sm:bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-2xl'
            }`}
          >
            <div className="p-3.5 sm:px-5 sm:py-3 rounded-2xl sm:rounded-3xl bg-[#080814]/95 border border-[#00f0ff]/30 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9),0_0_30px_rgba(0,240,255,0.1)] relative flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00f0ff]/20 to-[#a200ff]/20 border border-[#00f0ff]/30 flex items-center justify-center shrink-0">
                  <Cookie className="w-4 h-4 text-[#00f0ff]" />
                </div>
                <div className="min-w-0 text-xs text-gray-300 leading-snug">
                  <span className="font-bold text-white">Cookie &amp; Telemetry Notice:</span>{' '}
                  NexGen uses essential cookies &amp; WebGL tokens for 3D spatial compute.{' '}
                  <Link to="/privacy" className="text-[#00f0ff] hover:underline whitespace-nowrap">
                    Privacy Policy
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap w-full md:w-auto justify-end">
                <button
                  onClick={handleAcceptAll}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all flex items-center gap-1 shadow-md shadow-[#00f0ff]/20 cursor-pointer whitespace-nowrap"
                >
                  <Check className="w-3 h-3 stroke-[3px]" />
                  <span>Accept All</span>
                </button>

                <button
                  onClick={() => setShowPreferencesModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
                >
                  <Sliders className="w-3 h-3 text-[#00f0ff]" />
                  <span>Preferences</span>
                </button>

                <button
                  onClick={handleEssentialOnly}
                  className="px-2.5 py-1.5 rounded-xl text-gray-400 hover:text-white text-xs font-mono transition-colors cursor-pointer whitespace-nowrap"
                >
                  Essential Only
                </button>

                <button
                  onClick={handleEssentialOnly}
                  aria-label="Dismiss cookie notice with essential cookies only"
                  className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2. Detailed Cookie Preferences Modal ────────────────────── */}
      <AnimatePresence>
        {showPreferencesModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-xl rounded-3xl bg-[#080812] border border-white/15 p-6 sm:p-8 shadow-[0_0_80px_rgba(0,240,255,0.2)] relative max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00f0ff]/20 to-[#a200ff]/20 border border-[#00f0ff]/30 flex items-center justify-center">
                    <Sliders className="w-5 h-5 text-[#00f0ff]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      Cookie &amp; Telemetry Preferences
                    </h3>
                    <p className="text-xs text-gray-400 font-mono">
                      Configure granular privacy controls for spatial computing
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreferencesModal(false)}
                  className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preference Categories */}
              <div className="py-5 space-y-4">
                {/* 1. Essential Engine Cookies (Locked) */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-sm font-bold text-white">Strictly Necessary Core Engine</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Required for basic session integrity, TLS quantum handshakes, and WebGL 2D/3D context fallback mechanisms. Cannot be disabled.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold shrink-0 uppercase tracking-wider">
                    Always Active
                  </span>
                </div>

                {/* 2. Telemetry & Edge Ping Metrics */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-[#00f0ff]" />
                      <span className="text-sm font-bold text-white">Cluster Telemetry &amp; Latency</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Collects anonymous round-trip ping times, CDN node health, and frame render rates to optimize neural routing.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.telemetry}
                    onClick={() => setPreferences(p => ({ ...p, telemetry: !p.telemetry }))}
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 cursor-pointer ${
                      preferences.telemetry ? 'bg-[#00f0ff]' : 'bg-white/15'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-black transition-transform ${
                        preferences.telemetry ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Spatial 3D Shader Cache */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-[#a200ff]" />
                      <span className="text-sm font-bold text-white">Spatial 3D Acceleration Cache</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Saves compiled GLSL shaders and orbital view coordinates locally to skip re-compilation on subsequent visits.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.spatialCache}
                    onClick={() => setPreferences(p => ({ ...p, spatialCache: !p.spatialCache }))}
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 cursor-pointer ${
                      preferences.spatialCache ? 'bg-[#a200ff]' : 'bg-white/15'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        preferences.spatialCache ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 4. Personalization & Audio FX */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-sm font-bold text-white">Developer Personalization</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Remembers terminal command history, theme accents, and Web Audio SFX mute states across browser sessions.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.personalization}
                    onClick={() => setPreferences(p => ({ ...p, personalization: !p.personalization }))}
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 cursor-pointer ${
                      preferences.personalization ? 'bg-amber-400' : 'bg-white/15'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-black transition-transform ${
                        preferences.personalization ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={handleEssentialOnly}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Reject Non-Essential
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleSaveCustom}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Save Preferences
                  </button>

                  <button
                    onClick={handleAcceptAll}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-[#00f0ff]/20"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CookieConsentBanner;
