import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Minimize2, Cpu } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  reasoningTokens?: number;
  timestamp: Date;
}

const KNOWLEDGE_BASE: { keywords: string[]; response: string }[] = [
  {
    keywords: ['price', 'pricing', 'cost', 'plan', 'subscription', 'how much'],
    response: "NexGen is completely free and open for developers. There are no fees, paywalls, or hidden costs — you get full access to the 3D autonomous engine, edge nodes, and neural shaders with zero billing! 🚀"
  },
  {
    keywords: ['feature', 'what can', 'capabilities', 'does it do', 'functionality'],
    response: "NexGen includes: ⚡ **Real-time Processing** (sub-ms latency), 🧠 **Neural Integration** for ML models, 🎨 **Kinetic Layers** for glassmorphic UIs, 🔒 **Enterprise Security**, 🌐 **Global Edge** (300+ CDN nodes), and a full **Developer API** with GraphQL. What would you like to explore?"
  },
  {
    keywords: ['hello', 'hi', 'hey', 'howdy', 'greetings', 'sup', 'yo'],
    response: "Hey there! 👋 I'm **Nex**, your AI assistant for NexGen. I can help you with features, spatial computing, getting started, or any questions you have. What's on your mind?"
  },
  {
    keywords: ['start', 'get started', 'begin', 'sign up', 'register', 'create account'],
    response: "Getting started is easy! Click **'Log In'** in the navigation to create your developer ID and unlock the 3D Cockpit and Dashboard. It's completely **free** — no credit card needed! 🚀"
  },
  {
    keywords: ['enterprise', 'team', 'company', 'business', 'custom'],
    response: "Our **Enterprise plan** includes unlimited API calls, 24/7 SLA support, dedicated global edge nodes, SSO + SAML auth, and on-premises deployment options. Contact our sales team at **sales@nexgen.io** and we'll set up a demo! 🏢"
  },
  {
    keywords: ['api', 'graphql', 'endpoint', 'integrate', 'developer', 'sdk'],
    response: "NexGen exposes a full **GraphQL API** + REST endpoints. We have SDKs for JavaScript, Python, Go, and Rust. Our docs at **docs.nexgen.io** have interactive playgrounds and starter templates. Want me to point you to a specific integration?"
  },
  {
    keywords: ['security', 'safe', 'encrypt', 'gdpr', 'compliance', 'data'],
    response: "Security is a top priority. We offer **end-to-end encryption**, SOC 2 Type II compliance, GDPR-ready data handling, role-based access control, and full audit logs. Enterprise customers also get dedicated private clusters. 🔒"
  },
  {
    keywords: ['performance', 'fast', 'speed', 'latency', 'ms', 'fps'],
    response: "NexGen is built for extreme performance. Our physics engine delivers **sub-millisecond response times**, 60 FPS rendering on WebGL, and global CDN delivery from 300+ edge nodes. Average API latency is under **12ms** globally. ⚡"
  },
  {
    keywords: ['demo', 'example', 'show', 'try', 'test', 'preview'],
    response: "Scroll down to the **Engine** section on this page — there's a live rendering demo! You can also start a free Hobby account to try the API yourself. Want me to walk you through a specific use case?"
  },
  {
    keywords: ['support', 'help', 'contact', 'issue', 'problem', 'bug'],
    response: "For support: 📧 **support@nexgen.io** | 💬 Community Discord | 📖 **docs.nexgen.io**. Pro users get priority chat support and Enterprise customers get a dedicated Slack channel. How can I help right now?"
  },
  {
    keywords: ['refund', 'cancel', 'money back', 'guarantee'],
    response: "We offer a **30-day money-back guarantee** on all paid plans, no questions asked. You can cancel anytime from your dashboard — no hidden fees or lock-in periods. 💚"
  },
  {
    keywords: ['compare', 'vs', 'versus', 'competitor', 'alternative'],
    response: "Compared to alternatives, NexGen offers: **10x faster** WebGL rendering than standard libraries, **built-in neural network** integration (unique!), global edge CDN included in all plans, and no cold-start latency. Want a detailed comparison for a specific use case?"
  },
  {
    keywords: ['thanks', 'thank you', 'appreciate', 'helpful', 'great', 'awesome'],
    response: "You're welcome! 😊 Feel free to come back anytime with questions. If you're ready to build something amazing, hit that **Start Building Now** button! ✨"
  },
];

const FALLBACKS = [
  "That's a great question! For detailed technical answers, check out our docs at **docs.nexgen.io** or reach out to **support@nexgen.io**. Is there something specific about NexGen I can help clarify?",
  "I'm still learning! For that specific query, I'd recommend hitting up our Discord community or sending a note to **support@nexgen.io**. In the meantime, can I help you with pricing, features, or getting started?",
  "Hmm, I don't have a perfect answer for that one. Our team at **support@nexgen.io** would be able to help you much better. Anything else about NexGen I can assist with? 🤖",
];

function getBotResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.response;
    }
  }
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}

function formatMessage(text: string) {
  // Bold **text**
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="text-[#00f0ff] font-semibold">{part}</strong>
      : <span key={i}>{part}</span>
  );
}

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        className="w-2 h-2 rounded-full bg-[#a200ff]"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
      />
    ))}
  </div>
);

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hey! 👋 I'm **Nex**, NexGen's neural AI assistant powered by **recursive/flint-v1.0**. Ask me anything about spatial computing, pricing, or test my reasoning!",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
      setHasNewMessage(false);
    }
  }, [messages, isOpen]);

  const sendMessage = async (overridePrompt?: string) => {
    const text = (overridePrompt || input).trim();
    if (!text || isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const botMsgId = (Date.now() + 1).toString();
    const botReply: Message = {
      id: botMsgId,
      role: 'assistant',
      content: '',
      reasoning: '',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg, botReply]);
    setInput('');
    setIsTyping(true);
    setIsStreaming(true);

    try {
      // Build conversation payload
      const chatMessages = [
        {
          role: 'system',
          content: 'You are Nex, the intelligent AI assistant and spatial computing Copilot for NexGen AI. Keep responses crisp, technical, insightful, and formatted nicely in Markdown with bold key terms.'
        },
        ...messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: text }
      ];

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'recursive/flint-v1.0:free',
          messages: chatMessages,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Streaming failed, fallback to local knowledge');
      }

      setIsTyping(false);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let accumulatedReasoning = '';
      let rTokens: number | undefined = undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.content) {
                accumulatedContent += data.content;
              }
              if (data.reasoning) {
                accumulatedReasoning += data.reasoning;
              }
              if (data.usage?.completionTokensDetails?.reasoningTokens) {
                rTokens = data.usage.completionTokensDetails.reasoningTokens;
              }

              setMessages(prev =>
                prev.map(m =>
                  m.id === botMsgId
                    ? {
                        ...m,
                        content: accumulatedContent,
                        reasoning: accumulatedReasoning,
                        reasoningTokens: rTokens,
                      }
                    : m
                )
              );
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }
      }
    } catch (err) {
      console.warn('AI streaming encountered error, using local fallback:', err);
      const fallbackReply = getBotResponse(text);
      setMessages(prev =>
        prev.map(m =>
          m.id === botMsgId
            ? { ...m, content: fallbackReply }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      setIsTyping(false);
      if (!isOpen) setHasNewMessage(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const SUGGESTIONS = [
    "How many r's are in the word 'strawberry'?",
    "What are NexGen features?",
    "Explore 3D Cockpit"
  ];

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-[200] w-[400px] max-w-[calc(100vw-1.5rem)] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-[#a200ff]/20 border border-white/10"
            style={{ maxHeight: '78vh' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#0e0e14] via-[#150b24] to-[#1a0a2e] border-b border-white/10">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#a200ff] flex items-center justify-center shadow-[0_0_12px_rgba(162,0,255,0.6)]">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0e0e14] shadow-[0_0_6px_#10b981] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">Nex AI Copilot</h3>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#00f0ff]/15 text-[#00f0ff] text-[9px] font-mono font-bold border border-[#00f0ff]/30">
                    FLINT-V1.0
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400 font-mono tracking-wider flex items-center gap-1">
                  <span>●</span> <span>Live Stream · OpenRouter</span>
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Minimize chat assistant"
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat assistant"
                  className="text-gray-400 hover:text-[#ff0055] transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-[#08080f] px-4 py-4 flex flex-col gap-4" style={{ minHeight: '300px', maxHeight: '420px' }}>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-[#00f0ff] to-[#a200ff]'
                      : 'bg-white/10 border border-white/20'
                  }`}>
                    {msg.role === 'assistant'
                      ? <Bot className="w-4 h-4 text-white" />
                      : <User className="w-4 h-4 text-gray-300" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[#a200ff] to-[#00f0ff] text-white rounded-br-sm'
                      : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-sm'
                  }`}>
                    {msg.content ? (
                      formatMessage(msg.content)
                    ) : (
                      <span className="text-gray-400 italic text-xs flex items-center gap-1.5 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
                        Generating response...
                      </span>
                    )}

                    {/* Expandable Reasoning / Chain of Thought */}
                    {msg.reasoning && (
                      <details className="mt-2 text-xs border-t border-white/10 pt-2 group">
                        <summary className="cursor-pointer text-[10px] font-mono text-[#00f0ff] flex items-center justify-between hover:text-white select-none">
                          <span className="flex items-center gap-1 font-bold">
                            <Cpu className="w-3 h-3 text-[#00f0ff]" />
                            <span>Chain of Thought</span>
                          </span>
                          {msg.reasoningTokens ? (
                            <span className="text-[9px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono">
                              {msg.reasoningTokens} tokens
                            </span>
                          ) : (
                            <span className="text-[9px] text-gray-500">view steps</span>
                          )}
                        </summary>
                        <div className="mt-1.5 p-2.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[10px] text-gray-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                          {msg.reasoning}
                        </div>
                      </details>
                    )}

                    <div className={`text-[9px] mt-1 opacity-50 ${msg.role === 'user' ? 'text-right text-white' : 'text-gray-400 font-mono'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-2"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#a200ff] flex-shrink-0 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 1 && (
              <div className="bg-[#08080f] px-4 pb-2 flex gap-2 flex-wrap border-t border-white/5 pt-2">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-[10px] px-3 py-1.5 rounded-full border border-[#a200ff]/40 text-[#a200ff] hover:bg-[#a200ff]/10 hover:border-[#a200ff] transition-all whitespace-nowrap cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="bg-[#0d0d16] border-t border-white/10 px-4 py-3 flex items-center gap-3">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Nex anything (powered by flint-v1.0)..."
                aria-label="Message prompt to Nex AI assistant"
                disabled={isStreaming}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 outline-none focus:border-[#a200ff]/50 focus:bg-white/8 transition-all disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isStreaming}
                aria-label="Send message to AI assistant"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#a200ff] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(162,0,255,0.4)] cursor-pointer"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? "Close AI chat assistant" : "Open AI chat assistant"}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[200] w-14 h-14 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#a200ff] flex items-center justify-center shadow-[0_0_25px_rgba(162,0,255,0.5)] hover:shadow-[0_0_40px_rgba(162,0,255,0.8)] transition-shadow focus:outline-none focus:ring-2 focus:ring-[#00f0ff] cursor-pointer"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {hasNewMessage && !isOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff0055] rounded-full border-2 border-[#030305] text-[9px] text-white flex items-center justify-center font-bold"
          >
            1
          </motion.span>
        )}

        {/* Pulse ring */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#a200ff]"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>
    </>
  );
};

export default ChatBox;
