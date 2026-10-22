import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'serve-mkv-mime',
      configureServer(server) {
        // ── UNIFIED ALL-SITES ENTERPRISE SECURITY SUITE ──
        // Enforces Helmet + Rate Limiting + Input Validation + Safe MongoDB / Parameterized Queries + Auth + Logging across ALL endpoints
        server.middlewares.use(async (req, res, next) => {
          try {
            // @ts-expect-error - dynamic JS import in node vite config
            const { globalSecurityMiddleware } = await import('./server-security.mjs');
            globalSecurityMiddleware(req, res, next);
          } catch (err: unknown) {
            console.error('[Global Security Middleware Error]', err);
            next();
          }
        });

        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.includes('.mkv')) {
            res.setHeader('Content-Type', 'video/x-matroska');
          }
          next();
        });

        // Cloud-Native Kubernetes Health Probes (/live, /ready, /startup, /healthz, /api/health/*)
        server.middlewares.use(async (req, res, next) => {
          const url = req.url ? req.url.split('?')[0] : '';
          if (
            url === '/live' ||
            url === '/healthz' ||
            url === '/ready' ||
            url === '/startup' ||
            url === '/health' ||
            url.startsWith('/api/health')
          ) {
            try {
              // @ts-expect-error - dynamic JS import in node vite config
              const { handleHealthProbes } = await import('./server-security.mjs');
              if (handleHealthProbes(req, res)) {
                return;
              }
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : String(err);
              console.error('[Health Probes Middleware Error]', message);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: message }));
            }
          }
          next();
        });

        // Secure server-side OpenRouter AI Chat & Reasoning streaming endpoint
        server.middlewares.use('/api/ai/chat', async (req, res, next) => {
          if (req.method === 'POST' || req.method === 'OPTIONS') {
            try {
              // @ts-expect-error - dynamic JS import in node vite config
              const { handleAiChatStream } = await import('./server-security.mjs');
              return handleAiChatStream(req, res);
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : String(err);
              console.error('[AI Proxy Middleware Error]', message);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: message }));
            }
          }
          next();
        });

        // Enterprise Security & Webhooks API suite (/api/security/*, /api/webhooks/*)
        server.middlewares.use(async (req, res, next) => {
          const url = req.url ? req.url.split('?')[0] : '';
          if (url.startsWith('/api/security') || url.startsWith('/api/webhooks')) {
            try {
              // @ts-expect-error - dynamic JS import in node vite config
              const { handleSecurityApi } = await import('./server-security.mjs');
              if (handleSecurityApi(req, res)) {
                return;
              }
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : String(err);
              console.error('[Security API Middleware Error]', message);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: message }));
            }
          }
          next();
        });
      }
    }
  ],
})
