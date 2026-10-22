import React, { useState, useEffect } from 'react';
import { Cpu, Wind, ShieldCheck, Activity, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const bootLogs = [
  { msg: "BIOS 1.0.4 starting...", delay: 200, color: "text-gray-500" },
  { msg: "Memory Check: 640KB Base, 1024MB Extended - OK", delay: 800, color: "text-gray-500" },
  { msg: "Booting from Disk 0, Partition 1...", delay: 500, color: "text-terminal-blue" },
  { msg: "Loading Kernel image at 0x100000...", delay: 1000, color: "text-terminal-blue" },
  { msg: "Setting up Global Descriptor Table (GDT)...", delay: 400, color: "text-terminal-gold" },
  { msg: "Initializing Interrupt Descriptor Table (IDT)...", delay: 300, color: "text-terminal-gold" },
  { msg: "Enabling A20 Line...", delay: 200, color: "text-terminal-gold" },
  { msg: "Switching to Protected Mode...", delay: 600, color: "text-terminal-red font-bold" },
  { msg: "Kernel Paging enabled (4KB pages)...", delay: 800, color: "text-terminal-gold" },
  { msg: "Initializing scheduler (Round Robin)...", delay: 500, color: "text-terminal-gold" },
  { msg: "Spawning PID 1 (init)...", delay: 400, color: "text-terminal-green" },
  { msg: "System Ready. Welcome to MicroOS v0.1.", delay: 500, color: "text-terminal-green font-bold text-lg" },
];

const Kernel: React.FC = () => {
  const [logs, setLogs] = useState<typeof bootLogs>([]);
  const [isBooting, setIsBooting] = useState(false);
  const [registers, setRegisters] = useState({
    eax: '0x00000000',
    ebx: '0x00000000',
    ecx: '0x00000000',
    edx: '0x00000000',
    esp: '0x0007FFFF',
    eip: '0x00100000',
  });

  const startBoot = () => {
    setIsBooting(true);
    setLogs([]);
    let totalDelay = 0;
    
    bootLogs.forEach((log, index) => {
      totalDelay += log.delay;
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
        // Randomly update registers during boot
        setRegisters({
          eax: `0x${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0')}`,
          ebx: `0x${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0')}`,
          ecx: `0x${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0')}`,
          edx: `0x${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0')}`,
          esp: `0x0007${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}`,
          eip: `0x0010${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}`,
        });
        if (index === bootLogs.length - 1) setIsBooting(false);
      }, totalDelay);
    });
  };

  useEffect(() => {
    startBoot();
  }, []);

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* CPU State Cards */}
        {Object.entries(registers).map(([key, value]) => (
          <div key={key} className="glassmorphism p-4 rounded-2xl border border-white/5 space-y-1">
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
              <Zap size={10} className="text-terminal-gold" />
              {key}
            </div>
            <div className="font-mono text-sm text-gray-300">{value}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Boot Sequence Terminal */}
        <div className="glassmorphism rounded-3xl border border-white/5 overflow-hidden flex flex-col p-8 bg-black">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-terminal-gold">
                <Cpu size={20} />
              </div>
              <div>
                <h2 className="font-bold">System Console</h2>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">tty0 /dev/console</p>
              </div>
            </div>
            {!isBooting && (
              <button 
                onClick={startBoot}
                className="text-xs text-terminal-gold hover:text-white transition-colors flex items-center gap-2"
              >
                <Wind size={14} /> Reboot
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs">
            <AnimatePresence>
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`${log.color}`}
                >
                  <span className="opacity-30 mr-2">{i.toString().padStart(4, '0')}</span>
                  {log.msg}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* System Diagnostics */}
        <div className="grid grid-rows-2 gap-6">
          <div className="glassmorphism rounded-3xl border border-white/5 p-8 relative overflow-hidden">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Security Context</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-terminal-green" size={20} />
                  <span className="text-sm font-bold">Ring 0 Access Control</span>
                </div>
                <div className="px-2 py-1 rounded bg-terminal-green/20 text-terminal-green text-[10px] font-bold">ACTIVE</div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                The kernel is running in Supervisor Mode. All hardware interrupts are being handled by the IDT at address 0x00104000.
              </p>
            </div>
            <div className="absolute bottom-[-20%] right-[-10%] w-32 h-32 bg-terminal-gold/10 blur-3xl rounded-full" />
          </div>

          <div className="glassmorphism rounded-3xl border border-white/5 p-8 relative overflow-hidden">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Process Scheduler</h3>
            <div className="flex items-end gap-2 h-24 mb-4">
              {[40, 70, 45, 90, 65, 30, 85, 50, 60, 40].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 + Math.random() }}
                  className="flex-1 bg-terminal-blue/20 rounded-t-sm"
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Activity className="text-terminal-blue" size={16} />
              <span className="text-xs font-bold text-gray-400">Context Switching: 450/sec</span>
            </div>
            <div className="absolute bottom-[-20%] right-[-10%] w-32 h-32 bg-terminal-blue/10 blur-3xl rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kernel;
