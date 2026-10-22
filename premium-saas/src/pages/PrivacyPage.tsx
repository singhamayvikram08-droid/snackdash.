import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Hexagon, ArrowLeft, Shield, Lock, Eye, Database, Globe, Bell, Phone, Mail } from 'lucide-react';
import { usePageSEO } from '../utils/usePageSEO';

const PrivacyPage = () => {
  usePageSEO({
    title: 'Privacy Policy — NexGen AI Developer Platform',
    description: 'Review our end-to-end data encryption, telemetry retention standards, zero-brokerage commitment, and GDPR compliance.'
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-xs font-bold uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5" /> Legal &amp; Compliance
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm">
            Last Updated: October 16, 2026 · Effective Date: January 1, 2026
          </p>
        </motion.div>

        {/* Highlight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Lock, title: 'Zero Data Brokerage', desc: 'We never sell your telemetry or developer data to third parties.' },
            { icon: Database, title: 'End-to-End Encrypted', desc: 'All payload logs and credentials are protected with AES-256-GCM.' },
            { icon: Globe, title: 'GDPR & SOC 2 Ready', desc: 'Fully compliant with EU-GDPR standards and SOC 2 Type II controls.' },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <item.icon className="w-5 h-5 text-[#00f0ff]" />
              <h3 className="text-sm font-bold text-white">{item.title}</h3>
              <p className="text-xs text-gray-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 text-gray-300 text-sm leading-relaxed border-t border-white/5 pt-10">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#a200ff]" /> 1. Information We Collect
            </h2>
            <p>
              When you use the NexGen 3D Autonomous Engine, we collect certain information required to maintain cluster synchronization and low-latency delivery:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-300">
              <li><strong className="text-white">Account Information:</strong> Name, work email address, and authentication credentials when creating an account or registering a Virtual ID.</li>
              <li><strong className="text-white">Telemetry &amp; Usage:</strong> Node latency, API throughput, rendering framerates, WebGPU/WebGL capability metrics, and error stack logs.</li>
              <li><strong className="text-white">Device &amp; Network Info:</strong> IP address (anonymized at edge), browser user agent, operating system, and regional DNS routing nodes.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-[#00f0ff]" /> 2. How We Use Your Data
            </h2>
            <p>
              Your data is utilized strictly for engineering, security, and service delivery purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-300">
              <li>Provisioning virtual workspaces and synchronizing 3D neural shaders.</li>
              <li>Monitoring cluster health across our 14,029 distributed edge computing units.</li>
              <li>Preventing denial-of-service attacks, automated bot abuse, and unauthorized penetration attempts.</li>
              <li>Delivering vital billing notifications, security alerts, and system health advisories.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#ff0055]" /> 3. Data Protection &amp; Retention
            </h2>
            <p>
              All data in transit is encrypted using TLS 1.3 with forward secrecy. Telemetry logs are purged every 30 days unless retained for compliance investigations. You have the right to request full export or permanent erasure of your account data at any time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#00f0ff]" /> 4. Contact Our Privacy Team
            </h2>
            <p className="leading-relaxed">
              For privacy inquiries, GDPR data requests, or compliance documentation, reach out directly:
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
              <a 
                href="mailto:privacy@nexgen.io" 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#00f0ff] hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]/30 transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span>privacy@nexgen.io</span>
              </a>
              <a 
                href="mailto:security@nexgen.io" 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#a200ff] hover:bg-[#a200ff]/10 hover:border-[#a200ff]/30 transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-[#a200ff]" />
                <span>security@nexgen.io</span>
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
            <Link to="/terms" className="hover:text-[#00f0ff] transition-colors">Terms of Service</Link>
            <Link to="/login" className="hover:text-[#00f0ff] transition-colors">Get Started</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;
