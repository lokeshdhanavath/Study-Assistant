// test-env.ts
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

console.log('🔍 Environment Variables Test:');
console.log('GITHUB_ID:', process.env.GITHUB_ID || '❌ NOT FOUND');
console.log('GITHUB_SECRET:', process.env.GITHUB_SECRET ? '✅ LOADED' : '❌ NOT FOUND');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ NOT FOUND');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ LOADED' : '❌ NOT FOUND');

// Check if file exists
import fs from 'fs';
const envExists = fs.existsSync('.env.local');
console.log('\n📁 .env.local file exists:', envExists ? '✅ YES' : '❌ NO');

if (envExists) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  console.log('\n📄 .env.local content preview:');
  console.log(envContent.split('\n').slice(0, 5).join('\n') + '\n...');
}