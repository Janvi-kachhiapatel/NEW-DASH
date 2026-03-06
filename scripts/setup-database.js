#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🗄️ Biz Gallery Database Setup');
console.log('=====================================');

// Check if .env file exists
const envPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('Please create .env.local with your Supabase credentials:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('');
  console.log('Then run: npm run db:migrate');
  process.exit(1);
}

console.log('✅ Environment file found');
console.log('');
console.log('📝 Next Steps:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Go to Settings > Database > Reset database password');
console.log('3. Run: npm run db:migrate');
console.log('');
console.log('🚀 Your Biz Gallery will be ready!');
