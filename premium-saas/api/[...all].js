import { handleAiChatStream, handleSecurityApi, handleHealthProbes } from '../server-security.mjs';

/**
 * Universal Vercel Serverless Function Adapter for NextGen AI APIs
 * Handles /api/ai/chat, /api/security/*, /api/webhooks/*, /api/health/*
 */
export default async function handler(req, res) {
  const url = req.url ? req.url.split('?')[0] : '';

  if (url.includes('/api/ai/chat')) {
    return handleAiChatStream(req, res);
  }

  if (url.includes('/api/security') || url.includes('/api/webhooks')) {
    if (handleSecurityApi(req, res)) return;
  }

  if (url.includes('/api/health') || url === '/live' || url === '/ready' || url === '/startup' || url === '/healthz') {
    if (handleHealthProbes(req, res)) return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'API_ROUTE_NOT_FOUND', path: url }));
}
