export class AudioReactivity {
  context: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  dataArray: Uint8Array | null = null;

  async init() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const source = this.context.createMediaStreamSource(stream);
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 256; // 128 bins
      
      source.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      
      console.log('AudioReactivity initialized successfully');
    } catch (e) {
      console.warn('Audio Context access denied or not available:', e);
    }
  }

  getFrequencyData(): number {
    if (!this.analyser || !this.dataArray) return 0;
    this.analyser.getByteFrequencyData(this.dataArray as any);
    
    // Return average of lower frequencies (bass/beats)
    let sum = 0;
    for (let i = 0; i < 20; i++) {
      sum += this.dataArray[i];
    }
    return sum / 20.0;
  }
}
