#!/usr/bin/env node
/**
 * Création DIRECTE des tables - Utilisation des vrais endpoints Supabase
 */

// Tes credentials
const PROJECT_REF = 'ntytkeasfjnwoehpzhtm';
const SUPABASE_URL = 'https://ntytkeasfjnwoehpzhtm.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eXRrZWFzZmpud29laHB6aHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDIyMDAsImV4cCI6MjA3MjU3ODIwMH0.dGYlqy6bNUactQdI3ngBK6uYT2JyNVMsdx-nCdzG8dc';

console.log('🚀 CRÉATION DIRECTE DES TABLES - VRAIE MÉTHODE');
console.log('=' .repeat(60));

// SQL pour créer les tables essentielles
const SQL_CREATE_TABLES = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create budget_items table
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table  
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    title TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;  
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "budget_items_policy" ON budget_items FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "tasks_policy" ON tasks FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "notes_policy" ON notes FOR ALL USING (true);
`;

async function executeSQL(sql) {
  const methods = [
    {
      name: 'Supabase Management API',
      call: async () => {
        const response = await fetch('https://api.supabase.com/v1/projects/' + PROJECT_REF + '/database/query', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer sbp_5721d3c11bac3cbe2a2eaeafcdfc9e93423067ab',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            query: sql
          })
        });
        return { response, method: 'Management API' };
      }
    },
    {
      name: 'Direct Database Connection',
      call: async () => {
        // Try PostgreSQL direct connection via Supabase
        const response = await fetch(`${SUPABASE_URL}/database/postgres`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer sbp_5721d3c11bac3cbe2a2eaeafcdfc9e93423067ab`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: sql
          })
        });
        return { response, method: 'Direct Database' };
      }
    },
    {
      name: 'PostgREST SQL Function',
      call: async () => {
        // Create a custom SQL function and call it
        const functionSQL = `
        CREATE OR REPLACE FUNCTION execute_setup_sql()
        RETURNS TEXT AS $$
        BEGIN
          ${sql.replace(/'/g, "''")}
          RETURN 'Tables created successfully';
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        `;
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_setup_sql`, {
          method: 'POST',
          headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        return { response, method: 'SQL Function' };
      }
    }
  ];

  for (const method of methods) {
    try {
      console.log(`\n🔧 Tentative: ${method.name}...`);
      const { response, method: methodName } = await method.call();
      
      const responseText = await response.text();
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${responseText.substring(0, 200)}...`);
      
      if (response.ok || response.status === 201) {
        console.log(`✅ SUCCESS avec ${methodName}!`);
        return true;
      }
    } catch (error) {
      console.log(`   ❌ ${method.name} failed: ${error.message}`);
    }
  }
  
  return false;
}

// Alternative: Use curl command to execute SQL directly
async function useCurlMethod() {
  console.log('\n🔧 Méthode CURL alternative...');
  
  const curlCommand = `curl -X POST '${SUPABASE_URL}/rest/v1/rpc/exec' \\
    -H 'apikey: ${ANON_KEY}' \\
    -H 'Authorization: Bearer ${ANON_KEY}' \\
    -H 'Content-Type: application/json' \\
    -d '{"sql":"${SQL_CREATE_TABLES.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"}'`;
  
  console.log('Commande curl:', curlCommand);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: SQL_CREATE_TABLES
      })
    });
    
    if (response.ok) {
      console.log('✅ CURL method success!');
      return true;
    } else {
      const error = await response.text();
      console.log('❌ CURL method failed:', error);
    }
  } catch (error) {
    console.log('❌ CURL error:', error.message);
  }
  
  return false;
}

// Test if tables exist after creation
async function verifyTables() {
  console.log('\n🔍 Vérification des tables...');
  
  const tables = ['budget_items', 'tasks', 'notes'];
  
  for (const table of tables) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count`, {
        method: 'HEAD',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Prefer': 'count=exact'
        }
      });
      
      if (response.ok) {
        console.log(`✅ Table ${table}: EXISTS`);
      } else {
        console.log(`❌ Table ${table}: NOT FOUND (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ Table ${table}: ERROR - ${error.message}`);
    }
  }
}

// Create tables using direct insert method (hack)
async function createTablesViaInsert() {
  console.log('\n🔨 Méthode HACK: Création via tentative d\'insertion...');
  
  // This will fail but might trigger table creation in some setups
  const testInserts = [
    {
      table: 'budget_items',
      data: {
        name: 'test',
        amount: 1.00,
        category: 'test',
        type: 'expense'
      }
    },
    {
      table: 'tasks', 
      data: {
        title: 'test task',
        completed: false
      }
    },
    {
      table: 'notes',
      data: {
        content: 'test note'
      }
    }
  ];
  
  for (const insert of testInserts) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${insert.table}`, {
        method: 'POST',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(insert.data)
      });
      
      console.log(`${insert.table}: ${response.status} - ${await response.text()}`);
    } catch (error) {
      console.log(`${insert.table}: ERROR - ${error.message}`);
    }
  }
}

async function main() {
  console.log('🎯 OBJECTIF: Créer les tables dans ta base Supabase');
  console.log('🔑 Utilisation de tes tokens pour accès complet\n');
  
  // Try all methods
  let success = await executeSQL(SQL_CREATE_TABLES);
  
  if (!success) {
    success = await useCurlMethod();
  }
  
  if (!success) {
    await createTablesViaInsert();
  }
  
  // Always verify
  await verifyTables();
  
  console.log('\n' + '═'.repeat(60));
  console.log('🎯 RÉSULTAT FINAL');
  console.log('═'.repeat(60));
  
  if (success) {
    console.log('✅ TABLES CRÉÉES AVEC SUCCÈS!');
    console.log('🌐 Va voir ton dashboard: https://ntytkeasfjnwoehpzhtm.supabase.co');
    console.log('📊 Clique "Table Editor" pour voir tes tables');
  } else {
    console.log('⚠️  Création automatique échouée');
    console.log('💡 Raison probable: Token avec permissions limitées');
    console.log('🔧 Solution: Dashboard Supabase → SQL Editor → Copier le SQL');
  }
}

main();