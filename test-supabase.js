#!/usr/bin/env node
/**
 * Test Supabase Connection and Current State
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ntytkeasfjnwoehpzhtm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eXRrZWFzZmpud29laHB6aHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDIyMDAsImV4cCI6MjA3MjU3ODIwMH0.dGYlqy6bNUactQdI3ngBK6uYT2JyNVMsdx-nCdzG8dc';

console.log('🔍 Testing Supabase Connection...');
console.log('📍 URL:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    // Test 1: Basic connection
    console.log('\n🔌 Testing basic connection...');
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('✅ Connection successful (table not found is expected)');
      } else {
        console.log('❌ Connection failed:', error.message);
        return;
      }
    }

    // Test 2: Check what tables exist
    console.log('\n📋 Checking existing tables...');
    
    const tables = ['tasks', 'budget_items', 'notes', 'shopping_items', 'recurring_expenses', 'budget_limits', 'user_preferences'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': Exists and accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
      }
    }

    // Test 3: Try to create a simple table if none exist
    console.log('\n🧪 Testing table creation capabilities...');
    console.log('📝 Note: This test uses the anon key, so it may not have permission to create tables.');
    console.log('🔧 For full database setup, you need to:');
    console.log('   1. Go to https://ntytkeasfjnwoehpzhtm.supabase.co (your Supabase dashboard)');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy the contents from supabase_setup.sql');
    console.log('   4. Execute the SQL script in the dashboard');

  } catch (error) {
    console.error('💥 Connection test failed:', error.message);
  }
}

testConnection();