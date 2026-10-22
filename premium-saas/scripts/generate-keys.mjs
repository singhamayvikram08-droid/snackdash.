#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NextGen AI — Cryptographic Production Secret Generator
 * ═══════════════════════════════════════════════════════════════════════════════
 * Run: node scripts/generate-keys.mjs
 * Generates uncrackable entropy for production deployments (Vercel/Render/AWS).
 */

import crypto from 'crypto';

function generateRandomPassword(length = 32) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

const adminPassword = generateRandomPassword(36);
const jwtSecret = crypto.randomBytes(64).toString('hex');
const storageSecret = crypto.randomBytes(48).toString('hex');
const webhookSecret = `whsec_${crypto.randomBytes(32).toString('hex')}`;

console.log('\n══════════════════════════════════════════════════════════════════════════');
console.log('  NEXTGEN AI — PRODUCTION ENVIRONMENT VARIABLE CONFIGURATION');
console.log('══════════════════════════════════════════════════════════════════════════\n');
console.log('Copy and paste the block below directly into your Vercel / Cloud dashboard:\n');
console.log('--------------------------------------------------------------------------');
console.log(`ADMIN_EMAIL="admin@nexgen.ai"`);
console.log(`ADMIN_PASSWORD="${adminPassword}"`);
console.log(`JWT_SECRET="${jwtSecret}"`);
console.log(`STORAGE_SIGNING_SECRET="${storageSecret}"`);
console.log(`NEXGEN_WEBHOOK_SECRET="${webhookSecret}"`);
console.log(`NODE_ENV="production"`);
console.log('--------------------------------------------------------------------------\n');
console.log('ℹ️  Security Notes:');
console.log('  1. ADMIN_PASSWORD has 36 characters with >210 bits of cryptographic entropy.');
console.log('  2. JWT_SECRET uses 512-bit hex entropy, preventing dictionary token forgery.');
console.log('  3. Never commit these values to Git; keep them in your host secrets manager.\n');
