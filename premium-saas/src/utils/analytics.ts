// Lightweight privacy-first analytics utility for NexGen SaaS

export interface AnalyticsEvent {
  event: string;
  category?: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

class AnalyticsService {
  private hasConsent(): boolean {
    try {
      const consent = localStorage.getItem('nexgen_cookie_consent');
      if (!consent) return false;
      const parsed = JSON.parse(consent);
      if (parsed.telemetry === false || parsed.analytics === false) return false;
      return true;
    } catch {
      return false;
    }
  }

  public trackPageView(path: string) {
    if (!this.hasConsent()) return;
    const payload = {
      event: 'page_view',
      path,
      title: document.title,
      timestamp: new Date().toISOString(),
      referrer: document.referrer || 'direct',
    };
    if (import.meta.env.DEV) {
      console.log('📊 [Analytics:PageView]', payload);
    }
  }

  public trackEvent(name: string, data?: Record<string, unknown>) {
    if (!this.hasConsent()) return;
    const payload = {
      event: name,
      ...data,
      timestamp: new Date().toISOString(),
    };
    if (import.meta.env.DEV) {
      console.log(`⚡ [Analytics:${name}]`, payload);
    }
  }
}

export const analytics = new AnalyticsService();
