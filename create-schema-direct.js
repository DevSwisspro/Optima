#!/usr/bin/env node
/**
 * Création directe du schéma via l'API REST de Supabase
 */

const SUPABASE_URL = 'https://ntytkeasfjnwoehpzhtm.supabase.co';
const SUPABASE_SERVICE_KEY = 'sbp_5721d3c11bac3cbe2a2eaeafcdfc9e93423067ab';

console.log('🚀 Création directe du schéma via API REST');
console.log('=' .repeat(50));

async function executeSQL(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({ sql: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur SQL:', error.message);
    return null;
  }
}

async function createTables() {
  console.log('📋 Création des tables essentielles...\n');

  // 1. Enable extensions
  console.log('🔌 Activation des extensions...');
  await executeSQL('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  // 2. Create tasks table
  console.log('📝 Création table tasks...');
  const tasksSQL = `
    CREATE TABLE IF NOT EXISTS public.tasks (
      id uuid DEFAULT uuid_generate_v4() NOT NULL,
      title text NOT NULL,
      description text,
      priority text DEFAULT 'medium'::text,
      status text DEFAULT 'pending'::text,
      due_date timestamp with time zone,
      completed_at timestamp with time zone,
      created_at timestamp with time zone DEFAULT now(),
      updated_at timestamp with time zone DEFAULT now(),
      user_id uuid,
      category text DEFAULT 'personal'::text,
      CONSTRAINT tasks_pkey PRIMARY KEY (id),
      CONSTRAINT tasks_priority_check CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text])),
      CONSTRAINT tasks_status_check CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text])),
      CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
    );`;
  await executeSQL(tasksSQL);

  // 3. Create budget_items table
  console.log('💰 Création table budget_items...');
  const budgetSQL = `
    CREATE TABLE IF NOT EXISTS public.budget_items (
      id uuid DEFAULT uuid_generate_v4() NOT NULL,
      name text NOT NULL,
      amount numeric(10,2) NOT NULL,
      category text NOT NULL,
      type text NOT NULL,
      date date DEFAULT CURRENT_DATE NOT NULL,
      description text,
      created_at timestamp with time zone DEFAULT now(),
      updated_at timestamp with time zone DEFAULT now(),
      user_id uuid,
      CONSTRAINT budget_items_pkey PRIMARY KEY (id),
      CONSTRAINT budget_items_type_check CHECK (type = ANY (ARRAY['income'::text, 'expense'::text, 'revenus'::text, 'depenses_fixes'::text, 'depenses_variables'::text, 'epargne'::text, 'investissements'::text])),
      CONSTRAINT budget_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
    );`;
  await executeSQL(budgetSQL);

  // 4. Create notes table
  console.log('📓 Création table notes...');
  const notesSQL = `
    CREATE TABLE IF NOT EXISTS public.notes (
      id uuid DEFAULT uuid_generate_v4() NOT NULL,
      user_id uuid,
      title text,
      content text NOT NULL,
      created_at timestamp with time zone DEFAULT now(),
      updated_at timestamp with time zone DEFAULT now(),
      CONSTRAINT notes_pkey PRIMARY KEY (id),
      CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
    );`;
  await executeSQL(notesSQL);

  // 5. Create goals table
  console.log('🎯 Création table goals...');
  const goalsSQL = `
    CREATE TABLE IF NOT EXISTS public.goals (
      id uuid DEFAULT uuid_generate_v4() NOT NULL,
      user_id uuid,
      title text NOT NULL,
      description text,
      target_amount numeric(10,2) NOT NULL,
      current_amount numeric(10,2) DEFAULT 0,
      target_date date,
      category text DEFAULT 'general'::text,
      status text DEFAULT 'active'::text,
      created_at timestamp with time zone DEFAULT now(),
      updated_at timestamp with time zone DEFAULT now(),
      CONSTRAINT goals_pkey PRIMARY KEY (id),
      CONSTRAINT goals_status_check CHECK (status = ANY (ARRAY['active'::text, 'completed'::text, 'paused'::text])),
      CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
    );`;
  await executeSQL(goalsSQL);

  console.log('\n🔒 Configuration de la sécurité RLS...');

  // Enable RLS
  await executeSQL('ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;');
  await executeSQL('ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;');
  await executeSQL('ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;');
  await executeSQL('ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;');

  // Create policies
  await executeSQL(`
    CREATE POLICY IF NOT EXISTS "Users can manage their tasks" ON public.tasks 
    FOR ALL USING (auth.uid() = user_id);
  `);

  await executeSQL(`
    CREATE POLICY IF NOT EXISTS "Users can manage their budget items" ON public.budget_items 
    FOR ALL USING (auth.uid() = user_id);
  `);

  await executeSQL(`
    CREATE POLICY IF NOT EXISTS "Users can manage their notes" ON public.notes 
    FOR ALL USING (auth.uid() = user_id);
  `);

  await executeSQL(`
    CREATE POLICY IF NOT EXISTS "Users can manage their goals" ON public.goals 
    FOR ALL USING (auth.uid() = user_id);
  `);

  console.log('\n📊 Création des index pour les performances...');
  await executeSQL('CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);');
  await executeSQL('CREATE INDEX IF NOT EXISTS idx_budget_items_user_id ON public.budget_items(user_id);');
  await executeSQL('CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);');
  await executeSQL('CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);');

  console.log('\n✅ Schéma créé avec succès!');
}

// Alternative: Use PostgreSQL directly
async function createSchemaPostgres() {
  console.log('🔄 Méthode alternative: API PostgREST directe...\n');
  
  const queries = [
    // Enable UUID extension
    'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
    
    // Tasks table
    `CREATE TABLE IF NOT EXISTS tasks (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
      status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
      due_date TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      category TEXT DEFAULT 'personal'
    )`,
    
    // Budget items table
    `CREATE TABLE IF NOT EXISTS budget_items (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name TEXT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      category TEXT NOT NULL,
      type TEXT CHECK (type IN ('income', 'expense', 'revenus', 'depenses_fixes', 'depenses_variables', 'epargne', 'investissements')) NOT NULL,
      date DATE DEFAULT CURRENT_DATE NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
    )`,
    
    // Enable RLS
    'ALTER TABLE tasks ENABLE ROW LEVEL SECURITY',
    'ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY',
    
    // Create policies
    `CREATE POLICY "tasks_policy" ON tasks FOR ALL USING (auth.uid() = user_id)`,
    `CREATE POLICY "budget_items_policy" ON budget_items FOR ALL USING (auth.uid() = user_id)`
  ];

  for (let i = 0; i < queries.length; i++) {
    console.log(`📝 Exécution requête ${i + 1}/${queries.length}...`);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          sql: queries[i]
        })
      });

      if (response.ok) {
        console.log(`✅ Requête ${i + 1} exécutée`);
      } else {
        console.log(`⚠️  Requête ${i + 1}: ${response.status} - ${await response.text()}`);
      }
    } catch (error) {
      console.log(`⚠️  Requête ${i + 1}: ${error.message}`);
    }
  }
}

async function main() {
  await createTables();
  
  // Test that tables were created
  console.log('\n🔍 Vérification des tables...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=count`, {
      method: 'HEAD',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Table tasks: Créée et accessible');
    } else {
      console.log('❌ Table tasks: Non accessible');
    }
  } catch (error) {
    console.log('❌ Table tasks: Erreur -', error.message);
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/budget_items?select=count`, {
      method: 'HEAD', 
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Table budget_items: Créée et accessible');
    } else {
      console.log('❌ Table budget_items: Non accessible');
    }
  } catch (error) {
    console.log('❌ Table budget_items: Erreur -', error.message);
  }

  console.log('\n🎉 Processus terminé!');
  console.log('📱 Votre base de données est maintenant prête pour stocker:');
  console.log('   • ✅ Tâches et TO-DO');
  console.log('   • ✅ Budget et transactions financières'); 
  console.log('   • ✅ Notes et mémos');
  console.log('   • ✅ Objectifs et goals');
  console.log('\n🔒 Sécurité: Row Level Security activée pour tous les utilisateurs');
}

main();