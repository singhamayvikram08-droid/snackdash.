import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Search, HelpCircle } from 'lucide-react';

interface HistoryItem {
  command: string;
  output: string | React.ReactNode;
  timestamp: Date;
  dir: string;
}

const Shell: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [input, setInput] = useState('');
  const [currentDir] = useState('~');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fileSystem: Record<string, any> = {
    '~': {
      'projects': {
        'shell.c': '#include <stdio.h>\n\nint main() {\n  printf("Hello from my custom shell!\\n");\n  return 0;\n}',
        'allocator.c': '// Custom malloc implementation\nvoid* my_malloc(size_t size) { ... }',
      },
      'README.md': '# System Lab\nWelcome to the system engineering showcase.',
      'secret.txt': 'The kernel boots at 0x7C00.'
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    const parts = trimmedCmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let output: string | React.ReactNode = '';

    switch (command) {
      case 'help':
        output = (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-terminal-blue">ls [dir]</div><div>List directory contents</div>
            <div className="text-terminal-blue">cd [dir]</div><div>Change directory</div>
            <div className="text-terminal-blue">cat [file]</div><div>Display file contents</div>
            <div className="text-terminal-blue">pwd</div><div>Print working directory</div>
            <div className="text-terminal-blue">clear</div><div>Clear the terminal</div>
            <div className="text-terminal-blue">whoami</div><div>Current user</div>
            <div className="text-terminal-blue">date</div><div>Display current date</div>
          </div>
        );
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'pwd':
        output = `/home/user/${currentDir === '~' ? '' : currentDir.replace('~/', '')}`;
        break;
      case 'whoami':
        output = 'singhamay';
        break;
      case 'date':
        output = new Date().toString();
        break;
      case 'ls':
        const targetDir = args[0] || currentDir;
        if (fileSystem[targetDir]) {
          output = Object.keys(fileSystem[targetDir]).join('  ');
        } else {
          output = `ls: cannot access '${targetDir}': No such file or directory`;
        }
        break;
      case 'cat':
        const file = args[0];
        if (!file) {
          output = 'cat: missing operand';
        } else if (fileSystem['~'][file]) {
          output = <pre className="whitespace-pre-wrap font-mono text-gray-300">{fileSystem['~'][file]}</pre>;
        } else {
          output = `cat: ${file}: No such file or directory`;
        }
        break;
      default:
        output = `command not found: ${command}. Type 'help' for assistance.`;
    }

    setHistory([...history, { command: trimmedCmd, output, timestamp: new Date(), dir: currentDir }]);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col glassmorphism rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      {/* Terminal Header */}
      <div className="bg-terminal-header h-12 flex items-center justify-between px-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-terminal-red/50" />
            <div className="w-3 h-3 rounded-full bg-terminal-gold/50" />
            <div className="w-3 h-3 rounded-full bg-terminal-green/50" />
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
            <TerminalIcon size={14} className="text-terminal-green" />
            zsh — 80x24
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <Search size={14} />
          <HelpCircle size={14} />
        </div>
      </div>

      {/* Terminal Body */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-sm terminal-scroll"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="text-terminal-green mb-6">
          <div>System Lab OS [Version 1.0.0]</div>
          <div>(c) 2026 Lab Corp. All rights reserved.</div>
          <div className="mt-2">Type 'help' to see available commands.</div>
        </div>

        {history.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-terminal-blue">➜</span>
              <span className="text-terminal-green">{item.dir}</span>
              <span className="text-white">{item.command}</span>
            </div>
            <div className="pl-6 text-gray-400">{item.output}</div>
          </div>
        ))}

        <div className="flex items-center gap-2">
          <span className="text-terminal-blue">➜</span>
          <span className="text-terminal-green">{currentDir}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCommand(input);
            }}
            className="flex-1 bg-transparent border-none outline-none text-white focus:ring-0 p-0"
            autoFocus
          />
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="bg-terminal-header/50 h-8 flex items-center px-6 text-[10px] text-gray-600 gap-6 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-terminal-green shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
          SYSTEM_READY
        </div>
        <div>UTF-8</div>
        <div className="flex-1 text-right">Line 1, Col 1</div>
      </div>
    </div>
  );
};

export default Shell;
