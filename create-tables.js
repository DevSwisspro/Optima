#!/usr/bin/env node
/**
 * Simple table creation script for Todo Coach App
 * This creates the essential tables that the application needs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ntytkeasfjnwoehpzhtm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eXRrZWFzZmpud29laHB6aHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDIyMDAsImV4cCI6MjA3MjU3ODIwMH0.dGYlqy6bNUactQdI3ngBK6uYT2JyNVMsdx-nCdzG8dc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testTables() {
  console.log('🔍 Testing existing tables...');
  
  const tables = ['tasks', 'budget_items'];
  const results = {};
  
  for (const tableName of tables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        results[tableName] = `❌ ${error.message}`;
      } else {
        results[tableName] = '✅ Table exists and accessible';
      }
    } catch (err) {
      results[tableName] = `❌ Error: ${err.message}`;
    }
  }
  
  console.log('\n📊 Table Status:');
  Object.entries(results).forEach(([table, status]) => {
    console.log(`  ${table}: ${status}`);
  });
  
  // Check if any tables don't exist
  const missingTables = Object.entries(results)
    .filter(([table, status]) => status.includes('❌'))
    .map(([table, status]) => table);
  
  if (missingTables.length > 0) {
    console.log('\n⚠️  Missing tables detected:', missingTables.join(', '));
    console.log('\n🔧 To fix this, you need to create the tables manually:');
    console.log('1. Go to your Supabase Dashboard: https://ntytkeasfjnwoehpzhtm.supabase.co');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and execute the SQL from supabase_setup.sql file');
    console.log('\nThe minimal SQL for immediate functionality:');
    
    console.log(`
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT DEFAULT 'personal'
);

-- Create budget_items table
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their budget items" ON budget_items FOR ALL USING (auth.uid() = user_id);
`);
  } else {
    console.log('\n✅ All required tables exist! Your database is ready.');
  }
}

testTables();