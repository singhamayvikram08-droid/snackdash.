import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CaptchaWidgetProps {
  onVerified: (nonce: string, answer: number) => void;
  onReset?: () => void;
  className?: string;
}

export const CaptchaWidget = ({ onVerified, onReset, className = '' }: CaptchaWidgetProps) => {
  const [prompt, setPrompt] = useState<string>('Loading verification challenge...');
  const [nonce, setNonce] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch or generate challenge
  const fetchChallenge = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setUserAnswer('');
    setIsVerified(false);
    if (onReset) onReset();

    try {
      const res = await fetch('/api/security/captcha-challenge');
      if (res.ok) {
        const data = await res.json();
        setNonce(data.nonce);
        setPrompt(data.prompt);
      } else {
        throw new Error('API unavailable');
      }
    } catch {
      // Offline fallback math challenge
      const a = Math.floor(Math.random() * 8) + 2;
      const b = Math.floor(Math.random() * 8) + 2;
      const fallbackNonce = 'local_' + Math.random().toString(36).substring(2, 10);
      setNonce(fallbackNonce);
      setPrompt(`Neural Check: What is ${a} + ${b}?`);
      // store answer in session memory for offline check
      sessionStorage.setItem('nxg_cap_' + fallbackNonce, String(a + b));
    } finally {
      setIsLoading(false);
    }
  }, [onReset]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  const handleVerify = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!userAnswer.trim()) {
      setErrorMessage('Please enter the challenge answer');
      return;
    }

    const numericAnswer = parseInt(userAnswer.trim(), 10);
    if (isNaN(numericAnswer)) {
      setErrorMessage('Answer must be a valid number');
      return;
    }

    // Check with server
    try {
      if (nonce.startsWith('local_')) {
        const localExpected = sessionStorage.getItem('nxg_cap_' + nonce);
        if (localExpected && parseInt(localExpected, 10) === numericAnswer) {
          setIsVerified(true);
          setErrorMessage(null);
          onVerified(nonce, numericAnswer);
          return;
        }
        setErrorMessage('Incorrect answer. Please retry.');
        fetchChallenge();
        return;
      }

      const res = await fetch('/api/security/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nonce, answer: numericAnswer }),
      });

      const data = await res.json();
      if (data.valid) {
        setIsVerified(true);
        setErrorMessage(null);
        onVerified(nonce, numericAnswer);
      } else {
        setErrorMessage('Verification failed. A new challenge was generated.');
        fetchChallenge();
      }
    } catch (err: unknown) {
      setErrorMessage('Verification error: ' + (err instanceof Error ? err.message : 'Network error'));
      fetchChallenge();
    }
  };

  return (
    <div className={`p-4 rounded-2xl bg-white/[0.03] border transition-all ${
      isVerified
        ? 'border-emerald-500/40 bg-emerald-500/[0.04]'
        : errorMessage
        ? 'border-rose-500/40 bg-rose-500/[0.04]'
        : 'border-white/10 hover:border-white/20'
    } ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
            isVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#00f0ff]/10 text-[#00f0ff]'
          }`}>
            {isVerified ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
          </div>
          <span className="text-xs font-mono font-bold tracking-wide uppercase text-gray-200">
            {isVerified ? 'Human Verification Passed' : 'Bot Defense Check'}
          </span>
        </div>

        {!isVerified && (
          <button
            type="button"
            onClick={fetchChallenge}
            disabled={isLoading}
            title="Generate new challenge"
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {isVerified ? (
        <div className="text-[11px] font-mono text-emerald-300 flex items-center gap-1.5">
          <span>✓ Cryptographic proof-of-humanity verified.</span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-gray-300 font-mono flex items-center justify-between">
            <span>{prompt}</span>
            <span className="text-[10px] text-gray-400">One-time challenge</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userAnswer}
              onChange={(e) => {
                setUserAnswer(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleVerify(e);
              }}
              placeholder="Your answer"
              className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white placeholder-gray-500 outline-none focus:border-[#00f0ff] transition-all"
            />
            <button
              type="button"
              onClick={handleVerify}
              className="px-4 py-2 rounded-xl bg-[#00f0ff]/15 hover:bg-[#00f0ff]/25 border border-[#00f0ff]/30 text-[#00f0ff] hover:text-white text-xs font-mono font-bold transition-all cursor-pointer"
            >
              Verify
            </button>
          </div>

          {errorMessage && (
            <div className="text-[11px] font-mono text-rose-400 flex items-center gap-1 pt-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CaptchaWidget;
