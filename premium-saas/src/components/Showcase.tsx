import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Pause, Zap, Cpu, Volume2, VolumeX, ZoomIn, ZoomOut
} from 'lucide-react';

const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  duration: 5 + ((i * 3) % 5),
  delay: (i * 0.4) % 3,
  left: `${10 + ((i * 7) % 80)}%`,
  top: `${20 + ((i * 5) % 60)}%`,
  tz: (i * 2) % 30,
}));

const NeuralGrid3D = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 3D Grid Planes */}
      <div className="absolute inset-0 neural-grid opacity-20 [transform:rotateX(60deg)_translateZ(-50px)]" />
      <div className="absolute inset-0 neural-grid opacity-10 [transform:rotateX(60deg)_translateZ(50px)]" />
      
      {/* Volumetric Data Points */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          animate={{ 
            y: [0, -25, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: p.duration, 
            repeat: Infinity, 
            delay: p.delay 
          }}
          className="absolute w-1 h-1 bg-[#00f0ff] rounded-full blur-[2px]"
          style={{ 
            left: p.left, 
            top: p.top,
            transform: `translateZ(${p.tz}px)` 
          }}
        />
      ))}
    </div>
  );
};

const Showcase = () => {
  // Inline Video State (Playing inside container only, no modal popup)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [videoMeta, setVideoMeta] = useState<{ width: number; height: number; is4K: boolean } | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const userManuallyPaused = useRef(false);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const width = videoRef.current.videoWidth;
      const height = videoRef.current.videoHeight;
      setVideoMeta({
        width,
        height,
        is4K: width >= 3840 || height >= 2160,
      });
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = ratio * videoRef.current.duration;
      setProgress(ratio * 100);
    }
  };

  // Play as user comes to that part, stop when user scrolls away
  useEffect(() => {
    const container = playerContainerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // User arrived at that part: resume playing if not manually paused
            if (!userManuallyPaused.current && video.paused) {
              video.muted = isMuted;
              video.play().then(() => {
                setIsPlaying(true);
              }).catch(() => {
                video.muted = true;
                setIsMuted(true);
                video.play().then(() => setIsPlaying(true)).catch(() => {});
              });
            }
          } else {
            // User scrolled away from that part: pause video to preserve resources
            if (!video.paused) {
              video.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      {
        threshold: 0.08,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [isMuted]);

  // Auto zoom out when user scrolls down while in zoomed mode
  useEffect(() => {
    if (!isZoomed) return;

    let lastScrollY = window.scrollY;

    const handleWindowScroll = () => {
      const currentScrollY = window.scrollY;
      // If user scrolls down by more than 15px, auto zoom out
      if (currentScrollY > lastScrollY + 15) {
        setIsZoomed(false);
      } else if (currentScrollY < lastScrollY - 20) {
        lastScrollY = currentScrollY;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Direct mousewheel / trackpad downward gesture triggers auto zoom out
      if (e.deltaY > 15) {
        setIsZoomed(false);
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      // Swiping finger up scrolls down
      if (touchStartY - touchY > 20) {
        setIsZoomed(false);
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isZoomed]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userManuallyPaused.current = false;
      // Only restart from 0 if already ended or near very end
      if (video.ended || (video.duration && video.currentTime >= video.duration - 0.25)) {
        video.currentTime = 0;
        setProgress(0);
      }
      video.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Playback request failed, retrying muted:', err);
        video.muted = true;
        setIsMuted(true);
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      });
    } else {
      userManuallyPaused.current = true;
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoError = () => {
    console.warn('Showcase video element error, attempting seamless recovery...');
    const video = videoRef.current;
    if (!video) return;
    const currentTime = video.currentTime || 0;
    video.load();
    video.currentTime = currentTime;
    video.muted = true;
    setIsMuted(true);
    video.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const handleStalled = () => {
    const video = videoRef.current;
    if (video && video.paused && !userManuallyPaused.current) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleEnded = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      setProgress(0);
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const toggleZoom = () => {
    setIsZoomed((prev) => !prev);
  };

  // Keyboard shortcut: Esc to exit zoom view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZoomed) {
        setIsZoomed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed]);

  return (
    <section id="showcase" className="w-full py-16 sm:py-20 lg:py-24 px-6 relative bg-[#030305] overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-xs font-bold uppercase tracking-widest mb-3 font-mono">
            <Cpu className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Neural Engine :: Live Mesh Cam</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-tight text-white">
            SPATIAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#a200ff] to-[#ff0055]">COMPUTING</span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            Interact with the core simulation in real-time. Our spatial engine redefines the boundaries of virtual architecture.
          </p>
        </div>

        {/* The Vault Container: Interactive Inline Video Player with dynamic sizing */}
        <div
          className={`relative group mx-auto transition-all duration-500 ease-in-out ${
            isZoomed ? 'max-w-7xl' : 'max-w-4xl lg:max-w-5xl'
          }`}
        >
          {/* Video Wrapper: Strict containment, rounded corners, hardware-accelerated clipping, true dark base */}
          <div
            ref={playerContainerRef}
            className="relative w-full aspect-video rounded-2xl sm:rounded-3xl border border-white/15 bg-black overflow-hidden shadow-2xl group isolate"
            style={{
              transform: 'translateZ(0)',
              borderRadius: '1.5rem',
            }}
          >
            {/* Direct Inline Video: 4K 60 FPS Capable with Multi-Source Fallbacks */}
            <video
              ref={videoRef}
              src="/mkv.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onError={handleVideoError}
              onStalled={handleStalled}
              onWaiting={handleStalled}
              onEnded={handleEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover object-center block pointer-events-auto cursor-pointer rounded-[inherit] overflow-hidden"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                borderRadius: 'inherit',
                transform: 'translateZ(0)',
              }}
            >
              {/* Primary Spatial Cockpit Neural Stream (mkv.mkv clean watermark-free) */}
              <source src="/mkv.mp4" type="video/mp4" />
              <source src="/mkv.mkv" type="video/x-matroska" />
              <source src="/mkv.mkv" />
              <source src="/showcase_mesh.mp4" type='video/mp4; codecs="avc1.64002a"' />
              <source src="/nextgen.mp4" type="video/mp4" />
              <source src="/video%20nextgen.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Scanning Light Effect: Strictly confined inside container bounds */}
            <motion.div 
              animate={{ top: ['0%', '75%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-1/4 bg-gradient-to-b from-transparent via-[#00f0ff15] to-transparent z-10 pointer-events-none"
            />

            {/* Subtle Ambient Depth Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none rounded-[inherit]" />

            {/* 3D Neural Grid Overlay - Bound within container frame */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
              <NeuralGrid3D />
            </div>

            {/* Top HUD Telemetry Bar inside Container */}
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
                <div className="p-2 sm:p-2.5 rounded-xl bg-black/75 border border-[#00f0ff]/30 backdrop-blur-xl shadow-lg">
                  <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-[#00f0ff]" />
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-[#00f0ff]">
                    SPATIAL COMPUTING
                  </div>
                  <div className="text-xs sm:text-sm font-black text-white font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      {videoMeta?.is4K ? '4K UHD @ 60FPS ACTIVE' : 'LIVE STREAM ACTIVE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Right Stability Indicator */}
            <div className="absolute bottom-16 sm:bottom-20 right-4 sm:right-6 hidden sm:flex items-center gap-3 text-[#ff0055] text-right pointer-events-none z-10">
              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] font-mono font-bold text-[#ff0055]/80">Mesh Routing</div>
                <div className="text-xs sm:text-sm font-black font-mono tracking-tight text-white">99.8% STABLE</div>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-black/70 border border-[#ff0055]/30 backdrop-blur-xl">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff0055]" />
              </div>
            </div>

            {/* Sleek Interactive Progress Bar inside the container frame */}
            <div 
              onClick={handleProgressClick}
              className="absolute bottom-0 left-0 right-0 h-1 sm:h-1.5 bg-white/10 hover:h-2 z-30 transition-all cursor-pointer overflow-hidden pointer-events-auto rounded-b-[inherit]"
              title="Seek playback"
              role="slider"
              aria-label="Video Progress"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div 
                className="h-full bg-gradient-to-r from-[#00f0ff] via-[#a200ff] to-[#ff0055] transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Bottom Controls inside the Card */}
            <div className="absolute bottom-1 left-0 right-0 z-20 p-3 sm:p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex items-center justify-between pointer-events-auto rounded-b-[inherit]">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center justify-center backdrop-blur-md"
                  title={isPlaying ? 'Pause' : 'Play'}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>

                {/* Prominent Mute / Unmute Button on bottom */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-mono text-[11px] sm:text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg backdrop-blur-md active:scale-95 ${
                    isMuted
                      ? 'bg-rose-500/25 hover:bg-rose-500/40 border border-rose-500/60 text-rose-300'
                      : 'bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-500/60 text-emerald-300'
                  }`}
                  title={isMuted ? 'Click to Unmute Audio' : 'Click to Mute Audio'}
                  aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
                      <span className="font-bold tracking-wider uppercase text-[11px] sm:text-xs">Unmute</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0 animate-pulse" />
                      <span className="font-bold tracking-wider uppercase text-[11px] sm:text-xs text-emerald-400">Mute</span>
                    </>
                  )}
                </button>
              </div>

              {/* Single Zoom In / Zoom Out Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleZoom}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-mono text-[11px] sm:text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg backdrop-blur-md active:scale-95 ${
                    isZoomed
                      ? 'bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 border border-[#00f0ff]/60 text-[#00f0ff]'
                      : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white hover:text-[#00f0ff] hover:border-[#00f0ff]/40'
                  }`}
                  title={isZoomed ? 'Zoom Out to Compact View (Esc)' : 'Zoom In to Expanded View'}
                  aria-label={isZoomed ? 'Zoom Out' : 'Zoom In'}
                >
                  {isZoomed ? (
                    <>
                      <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00f0ff] shrink-0" />
                      <span className="font-bold tracking-wider uppercase text-[11px] sm:text-xs text-[#00f0ff]">Zoom Out</span>
                    </>
                  ) : (
                    <>
                      <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                      <span className="font-bold tracking-wider uppercase text-[11px] sm:text-xs">Zoom In</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;
