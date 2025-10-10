// Generate Secure Production Secrets
// Run this script to generate secure random secrets for production

const crypto = require('crypto');

console.log('🔐 SECURE PRODUCTION SECRETS');
console.log('================================');
console.log('');
console.log('Copy these values to your Vercel environment variables:');
console.log('');
console.log('JWT_SECRET=');
console.log(crypto.randomBytes(64).toString('hex'));
console.log('');
console.log('NEXTAUTH_SECRET=');
console.log(crypto.randomBytes(64).toString('hex'));
console.log('');
console.log('⚠️  IMPORTANT:');
console.log('- Use these ONLY in production (Vercel dashboard)');
console.log('- Keep your development .env.local unchanged');
console.log('- Create separate MongoDB user for production');
console.log('- Never commit these secrets to Git');