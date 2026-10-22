import { useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, Target } from 'lucide-react';
import SparkleButton from './SparkleButton';
import { useNavigate } from 'react-router-dom';
import Magnetic from './Magnetic';
import { useAuth } from '../utils/auth';
import { DocsModal } from './DocsModal';

const CTA = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showDocsModal, setShowDocsModal] = useState(false);

  return (
    <section className="w-full py-28 sm:py-36 md:py-48 px-4 sm:px-6 relative z-10 section-3d bg-[#030305]">
      <div className="max-w-6xl mx-auto relative preserve-3d">

        {/* 3D Tunnel Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_50%,#ff005510_0%,transparent_50%)] -z-20 blur-[150px] pointer-events-none" />
        
        {/* Floating 3D Assets around CTA */}
        <motion.div
           animate={{ 
             y: [-20, 20, -20],
             rotateZ: [0, 10, 0]
           }}
           transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
           className="absolute -top-16 -left-16 p-6 rounded-3xl glass border border-[#00f0ff]/20 backdrop-blur-3xl hidden lg:block"
           style={{ transform: 'translateZ(50px)' } as CSSProperties}
        >
          <Target className="w-8 h-8 text-[#00f0ff] animate-pulse" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
          whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative rounded-3xl sm:rounded-[3.5rem] bg-gradient-to-br from-white/[0.04] to-transparent p-8 sm:p-14 md:p-24 text-center border border-white/10 shadow-2xl group"
        >
          {/* Top accent scanner line */}
          <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ff0055] to-transparent shadow-[0_0_15px_#ff0055] opacity-50" 
          />

          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 spatial-glow overflow-hidden relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-[#ff0055]/20 to-transparent opacity-40" 
            />
            <Sparkles className="w-4 h-4 text-[#ff0055] relative z-10" />
            <span className="text-[10px] font-black text-white tracking-[0.3em] uppercase relative z-10">Neural Access Points Available</span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black mb-6 tracking-tighter text-white leading-[0.9]">
            DEPLOY YOUR <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff0055] via-[#a200ff] to-[#00f0ff]">FUTURE.</span>
          </h2>
          
          <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Join 50,000+ developers building the next generation of spatial web interfaces. 
            <span className="text-white font-bold"> Your virtual workspace is ready.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
            <Magnetic strength={0.4} className="w-full sm:w-auto">
              <SparkleButton
                label={isAuthenticated ? "Enter Dashboard" : "Log In to Deploy"}
                onClick={() =>
                  navigate(
                    isAuthenticated ? '/dashboard' : '/login',
                    isAuthenticated ? undefined : { state: { from: '/dashboard', featureName: 'Platform Dashboard', requireLoginFirst: true } }
                  )
                }
              />
            </Magnetic>
            
            <motion.button
              type="button"
              onClick={() => setShowDocsModal(true)}
              className="px-6 py-3 rounded-xl glass border border-white/10 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/5 active:scale-95 transition-all shadow-2xl relative overflow-hidden group/btn w-full sm:w-auto cursor-pointer"
              initial={{ translateZ: 0 }}
              whileHover={{ scale: 1.05, translateZ: 20 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500" />
              <Zap className="w-4 h-4 text-[#00f0ff] relative z-10" />
              <span className="relative z-10">Protocol Docs</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform relative z-10" />
            </motion.button>
          </div>

          {/* Background depth layers */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#ff0055]/5 to-transparent -z-10 rounded-[3.5rem]" />
        </motion.div>
      </div>

      {/* Interactive Documentation Center Modal */}
      <DocsModal
        isOpen={showDocsModal}
        onClose={() => setShowDocsModal(false)}
      />
    </section>
  );
};

export default CTA;
