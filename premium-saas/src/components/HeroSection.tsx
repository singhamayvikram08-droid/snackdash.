import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Rocket, Cpu, Activity, Globe, Shield, Terminal, ArrowUpRight, Play, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import SparkleButton from './SparkleButton';
import HeroCockpitGlobe from './HeroCockpitGlobe';
import { useAuth } from '../utils/auth';
import { useSiteConfig } from '../utils/siteConfig';

const scrollTo = (href: string) => {
  const el = document.querySelector(href);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.location.hash = href;
  }
};

const HeroSection = () => {
  const [activeTelemetryTab, setActiveTelemetryTab] = useState<'video' | 'matrix' | 'nodes' | 'stats'>('video');
  const { isAuthenticated } = useAuth();
  const { config } = useSiteConfig();

  return (
    <section 
      id="home" 
      className="relative w-full min-h-screen flex items-center justify-center pt-20 sm:pt-24 pb-16 px-6 overflow-hidden bg-[#030305]"
    >
      {/* Background Ambient Glows (Fixed, Rock-Solid, No Jitter) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#00f0ff]/10 blur-[150px]" />
        <div className="absolute top-[30%] right-[-10%] w-[550px] h-[550px] rounded-full bg-[#a200ff]/10 blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[25%] w-[600px] h-[350px] rounded-full bg-[#ff0055]/05 blur-[150px]" />
        
        {/* Subtle Background Telemetry Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent_85%)]" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10 w-full">
        {/* ── LEFT COLUMN: Value Proposition & CTAs ────────────────────────── */}
        <div className="flex flex-col gap-6 text-center lg:text-left">
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mx-auto lg:mx-0 w-max shadow-lg backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-400" />
            <span className="text-xs font-bold tracking-wider uppercase font-mono text-emerald-400">
              {config.hero.statusBadge || 'NextGen AI v2.4 Active · Connected'}
            </span>
            <span className="text-[10px] text-gray-400 font-mono border-l border-white/10 pl-2">
              &lt;0.3ms Latency
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.92] text-white"
          >
            {config.hero.customHeadline || 'VIRTUALIZE'} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#a200ff] to-[#ff0055]">
              {config.hero.customGradientWord || 'REALITY.'}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-300 font-normal max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            {config.hero.customSubtitle || (isAuthenticated
              ? "NextGen AI — The world's first fully autonomous 3D development and spatial computing AI engine. Your production workspace and 3D Cockpit are live."
              : "NextGen AI — The world's first fully autonomous 3D development and spatial computing AI engine. Explore the live 3D simulation below, or log in to unlock the full 3D Cockpit and Platform Dashboard.")}
          </motion.p>

          {/* Call to Actions (In-site features unlocked on login) */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-3 mt-4 justify-center lg:justify-start items-center w-full"
          >
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="shrink-0">
                  <SparkleButton label="Enter Dashboard" />
                </Link>
                <Link
                  to="/cockpit"
                  className="shrink-0 px-5 py-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Cpu className="w-4 h-4 text-[#00f0ff]" />
                  <span>Launch 3D Cockpit →</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  state={{ from: '/cockpit', featureName: '3D Spatial Cockpit', requireLoginFirst: true }}
                  className="shrink-0"
                >
                  <SparkleButton label={config.hero.primaryCtaText || 'Launch 3D Cockpit →'} />
                </Link>
                <button
                  type="button"
                  onClick={() => scrollTo('#features')}
                  className="shrink-0 px-5 py-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>Explore Platform Tour ↓</span>
                </button>
              </>
            )}
          </motion.div>

          {/* Stats Chips */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-4 max-w-lg mx-auto lg:mx-0 w-full"
          >
            {[
              { label: 'Cluster Bus Latency', value: '<0.3ms', icon: Cpu, color: '#00f0ff' },
              { label: 'Edge Throughput', value: '1.24 TB/s', icon: Rocket, color: '#a200ff' },
              { label: 'Quantum Cipher', value: 'AES-256', icon: Shield, color: '#10b981' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex flex-col gap-1 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">{stat.label}</span>
                  <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                </div>
                <div className="text-base font-extrabold text-white tracking-tight">{stat.value}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN: Interactive High-Tech Spatial Cockpit Frame ─────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto w-full max-w-[620px]"
        >
          {/* Main Cockpit Frame */}
          <div className="relative rounded-3xl bg-[#080812]/90 border border-white/15 shadow-[0_0_80px_rgba(0,240,255,0.12)] backdrop-blur-2xl overflow-hidden">
            {/* Top Telemetry Header */}
            <div className="h-12 bg-white/[0.04] border-b border-white/10 px-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                <span className="text-[11px] font-mono text-gray-500 ml-2 font-medium tracking-wider">
                  NEXGEN :: SPATIAL COCKPIT HUD // LIVE PRODUCTION
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500/60" />
                <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-emerald-500/60">
                  SYS_ONLINE
                </span>
              </div>
            </div>

            {/* Interactive Telemetry Tab Switcher */}
            <div className="flex items-center gap-1 p-2 bg-black/40 border-b border-white/5 font-mono text-xs overflow-x-auto no-scrollbar">
              {([
                { id: 'video', label: 'Engine Live Cam', icon: Play },
                { id: 'matrix', label: '3D Matrix', icon: Activity },
                { id: 'nodes', label: 'Global Fleet', icon: Globe },
                { id: 'stats', label: 'Live Hex Feed', icon: Terminal },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTelemetryTab(t.id)}
                  className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl text-[10px] sm:text-[11px] font-medium flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTelemetryTab === t.id
                      ? 'bg-[#00f0ff]/10 text-[#00f0ff]/80 border border-[#00f0ff]/30 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Viewport Display Body */}
            <div className="p-5 sm:p-6 h-[340px] relative flex flex-col justify-between overflow-hidden">
              {/* Telemetry Coordinate Background Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.06),transparent_75%)] pointer-events-none" />

              {/* View 0: 3D Spatial Cockpit Globe (Continuous Earth Rotation & Interactive WebGL HUD) */}
              {activeTelemetryTab === 'video' && (
                <div className="absolute inset-0 w-full h-full overflow-hidden z-10">
                  <HeroCockpitGlobe />
                </div>
              )}

              {/* View 1: 3D Matrix Visualizer */}
              {activeTelemetryTab === 'matrix' && (
                <div className="relative h-full flex flex-col justify-between z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-gray-400">Tensor Array Geometry</div>
                      <div className="text-sm font-black font-mono text-white">4,096 SPATIAL NODES · 16 CLUSTERS</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase text-gray-400">Processing Rate</div>
                      <div className="text-sm font-black font-mono text-emerald-400">60.2 FPS (SYNCHRONIZED)</div>
                    </div>
                  </div>

                  {/* High-tech Geometric Radar Core */}
                  <div className="relative my-auto flex items-center justify-center h-40">
                    <div className="absolute w-36 h-36 rounded-full border border-[#00f0ff]/30 shadow-[0_0_30px_rgba(0,240,255,0.15)]" />
                    <div className="absolute w-24 h-24 rounded-full border border-[#a200ff]/30" />
                    <div className="absolute w-12 h-12 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#a200ff] flex items-center justify-center shadow-[0_0_25px_rgba(0,240,255,0.5)]">
                      <Zap className="w-6 h-6 text-black" />
                    </div>

                    {/* Orbiting Telemetry Pills */}
                    <div className="absolute -top-1 left-8 px-2 py-0.5 rounded-md bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[9px] font-mono text-[#00f0ff]">
                      TENSOR_X :: 0.941
                    </div>
                    <div className="absolute -bottom-1 right-8 px-2 py-0.5 rounded-md bg-[#a200ff]/10 border border-[#a200ff]/30 text-[9px] font-mono text-[#a200ff]">
                      THROUGHPUT :: 1.2TB/s
                    </div>
                  </div>

                  {/* Bottom Quick Launch Link */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-gray-400">WebGL 2.0 WebGPU Core Ready</span>
                    {isAuthenticated ? (
                      <Link
                        to="/cockpit"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                      >
                        <span>Open 3D Cockpit</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Link
                        to="/login"
                        state={{ from: '/cockpit', featureName: '3D Spatial Cockpit', requireLoginFirst: true }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                      >
                        <Lock className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                        <span>Launch 3D Cockpit</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-black" />
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* View 2: Global Edge Fleet */}
              {activeTelemetryTab === 'nodes' && (
                <div className="h-full flex flex-col justify-between z-10 space-y-3 font-mono">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs text-gray-300 font-bold uppercase">Regional Edge Topology</span>
                    <span className="text-[10px] text-emerald-400">100% HEALTHY</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-auto">
                    {[
                      { region: 'US-East', location: 'N. Virginia', ping: '0.42ms', load: '28%' },
                      { region: 'EU-Central', location: 'Frankfurt', ping: '0.85ms', load: '41%' },
                      { region: 'APAC-South', location: 'Mumbai', ping: '0.74ms', load: '34%' },
                    ].map((node) => (
                      <div
                        key={node.region}
                        className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{node.region}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </div>
                        <div className="text-[10px] text-gray-400">{node.location}</div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                          <span className="text-[#00f0ff] font-bold">{node.ping}</span>
                          <span className="text-gray-400">{node.load}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Total Synchronized Nodes: 14,029</span>
                    <span className="text-emerald-400 font-bold">ZERO PACKET LOSS</span>
                  </div>
                </div>
              )}

              {/* View 3: Live Hex Feed */}
              {activeTelemetryTab === 'stats' && (
                <div className="h-full flex flex-col justify-between z-10 font-mono text-[11px]">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs text-[#00f0ff] font-bold uppercase tracking-wider">Neural Hex Stream</span>
                    <span className="text-[10px] text-gray-400">BUFFER: 64KB</span>
                  </div>

                  <div className="bg-black/60 rounded-xl p-3 border border-white/5 text-gray-300 space-y-1 my-auto overflow-hidden text-[10px]">
                    <div className="text-emerald-400">[00:00:01] SYS::INIT :: 3D Spatial Computing Engine synchronized.</div>
                    <div className="text-cyan-400">[00:00:02] QUANTUM::CIPHER :: AES-256 handshake verified with 38 nodes.</div>
                    <div className="text-gray-300">[00:00:03] STREAM :: 0x7FFF8029 &gt;&gt; THROUGHPUT: 1.24 TB/s &gt;&gt; BUS &lt;0.3ms</div>
                    <div className="text-purple-400">[00:00:04] WEBGPU::PIPELINE :: Fragment shader compiled at 60 FPS.</div>
                    <div className="text-emerald-400">[00:00:05] TELEMETRY :: All edge clusters responding normally.</div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400">
                    <span>STATUS: OPERATIONAL</span>
                    <span className="text-[#00f0ff]">AUTO-REFRESH: ACTIVE</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
