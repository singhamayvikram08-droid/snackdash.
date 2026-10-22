#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NextGen AI — Zero-Trust Automated Security & Secret Leak Scanner
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SENSITIVE_PATTERNS = [
  { name: 'OpenRouter / OpenAI Live API Key', regex: /sk-(?:or-v1|proj)-[a-zA-Z0-9_-]{20,}/ },
  { name: 'Google Cloud / Gemini API Key', regex: /AIzaSy[a-zA-Z0-9_-]{33}/ },
  { name: 'GitHub Personal Access Token', regex: /(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36}/ },
  { name: 'AWS Access Key ID', regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/ },
  { name: 'Slack API Token', regex: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*/ },
  { name: 'Private Cryptographic Key', regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
  { name: 'Stripe Live Secret Key', regex: /sk_live_[0-9a-zA-Z]{24}/ },
  { name: 'Stripe Webhook Secret', regex: /whsec_[0-9a-zA-Z]{32}/ }
];

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'dist-ssr',
  '.system_generated'
]);

let violations = [];
let scannedCount = 0;

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile()) {
      scannedCount++;
      // Check file name safety
      if (entry.name === '.env' || (entry.name.startsWith('.env.') && entry.name !== '.env.example')) {
        violations.push({
          file: path.relative(rootDir, fullPath),
          issue: 'Forbidden active .env file detected in working directory! Use environment variables or .env.example template.'
        });
        continue;
      }

      // Check contents
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const pattern of SENSITIVE_PATTERNS) {
          if (pattern.regex.test(content)) {
            violations.push({
              file: path.relative(rootDir, fullPath),
              issue: `Detected potential live secret matching: ${pattern.name}`
            });
          }
        }
      } catch {
        // Skip binary files
      }
    }
  }
}

console.log('\n🔒 [NextGen AI Security Audit] Initiating repository secret scan...');
scanDirectory(rootDir);

console.log(`✓ Scanned ${scannedCount} files across repository.`);

if (violations.length === 0) {
  console.log('✅ 100% CLEAN: Zero secrets, zero private keys, and zero uncommitted .env files found!\n');
  process.exit(0);
} else {
  console.error('\n❌ CRITICAL SECURITY WARNING: Secrets detected in source tree:');
  for (const v of violations) {
    console.error(`  - ${v.file}: ${v.issue}`);
  }
  console.error('\nHalting process to prevent credential leakage!\n');
  process.exit(1);
}
