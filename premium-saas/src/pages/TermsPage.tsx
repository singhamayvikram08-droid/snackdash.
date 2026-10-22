import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Hexagon, ArrowLeft, FileText, CheckCircle2, AlertTriangle, Scale, Cpu, Terminal, Mail, Phone } from 'lucide-react';
import { usePageSEO } from '../utils/usePageSEO';

const TermsPage = () => {
  usePageSEO({
    title: 'Terms of Service — NexGen AI Developer Platform',
    description: 'Review the Terms of Service, developer IP ownership rights, acceptable use policies, and SLA commitments for NexGen AI.'
  });
  return (
    <div className="min-h-screen bg-[#030305] text-white flex flex-col font-sans selection:bg-[#00f0ff] selection:text-black">
      {/* Top Header */}
      <header className="h-20 border-b border-white/5 bg-[#050508]/80 backdrop-blur-xl sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-[#00f0ff] blur-md opacity-40 group-hover:opacity-80 transition-opacity rounded-full" />
            <Hexagon className="text-[#00f0ff] relative z-10 w-8 h-8 group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-black text-xl tracking-wide uppercase text-white">
            Nex<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#a200ff]">Gen</span>
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 text-center md:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a200ff]/10 border border-[#a200ff]/30 text-[#a200ff] text-xs font-bold uppercase tracking-widest">
            <FileText className="w-3.5 h-3.5" /> Legal Agreement
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            Terms of Service
          </h1>
          <p className="text-gray-400 text-sm">
            Last Updated: October 16, 2026 · Version: 2.4.0
          </p>
        </motion.div>

        {/* Highlight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: CheckCircle2, title: 'Developer Ownership', desc: 'You retain 100% intellectual property ownership of your 3D assets and logic.' },
            { icon: Scale, title: 'Fair Use Quotas', desc: 'Generous API rate limits and predictable transparent billing on all tiers.' },
            { icon: AlertTriangle, title: '99.9% SLA Guarantee', desc: 'Enterprise tier includes contractually backed uptime and 24/7 engineering response.' },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <item.icon className="w-5 h-5 text-[#a200ff]" />
              <h3 className="text-sm font-bold text-white">{item.title}</h3>
              <p className="text-xs text-gray-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 text-gray-300 text-sm leading-relaxed border-t border-white/5 pt-10">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#00f0ff]" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing the NexGen platform, connecting via API, or initializing a Virtual Identity workspace, you agree to be bound by these Terms of Service and all incorporated guidelines. If you are entering into this agreement on behalf of an enterprise or organization, you represent that you possess the authority to bind that entity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#a200ff]" /> 2. License &amp; Permitted Use
            </h2>
            <p>
              NexGen grants you a non-exclusive, non-transferable, revocable license to access our 3D spatial development engine and API endpoints in accordance with your chosen subscription tier:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-300">
              <li><strong className="text-white">Hobby Tier:</strong> Testing and non-commercial development up to 1,000 API requests/day.</li>
              <li><strong className="text-white">Pro Tier:</strong> Production web deployment up to 100,000 requests/day, neural API access, and custom shader pipelines.</li>
              <li><strong className="text-white">Enterprise Tier:</strong> Uncapped edge compute, custom SLAs, and dedicated cluster isolations.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#ff0055]" /> 3. Prohibited Activities
            </h2>
            <p>
              You agree not to misuse the NexGen platform, including but not limited to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-300">
              <li>Deploying automated malware, cryptomining workloads, or malicious network probes.</li>
              <li>Attempting to bypass API rate limits, authentication barriers, or regional edge routing locks.</li>
              <li>Reverse engineering or decompiling the proprietary neural shader virtualization core.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#00f0ff]" /> 4. Disclaimers &amp; Limitation of Liability
            </h2>
            <p>
              Except as explicitly stated in an active Enterprise SLA, the platform is provided on an &quot;as-is&quot; and &quot;as-available&quot; basis. NexGen Technologies Inc. shall not be liable for incidental, special, or consequential damages resulting from network outages or edge node latency spikes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#a200ff]" /> 5. Legal Notices &amp; Inquiries
            </h2>
            <p className="leading-relaxed">
              For contract agreements, custom enterprise SLAs, or formal notices, contact our legal counsel:
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
              <a 
                href="mailto:legal@nexgen.io" 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#00f0ff] hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]/30 transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span>legal@nexgen.io</span>
              </a>
              <a 
                href="mailto:support@nexgen.io" 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#a200ff] hover:bg-[#a200ff]/10 hover:border-[#a200ff]/30 transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-[#a200ff]" />
                <span>support@nexgen.io</span>
              </a>
              <a 
                href="tel:+18005550199" 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span>+1 (800) 555-0199</span>
              </a>
            </div>
          </section>
        </div>

        {/* Footer Nav */}
        <div className="pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 NexGen Technologies Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-[#00f0ff] transition-colors">Privacy Policy</Link>
            <Link to="/login" className="hover:text-[#00f0ff] transition-colors">Get Started</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
