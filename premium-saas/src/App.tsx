import { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion'
import { AlertOctagon } from 'lucide-react';
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import Features from './components/Features'
import Showcase from './components/Showcase'
import Testimonials from './components/Testimonials'
import CTA from './components/CTA'
import Footer from './components/Footer'
import ChatBox from './components/ChatBox'
import NeuralInterface from './components/NeuralInterface'
import CockpitSection from './components/CockpitSection'
import Pricing from './components/Pricing'
import { usePageSEO } from './utils/usePageSEO'
import { useSiteConfig } from './utils/siteConfig'

function App() {
  usePageSEO({
    title: 'NexGen AI — 3D Autonomous Cloud & Neural Development Engine',
    description: 'Build, deploy, and scale in a synchronized 3D spatial environment. Sub-millisecond latency, quantum-encrypted clusters, and distributed neural computing.',
    keywords: 'NexGen, 3D Cloud, Spatial Computing, Neural Engine, Autonomous SaaS, WebGPU, Cloud Infrastructure, Developer Tools'
  });

  const { config } = useSiteConfig();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Handle smooth scroll if navigating to a section hash from another page
  useEffect(() => {
    if (window.location.hash) {
      const timer = setTimeout(() => {
        const el = document.querySelector(window.location.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#030305] text-white font-[Inter] overflow-x-hidden selection:bg-[#00f0ff] selection:text-black">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00f0ff] via-[#a200ff] to-[#ff0055] origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none mix-blend-screen">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#00f0ff] blur-[150px] opacity-20 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] rounded-full bg-[#a200ff] blur-[150px] opacity-20 animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[30%] rounded-full bg-[#ff0055] blur-[150px] opacity-10 animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      {/* Global Top Announcement Banner (Controlled from NEXT GEN AI Portal) */}
      {config.announcement.enabled && (
        <div className={`relative z-50 w-full py-2.5 px-4 text-center text-xs font-medium border-b transition-all flex flex-wrap items-center justify-center gap-2.5 shadow-lg ${
          config.announcement.type === 'promo' ? 'bg-gradient-to-r from-purple-900/60 via-[#070715] to-purple-900/60 border-purple-500/40 text-purple-200' :
          config.announcement.type === 'alert' ? 'bg-gradient-to-r from-rose-950/70 via-[#070715] to-rose-950/70 border-rose-500/40 text-rose-200' :
          config.announcement.type === 'info' ? 'bg-gradient-to-r from-cyan-950/70 via-[#070715] to-cyan-950/70 border-cyan-500/40 text-cyan-200' :
          'bg-gradient-to-r from-[#00f0ff]/15 via-[#a200ff]/15 to-[#ff0055]/15 border-[#00f0ff]/30 text-white'
        }`}>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-white/20 text-white">
            {config.announcement.badge}
          </span>
          <span>{config.announcement.text}</span>
          {config.announcement.actionText && (
            <a
              href={config.announcement.actionLink || '#'}
              className="underline font-bold text-xs ml-1 hover:text-[#00f0ff] transition-colors"
            >
              {config.announcement.actionText} →
            </a>
          )}
        </div>
      )}

      {/* Emergency Maintenance Mode Overlay (Controlled from NEXT GEN AI Portal) */}
      {config.maintenanceMode.enabled ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative z-40">
          <div className="max-w-lg p-8 sm:p-12 rounded-3xl bg-[#080812]/90 border border-rose-500/30 backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertOctagon className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold">
                SYSTEM UNDER ROLLING MAINTENANCE
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {config.maintenanceMode.title}
              </h1>
              <p className="text-sm text-gray-300 leading-relaxed">
                {config.maintenanceMode.message}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/50 border border-white/5 font-mono text-xs text-gray-400 flex items-center justify-between">
              <span>Estimated Resumption:</span>
              <span className="text-emerald-400 font-bold">{config.maintenanceMode.estimatedUptime}</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Navbar />

          <main className="relative z-20 flex flex-col items-center w-full">
            <HeroSection />
            <Features />
            <NeuralInterface />
            {config.features.enableCockpitSection && <CockpitSection />}
            {config.features.enableShowcaseStream && <Showcase />}
            <Pricing />
            <Testimonials />
            <CTA />
            <Footer />
          </main>

          {config.features.enableChatbot && <ChatBox />}
        </>
      )}
    </div>
  )
}

export default App
