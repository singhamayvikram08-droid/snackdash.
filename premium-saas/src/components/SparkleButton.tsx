import { Sparkles } from 'lucide-react';

interface SparkleButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

const SparkleButton = ({ label, onClick, className = '' }: SparkleButtonProps) => {
  return (
    <button
      type="button"
      className={`group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-sm tracking-wide text-black bg-gradient-to-r from-[#00f0ff] via-[#38bdf8] to-[#a200ff] hover:opacity-95 transition-all shadow-[0_0_30px_rgba(0,240,255,0.35)] hover:shadow-[0_0_45px_rgba(0,240,255,0.6)] active:scale-[0.98] cursor-pointer overflow-hidden select-none ${className}`}
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
      <Sparkles className="w-4 h-4 text-black group-hover:rotate-12 transition-transform duration-300 relative z-10 shrink-0" />
      <span className="relative z-10 font-extrabold uppercase tracking-wider">{label}</span>
    </button>
  );
};

export default SparkleButton;
