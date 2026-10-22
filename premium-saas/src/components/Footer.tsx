import { Link, useNavigate } from 'react-router-dom';
import { Hexagon, Code2, Globe, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  const scrollTo = (href: string) => {
    if (href.startsWith('/')) {
      navigate(href);
      return;
    }
    if (window.location.pathname !== '/') {
      navigate('/' + href);
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.location.hash = href;
  };

  return (
    <footer className="w-full border-t border-white/10 bg-[#020203] relative z-10 pt-16 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 mb-12">
        
        {/* Brand Column */}
        <div className="col-span-1 sm:col-span-2 md:col-span-1 flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2 group w-max">
            <Hexagon className="text-[#00f0ff] w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="font-heading font-bold text-lg tracking-wide uppercase text-white">NexGen</span>
          </Link>
          <p className="text-gray-300 text-sm leading-relaxed">
            Forging the standard for extreme high-performance spatial networking and 3D component architecture with sub-millisecond edge latency.
          </p>
        </div>

        {/* Product Links */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Product</h4>
          <ul className="flex flex-col gap-2.5 text-sm text-gray-300">
            <li>
              <button 
                onClick={() => scrollTo('#features')} 
                className="hover:text-[#00f0ff] transition-colors text-left cursor-pointer"
              >
                Features
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollTo('#engine')} 
                className="hover:text-[#00f0ff] transition-colors text-left cursor-pointer"
              >
                Neural Engine
              </button>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-[#00f0ff] transition-colors">
                Workspace Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/cockpit"
                className="hover:text-[#00f0ff] transition-colors flex items-center gap-1.5"
              >
                <span>3D Spatial Cockpit</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00f0ff]/20 text-[#00f0ff] font-bold">LIVE</span>
              </Link>
            </li>
            <li>
              <Link
                to="/docs"
                className="hover:text-[#00f0ff] transition-colors flex items-center gap-1.5"
              >
                <span>Protocol Documentation</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00f0ff]/20 text-[#00f0ff] font-bold">SPEC</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Platform & Account */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Platform</h4>
          <ul className="flex flex-col gap-2.5 text-sm text-gray-300">
            <li>
              <Link to="/login" className="hover:text-[#a200ff] transition-colors">
                Sign In / Register
              </Link>
            </li>
            <li>
              <button 
                onClick={() => scrollTo('#testimonials')} 
                className="hover:text-[#a200ff] transition-colors text-left cursor-pointer"
              >
                Pioneer Reviews
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollTo('#pricing')} 
                className="hover:text-[#a200ff] transition-colors text-left cursor-pointer"
              >
                Pricing &amp; Plans
              </button>
            </li>
          </ul>
        </div>

        {/* Direct Contact Column (Clickable Phone & Emails) */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Contact &amp; Support</h4>
          <ul className="flex flex-col gap-3 text-sm text-gray-300 font-mono">
            <li>
              <a 
                href="tel:+18005550199" 
                className="hover:text-[#00f0ff] transition-colors flex items-center gap-2 group"
                aria-label="Call NexGen Support"
              >
                <Phone className="w-3.5 h-3.5 text-[#00f0ff] shrink-0 group-hover:scale-110 transition-transform" />
                <span>+1 (800) 555-0199</span>
              </a>
            </li>
            <li>
              <a 
                href="mailto:support@nexgen.io" 
                className="hover:text-[#00f0ff] transition-colors flex items-center gap-2 group"
                aria-label="Email Developer Support"
              >
                <Mail className="w-3.5 h-3.5 text-[#00f0ff] shrink-0 group-hover:scale-110 transition-transform" />
                <span>support@nexgen.io</span>
              </a>
            </li>
            <li>
              <a 
                href="mailto:sales@nexgen.io" 
                className="hover:text-[#a200ff] transition-colors flex items-center gap-2 group"
                aria-label="Email Enterprise Sales"
              >
                <Mail className="w-3.5 h-3.5 text-[#a200ff] shrink-0 group-hover:scale-110 transition-transform" />
                <span>sales@nexgen.io</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Legal Links */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Legal</h4>
          <ul className="flex flex-col gap-2.5 text-sm text-gray-300">
            <li>
              <Link to="/privacy" className="hover:text-white hover:underline transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-white hover:underline transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-preferences'))}
                className="hover:text-[#00f0ff] transition-colors text-left cursor-pointer"
              >
                Cookie Preferences
              </button>
            </li>
            <li>
              <a 
                href="mailto:security@nexgen.io" 
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>security@nexgen.io</span>
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-400 text-xs text-center md:text-left">
          © {new Date().getFullYear()} NexGen Technologies Inc. All rights reserved. Sub-ms Edge Infrastructure.
        </p>
        <div className="flex items-center gap-5 text-gray-300">
          <a 
            href="https://x.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Visit NexGen on X"
            className="hover:text-[#00f0ff] transition-colors p-1"
          >
            <span className="font-bold text-sm">𝕏</span>
          </a>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Visit NexGen on GitHub"
            className="hover:text-[#a200ff] transition-colors p-1"
          >
            <Code2 className="w-5 h-5"/>
          </a>
          <a 
            href="https://nexgen.io" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Global Edge Network"
            className="hover:text-[#ff0055] transition-colors p-1"
          >
            <Globe className="w-5 h-5"/>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
