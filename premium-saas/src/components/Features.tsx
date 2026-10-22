import { motion } from 'framer-motion';
import { Layers, Zap, Shield, Cpu, Code2, Globe } from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-6 h-6 text-[#00f0ff]" />,
    title: "Real-time Processing",
    description: "Lightning fast sub-millisecond response times powered by our proprietary physics engine."
  },
  {
    icon: <Cpu className="w-6 h-6 text-[#a200ff]" />,
    title: "Neural Integration",
    description: "Seamlessly map machine learning models directly into your 3D interface environments."
  },
  {
    icon: <Layers className="w-6 h-6 text-[#ff0055]" />,
    title: "Kinetic Layers",
    description: "Build beautiful glassmorphic multi-dimensional UI panels stacked contextually."
  },
  {
    icon: <Shield className="w-6 h-6 text-[#00f0ff]" />,
    title: "Enterprise Security",
    description: "End-to-end encryption with advanced role-based access rendering layers."
  },
  {
    icon: <Code2 className="w-6 h-6 text-[#a200ff]" />,
    title: "Developer API",
    description: "Full GraphQL endpoints exposing every variable for headless manipulation."
  },
  {
    icon: <Globe className="w-6 h-6 text-[#ff0055]" />,
    title: "Global Edge Edge",
    description: "Deployed natively to 300+ CDN nodes for ultra-low latency worldwide."
  }
];

const Features = () => {
  return (
    <section id="features" className="w-full py-16 sm:py-20 lg:py-24 px-6 relative z-10 section-3d bg-[#030305]">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#a200ff] text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Layers className="w-3 h-3" />
            Spatial Features · Core Architecture
          </motion.div>
          <h2 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter text-white">
            Architect the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#a200ff] to-[#ff0055]">Impossible</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed font-normal">
            Everything you need to deploy cutting edge WebGL, WebGPU, and Neural network interactions directly to the browser.
          </p>
        </motion.div>

        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ 
                rotateX: -5,
                rotateY: 5,
                translateZ: 30,
                transition: { duration: 0.3 }
              }}
              className="group relative p-[1px] rounded-3xl overflow-visible preserve-3d"
            >
              {/* Glowing Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/20 via-[#a200ff]/20 to-[#ff0055]/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative h-full bg-[#08080c] p-8 rounded-3xl border border-white/5 flex flex-col gap-6 overflow-hidden z-10 shadow-2xl backdrop-blur-xl preserve-3d">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2 group-hover:bg-[#00f0ff]/10 group-hover:border-[#00f0ff]/30 transition-all duration-300">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#00f0ff] blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
                    {feature.icon}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-[#00f0ff] transition-colors mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed font-normal">{feature.description}</p>
                </div>
                
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold text-[#00f0ff] uppercase tracking-widest">Active Module</span>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-[#00f0ff]/50 to-transparent" />
                </div>

                {/* Subtle corner glow inside card */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#00f0ff]/10 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
