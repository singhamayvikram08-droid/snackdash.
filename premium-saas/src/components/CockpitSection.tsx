import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import {
  Zap, Shield,
  Maximize2, ArrowUpRight, Lock
} from 'lucide-react';
import { useAuth } from '../utils/auth';

const CockpitSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 480;

    let renderer: THREE.WebGLRenderer | null = null;
    let fallbackCanvas: HTMLCanvasElement | null = null;
    let animId: number;

    // 1. Try initializing WebGL Three.js Renderer
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
      if (gl) {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
      }
    } catch {
      renderer = null;
    }

    if (renderer) {
      // Full Three.js 3D WebGL Pipeline with PBR Shaders
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.set(0, 0, 7.8);
      camera.lookAt(0, 0, 0);

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
          grad.addColorStop(0.32, '#081735');
          grad.addColorStop(0.48, '#00f0ff');
          grad.addColorStop(0.52, '#a200ff');
          grad.addColorStop(0.7, '#050d22');
          grad.addColorStop(1, '#010204');
          envCtx.fillStyle = grad;
          envCtx.fillRect(0, 0, 512, 256);
          for (let i = 0; i < 35; i++) {
            const x = (i * 47) % 512;
            const y = (i * 31) % 256;
            envCtx.fillStyle = i % 2 === 0 ? '#ffffff' : '#00f0ff';
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
        // ignore HDR env map load error
      }

      // Realistic Lights for Specular Highlights
      const ambientLight = new THREE.AmbientLight(0x0a1628, 1.4);
      scene.add(ambientLight);
      const dirLight = new THREE.DirectionalLight(0xffffff, 3.0);
      dirLight.position.set(6, 10, 8);
      scene.add(dirLight);
      const pointLight1 = new THREE.PointLight(0x00f0ff, 4.0, 25);
      pointLight1.position.set(0, 0, 0);
      scene.add(pointLight1);
      const pointLight2 = new THREE.PointLight(0xa200ff, 2.5, 20);
      pointLight2.position.set(5, -3, -4);
      scene.add(pointLight2);

      const group = new THREE.Group();
      scene.add(group);

      // Central Geodesic Globe: Inner Core + Outer Wireframe + Glowing Vertex Points
      const coreGeo = new THREE.SphereGeometry(1.2, 48, 48);
      const coreMat = new THREE.MeshPhysicalMaterial({
        color: 0x020814,
        roughness: 0.08,
        metalness: 0.95,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        reflectivity: 1.0,
        emissive: 0x001a33,
        emissiveIntensity: 0.5,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      group.add(coreMesh);

      // High-resolution Geodesic Wireframe
      const icoGeo = new THREE.IcosahedronGeometry(1.5, 3);
      const wireGeo = new THREE.WireframeGeometry(icoGeo);
      const icoMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const icoMesh = new THREE.LineSegments(wireGeo, icoMat);
      group.add(icoMesh);

      // Glowing Vertex Junction Points
      const vertexMat = new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.07,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const vertexPoints = new THREE.Points(icoGeo, vertexMat);
      group.add(vertexPoints);

      // Atmosphere Soft Glow
      const atmoGeo = new THREE.SphereGeometry(1.58, 32, 32);
      const atmoMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
      group.add(atmoMesh);

      // Concentric Tilted Orbital Rings
      const ringGeo = new THREE.RingGeometry(2.8, 2.83, 96);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI * 0.42;
      group.add(ringMesh);

      // Orbiting Dotted Highway Beacons along the ring
      const orbitDotCount = 28;
      const orbitDotGeo = new THREE.BufferGeometry();
      const orbitDotPositions = new Float32Array(orbitDotCount * 3);
      for (let i = 0; i < orbitDotCount; i++) {
        const a = (i / orbitDotCount) * Math.PI * 2;
        const v = new THREE.Vector3(Math.cos(a) * 2.815, Math.sin(a) * 2.815, 0);
        v.applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI * 0.42);
        orbitDotPositions[i * 3] = v.x;
        orbitDotPositions[i * 3 + 1] = v.y;
        orbitDotPositions[i * 3 + 2] = v.z;
      }
      orbitDotGeo.setAttribute('position', new THREE.BufferAttribute(orbitDotPositions, 3));
      const orbitDotMat = new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.09,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      const orbitDots = new THREE.Points(orbitDotGeo, orbitDotMat);
      group.add(orbitDots);

      // Realistic Orbiting Metallic Obsidian Spheres
      const satellites: THREE.Mesh[] = [];
      const haloMeshes: THREE.Mesh[] = [];
      const count = 6;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const sGeo = new THREE.SphereGeometry(0.3, 32, 32);
        const sMat = new THREE.MeshPhysicalMaterial({
          color: i === 0 ? 0x051329 : 0x060c18,
          roughness: 0.06,
          metalness: 0.98,
          clearcoat: 1.0,
          clearcoatRoughness: 0.03,
          reflectivity: 1.0,
          emissive: i === 0 ? 0x003355 : 0x001122,
          emissiveIntensity: i === 0 ? 0.6 : 0.25,
        });
        const sphere = new THREE.Mesh(sGeo, sMat);
        sphere.position.set(Math.cos(angle) * 3.6, Math.sin(i * 1.5) * 1.1, Math.sin(angle) * 3.6);
        group.add(sphere);
        satellites.push(sphere);

        // Glowing Halo Ring around node
        const haloGeo = new THREE.RingGeometry(0.38, 0.42, 24);
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0x00f0ff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: i === 0 ? 0.9 : 0.5,
          blending: THREE.AdditiveBlending,
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        sphere.add(halo);
        haloMeshes.push(halo);

        // Laser Beam
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          sphere.position
        ]);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x00f0ff,
          transparent: true,
          opacity: i === 0 ? 0.45 : 0.25,
          blending: THREE.AdditiveBlending,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        group.add(line);
      }

      // Pulse Particles along Conduits
      const pCount = 36;
      const pGeo = new THREE.BufferGeometry();
      const pPositions = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i++) pPositions[i] = 0;
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.14,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const pPoints = new THREE.Points(pGeo, pMat);
      group.add(pPoints);

      const handleResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth || 800;
        const h = container.clientHeight || 480;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      const animate = () => {
        animId = requestAnimationFrame(animate);
        group.rotation.y += 0.003;
        icoMesh.rotation.y += 0.0035;
        icoMesh.rotation.x += 0.0018;
        vertexPoints.rotation.y += 0.0035;
        vertexPoints.rotation.x += 0.0018;
        coreMesh.rotation.y -= 0.0015;
        orbitDots.rotation.z += 0.004;

        // Keep halos facing camera
        haloMeshes.forEach(h => h.quaternion.copy(camera.quaternion));

        const posArr = pGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < pCount; i++) {
          const target = satellites[i % satellites.length];
          let curX = posArr[i * 3];
          let curY = posArr[i * 3 + 1];
          let curZ = posArr[i * 3 + 2];
          curX += (target.position.x - curX) * 0.02;
          curY += (target.position.y - curY) * 0.02;
          curZ += (target.position.z - curZ) * 0.02;
          if (new THREE.Vector3(curX, curY, curZ).distanceTo(target.position) < 0.25) {
            curX = 0; curY = 0; curZ = 0;
          }
          posArr[i * 3] = curX;
          posArr[i * 3 + 1] = curY;
          posArr[i * 3 + 2] = curZ;
        }
        pGeo.attributes.position.needsUpdate = true;
        renderer?.render(scene, camera);
      };
      animate();

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
        try {
          if (renderer && renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        } catch {
          // ignore
        }
        try {
          renderer?.dispose();
          pmrem?.dispose();
          if (envMap) envMap.dispose();
          icoGeo.dispose();
          wireGeo.dispose();
          icoMat.dispose();
          vertexMat.dispose();
          atmoGeo.dispose();
          atmoMat.dispose();
          coreGeo.dispose();
          coreMat.dispose();
          ringGeo.dispose();
          ringMat.dispose();
          orbitDotGeo.dispose();
          orbitDotMat.dispose();
        } catch {
          // ignore
        }
      };
    } else {
      // 2. High-Performance HTML5 2D Canvas Fallback (100% Guaranteed to Never Crash)
      fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = width;
      fallbackCanvas.height = height;
      fallbackCanvas.className = 'w-full h-full block';
      container.appendChild(fallbackCanvas);

      const ctx = fallbackCanvas.getContext('2d');
      let t = 0;

      const handleResize = () => {
        if (!container || !fallbackCanvas) return;
        width = container.clientWidth || 800;
        height = container.clientHeight || 480;
        fallbackCanvas.width = width;
        fallbackCanvas.height = height;
      };
      window.addEventListener('resize', handleResize);

      const render2DFallback = () => {
        animId = requestAnimationFrame(render2DFallback);
        if (!ctx) return;
        t += 0.02;

        ctx.clearRect(0, 0, width, height);
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) * 0.28;

        // Outer stationary ring (Purple #a200ff)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.strokeStyle = 'rgba(162, 0, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 3D Projected Rotating Geodesic Sphere
        const rotY = t * 0.4;
        const rotX = Math.sin(t * 0.25) * 0.22;
        const phi = (1 + Math.sqrt(5)) / 2;
        const rawVerts: [number, number, number][] = [
          [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
          [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
          [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1]
        ];
        const globeR = 48;
        const normVerts = rawVerts.map(([vx, vy, vz]) => {
          const l = Math.sqrt(vx * vx + vy * vy + vz * vz);
          return [(vx / l) * globeR, (vy / l) * globeR, (vz / l) * globeR];
        });

        const projVerts = normVerts.map(([x0, y0, z0]) => {
          const x1 = x0 * Math.cos(rotY) + z0 * Math.sin(rotY);
          const z1 = -x0 * Math.sin(rotY) + z0 * Math.cos(rotY);
          const y2 = y0 * Math.cos(rotX) - z1 * Math.sin(rotX);
          const z2 = y0 * Math.sin(rotX) + z1 * Math.cos(rotX);
          return { x: cx + x1, y: cy + y2, z: z2 };
        });

        // Inner glowing core with specular gradient
        const coreGrad = ctx.createRadialGradient(cx - 12, cy - 12, 3, cx, cy, 50);
        coreGrad.addColorStop(0, '#00f0ff');
        coreGrad.addColorStop(0.25, '#082f49');
        coreGrad.addColorStop(0.7, '#020617');
        coreGrad.addColorStop(1, '#000000');
        ctx.beginPath();
        ctx.arc(cx, cy, 44, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 25;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw 3D Geodesic Edges
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
              ctx.strokeStyle = `rgba(0, 240, 255, ${alpha.toFixed(2)})`;
              ctx.lineWidth = 1.1;
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
            ctx.arc(v.x, v.y, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });

        // Orbiting Satellite Nodes (Polished Obsidian Shading)
        const numSatellites = 6;
        for (let i = 0; i < numSatellites; i++) {
          const ang = t * 0.45 + (i / numSatellites) * Math.PI * 2;
          const sx = cx + Math.cos(ang) * (radius * 1.05);
          const sy = cy + Math.sin(ang) * (radius * 0.45);

          // Connection line
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = i === 2 ? 'rgba(0, 240, 255, 0.4)' : 'rgba(0, 240, 255, 0.18)';
          ctx.lineWidth = i === 2 ? 1.5 : 1;
          ctx.stroke();

          // Specular Shaded Sphere
          const nodeGrad = ctx.createRadialGradient(sx - 3, sy - 3, 1, sx, sy, 10);
          if (i === 2) {
            nodeGrad.addColorStop(0, '#ffffff');
            nodeGrad.addColorStop(0.2, '#00f0ff');
            nodeGrad.addColorStop(0.8, '#083344');
            nodeGrad.addColorStop(1, '#020617');
          } else {
            nodeGrad.addColorStop(0, '#93c5fd');
            nodeGrad.addColorStop(0.2, '#1e293b');
            nodeGrad.addColorStop(0.8, '#0f172a');
            nodeGrad.addColorStop(1, '#020617');
          }

          ctx.beginPath();
          ctx.arc(sx, sy, 7.5, 0, Math.PI * 2);
          ctx.fillStyle = nodeGrad;
          ctx.shadowColor = i === 2 ? '#00f0ff' : '#38bdf8';
          ctx.shadowBlur = i === 2 ? 14 : 5;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      };
      render2DFallback();

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
        try {
          if (fallbackCanvas && fallbackCanvas.parentNode) {
            fallbackCanvas.parentNode.removeChild(fallbackCanvas);
          }
        } catch {
          // ignore
        }
      };
    }
  }, []);

  return (
    <section id="cockpit" className="w-full py-16 sm:py-20 lg:py-24 px-6 bg-[#030305] relative overflow-hidden">
      {/* Background Radiance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#00f0ff]/05 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-xs font-bold uppercase tracking-widest font-mono">
              {isAuthenticated ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live Production Cockpit</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span>3D Spatial Computing Simulation</span>
                </>
              )}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Interactive Spatial <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#a200ff] to-[#ff0055]">
                Computing Viewport
              </span>
            </h2>
            <p className="text-gray-300 text-sm sm:text-base max-w-xl leading-relaxed">
              {isAuthenticated
                ? 'Your active 3D spatial development cockpit. Full WebGL neural matrix and live cluster controls are enabled.'
                : 'Interactive 3D spatial simulation. Explore real-time WebGL neural matrix shaders and dynamic telemetry.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/cockpit"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity shadow-[0_0_25px_rgba(0,240,255,0.3)] cursor-pointer"
              >
                <Maximize2 className="w-4 h-4 text-black stroke-[2.5]" />
                <span>Launch Fullscreen 3D Cockpit</span>
                <ArrowUpRight className="w-4 h-4 text-black" />
              </Link>
            ) : (
              <Link
                to="/login"
                state={{ from: '/cockpit', featureName: '3D Spatial Cockpit', requireLoginFirst: true }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-[#00f0ff]/30 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span>Unlock Fullscreen Cockpit</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#00f0ff]" />
              </Link>
            )}
          </div>
        </div>

        {/* The Cockpit Frame */}
        <div className="relative rounded-3xl bg-[#080812]/90 border border-white/10 shadow-[0_0_80px_rgba(0,240,255,0.1)] backdrop-blur-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="h-14 px-6 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              </div>
              <span className="text-xs font-mono font-bold text-white tracking-wider ml-2">
                {isAuthenticated
                  ? 'NEXGEN :: COCKPIT_VIEWPORT // LIVE PRODUCTION [ROOT ADMIN]'
                  : 'NEXGEN :: COCKPIT SIMULATION // LIVE VIEWPORT (INTERACTIVE)'}
              </span>
            </div>

            {isAuthenticated && (
              <div className="flex items-center gap-3">
                <Link
                  to="/cockpit"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#00f0ff] transition-colors"
                >
                  <span>Full Cockpit</span>
                  <Maximize2 className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Embedded 3D Canvas + Overlay Controls */}
          <div className="relative h-[480px] w-full">
            {/* Three.js Canvas */}
            <div ref={containerRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

            {/* Simulation Active Watermark Badge when Unauthenticated */}
            {!isAuthenticated && (
              <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-white/15 backdrop-blur-md pointer-events-none text-[10px] font-mono text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
                <span>LIVE COCKPIT · SIMULATION ACTIVE</span>
              </div>
            )}

            {/* Left Overlay: Telemetry Metrics */}
            <div className="absolute top-4 left-4 z-10 w-60 hidden md:block space-y-2 pointer-events-none">
              <div className="p-3.5 rounded-2xl bg-[#080812]/80 border border-white/10 backdrop-blur-xl space-y-1.5 shadow-xl">
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                  <span>BUS LATENCY</span>
                  <span className="text-emerald-400 font-bold">&lt;0.28ms</span>
                </div>
                <div className="text-xl font-black font-mono text-[#00f0ff]">&lt;1 ms</div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-[#00f0ff] h-full w-4/5 animate-pulse" />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#080812]/80 border border-white/10 backdrop-blur-xl space-y-1 shadow-xl">
                <div className="text-[10px] font-mono text-gray-400">ENCRYPTION PROTOCOL</div>
                <div className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> AES-256-GCM Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CockpitSection;
