import http from 'http';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vital AI — Autonomous Health Telemetry Engine</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #030712; color: #f9fafb; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between p-6 sm:p-12">
  <div class="max-w-5xl mx-auto w-full space-y-8">
    <!-- Header -->
    <header class="flex items-center justify-between border-b border-white/10 pb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold text-xl">
          ♥
        </div>
        <div>
          <h1 class="text-2xl font-black text-white tracking-tight">VITAL AI</h1>
          <p class="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            NEURAL HEALTH TELEMETRY :: ACTIVE (PORT 3001)
          </p>
        </div>
      </div>
      <a href="http://localhost:5173/dashboard" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all">
        ← Return to NexGen Core
      </a>
    </header>

    <!-- Real-time Vital Telemetry Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
        <div class="text-xs uppercase font-mono text-gray-400">Resting Heart Rate</div>
        <div class="text-3xl font-black text-rose-400 font-mono">68 <span class="text-sm text-gray-400">BPM</span></div>
        <div class="text-[11px] text-emerald-400 font-medium">Optimal Sinus Rhythm</div>
      </div>
      <div class="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
        <div class="text-xs uppercase font-mono text-gray-400">Blood Oxygen (SpO2)</div>
        <div class="text-3xl font-black text-cyan-400 font-mono">99.2 <span class="text-sm text-gray-400">%</span></div>
        <div class="text-[11px] text-emerald-400 font-medium">Peak Arterial Saturation</div>
      </div>
      <div class="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
        <div class="text-xs uppercase font-mono text-gray-400">HRV (SDNN)</div>
        <div class="text-3xl font-black text-purple-400 font-mono">74.5 <span class="text-sm text-gray-400">ms</span></div>
        <div class="text-[11px] text-emerald-400 font-medium">Autonomic Balance: High</div>
      </div>
      <div class="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
        <div class="text-xs uppercase font-mono text-gray-400">Neural Stress Index</div>
        <div class="text-3xl font-black text-amber-400 font-mono">14 <span class="text-sm text-gray-400">/ 100</span></div>
        <div class="text-[11px] text-emerald-400 font-medium">Cognitive Recovery Zone</div>
      </div>
    </div>

    <!-- Live Biosignal Canvas Stream -->
    <div class="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold uppercase tracking-wider text-gray-200 font-mono">Real-Time ECG Telemetry Waveform</h2>
        <span class="text-xs font-mono text-cyan-400">SAMPLE_RATE: 500Hz :: FILTER: BANDPASS</span>
      </div>
      <div class="h-48 w-full bg-black/60 rounded-xl relative overflow-hidden border border-white/5">
        <canvas id="ecgCanvas" class="w-full h-full block"></canvas>
      </div>
    </div>
  </div>

  <footer class="max-w-5xl mx-auto w-full border-t border-white/5 pt-6 mt-12 flex items-center justify-between text-xs text-gray-500 font-mono">
    <span>NexGen Ecosystem Node :: vital-ai-core</span>
    <span>Connected to localhost:3001</span>
  </footer>

  <script>
    const canvas = document.getElementById('ecgCanvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let x = 0;
    let prevY = height / 2;

    window.addEventListener('resize', () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    });

    function draw() {
      x += 2;
      if (x > width) {
        x = 0;
        ctx.clearRect(0, 0, width, height);
      }

      // ECG wave generation simulation
      let y = height / 2;
      const cycle = x % 160;
      if (cycle > 50 && cycle < 60) y -= 15;
      else if (cycle >= 60 && cycle < 70) y += 50;
      else if (cycle >= 70 && cycle < 85) y -= 70;
      else if (cycle >= 85 && cycle < 95) y += 30;
      else if (cycle >= 110 && cycle < 135) y -= 18 * Math.sin((cycle - 110) / 25 * Math.PI);
      else y += (Math.random() - 0.5) * 4;

      ctx.beginPath();
      ctx.moveTo(x - 2, prevY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 8;
      ctx.stroke();

      prevY = y;
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

server.listen(3001, () => {
  console.log('Vital AI Health Engine active on http://localhost:3001');
});
