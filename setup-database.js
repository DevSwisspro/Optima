#!/usr/bin/env node
/**
 * Supabase Database Setup Script
 * This script sets up the complete database schema for the Todo Coach App
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ntytkeasfjnwoehpzhtm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eXRrZWFzZmpud29laHB6aHRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAwMjIwMCwiZXhwIjoyMDcyNTc4MjAwfQ.B8V2qNQHgJqzHw7zG8WqBG3L1wHwGnMK7ZjJsz-Q5nY';

console.log('🚀 Starting Supabase Database Setup...');
console.log('📍 Supabase URL:', SUPABASE_URL);

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  try {
    console.log('📖 Reading SQL setup file...');
    const sqlContent = readFileSync(join(__dirname, 'supabase_setup.sql'), 'utf8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement.trim()) continue;

      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });

        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err.message);
        errorCount++;
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📊 Setup Summary:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);

    if (errorCount === 0) {
      console.log('🎉 Database setup completed successfully!');
      
      // Test the database by checking if tables exist
      console.log('\n🔍 Verifying table creation...');
      await verifyTables();
      
    } else {
      console.log('⚠️ Database setup completed with some errors. Please check the logs above.');
    }

  } catch (error) {
    console.error('💥 Fatal error during database setup:', error);
    process.exit(1);
  }
}

async function verifyTables() {
  const expectedTables = [
    'tasks',
    'budget_items', 
    'notes',
    'shopping_items',
    'recurring_expenses',
    'budget_limits',
    'user_preferences',
    'budget_categories'
  ];

  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ Table '${tableName}': ${error.message}`);
      } else {
        console.log(`✅ Table '${tableName}': OK`);
      }
    } catch (err) {
      console.log(`❌ Table '${tableName}': ${err.message}`);
    }
  }
}

// Alternative approach if the RPC doesn't work - execute each SQL statement individually
async function setupDatabaseDirect() {
  try {
    console.log('📖 Using direct SQL execution approach...');
    
    // Test connection first
    const { data: connectionTest, error: connectionError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message);
      return;
    }

    console.log('✅ Connection to Supabase established');

    // Since we can't execute arbitrary SQL directly, we'll use the REST API
    // Let's at least verify we can connect and show what tables exist
    const { data: existingTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('❌ Error fetching tables:', tablesError.message);
    } else {
      console.log('📋 Existing tables:');
      existingTables?.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }

    console.log('\n⚠️  Note: For complete database setup, you need to:');
    console.log('1. Go to your Supabase Dashboard: https://app.supabase.com');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Copy and paste the contents of supabase_setup.sql');
    console.log('4. Execute the SQL script');
    console.log('\nAlternatively, if you have the service role key, update this script.');

  } catch (error) {
    console.error('💥 Error during direct setup:', error);
  }
}

// Run the setup
console.log('🎯 Attempting database setup...');
setupDatabase().catch(async (error) => {
  console.log('⚠️ Primary method failed, trying alternative approach...');
  await setupDatabaseDirect();
});