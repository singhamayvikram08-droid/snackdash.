import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Sparkles, Zap, Shield, CreditCard, Lock, 
  ArrowRight, X, Globe, CheckCircle2, ChevronDown,
  Building, Wallet, Apple, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Magnetic from './Magnetic';
import { useAuth, setStoredAuth } from '../utils/auth';
import { useSiteConfig } from '../utils/siteConfig';

interface PlanFeature {
  text: string;
  strong?: boolean;
}

interface PricingPlan {
  id: 'hobby' | 'pro' | 'enterprise';
  name: string;
  badge: string;
  monthlyPrice: string;
  annualPrice: string;
  period: string;
  description: string;
  recommended: boolean;
  color: string;
  ctaText: string;
  features: PlanFeature[];
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'hobby',
    name: 'Hobby Core',
    badge: 'Starter Sandbox',
    monthlyPrice: '$0',
    annualPrice: '$0',
    period: 'forever',
    description: 'Perfect for indie creators, students, and prototype spatial applications.',
    recommended: false,
    color: '#00f0ff',
    ctaText: 'Start Free Developer',
    features: [
      { text: '1,000 API calls / day', strong: true },
      { text: 'Standard 3D WebGL Matrix' },
      { text: 'Access to 6 Ecosystem Microservices' },
      { text: 'Public Workspace Repos' },
      { text: 'Community Support on Discord' },
      { text: 'Shared Edge Compute Cluster' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro Spatial',
    badge: '★ Most Popular Choice',
    monthlyPrice: '$49',
    annualPrice: '$39',
    period: '/ month',
    description: 'Engineered for high-throughput production apps and autonomous AI spatial engines.',
    recommended: true,
    color: '#a200ff',
    ctaText: 'Start 14-Day Free Trial',
    features: [
      { text: '100,000 API calls / day', strong: true },
      { text: 'Full Neural Matrix & 3D Cockpit', strong: true },
      { text: 'Custom GLSL Shaders & Physics Matrix' },
      { text: '14,029 Global Edge Nodes' },
      { text: 'Sub-millisecond Latency Routing' },
      { text: 'Private Projects & Unlimited Teams' },
      { text: 'Priority 24/7 Developer Support' },
      { text: 'Zero Cold-Start Instant Warmup' },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Matrix',
    badge: 'Dedicated Global Scale',
    monthlyPrice: 'Custom',
    annualPrice: 'Custom',
    period: 'bespoke SLA',
    description: 'Dedicated infrastructure with sovereign VPCs, custom GPU hardware, and SLA guarantees.',
    recommended: false,
    color: '#ff0055',
    ctaText: 'Configure Cluster',
    features: [
      { text: 'Unlimited API calls & compute', strong: true },
      { text: 'Dedicated 99.999% SLA Uptime', strong: true },
      { text: 'Sovereign On-Prem / VPC Deployment' },
      { text: 'Custom Tensor Cores & GPU Matrix' },
      { text: 'Enterprise SSO (SAML, Okta, Azure)' },
      { text: 'Dedicated Principal AI Architect' },
      { text: 'Custom Shaders & Compliance Audit' },
    ],
  },
];

const faqs = [
  {
    q: 'How does the 14-day free trial for Pro work?',
    a: 'You get full, unrestricted access to the complete Pro Spatial tier including all 14,029 edge nodes and custom shaders. You will not be charged during the trial and can cancel anytime with 1 click.',
  },
  {
    q: 'Can I switch between monthly and annual billing?',
    a: 'Yes! You can switch between billing periods at any time from your NextGen dashboard. When upgrading to annual, your 20% discount is applied immediately.',
  },
  {
    q: 'What payment methods do you support?',
    a: 'We support all major credit cards (Visa, MasterCard, American Express), Apple Pay, Google Pay, and Web3 crypto payments (USDC, Solana, Ethereum).',
  },
  {
    q: 'What happens if my application exceeds daily API limits?',
    a: 'We never hard-throttle production traffic. If your traffic spikes, auto-burst kicks in automatically with soft notifications so your users experience zero disruption.',
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [activePlan, setActivePlan] = useState<PricingPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'express' | 'crypto'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [provisionStep, setProvisionStep] = useState<number>(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { config } = useSiteConfig();
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(() => user?.name || 'Amay Vikram Singh');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  // Enterprise Modal State
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [entNodes, setEntNodes] = useState(25000);
  const [entEmail, setEntEmail] = useState(() => user?.email || '');
  const [entError, setEntError] = useState('');
  const [entSubmitted, setEntSubmitted] = useState(false);

  // Resume checkout flow after authentication
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const planParam = params.get('plan');

    if (action === 'checkout' && planParam) {
      const targetPlan = pricingPlans.find((p) => p.id === planParam);
      if (targetPlan) {
        setTimeout(() => {
          if (targetPlan.id === 'enterprise') {
            setShowEnterpriseModal(true);
          } else {
            setActivePlan(targetPlan);
            setPaymentSuccess(false);
            setProvisionStep(0);
            setIsProcessing(false);
          }
        }, 0);
        // Smoothly scroll down to the pricing section
        setTimeout(() => {
          const pricingElem = document.getElementById('pricing');
          if (pricingElem) {
            pricingElem.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
        // Clean URL params so subsequent refreshes don't re-trigger
        const cleanUrl = window.location.pathname + (window.location.hash || '#pricing');
        window.history.replaceState({}, '', cleanUrl);
      }
    }
  }, []);

  const handleEnterpriseSubmit = () => {
    if (!entEmail.trim()) {
      setEntError('Work email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(entEmail.trim())) {
      setEntError('Please enter a valid business email');
      return;
    }
    setEntError('');
    setEntSubmitted(true);
  };

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (activePlan || showEnterpriseModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activePlan, showEnterpriseModal]);

  const handleOpenPlan = (plan: PricingPlan) => {
    // If user is not authenticated/registered, redirect to login page with purchase intent
    if (!isAuthenticated) {
      navigate(
        `/login?requireAuth=purchase&plan=${plan.id}&planName=${encodeURIComponent(plan.name)}&from=${encodeURIComponent('/?action=checkout&plan=' + plan.id)}`,
        {
          state: {
            from: `/?action=checkout&plan=${plan.id}`,
            requireLoginFirst: true,
            purchaseIntent: true,
            planId: plan.id,
            planName: plan.name,
            featureName: `Purchase ${plan.name} Plan`,
          },
        }
      );
      return;
    }

    if (plan.id === 'enterprise') {
      setShowEnterpriseModal(true);
    } else {
      setActivePlan(plan);
      setPaymentSuccess(false);
      setProvisionStep(0);
      setIsProcessing(false);
    }
  };

  const handleExecutePayment = () => {
    setIsProcessing(true);
    setProvisionStep(1);

    setTimeout(() => {
      setProvisionStep(2);
    }, 900);

    setTimeout(() => {
      setProvisionStep(3);
    }, 1800);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      if (activePlan) {
        const isProPlan = activePlan.id === 'pro';
        const isEnterprise = activePlan.id === 'enterprise';
        const nextTier = activePlan.id === 'hobby' ? 'free' : (activePlan.id as 'pro' | 'enterprise');
        setStoredAuth({
          name: user?.name || cardHolder.trim() || 'Amay Vikram Singh',
          email: user?.email || 'developer@nexgen.io',
          role: isProPlan ? 'Pro Subscriber' : (isEnterprise ? 'Enterprise Subscriber' : 'Member'),
          tier: nextTier,
          isPro: isProPlan || isEnterprise,
          subscriptionStatus: 'active',
          subscribedAt: new Date().toISOString(),
        });
      }
    }, 2500);
  };

  return (
    <section id="pricing" className="w-full pt-20 sm:pt-28 pb-12 sm:pb-16 px-6 bg-[#030305] relative overflow-hidden">
      {/* Ambient Lighting Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#a200ff]/10 blur-[170px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/3 left-1/4 w-[450px] h-[450px] bg-[#00f0ff]/10 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-3/4 right-1/4 w-[350px] h-[350px] bg-[#ff0055]/08 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10">

        {/* ══════════════════════════════════════════════════════════
            SECTION HEADER (CLEAN, IMMEDIATE VISIBILITY, ZERO CLIPPING)
            ══════════════════════════════════════════════════════════ */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-[#a200ff]/30 mb-6 shadow-[0_0_20px_rgba(162,0,255,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#a200ff] tracking-[0.25em] uppercase">
              Subscription Tiers & Infrastructure
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black mb-6 tracking-tighter text-white">
            Scale Without <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#a200ff] to-[#ff0055]">
              Artificial Limits
            </span>
          </h2>

          <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Deploy across 14,029 global edge nodes with instant provisioning. Start free for personal experiments, scale to mission-critical clusters.
          </p>

          {config.pricing.discountActive && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold shadow-lg shadow-amber-500/10 animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{config.pricing.promoTag || `ADMIN PROMO: ${config.pricing.discountPercent}% OFF APPLIED AT CHECKOUT`}</span>
            </div>
          )}

          {/* Interactive Billing Cadence Toggle */}
          <div className="mt-8 inline-flex items-center gap-2 p-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-black shadow-lg shadow-white/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black shadow-lg shadow-[#00f0ff]/30 font-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-black/50 text-[10px] text-[#00f0ff] font-mono font-black uppercase tracking-normal">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            PRICING TIERS GRID
            ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full items-stretch mb-20">
          {pricingPlans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
            const isPro = plan.recommended;
            const isUserSubscribedToThis =
              (plan.id === 'pro' && (user?.tier === 'pro' || user?.isPro)) ||
              (plan.id === 'enterprise' && user?.tier === 'enterprise') ||
              (plan.id === 'hobby' && user?.tier === 'free');

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  isUserSubscribedToThis
                    ? 'bg-gradient-to-b from-[#00241b] via-[#051310] to-[#04030a] border-2 border-emerald-400 shadow-[0_0_60px_rgba(52,211,153,0.25)] lg:-translate-y-4'
                    : isPro
                    ? 'bg-gradient-to-b from-[#120b24] via-[#090714] to-[#04030a] border-2 border-[#a200ff] shadow-[0_0_60px_rgba(162,0,255,0.25)] lg:-translate-y-4'
                    : 'bg-[#080811]/90 border border-white/10 hover:border-white/20 shadow-xl'
                }`}
              >
                {/* Popular / Active Subscription Badge */}
                {isUserSubscribedToThis ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-400 via-[#00f0ff] to-emerald-400 text-black font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-400/40 flex items-center gap-1.5 z-20">
                    <Sparkles className="w-3 h-3 fill-black text-black" />
                    <span>{plan.id === 'pro' ? 'ACTIVE PRO SUBSCRIBER' : 'ACTIVE PLAN'}</span>
                  </div>
                ) : isPro ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#a200ff]/40">
                    {plan.badge}
                  </div>
                ) : null}

                {/* Ambient Card Glow for Pro */}
                {isPro && (
                  <div className="absolute top-0 right-0 w-36 h-36 bg-[#a200ff]/20 rounded-full blur-3xl pointer-events-none" />
                )}

                <div>
                  {/* Card Title & Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-2xl font-black text-white tracking-tight">{plan.name}</h3>
                    {!isPro && (
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300 uppercase">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-300 text-xs leading-relaxed min-h-[36px] mb-6">
                    {plan.description}
                  </p>

                  {/* Price Block */}
                  <div className="py-4 border-y border-white/10 mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-white tracking-tight">
                        {price}
                      </span>
                      <span className="text-gray-400 text-xs font-semibold">
                        {plan.period}
                      </span>
                    </div>

                    {isPro && (
                      <div className="text-[11px] font-mono mt-2 text-[#00f0ff] flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00f0ff]" />
                        <span>
                          {billingCycle === 'annual'
                            ? 'Billed $468/yr (Save $120 every year)'
                            : 'Standard monthly billing, cancel anytime'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3.5 mb-8">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400 font-bold">
                      Included Capabilities:
                    </div>
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            backgroundColor: `${plan.color}20`,
                            color: plan.color,
                          }}
                        >
                          <Check className="w-3 h-3 stroke-[3px]" />
                        </div>
                        <span
                          className={`text-xs ${
                            feat.strong ? 'text-white font-bold' : 'text-gray-300'
                          }`}
                        >
                          {feat.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA Button */}
                <div className="pt-4 border-t border-white/5">
                  <Magnetic strength={0.2} className="w-full">
                    <button
                      type="button"
                      onClick={() => {
                        if (isUserSubscribedToThis) {
                          navigate('/dashboard');
                        } else {
                          handleOpenPlan(plan);
                        }
                      }}
                      className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isUserSubscribedToThis
                          ? 'bg-gradient-to-r from-emerald-400 via-[#00f0ff] to-emerald-400 text-black shadow-xl shadow-emerald-400/25 hover:opacity-95 hover:scale-[1.01]'
                          : isPro
                          ? 'bg-gradient-to-r from-[#00f0ff] via-[#a200ff] to-[#ff0055] text-white shadow-xl shadow-[#00f0ff]/25 hover:opacity-95 hover:scale-[1.02]'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:border-[#00f0ff]/40'
                      }`}
                    >
                      <span>
                        {isUserSubscribedToThis
                          ? `✓ Current Plan (${plan.id === 'pro' ? 'Pro Subscriber' : plan.name})`
                          : plan.ctaText}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Magnetic>
                  <div className="text-[10px] text-gray-400 text-center mt-2.5">
                    {plan.id === 'hobby'
                      ? 'No credit card required'
                      : plan.id === 'pro'
                      ? '14-day free trial · Cancel anytime'
                      : 'Custom deployment agreement'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════
            ENTERPRISE & TRUST SECURITY GUARANTEES STRIP
            ══════════════════════════════════════════════════════════ */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-3xl bg-[#070710]/80 border border-white/10 mb-20 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">30-Day Guarantee</div>
              <div className="text-xs text-gray-300 mt-1 leading-relaxed">
                If latency exceeds 2ms in your region, receive a 100% full refund with no hassle.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#a200ff]/10 border border-[#a200ff]/30 text-[#a200ff] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">256-Bit SSL Cipher</div>
              <div className="text-xs text-gray-300 mt-1 leading-relaxed">
                Quantum-resistant AES-256 telemetry pipes and TLS encryption on all API calls.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#ff0055]/10 border border-[#ff0055]/30 text-[#ff0055] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Zero Lock-In</div>
              <div className="text-xs text-gray-300 mt-1 leading-relaxed">
                Cancel with one click inside your dashboard. Export all models, shaders, and logs.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Instant Provisioning</div>
              <div className="text-xs text-gray-300 mt-1 leading-relaxed">
                Global edge nodes allocated automatically in less than 300ms from authorization.
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            FAQ ACCORDION
            ══════════════════════════════════════════════════════════ */}
        <div className="max-w-3xl w-full mx-auto space-y-4">
          <div className="text-center mb-8">
            <div className="text-xs font-mono uppercase tracking-widest text-[#00f0ff] font-bold">Frequently Asked Questions</div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">Everything You Need to Know</h3>
          </div>

          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.03]"
              >
                <span className="text-sm font-bold text-white">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                    openFaq === idx ? 'rotate-180 text-[#00f0ff]' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-gray-300 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}

          {/* FAQ Footer Assistance Card */}
          <div className="mt-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <div className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="w-4 h-4 text-[#00f0ff]" />
                <span>Have a specific architectural or clustering question?</span>
              </div>
              <div className="text-xs text-gray-400">Our live telemetry team and AI Copilot are available 24/7 to assist.</div>
            </div>
            <button
              type="button"
              onClick={() => {
                const chatTrigger = document.querySelector('button[aria-label="Open AI Copilot"]') as HTMLButtonElement;
                if (chatTrigger) chatTrigger.click();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0 cursor-pointer shadow-lg shadow-[#00f0ff]/20"
            >
              Ask AI Copilot →
            </button>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════
          INTERACTIVE CHECKOUT / PAYMENT MODAL (THE PAYMENT UX)
          ══════════════════════════════════════════════════════════ */}
      {typeof document !== 'undefined' && createPortal(
        <>
          <AnimatePresence>
            {activePlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-xl bg-[#090913] rounded-3xl border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActivePlan(null)}
                className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {!paymentSuccess ? (
                <>
                  {/* Modal Header */}
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-[10px] font-mono uppercase font-bold tracking-widest">
                      <Shield className="w-3 h-3" /> Secure Cluster Checkout
                    </div>
                    <h3 className="text-2xl font-black text-white">
                      Activate {activePlan.name}
                    </h3>
                    <p className="text-xs text-gray-300">
                      Zero cold-start cloud deployment to 14,029 edge nodes.
                    </p>
                  </div>

                  {/* Order Summary Box */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>Selected Tier:</span>
                      <span className="text-[#00f0ff]">{activePlan.name} ({billingCycle.toUpperCase()})</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <span>Cadence Rate:</span>
                      <span>
                        {billingCycle === 'annual' ? activePlan.annualPrice : activePlan.monthlyPrice} {activePlan.period}
                      </span>
                    </div>

                    {activePlan.id === 'pro' && (
                      <div className="flex items-center justify-between text-xs font-bold text-green-400 bg-green-500/10 p-2.5 rounded-xl border border-green-500/20">
                        <span>14-Day Pro Free Trial:</span>
                        <span>$0.00 Due Today</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-sm font-extrabold text-white">
                      <span>Total Due Today:</span>
                      <span className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#a200ff]">
                        $0.00
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector (Only required for Pro) */}
                  {activePlan.id === 'pro' && (
                    <div className="space-y-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-300">
                        Select Payment Method:
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            paymentMethod === 'card'
                              ? 'bg-white/10 border-[#00f0ff] text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                              : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          <CreditCard className="w-4 h-4 text-[#00f0ff]" />
                          <span>Credit Card</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('express')}
                          className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            paymentMethod === 'express'
                              ? 'bg-white/10 border-[#a200ff] text-white shadow-[0_0_15px_rgba(162,0,255,0.2)]'
                              : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          <Apple className="w-4 h-4 text-white" />
                          <span>Apple / Pay</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('crypto')}
                          className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            paymentMethod === 'crypto'
                              ? 'bg-white/10 border-[#ff0055] text-white shadow-[0_0_15px_rgba(255,0,85,0.2)]'
                              : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          <Wallet className="w-4 h-4 text-[#ff0055]" />
                          <span>Web3 Crypto</span>
                        </button>
                      </div>

                      {/* Payment Inputs */}
                      {paymentMethod === 'card' && (
                        <div className="space-y-3 pt-2">
                          <div>
                            <label className="text-[11px] font-bold text-gray-300 uppercase">Cardholder Name</label>
                            <input
                              type="text"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              className="w-full mt-1 bg-white/[0.04] border border-white/10 focus:border-[#00f0ff] rounded-xl px-4 py-3 text-xs text-white outline-none font-medium"
                              placeholder="Full Name"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-gray-300 uppercase">Card Number</label>
                            <div className="relative flex items-center mt-1">
                              <CreditCard className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                              <input
                                type="text"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className="w-full bg-white/[0.04] border border-white/10 focus:border-[#00f0ff] rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none font-mono"
                                placeholder="4242 4242 4242 4242"
                              />
                              <span className="absolute right-3.5 text-[10px] font-mono text-[#00f0ff] font-bold uppercase">
                                VISA TEST
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-gray-300 uppercase">Expiry Date</label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className="w-full mt-1 bg-white/[0.04] border border-white/10 focus:border-[#00f0ff] rounded-xl px-4 py-3 text-xs text-white outline-none font-mono"
                                placeholder="MM/YY"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-gray-300 uppercase">Security Code (CVC)</label>
                              <input
                                type="text"
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value)}
                                className="w-full mt-1 bg-white/[0.04] border border-white/10 focus:border-[#00f0ff] rounded-xl px-4 py-3 text-xs text-white outline-none font-mono"
                                placeholder="CVC"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'express' && (
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-3">
                          <p className="text-xs text-gray-300">
                            Fast 1-click checkout with Touch ID / Face ID.
                          </p>
                          <button
                            type="button"
                            onClick={handleExecutePayment}
                            disabled={isProcessing}
                            className="w-full py-3.5 rounded-2xl bg-white text-black font-extrabold text-xs uppercase tracking-wider hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                          >
                            <Apple className="w-4 h-4 fill-black" />
                            <span>Pay with Apple Pay ($0.00 Trial)</span>
                          </button>
                        </div>
                      )}

                      {paymentMethod === 'crypto' && (
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-3">
                          <p className="text-xs text-gray-300">
                            Connect your Web3 wallet for decentralized cluster leasing.
                          </p>
                          <div className="flex gap-2 justify-center">
                            {['USDC', 'Solana (SOL)', 'Ethereum (ETH)'].map((c) => (
                              <span key={c} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-white">
                                {c}
                              </span>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={handleExecutePayment}
                            disabled={isProcessing}
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#ff0055] to-[#a200ff] text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                          >
                            <Wallet className="w-4 h-4" />
                            <span>Connect Wallet & Authorize ($0.00)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submission & Provisioning Execution */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-3 pt-2">
                      <button
                        type="button"
                        onClick={handleExecutePayment}
                        disabled={isProcessing}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00f0ff] via-[#a200ff] to-[#ff0055] text-white font-extrabold text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-[#00f0ff]/20 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>
                              {provisionStep === 1 && 'Validating Credentials with SSL...'}
                              {provisionStep === 2 && 'Allocating 14,029 Edge Nodes...'}
                              {provisionStep === 3 && 'Finalizing License Activation...'}
                            </span>
                          </>
                        ) : (
                          <>
                            <span>
                              {activePlan.id === 'hobby'
                                ? 'Confirm Free Developer License'
                                : 'Authorize 14-Day Free Trial ($0.00 Due)'}
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-[#00f0ff]" /> 256-Bit TLS
                        </span>
                        <span>·</span>
                        <span>Cancel Anytime</span>
                        <span>·</span>
                        <span>SOC2 Compliant</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* ══════════════════════════════════════════════════════════
                   SUCCESSFUL PROVISIONING VIEW
                   ══════════════════════════════════════════════════════════ */
                <div className="text-center py-6 space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-green-500/20 border-2 border-green-500 text-green-400 mx-auto flex items-center justify-center shadow-xl shadow-green-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{activePlan.id === 'pro' ? 'PRO SUBSCRIBER BADGE ACTIVATED' : 'SUBSCRIPTION ACTIVATED'}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      {activePlan.id === 'pro' ? 'Welcome, Pro Subscriber!' : 'Cluster Provisioned Successfully!'}
                    </h3>
                    <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed">
                      Your <span className="text-[#00f0ff] font-bold">{activePlan.name}</span> environment has been allocated across 14,029 global edge nodes with sub-millisecond routing enabled.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-gray-400">
                      <span>Status:</span>
                      <span className="text-emerald-400 font-bold">{activePlan.id === 'pro' ? 'PRO SUBSCRIBER (ACTIVE)' : 'ONLINE (14,029 Nodes)'}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Latency:</span>
                      <span className="text-[#00f0ff]">0.42ms Global Avg</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>License Token:</span>
                      <span className="text-white truncate max-w-[200px]">NXG_PRO_99F82A0B71E</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActivePlan(null);
                      navigate('/dashboard');
                    }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-[#00f0ff]/30"
                  >
                    <span>Enter Pro Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          ENTERPRISE CLUSTER CONFIGURATOR MODAL
          ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showEnterpriseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#090913] rounded-3xl border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => {
                  setShowEnterpriseModal(false);
                  setEntSubmitted(false);
                }}
                className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {!entSubmitted ? (
                <>
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff0055]/10 border border-[#ff0055]/30 text-[#ff0055] text-[10px] font-mono uppercase font-bold tracking-widest">
                      <Building className="w-3 h-3" /> Enterprise Architecture
                    </div>
                    <h3 className="text-2xl font-black text-white">Configure Sovereign Cluster</h3>
                    <p className="text-xs text-gray-300">
                      Tailored infrastructure with dedicated hardware and 99.999% SLA.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-gray-300 mb-2">
                        <span>Required Edge Compute Nodes:</span>
                        <span className="text-[#ff0055] font-mono">{entNodes.toLocaleString()} Nodes</span>
                      </div>
                      <input
                        type="range"
                        min="5000"
                        max="100000"
                        step="5000"
                        value={entNodes}
                        onChange={(e) => setEntNodes(Number(e.target.value))}
                        className="w-full accent-[#ff0055] cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                        <div className="font-bold text-white">Dedicated GPU Matrix</div>
                        <div className="text-[11px] text-gray-400">NVIDIA H100 / Blackwell</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                        <div className="font-bold text-white">Sovereignty</div>
                        <div className="text-[11px] text-gray-400">On-Prem / Custom VPC</div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-300 uppercase">Work Email</label>
                      <input
                        type="email"
                        value={entEmail}
                        onChange={(e) => {
                          setEntEmail(e.target.value);
                          if (entError) setEntError('');
                        }}
                        placeholder="yourname@company.com"
                        className="w-full mt-1 bg-white/[0.04] border border-white/10 focus:border-[#ff0055] rounded-xl px-4 py-3 text-xs text-white outline-none font-medium"
                      />
                      {entError && (
                        <p className="mt-1.5 text-xs text-rose-400 font-medium">{entError}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleEnterpriseSubmit}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ff0055] to-[#a200ff] text-white font-extrabold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-[#ff0055]/20"
                  >
                    <span>Request Custom Cluster Spec</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/20 text-green-400 mx-auto flex items-center justify-center border border-green-500/40">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Inquiry Received</h3>
                  <p className="text-xs text-gray-300 leading-relaxed max-w-sm mx-auto">
                    A NextGen Principal Infrastructure Architect will review your {entNodes.toLocaleString()}-node requirements and respond within 15 minutes.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowEnterpriseModal(false)}
                    className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </>,
        document.body
      )}
    </section>
  );
};

export default Pricing;
