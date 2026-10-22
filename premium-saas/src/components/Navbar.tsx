import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Hexagon, Menu, X, LogOut, Phone, Mail, Sparkles, Shield } from 'lucide-react';
import Magnetic from './Magnetic';
import { useAuth } from '../utils/auth';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Engine', href: '#engine' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '/docs' },
  { label: 'Testimonials', href: '#testimonials' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('/')) {
      navigate(href);
      return;
    }
    // If user is currently on a subpage like /docs, navigate to /#section
    if (window.location.pathname !== '/') {
      navigate('/' + href);
      return;
    }
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.history.pushState(null, '', href);
    }
  };

  const handleSignOut = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'py-4 bg-[#030305]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-[#00f0ff]/5'
            : 'py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">

          {/* Logo */}
          <Magnetic strength={0.15}>
            <Link to="/" className="flex items-center gap-2 group cursor-pointer px-2 py-1">
              <div className="relative">
                <div className="absolute inset-0 bg-[#00f0ff] blur-md opacity-40 group-hover:opacity-80 transition-opacity rounded-full" />
                <Hexagon className="text-[#00f0ff] relative z-10 w-8 h-8 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-bold text-xl tracking-wide uppercase text-white">
                Nex<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#a200ff]">Gen AI</span>
              </span>
            </Link>
          </Magnetic>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-300">
            {navLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollTo(item.href)}
                className="hover:text-[#00f0ff] transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#00f0ff] transition-all group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* User Auth Profile / Direct Log In */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.25)] inline-flex items-center justify-center cursor-pointer"
                >
                  <span>Get Started</span>
                </Link>

                <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                  {(user.tier === 'pro' || user.isPro) ? (
                    <Link
                      to="/dashboard"
                      title="Pro Subscriber · Enter Dashboard"
                      className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#00f0ff]/15 via-[#a200ff]/15 to-[#ff0055]/15 border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.2)] hover:scale-105 transition-transform"
                    >
                      <Sparkles className="w-3 h-3 text-[#00f0ff]" />
                      <span>PRO SUBSCRIBER</span>
                    </Link>
                  ) : user.tier === 'enterprise' ? (
                    <Link
                      to="/dashboard"
                      title="Enterprise Tier · Enter Dashboard"
                      className="px-2.5 py-1 rounded-full bg-[#a200ff]/20 border border-[#a200ff]/40 text-[#a200ff] font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(162,0,255,0.2)] hover:scale-105 transition-transform"
                    >
                      <Shield className="w-3 h-3 text-[#a200ff]" />
                      <span>ENTERPRISE</span>
                    </Link>
                  ) : (
                    <a
                      href="/#pricing"
                      title="Upgrade to Pro"
                      className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#00f0ff]/10 border border-white/10 hover:border-[#00f0ff]/40 text-gray-300 hover:text-[#00f0ff] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                    >
                      <span>Free</span>
                      <span className="text-[9px] text-[#00f0ff] font-black">↑ Upgrade</span>
                    </a>
                  )}

                  <Link
                    to="/dashboard"
                    title="User Profile - Enter Dashboard"
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs flex items-center justify-center hover:scale-105 transition-transform shadow-md shadow-[#00f0ff]/20 cursor-pointer"
                  >
                    {user.avatar || 'AV'}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    title="Sign Out"
                    className="p-2 rounded-xl text-gray-400 hover:text-[#ff0055] hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Log In</span>
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.25)] inline-flex items-center justify-center cursor-pointer"
                >
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Backdrop & Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[72px] left-0 right-0 z-50 bg-[#05050c]/98 backdrop-blur-2xl border-b border-white/10 px-6 py-6 flex flex-col gap-3.5 shadow-2xl md:hidden max-h-[calc(100vh-80px)] overflow-y-auto"
            >
              {navLinks.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollTo(item.href)}
                  className="text-left text-base font-semibold text-gray-200 hover:text-[#00f0ff] transition-colors py-2 border-b border-white/5 flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <span className="text-xs font-mono text-gray-500">→</span>
                </button>
              ))}

              {/* Direct Link to 3D Cockpit in Mobile Menu */}
              <Link
                to="/cockpit"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left text-base font-semibold text-gray-200 hover:text-[#00f0ff] transition-colors py-2 border-b border-white/5 flex items-center justify-between"
              >
                <span>3D Spatial Cockpit</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30">LIVE</span>
              </Link>

              {/* Auth / Account Buttons */}
              {isAuthenticated && user ? (
                <div className="pt-2 flex flex-col gap-3">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider text-center block shadow-[0_0_20px_rgba(0,240,255,0.25)]"
                  >
                    Enter Workspace Dashboard
                  </Link>
                  <div className="flex items-center justify-between pt-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 text-sm text-gray-300 hover:text-white"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs flex items-center justify-center">
                        {user.avatar || 'AV'}
                      </div>
                      <span className="font-mono text-xs">{user.name || 'Account'}</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="py-2 px-3 rounded-xl bg-white/5 hover:bg-[#ff0055]/20 text-[#ff0055] text-xs font-semibold flex items-center gap-1.5 border border-white/10 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex flex-col gap-2.5">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider text-center block shadow-[0_0_20px_rgba(0,240,255,0.25)]"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider text-center block"
                  >
                    Log In
                  </Link>
                </div>
              )}

              {/* Clickable Phone Number and Email in Mobile Drawer */}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-2 font-mono text-xs text-gray-400">
                <div className="text-[10px] uppercase font-bold tracking-widest text-[#00f0ff]">Direct Support & Inquiries</div>
                <a
                  href="tel:+18005550199"
                  className="flex items-center gap-2.5 text-gray-300 hover:text-[#00f0ff] py-1 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span>+1 (800) 555-0199</span>
                </a>
                <a
                  href="mailto:support@nexgen.io"
                  className="flex items-center gap-2.5 text-gray-300 hover:text-[#00f0ff] py-1 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span>support@nexgen.io</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
