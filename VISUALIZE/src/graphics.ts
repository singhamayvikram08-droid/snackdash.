import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';

// Shader for the background liquid/plasma
const fluidVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fluidFragmentShader = `
uniform float time;
uniform float audioData;
uniform vec2 distortionPoint;
uniform float distortionIntensity;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  
  // Basic distortion wave from hand point
  float dist = distance(uv, distortionPoint);
  float wave = sin(dist * 20.0 - time * 5.0) * distortionIntensity * exp(-dist * 5.0);
  
  // Fluid like noise
  float noise = sin(uv.x * 10.0 + time) * cos(uv.y * 10.0 + time);
  
  // Color generation: Cyberpunk theme (Blue + Pink + Purple)
  vec3 color1 = vec3(0.0, 0.94, 1.0); // Cyan
  vec3 color2 = vec3(1.0, 0.0, 0.33); // Pink
  vec3 color3 = vec3(0.1, 0.0, 0.5);  // Deep Purple
  
  float mixVal = sin(uv.y * 5.0 + noise + audioData * 0.05 + wave) * 0.5 + 0.5;
  vec3 finalColor = mix(color1, color2, mixVal);
  finalColor = mix(color3, finalColor, 0.6); // Darken a bit
  
  gl_FragColor = vec4(finalColor * 0.3, 1.0); // Kept dark to let particles pop
}
`;

export class GraphicsEngine {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer: THREE.WebGLRenderer;
  composer: EffectComposer;
  rgbShiftPass: ShaderPass;
  
  // Background
  bgMaterial: THREE.ShaderMaterial;
  
  // Particles
  maxParticles = 5000;
  particlesGeometry: THREE.BufferGeometry;
  particlesMaterial: THREE.PointsMaterial;
  particlesSystem: THREE.Points;
  particlePositions: Float32Array;
  particleLifetimes: Float32Array; // Add custom attributes for fade out
  particleVelocities: Float32Array;
  particleColors: Float32Array;
  
  pIndex = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera.position.z = 20;

    // Background setup removed or made extremely transparent so the actual video feed is clearly visible!
    // We will keep bgMaterial around just to not break update() references, but not add it to the scene.
    const bgGeometry = new THREE.PlaneGeometry(2, 2);
    this.bgMaterial = new THREE.ShaderMaterial({
      vertexShader: fluidVertexShader,
      fragmentShader: fluidFragmentShader,
      uniforms: {
        time: { value: 0 },
        audioData: { value: 0 },
        distortionPoint: { value: new THREE.Vector2(0.5, 0.5) },
        distortionIntensity: { value: 0.0 }
      },
      depthWrite: false,
      depthTest: false,
      transparent: true,
      opacity: 0.1 // Barely visible, but you could omit the object from scene entirely.
    });
    // Omitting from scene so camera feed is perfectly clear.
    // this.scene.add(bgMesh);

    // Particles setup
    this.particlePositions = new Float32Array(this.maxParticles * 3);
    this.particleLifetimes = new Float32Array(this.maxParticles);
    this.particleVelocities = new Float32Array(this.maxParticles * 3);
    this.particleColors = new Float32Array(this.maxParticles * 3);
    
    this.particlesGeometry = new THREE.BufferGeometry();
    this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    this.particlesGeometry.setAttribute('color', new THREE.BufferAttribute(this.particleColors, 3));
    
    // Create custom soft glowing texture for the particles
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d')!;
    const gradient = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    pCtx.fillStyle = gradient;
    pCtx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(pCanvas);

    // We update particle state directly
    this.particlesMaterial = new THREE.PointsMaterial({
      size: 1.0, // Larger size because the soft texture edges fade aggressively
      map: texture,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.8
    });

    this.particlesSystem = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
    this.scene.add(this.particlesSystem);

    // Post processing
    const renderScene = new RenderPass(this.scene, this.camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.1;
    bloomPass.strength = 1.8; // Bold rich color
    bloomPass.radius = 0.5; // Medium glow

    this.rgbShiftPass = new ShaderPass(RGBShiftShader);
    this.rgbShiftPass.uniforms['amount'].value = 0.0;
    this.rgbShiftPass.uniforms['angle'].value = Math.PI * 0.25; // 45 degree split

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderScene);
    this.composer.addPass(bloomPass);
    this.composer.addPass(this.rgbShiftPass);

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  emitParticle(x: number, y: number, z: number, color: THREE.Color, spread: number = 0.1, pushZ: number = 0) {
    this.particlePositions[this.pIndex * 3] = x;
    this.particlePositions[this.pIndex * 3 + 1] = y;
    this.particlePositions[this.pIndex * 3 + 2] = z;

    this.particleVelocities[this.pIndex * 3] = (Math.random() - 0.5) * spread;
    this.particleVelocities[this.pIndex * 3 + 1] = (Math.random() - 0.5) * spread;
    this.particleVelocities[this.pIndex * 3 + 2] = pushZ + (Math.random() - 0.5) * spread;

    this.particleColors[this.pIndex * 3] = color.r;
    this.particleColors[this.pIndex * 3 + 1] = color.g;
    this.particleColors[this.pIndex * 3 + 2] = color.b;

    this.particleLifetimes[this.pIndex] = 1.0; // Lifetime 1.0 implies fully alive

    this.pIndex = (this.pIndex + 1) % this.maxParticles;
  }

  update(timeMs: number, audioValue: number, openPalmActive: boolean, activeHands: {x:number,y:number,z:number}[] = [], globalSpeed: number = 0) {
    const delta = 0.016; // approx 60fps
    const time = timeMs * 0.001;

    // Update RGB Shift depending on speed
    const currentShift = this.rgbShiftPass.uniforms['amount'].value;
    const targetShift = Math.min(globalSpeed * 0.003, 0.02); // Cap the glitch effect
    this.rgbShiftPass.uniforms['amount'].value += (targetShift - currentShift) * 0.1;

    // Update background uniforms
    this.bgMaterial.uniforms.time.value = time;
    this.bgMaterial.uniforms.audioData.value = audioValue;
    
    // Smoothly adjust distortion intensity
    let currentDistortion = this.bgMaterial.uniforms.distortionIntensity.value;
    let targetDistortion = openPalmActive ? 1.0 : 0.0;
    this.bgMaterial.uniforms.distortionIntensity.value += (targetDistortion - currentDistortion) * 0.1;

    // Gravity Setup
    let repelMidpoint: {x:number,y:number,z:number} | null = null;
    let repelIntensity = 0;
    if (activeHands.length === 2) {
       const dist = Math.sqrt(
           Math.pow(activeHands[0].x - activeHands[1].x, 2) + 
           Math.pow(activeHands[0].y - activeHands[1].y, 2)
       );
       if (dist < 10.0) {
           repelMidpoint = {
               x: (activeHands[0].x + activeHands[1].x) * 0.5,
               y: (activeHands[0].y + activeHands[1].y) * 0.5,
               z: (activeHands[0].z + activeHands[1].z) * 0.5,
           };
           repelIntensity = (10.0 - dist) * 0.08; // Strong pull and swirl
       }
    }

    // Update Particles
    const pos = this.particlesGeometry.attributes.position.array as Float32Array;
    const col = this.particlesGeometry.attributes.color.array as Float32Array;

    for (let i = 0; i < this.maxParticles; i++) {
        if (this.particleLifetimes[i] > 0) {
            // Add Turbulence curl
            const curlX = Math.sin(pos[i*3+1] * 0.5 + time * 3.0) * 0.04;
            const curlY = Math.cos(pos[i*3] * 0.5 + time * 3.0) * 0.04;
            
            // physics update
            pos[i * 3] += this.particleVelocities[i * 3] + curlX;
            pos[i * 3 + 1] += this.particleVelocities[i * 3 + 1] + curlY;
            pos[i * 3 + 2] += this.particleVelocities[i * 3 + 2];
            
            // Gravity effect (if hands are close)
            if (repelMidpoint) {
                const pdx = repelMidpoint.x - pos[i*3];
                const pdy = repelMidpoint.y - pos[i*3+1];
                const pdistSq = pdx*pdx + pdy*pdy;
                if (pdistSq < 40.0 && pdistSq > 0.1) {
                    // Pull inwards AND spiral!
                    pos[i*3] += (pdx * repelIntensity * 0.1) + (pdy * repelIntensity * 0.1);
                    pos[i*3+1] += (pdy * repelIntensity * 0.1) - (pdx * repelIntensity * 0.1);
                }
            }
            
            // fade out
            this.particleLifetimes[i] -= delta * 0.5; // lifespan approx 2 seconds
            
            // shrink/fade visually by adjusting color intensity based on lifetime
            col[i * 3] *= 0.95;
            col[i * 3 + 1] *= 0.95;
            col[i * 3 + 2] *= 0.95;

            if (this.particleLifetimes[i] <= 0) {
               // push far away to hide
               pos[i*3] = 9999;
            }
        }
    }
    this.particlesGeometry.attributes.position.needsUpdate = true;
    this.particlesGeometry.attributes.color.needsUpdate = true;
  }

  render() {
    this.composer.render();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }
}
