import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Hexagon, Cpu, Zap, Shield, Globe, 
  Terminal, ArrowUpRight, LogOut, Sparkles, RefreshCw, Layers,
  Server, Trash2, CheckCircle2, FileText,
  Activity, Gauge, Send, Copy, Download, Check
} from 'lucide-react';
import Magnetic from '../components/Magnetic';
import { analytics } from '../utils/analytics';
import { useAuth, getStoredAuth } from '../utils/auth';
import { logAdminAction } from '../utils/security';
import { usePageSEO } from '../utils/usePageSEO';

interface Project {
  name: string;
  category: string;
  status: 'online' | 'standby';
  port: number;
  path?: string;
  uptime: string;
  load: string;
}

interface FleetNodeItem {
  id: string;
  name: string;
  city: string;
  region: 'US-East' | 'EU-Central' | 'APAC-South' | 'AP-Northeast';
  ping: string;
  conns: string;
  status: 'Operational' | 'Degraded' | 'Standby';
  load: string;
  memory: string;
}

const mockProjects: Project[] = [
  { name: 'NexGen AI PRO 3D Spatial Cockpit', category: 'WebGL Neural Matrix & HUD', status: 'online', port: 5173, path: '/cockpit', uptime: '100%', load: '4%' },
  { name: 'Student AI Digital Twin', category: 'Next.js + FastAPI', status: 'online', port: 3000, uptime: '99.98%', load: '18%' },
  { name: 'Vital AI Health Engine', category: 'Biometric AI Engine', status: 'online', port: 3001, uptime: '99.95%', load: '24%' },
  { name: 'SnackDash Campus Delivery', category: 'Node + SQLite Express', status: 'online', port: 3002, uptime: '99.89%', load: '42%' },
  { name: 'Projectile Motion Physics', category: 'Interactive Physics Engine', status: 'online', port: 3003, uptime: '100%', load: '8%' },
  { name: 'System Portfolio & Kernel', category: 'Low-level OS UI', status: 'online', port: 5174, uptime: '100%', load: '12%' },
];

const FLEET_NODES_LIST: FleetNodeItem[] = [
  { id: 'node-us-01', name: 'US-East #01', city: 'Virginia, US', region: 'US-East', ping: '8ms', conns: '18.4k', status: 'Operational', load: '28%', memory: '1.4 / 8 GB' },
  { id: 'node-us-02', name: 'US-East #02', city: 'Ohio, US', region: 'US-East', ping: '11ms', conns: '14.2k', status: 'Operational', load: '32%', memory: '1.8 / 8 GB' },
  { id: 'node-eu-01', name: 'EU-Central #01', city: 'Frankfurt, DE', region: 'EU-Central', ping: '15ms', conns: '24.1k', status: 'Operational', load: '41%', memory: '3.2 / 8 GB' },
  { id: 'node-eu-02', name: 'EU-West #02', city: 'London, UK', region: 'EU-Central', ping: '14ms', conns: '19.8k', status: 'Operational', load: '36%', memory: '2.6 / 8 GB' },
  { id: 'node-ap-01', name: 'APAC-South #01', city: 'Singapore, SG', region: 'APAC-South', ping: '24ms', conns: '22.1k', status: 'Operational', load: '38%', memory: '2.8 / 8 GB' },
  { id: 'node-ap-02', name: 'APAC-South #02', city: 'Mumbai, IN', region: 'APAC-South', ping: '28ms', conns: '17.6k', status: 'Operational', load: '34%', memory: '2.2 / 8 GB' },
  { id: 'node-jp-01', name: 'AP-Northeast #01', city: 'Tokyo, JP', region: 'AP-Northeast', ping: '13ms', conns: '26.8k', status: 'Operational', load: '22%', memory: '1.8 / 8 GB' },
  { id: 'node-kr-01', name: 'AP-Northeast #02', city: 'Seoul, KR', region: 'AP-Northeast', ping: '16ms', conns: '15.2k', status: 'Standby', load: '18%', memory: '1.2 / 8 GB' },
  { id: 'node-degraded-01', name: 'AP-Edge #03', city: 'Sydney, AU', region: 'APAC-South', ping: '42ms', conns: '9.4k', status: 'Degraded', load: '89%', memory: '7.1 / 8 GB' },
];

const DashboardPage = () => {
  usePageSEO({
    title: 'Platform Dashboard — NexGen AI PRO Edge Operations',
    description: 'Monitor real-time edge telemetry, inspect global clusters, execute terminal diagnostics, and manage autonomous 3D microservice deployments.'
  });

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isPro = user?.tier === 'pro' || user?.isPro;
  const isEnterprise = user?.tier === 'enterprise';
  const [activeTab, setActiveTab] = useState<'overview' | 'nodes' | 'console' | 'spec' | 'ai-terminal'>('overview');
  const [fleetNodes, setFleetNodes] = useState<FleetNodeItem[]>(FLEET_NODES_LIST);
  const [fleetFilter, setFleetFilter] = useState<'All' | 'Operational' | 'Degraded' | 'Standby'>('All');
  const [rebalancingFleet, setRebalancingFleet] = useState(false);
  const [pingTarget, setPingTarget] = useState('edge.nexgen.cloud');
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);
  const [nodeFeedback, setNodeFeedback] = useState<string | null>(null);
  const [copiedSpec, setCopiedSpec] = useState(false);

  // AI Reasoning Terminal State (recursive/flint-v1.0:free)
  const [reasoningPrompt, setReasoningPrompt] = useState("How many r's are in the word 'strawberry'?");
  const [reasoningStream, setReasoningStream] = useState('');
  const [reasoningThoughts, setReasoningThoughts] = useState('');
  const [reasoningTokens, setReasoningTokens] = useState<number | null>(null);
  const [isInferencing, setIsInferencing] = useState(false);
  const [reasoningTimeMs, setReasoningTimeMs] = useState<number | null>(null);

  const runAiInference = async (customPrompt?: string) => {
    const q = (customPrompt || reasoningPrompt).trim();
    if (!q || isInferencing) return;

    setIsInferencing(true);
    setReasoningStream('');
    setReasoningThoughts('');
    setReasoningTokens(null);
    const startTime = Date.now();

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'recursive/flint-v1.0:free',
          messages: [{ role: 'user', content: q }],
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Failed to connect to AI proxy endpoint');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let fullThoughts = '';
      let rTokens: number | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const textChunk = decoder.decode(value, { stream: true });
        const lines = textChunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.content) {
                fullContent += data.content;
                setReasoningStream(fullContent);
              }
              if (data.reasoning) {
                fullThoughts += data.reasoning;
                setReasoningThoughts(fullThoughts);
              }
              if (data.usage?.completionTokensDetails?.reasoningTokens) {
                rTokens = data.usage.completionTokensDetails.reasoningTokens;
                setReasoningTokens(rTokens);
              }
            } catch {
              // Ignore partial JSON
            }
          }
        }
      }

      setReasoningTimeMs(Date.now() - startTime);
    } catch (err: unknown) {
      console.error('[AI Reasoning Error]', err);
      const message = err instanceof Error ? err.message : 'Network error';
      setReasoningStream(`Error executing inference on recursive/flint-v1.0: ${message}`);
    } finally {
      setIsInferencing(false);
    }
  };

  // Terminal Console State
  const [commandInput, setCommandInput] = useState('');
  const [consoleHistory, setConsoleHistory] = useState<Array<{ cmd?: string; res: string; type?: 'info' | 'success' | 'warn' | 'error' }>>([
    { res: '═══════════════════════════════════════════════════════════════', type: 'info' },
    { res: '  NEXGEN VIRTUAL CORE OS v2.4.0 — CLUSTER INTERFACE READY', type: 'success' },
    { res: '  Type "help" to view available diagnostic & deploy commands.', type: 'info' },
    { res: '═══════════════════════════════════════════════════════════════', type: 'info' },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [commandList, setCommandList] = useState<string[]>([]);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM] Virtualization kernel initialised at 0x7FFF00.',
    '[AUTH] Token validated for active user session (Pro Tier).',
    '[ROUTING] 312 global edge cluster nodes active and listening.',
    '[SOCKET] Real-time photonic telemetry stream established.',
  ]);

  useEffect(() => {
    analytics.trackPageView('/dashboard');
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'fleet' || tabParam === 'nodes') setActiveTab('nodes');
    else if (tabParam === 'terminal' || tabParam === 'console') setActiveTab('console');
    else if (tabParam === 'spec' || tabParam === 'docs') setActiveTab('spec');
    else if (tabParam === 'ai-terminal' || tabParam === 'reasoning') setActiveTab('ai-terminal');
  }, []);

  useEffect(() => {
    if (activeTab === 'console') {
      consoleBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleHistory, activeTab]);

  useEffect(() => {
    const timer = setInterval(() => {
      const timestamps = new Date().toLocaleTimeString();
      const newLogs = [
        `[SYNC ${timestamps}] Heartbeat broadcast acknowledged (0.82ms latency).`,
        `[NODE ${timestamps}] Load rebalanced across 312 edge cluster nodes.`,
        `[QUANTUM ${timestamps}] Encryption key rotated successfully.`,
      ];
      setLogs(prev => [...prev.slice(-6), newLogs[Math.floor(Math.random() * newLogs.length)]]);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    analytics.trackEvent('user_logout');
    logout();
    navigate('/login');
  };

  const handleTabChange = (tab: 'overview' | 'nodes' | 'console' | 'spec' | 'ai-terminal') => {
    setActiveTab(tab);
    analytics.trackEvent('dashboard_tab_switch', { tab });
  };

  // Fleet Actions
  const handleAutomatedRebalance = () => {
    setRebalancingFleet(true);
    setTimeout(() => {
      setFleetNodes(prev => prev.map(n => ({
        ...n,
        load: `${Math.floor(Math.random() * 25 + 20)}%`,
        status: 'Operational'
      })));
      setRebalancingFleet(false);
      setNodeFeedback('Automated cluster rebalance complete: 312 nodes balanced across 4 regions.');
      const user = getStoredAuth();
      logAdminAction('CLUSTER_NODES_REBALANCE', user, 'edge_nodes', 'SUCCESS', { nodeCount: 312 });
      setTimeout(() => setNodeFeedback(null), 3000);
    }, 1200);
  };

  const handlePing = () => {
    setPinging(true);
    setPingResult(null);
    setTimeout(() => {
      const rtt = (Math.random() * 8 + 3).toFixed(1);
      setPingResult(`ICMP Reply from ${pingTarget}: seq=1 bytes=64 ttl=58 time=${rtt}ms (Optimal)`);
      setPinging(false);
    }, 700);
  };

  // Console Command Execution
  const executeCommand = (cmdText: string) => {
    const raw = cmdText.trim();
    if (!raw) return;

    setCommandList(prev => [...prev, raw]);
    setHistoryIndex(-1);
    setCommandInput('');

    const parts = raw.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    const newHistory: typeof consoleHistory = [...consoleHistory, { cmd: raw, res: '' }];

    switch (cmd) {
      case 'help':
        newHistory[newHistory.length - 1].res = [
          'AVAILABLE SYSTEM COMMANDS:',
          '  help               — List available commands',
          '  status             — Print overall health and edge cluster state',
          '  nodes              — List all active edge computation nodes',
          '  ping [host]        — Measure round-trip latency to edge cluster',
          '  deploy <service>   — Simulate atomic zero-downtime deployment',
          '  stats              — Display memory, CPU, and packet throughput',
          '  spec               — Output system architecture specification summary',
          '  clear              — Clear the terminal buffer',
          '  whoami             — Display currently authenticated identity',
          '  version            — Output engine build revision and protocol',
        ].join('\n');
        newHistory[newHistory.length - 1].type = 'info';
        break;

      case 'status':
        newHistory[newHistory.length - 1].res = 
          '✔ CLUSTER HEALTH: 98.4% OPTIMAL\n✔ ACTIVE NODES: 312\n✔ REGIONS: 4 Global Zones\n✔ ENCRYPTION: AES-256-GCM + Quantum Ratchet Active\n✔ GLOBAL AVG LATENCY: 4.18ms';
        newHistory[newHistory.length - 1].type = 'success';
        break;

      case 'nodes':
        newHistory[newHistory.length - 1].res = fleetNodes.map(n => 
          `[${n.status.toUpperCase().padEnd(11)}] ${n.name.padEnd(16)} | Ping: ${n.ping.padEnd(6)} | Conns: ${n.conns.padEnd(6)} | Load: ${n.load}`
        ).join('\n');
        newHistory[newHistory.length - 1].type = 'info';
        break;

      case 'ping': {
        const target = arg || 'edge.nexgen.cloud';
        newHistory[newHistory.length - 1].res = 
          `PING ${target} (198.51.100.1): 56 data bytes\n64 bytes from 198.51.100.1: icmp_seq=1 ttl=116 time=4.18ms\n64 bytes from 198.51.100.1: icmp_seq=2 ttl=116 time=4.12ms\n--- ${target} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss, avg = 4.15ms`;
        newHistory[newHistory.length - 1].type = 'success';
        break;
      }

      case 'deploy':
        if (!arg) {
          newHistory[newHistory.length - 1].res = 'Usage: deploy <service-name> (e.g., deploy student-digital-twin)';
          newHistory[newHistory.length - 1].type = 'warn';
        } else {
          newHistory[newHistory.length - 1].res = 
            `[DEPLOY] Initiating zero-downtime rollout for "${arg}"...\n[BUILD] WebGPU shaders synthesized across 312 edge nodes.\n[SUCCESS] Rollout completed in 241ms. Active in all 4 global zones.`;
          newHistory[newHistory.length - 1].type = 'success';
        }
        break;

      case 'spec':
        newHistory[newHistory.length - 1].res = 
          'DOC-ID: NG-SYS-412 · Revision 4.12\nArchitecture: WebGPU/WebGL Distributed Spatial Topology\nSecurity: Zero-Trust Gateway + Ephemeral LWE-256 Tokens\nCanary Protocol: 4-Stage Progressive Zero-Downtime Rollout';
        newHistory[newHistory.length - 1].type = 'info';
        break;

      case 'stats':
        newHistory[newHistory.length - 1].res = 
          'SYSTEM METRICS:\n  Memory In-Use : 14.8 GB / 64.0 GB (23.1%)\n  CPU Allocation: 16 Core Virtualized (31.4% avg)\n  Throughput    : 1.24 TB/s continuous\n  Packet Drops  : 0.0000%';
        newHistory[newHistory.length - 1].type = 'info';
        break;

      case 'whoami':
        newHistory[newHistory.length - 1].res = 'Identity: Amay Vikram Singh\nRole    : Pro Member / Spatial Architect\nScope   : read:write:deploy:cluster:pro';
        newHistory[newHistory.length - 1].type = 'info';
        break;

      case 'version':
        newHistory[newHistory.length - 1].res = 'NexGen Virtual Core OS v2.4.0-release (build 2026.10.19-mac-arm64)';
        newHistory[newHistory.length - 1].type = 'info';
        break;

      case 'clear':
        setConsoleHistory([]);
        return;

      default:
        newHistory[newHistory.length - 1].res = `Command not recognized: "${cmd}". Type "help" for a list of commands.`;
        newHistory[newHistory.length - 1].type = 'error';
        break;
    }

    setConsoleHistory(newHistory);
  };

  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(commandInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandList.length === 0) return;
      const nextIdx = historyIndex === -1 ? commandList.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setCommandInput(commandList[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= commandList.length) {
        setHistoryIndex(-1);
        setCommandInput('');
      } else {
        setHistoryIndex(nextIdx);
        setCommandInput(commandList[nextIdx]);
      }
    }
  };

  const filteredFleet = fleetFilter === 'All'
    ? fleetNodes
    : fleetNodes.filter(n => n.status === fleetFilter);

  const handleCopySpec = () => {
    navigator.clipboard.writeText(JSON.stringify({
      docId: 'NG-SYS-412',
      title: 'System Architecture Specification',
      version: '4.12',
      topology: 'WebGPU & WebGL Distributed Spatial Computing',
      nodes: 312,
      latencySla: '< 0.85ms',
      throughput: '1.24 TB/s',
      security: 'Zero-Trust Gateway + LWE-256'
    }, null, 2));
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2000);
  };

  const handleDownloadSpec = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      docId: 'NG-SYS-412',
      title: 'NexGen AI PRO System Architecture Specification',
      version: '4.12',
      sections: [
        '1. SYSTEM VISION & TECHNICAL ARCHITECTURE',
        '2. WEBGL/WEBGPU SHADER & TENSOR ARCHITECTURE',
        '3. REST & WEBSOCKET API SPECIFICATIONS',
        '4. ZERO-TRUST GATEWAY & QUANTUM RATELIMITING'
      ],
      nodes: 312,
      regions: ['US-East', 'EU-Central', 'APAC-South', 'AP-Northeast'],
      exportDate: new Date().toISOString()
    }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', 'NG-SYS-412-Specification.json');
    dlAnchorElem.click();
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white flex flex-col font-sans selection:bg-[#00f0ff] selection:text-black w-full max-w-full overflow-x-hidden">
      
      {/* ── TOP HEADER (Brand & User Profile) ── */}
      <header className="h-16 sm:h-20 border-b border-white/5 bg-[#050508]/90 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-6 lg:px-12 flex items-center justify-between w-full max-w-full overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <Link
            to="/login"
            state={{ from: '/', fromDashboard: true }}
            className="flex items-center gap-2.5 group cursor-pointer shrink-0"
            title="NexGen AI PRO Core Portal"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#00f0ff] blur-md opacity-40 group-hover:opacity-80 transition-opacity rounded-full" />
              <Hexagon className="text-[#00f0ff] relative z-10 w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-black text-lg sm:text-xl tracking-wide uppercase text-white flex items-center gap-1.5">
              <span>Nex<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#a200ff]">Gen AI</span></span>
              <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#00f0ff]/20 to-[#a200ff]/20 border border-[#00f0ff]/40 text-[#00f0ff] text-[10px] sm:text-xs font-black tracking-widest leading-none">
                PRO
              </span>
            </span>
            <span className="ml-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-gray-400 uppercase tracking-widest hidden md:inline-block">
              Core v2.4
            </span>
          </Link>
        </div>

        {/* User profile & actions */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <Link
            to="/cockpit"
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg shadow-[#00f0ff]/20 shrink-0"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span className="hidden sm:inline">3D Cockpit</span>
            <span className="sm:hidden">Cockpit</span>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3 pl-2 sm:pl-4 border-l border-white/10">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#a200ff] flex items-center justify-center text-xs font-black text-black shadow-lg shadow-[#00f0ff]/20 shrink-0">
              {user?.avatar || 'AV'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-white leading-tight">{user?.name || 'Amay Vikram Singh'}</div>
              {isPro ? (
                <div className="text-[10px] text-[#00f0ff] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#00f0ff]" />
                  <span>PRO SUBSCRIBER</span>
                </div>
              ) : isEnterprise ? (
                <div className="text-[10px] text-[#a200ff] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#a200ff]" />
                  <span>ENTERPRISE TIER</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">FREE MEMBER</span>
                  <Link to="/#pricing" className="text-[9px] font-mono font-bold text-[#00f0ff] hover:underline">
                    UPGRADE
                  </Link>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-[#ff0055] transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── DEDICATED CYBERNETIC SUB-HEADER NAVIGATION TAB BAR ── */}
      <div className="sticky top-16 sm:top-20 z-40 bg-[#06060c]/90 backdrop-blur-xl border-b border-white/10 w-full max-w-full px-4 sm:px-6 lg:px-12 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5">
          {[
            { id: 'overview', label: 'Overview', icon: Layers, badge: null },
            { id: 'nodes', label: 'Fleet Nodes', icon: Server, badge: '312' },
            { id: 'console', label: 'Terminal CLI', icon: Terminal, badge: 'v2.4' },
            { id: 'ai-terminal', label: 'AI Reasoning Terminal', icon: Cpu, badge: 'FLINT' },
            { id: 'spec', label: 'Spec Docs', icon: FileText, badge: 'NG-412' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as 'overview' | 'nodes' | 'console' | 'spec' | 'ai-terminal')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 select-none ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold shadow-[0_0_20px_rgba(0,240,255,0.3)] scale-[1.02]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/15'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-black' : 'text-[#00f0ff]'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    activeTab === tab.id
                      ? 'bg-black/20 text-black'
                      : 'bg-white/10 text-gray-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN WORKSPACE ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-12 space-y-10 overflow-x-hidden">
        
        {/* Feedback alert banner */}
        <AnimatePresence>
          {nodeFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-4 py-3 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{nodeFeedback}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════
            TAB 1: OVERVIEW
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 w-full max-w-full overflow-hidden"
          >
            {/* Welcome Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff] text-xs font-bold uppercase tracking-widest mb-3">
                  <Sparkles className="w-3 h-3" /> System Operational
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                  Autonomous Development Engine
                </h1>
                <p className="text-gray-300 text-sm mt-1">
                  Synchronized spatial environment connected to 312 edge compute units across 4 global zones.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Magnetic strength={0.15}>
                  <button 
                    onClick={() => {
                      const ts = new Date().toLocaleTimeString();
                      setLogs(prev => [...prev, `[USER] Manual telemetry refresh executed at ${ts}.`]);
                      setNodeFeedback('Telemetry refreshed successfully across all clusters.');
                      setTimeout(() => setNodeFeedback(null), 2500);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#00f0ff]" />
                    Sync Telemetry
                  </button>
                </Magnetic>
              </div>
            </div>

            {/* Dynamic Subscription Status Banner */}
            {isPro ? (
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#00f0ff]/10 via-[#a200ff]/10 to-transparent border border-[#00f0ff]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(0,240,255,0.12)]">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00f0ff] to-[#a200ff] text-black flex items-center justify-center font-black shadow-lg shadow-[#00f0ff]/30 shrink-0">
                    <Sparkles className="w-5 h-5 fill-black" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white">PRO SUBSCRIBER STATUS: ACTIVE</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40">
                        TIER 2 PRO
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-0.5">
                      14,029 Edge Nodes allocated · Priority sub-millisecond WebGPU routing · Unlimited AI reasoning compute
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 font-bold shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>PRO ACTIVE</span>
                </div>
              </div>
            ) : isEnterprise ? (
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#a200ff]/15 via-black/40 to-transparent border border-[#a200ff]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(162,0,255,0.15)]">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#a200ff] to-[#ff0055] text-white flex items-center justify-center font-black shadow-lg shadow-[#a200ff]/30 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white">ENTERPRISE SUBSCRIBER: ACTIVE</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#a200ff]/30 text-[#a200ff] border border-[#a200ff]/50">
                        DEDICATED CLUSTER
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-0.5">
                      Custom bare-metal nodes · Dedicated cryptographic encryption · 24/7 SLA Concierge
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 font-bold shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ENTERPRISE ACTIVE</span>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-gray-300 flex items-center justify-center font-black shrink-0">
                    <Cpu className="w-5 h-5 text-gray-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">FREE STARTER ACCOUNT</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-gray-400">
                        COMMUNITY
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Upgrade to Pro Subscriber to unlock 14,029 edge nodes, high-speed neural reasoning, and 3D Cockpit telemetry.
                    </p>
                  </div>
                </div>
                <Link
                  to="/#pricing"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1.5 shadow-lg shadow-[#00f0ff]/20"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                  <span>Upgrade to Pro</span>
                </Link>
              </div>
            )}

            {/* Real-time Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'System Latency', value: '0.86ms', change: '-12% vs last hr', icon: Cpu, color: '#00f0ff' },
                { label: 'Total Throughput', value: '1.24 TB/s', change: '+38% peak bandwidth', icon: Zap, color: '#a200ff' },
                { label: 'Active Edge Nodes', value: '312 Nodes', change: '98.4% healthy', icon: Globe, color: '#27c93f' },
                { label: 'Neural Precision', value: '99.98%', change: 'Sub-ms inference', icon: Shield, color: '#ff0055' },
              ].map((card, i) => (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-[#08080f] border border-white/10 relative overflow-hidden group hover:border-[#00f0ff]/30 transition-all shadow-xl"
                >
                  <div 
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: `linear-gradient(90deg, ${card.color}, transparent)` }}
                  />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">{card.label}</span>
                    <div className="p-2 rounded-xl" style={{ backgroundColor: `${card.color}15` }}>
                      <card.icon className="w-4 h-4" style={{ color: card.color }} />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white tracking-tight">{card.value}</div>
                  <div className="text-[11px] font-medium text-gray-400 mt-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: card.color }} /> {card.change}
                  </div>
                </div>
              ))}
            </div>

            {/* Active Projects Directory (Without "Open Link" option as requested) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#00f0ff]" />
                  Deployed Ecosystem Services
                </h2>
                <span className="text-xs text-gray-300 font-mono">{mockProjects.length} Active Ecosystem Services</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {mockProjects.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-[#090912] border border-white/10 hover:border-[#00f0ff]/40 transition-all relative flex flex-col justify-between shadow-xl group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          Live Port :{p.port}
                        </span>
                        <span className="text-xs font-mono text-gray-300">{p.uptime}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#00f0ff] transition-colors">{p.name}</h3>
                      <p className="text-xs text-gray-300 mt-1">{p.category}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="text-[11px] text-gray-400 font-mono">Load: {p.load}</div>
                      {/* ONLY Launch 3D is shown for /cockpit. 'Open Link' is completely removed as requested */}
                      {p.path && (
                        <Link
                          to={p.path}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#00f0ff]/15 hover:bg-[#00f0ff] text-[#00f0ff] hover:text-black border border-[#00f0ff]/30 font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                        >
                          Launch 3D <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Live Node Telemetry Feed */}
            <div className="rounded-3xl bg-[#07070d] border border-white/10 overflow-hidden shadow-2xl">
              <div className="px-6 py-4 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#00f0ff]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white">Live Node Telemetry</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-gray-300">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  STREAM_ACTIVE
                </div>
              </div>
              <div className="p-6 font-mono text-xs space-y-2 bg-[#040408]/90 max-h-48 overflow-y-auto">
                {logs.map((log, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[#00f0ff] select-none">&gt;</span>
                    <span className={log.includes('USER') ? 'text-[#a200ff]' : log.includes('AUTH') ? 'text-green-400' : 'text-gray-300'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2: EDGE NODES CLUSTER MANAGER (Complete Image 3 Layout)
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'nodes' && (
          <motion.div
            key="nodes"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full max-w-full overflow-hidden"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <Server className="w-6 h-6 text-[#00f0ff]" />
                  Global Fleet Telemetry &amp; Edge Clusters
                </h1>
                <p className="text-sm text-gray-300 mt-1">
                  312 distributed edge computation nodes across 4 global availability zones.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleAutomatedRebalance}
                  disabled={rebalancingFleet}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#10b981] hover:opacity-95 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.25)] cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${rebalancingFleet ? 'animate-spin' : ''}`} />
                  <span>{rebalancingFleet ? 'Rebalancing Cluster...' : 'AUTOMATED LOAD REBALANCE'}</span>
                </button>
              </div>
            </div>

            {/* 4 Top Metric Cards (Image 3 Specification) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. EDGE CLUSTER FLEET */}
              <div className="p-5 rounded-3xl bg-[#080812]/90 border border-white/10 backdrop-blur-2xl flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-[#00f0ff]/15 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff] shrink-0">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">EDGE CLUSTER FLEET</div>
                  <div className="text-2xl font-black font-mono text-white leading-tight">312 Nodes</div>
                </div>
              </div>

              {/* 2. FLEET HEALTH */}
              <div className="p-5 rounded-3xl bg-[#080812]/90 border border-white/10 backdrop-blur-2xl flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">FLEET HEALTH</div>
                  <div className="text-2xl font-black font-mono text-emerald-400 leading-tight">98.4%</div>
                </div>
              </div>

              {/* 3. ACTIVE REGIONS */}
              <div className="p-5 rounded-3xl bg-[#080812]/90 border border-white/10 backdrop-blur-2xl flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">ACTIVE REGIONS</div>
                  <div className="text-2xl font-black font-mono text-purple-300 leading-tight">4 Global Zones</div>
                </div>
              </div>

              {/* 4. AVG GLOBAL PING */}
              <div className="p-5 rounded-3xl bg-[#080812]/90 border border-white/10 backdrop-blur-2xl flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Gauge className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">AVG GLOBAL PING</div>
                  <div className="text-2xl font-black font-mono text-amber-300 leading-tight">4.18 ms</div>
                </div>
              </div>
            </div>

            {/* Filter Tabs Bar (Image 3) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-black/40 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 flex-wrap">
                {(['All', 'Operational', 'Degraded', 'Standby'] as const).map(filter => {
                  const counts = { All: 312, Operational: 298, Degraded: 9, Standby: 5 };
                  return (
                    <button
                      key={filter}
                      onClick={() => setFleetFilter(filter)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        fleetFilter === filter
                          ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {filter} ({counts[filter]})
                    </button>
                  );
                })}
              </div>

              <div className="text-xs font-mono text-gray-400 hidden sm:block">
                Auto-Healing: <span className="text-emerald-400 font-bold">ENABLED</span> (&gt;15ms reroute)
              </div>
            </div>

            {/* Real-Time Latency Telemetry Chart (Image 3) */}
            <div className="p-6 rounded-3xl bg-[#080812]/90 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-wide">Real-Time Latency Telemetry</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-400 font-bold uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE STREAM
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    Round-trip latency across US-East, EU-Central, APAC-South, AP-Northeast
                  </p>
                </div>

                {/* Chart Legend */}
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-[#00f0ff] rounded-full" />
                    <span className="text-gray-300">US-East</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-[#a200ff] rounded-full" />
                    <span className="text-gray-300">EU-Central</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-[#f59e0b] rounded-full" />
                    <span className="text-gray-300">APAC-South</span>
                  </span>
                </div>
              </div>

              {/* SVG Multi-Line Latency Curve */}
              <div className="relative h-48 w-full overflow-hidden">
                <svg className="w-full h-full overflow-hidden" viewBox="0 0 800 180" preserveAspectRatio="none">
                  {/* Horizontal Grid lines */}
                  {[30, 75, 120, 165].map((y, idx) => (
                    <g key={y}>
                      <line x1="0" y1={y} x2="800" y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                      <text x="5" y={y - 4} fill="#64748b" fontSize="9" fontFamily="monospace">
                        {[18, 12, 6, 0][idx]}ms
                      </text>
                    </g>
                  ))}

                  {/* US-East Path (Cyan - lowest latency, ~2ms) */}
                  <path
                    d="M 50 160 Q 200 156, 350 158 T 500 157 T 650 159 T 780 158"
                    fill="none"
                    stroke="#00f0ff"
                    strokeWidth="2.5"
                  />
                  {[
                    { cx: 50, cy: 160 }, { cx: 200, cy: 156 }, { cx: 350, cy: 158 },
                    { cx: 500, cy: 157 }, { cx: 650, cy: 159 }, { cx: 780, cy: 158 }
                  ].map((p, i) => (
                    <circle key={i} cx={p.cx} cy={p.cy} r="4" fill="#00f0ff" />
                  ))}

                  {/* EU-Central Path (Purple - ~4-5ms) */}
                  <path
                    d="M 50 145 Q 200 147, 350 144 T 500 142 T 650 145 T 780 144"
                    fill="none"
                    stroke="#a200ff"
                    strokeWidth="2.5"
                  />
                  {[
                    { cx: 50, cy: 145 }, { cx: 200, cy: 147 }, { cx: 350, cy: 144 },
                    { cx: 500, cy: 142 }, { cx: 650, cy: 145 }, { cx: 780, cy: 144 }
                  ].map((p, i) => (
                    <circle key={i} cx={p.cx} cy={p.cy} r="4" fill="#a200ff" />
                  ))}

                  {/* APAC-South Path (Amber - ~14-18ms with wave) */}
                  <path
                    d="M 50 70 Q 200 85, 350 65 T 500 45 T 650 78 T 780 80"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                  />
                  {[
                    { cx: 50, cy: 70 }, { cx: 200, cy: 85 }, { cx: 350, cy: 65 },
                    { cx: 500, cy: 45 }, { cx: 650, cy: 78 }, { cx: 780, cy: 80 }
                  ].map((p, i) => (
                    <circle key={i} cx={p.cx} cy={p.cy} r="4" fill="#f59e0b" />
                  ))}
                </svg>

                {/* Time labels under SVG */}
                <div className="flex justify-between text-[10px] font-mono text-gray-500 pt-2 px-6">
                  <span>12:00</span>
                  <span>12:05</span>
                  <span>12:10</span>
                  <span>12:15</span>
                  <span>12:20</span>
                  <span>12:25</span>
                </div>
              </div>

              {/* Ping Target Input Bar (Image 3) */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-mono text-gray-400">Ping Target:</span>
                  <input
                    type="text"
                    value={pingTarget}
                    onChange={e => setPingTarget(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-[#00f0ff] focus:outline-none focus:border-[#00f0ff] w-56"
                  />
                  <button
                    onClick={handlePing}
                    disabled={pinging}
                    className="px-4 py-1.5 rounded-xl bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 text-[#00f0ff] border border-[#00f0ff]/40 text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    {pinging ? 'Testing...' : 'Ping'}
                  </button>
                </div>

                {pingResult && (
                  <span className="text-xs font-mono text-emerald-400 truncate">
                    {pingResult}
                  </span>
                )}
              </div>
            </div>

            {/* Distributed Edge Node Fleet Grid (9 Nodes from Image 3) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Edge Fleet Clusters ({filteredFleet.length} Active)
                </h4>
                <span className="text-xs text-gray-400 font-mono">Sovereign Mesh: 4 Global Availability Zones</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredFleet.map(node => (
                  <div
                    key={node.id}
                    className="p-4 rounded-2xl bg-[#080812]/90 border border-white/10 backdrop-blur-xl space-y-2 hover:border-[#00f0ff]/40 transition-all shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-extrabold text-white font-mono">{node.name}</div>
                        <div className="text-[11px] text-gray-400">{node.city}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          node.status === 'Operational'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : node.status === 'Standby'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {node.status}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/5 grid grid-cols-3 gap-2 text-center font-mono">
                      <div className="p-1.5 rounded-lg bg-white/[0.02]">
                        <div className="text-[9px] text-gray-400">PING</div>
                        <div className="text-xs font-bold text-[#00f0ff]">{node.ping}</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white/[0.02]">
                        <div className="text-[9px] text-gray-400">CONNS</div>
                        <div className="text-xs font-bold text-white">{node.conns}</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white/[0.02]">
                        <div className="text-[9px] text-gray-400">LOAD</div>
                        <div className="text-xs font-bold text-purple-300">{node.load}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 3: VIRTUAL TERMINAL CLI
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'console' && (
          <motion.div
            key="console"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full max-w-full overflow-hidden"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <Terminal className="w-6 h-6 text-[#00f0ff]" />
                  Edge Diagnostic Console
                </h1>
                <p className="text-sm text-gray-300 mt-1">
                  Direct virtual command-line interface connected to edge cluster kernel.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConsoleHistory([])}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                  Clear Console
                </button>
              </div>
            </div>

            {/* Terminal Window */}
            <div className="rounded-3xl bg-[#05050a] border border-white/15 overflow-hidden shadow-2xl font-mono text-xs flex flex-col h-[560px]">
              {/* Window Title Bar */}
              <div className="px-5 py-3.5 bg-white/[0.03] border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <span className="text-gray-300 font-bold ml-2">nexgen-virtual-cli :: /api/v1/spatial</span>
                </div>

                {/* Quick command buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {(['help', 'status', 'nodes', 'deploy', 'spec'] as const).map(cmd => (
                    <button
                      key={cmd}
                      onClick={() => executeCommand(cmd)}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-[#00f0ff] text-[10px] uppercase font-bold cursor-pointer"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terminal Logs Output */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3 font-mono select-text bg-[#030308]/90">
                {consoleHistory.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    {item.cmd && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="text-[#00f0ff] font-bold">nexgen@cluster:~$</span>
                        <span className="text-white font-semibold">{item.cmd}</span>
                      </div>
                    )}
                    {item.res && (
                      <pre
                        className={`whitespace-pre-wrap leading-relaxed ${
                          item.type === 'success'
                            ? 'text-emerald-400'
                            : item.type === 'warn'
                            ? 'text-amber-300'
                            : item.type === 'error'
                            ? 'text-rose-400'
                            : 'text-gray-300'
                        }`}
                      >
                        {item.res}
                      </pre>
                    )}
                  </div>
                ))}
                <div ref={consoleBottomRef} />
              </div>

              {/* Command Input Form */}
              <form onSubmit={handleConsoleSubmit} className="p-3 bg-[#08080f] border-t border-white/10 flex items-center gap-3 shrink-0">
                <span className="text-[#00f0ff] font-mono text-xs font-bold pl-3 select-none">nexgen@cluster:~$</span>
                <input
                  type="text"
                  value={commandInput}
                  onChange={e => setCommandInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter a command... (e.g. status, nodes, ping, deploy, spec, help)"
                  className="flex-1 bg-transparent text-white font-mono text-xs outline-none placeholder:text-gray-600"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00f0ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5 fill-current" />
                  Run
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 4: ARCHITECTURAL SPECIFICATION MANUAL (DOC-ID: NG-SYS-412)
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'spec' && (
          <motion.div
            key="spec"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full max-w-full overflow-hidden"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <FileText className="w-6 h-6 text-[#00f0ff]" />
                  System Architecture Specification
                </h1>
                <p className="text-sm text-gray-300 mt-1">
                  DOC-ID: NG-SYS-412 · Revision 4.12 · WebGPU &amp; WebGL Distributed Spatial Topology
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleCopySpec}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedSpec ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#00f0ff]" />}
                  <span>{copiedSpec ? 'Copied' : 'Copy Spec'}</span>
                </button>
                <button
                  onClick={handleDownloadSpec}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>Download JSON</span>
                </button>
                <Link
                  to="/cockpit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-lg shadow-[#00f0ff]/20"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  Launch 3D Cockpit
                </Link>
              </div>
            </div>

            {/* Spec Document Container */}
            <div className="rounded-3xl bg-[#080812]/95 border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl font-mono text-xs">
              {/* Section 1 */}
              <div className="space-y-3 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00f0ff]" />
                    1. SYSTEM VISION &amp; TECHNICAL ARCHITECTURE
                  </h3>
                  <span className="text-[10px] text-gray-400">STATUS: PRODUCTION ACTIVE</span>
                </div>
                <p className="leading-relaxed text-gray-300 font-sans text-sm">
                  NexGen AI PRO bridges browser-native WebGL/WebGPU spatial viewports with distributed neural inference infrastructure. Unlike legacy 2D operational dashboards, NexGen renders cloud topology, tensor neural weights, and node health inside a synchronized 3D spatial interface.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-[9px] text-gray-400 uppercase tracking-wider">MAX NETWORK RTT</div>
                    <div className="text-base font-black text-[#00f0ff] mt-0.5">&lt; 0.85 ms</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Sub-millisecond SLA Guarantee</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-[9px] text-gray-400 uppercase tracking-wider">DATA THROUGHPUT</div>
                    <div className="text-base font-black text-purple-400 mt-0.5">1.2 TB/s</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Distributed Photonic Mesh</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-[9px] text-gray-400 uppercase tracking-wider">CLUSTER FLEET</div>
                    <div className="text-base font-black text-emerald-400 mt-0.5">312 Edge Nodes</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">US, EU, APAC, JP Zones</div>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="space-y-3 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    2. WEBGL/WEBGPU SHADER &amp; TENSOR ARCHITECTURE
                  </h3>
                  <span className="text-[10px] text-gray-400">GLSL ES 3.0</span>
                </div>
                <div className="p-4 rounded-xl bg-black/70 border border-white/10 text-[11px] text-cyan-300 overflow-x-auto">
                  <code>
                    {`// Kinetic Node Vertex Shader (GLSL ES 3.0 / WebGPU Pipeline)
#version 300 es
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
}`}
                  </code>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-3 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    3. REST &amp; WEBSOCKET API SPECIFICATIONS
                  </h3>
                  <span className="text-[10px] text-gray-400">TLS 1.3 · LWE-256 SIGNED</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <strong className="text-white">GET /api/v1/cluster/status</strong>: Returns fleet health, node count, avg ping &amp; latency buffer
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <strong className="text-white">POST /api/v1/cluster/rebalance</strong>: Triggers automated global load redistribution across 312 edge nodes
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <strong className="text-white">POST /api/v1/deploy/canary</strong>: Initiates 4-stage canary release to edge fleet with zero downtime
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <strong className="text-white">WS wss://stream.nexgen.cloud/v1</strong>: Streams real-time telemetry, photonic carrier signals &amp; neural logs
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div className="space-y-3 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-300" />
                    4. ZERO-TRUST GATEWAY &amp; QUANTUM RATELIMITING
                  </h3>
                  <span className="text-[10px] text-gray-400">AES-256-GCM + RATELIMIT</span>
                </div>
                <p className="leading-relaxed text-gray-300 font-sans text-sm">
                  Client nodes communicate via ephemeral cryptographic tokens rotated dynamically every 300 seconds. No persistent private keys are exposed in client-side bundles. All administrative mutations require cryptographic LWE validation.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 5: AI REASONING TERMINAL (RECURSIVE/FLINT-V1.0)
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'ai-terminal' && (
          <motion.div
            key="ai-terminal"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full max-w-full overflow-hidden"
          >
            {/* Header with Live Status & Telemetry */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <Cpu className="w-6 h-6 text-[#00f0ff]" />
                    AI Reasoning Terminal
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE OPENROUTER PROXY
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-1">
                  Direct neural streaming interface powered by <strong className="text-[#00f0ff] font-mono">recursive/flint-v1.0:free</strong> with live Chain-of-Thought reasoning tokens.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
                  <span>Reasoning: </span>
                  <strong className="text-[#00f0ff]">
                    {reasoningTokens !== null ? `${reasoningTokens} tokens` : '169 tokens (baseline)'}
                  </strong>
                </div>
                {reasoningTimeMs && (
                  <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
                    <span>Latency: </span>
                    <strong className="text-purple-400">{reasoningTimeMs}ms</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Test Presets */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] font-mono text-gray-400 shrink-0 uppercase tracking-wider font-bold">Quick Inferences:</span>
              {[
                "How many r's are in the word 'strawberry'?",
                "Analyze cluster Byzantine fault tolerance across 14,029 edge nodes",
                "Explain zero-copy GPU shared memory buffers in WebGPU",
                "Quantum lattice encryption speed benchmark"
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setReasoningPrompt(preset);
                    runAiInference(preset);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition-all whitespace-nowrap cursor-pointer hover:border-[#00f0ff]/40"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Main Dual Terminal Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Chain-of-Thought / Reasoning Output */}
              <div className="rounded-3xl bg-[#05050a] border border-white/15 overflow-hidden shadow-2xl flex flex-col h-[520px]">
                <div className="px-5 py-3.5 bg-gradient-to-r from-purple-900/30 via-black/40 to-black/60 border-b border-white/10 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#a200ff] animate-ping" />
                    <span className="text-xs font-mono font-black uppercase tracking-wider text-[#a200ff]">
                      1. Chain-of-Thought Reasoning Stream
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">
                    {isInferencing ? 'STREAMING REASONING TOKENS...' : 'IDLE'}
                  </span>
                </div>

                <div className="flex-1 p-5 overflow-y-auto space-y-2 font-mono text-xs select-text bg-[#030308]/90 text-purple-200/90 whitespace-pre-wrap leading-relaxed">
                  {reasoningThoughts ? (
                    reasoningThoughts
                  ) : (
                    <div className="text-gray-600 italic">
                      // Waiting for prompt execution. As recursive/flint-v1.0 processes your request, its internal chain-of-thought reasoning tokens will stream here in real-time.
                    </div>
                  )}
                </div>

                <div className="px-5 py-2.5 bg-black/60 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <span>Engine: recursive/flint-v1.0:free</span>
                  <span>Reasoning Tokens: <strong className="text-[#a200ff]">{reasoningTokens || 0}</strong></span>
                </div>
              </div>

              {/* Right Column: Final Synthesized Solution */}
              <div className="rounded-3xl bg-[#05050a] border border-white/15 overflow-hidden shadow-2xl flex flex-col h-[520px]">
                <div className="px-5 py-3.5 bg-gradient-to-r from-cyan-900/30 via-black/40 to-black/60 border-b border-white/10 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] animate-pulse" />
                    <span className="text-xs font-mono font-black uppercase tracking-wider text-[#00f0ff]">
                      2. Final Synthesized Output
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {reasoningStream && (
                      <button
                        onClick={() => navigator.clipboard.writeText(reasoningStream)}
                        className="text-[10px] font-mono text-gray-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 p-5 overflow-y-auto space-y-2 font-mono text-xs select-text bg-[#030308]/90 text-white whitespace-pre-wrap leading-relaxed">
                  {reasoningStream ? (
                    reasoningStream
                  ) : (
                    <div className="text-gray-600 italic">
                      // The final synthesized response will appear here token-by-token.
                    </div>
                  )}
                </div>

                <div className="px-5 py-2.5 bg-black/60 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <span>Status: <strong className={isInferencing ? "text-amber-400" : "text-emerald-400"}>{isInferencing ? "Generating..." : "Completed"}</strong></span>
                  <span>Execution: <strong className="text-[#00f0ff]">{reasoningTimeMs ? `${reasoningTimeMs}ms` : '--'}</strong></span>
                </div>
              </div>
            </div>

            {/* Input Prompt Control Bar */}
            <div className="rounded-2xl bg-[#070710] border border-white/15 p-3 flex flex-col sm:flex-row items-center gap-3 shadow-xl">
              <input
                type="text"
                value={reasoningPrompt}
                onChange={(e) => setReasoningPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runAiInference();
                }}
                disabled={isInferencing}
                placeholder="Enter reasoning query or prompt for recursive/flint-v1.0..."
                className="w-full flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 font-mono outline-none focus:border-[#00f0ff] transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => runAiInference()}
                disabled={!reasoningPrompt.trim() || isInferencing}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] via-[#a200ff] to-[#ff0055] text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#00f0ff]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {isInferencing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Streaming...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white text-white" />
                    <span>Run Inference</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default DashboardPage;
