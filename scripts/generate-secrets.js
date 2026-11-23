#!/usr/bin/env node

/**
 * Script untuk generate JWT_SECRET dan CRON_SECRET
 * Usage: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generating secrets for .env file...\n');

const jwtSecret = crypto.randomBytes(32).toString('hex');
const cronSecret = crypto.randomBytes(32).toString('hex');

console.log('Copy and paste these values to your .env file:\n');
console.log('─'.repeat(70));
console.log('\nJWT_SECRET=' + jwtSecret);
console.log('\nCRON_SECRET=' + cronSecret);
console.log('\n' + '─'.repeat(70));
console.log('\n✅ Secrets generated successfully!\n');
console.log('⚠️  Keep these secrets safe and never commit them to Git!\n');
