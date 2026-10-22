import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HeroCockpitGlobeProps {
  className?: string;
}

export const HeroCockpitGlobe: React.FC<HeroCockpitGlobeProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const waveBarsRef = useRef<HTMLDivElement>(null);
  const statusLabelRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLDivElement>(null);

  // 3D Globe with Touch-Hold-Only Rotation & Dynamic Spatial Audio Wave Modulation
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 340;

    let renderer: THREE.WebGLRenderer | null = null;
    let fallbackCanvas: HTMLCanvasElement | null = null;
    let animId: number;

    // Helper to update HUD spatial audio equalizer bars in real time without React re-renders
    const updateHudWaves = (frame: number, rotationEnergy: number, isDraggingActive: boolean = false) => {
      if (waveBarsRef.current) {
        const bars = waveBarsRef.current.children;
        const barCount = bars.length;
        const active = rotationEnergy > 0.1;

        for (let b = 0; b < barCount; b++) {
          const el = bars[b] as HTMLElement;
          if (!el) continue;
          if (active) {
            // Highly dynamic traveling wave surging in response to rotation
            const wave = Math.sin(frame * 0.22 + b * 0.52);
            const dynamicH = 5 + Math.abs(wave) * 16 * Math.min(1.4, rotationEnergy);
            el.style.height = `${dynamicH.toFixed(1)}px`;
            el.style.opacity = '1';
            el.style.filter = 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.85))';
          } else {
            // Calm resting idle state
            const idleH = 4 + (b % 3) * 1.5;
            el.style.height = `${idleH}px`;
            el.style.opacity = '0.35';
            el.style.filter = 'none';
          }
        }

        if (statusLabelRef.current) {
          statusLabelRef.current.textContent = isDraggingActive ? 'SPATIAL AUDIO :: SURGE' : 'SPATIAL AUDIO ACTIVE';
          statusLabelRef.current.className =
            'text-[10px] font-bold text-[#00f0ff] tracking-wider drop-shadow-[0_0_8px_rgba(0,240,255,0.9)] scale-105 transition-all duration-150';
        }

        if (subtextRef.current) {
          subtextRef.current.textContent = isDraggingActive
            ? '360° DOLBY BINAURAL · INTERACTIVE'
            : '360° DOLBY BINAURAL · LIVE ROTATION';
          subtextRef.current.className = 'text-[8px] text-[#00f0ff]/80 tracking-tight font-medium';
        }
      }
    };

    // Check if WebGL context can actually be created
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
      if (gl) {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);
      }
    } catch {
      renderer = null;
    }

    if (renderer) {
      // ── MODE A: WebGL Three.js Hardware Pipeline ──────────────────────────
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 6.4);
      camera.lookAt(0, 0, 0);

      const ambientLight = new THREE.AmbientLight(0x091428, 1.8);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 2.8);
      dirLight.position.set(5, 8, 6);
      scene.add(dirLight);

      const pointCyan = new THREE.PointLight(0x00f0ff, 4.0, 18);
      pointCyan.position.set(0, 0, 2);
      scene.add(pointCyan);

      const pointPurple = new THREE.PointLight(0xa200ff, 2.5, 18);
      pointPurple.position.set(-4, -2, -2);
      scene.add(pointPurple);

      const globeRoot = new THREE.Group();
      globeRoot.rotation.z = (23.4 * Math.PI) / 180;
      scene.add(globeRoot);

      // Inner Core
      const coreGeo = new THREE.SphereGeometry(1.28, 48, 48);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x030a18,
        roughness: 0.2,
        metalness: 0.9,
        emissive: 0x001f3f,
        emissiveIntensity: 0.6,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      globeRoot.add(coreMesh);

      // Lat-Long Wireframe
      const sphereWireGeo = new THREE.SphereGeometry(1.3, 24, 16);
      const sphereWireMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
      });
      const sphereWireMesh = new THREE.Mesh(sphereWireGeo, sphereWireMat);
      globeRoot.add(sphereWireMesh);

      // Geodesic Wireframe
      const icoGeo = new THREE.IcosahedronGeometry(1.58, 2);
      const wireGeo = new THREE.WireframeGeometry(icoGeo);
      const icoMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const icoMesh = new THREE.LineSegments(wireGeo, icoMat);
      globeRoot.add(icoMesh);

      // Neural Vertex Dots
      const dotMat = new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.08,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const vertexPoints = new THREE.Points(icoGeo, dotMat);
      globeRoot.add(vertexPoints);

      // Atmosphere Halo
      const atmoGeo = new THREE.SphereGeometry(1.68, 32, 32);
      const atmoMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.09,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
      globeRoot.add(atmoMesh);

      // Concentric Orbital Rings
      const ringGroup = new THREE.Group();
      scene.add(ringGroup);

      const ringGeo1 = new THREE.RingGeometry(2.35, 2.38, 96);
      const ringMat1 = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });
      const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
      ring1.rotation.x = Math.PI * 0.42;
      ring1.rotation.y = Math.PI * 0.12;
      ringGroup.add(ring1);

      const ringGeo2 = new THREE.RingGeometry(2.65, 2.68, 96);
      const ringMat2 = new THREE.MeshBasicMaterial({
        color: 0xa200ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
      });
      const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
      ring2.rotation.x = Math.PI * 0.58;
      ring2.rotation.y = -Math.PI * 0.18;
      ringGroup.add(ring2);

      // Spatial Audio Acoustic Waves (Radiate outward around the globe during rotation)
      const audioWaveRings: THREE.Mesh[] = [];
      const waveCount = 3;
      for (let w = 0; w < waveCount; w++) {
        const wGeo = new THREE.RingGeometry(1.68, 1.72, 64);
        const wMat = new THREE.MeshBasicMaterial({
          color: 0x00f0ff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
        });
        const wMesh = new THREE.Mesh(wGeo, wMat);
        wMesh.rotation.x = Math.PI * 0.42;
        wMesh.rotation.y = Math.PI * 0.12;
        scene.add(wMesh);
        audioWaveRings.push(wMesh);
      }

      // Touch & Hold Interaction State
      // RULE: The globe ONLY moves when the cursor is touching and holding it!
      let isDragging = false;
      let prevMouseX = 0;
      let prevMouseY = 0;
      let rotationEnergy = 0;

      const domEl = renderer.domElement;
      domEl.style.cursor = 'grab';

      const onPointerDown = (e: PointerEvent) => {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
        domEl.style.cursor = 'grabbing';
        try {
          domEl.setPointerCapture(e.pointerId);
        } catch {
          // ignore pointer capture error
        }
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        // Move globe ONLY while touching and holding
        globeRoot.rotation.y += dx * 0.009;
        globeRoot.rotation.x += dy * 0.006;

        ring1.rotation.z += dx * 0.003;
        // Purple orbital border ring2 remains 100% stationary

        // Soundwave intensity directly scales with rotation
        const speed = Math.sqrt(dx * dx + dy * dy);
        rotationEnergy = Math.min(1.2, rotationEnergy + speed * 0.06 + 0.1);
      };

      const onPointerUp = (e: PointerEvent) => {
        isDragging = false;
        domEl.style.cursor = 'grab';
        try {
          domEl.releasePointerCapture(e.pointerId);
        } catch {
          // ignore release capture error
        }
      };

      domEl.addEventListener('pointerdown', onPointerDown);
      domEl.addEventListener('pointermove', onPointerMove);
      domEl.addEventListener('pointerup', onPointerUp);
      domEl.addEventListener('pointercancel', onPointerUp);

      let frame = 0;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        frame++;

        // CONTINUOUS PLANETARY ROTATION: The globe moves continuously in NEXGEN :: SPATIAL COCKPIT HUD // LIVE PRODUCTION
        globeRoot.rotation.y += 0.0036;

        // Subtle cosmic drift on cyan ring1
        ring1.rotation.z += 0.0012;

        // Purple orbital border ring2 remains 100% stationary (NO rotation applied)

        if (isDragging) {
          // Surge rotation energy while holding and dragging
          rotationEnergy = Math.max(rotationEnergy, 0.75);
        } else {
          // Ambient rotational energy keeps acoustic wave ripples and HUD equalizer active
          rotationEnergy = Math.max(0.35, rotationEnergy * 0.94);
        }

        // Pulse dot vertices subtly
        dotMat.size = 0.075 + Math.sin(frame * 0.05) * 0.012;

        // Dynamic 3D Spatial Audio Wave Ripples around the Globe
        audioWaveRings.forEach((ring, idx) => {
          const waveProgress = (frame * 0.025 + idx * 0.33) % 1;
          const scale = 1.0 + waveProgress * 0.85;
          ring.scale.set(scale, scale, scale);
          const mat = ring.material as THREE.MeshBasicMaterial;
          mat.opacity = (1 - waveProgress) * rotationEnergy * 0.55;
          ring.visible = true;
        });

        // Update Equalizer waves in HUD
        updateHudWaves(frame, rotationEnergy, isDragging);

        renderer?.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!container || !renderer) return;
        width = container.clientWidth || 600;
        height = container.clientHeight || 340;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
        domEl.removeEventListener('pointerdown', onPointerDown);
        domEl.removeEventListener('pointermove', onPointerMove);
        domEl.removeEventListener('pointerup', onPointerUp);
        domEl.removeEventListener('pointercancel', onPointerUp);

        try {
          renderer?.dispose();
          if (domEl.parentElement === container) {
            container.removeChild(domEl);
          }
        } catch {
          // ignore dispose cleanup error
        }
      };
    } else {
      // ── MODE B: High-Performance 3D Projected 2D Canvas Globe ──────────────
      // 100% Guaranteed to run in ANY environment (Headless, Software, Legacy)
      fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = width;
      fallbackCanvas.height = height;
      fallbackCanvas.className = 'w-full h-full block cursor-grab active:cursor-grabbing';
      container.appendChild(fallbackCanvas);

      const ctx = fallbackCanvas.getContext('2d');
      let t = 0;
      let rotY = 0;
      let rotX = (23.4 * Math.PI) / 180; // Earth axial tilt

      // Touch & Hold Interaction State
      // RULE: The globe ONLY moves when the cursor is touching and holding it!
      let isDragging = false;
      let prevMouseX = 0;
      let prevMouseY = 0;
      let rotationEnergy = 0;

      const onPointerDown = (e: PointerEvent) => {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
        if (fallbackCanvas) fallbackCanvas.style.cursor = 'grabbing';
        try {
          fallbackCanvas?.setPointerCapture(e.pointerId);
        } catch {
          // ignore capture error
        }
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        // Move globe ONLY while touching and holding
        rotY += dx * 0.009;
        rotX += dy * 0.006;

        const speed = Math.sqrt(dx * dx + dy * dy);
        rotationEnergy = Math.min(1.2, rotationEnergy + speed * 0.06 + 0.1);
      };

      const onPointerUp = (e: PointerEvent) => {
        isDragging = false;
        if (fallbackCanvas) fallbackCanvas.style.cursor = 'grab';
        try {
          fallbackCanvas?.releasePointerCapture(e.pointerId);
        } catch {
          // ignore release capture error
        }
      };

      fallbackCanvas.addEventListener('pointerdown', onPointerDown);
      fallbackCanvas.addEventListener('pointermove', onPointerMove);
      fallbackCanvas.addEventListener('pointerup', onPointerUp);
      fallbackCanvas.addEventListener('pointercancel', onPointerUp);

      const handleResize = () => {
        if (!container || !fallbackCanvas) return;
        width = container.clientWidth || 600;
        height = container.clientHeight || 340;
        fallbackCanvas.width = width;
        fallbackCanvas.height = height;
      };
      window.addEventListener('resize', handleResize);

      // Geodesic 3D icosahedron vertices
      const phi = (1 + Math.sqrt(5)) / 2;
      const rawVerts: [number, number, number][] = [
        [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
        [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
        [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1]
      ];
      const globeRadius = Math.min(width, height) * 0.26;
      const normVerts = rawVerts.map(([vx, vy, vz]) => {
        const l = Math.sqrt(vx * vx + vy * vy + vz * vz);
        return [(vx / l) * globeRadius * 1.25, (vy / l) * globeRadius * 1.25, (vz / l) * globeRadius * 1.25];
      });

      // Background stars
      const starCount = 80;
      const stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.6,
        alpha: Math.random() * 0.5 + 0.2,
      }));

      let frame = 0;
      const render2DFallback = () => {
        animId = requestAnimationFrame(render2DFallback);
        if (!ctx) return;
        frame++;
        t += 0.016;

        // CONTINUOUS PLANETARY ROTATION: The globe moves continuously in NEXGEN :: SPATIAL COCKPIT HUD // LIVE PRODUCTION
        rotY += 0.0036;

        if (isDragging) {
          rotationEnergy = Math.max(rotationEnergy, 0.75);
        } else {
          // Ambient rotational energy keeps acoustic wave ripples active
          rotationEnergy = Math.max(0.35, rotationEnergy * 0.94);
        }

        ctx.clearRect(0, 0, width, height);
        const cx = width / 2;
        const cy = height / 2;

        // Draw Starfield
        stars.forEach(s => {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 240, 255, ${s.alpha})`;
          ctx.fill();
        });

        // Outer Concentric Orbital Rings
        ctx.save();
        ctx.translate(cx, cy);

        // Ring 1 (Dashed Cyan Orbit)
        ctx.save();
        ctx.rotate(-t * 0.2);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.ellipse(0, 0, globeRadius * 1.9, globeRadius * 0.72, Math.PI * 0.12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Ring 2 (Purple Inclined Orbit) - 100% stationary, no rotation
        ctx.save();
        ctx.strokeStyle = 'rgba(162, 0, 255, 0.32)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 8]);
        ctx.beginPath();
        ctx.ellipse(0, 0, globeRadius * 2.2, globeRadius * 0.62, -Math.PI * 0.18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.restore();

        // Draw Expanding Acoustic Spatial Audio Waves when Rotating (purely cyan acoustic wavefronts)
        if (rotationEnergy > 0.02) {
          for (let w = 0; w < 3; w++) {
            const waveProgress = (frame * 0.035 + w * 0.33) % 1;
            const waveR = globeRadius * (1.1 + waveProgress * 0.95);
            const waveAlpha = Math.max(0, (1 - waveProgress) * rotationEnergy * 0.55);
            ctx.strokeStyle = `rgba(0, 240, 255, ${waveAlpha.toFixed(2)})`;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(cx, cy, waveR, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // 3D Projected Rotating Vertices
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

        const projVerts = normVerts.map(([x0, y0, z0]) => {
          const x1 = x0 * cosY + z0 * sinY;
          const z1 = -x0 * sinY + z0 * cosY;
          const y2 = y0 * cosX - z1 * sinX;
          const z2 = y0 * sinX + z1 * cosX;
          return { x: cx + x1, y: cy + y2, z: z2 };
        });

        // Atmosphere Soft Glow
        const atmoGrad = ctx.createRadialGradient(cx, cy, globeRadius * 0.7, cx, cy, globeRadius * 1.35);
        atmoGrad.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
        atmoGrad.addColorStop(0.5, 'rgba(162, 0, 255, 0.12)');
        atmoGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(cx, cy, globeRadius * 1.35, 0, Math.PI * 2);
        ctx.fillStyle = atmoGrad;
        ctx.fill();

        // Central Planetary Core (Deep Luminous Sphere with Specular Highlight)
        const coreGrad = ctx.createRadialGradient(
          cx - globeRadius * 0.3,
          cy - globeRadius * 0.3,
          globeRadius * 0.05,
          cx,
          cy,
          globeRadius * 1.05
        );
        coreGrad.addColorStop(0, '#00f0ff');
        coreGrad.addColorStop(0.2, '#06294d');
        coreGrad.addColorStop(0.65, '#020b18');
        coreGrad.addColorStop(1, '#000206');

        ctx.beginPath();
        ctx.arc(cx, cy, globeRadius, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 24;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Rotating Meridian & Latitude Lines on Globe Surface
        for (let lat = -2; lat <= 2; lat++) {
          if (lat === 0) continue;
          const latRad = (lat * Math.PI) / 6;
          const rLat = globeRadius * Math.cos(latRad);
          const yLat = globeRadius * Math.sin(latRad);
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.14)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(cx, cy + yLat, rLat, rLat * 0.28, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw 3D Geodesic Edges
        for (let i = 0; i < projVerts.length; i++) {
          for (let j = i + 1; j < projVerts.length; j++) {
            const v1 = projVerts[i];
            const v2 = projVerts[j];
            const dx = normVerts[i][0] - normVerts[j][0];
            const dy = normVerts[i][1] - normVerts[j][1];
            const dz = normVerts[i][2] - normVerts[j][2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < globeRadius * 1.45) {
              const alpha = Math.max(0.12, (v1.z + v2.z + globeRadius * 2.5) / (globeRadius * 4.5));
              ctx.strokeStyle = `rgba(0, 240, 255, ${alpha.toFixed(2)})`;
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.moveTo(v1.x, v1.y);
              ctx.lineTo(v2.x, v2.y);
              ctx.stroke();
            }
          }
        }

        // Draw Glowing Neural Vertex Junctions (No floating cluster nodes)
        projVerts.forEach(v => {
          if (v.z > -globeRadius * 0.7) {
            ctx.beginPath();
            ctx.arc(v.x, v.y, 2.4, 0, Math.PI * 2);
            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });

        // Update Equalizer waves in HUD
        updateHudWaves(frame, rotationEnergy, isDragging);
      };

      render2DFallback();

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
        fallbackCanvas?.removeEventListener('pointerdown', onPointerDown);
        fallbackCanvas?.removeEventListener('pointermove', onPointerMove);
        fallbackCanvas?.removeEventListener('pointerup', onPointerUp);
        fallbackCanvas?.removeEventListener('pointercancel', onPointerUp);

        try {
          if (fallbackCanvas && fallbackCanvas.parentNode) {
            fallbackCanvas.parentNode.removeChild(fallbackCanvas);
          }
        } catch {
          // ignore removal error
        }
      };
    }
  }, []);

  return (
    <div className={`relative w-full h-full bg-[#03050d] overflow-hidden select-none ${className}`}>
      {/* 3D Viewport Mount (WebGL or 2D Projected Canvas) */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-10 touch-none" />

      {/* Cyber Subtle Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(3,5,13,0.75)_100%)] pointer-events-none z-15" />

      {/* Top Left HUD Telemetry Readout */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 font-mono pointer-events-none">
        <div className="text-[11px] font-medium text-[#00f0ff]/50 tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />
          <span>NEXGEN SPATIAL CORE :: V2.4</span>
        </div>
        <div className="text-[9px] text-gray-400 mt-0.5 tracking-tight font-normal">
          LATENCY: &lt;0.28ms | BUS: 1.24 TB/s
        </div>
      </div>

      {/* Top Right HUD Telemetry Status Pill (Unmute button removed) */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 font-mono pointer-events-none">
        <div className="px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 text-[10px] text-gray-300 flex items-center gap-1.5 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-wider uppercase text-[#00f0ff] font-semibold">SPATIAL CORE ACTIVE</span>
        </div>
      </div>

      {/* Center Subtle Reticle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-15">
        <div className="w-20 h-20 rounded-full border border-[#00f0ff]/15 flex items-center justify-center">
          <div className="w-1 h-1 bg-[#00f0ff]/40 rounded-full" />
        </div>
      </div>

      {/* Corner Brackets */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#00f0ff]/30 pointer-events-none z-20" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#00f0ff]/30 pointer-events-none z-20" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#00f0ff]/30 pointer-events-none z-20" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#00f0ff]/30 pointer-events-none z-20" />

      {/* Bottom Left: RADAR 360° Scanner (Active Luminescent) */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 font-mono pointer-events-none flex items-end gap-2.5">
        <div className="relative w-12 h-12 rounded-full border border-[#00f0ff]/40 bg-[#00f0ff]/5 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <div className="w-6 h-6 rounded-full border border-[#00f0ff]/20" />
          <div className="w-1 h-1 rounded-full bg-[#00f0ff]" />
          {/* Animated Sweeping Line */}
          <div
            className="absolute inset-0 rounded-full origin-center animate-spin"
            style={{
              animationDuration: '3s',
              background: 'conic-gradient(from 0deg, transparent 70%, rgba(0,240,255,0.4) 100%)',
            }}
          />
        </div>
        <div className="pb-0.5">
          <div className="text-[10px] font-bold text-[#00f0ff] tracking-widest flex items-center gap-1 drop-shadow-[0_0_6px_rgba(0,240,255,0.6)]">
            <span>RADAR 360°</span>
            <span className="text-[8px] text-emerald-400 font-normal">● ACTIVE</span>
          </div>
          <div className="text-[9px] text-gray-400">SPATIAL MESH SYNCHRONIZED</div>
        </div>
      </div>

      {/* Bottom Right: SPATIAL AUDIO ACTIVE Equalizer Spectrum (Moves with Globe Rotation) */}
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 font-mono pointer-events-none flex flex-col items-end gap-1">
        <div ref={waveBarsRef} className="flex items-end gap-1 h-6">
          {[16, 24, 12, 28, 20, 14, 26, 18, 22, 10, 25, 17, 21, 15].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-[#00f0ff] via-[#a200ff] to-[#ff0055] rounded-full transition-[height,opacity] duration-75"
              style={{
                height: `${h}px`,
                opacity: 0.85,
              }}
            />
          ))}
        </div>
        <div
          ref={statusLabelRef}
          className="text-[10px] font-bold text-[#00f0ff] tracking-wider drop-shadow-[0_0_6px_rgba(0,240,255,0.6)]"
        >
          SPATIAL AUDIO ACTIVE
        </div>
        <div ref={subtextRef} className="text-[8px] text-gray-400 tracking-tighter">
          360° DOLBY BINAURAL · 60 FPS
        </div>
      </div>
    </div>
  );
};

export default HeroCockpitGlobe;
