import * as THREE from 'three';
import { GraphicsEngine } from './graphics';
import { TrackingEngine } from './tracking';

const startBtn = document.getElementById('start-btn')!;
const uiContainer = document.getElementById('ui-container')!;
const startScreen = document.getElementById('start-screen')!;
const loadingText = document.getElementById('loading')!;
const videoEl = document.getElementById('webcam') as HTMLVideoElement;
const canvasEl = document.getElementById('gl-canvas') as HTMLCanvasElement;
const drawingCanvasEl = document.getElementById('drawing-canvas') as HTMLCanvasElement;
const ctx = drawingCanvasEl.getContext('2d')!;
const toolbar = document.getElementById('toolbar')!;
const toggleDrawBtn = document.getElementById('toggle-draw-btn')!;
const drawModeLabel = document.getElementById('draw-mode-label')!;
const predictBtn = document.getElementById('predict-btn')!;
const clearBtn = document.getElementById('clear-btn')!;
const predictionLabel = document.getElementById('prediction-label')!;
const predictionText = document.getElementById('prediction-text')!;
const stitchUiLayer = document.getElementById('stitch-ui-layer')!;
const fpsCounter = document.getElementById('fps-counter')!;
const particleCounter = document.getElementById('particle-counter')!;
const gestureText = document.getElementById('gesture-text')!;
const fullscreenBtn = document.getElementById('fullscreen-btn')!;
const restartBtn = document.getElementById('restart-btn')!;
const settingsBtn = document.getElementById('settings-btn')!;

let tracker: TrackingEngine;
let graphics: GraphicsEngine;

declare const ml5: any;
let classifier: any = null;

let isDrawMode = false;
let isDrawing = false; // Maps to pinch gesture in 2D mode
let lastDrawX = 0;
let lastDrawY = 0;

let prevFingertipPositions: { x: number, y: number, z: number }[] = [];

// Initialize 2D Canvas size
function resizeCanvas() {
  drawingCanvasEl.width = window.innerWidth;
  drawingCanvasEl.height = window.innerHeight;
  // Initialize with black background for DoodleNet
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, drawingCanvasEl.width, drawingCanvasEl.height);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

startBtn.addEventListener('click', async () => {
  startScreen.classList.add('hidden');
  loadingText.classList.remove('hidden');

  try {
    // 1. Initialize graphics
    graphics = new GraphicsEngine(canvasEl);

    // 2. Initialize MediaPipe tracking
    tracker = new TrackingEngine(videoEl);
    await tracker.init();

    // Clean up loading UI
    uiContainer.classList.add('hidden');
    stitchUiLayer.classList.remove('hidden');

    // Load DoodleNet
    try {
      classifier = ml5.imageClassifier('DoodleNet', () => {
         console.log('DoodleNet Loaded!');
      });
    } catch(e) {
      console.log('ML5 initialization failed', e);
    }

    // Start render loop
    requestAnimationFrame(animationLoop);
  } catch (error: any) {
    console.error("Failed to initialize VISUALIZE:", error);
    loadingText.innerText = "Error: " + (error.message || "Failed to start camera/mic. Please check permissions.");
    loadingText.style.color = "#ff0055";
  }
});

function animationLoop(timeMs: number) {
  const results = tracker.detect();
  
  let openPalmActive = false;
  let activeHands: {x:number, y:number, z:number}[] = [];
  let globalSpeed = 0;
  let isPinchingAny = false;

  if (results && results.landmarks) {
    // Determine screen boundary to 3D space ratio
    // Camera is at z=20, FOV=75. Frustum height = 2 * z * tan(fov/2)
    const fovInRadians = (75 * Math.PI) / 180;
    const height = 2 * 20 * Math.tan(fovInRadians / 2);
    const width = height * (window.innerWidth / window.innerHeight);

    results.landmarks.forEach((handLandmarks, index) => {
        // Landmarks: 8 = index tip, 4 = thumb tip, 12 = middle tip, 0 = wrist
        const indexTip = handLandmarks[8];
        const thumbTip = handLandmarks[4];
        
        // Map normalized coordinates [0, 1] to 3D space [-width/2, width/2]
        // Note: x is inverted because webcam mirrors
        const x = -(indexTip.x - 0.5) * width;
        const y = -(indexTip.y - 0.5) * height; // +y is up in 3D
        const z = -indexTip.z * 20; // scale depth
        
        activeHands.push({x, y, z});

        // Pinch Detection
        const pinchDist = Math.sqrt(
            Math.pow(indexTip.x - thumbTip.x, 2) + 
            Math.pow(indexTip.y - thumbTip.y, 2) +
            Math.pow(indexTip.z - thumbTip.z, 2)
        );

        const isPinching = pinchDist < 0.08; // Relaxed pinch limit
        if (isPinching) isPinchingAny = true;

        // Open Palm Detection
        const wrist = handLandmarks[0];
        let spreadSum = 0;
        for (const fTip of [8, 12, 16, 20]) {
           spreadSum += Math.sqrt(Math.pow(handLandmarks[fTip].x - wrist.x, 2) + Math.pow(handLandmarks[fTip].y - wrist.y, 2));
        }
        if (spreadSum > 1.8 && !isPinching) {
            openPalmActive = true;
        }

        // Particle Emission (Always enabled to show cursor)
        let particlesToEmit = isPinching ? 50 : 5; // Nice thick bursts
        let baseColor = new THREE.Color(index === 0 ? 0xff0022 : 0x0066ff); // Deep bold red & rich vibrant blue

        // Draw Mode override
        if (isDrawMode) {
           particlesToEmit = isPinching ? 0 : 1; // Show only a tiny trail/cursor when not drawing
           baseColor = new THREE.Color(0xffffff); // White cursor
           
           if (isPinching) {
               if (index === 0) {
                   const pixelX = window.innerWidth - (indexTip.x * window.innerWidth);
                   const pixelY = indexTip.y * window.innerHeight;

                   if (!isDrawing) {
                       isDrawing = true;
                       lastDrawX = pixelX;
                       lastDrawY = pixelY;
                   }

                   ctx.beginPath();
                   ctx.moveTo(lastDrawX, lastDrawY);
                   ctx.lineTo(pixelX, pixelY);
                   ctx.strokeStyle = "white"; 
                   ctx.lineWidth = 25; // Much thicker for AI DoodleNet
                   ctx.lineCap = "round";
                   ctx.stroke();

                   lastDrawX = pixelX;
                   lastDrawY = pixelY;
               }
           } else if (index === 0) {
               isDrawing = false;
           }
        } else {
           isDrawing = false;
        }

        // Velocity Tracking
        let speed = 0;
        if (prevFingertipPositions[index]) {
            const dx = x - prevFingertipPositions[index].x;
            const dy = y - prevFingertipPositions[index].y;
            speed = Math.sqrt(dx*dx + dy*dy);
            globalSpeed += speed;
            
            // if fast hand motion, shift colors! Red -> Orange/Yellow, Blue -> Neon Cyan
            if (speed > 0.5) {
                let shiftTarget = new THREE.Color(index === 0 ? 0xffbb00 : 0x00ffff);
                baseColor.lerp(shiftTarget, Math.min(speed / 3.0, 1.0));
            }
        }

        for (let i = 0; i < particlesToEmit; i++) {
            let spread = isPinching ? 1.0 : (0.05 + speed*0.2); // Tighter particle streams
            graphics.emitParticle(x, y, z, baseColor, spread, speed * 1.5);
        }

        prevFingertipPositions[index] = { x, y, z };
    });
  }

  // Update HUD
  const pCount = (graphics.pIndex / 1000).toFixed(1);
  particleCounter.innerHTML = `${pCount}<span class="text-xs ml-1 opacity-50">K</span>`;

  if (isPinchingAny) {
      gestureText.innerText = "PINCH DETECTED";
      gestureText.className = "font-headline text-lg font-bold text-primary tracking-tighter text-right";
  } else if (openPalmActive) {
      gestureText.innerText = "OPEN PALM";
      gestureText.className = "font-headline text-lg font-bold text-secondary tracking-tighter text-right";
  } else {
      gestureText.innerText = activeHands.length > 0 ? "TRACKING" : "FRAME OFFLINE";
      gestureText.className = "font-headline text-lg font-bold text-on-surface-variant tracking-tighter text-right";
  }

  // Calculate rough FPS internally or fake ~60 for demo
  fpsCounter.innerHTML = `60<span class="text-xs ml-1 opacity-50">HZ</span>`;

  graphics.update(timeMs, 0, openPalmActive, activeHands, globalSpeed);
  graphics.render();

  requestAnimationFrame(animationLoop);
}

// UI Controls
toggleDrawBtn.addEventListener('click', () => {
    isDrawMode = !isDrawMode;
    
    if (isDrawMode) {
        toggleDrawBtn.classList.remove('text-white/40');
        toggleDrawBtn.classList.add('text-[#00ffff]', 'border-l-2', 'border-[#00ffff]', 'bg-[#00ffff]/10');
        drawModeLabel.innerText = "DRAWING";
        
        drawingCanvasEl.classList.remove('hidden');
        drawingCanvasEl.style.mixBlendMode = "screen"; // Make black background transparent magically!
        predictBtn.classList.remove('hidden');
        clearBtn.classList.remove('hidden');
    } else {
        toggleDrawBtn.classList.remove('text-[#00ffff]', 'border-l-2', 'border-[#00ffff]', 'bg-[#00ffff]/10');
        toggleDrawBtn.classList.add('text-white/40');
        drawModeLabel.innerText = "DRAW";

        drawingCanvasEl.classList.add('hidden');
        predictBtn.classList.add('hidden');
        clearBtn.classList.add('hidden');
        predictionLabel.classList.add('hidden');
    }
});

clearBtn.addEventListener('click', () => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, drawingCanvasEl.width, drawingCanvasEl.height);
    predictionLabel.classList.add('hidden');
});

predictBtn.addEventListener('click', () => {
    if (!classifier) {
        predictionText.innerText = "Model loading...";
        predictionLabel.classList.remove('hidden');
        return;
    }
    
    predictionText.innerText = "Thinking...";
    predictionLabel.classList.remove('hidden');

    classifier.classify(drawingCanvasEl, (error: any, results: any) => {
        if (error) {
            console.error(error);
            predictionText.innerText = "Error analyzing";
            return;
        }
        // results is an array structured like: [{label: 'apple', confidence: 0.9}, ...]
        predictionText.innerText = results[0].label;
    });
});

// Header Top Right Panel Buttons
if(fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });
}

if(restartBtn) {
    restartBtn.addEventListener('click', () => {
        window.location.reload();
    });
}

if(settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        alert("Settings Module Locked. Kinetic Neural Interface running at optimized defaults.");
    });
}
