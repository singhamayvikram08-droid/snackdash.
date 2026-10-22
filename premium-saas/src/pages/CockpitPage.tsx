import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { usePageSEO } from '../utils/usePageSEO';
import {
  Hexagon, Shield, Activity, RefreshCw, X,
  Zap, RotateCcw, Cpu, FileText, Layers, Share2
} from 'lucide-react';

/* ═════════════════════════════════════════════════════════════
   WEB AUDIO API SYNTHESIZED SOUND FX
   ═════════════════════════════════════════════════════════════ */
class AudioFX {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.muted = !this.muted;
    return this.muted;
  }

  click() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch {
      // AudioContext unavailable
    }
  }

  keypress() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1100 + Math.random() * 250, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.02);
    } catch {
      // AudioContext unavailable
    }
  }

  selectNode() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1567.98, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {
      // AudioContext unavailable
    }
  }

  beam() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // High-energy laser sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(2800, t + 0.22);
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);

      // Sub-bass impact thump
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(160, t);
      subOsc.frequency.exponentialRampToValueAtTime(45, t + 0.3);
      subGain.gain.setValueAtTime(0.12, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(t);
      subOsc.stop(t + 0.3);
    } catch {
      // AudioContext unavailable
    }
  }

  rebalance() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [330, 440, 554.37, 659.25, 880, 1108.73, 1318.5].forEach((f, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.045);
        gain.gain.setValueAtTime(0.04, now + i * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.045);
        osc.stop(now + i * 0.045 + 0.18);
      });
    } catch {
      // AudioContext unavailable
    }
  }
}

const sound = new AudioFX();

/* ═════════════════════════════════════════════════════════════
   COCKPIT 3D SATELLITE NODES DATA
   ═════════════════════════════════════════════════════════════ */
interface SatelliteNodeData {
  id: number;
  name: string;
  region: string;
  tensor: string;
  buffers: string;
  throughput: string;
  ping: string;
  weightLoss: string;
  status: 'OPTIMAL' | 'DEGRADED' | 'STANDBY';
  load: string;
}

const SATELLITE_NODES: SatelliteNodeData[] = [
  { id: 1, name: 'Cluster Core Node #01', region: 'US-East (N. Virginia)', tensor: '[4096, 768]', buffers: '4,096', throughput: '384 GB/s', ping: '0.72ms', weightLoss: '0.00012', status: 'OPTIMAL', load: '64%' },
  { id: 2, name: 'Transformer Core #02', region: 'US-East (Ohio)', tensor: '[2048, 2048]', buffers: '2,048', throughput: '512 GB/s', ping: '0.45ms', weightLoss: '0.00008', status: 'OPTIMAL', load: '78%' },
  { id: 3, name: 'Attention Matrix #03', region: 'EU-Central (Frankfurt)', tensor: '[1024, 512]', buffers: '1,024', throughput: '290 GB/s', ping: '0.82ms', weightLoss: '0.00015', status: 'OPTIMAL', load: '48%' },
  { id: 4, name: 'Latent Shuffler #04', region: 'EU-West (London)', tensor: '[4096, 512]', buffers: '4,096', throughput: '420 GB/s', ping: '0.68ms', weightLoss: '0.00011', status: 'OPTIMAL', load: '82%' },
  { id: 5, name: 'Edge Gateway #05', region: 'APAC-South (Singapore)', tensor: '[512, 256]', buffers: '512', throughput: '180 GB/s', ping: '0.88ms', weightLoss: '0.00021', status: 'OPTIMAL', load: '52%' },
  { id: 6, name: 'Kernel Dispatch #06', region: 'APAC-South (Mumbai)', tensor: '[2048, 1024]', buffers: '2,048', throughput: '256 GB/s', ping: '0.74ms', weightLoss: '0.00014', status: 'OPTIMAL', load: '68%' },
  { id: 7, name: 'Quantum Shuffler #07', region: 'AP-Northeast (Tokyo)', tensor: '[1024, 1024]', buffers: '1,024', throughput: '310 GB/s', ping: '0.62ms', weightLoss: '0.00009', status: 'OPTIMAL', load: '72%' },
  { id: 8, name: 'Synaptic Bridge #08', region: 'AP-Northeast (Seoul)', tensor: '[2048, 1024]', buffers: '2,048', throughput: '480 GB/s', ping: '0.79ms', weightLoss: '0.00018', status: 'OPTIMAL', load: '89%' }
];

const CockpitPage = () => {
  usePageSEO({
    title: '3D Spatial Cockpit — NexGen AI PRO WebGL Neural Matrix',
    description: 'Immersive interactive 3D WebGL and WebGPU spatial computing cockpit. Inspect distributed satellite nodes, render real-time volumetric shaders, and dispatch quantum commands.'
  });

  const [shaderMode, setShaderMode] = useState<'Hologram' | 'Volumetric' | 'Quantum'>('Hologram');
  const [fps, setFps] = useState(60);
  const [selectedNode, setSelectedNode] = useState<SatelliteNodeData>(SATELLITE_NODES[0]);
  const [beamActive, setBeamActive] = useState(false);
  const [recalibrating, setRecalibrating] = useState(false);
  const [showSpecModal, setShowSpecModal] = useState(false);

  // Live Hex Streaming Logs
  const [hexLogs, setHexLogs] = useState<string[]>([
    '[0x92B0E3] TX_SYNAPSE -> LAT:0.85ms BUF:99.9%',
    '[0x51B95F] TX_SYNAPSE -> LAT:0.79ms BUF:99.9%',
    '[0x93C03B] TX_SYNAPSE -> LAT:0.78ms BUF:99.9%',
    '[0xF05555] TX_SYNAPSE -> LAT:0.73ms BUF:99.9%',
  ]);

  // Canvas Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const resetCameraRef = useRef<() => void>(() => {});

  // ── Persistent Neural Output Panel States (Panels 2 & 3) ──
  const initialRecalState = {
    status: 'idle' as 'idle' | 'processing' | 'success' | 'error',
    operation: 'WEIGHT_OPTIMIZER_v4.12',
    timestamp: 'INITIAL_BOOT',
    targetNode: 'Cluster Core Node #01',
    weightLoss: '0.000042',
    deltaWeight: '0.00000 Δ',
    latency: '0.84ms',
    load: '48%',
    security: 'LWE-256_ACTIVE',
    cores: 14029,
  };

  const initialSignalState = {
    status: 'idle' as 'idle' | 'transmitting' | 'success' | 'error',
    operation: 'PHOTONIC_SIGNAL_BEAM_v4',
    timestamp: 'STANDBY',
    targetNode: 'US-East Node #01',
    region: 'North America (iad-01)',
    carrierFreq: '847.2 THz Coherent',
    powerDensity: '42.8 GW/cm²',
    throughput: '1.24 TB/s',
    latency: '0.42ms',
    telemetryAck: '100% (0 pkts dropped)',
    buffers: '4,096 Allocated',
  };

  const [recalOutput, setRecalOutput] = useState(initialRecalState);
  const [signalOutput, setSignalOutput] = useState(initialSignalState);

  // 3D Scene Action Trigger Refs (Connects buttons directly to Three.js and 2D canvas)
  const triggerBeamRef = useRef<(nodeId: number) => void>(() => {});
  const triggerRecalibrateRef = useRef<() => void>(() => {});
  const selectedNodeIdRef = useRef<number>(selectedNode.id);

  useEffect(() => {
    selectedNodeIdRef.current = selectedNode.id;
  }, [selectedNode.id]);

  // Live Hex Stream Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const hex = '0x' + Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
      const lat = (Math.random() * 0.3 + 0.65).toFixed(2);
      const buf = (99.8 + Math.random() * 0.19).toFixed(1);
      const line = `[${hex}] TX_SYNAPSE -> LAT:${lat}ms BUF:${buf}%`;
      setHexLogs(prev => [line, ...prev.slice(0, 3)]);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  // ═════════════════════════════════════════════════════════════
  // THREE.JS 3D SCENE SETUP WITH REALISTIC SHINY SPHERES & GLOBE
  // ═════════════════════════════════════════════════════════════
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth || 1280;
    let height = container.clientHeight || window.innerHeight || 720;

    let renderer: THREE.WebGLRenderer | null = null;
    let fallbackCanvas: HTMLCanvasElement | null = null;

    try {
      const testC = document.createElement('canvas');
      const gl = testC.getContext('webgl2') || testC.getContext('webgl');
      if (gl) {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        container.appendChild(renderer.domElement);
      }
    } catch {
      renderer = null;
    }

    if (!renderer) {
      // 2D High-Performance Fallback with Shaded Spheres
      fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = width;
      fallbackCanvas.height = height;
      fallbackCanvas.className = 'w-full h-full block cursor-grab active:cursor-grabbing';
      container.appendChild(fallbackCanvas);

      const ctx = fallbackCanvas.getContext('2d');
      let t = 0;
      const rotOffset = 0;
      let animId2D: number;

      let beam2DActive = false;
      let beam2DTarget = 1;
      let beam2DStart = 0;
      let recal2DActive = false;
      let recal2DStart = 0;

      triggerBeamRef.current = (targetId: number) => {
        beam2DActive = true;
        beam2DTarget = targetId;
        beam2DStart = performance.now();
      };

      triggerRecalibrateRef.current = () => {
        recal2DActive = true;
        recal2DStart = performance.now();
      };

      const handleResize = () => {
        if (!container || !fallbackCanvas) return;
        width = container.clientWidth || 1280;
        height = container.clientHeight || 720;
        fallbackCanvas.width = width;
        fallbackCanvas.height = height;
      };
      window.addEventListener('resize', handleResize);

      const render2D = () => {
        animId2D = requestAnimationFrame(render2D);
        if (!ctx) return;
        t += 0.015;
        ctx.clearRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height * 0.38;
        const radius = Math.min(width, height) * 0.28;

        // Concentric Orbital Tracks
        ctx.save();
        ctx.translate(cx, cy);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.2, radius * 0.45, -0.2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(162, 0, 255, 0.15)';
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.45, radius * 0.55, 0.3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 2D Recalibration Expanding Wavefront
        if (recal2DActive) {
          const elapsed = performance.now() - recal2DStart;
          const prog = Math.min(1, elapsed / 1400);
          if (prog < 1) {
            const waveR = prog * radius * 2.2;
            const alpha = Math.sin(prog * Math.PI);
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, waveR, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha * 0.8})`;
            ctx.lineWidth = 3.5;
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 18;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(cx, cy, Math.max(0, waveR - 25), 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.6})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
          } else {
            recal2DActive = false;
          }
        }

        // Central Realistic Geodesic Globe Core (3D Projected Icosahedron)
        const rotY = t * 0.35 + rotOffset;
        const rotX = Math.sin(t * 0.2) * 0.25;

        // 12 vertices of icosahedron
        const phi = (1 + Math.sqrt(5)) / 2;
        const rawVerts: [number, number, number][] = [
          [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
          [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
          [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1]
        ];
        const globeR = 60;
        const normVerts = rawVerts.map(([vx, vy, vz]) => {
          const l = Math.sqrt(vx * vx + vy * vy + vz * vz);
          return [(vx / l) * globeR, (vy / l) * globeR, (vz / l) * globeR];
        });

        // Rotate in 3D
        const projVerts = normVerts.map(([x0, y0, z0]) => {
          const x1 = x0 * Math.cos(rotY) + z0 * Math.sin(rotY);
          const z1 = -x0 * Math.sin(rotY) + z0 * Math.cos(rotY);
          const y2 = y0 * Math.cos(rotX) - z1 * Math.sin(rotX);
          const z2 = y0 * Math.sin(rotX) + z1 * Math.cos(rotX);
          return { x: cx + x1, y: cy + y2, z: z2 };
        });

        // Central Realistic Geodesic Globe Core (Radial Specular Gradient)
        const isQuantumMode = shaderMode === 'Quantum';
        const coreGrad = ctx.createRadialGradient(cx - 16, cy - 16, 4, cx, cy, 64);
        coreGrad.addColorStop(0, isQuantumMode ? '#e9d5ff' : '#00f0ff');
        coreGrad.addColorStop(0.25, isQuantumMode ? '#581c87' : '#082f49');
        coreGrad.addColorStop(0.7, '#020617');
        coreGrad.addColorStop(1, '#000000');

        ctx.beginPath();
        ctx.arc(cx, cy, 54, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.shadowColor = isQuantumMode ? '#a200ff' : '#00f0ff';
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Geodesic Edges with 3D Depth
        for (let i = 0; i < projVerts.length; i++) {
          for (let j = i + 1; j < projVerts.length; j++) {
            const v1 = projVerts[i];
            const v2 = projVerts[j];
            const dx = normVerts[i][0] - normVerts[j][0];
            const dy = normVerts[i][1] - normVerts[j][1];
            const dz = normVerts[i][2] - normVerts[j][2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < globeR * 1.15) {
              const alpha = Math.max(0.18, (v1.z + v2.z + globeR * 2) / (globeR * 3.8));
              ctx.strokeStyle = isQuantumMode ? `rgba(192, 132, 252, ${alpha.toFixed(2)})` : `rgba(0, 240, 255, ${alpha.toFixed(2)})`;
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.moveTo(v1.x, v1.y);
              ctx.lineTo(v2.x, v2.y);
              ctx.stroke();
            }
          }
        }

        // Draw Glowing Geodesic Junction Dots
        projVerts.forEach(v => {
          if (v.z > -globeR * 0.7) {
            ctx.beginPath();
            ctx.arc(v.x, v.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = isQuantumMode ? '#e9d5ff' : '#00f0ff';
            ctx.shadowColor = isQuantumMode ? '#a200ff' : '#00f0ff';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });

        // Orbiting Shiny Metallic Spheres
        SATELLITE_NODES.forEach((node, i) => {
          const ang = t * 0.4 + (i / SATELLITE_NODES.length) * Math.PI * 2 + rotOffset;
          const sx = cx + Math.cos(ang) * (radius * (0.9 + (i % 3) * 0.15));
          const sy = cy + Math.sin(ang) * (radius * 0.42);

          const isNodeSelected = selectedNodeIdRef.current === node.id;
          const isTargetOfBeam = beam2DActive && beam2DTarget === node.id;

          // Normal Synapse laser beam
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = isNodeSelected ? 'rgba(0, 240, 255, 0.6)' : 'rgba(0, 240, 255, 0.18)';
          ctx.lineWidth = isNodeSelected ? 1.5 : 1;
          ctx.stroke();

          // High-Voltage 2D Signal Beam Injection Overlay
          if (isTargetOfBeam) {
            const elapsed = performance.now() - beam2DStart;
            const prog = Math.min(1, elapsed / 1000);
            if (prog < 1) {
              const alpha = Math.sin(prog * Math.PI);
              ctx.save();
              // Outer neon aura
              ctx.beginPath();
              ctx.moveTo(cx, cy);
              ctx.lineTo(sx, sy);
              ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.95})`;
              ctx.lineWidth = 8;
              ctx.shadowColor = '#00f0ff';
              ctx.shadowBlur = 30;
              ctx.stroke();

              // Inner intense white core
              ctx.beginPath();
              ctx.moveTo(cx, cy);
              ctx.lineTo(sx, sy);
              ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
              ctx.lineWidth = 2.5;
              ctx.stroke();

              // Expanding shockwave ripple ring at node
              ctx.beginPath();
              ctx.arc(sx, sy, 12 + prog * 42, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - prog) * 0.9})`;
              ctx.lineWidth = 2.5;
              ctx.stroke();
              ctx.restore();
            } else {
              beam2DActive = false;
            }
          }

          // 3D Spherical Specular Shading
          const sphereGrad = ctx.createRadialGradient(sx - 4, sy - 4, 1, sx, sy, 14);
          if (isNodeSelected) {
            sphereGrad.addColorStop(0, '#ffffff');
            sphereGrad.addColorStop(0.2, '#00f0ff');
            sphereGrad.addColorStop(0.8, '#083344');
            sphereGrad.addColorStop(1, '#020617');
          } else {
            sphereGrad.addColorStop(0, '#93c5fd');
            sphereGrad.addColorStop(0.2, '#1e293b');
            sphereGrad.addColorStop(0.8, '#0f172a');
            sphereGrad.addColorStop(1, '#020617');
          }

          ctx.beginPath();
          ctx.arc(sx, sy, isNodeSelected ? 12 : 10, 0, Math.PI * 2);
          ctx.fillStyle = sphereGrad;
          ctx.shadowColor = isNodeSelected ? '#00f0ff' : '#38bdf8';
          ctx.shadowBlur = isNodeSelected ? 18 : 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      };
      render2D();

      return () => {
        cancelAnimationFrame(animId2D);
        window.removeEventListener('resize', handleResize);
        try {
          if (fallbackCanvas && fallbackCanvas.parentNode) {
            fallbackCanvas.parentNode.removeChild(fallbackCanvas);
          }
        } catch {
          // ignore cleanup error
        }
      };
    }

    // ═════════════════════════════════════════════════════════════
    // TRUE 3D WEBGL GRAPHICS (Three.js with PBR Physical Materials)
    // ═════════════════════════════════════════════════════════════
    // ── Axis Rotation Physics State ──
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let prevX = 0;
    let prevY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let targetRotY = 0;
    let targetRotX = 0;
    let currentRotY = 0;
    let currentRotX = 0;
    let hasMoved = false;

    // Height & aspect aware framing calculator to guarantee orbital ring never collides with bottom panel
    const calculateFraming = (w: number, h: number) => {
      const isMobile = w < 768;
      const isShort = h < 750;
      const groupY = isMobile ? 2.55 : (isShort ? 2.45 : 2.38);
      const camZ = isMobile ? 15.2 : (isShort ? 13.6 : 12.8);
      const camY = groupY + 0.35;
      const lookAtY = groupY - 0.15;
      return { groupY, camY, camZ, lookAtY };
    };

    const initialFraming = calculateFraming(width, height);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030305, 0.032);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, initialFraming.camY, initialFraming.camZ);
    camera.lookAt(0, initialFraming.lookAtY, 0);

    resetCameraRef.current = () => {
      const f = calculateFraming(container.clientWidth || width, container.clientHeight || height);
      camera.position.set(0, f.camY, f.camZ);
      camera.lookAt(0, f.lookAtY, 0);
      targetRotY = 0;
      targetRotX = 0;
      currentRotY = 0;
      currentRotX = 0;
      velocityX = 0;
      velocityY = 0;
    };

    // Theme Colors based on Shader Mode
    const isVolumetric = shaderMode === 'Volumetric';
    const isQuantum = shaderMode === 'Quantum';
    const primaryColor = isQuantum ? 0xc084fc : (isVolumetric ? 0x38bdf8 : 0x00f0ff);
    const secondaryColor = isQuantum ? 0x00f0ff : (isVolumetric ? 0xa855f7 : 0xa200ff);
    const coreEmissive = isQuantum ? 0x3b0764 : (isVolumetric ? 0x0c4a6e : 0x001a33);

    // Procedural Reflection Environment for Liquid-Metal / Obsidian Realism
    let envMap: THREE.Texture | null = null;
    let pmrem: THREE.PMREMGenerator | null = null;
    try {
      pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      const envCanvas = document.createElement('canvas');
      envCanvas.width = 512;
      envCanvas.height = 256;
      const envCtx = envCanvas.getContext('2d');
      if (envCtx) {
        const grad = envCtx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, '#020308');
        grad.addColorStop(0.3, '#081735');
        grad.addColorStop(0.48, isQuantum ? '#c084fc' : '#00f0ff');
        grad.addColorStop(0.52, isQuantum ? '#a200ff' : '#00d8ff');
        grad.addColorStop(0.7, '#050d22');
        grad.addColorStop(1, '#010204');
        envCtx.fillStyle = grad;
        envCtx.fillRect(0, 0, 512, 256);

        // Specular Star & Light Reflections
        for (let i = 0; i < 40; i++) {
          const x = (i * 47) % 512;
          const y = (i * 31) % 256;
          envCtx.fillStyle = i % 2 === 0 ? '#ffffff' : (isQuantum ? '#e9d5ff' : '#00f0ff');
          envCtx.beginPath();
          envCtx.arc(x, y, (i % 3) + 1.2, 0, Math.PI * 2);
          envCtx.fill();
        }
        const envTexture = new THREE.CanvasTexture(envCanvas);
        envTexture.mapping = THREE.EquirectangularReflectionMapping;
        envMap = pmrem.fromEquirectangular(envTexture).texture;
        scene.environment = envMap;
        envTexture.dispose();
      }
    } catch {
      // ignore HDR env map creation error
    }

    // Lights for Realistic Specular Highlights & Metallic Reflections
    const ambientLight = new THREE.AmbientLight(0x0a1628, 1.4);
    scene.add(ambientLight);

    const mainDirLight = new THREE.DirectionalLight(0xffffff, 3.2);
    mainDirLight.position.set(8, 14, 10);
    scene.add(mainDirLight);

    const cyanPointLight = new THREE.PointLight(primaryColor, isVolumetric ? 6.5 : 4.5, 35);
    cyanPointLight.position.set(0, 0, 0);

    const purpleRimLight = new THREE.PointLight(secondaryColor, 3.0, 30);
    purpleRimLight.position.set(7, -4, -6);
    scene.add(purpleRimLight);

    const blueBackLight = new THREE.PointLight(0x38bdf8, 2.2, 25);
    blueBackLight.position.set(-6, 5, -4);
    scene.add(blueBackLight);

    // Root Matrix Group (Elevated so orbital ring bottom clears Cluster Core Node #01 panel)
    const matrixGroup = new THREE.Group();
    matrixGroup.position.set(0, initialFraming.groupY, 0);
    matrixGroup.add(cyanPointLight);
    scene.add(matrixGroup);

    // ── 1. Central Geodesic Globe Sphere (Image 2) ───────────────────
    const globeGroup = new THREE.Group();
    matrixGroup.add(globeGroup);

    // Inner Polished Obsidian Core Sphere (Physical Material with High Specular Reflection)
    const coreGeo = new THREE.SphereGeometry(1.48, 48, 48);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x020814,
      roughness: 0.08,
      metalness: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
      emissive: coreEmissive,
      emissiveIntensity: isVolumetric ? 0.9 : 0.5,
    });
    const coreSphere = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreSphere);

    // High-Resolution Geodesic Wireframe Shell (Detail 3 = dense, intricate geodesic network)
    const geoIco = new THREE.IcosahedronGeometry(1.85, 3);
    const wireGeo = new THREE.WireframeGeometry(geoIco);
    const geoWireMat = new THREE.LineBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: isVolumetric ? 0.45 : 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const geoWireMesh = new THREE.LineSegments(wireGeo, geoWireMat);
    globeGroup.add(geoWireMesh);

    // Glowing Vertex Junction Nodes (Every node on the geodesic sphere glows!)
    const vertexMat = new THREE.PointsMaterial({
      color: primaryColor,
      size: 0.08,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const vertexPoints = new THREE.Points(geoIco, vertexMat);
    globeGroup.add(vertexPoints);

    // Soft Atmospheric Volumetric Halo Shell (matching glowing bloom in Image 2)
    const atmoGeo = new THREE.SphereGeometry(1.94, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: isVolumetric ? 0.22 : 0.09,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    globeGroup.add(atmoMesh);

    // Inner Counter-Rotating Latitudinal Neural Rings (Creates 3D Parallax & Depth)
    const innerRingGroup = new THREE.Group();
    for (let r = -1.1; r <= 1.1; r += 0.55) {
      const ringRadius = Math.sqrt(Math.max(0, 1.44 * 1.44 - r * r));
      if (ringRadius > 0.35) {
        const latRingGeo = new THREE.RingGeometry(ringRadius - 0.012, ringRadius + 0.012, 48);
        const latRingMat = new THREE.MeshBasicMaterial({
          color: primaryColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.22,
          blending: THREE.AdditiveBlending,
        });
        const latRing = new THREE.Mesh(latRingGeo, latRingMat);
        latRing.position.y = r;
        latRing.rotation.x = Math.PI / 2;
        innerRingGroup.add(latRing);
      }
    }
    globeGroup.add(innerRingGroup);

    // ── 2. Concentric Tilted Orbital Track Rings ─────────────────────
    const ring1Geo = new THREE.RingGeometry(3.7, 3.73, 96);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI * 0.42;
    ring1.rotation.y = 0.18;
    matrixGroup.add(ring1);

    const ring2Geo = new THREE.RingGeometry(5.3, 5.33, 96);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: secondaryColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI * 0.30;
    ring2.rotation.y = -0.22;
    matrixGroup.add(ring2);

    // Orbiting Dotted Highway Beacons along Ring 1 (Image 2)
    const orbitDotCount = 36;
    const orbitDotGeo = new THREE.BufferGeometry();
    const orbitDotPositions = new Float32Array(orbitDotCount * 3);
    for (let i = 0; i < orbitDotCount; i++) {
      const a = (i / orbitDotCount) * Math.PI * 2;
      const v = new THREE.Vector3(Math.cos(a) * 3.715, Math.sin(a) * 3.715, 0);
      v.applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI * 0.42);
      v.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.18);
      orbitDotPositions[i * 3] = v.x;
      orbitDotPositions[i * 3 + 1] = v.y;
      orbitDotPositions[i * 3 + 2] = v.z;
    }
    orbitDotGeo.setAttribute('position', new THREE.BufferAttribute(orbitDotPositions, 3));
    const orbitDotMat = new THREE.PointsMaterial({
      color: primaryColor,
      size: 0.11,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const orbitDots = new THREE.Points(orbitDotGeo, orbitDotMat);
    matrixGroup.add(orbitDots);

    // ── 3. Realistic Orbiting Obsidian/Chrome Spheres (Satellite Nodes)
    const satelliteMeshes: THREE.Mesh[] = [];
    const conduitLines: THREE.Line[] = [];
    const haloMeshes: THREE.Mesh[] = [];
    const baseRadius = 4.8;

    SATELLITE_NODES.forEach((node, idx) => {
      const angle = (idx / SATELLITE_NODES.length) * Math.PI * 2;
      const r = baseRadius + (idx % 2 === 0 ? 0.65 : -0.45);
      const yOffset = Math.sin(idx * 1.5) * 1.35;
      const nodeScale = idx === 0 ? 0.44 : 0.35 + (idx % 3) * 0.03;

      // Realistic Obsidian Chrome Sphere (PBR Material + IBL Specular Reflections)
      const sphereGeo = new THREE.SphereGeometry(nodeScale, 36, 36);
      const sphereMat = new THREE.MeshPhysicalMaterial({
        color: idx === 0 ? 0x051329 : 0x050b16,
        roughness: 0.05,
        metalness: 0.98,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        reflectivity: 1.0,
        emissive: idx === 0 ? 0x003355 : 0x001122,
        emissiveIntensity: idx === 0 ? 0.6 : 0.25,
      });

      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(
        Math.cos(angle) * r,
        yOffset,
        Math.sin(angle) * r
      );
      sphere.userData = node;
      matrixGroup.add(sphere);
      satelliteMeshes.push(sphere);

      // Glowing Aura Ring around node (billboarded to camera in render loop)
      const haloRadius = nodeScale * 1.35;
      const haloGeo = new THREE.RingGeometry(haloRadius, haloRadius + 0.045, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? primaryColor : 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: idx === 0 ? 0.95 : 0.5,
        blending: THREE.AdditiveBlending,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      sphere.add(halo);
      haloMeshes.push(halo);

      // Synapse Laser Beam from Central Core to Node
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        sphere.position,
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: idx === 0 ? primaryColor : 0x00d4ff,
        transparent: true,
        opacity: idx === 0 ? 0.45 : 0.22,
        blending: THREE.AdditiveBlending,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      matrixGroup.add(line);
      conduitLines.push(line);
    });

    // Node-to-Node Interconnect Synapses
    for (let i = 0; i < satelliteMeshes.length; i++) {
      const nextIdx = (i + 1) % satelliteMeshes.length;
      const n1 = satelliteMeshes[i].position;
      const n2 = satelliteMeshes[nextIdx].position;
      const interconnectGeo = new THREE.BufferGeometry().setFromPoints([n1, n2]);
      const interconnectMat = new THREE.LineBasicMaterial({
        color: secondaryColor,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
      });
      matrixGroup.add(new THREE.Line(interconnectGeo, interconnectMat));
    }

    // Glowing Pulse Particles along Conduits
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleTargets = new Int32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particleTargets[i] = i % SATELLITE_NODES.length;
      particleSpeeds[i] = 0.007 + Math.random() * 0.014;
      particlePos[i * 3] = 0;
      particlePos[i * 3 + 1] = 0;
      particlePos[i * 3 + 2] = 0;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: primaryColor,
      size: 0.16,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    matrixGroup.add(particlePoints);

    // ── 4. Dedicated Signal Beam Laser & Shockwave Objects ──────────
    const beamGroup = new THREE.Group();
    matrixGroup.add(beamGroup);

    const beamInnerGeo = new THREE.CylinderGeometry(0.04, 0.04, 1, 16);
    const beamInnerMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beamInner = new THREE.Mesh(beamInnerGeo, beamInnerMat);
    beamGroup.add(beamInner);

    const beamOuterGeo = new THREE.CylinderGeometry(0.24, 0.24, 1, 16);
    const beamOuterMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beamOuter = new THREE.Mesh(beamOuterGeo, beamOuterMat);
    beamGroup.add(beamOuter);

    // Shockwave Ring around target node
    const shockwaveGeo = new THREE.RingGeometry(0.2, 0.45, 36);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    matrixGroup.add(shockwaveMesh);

    // ── 5. Recalibration Spherical Holographic Wavefront ─────────────
    const recalWaveGeo = new THREE.SphereGeometry(1, 32, 32);
    const recalWaveMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const recalWaveMesh = new THREE.Mesh(recalWaveGeo, recalWaveMat);
    matrixGroup.add(recalWaveMesh);

    const recalShellMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const recalShellMesh = new THREE.Mesh(recalWaveGeo, recalShellMat);
    matrixGroup.add(recalShellMesh);

    // ── 6. Trigger Handlers & Animation Parameters ──────────────────
    let beamTime = 0;
    const beamDuration = 1100;
    let beamStart = 0;
    let beamTargetPos: THREE.Vector3 | null = null;
    let beamActiveTargetMesh: THREE.Mesh | null = null;

    let recalTime = 0;
    const recalDuration = 1400;
    let recalStart = 0;

    triggerBeamRef.current = (targetId: number) => {
      const target = satelliteMeshes.find(m => (m.userData as SatelliteNodeData)?.id === targetId) || satelliteMeshes[0];
      if (target) {
        beamTargetPos = target.position.clone();
        beamActiveTargetMesh = target;
        beamStart = performance.now();
        beamTime = 1.0;
      }
    };

    triggerRecalibrateRef.current = () => {
      recalStart = performance.now();
      recalTime = 1.0;
    };

    // Deep Cosmic Starfield Background
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 450;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 55;
      starPositions[i + 1] = (Math.random() - 0.5) * 55;
      starPositions[i + 2] = (Math.random() - 0.5) * 55;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0x64748b, size: 0.08, transparent: true, opacity: 0.45 });
    scene.add(new THREE.Points(starsGeo, starsMat));

    // Interactive Raycaster for Node Selection & Mouse/Touch Drag Rotation around Globe Axis
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (clientX: number, clientY: number) => {
      isDragging = true;
      hasMoved = false;
      dragStartX = clientX;
      dragStartY = clientY;
      prevX = clientX;
      prevY = clientY;
      velocityX = 0;
      velocityY = 0;
    };

    const onPointerMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const dx = clientX - prevX;
      const dy = clientY - prevY;
      prevX = clientX;
      prevY = clientY;

      if (Math.hypot(clientX - dragStartX, clientY - dragStartY) > 5) {
        hasMoved = true;
      }

      // Convert pixel deltas to rotational deltas around globe's axis
      velocityX = dx * 0.0055;
      velocityY = dy * 0.003;
      targetRotY += velocityX;
      targetRotX = Math.max(-0.4, Math.min(0.4, targetRotX + velocityY));
    };

    const onPointerUp = (clientX?: number, clientY?: number) => {
      if (!isDragging) return;
      isDragging = false;

      // Click without drag selects node via raycasting
      if (!hasMoved && clientX !== undefined && clientY !== undefined && renderer) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(satelliteMeshes);

        if (intersects.length > 0) {
          const clickedMesh = intersects[0].object as THREE.Mesh;
          const nodeData = clickedMesh.userData as SatelliteNodeData;
          setSelectedNode(nodeData);
          sound.selectNode();
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      onPointerDown(e.clientX, e.clientY);
    };
    const handleMouseMove = (e: MouseEvent) => {
      onPointerMove(e.clientX, e.clientY);
    };
    const handleMouseUp = (e: MouseEvent) => {
      onPointerUp(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        if (e.cancelable) e.preventDefault();
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const changed = e.changedTouches[0];
      onPointerUp(changed ? changed.clientX : undefined, changed ? changed.clientY : undefined);
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    renderer.domElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || 1280;
      const h = container.clientHeight || 720;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      const f = calculateFraming(w, h);
      matrixGroup.position.set(0, f.groupY, 0);
      camera.position.set(0, f.camY, f.camZ);
      camera.lookAt(0, f.lookAtY, 0);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // FPS Calculation
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      // Smooth Orbital Rotation & Inertia Momentum around Globe's Axis
      if (!isDragging) {
        velocityX *= 0.92;
        velocityY *= 0.92;
        targetRotY += velocityX;
        targetRotX += velocityY;

        // Base continuous auto-rotation speed
        const baseAutoSpeed = 0.0022;
        targetRotY += baseAutoSpeed;
      }

      currentRotY += (targetRotY - currentRotY) * 0.08;
      currentRotX += (targetRotX - currentRotX) * 0.08;
      matrixGroup.rotation.y = currentRotY;
      matrixGroup.rotation.x = currentRotX;

      // Rotate Geodesic Wireframe, Junction Dots & Core on Central Globe
      geoWireMesh.rotation.y += 0.0035;
      geoWireMesh.rotation.x += 0.0018;
      vertexPoints.rotation.y += 0.0035;
      vertexPoints.rotation.x += 0.0018;
      innerRingGroup.rotation.y -= 0.003;
      coreSphere.rotation.y -= 0.0015;

      // Pulse the central reactor core light subtly
      cyanPointLight.intensity = (isVolumetric ? 6.5 : 4.2) + Math.sin(performance.now() * 0.003) * 1.2;

      // Orbiting Dotted Highway Beacons Rotation
      orbitDots.rotation.z += 0.004;

      // Ensure Halo Rings face the camera for a perfect glowing aura
      haloMeshes.forEach(h => {
        h.quaternion.copy(camera.quaternion);
      });

      // Update Node Halo and Conduit based on selection
      satelliteMeshes.forEach((mesh, idx) => {
        const isSelected = (mesh.userData as SatelliteNodeData)?.id === selectedNodeIdRef.current;
        const halo = haloMeshes[idx];
        if (halo) {
          (halo.material as THREE.MeshBasicMaterial).opacity = isSelected ? 0.95 : 0.35;
        }
        const conduit = conduitLines[idx];
        if (conduit && recalTime <= 0) {
          (conduit.material as THREE.LineBasicMaterial).opacity = isSelected ? 0.55 : 0.22;
        }
      });

      const curTime = performance.now();

      // ── Handle Signal Beam Laser & Shockwave Animation ──
      if (beamTime > 0 && beamTargetPos) {
        const elapsed = curTime - beamStart;
        const progress = Math.min(1, elapsed / beamDuration);
        beamTime = 1.0 - progress;

        const halfPos = beamTargetPos.clone().multiplyScalar(0.5);
        const dist = beamTargetPos.length();
        beamGroup.position.copy(halfPos);

        const up = new THREE.Vector3(0, 1, 0);
        const dir = beamTargetPos.clone().normalize();
        beamGroup.quaternion.setFromUnitVectors(up, dir);
        beamGroup.scale.set(1, dist, 1);

        const pulse = Math.sin(progress * Math.PI);
        beamInnerMat.opacity = pulse * 0.95;
        beamOuterMat.opacity = pulse * 0.8;
        beamOuterMat.color.setHex(isQuantum ? 0xc084fc : 0x00f0ff);

        // Position shockwave ring at target node
        shockwaveMesh.position.copy(beamTargetPos);
        shockwaveMesh.quaternion.copy(camera.quaternion);
        const ringScale = 0.4 + progress * 4.2;
        shockwaveMesh.scale.set(ringScale, ringScale, ringScale);
        shockwaveMat.opacity = Math.max(0, (1 - progress) * 0.9);

        // Core light flare
        cyanPointLight.intensity = (isVolumetric ? 6.5 : 4.2) + pulse * 15.0;

        // Target Node Scale Pulse
        if (beamActiveTargetMesh) {
          const s = 1.0 + pulse * 0.4;
          beamActiveTargetMesh.scale.set(s, s, s);
        }
      } else {
        beamInnerMat.opacity = 0;
        beamOuterMat.opacity = 0;
        shockwaveMat.opacity = 0;
        if (beamActiveTargetMesh) {
          beamActiveTargetMesh.scale.set(1, 1, 1);
        }
      }

      // ── Handle Recalibration Spherical Wavefront Animation ──
      if (recalTime > 0) {
        const elapsed = curTime - recalStart;
        const progress = Math.min(1, elapsed / recalDuration);
        recalTime = 1.0 - progress;

        const waveRadius = progress * 9.8;
        recalWaveMesh.scale.set(waveRadius, waveRadius, waveRadius);
        recalShellMesh.scale.set(waveRadius * 0.98, waveRadius * 0.98, waveRadius * 0.98);

        const waveAlpha = Math.sin(progress * Math.PI) * 0.75;
        recalWaveMat.opacity = waveAlpha;
        recalShellMat.opacity = waveAlpha * 0.35;

        // Flare conduit lines
        const conduitSurge = Math.sin(progress * Math.PI) * 0.65;
        conduitLines.forEach((line) => {
          (line.material as THREE.LineBasicMaterial).opacity = 0.22 + conduitSurge;
        });

        // Pulse nodes when wave passes
        satelliteMeshes.forEach(mesh => {
          const d = mesh.position.length();
          const diff = Math.abs(d - waveRadius);
          if (diff < 1.4) {
            const boost = (1 - diff / 1.4) * 0.4;
            mesh.scale.set(1 + boost, 1 + boost, 1 + boost);
          } else if (mesh !== beamActiveTargetMesh) {
            mesh.scale.set(1, 1, 1);
          }
        });

        // Inertia boost to rotation
        matrixGroup.rotation.y += 0.005 * Math.sin(progress * Math.PI);
        cyanPointLight.intensity = (isVolumetric ? 6.5 : 4.2) + Math.sin(progress * Math.PI) * 5.0;
      } else {
        recalWaveMat.opacity = 0;
        recalShellMat.opacity = 0;
      }

      // Pulse Particles along Conduits (accelerate during beam or recalibrate)
      const speedMultiplier = beamTime > 0 ? 3.5 : (recalTime > 0 ? 2.0 : 1.0);
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const targetMesh = satelliteMeshes[particleTargets[i]];
        if (!targetMesh) continue;

        let curX = posArray[i * 3];
        let curY = posArray[i * 3 + 1];
        let curZ = posArray[i * 3 + 2];

        const speed = particleSpeeds[i] * speedMultiplier;
        curX += (targetMesh.position.x - curX) * speed * 2;
        curY += (targetMesh.position.y - curY) * speed * 2;
        curZ += (targetMesh.position.z - curZ) * speed * 2;

        if (new THREE.Vector3(curX, curY, curZ).distanceTo(targetMesh.position) < 0.3) {
          curX = 0;
          curY = 0;
          curZ = 0;
        }

        posArray[i * 3] = curX;
        posArray[i * 3 + 1] = curY;
        posArray[i * 3 + 2] = curZ;
      }
      posAttr.needsUpdate = true;

      renderer?.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      try {
        if (renderer && renderer.domElement) {
          renderer.domElement.removeEventListener('mousedown', handleMouseDown);
          renderer.domElement.removeEventListener('touchstart', handleTouchStart);
          if (renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        }
      } catch {
        // ignore DOM removal error
      }
      try {
        renderer?.dispose();
        pmrem?.dispose();
        if (envMap) envMap.dispose();
        coreGeo.dispose();
        coreMat.dispose();
        geoIco.dispose();
        wireGeo.dispose();
        geoWireMat.dispose();
        vertexMat.dispose();
        atmoGeo.dispose();
        atmoMat.dispose();
        ring1Geo.dispose();
        ring1Mat.dispose();
        ring2Geo.dispose();
        ring2Mat.dispose();
        orbitDotGeo.dispose();
        orbitDotMat.dispose();
        beamInnerGeo.dispose();
        beamInnerMat.dispose();
        beamOuterGeo.dispose();
        beamOuterMat.dispose();
        shockwaveGeo.dispose();
        shockwaveMat.dispose();
        recalWaveGeo.dispose();
        recalWaveMat.dispose();
        recalShellMat.dispose();
      } catch {
        // ignore dispose error
      }
    };
  }, [shaderMode]);

  // Recalibrate Weights Action
  const handleRecalibrate = () => {
    setRecalibrating(true);
    triggerRecalibrateRef.current();
    sound.rebalance();

    const newLoss = (0.000018 + Math.random() * 0.000028).toFixed(5);
    const newPing = (0.32 + Math.random() * 0.18).toFixed(2) + 'ms';
    const newLoad = `${Math.floor(Math.random() * 15 + 42)}%`;
    const delta = (-0.000015 - Math.random() * 0.000012).toFixed(5);
    const timeStr = new Date().toLocaleTimeString();

    // Set loading state in persistent output panel
    setRecalOutput(prev => ({
      ...prev,
      status: 'processing',
      operation: 'WEIGHT_OPTIMIZER_v4.12',
      timestamp: timeStr,
      targetNode: selectedNode.name,
    }));

    // Record high-priority event in hex streaming logs
    const hex = '0x' + Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
    setHexLogs(prev => [
      `[${hex}] 🔄 RECAL_WEIGHTS -> 1.2T TENSORS OPTIMIZED [LOSS: ${newLoss}]`,
      ...prev.slice(0, 3)
    ]);

    setTimeout(() => {
      setRecalibrating(false);
      setSelectedNode(prev => ({
        ...prev,
        weightLoss: newLoss,
        ping: newPing,
        load: newLoad
      }));
      // Persistent panel update (never disappears on pointer leave)
      setRecalOutput({
        status: 'success',
        operation: 'WEIGHT_OPTIMIZER_v4.12',
        timestamp: timeStr,
        targetNode: selectedNode.name,
        weightLoss: newLoss,
        deltaWeight: `${delta} Δ`,
        latency: newPing,
        load: newLoad,
        security: 'LWE-256_VALIDATED',
        cores: 14029,
      });
    }, 1200);
  };

  // Inject Signal Beam Action
  const handleInjectBeam = () => {
    setBeamActive(true);
    triggerBeamRef.current(selectedNode.id);
    sound.beam();

    // Dynamically improve telemetry metrics on the node
    const newPing = (0.22 + Math.random() * 0.15).toFixed(2) + 'ms';
    const newThroughput = `${Math.floor(Math.random() * 80 + 520)} GB/s`;
    const newBuffers = (4096 + Math.floor(Math.random() * 256)).toLocaleString();
    const timeStr = new Date().toLocaleTimeString();

    // Set loading/transmitting state in persistent output panel
    setSignalOutput(prev => ({
      ...prev,
      status: 'transmitting',
      operation: 'PHOTONIC_SIGNAL_BEAM_v4',
      timestamp: timeStr,
      targetNode: selectedNode.name,
      region: selectedNode.region,
    }));

    setSelectedNode(prev => ({
      ...prev,
      ping: newPing,
      throughput: newThroughput,
      buffers: newBuffers
    }));

    // Record high-priority event in hex streaming logs
    const hex = '0x' + Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
    setHexLogs(prev => [
      `[${hex}] ⚡ BEAM_INJECT -> NODE #${selectedNode.id} [${newPing}] SYNC 100%`,
      ...prev.slice(0, 3)
    ]);

    setTimeout(() => {
      setBeamActive(false);
      // Persistent panel update (never disappears on pointer leave)
      setSignalOutput({
        status: 'success',
        operation: 'PHOTONIC_SIGNAL_BEAM_v4',
        timestamp: timeStr,
        targetNode: selectedNode.name,
        region: selectedNode.region,
        carrierFreq: '847.2 THz Coherent',
        powerDensity: `${(45.2 + Math.random() * 5.4).toFixed(1)} GW/cm²`,
        throughput: newThroughput,
        latency: newPing,
        telemetryAck: '100% (0 pkts dropped)',
        buffers: `${newBuffers} Allocated`,
      });
    }, 1000);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#030305] text-slate-100 font-sans select-none flex flex-col">
      {/* ── 1. GLOBAL COCKPIT TOP HEADER ─────────────── */}
      <header className="relative z-30 h-16 border-b border-white/10 bg-[#06060c]/90 backdrop-blur-2xl px-4 lg:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/" onClick={() => sound.click()} className="flex items-center gap-2.5 group cursor-pointer hover:opacity-95 transition-opacity" title="Return to NexGen AI Home">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#a200ff] flex items-center justify-center text-black shadow-[0_0_15px_rgba(0,240,255,0.4)] group-hover:scale-105 transition-transform">
              <Hexagon className="w-4 h-4 fill-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white group-hover:text-[#00f0ff] transition-colors">
                  NexGen AI
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#00f0ff]/20 to-[#a200ff]/20 border border-[#00f0ff]/40 text-[#00f0ff] text-[10px] font-black tracking-wider leading-none">
                  PRO
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30">
                  v4.12 SPATIAL
                </span>
              </div>
              <div className="text-[9px] font-mono text-gray-400 hidden md:block">
                Cloud-Native 3D Spatial Computing Engine
              </div>
            </div>
          </Link>
        </div>

        {/* Center HUD Status Title Badge */}
        <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-2xl bg-black/40 border border-white/10 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-gray-200">
            3D SPATIAL NEURAL MATRIX
          </span>
          <span className="text-gray-600 font-mono">|</span>
          <span className="text-[10px] font-mono font-bold text-emerald-400">CLUSTER #01 ONLINE</span>
        </div>

        {/* Right Status & Dashboard Navigation Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] font-mono text-gray-400">
            <span>FPS: <strong className="text-emerald-400">{fps}</strong></span>
            <span>•</span>
            <span>BUS: <strong className="text-[#00f0ff]">&lt;0.28ms</strong></span>
          </div>

          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SYSTEM OPTIMAL</span>
          </div>

          <Link
            to="/dashboard?tab=ai-terminal"
            onClick={() => sound.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-md"
            title="Open AI Reasoning Terminal (recursive/flint-v1.0:free)"
          >
            <Cpu className="w-3.5 h-3.5 text-[#a200ff]" />
            <span>AI Reasoning</span>
          </Link>

          <Link
            to="/dashboard?tab=nodes"
            onClick={() => sound.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-md"
            title="Inspect 312 Global Edge Fleet Nodes"
          >
            <Activity className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Telemetry [312 Nodes]</span>
          </Link>

          <Link
            to="/dashboard"
            onClick={() => sound.click()}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00f0ff]/20 to-[#a200ff]/20 border border-[#00f0ff]/30 text-white hover:border-[#00f0ff] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] text-xs font-bold transition-all cursor-pointer"
            title="Open Platform Dashboard (Fleet Nodes, Terminal CLI, Spec Docs)"
          >
            <Layers className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      {/* ── 2. VIEWPORT CONTAINER ──────────────────────────────────── */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* ═══════════════════════════════════════════════════════════
            3D SPATIAL NEURAL COCKPIT
            ═══════════════════════════════════════════════════════════ */}
        <div className="relative w-full h-full overflow-hidden">
            {/* 3D Canvas Container */}
            <div ref={canvasContainerRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

            {/* Sub-pixel Radial Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(3,3,5,0.75)_100%)] pointer-events-none z-10" />

            {/* Top Cockpit Title & Shader Selector Overlay (Image 2) */}
            <div className="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pointer-events-none">
              <div className="pointer-events-auto">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Spatial Neural Cockpit
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[#a200ff] text-[10px] font-mono font-bold tracking-wider">
                    1.2 TB/s Throughput
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  Interactive WebGL/WebGPU 3D Neural Matrix &amp; Edge Node Topology Visualizer
                </p>
              </div>

              {/* Shader Preset Switcher + Reset View + Spec Doc */}
              <div className="flex items-center gap-2 pointer-events-auto bg-[#080812]/90 backdrop-blur-xl p-1.5 rounded-2xl border border-white/15 shadow-xl">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest pl-2">Shader:</span>
                {(['Hologram', 'Volumetric', 'Quantum'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => { setShaderMode(mode); sound.click(); }}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      shaderMode === mode
                        ? 'bg-[#00f0ff] text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
                <button
                  onClick={() => { resetCameraRef.current(); sound.click(); }}
                  title="Reset Camera View"
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-[#00f0ff] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setShowSpecModal(true); sound.click(); }}
                  title="View Technical Specification (DOC-ID: NG-SYS-412)"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-[#00f0ff] text-xs font-mono font-bold transition-colors cursor-pointer border border-white/5"
                >
                  <FileText className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span className="hidden sm:inline">Spec</span>
                </button>
              </div>
            </div>

            {/* ── Left Column: Panel 1 (NEURAL_OUTPUT_01) & Panel 2 (RECALIBRATION_OUTPUT_02) ── */}
            <div className="absolute top-20 sm:top-24 left-4 z-20 w-80 max-w-[calc(100vw-2rem)] pointer-events-auto space-y-3">
              {/* Panel 1: NEURAL_OUTPUT_01 (Preserved in Original Position) */}
              <div className="p-4 rounded-3xl bg-[#080812]/90 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-3 font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
                    <span className="text-xs font-bold text-[#00f0ff] tracking-wider uppercase">NEURAL_OUTPUT_01</span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-bold">
                    QUANTUM_LWE_256
                  </span>
                </div>

                {/* Live Hex Stream Lines */}
                <div className="space-y-1.5 text-[11px] text-gray-300 bg-black/40 p-2.5 rounded-2xl border border-white/5">
                  {hexLogs.map((log, idx) => (
                    <div key={idx} className="truncate text-cyan-300/90 font-mono">
                      {log}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/10">
                  <span>BUFFER STABILITY: <strong className="text-emerald-400">99.98%</strong></span>
                  <span className="text-purple-400 flex items-center gap-1 font-bold">
                    <Shield className="w-3 h-3 text-purple-400" /> ENCRYPTED
                  </span>
                </div>
              </div>

              {/* Panel 2: RECALIBRATION_OUTPUT_02 (Directly below NEURAL_OUTPUT_01, Persistent Output) */}
              <div className="p-4 rounded-3xl bg-[#080812]/90 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl space-y-2.5 font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      recalOutput.status === 'processing'
                        ? 'bg-amber-400 animate-ping'
                        : recalOutput.status === 'success'
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-emerald-500/60'
                    }`} />
                    <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">RECALIBRATION_OUTPUT_02</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase ${
                      recalOutput.status === 'processing'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                        : recalOutput.status === 'success'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-gray-400'
                    }`}>
                      {recalOutput.status === 'processing' ? 'OPTIMIZING...' : recalOutput.status === 'success' ? 'SYNCHRONIZED' : 'STANDBY'}
                    </span>
                    <button
                      onClick={() => setRecalOutput(initialRecalState)}
                      title="Reset Recalibration Panel to Baseline"
                      className="p-1 rounded-md text-gray-500 hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                {/* Recalibration Telemetry Details */}
                <div className="space-y-1.5 text-[11px] text-gray-300 bg-black/40 p-2.5 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center text-gray-400">
                    <span>OP: <strong className="text-white">{recalOutput.operation}</strong></span>
                    <span className="text-[10px] text-gray-500">{recalOutput.timestamp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">TARGET:</span>
                    <span className="text-[#00f0ff] font-bold truncate max-w-[150px]">{recalOutput.targetNode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">GRADIENT LOSS:</span>
                    <span className="text-purple-300 font-bold">{recalOutput.weightLoss}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">DELTA DIVERGENCE:</span>
                    <span className="text-emerald-400 font-bold">{recalOutput.deltaWeight}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">CONVERGENCE RTT:</span>
                    <span className="text-cyan-300 font-bold">{recalOutput.latency}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/10">
                  <span>CORES: <strong className="text-emerald-400">{recalOutput.cores.toLocaleString()} SYNCD</strong></span>
                  <span className="text-emerald-400 font-bold">{recalOutput.security}</span>
                </div>
              </div>
            </div>

            {/* ── Right Column: Metric Cards & Panel 3 (SIGNAL_INJECTION_OUTPUT_03) ── */}
            <div className="absolute top-20 sm:top-24 right-4 z-20 w-80 max-w-[calc(100vw-2rem)] pointer-events-auto space-y-3">
              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#080812]/90 border border-white/15 backdrop-blur-2xl shadow-xl flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff] shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[8px] font-mono uppercase text-gray-400">EDGE LATENCY</div>
                    <div className="text-base font-black font-mono text-[#00f0ff] leading-none mt-0.5 truncate">{selectedNode.ping || '0.84 ms'}</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#080812]/90 border border-white/15 backdrop-blur-2xl shadow-xl flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#a200ff]/15 border border-[#a200ff]/30 flex items-center justify-center text-[#a200ff] shrink-0">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[8px] font-mono uppercase text-gray-400">TENSOR WEIGHTS</div>
                    <div className="text-xs font-black font-mono text-purple-300 leading-none mt-0.5 truncate">1.2T Active</div>
                  </div>
                </div>
              </div>

              {/* Panel 3: SIGNAL_INJECTION_OUTPUT_03 (Persistent Output) */}
              <div className="p-4 rounded-3xl bg-[#080812]/90 border border-[#00f0ff]/30 backdrop-blur-2xl shadow-2xl space-y-2.5 font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      signalOutput.status === 'transmitting'
                        ? 'bg-[#00f0ff] animate-ping'
                        : signalOutput.status === 'success'
                        ? 'bg-[#00f0ff] animate-pulse'
                        : 'bg-[#00f0ff]/60'
                    }`} />
                    <span className="text-xs font-bold text-[#00f0ff] tracking-wider uppercase">SIGNAL_BEAM_OUTPUT_03</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase ${
                      signalOutput.status === 'transmitting'
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 animate-pulse'
                        : signalOutput.status === 'success'
                        ? 'bg-[#00f0ff]/20 border-[#00f0ff]/40 text-[#00f0ff]'
                        : 'bg-white/5 border-white/10 text-gray-400'
                    }`}>
                      {signalOutput.status === 'transmitting' ? 'TRANSMITTING' : signalOutput.status === 'success' ? 'BEAM_DELIVERED' : 'READY'}
                    </span>
                    <button
                      onClick={() => setSignalOutput(initialSignalState)}
                      title="Reset Signal Injection Panel to Baseline"
                      className="p-1 rounded-md text-gray-500 hover:text-[#00f0ff] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                {/* Signal Beam Telemetry Details */}
                <div className="space-y-1.5 text-[11px] text-gray-300 bg-black/40 p-2.5 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center text-gray-400">
                    <span>OP: <strong className="text-white">{signalOutput.operation}</strong></span>
                    <span className="text-[10px] text-gray-500">{signalOutput.timestamp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">TARGET:</span>
                    <span className="text-cyan-300 font-bold truncate max-w-[150px]">{signalOutput.targetNode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">CARRIER FREQ:</span>
                    <span className="text-purple-300 font-bold">{signalOutput.carrierFreq}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">POWER DENSITY:</span>
                    <span className="text-amber-300 font-bold">{signalOutput.powerDensity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">THROUGHPUT:</span>
                    <span className="text-[#00f0ff] font-bold">{signalOutput.throughput}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">PACKET ACK:</span>
                    <span className="text-emerald-400 font-bold">{signalOutput.telemetryAck}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/10">
                  <span>BUFFERS: <strong className="text-cyan-300">{signalOutput.buffers}</strong></span>
                  <span className="text-[#00f0ff] font-bold">{signalOutput.latency} RTT</span>
                </div>
              </div>
            </div>

            {/* Bottom-Center Floating Inspector Card (Image 2) */}
            <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-5xl px-2 sm:px-4 pointer-events-auto">
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 sm:py-3.5 sm:px-6 rounded-2xl sm:rounded-3xl bg-[#080812]/95 border border-[#00f0ff]/30 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_40px_rgba(0,240,255,0.12)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4"
              >
                {/* Node Identity */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/35 flex items-center justify-center text-[#00f0ff] shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
                    <Share2 className="w-5 h-5 text-[#00f0ff]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-extrabold text-white tracking-wide whitespace-nowrap">
                        {selectedNode.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap">
                        {selectedNode.status}
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-mono text-gray-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="whitespace-nowrap">Tensor Buffers: <strong className="text-white font-semibold">{selectedNode.buffers}</strong></span>
                      <span className="text-gray-600 hidden sm:inline">|</span>
                      <span className="whitespace-nowrap">Latency: <strong className="text-[#00f0ff] font-semibold">{selectedNode.ping}</strong></span>
                      <span className="text-gray-600 hidden sm:inline">|</span>
                      <span className="whitespace-nowrap">Weight Loss: <strong className="text-purple-300 font-semibold">{selectedNode.weightLoss}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions: Recalibrate Weights & Inject Signal Beam */}
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap w-full md:w-auto justify-start sm:justify-end">
                  <button
                    onClick={handleRecalibrate}
                    disabled={recalibrating}
                    className={`px-3 sm:px-4 py-2 rounded-xl font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md whitespace-nowrap shrink-0 active:scale-95 ${
                      recalibrating
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.4)]'
                        : 'bg-[#0a1628]/90 hover:bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff]'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${recalibrating ? 'animate-spin text-emerald-400' : 'text-[#00f0ff]'}`} />
                    <span>{recalibrating ? 'Recalibrating...' : 'Recalibrate Weights'}</span>
                  </button>

                  <button
                    onClick={handleInjectBeam}
                    className={`px-3 sm:px-4 py-2 rounded-xl border font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md whitespace-nowrap shrink-0 active:scale-95 ${
                      beamActive
                        ? 'bg-[#00f0ff]/25 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_25px_rgba(0,240,255,0.6)] animate-pulse'
                        : 'bg-[#180a2a]/90 hover:bg-[#a200ff]/20 border-[#a200ff]/50 text-[#c084fc] hover:text-white shadow-[0_0_20px_rgba(162,0,255,0.2)]'
                    }`}
                  >
                    <Activity className={`w-3.5 h-3.5 ${beamActive ? 'text-[#00f0ff] animate-bounce' : 'text-[#a200ff]'}`} />
                    <span>{beamActive ? '⚡ Beam Injected!' : 'Inject Signal Beam'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

      </div>

      {/* ── 3. SPECIFICATION MANUAL MODAL (DOC-ID: NG-SYS-412) ──────── */}
      <AnimatePresence>
        {showSpecModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl max-h-[88vh] rounded-3xl bg-[#080812] border border-white/20 p-6 sm:p-8 shadow-[0_0_80px_rgba(0,240,255,0.25)] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-white/10 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">NexGen AI PRO Spatial Engine</h3>
                    <span className="px-2 py-0.5 rounded bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 text-[10px] font-mono font-bold">
                      DOC-ID: NG-SYS-412
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    Technical Architecture &amp; Engineering Specification Manual (Rev 4.12 | WebGPU Active)
                  </p>
                </div>
                <button
                  onClick={() => setShowSpecModal(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Document Content Body */}
              <div className="flex-1 overflow-y-auto py-5 space-y-6 select-text font-mono text-xs text-gray-300">
                {/* Section 1 */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <h4 className="text-sm font-bold text-[#00f0ff] uppercase">1. SYSTEM VISION &amp; TECHNICAL ARCHITECTURE</h4>
                  <p className="leading-relaxed text-gray-400 font-sans">
                    NexGen AI PRO bridges browser-native WebGL/WebGPU spatial viewports with distributed neural inference infrastructure. Unlike legacy 2D operational dashboards, NexGen renders cloud topology, tensor neural weights, and node health inside a synchronized 3D spatial interface.
                  </p>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <div className="text-[9px] text-gray-500 uppercase">MAX NETWORK RTT</div>
                      <div className="text-sm font-bold text-[#00f0ff]">&lt; 0.85 ms</div>
                      <div className="text-[9px] text-gray-400">Sub-ms SLA</div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <div className="text-[9px] text-gray-500 uppercase">DATA THROUGHPUT</div>
                      <div className="text-sm font-bold text-purple-400">1.2 TB/s</div>
                      <div className="text-[9px] text-gray-400">Distributed Mesh</div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <div className="text-[9px] text-gray-500 uppercase">CLUSTER FLEET</div>
                      <div className="text-sm font-bold text-emerald-400">300+ Nodes</div>
                      <div className="text-[9px] text-gray-400">US, EU, APAC, JP</div>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <h4 className="text-sm font-bold text-purple-400 uppercase">2. WEBGL/WEBGPU SHADER &amp; TENSOR ARCHITECTURE</h4>
                  <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-[11px] text-cyan-300 overflow-x-auto">
                    <code>
                      {`// Kinetic Node Vertex Shader (GLSL ES 3.0)
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
                <div className="space-y-2.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <h4 className="text-sm font-bold text-emerald-400 uppercase">3. REST &amp; WEBSOCKET API SPECIFICATIONS</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <strong className="text-white">GET /api/v1/cluster/status</strong>: Returns fleet health, node count, avg ping
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <strong className="text-white">POST /api/v1/cluster/rebalance</strong>: Triggers automated global load redistribution
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <strong className="text-white">POST /api/v1/deploy/canary</strong>: Initiates 4-stage canary release to edge fleet
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <strong className="text-white">WS wss://stream.nexgen.cloud/v1</strong>: Streams live hex output &amp; neural logs
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-white/10 flex justify-end shrink-0">
                <button
                  onClick={() => setShowSpecModal(false)}
                  className="px-5 py-2 rounded-xl bg-[#00f0ff] text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Close Specification
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CockpitPage;
