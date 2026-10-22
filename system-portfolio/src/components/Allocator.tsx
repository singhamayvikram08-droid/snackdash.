import React, { useState } from 'react';
import { Database, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface MemoryBlock {
  id: string;
  size: number; // in KB
  isFree: boolean;
  offset: number;
}

const HEAP_SIZE = 1024; // 1 MB / 1024 KB

const Allocator: React.FC = () => {
  const [blocks, setBlocks] = useState<MemoryBlock[]>([
    { id: 'initial', size: HEAP_SIZE, isFree: true, offset: 0 }
  ]);
  const [allocationSize, setAllocationSize] = useState<number>(64);
  const [logs, setLogs] = useState<string[]>(['Heap initialized (1024 KB)']);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 10));
  };

  const allocate = () => {
    if (allocationSize <= 0) return;

    const freeBlockIndex = blocks.findIndex(b => b.isFree && b.size >= allocationSize);

    if (freeBlockIndex === -1) {
      addLog(`Error: No free block large enough for ${allocationSize} KB`);
      return;
    }

    const targetBlock = blocks[freeBlockIndex];
    const newBlocks = [...blocks];

    // Create allocated block
    const allocatedBlock: MemoryBlock = {
      id: Math.random().toString(36).substr(2, 9),
      size: allocationSize,
      isFree: false,
      offset: targetBlock.offset
    };

    // Remaining space in the block
    if (targetBlock.size > allocationSize) {
      const remainingBlock: MemoryBlock = {
        id: Math.random().toString(36).substr(2, 9),
        size: targetBlock.size - allocationSize,
        isFree: true,
        offset: targetBlock.offset + allocationSize
      };
      newBlocks.splice(freeBlockIndex, 1, allocatedBlock, remainingBlock);
    } else {
      newBlocks.splice(freeBlockIndex, 1, allocatedBlock);
    }

    setBlocks(newBlocks);
    addLog(`Allocated ${allocationSize} KB at offset ${allocatedBlock.offset}`);
  };

  const free = (id: string) => {
    const blockIndex = blocks.findIndex(b => b.id === id);
    if (blockIndex === -1 || blocks[blockIndex].isFree) return;

    const newBlocks = [...blocks];
    newBlocks[blockIndex].isFree = true;
    addLog(`Freed block at offset ${newBlocks[blockIndex].offset}`);

    // Coalesce blocks
    const finalBlocks: MemoryBlock[] = [];
    let current: MemoryBlock | null = null;

    for (const b of newBlocks) {
      if (current && current.isFree && b.isFree) {
        current.size += b.size;
      } else {
        current = { ...b };
        finalBlocks.push(current);
      }
    }

    setBlocks(finalBlocks);
  };

  const reset = () => {
    setBlocks([{ id: 'initial', size: HEAP_SIZE, isFree: true, offset: 0 }]);
    setLogs(['Heap reset (1024 KB)']);
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Control Panel */}
      <div className="space-y-6">
        <div className="glassmorphism p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-terminal-blue/10 flex items-center justify-center text-terminal-blue">
              <Database size={20} />
            </div>
            <h2 className="text-xl font-bold italic">Malloc Simulator</h2>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Allocation Size (KB)</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={allocationSize}
                onChange={(e) => setAllocationSize(Number(e.target.value))}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-terminal-blue transition-colors font-mono"
              />
              <button 
                onClick={allocate}
                className="bg-terminal-blue hover:bg-terminal-blue/80 text-black font-bold px-4 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-2"
              >
                <Plus size={18} />
                Alloc
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex gap-2">
            <button 
              onClick={reset}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 font-bold px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        {/* Real-time Logs */}
        <div className="glassmorphism p-6 rounded-3xl border border-white/5 flex-1 min-h-[200px]">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Kernel Logs</h3>
          <div className="space-y-2 font-mono text-xs">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2 text-gray-400 animate-in fade-in slide-in-from-left-2 transition-all">
                <span className="text-terminal-blue opacity-50">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Heap Rendering */}
      <div className="lg:col-span-2 glassmorphism rounded-3xl border border-white/5 overflow-hidden flex flex-col p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h3 className="font-bold text-lg">Heap Snapshot</h3>
            <p className="text-gray-500 text-xs">Visualizing 1,048,576 bytes of dynamic storage</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              <div className="w-3 h-3 rounded bg-terminal-blue/20" /> Free
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              <div className="w-3 h-3 rounded bg-terminal-blue shadow-[0_0_12px_rgba(96,165,250,0.5)]" /> Allocated
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-1 overflow-y-auto">
          {blocks.map((block) => (
            <motion.div
              layout
              key={block.id}
              initial={false}
              className={`relative rounded-lg group transition-all duration-300 ${
                block.isFree 
                  ? 'bg-white/5 border border-dashed border-white/10' 
                  : 'bg-terminal-blue shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]'
              }`}
              style={{ height: `${Math.max(40, (block.size / HEAP_SIZE) * 100)}%`, minHeight: '40px' }}
            >
              <div className="absolute inset-0 flex items-center justify-between px-6">
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${block.isFree ? 'text-gray-600' : 'text-black'}`}>
                    {block.size} KB
                  </span>
                  <span className={`text-[10px] font-mono opacity-50 ${block.isFree ? 'text-gray-700' : 'text-black'}`}>
                    0x{block.offset.toString(16).padStart(4, '0')}
                  </span>
                </div>
                
                {!block.isFree && (
                  <button 
                    onClick={() => free(block.id)}
                    className="p-1.5 rounded-lg bg-black/10 hover:bg-black/20 text-black/50 hover:text-black transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Texture overlays for extra "tech" look */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-4 gap-4">
          {[
            { label: 'Total Cap', value: '1024 KB' },
            { label: 'Used', value: `${blocks.filter(b => !b.isFree).reduce((acc, b) => acc + b.size, 0)} KB` },
            { label: 'Blocks', value: blocks.length },
            { label: 'Efficiency', value: '98.2%' },
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{stat.label}</div>
              <div className="text-sm font-bold">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Allocator;
