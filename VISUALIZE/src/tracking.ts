import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';

export class TrackingEngine {
  handLandmarker!: HandLandmarker;
  video: HTMLVideoElement;
  isRunning: boolean = false;
  lastVideoTime: number = -1;
  results?: HandLandmarkerResult;

  constructor(videoElement: HTMLVideoElement) {
    this.video = videoElement;
  }

  async init() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );
    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 2, // Multi-hand tracking
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not available. Use localhost or HTTPS.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true // Simple barebones request
      });
      
      this.video.srcObject = stream;
      
      return new Promise((resolve, reject) => {
        this.video.onloadedmetadata = () => {
          this.video.play().then(() => {
            this.isRunning = true;
            resolve(true);
          }).catch(e => {
            console.error("Video play failed:", e);
            reject(new Error("Browser blocked video playback. Try adding 'muted' or allowing autoplay."));
          });
        };
      });
    } catch (err) {
      console.error("Camera access failed:", err);
      throw err;
    }
  }

  detect(): HandLandmarkerResult | null {
    if (!this.handLandmarker || !this.isRunning) return null;
    
    let startTimeMs = performance.now();
    if (this.lastVideoTime !== this.video.currentTime) {
      this.lastVideoTime = this.video.currentTime;
      this.results = this.handLandmarker.detectForVideo(this.video, startTimeMs);
    }
    return this.results || null;
  }
}
