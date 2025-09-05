#!/usr/bin/env node
/**
 * Exécution directe SQL via curl/fetch
 * Simulation d'une requête SQL comme si on était dans le dashboard
 */

const SUPABASE_PROJECT_REF = 'ntytkeasfjnwoehpzhtm';
const SUPABASE_URL = 'https://ntytkeasfjnwoehpzhtm.supabase.co';
const SUPABASE_SERVICE_KEY = 'sbp_5721d3c11bac3cbe2a2eaeafcdfc9e93423067ab';

console.log('🔧 EXÉCUTION DIRECTE SQL - CRÉATION FORCÉE DES TABLES');
console.log('=' .repeat(65));

// SQL simple et direct
const BASIC_TABLES_SQL = `
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create budget_items table
CREATE TABLE budget_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    name TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table  
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notes table
CREATE TABLE notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, 
    title TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
`;

async function createTablesDirectly() {
  console.log('🔨 Création des tables de base...\n');

  try {
    // Method 1: Try with REST API using service key
    console.log('📡 Méthode REST API avec service key...');
    
    const restResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: BASIC_TABLES_SQL
      })
    });

    console.log('Status REST:', restResponse.status);
    const restResult = await restResponse.text();
    console.log('Response REST:', restResult);

    if (restResponse.ok) {
      console.log('✅ Tables créées via REST API');
      return true;
    }

  } catch (error) {
    console.log('❌ Erreur REST API:', error.message);
  }

  // Method 2: Try individual table creation
  console.log('\n🔧 Création table par table...\n');
  
  const individualTables = [
    {
      name: 'budget_items',
      sql: `CREATE TABLE IF NOT EXISTS budget_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID,
        name TEXT NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL,
        date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`
    },
    {
      name: 'tasks', 
      sql: `CREATE TABLE IF NOT EXISTS tasks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`
    },
    {
      name: 'notes',
      sql: `CREATE TABLE IF NOT EXISTS notes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`
    }
  ];

  let successCount = 0;

  for (const table of individualTables) {
    console.log(`📝 Création table ${table.name}...`);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sql: table.sql
        })
      });

      if (response.ok) {
        console.log(`  ✅ ${table.name} créée`);
        successCount++;
      } else {
        const error = await response.text();
        console.log(`  ❌ ${table.name} failed: ${error}`);
      }
    } catch (error) {
      console.log(`  ❌ ${table.name} error: ${error.message}`);
    }
  }

  return successCount > 0;
}

async function testTablesExistence() {
  console.log('\n🔍 Test d\'existence des tables...\n');
  
  const tables = ['budget_items', 'tasks', 'notes'];
  
  for (const table of tables) {
    try {
      // Try to insert a test row (will fail if table doesn't exist)
      const testData = {
        [table === 'budget_items' ? 'name' : table === 'tasks' ? 'title' : 'content']: 'test',
        ...(table === 'budget_items' && { amount: 1, category: 'test', type: 'expense' })
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(testData)
      });

      if (response.status === 201) {
        console.log(`✅ Table ${table}: Existe et fonctionnelle`);
        
        // Delete test data
        await fetch(`${SUPABASE_URL}/rest/v1/${table}?${table === 'budget_items' ? 'name' : table === 'tasks' ? 'title' : 'content'}=eq.test`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          }
        });
      } else {
        const errorText = await response.text();
        console.log(`❌ Table ${table}: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Table ${table}: ${error.message}`);
    }
  }
}

async function forceRefreshSchema() {
  console.log('\n🔄 Forçage du rafraîchissement du schéma...\n');
  
  try {
    // Try to force PostgREST schema refresh
    const refreshResponse = await fetch(`${SUPABASE_URL}/rest/v1/?`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });

    console.log('📊 Schema refresh status:', refreshResponse.status);
    
    if (refreshResponse.ok) {
      console.log('✅ Schéma rafraîchi');
    }
  } catch (error) {
    console.log('⚠️  Impossible de forcer le rafraîchissement');
  }
}

async function main() {
  const created = await createTablesDirectly();
  
  if (created) {
    console.log('\n⏳ Attente du rafraîchissement du cache...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
    
    await forceRefreshSchema();
    await testTablesExistence();
  }

  console.log('\n' + '═'.repeat(65));
  console.log('🎯 RÉSULTATS ET VÉRIFICATION');
  console.log('═'.repeat(65));
  console.log('\n📍 Pour vérifier dans ton dashboard:');
  console.log('1. Va sur: https://ntytkeasfjnwoehpzhtm.supabase.co');
  console.log('2. Clique sur "Table Editor"');
  console.log('3. Tu devrais voir: budget_items, tasks, notes');
  console.log('\n🔄 Si elles n\'apparaissent pas, attend 1-2 minutes et rafraîchis');
}

main();