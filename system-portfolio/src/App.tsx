import React, { useState } from 'react';
import { Terminal, Cpu, Database, LayoutDashboard, Github, Linkedin, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Shell from './components/Shell';
import Allocator from './components/Allocator';
import Kernel from './components/Kernel';

type Project = 'shell' | 'allocator' | 'kernel' | 'dashboard';

const App: React.FC = () => {
  const [activeProject, setActiveProject] = useState<Project>('dashboard');

  const projects = [
    { id: 'shell', name: 'Custom Shell', icon: Terminal, color: 'text-terminal-green' },
    { id: 'allocator', name: 'Memory Allocator', icon: Database, color: 'text-terminal-blue' },
    { id: 'kernel', name: 'Tiny OS Kernel', icon: Cpu, color: 'text-terminal-gold' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-mono selection:bg-terminal-green/30">
      {/* Navigation Sidebar */}
      <nav className="fixed left-0 top-0 h-full w-20 md:w-64 glassmorphism border-r border-white/5 z-50 flex flex-col p-4">
        <div className="flex items-center gap-3 px-2 mb-10 mt-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terminal-blue to-terminal-green flex items-center justify-center font-bold text-black text-sm">
            SL
          </div>
          <span className="hidden md:block font-bold tracking-tight text-lg">System Lab</span>
        </div>

        <div className="flex-1 space-y-2">
          <button
            onClick={() => setActiveProject('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              activeProject === 'dashboard' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="hidden md:block">Dashboard</span>
          </button>

          <div className="py-2">
            <div className="px-3 text-[10px] uppercase tracking-widest text-gray-600 mb-2 hidden md:block">Projects</div>
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProject(p.id as Project)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  activeProject === p.id ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <p.icon size={20} className={activeProject === p.id ? p.color : ''} />
                <span className="hidden md:block">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 px-2">
            <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <Github size={18} className="text-gray-400 hover:text-white" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <Linkedin size={18} className="text-gray-400 hover:text-white" />
            </a>
          </div>
          <div className="hidden md:block px-3 text-[10px] text-gray-600">
            © 2026 System Lab v1.0.0
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pl-20 md:pl-64 min-h-screen pt-4 pr-4 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeProject}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            {activeProject === 'dashboard' && <Dashboard setActiveProject={setActiveProject} />}
            {activeProject === 'shell' && <Shell />}
            {activeProject === 'allocator' && <Allocator />}
            {activeProject === 'kernel' && <Kernel />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const Dashboard: React.FC<{ setActiveProject: (p: Project) => void }> = ({ setActiveProject }) => (
  <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8">
    <header className="space-y-2">
      <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
        Engineering Showcase
      </h1>
      <p className="text-gray-500 text-lg max-w-2xl">
        Exploring the boundaries where hardware meets software. A laboratory for low-level system design and performance optimization.
      </p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { id: 'shell', name: 'Custom Shell', desc: 'Process management, signal handling, and I/O redirection.', icon: Terminal, color: 'border-terminal-green/20 hover:border-terminal-green/50', iconColor: 'text-terminal-green' },
        { id: 'allocator', name: 'Heap Allocator', desc: 'Dynamic memory management, fragmentation control, and alignment.', icon: Database, color: 'border-terminal-blue/20 hover:border-terminal-blue/50', iconColor: 'text-terminal-blue' },
        { id: 'kernel', name: 'OS Kernel', desc: 'Bare-metal programming, GDT setup, and interrupt descriptors.', icon: Cpu, color: 'border-terminal-gold/20 hover:border-terminal-gold/50', iconColor: 'text-terminal-gold' },
      ].map((p) => (
        <button
          key={p.id}
          onClick={() => setActiveProject(p.id as Project)}
          className={`text-left p-6 rounded-2xl glassmorphism border transition-all group scale-100 hover:scale-[1.02] active:scale-[0.98] ${p.color}`}
        >
          <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${p.iconColor}`}>
            <p.icon size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">{p.name}</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            {p.desc}
          </p>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">
            Explore Module <ExternalLink size={12} />
          </div>
        </button>
      ))}
    </div>

    <div className="p-8 rounded-3xl bg-gradient-to-br from-terminal-blue/10 to-transparent border border-white/5 relative overflow-hidden group">
      <div className="relative z-10 space-y-4">
        <h2 className="text-2xl font-bold">Why build these?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-400 leading-relaxed">
          <p>
            Understanding kernels and allocators isn't just about legacy tech. It's about mastering how computers actually work. Every byte of memory you allocate in high-level languages eventually hits these systems.
          </p>
          <p>
            Implementing these tools develops a rigorous approach to logic, edge cases, and performance—skills that are invaluable in any engineering domain.
          </p>
        </div>
      </div>
      <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-terminal-blue/20 blur-[100px] rounded-full group-hover:bg-terminal-blue/30 transition-colors" />
    </div>
  </div>
);

export default App;
