import { motion } from 'framer-motion';
import { Star, Quote, Sparkles, ShieldCheck, Users, Zap, CheckCircle2 } from 'lucide-react';

const reviews = [
  {
    name: "Sarah Jenkins",
    role: "Lead Systems Architect @ Void Spatial",
    tag: "Autonomous 3D Engine",
    content: "NexGen's neural hook completely refactored how our team approaches spatial 3D building. Synchronizing 14,000+ nodes under 0.8ms was something we thought impossible on WebGPU.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
    verified: "Verified Enterprise Architect",
  },
  {
    name: "David Chen",
    role: "Founder & CTO @ FrameJS Labs",
    tag: "Microservices Scale",
    content: "The API is incredibly intuitive. We migrated our entire legacy microservices mesh in less than 48 hours with zero downtime. Production cluster latency dropped by 64% on day one.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80",
    verified: "Verified Cloud Partner",
  },
  {
    name: "Elena Rostova",
    role: "Creative Director @ HyperVisual Studio",
    tag: "WebGL & Quantum Shaders",
    content: "I have never seen WebGL abstractions run this smoothly. The volumetric shaders and bloom pipelines work flawlessly out of the box with 60 FPS guaranteed across all client devices.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80",
    verified: "Verified Pro Creator",
  }
];

const trustMetrics = [
  {
    label: "Developer Rating",
    value: "4.98 / 5.0",
    sub: "2,840+ Verified Reviews",
    icon: Star,
    color: "#00f0ff",
  },
  {
    label: "Production Uptime",
    value: "99.999%",
    sub: "Guaranteed SLA",
    icon: ShieldCheck,
    color: "#10b981",
  },
  {
    label: "Active Engineers",
    value: "50,000+",
    sub: "Across 140+ Countries",
    icon: Users,
    color: "#a200ff",
  },
  {
    label: "Cluster Synapse",
    value: "<0.3ms",
    sub: "Edge Bus Latency",
    icon: Zap,
    color: "#ff0055",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="w-full pt-8 sm:pt-12 pb-24 sm:pb-32 px-6 relative z-10 bg-[#030305]">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#00f0ff]/05 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-[#a200ff]/05 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10">
        
        {/* Section Header (Guaranteed 100% visible, no clipping or opacity freeze) */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-[#a200ff]/30 mb-6 shadow-[0_0_20px_rgba(162,0,255,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#a200ff] tracking-[0.25em] uppercase">
              Community & Industry Acclaim
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black mb-4 tracking-tighter text-white">
            Trusted by <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#a200ff] to-[#ff0055]">
              50,000+ Spatial Engineers
            </span>
          </h2>
          <p className="text-gray-300 font-normal text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            See how top engineering teams and visual computing leaders use NextGen AI to power their production clusters.
          </p>
        </div>

        {/* Trust Metrics Strip (Fills previous gap with meaningful social proof) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-12">
          {trustMetrics.map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col justify-between hover:border-white/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase text-gray-400 font-bold tracking-wider">{stat.label}</span>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stat.value}</div>
              <div className="text-[11px] text-gray-400 mt-1 font-medium">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {reviews.map((review, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.03] to-[#070710]/90 border border-white/10 hover:border-white/20 backdrop-blur-2xl flex flex-col justify-between gap-6 relative group shadow-xl"
            >
              {/* Top Row: Stars + Tag */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#00f0ff] text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                  ))}
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#00f0ff] font-bold uppercase tracking-wider">
                  {review.tag}
                </span>
              </div>

              {/* Quote Body */}
              <div className="relative">
                <Quote className="w-10 h-10 text-white/5 absolute -top-4 -left-2 pointer-events-none group-hover:text-[#a200ff]/20 transition-colors" />
                <p className="text-gray-200 text-sm sm:text-base leading-relaxed relative z-10 font-normal">
                  "{review.content}"
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-white/5 flex items-center gap-3.5">
                <img
                  src={review.avatar}
                  alt={`Portrait of ${review.name}`}
                  loading="lazy"
                  className="w-12 h-12 rounded-full border border-white/20 object-cover shrink-0"
                />
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-white text-sm tracking-tight truncate">{review.name}</h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00f0ff] shrink-0" />
                  </div>
                  <p className="text-xs text-gray-400 truncate">{review.role}</p>
                  <p className="text-[10px] font-mono text-emerald-400 font-semibold">{review.verified}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
