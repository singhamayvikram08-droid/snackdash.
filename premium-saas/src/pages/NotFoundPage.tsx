import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Hexagon, Home, Compass, ArrowLeft, Box, FileText, Phone, Mail } from 'lucide-react';
import { usePageSEO } from '../utils/usePageSEO';

const NotFoundPage = () => {
  usePageSEO({
    title: '404: Coordinate Not Found — NexGen AI',
    description: 'The requested spatial computing node or protocol was not found in the neural grid. Explore the 3D Cockpit, documentation, or return home.'
  });

  return (
    <div className="min-h-screen bg-[#030305] text-white flex flex-col font-sans selection:bg-[#00f0ff] selection:text-black">
      {/* Top Header */}
      <header className="h-20 border-b border-white/5 bg-[#050508]/80 backdrop-blur-xl px-6 lg:px-12 flex items-center justify-between">
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

      {/* Main 404 Visual */}
      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl w-full space-y-8 relative"
        >
          <div className="relative">
            <div className="text-[110px] sm:text-[140px] md:text-[160px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#a200ff] to-[#ff0055] select-none">
              404
            </div>
            <div className="absolute inset-0 blur-3xl bg-[#a200ff]/20 -z-10" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">
              Spatial Coordinate Not Found
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
              The spatial node or neural endpoint you requested does not exist or has been decompiled from the active cluster mesh.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-xl shadow-[#00f0ff]/20"
            >
              <Home className="w-4 h-4" />
              Return to Home
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#00f0ff]" />
              Workspace Dashboard
            </Link>
          </div>

          {/* Quick Exploration Chips */}
          <div className="pt-6 border-t border-white/5 space-y-3">
            <p className="text-xs uppercase font-mono tracking-widest text-gray-400">
              Direct System Endpoints
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Link
                to="/cockpit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-gray-300 hover:text-[#00f0ff] transition-all"
              >
                <Box className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span>3D Spatial Cockpit</span>
              </Link>

              <Link
                to="/docs"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-gray-300 hover:text-[#a200ff] transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-[#a200ff]" />
                <span>Protocol Docs</span>
              </Link>

              <a
                href="mailto:support@nexgen.io"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>support@nexgen.io</span>
              </a>

              <a
                href="tel:+18005550199"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-gray-300 hover:text-[#00f0ff] transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span>+1 (800) 555-0199</span>
              </a>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default NotFoundPage;
