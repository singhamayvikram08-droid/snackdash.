import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../utils/usePageSEO';
import { 
  Search, Copy, Check, Terminal, Cpu, Zap, Shield, 
  Globe, Code2, Sparkles, Hexagon
} from 'lucide-react';

const DocsPage = () => {
  usePageSEO({
    title: 'Protocol Documentation — NexGen AI Architecture & APIs',
    description: 'Technical specifications, WebGPU and GLSL shader protocols, WebSocket telemetry APIs, and quantum encryption architecture for NexGen AI.'
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [apiLang, setApiLang] = useState<'curl' | 'js' | 'python'>('js');

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

  return (
    <div className="min-h-screen bg-[#030308] text-white font-sans selection:bg-[#00f0ff] selection:text-black">
      {/* ── TOP NAVBAR ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-16 border-b border-white/10 bg-[#05050c]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer" title="Go to NexGen AI Home">
            <Hexagon className="w-6 h-6 sm:w-7 sm:h-7 text-[#00f0ff] group-hover:scale-110 transition-transform" />
            <span className="font-black text-base sm:text-lg tracking-wider uppercase text-white">
              Nex<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#a200ff]">Gen</span>
            </span>
          </Link>
          <div className="hidden md:block h-5 w-px bg-white/10" />
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
              Protocol Documentation
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-[10px] font-bold">
              DOC-ID: NG-SYS-412
            </span>
          </div>
        </div>
      </header>

      {/* ── MAIN LAYOUT ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="w-full md:w-72 border-r border-white/10 p-6 space-y-6 shrink-0 bg-[#04040a]">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search docs..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 outline-none focus:border-[#00f0ff] transition-all font-mono"
            />
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400 px-3 py-1 font-bold">
              Architecture Manual
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
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 font-mono text-[11px]">
            <div className="text-[10px] uppercase text-gray-400 font-bold">Telemetry Health</div>
            <div className="flex justify-between text-gray-300">
              <span>Edge Nodes</span>
              <span className="text-[#00f0ff] font-bold">14,029 Online</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Latency</span>
              <span className="text-emerald-400 font-bold">&lt;0.28ms</span>
            </div>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 p-6 sm:p-12 overflow-y-auto space-y-10">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] font-mono text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Core Specification (Rev 4.12)
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                  NexGen Spatial Computing Protocol
                </h1>
                <p className="text-base text-gray-300 leading-relaxed font-sans max-w-3xl">
                  NexGen couples browser-native WebGL/WebGPU 3D spatial viewports with distributed edge neural inference. Unlike legacy 2D operational dashboards, NexGen calculates tensor weights, network packet flows, and node telemetry in real-time inside a synchronized 3D coordinate space.
                </p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 font-mono">
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="text-[10px] text-gray-400 uppercase">Sub-ms Latency Bus</div>
                  <div className="text-3xl font-black text-[#00f0ff]">&lt;0.3ms</div>
                  <p className="text-xs text-gray-400 font-sans">
                    Zero-copy shared memory buffer and WebSocket multiplexing between client viewports and local Daemons.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="text-[10px] text-gray-400 uppercase">Tensor Mesh Throughput</div>
                  <div className="text-3xl font-black text-[#a200ff]">1.24 TB/s</div>
                  <p className="text-xs text-gray-400 font-sans">
                    Peer-to-peer WebRTC data channels linking 14,029 edge nodes with vector quantization.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="text-[10px] text-gray-400 uppercase">Dual-Engine Renderer</div>
                  <div className="text-3xl font-black text-emerald-400">60 FPS</div>
                  <p className="text-xs text-gray-400 font-sans">
                    Hardware-accelerated Three.js PBR shaders with automated 2D Canvas geodesic fallback.
                  </p>
                </div>
              </div>

              {/* Architecture Blueprint */}
              <div className="p-6 rounded-3xl bg-[#080814] border border-white/10 space-y-4 font-mono">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-sm font-bold text-white uppercase">System Data Pipeline</span>
                  <span className="text-xs text-[#00f0ff]">IEEE 802.1Qav TSN</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[#00f0ff] font-bold">1. Edge Ingestion</div>
                    <div className="text-gray-400 text-xs mt-1 font-sans">
                      Raw biometric & telemetry packet streams arrive via UDP/WSS.
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[#a200ff] font-bold">2. Neural Sharding</div>
                    <div className="text-gray-400 text-xs mt-1 font-sans">
                      Distributed weights processed across 38 availability zones.
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-emerald-400 font-bold">3. 3D Spatial Sync</div>
                    <div className="text-gray-400 text-xs mt-1 font-sans">
                      GLSL matrix vertex shaders displace nodes based on live telemetry.
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-amber-400 font-bold">4. Client Cockpit</div>
                    <div className="text-gray-400 text-xs mt-1 font-sans">
                      60FPS interactive Three.js HUD with responsive audio feedback.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUICKSTART */}
          {activeTab === 'quickstart' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-white">SDK & CLI Quickstart</h2>
                <p className="text-sm text-gray-300 font-sans max-w-2xl">
                  Bootstrap a new spatial computing workspace or connect to the distributed cluster in 3 commands.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>1. Install Global CLI</span>
                  <button
                    onClick={() => copyToClipboard('npm install -g @nexgen/cli @nexgen/core', 'page-cli')}
                    className="flex items-center gap-1.5 text-[#00f0ff] hover:underline"
                  >
                    {copiedSnippet === 'page-cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet === 'page-cli' ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-black border border-white/10 font-mono text-sm text-[#00f0ff] overflow-x-auto">
                  <code>npm install -g @nexgen/cli @nexgen/core</code>
                </pre>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>2. Initialize Project Template</span>
                  <button
                    onClick={() => copyToClipboard('nexgen init my-spatial-app --template 3d-cockpit\ncd my-spatial-app\nnexgen dev', 'page-init')}
                    className="flex items-center gap-1.5 text-[#00f0ff] hover:underline"
                  >
                    {copiedSnippet === 'page-init' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet === 'page-init' ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-black border border-white/10 font-mono text-sm text-purple-300 overflow-x-auto">
                  <code>{`nexgen init my-spatial-app --template 3d-cockpit
cd my-spatial-app
nexgen dev --port 5173`}</code>
                </pre>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>3. Node.js & TypeScript Client Usage</span>
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
});`, 'page-code')}
                    className="flex items-center gap-1.5 text-[#00f0ff] hover:underline"
                  >
                    {copiedSnippet === 'page-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet === 'page-code' ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-black border border-white/10 font-mono text-sm text-gray-300 overflow-x-auto leading-relaxed">
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
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-white">WebGPU & GLSL Shaders</h2>
                <p className="text-sm text-gray-300 font-sans max-w-2xl">
                  Interactive WebGL/WebGPU shaders dynamically render neural loss into vertex displacement ripples.
                </p>
              </div>

              <pre className="p-5 rounded-2xl bg-black border border-white/10 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
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
          )}

          {/* TAB 4: API */}
          {activeTab === 'api' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-white">REST & WebSocket API Reference</h2>
                <p className="text-sm text-gray-300 font-sans">
                  Standardized JSON payloads with sub-millisecond loopback bus responses.
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

              <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3 font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">GET</span>
                  <span className="text-xs font-bold text-white">/api/v1/cluster/status</span>
                </div>
                <pre className="p-3 rounded-xl bg-[#030308] border border-white/5 text-xs text-gray-300 overflow-x-auto">
                  <code>{apiLang === 'js' ? `const res = await fetch('http://localhost:5173/api/v1/cluster/status', {
  headers: { 'Authorization': 'Bearer NXG_ROOT_SEC' }
});
const status = await res.json();` : apiLang === 'python' ? `import requests
res = requests.get('http://localhost:5173/api/v1/cluster/status', headers={'Authorization': 'Bearer NXG_ROOT_SEC'})
status = res.json()` : `curl -X GET "http://localhost:5173/api/v1/cluster/status" -H "Authorization: Bearer NXG_ROOT_SEC"`}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-white">Quantum Security & SLA Guarantees</h2>
                <p className="text-sm text-gray-300 font-sans max-w-2xl">
                  Zero-trust cryptographic protocols with hardware-backed key storage.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="p-6 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-[#00f0ff] font-bold text-base">
                    <Shield className="w-5 h-5" />
                    <span>AES-256-GCM Handshake</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed font-sans">
                    All inter-node traffic uses post-quantum lattice-based key exchange with automated 15-minute ephemeral session rotation.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                    <Globe className="w-5 h-5" />
                    <span>99.99% Availability SLA</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed font-sans">
                    Multi-region edge failover with automated state recovery guaranteed under standard enterprise service level agreements.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DocsPage;
