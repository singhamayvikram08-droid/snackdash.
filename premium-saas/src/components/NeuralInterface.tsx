import { useState, useEffect, type ComponentType, type CSSProperties } from 'react';
import { Cpu, Zap, Activity, Shield, Globe } from 'lucide-react';
import { useAuth } from '../utils/auth';

interface MetricNodeProps {
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  label: string;
  value: string;
  detail: string;
  color: string;
}

const MetricNode = ({ icon: Icon, label, value, detail, color }: MetricNodeProps) => {
  return (
    <div className="p-5 rounded-2xl bg-[#080812]/90 border border-white/10 hover:border-[#00f0ff]/40 transition-all shadow-xl relative group flex flex-col justify-between">
      <div 
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl" style={{ backgroundColor: `${color}15` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <span className="text-xs uppercase tracking-wider text-gray-300 font-mono font-bold">{label}</span>
          </div>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
        </div>

        <div className="text-2xl font-black text-white font-mono tracking-tight">{value}</div>
      </div>

      <div className="text-xs text-gray-400 mt-3 pt-2.5 border-t border-white/5 font-mono flex items-center justify-between">
        <span>{detail}</span>
        <span className="text-[10px] text-emerald-400 font-bold">ONLINE</span>
      </div>
    </div>
  );
};

const NeuralInterface = () => {
  const [hexCodes, setHexCodes] = useState<string[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const generate = () => {
      const codes = Array.from({ length: 12 }, () => 
        Math.floor(Math.random() * 0xFFFFFF).toString(16).padEnd(6, '0').toUpperCase()
      );
      setHexCodes(codes);
    };
    generate();
    const interval = setInterval(generate, 250);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="engine" className="w-full py-16 sm:py-20 lg:py-24 overflow-hidden bg-[#030305] relative">
      {/* Background kinetic void */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.04),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
      
      {/* Master Container (Consistent max-w-7xl matching site architecture) */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column: Kinetic Readout & Live Bus Stream */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-xs font-bold uppercase font-mono tracking-widest mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
                {isAuthenticated ? 'Autonomous Neural Engine :: Connected' : 'Autonomous Neural Engine :: Active'}
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading leading-tight mb-4 text-white tracking-tight">
                The Kinetic <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#a200ff] to-[#ff0055]">
                  Neural Architecture
                </span>
              </h2>
              
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-normal">
                Experience an intelligent computing core engineered for spatial rendering. 
                Our distributed neural engine processes telemetry, shader compilation, and edge routing in sub-millisecond execution cycles.
              </p>
            </div>
            
            {/* Hex Stream Card - Full Column Width, Balanced Symmetry */}
            <div className="rounded-2xl bg-[#070710] border border-white/10 p-5 w-full relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#a200ff]" />
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-[10px] text-gray-400 font-mono uppercase mb-0.5">Live Bus Feed</div>
                  <div className="text-sm font-bold font-mono text-white flex items-center gap-2">
                    <span>NEURAL_OUTPUT_01</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">STREAMING</span>
                  </div>
                </div>
                <Activity className="w-4 h-4 text-[#a200ff]" />
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 font-mono text-[11px] text-[#00f0ff]/90 h-20 overflow-hidden bg-black/40 p-2.5 rounded-xl border border-white/5">
                {hexCodes.map((code, i) => (
                  <div key={i} className="hover:text-white transition-colors cursor-default text-center">
                    0x{code}
                  </div>
                ))}
              </div>
              
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-400">
                <span>BUS LATENCY: &lt;0.002ms</span>
                <span className="text-emerald-400 font-bold">SYNCHRONIZED (60 FPS)</span>
              </div>
            </div>
          </div>
          
          {/* Right Column: Visualizer Matrix & High-Contrast Nodes */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
              <MetricNode
                icon={Cpu}
                label="Neural Compute"
                value="128.4 TFLOPS"
                detail="4,096 Tensor Cores"
                color="#00f0ff"
              />
              <MetricNode
                icon={Shield}
                label="Quantum Enclave"
                value="AES-256-GCM"
                detail="Hardware Key Vault"
                color="#a200ff"
              />
              <MetricNode
                icon={Globe}
                label="Global Edge Mesh"
                value="312 Active Nodes"
                detail="38 Availability Zones"
                color="#10b981"
              />
              <MetricNode
                icon={Zap}
                label="Energy Efficiency"
                value="99.98%"
                detail="Dynamic Voltage Scaling"
                color="#f59e0b"
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default NeuralInterface;
