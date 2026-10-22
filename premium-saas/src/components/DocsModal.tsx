import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  X, Search, Copy, Check, Terminal, Cpu, Zap, Shield, 
  Globe, Code2, Sparkles, BookOpen, ExternalLink
} from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export const DocsModal = ({ isOpen, onClose, initialTab = 'overview' }: DocsModalProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [apiLang, setApiLang] = useState<'curl' | 'js' | 'python'>('js');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const navSections = [
    { id: 'overview', title: '1. Architecture & Core', icon: Cpu, badge: 'v2.4' },
    { id: 'quickstart', title: '2. SDK & Quickstart', icon: Terminal, badge: 'CLI' },
    { id: 'shaders', title: '3. WebGPU / GLSL Shaders', icon: Zap, badge: '3D' },
    { id: 'api', title: '4. REST & WebSocket API', icon: Code2, badge: 'Live' },
    { id: 'security', title: '5. Quantum Security & SLA', icon: Shield, badge: 'AES-256' },
  ];

  const filteredSections = navSections.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return typeof document !== 'undefined' ? createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[260] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-6xl h-[92vh] max-h-[900px] rounded-3xl bg-[#070710] border border-white/15 shadow-[0_0_100px_rgba(0,240,255,0.2)] flex flex-col overflow-hidden text-white font-sans"
        >
          {/* ── TOP HEADER BAR ────────────────────────────────────── */}
          <div className="h-16 px-5 sm:px-8 border-b border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#a200ff] flex items-center justify-center shadow-lg shadow-[#00f0ff]/20">
                <BookOpen className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm tracking-wide uppercase text-white">
                    NexGen Protocol Documentation
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-[10px] font-bold">
                    DOC-ID: NG-SYS-412
                  </span>
                </div>
                <div className="text-[11px] font-mono text-gray-400 hidden sm:block">
                  Autonomous 3D Spatial Computing Engine · Core Architecture Manual
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                API v2.4.0 ONLINE
              </span>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="Close Documentation (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── SEARCH & SUBHEADER BAR ────────────────────────────── */}
          <div className="px-5 sm:px-8 py-3 border-b border-white/10 bg-black/40 flex items-center justify-between gap-4 shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search protocols, shaders, endpoints, quantum security..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-gray-400 hidden sm:flex">
              <span className="text-gray-500">Fast Navigation:</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/15 text-[10px] text-gray-300">Esc</kbd>
              <span>to close</span>
            </div>
          </div>

          {/* ── MAIN CONTENT WORKSPACE ────────────────────────────── */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 lg:w-72 border-r border-white/10 bg-[#05050a]/90 p-3 sm:p-4 shrink-0 overflow-y-auto space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400 px-3 py-1 font-bold">
                Table of Contents
              </div>
              {filteredSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveTab(sec.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer font-medium text-xs ${
                    activeTab === sec.id
                      ? 'bg-gradient-to-r from-[#00f0ff]/15 to-[#a200ff]/15 border border-[#00f0ff]/40 text-white font-bold shadow-md shadow-[#00f0ff]/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <sec.icon className={`w-4 h-4 ${activeTab === sec.id ? 'text-[#00f0ff]' : 'text-gray-400'}`} />
                    <span>{sec.title}</span>
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    activeTab === sec.id ? 'bg-[#00f0ff]/20 text-[#00f0ff]' : 'bg-white/5 text-gray-500'
                  }`}>
                    {sec.badge}
                  </span>
                </button>
              ))}

              <div className="pt-4 mt-4 border-t border-white/5 px-3 space-y-2">
                <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                  Active Fleet Cluster
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 font-mono text-[10px]">
                  <div className="flex justify-between text-gray-400">
                    <span>Cluster Nodes</span>
                    <span className="text-white font-bold">14,029</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Mesh Latency</span>
                    <span className="text-emerald-400 font-bold">&lt;0.28ms</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Cipher</span>
                    <span className="text-[#00f0ff] font-bold">AES-256-GCM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 bg-[#070712] select-text">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] font-mono text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> Technical Specification DOC-ID: NG-SYS-412
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      NexGen Spatial Computing Architecture
                    </h2>
                    <p className="text-sm text-gray-300 leading-relaxed font-sans">
                      NexGen is the world's first autonomous spatial engine that couples a browser-native WebGL/WebGPU 3D canvas with distributed edge neural inference. Traditional dashboards flatten multi-dimensional cloud metrics into static tables; NexGen computes tensor weights, network packet flows, and cluster health inside a continuous 3D volumetric matrix.
                    </p>
                  </div>

                  {/* Core Pillars */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                      <div className="text-[10px] text-gray-400 uppercase">Sub-ms Latency Bus</div>
                      <div className="text-2xl font-black text-[#00f0ff]">&lt;0.3ms</div>
                      <p className="text-xs text-gray-400 font-sans">
                        Zero-copy shared memory buffer and WebSocket multiplexing between client viewports and local Daemons.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                      <div className="text-[10px] text-gray-400 uppercase">Tensor Mesh Throughput</div>
                      <div className="text-2xl font-black text-[#a200ff]">1.24 TB/s</div>
                      <p className="text-xs text-gray-400 font-sans">
                        Peer-to-peer WebRTC data channels linking 14,029 edge nodes with real-time vector quantization.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                      <div className="text-[10px] text-gray-400 uppercase">Dual-Engine Renderer</div>
                      <div className="text-2xl font-black text-emerald-400">60 FPS</div>
                      <p className="text-xs text-gray-400 font-sans">
                        Hardware-accelerated Three.js PBR shaders with automated 2D Canvas geodesic fallback for low-spec devices.
                      </p>
                    </div>
                  </div>

                  {/* System Topology Diagram */}
                  <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3 font-mono">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs font-bold text-white uppercase">System Data Pipeline</span>
                      <span className="text-[10px] text-[#00f0ff]">IEEE 802.1Qav TSN</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[#00f0ff] font-bold">1. Edge Ingestion</div>
                        <div className="text-gray-400 text-[11px] mt-1 font-sans">
                          Raw biometric & telemetry packet streams arrive via UDP/WSS.
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[#a200ff] font-bold">2. Neural Sharding</div>
                        <div className="text-gray-400 text-[11px] mt-1 font-sans">
                          Distributed weights processed across 38 availability zones.
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-emerald-400 font-bold">3. 3D Spatial Sync</div>
                        <div className="text-gray-400 text-[11px] mt-1 font-sans">
                          GLSL matrix vertex shaders displace nodes based on live telemetry.
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-amber-400 font-bold">4. Client Cockpit</div>
                        <div className="text-gray-400 text-[11px] mt-1 font-sans">
                          60FPS interactive Three.js HUD with responsive audio feedback.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: QUICKSTART */}
              {activeTab === 'quickstart' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white">SDK & CLI Quickstart</h2>
                    <p className="text-sm text-gray-300 font-sans">
                      Spin up a synchronized spatial application or connect to the NexGen cluster in under 60 seconds.
                    </p>
                  </div>

                  {/* Step 1: Install CLI */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                      <span>Step 1: Install NexGen Core CLI & SDK</span>
                      <button
                        onClick={() => copyToClipboard('npm install -g @nexgen/cli @nexgen/core', 'cli-install')}
                        className="flex items-center gap-1.5 text-[#00f0ff] hover:underline"
                      >
                        {copiedSnippet === 'cli-install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSnippet === 'cli-install' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-black border border-white/10 font-mono text-xs text-[#00f0ff] overflow-x-auto">
                      <code>npm install -g @nexgen/cli @nexgen/core</code>
                    </pre>
                  </div>

                  {/* Step 2: Initialize Project */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                      <span>Step 2: Bootstrap 3D Neural Matrix Workspace</span>
                      <button
                        onClick={() => copyToClipboard('nexgen init my-spatial-app --template 3d-cockpit\ncd my-spatial-app\nnexgen dev', 'init-proj')}
                        className="flex items-center gap-1.5 text-[#00f0ff] hover:underline"
                      >
                        {copiedSnippet === 'init-proj' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSnippet === 'init-proj' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-black border border-white/10 font-mono text-xs text-purple-300 overflow-x-auto">
                      <code>{`# Create new spatial workspace
nexgen init my-spatial-app --template 3d-cockpit

# Enter workspace and start neural dev server
cd my-spatial-app
nexgen dev --port 5173`}</code>
                    </pre>
                  </div>

                  {/* Step 3: Minimal Client Code */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                      <span>Step 3: Connect to Spatial Stream in TypeScript</span>
                      <button
                        onClick={() => copyToClipboard(`import { NexGenClient } from '@nexgen/core';

const client = new NexGenClient({
  apiKey: process.env.NEXGEN_API_KEY,
  endpoint: 'http://localhost:5173/api/v1',
  streamWs: 'ws://localhost:5173/telemetry'
});

await client.connect();
client.on('telemetry', (metric) => {
  console.log('Real-time node latency:', metric.latency);
});`, 'ts-code')}
                        className="flex items-center gap-1.5 text-[#00f0ff] hover:underline"
                      >
                        {copiedSnippet === 'ts-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSnippet === 'ts-code' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-black border border-white/10 font-mono text-xs text-gray-300 overflow-x-auto leading-relaxed">
                      <code>{`import { NexGenClient } from '@nexgen/core';

// Initialize zero-latency client connection
const client = new NexGenClient({
  apiKey: process.env.NEXGEN_API_KEY,
  endpoint: 'http://localhost:5173/api/v1',
  streamWs: 'ws://localhost:5173/telemetry'
});

await client.connect();
client.on('telemetry', (metric) => {
  console.log('Real-time node latency:', metric.latency);
});`}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 3: SHADERS */}
              {activeTab === 'shaders' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white">WebGPU & GLSL Shaders</h2>
                    <p className="text-sm text-gray-300 font-sans">
                      The NexGen 3D Cockpit utilizes hardware-accelerated GLSL vertex displacement and fragment specular shaders to represent live neural loss in real-time.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                      <span>GLSL ES 3.0 Kinetic Vertex Shader</span>
                      <button
                        onClick={() => copyToClipboard(`#version 300 es
in vec3 position;
in vec3 normal;
uniform float u_time;
uniform float u_tensor_loss;
out float vDisplacement;

void main() {
  float pulse = sin(u_time * 3.0 + position.y * 2.0) * (0.05 + u_tensor_loss * 0.2);
  vDisplacement = pulse;
  vec3 displacedPosition = position + (normal * pulse);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}`, 'shader-code')}
                        className="flex items-center gap-1.5 text-[#00f0ff] hover:underline"
                      >
                        {copiedSnippet === 'shader-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSnippet === 'shader-code' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-black border border-white/10 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
                      <code>{`#version 300 es
in vec3 position;
in vec3 normal;
uniform float u_time;
uniform float u_tensor_loss;
out float vDisplacement;

void main() {
  // Displace mesh vertices dynamically based on live neural tensor loss
  float pulse = sin(u_time * 3.0 + position.y * 2.0) * (0.05 + u_tensor_loss * 0.2);
  vDisplacement = pulse;
  vec3 displacedPosition = position + (normal * pulse);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}`}</code>
                    </pre>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <h4 className="text-xs font-bold font-mono text-purple-400 uppercase">Specular PMREM Reflection</h4>
                    <p className="text-xs text-gray-300 font-sans leading-relaxed">
                      NexGen synthesizes a high-dynamic-range equirectangular gradient canvas at runtime (512x256), converted via Three.js <code className="text-[#00f0ff]">PMREMGenerator</code> into a prefiltered miplevel environment map. This produces realistic obsidian and cyan specular sheen across nodes with zero external image asset dependencies.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: API */}
              {activeTab === 'api' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white">REST & WebSocket API Reference</h2>
                    <p className="text-sm text-gray-300 font-sans">
                      All endpoints support HTTP/2, WebSocket duplex streaming, and Bearer token authorization.
                    </p>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center gap-2 p-1 rounded-xl bg-black/60 border border-white/10 w-max font-mono text-xs">
                    {(['js', 'python', 'curl'] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => setApiLang(lang)}
                        className={`px-3 py-1 rounded-lg uppercase font-bold transition-all ${
                          apiLang === lang
                            ? 'bg-[#00f0ff] text-black shadow-md'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {lang === 'js' ? 'TypeScript / Node' : lang === 'python' ? 'Python' : 'cURL'}
                      </button>
                    ))}
                  </div>

                  {/* Endpoint 1 */}
                  <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">GET</span>
                        <span className="text-xs font-bold text-white">/api/v1/cluster/status</span>
                      </div>
                      <span className="text-[10px] text-gray-400">Rate Limit: 10,000 req/min</span>
                    </div>
                    <p className="text-xs text-gray-300 font-sans">
                      Returns live health, latency percentiles (p50, p99), active node count, and quantum cipher status across all regions.
                    </p>
                    <pre className="p-3 rounded-xl bg-[#030308] border border-white/5 text-xs text-gray-300 overflow-x-auto">
                      <code>{apiLang === 'js' ? `const response = await fetch('http://localhost:5173/api/v1/cluster/status', {
  headers: { 'Authorization': 'Bearer NXG_ROOT_SEC' }
});
const data = await response.json();` : apiLang === 'python' ? `import requests

res = requests.get('http://localhost:5173/api/v1/cluster/status', headers={
    'Authorization': 'Bearer NXG_ROOT_SEC'
})
data = res.json()` : `curl -X GET "http://localhost:5173/api/v1/cluster/status" \\
  -H "Authorization: Bearer NXG_ROOT_SEC"`}</code>
                    </pre>
                  </div>

                  {/* Endpoint 2: Rebalance */}
                  <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-xs">POST</span>
                        <span className="text-xs font-bold text-white">/api/v1/cluster/rebalance</span>
                      </div>
                      <span className="text-[10px] text-gray-400">Enterprise Clearance Only</span>
                    </div>
                    <p className="text-xs text-gray-300 font-sans">
                      Automated quantum load redistribution across US-East, EU-West, and APAC-South availability clusters.
                    </p>
                  </div>

                  {/* Endpoint 3: WebSocket */}
                  <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-xs">WSS</span>
                        <span className="text-xs font-bold text-white">wss://stream.nexgen.cloud/v1/telemetry</span>
                      </div>
                      <span className="text-[10px] text-purple-400 font-bold">Duplex 60Hz</span>
                    </div>
                    <p className="text-xs text-gray-300 font-sans">
                      Binary multiplexed stream delivering real-time coordinate updates and node state telemetry.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: SECURITY */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white">Quantum Security & SLA Guarantees</h2>
                    <p className="text-sm text-gray-300 font-sans">
                      NexGen is architected from the bare-metal kernel upward with end-to-end zero-trust cryptographic guarantees.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-[#00f0ff] font-bold text-sm">
                        <Shield className="w-4 h-4" />
                        <span>AES-256-GCM Handshake</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">
                        All inter-node traffic uses post-quantum lattice-based key exchange with automated 15-minute ephemeral session rotation.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <Globe className="w-4 h-4" />
                        <span>99.99% Availability SLA</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">
                        Multi-region edge failover with automated state recovery guaranteed under standard enterprise service level agreements.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── FOOTER ────────────────────────────────────────────── */}
          <div className="h-14 px-5 sm:px-8 border-t border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0 font-mono text-xs">
            <span className="text-gray-400 text-[11px]">
              DOC-ID: <span className="text-white font-bold">NG-SYS-412</span> · Rev 4.12
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  window.open('/docs', '_blank');
                }}
                className="text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors text-[11px] cursor-pointer"
              >
                <span>Standalone Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-[#00f0ff] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  ) : null;
};
