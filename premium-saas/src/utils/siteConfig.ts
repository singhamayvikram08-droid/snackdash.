import { useState, useEffect } from 'react';

export interface ConsumerSiteConfig {
  announcement: {
    enabled: boolean;
    badge: string;
    text: string;
    actionText: string;
    actionLink: string;
    type: 'promo' | 'alert' | 'info' | 'cyber';
  };
  maintenanceMode: {
    enabled: boolean;
    title: string;
    message: string;
    estimatedUptime: string;
  };
  hero: {
    customHeadline: string;
    customGradientWord: string;
    customSubtitle: string;
    statusBadge: string;
    primaryCtaText: string;
  };
  features: {
    enableChatbot: boolean;
    enableCockpitSection: boolean;
    enablePublicSignups: boolean;
    enableShowcaseStream: boolean;
  };
  pricing: {
    discountActive: boolean;
    discountPercent: number;
    promoTag: string;
    highlightEnterprise: boolean;
  };
  updatedAt: string;
  updatedBy: string;
}

export const DEFAULT_SITE_CONFIG: ConsumerSiteConfig = {
  announcement: {
    enabled: false,
    badge: 'EXCLUSIVE',
    text: 'Next Gen AI v2.4 Spatial Engine & OpenRouter Reasoning now live worldwide.',
    actionText: 'Explore Features',
    actionLink: '#features',
    type: 'cyber',
  },
  maintenanceMode: {
    enabled: false,
    title: 'Spatial Core System Upgrade',
    message: 'NexGen AI clusters are currently executing a rolling quantum firmware update. All services will resume momentarily.',
    estimatedUptime: '15 Minutes',
  },
  hero: {
    customHeadline: 'VIRTUALIZE',
    customGradientWord: 'REALITY.',
    customSubtitle: '',
    statusBadge: 'NextGen AI v2.4 Active · Connected',
    primaryCtaText: 'Get Started Free',
  },
  features: {
    enableChatbot: true,
    enableCockpitSection: true,
    enablePublicSignups: true,
    enableShowcaseStream: true,
  },
  pricing: {
    discountActive: false,
    discountPercent: 50,
    promoTag: 'LIMITED TIME 50% OFF',
    highlightEnterprise: false,
  },
  updatedAt: new Date().toISOString(),
  updatedBy: 'System Default',
};

const STORAGE_KEY = 'nexgen_consumer_site_config';

export function getSiteConfig(): ConsumerSiteConfig {
  if (typeof window === 'undefined') return DEFAULT_SITE_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_CONFIG;
    return { ...DEFAULT_SITE_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

export function updateSiteConfig(partial: Partial<ConsumerSiteConfig>): ConsumerSiteConfig {
  const current = getSiteConfig();
  const updated: ConsumerSiteConfig = {
    ...current,
    ...partial,
    announcement: { ...current.announcement, ...(partial.announcement || {}) },
    maintenanceMode: { ...current.maintenanceMode, ...(partial.maintenanceMode || {}) },
    hero: { ...current.hero, ...(partial.hero || {}) },
    features: { ...current.features, ...(partial.features || {}) },
    pricing: { ...current.pricing, ...(partial.pricing || {}) },
    updatedAt: new Date().toISOString(),
    updatedBy: partial.updatedBy || current.updatedBy || 'Root Admin',
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Dispatch both custom DOM event and BroadcastChannel message for multi-tab sync
  window.dispatchEvent(new Event('nexgen-site-config-changed'));
  try {
    const bc = new BroadcastChannel('nexgen_site_config');
    bc.postMessage(updated);
    bc.close();
  } catch {
    // BroadcastChannel unsupported or restricted in environment
  }

  return updated;
}

export function resetSiteConfig(): ConsumerSiteConfig {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('nexgen-site-config-changed'));
  try {
    const bc = new BroadcastChannel('nexgen_site_config');
    bc.postMessage(DEFAULT_SITE_CONFIG);
    bc.close();
  } catch {
    // BroadcastChannel unsupported or restricted in environment
  }
  return DEFAULT_SITE_CONFIG;
}

export function useSiteConfig() {
  const [config, setConfig] = useState<ConsumerSiteConfig>(getSiteConfig);

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getSiteConfig());
    };

    window.addEventListener('nexgen-site-config-changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('nexgen_site_config');
      bc.onmessage = (event) => {
        if (event.data) setConfig(event.data);
      };
    } catch {
      // BroadcastChannel unsupported
    }

    return () => {
      window.removeEventListener('nexgen-site-config-changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      if (bc) bc.close();
    };
  }, []);

  return {
    config,
    updateConfig: (p: Partial<ConsumerSiteConfig>) => updateSiteConfig(p),
    resetConfig: () => resetSiteConfig(),
  };
}
