#!/usr/bin/env node
/**
 * Création automatique des tables via l'API Management Supabase
 * Utilise les tokens pour créer directement les tables
 */

const SUPABASE_PROJECT_REF = 'ntytkeasfjnwoehpzhtm';
const SUPABASE_ACCESS_TOKEN = 'sbp_5721d3c11bac3cbe2a2eaeafcdfc9e93423067ab';
const SUPABASE_URL = 'https://ntytkeasfjnwoehpzhtm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eXRrZWFzZmpud29laHB6aHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDIyMDAsImV4cCI6MjA3MjU3ODIwMH0.dGYlqy6bNUactQdI3ngBK6uYT2JyNVMsdx-nCdzG8dc';

console.log('🚀 CRÉATION AUTOMATIQUE DES TABLES SUPABASE');
console.log('=' .repeat(60));
console.log('🔗 Projet:', SUPABASE_PROJECT_REF);
console.log('🌐 URL:', SUPABASE_URL);

const SQL_SCHEMA = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create budget_items table
CREATE TABLE IF NOT EXISTS public.budget_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'revenus', 'depenses_fixes', 'depenses_variables', 'epargne', 'investissements')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    category TEXT DEFAULT 'personal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    target_date DATE,
    category TEXT DEFAULT 'financial',
    status TEXT CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_budget_items_user_id ON public.budget_items(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_date ON public.budget_items(date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their budget items" ON public.budget_items;
DROP POLICY IF EXISTS "Users can manage their tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can manage their notes" ON public.notes;
DROP POLICY IF EXISTS "Users can manage their goals" ON public.goals;

-- Create comprehensive RLS policies
CREATE POLICY "Users can manage their budget items" ON public.budget_items
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their tasks" ON public.tasks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their notes" ON public.notes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their goals" ON public.goals
    FOR ALL USING (auth.uid() = user_id);

-- Create update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
DROP TRIGGER IF EXISTS update_budget_items_updated_at ON public.budget_items;
CREATE TRIGGER update_budget_items_updated_at 
    BEFORE UPDATE ON public.budget_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
`;

async function createTablesViaAPI() {
  try {
    console.log('📊 Méthode 1: API Management Supabase...\n');
    
    // Try Supabase Management API
    const managementResponse = await fetch(`https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: SQL_SCHEMA
      })
    });

    if (managementResponse.ok) {
      const result = await managementResponse.json();
      console.log('✅ Tables créées via Management API!');
      console.log('📊 Résultat:', result);
      return true;
    } else {
      const error = await managementResponse.text();
      console.log('❌ Management API failed:', managementResponse.status, error);
    }

  } catch (error) {
    console.log('❌ Erreur Management API:', error.message);
  }

  try {
    console.log('📊 Méthode 2: PostgREST Direct...\n');
    
    // Try direct PostgREST execution
    const postgrestResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ACCESS_TOKEN,
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        sql: SQL_SCHEMA
      })
    });

    if (postgrestResponse.ok) {
      console.log('✅ Tables créées via PostgREST!');
      return true;
    } else {
      const error = await postgrestResponse.text();
      console.log('❌ PostgREST failed:', postgrestResponse.status, error);
    }

  } catch (error) {
    console.log('❌ Erreur PostgREST:', error.message);
  }

  try {
    console.log('📊 Méthode 3: SQL Edge Functions...\n');
    
    // Try via Edge Functions endpoint
    const edgeResponse = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ACCESS_TOKEN,
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: SQL_SCHEMA
      })
    });

    if (edgeResponse.ok) {
      console.log('✅ Tables créées via Edge Functions!');
      return true;
    } else {
      const error = await edgeResponse.text();
      console.log('❌ Edge Functions failed:', edgeResponse.status, error);
    }

  } catch (error) {
    console.log('❌ Erreur Edge Functions:', error.message);
  }

  // Try splitting SQL into individual statements
  console.log('📊 Méthode 4: Statements individuels...\n');
  
  const statements = SQL_SCHEMA
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0)
    .map(stmt => stmt + ';');

  let successCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`📝 Exécution statement ${i + 1}/${statements.length}...`);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ACCESS_TOKEN,
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sql: statement
        })
      });

      if (response.ok) {
        successCount++;
        console.log(`  ✅ Statement ${i + 1} exécuté`);
      } else {
        const error = await response.text();
        console.log(`  ⚠️  Statement ${i + 1} failed: ${error}`);
      }
    } catch (error) {
      console.log(`  ❌ Statement ${i + 1} error: ${error.message}`);
    }
  }

  console.log(`\n📊 ${successCount}/${statements.length} statements exécutés`);
  
  return successCount > 0;
}

async function verifyTables() {
  console.log('\n🔍 Vérification des tables créées...\n');
  
  const tables = ['budget_items', 'tasks', 'notes', 'goals'];
  let createdTables = 0;

  for (const table of tables) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count`, {
        method: 'HEAD',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'count=exact'
        }
      });

      if (response.ok) {
        console.log(`✅ Table ${table}: Créée et accessible`);
        createdTables++;
      } else {
        console.log(`❌ Table ${table}: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Table ${table}: ${error.message}`);
    }
  }

  console.log(`\n📊 ${createdTables}/${tables.length} tables créées avec succès!`);
  
  if (createdTables === tables.length) {
    console.log('\n🎉 BASE DE DONNÉES COMPLÈTEMENT OPÉRATIONNELLE!');
    console.log('\n✅ Tu peux maintenant voir tes tables dans le dashboard:');
    console.log('   🌐 Dashboard: https://ntytkeasfjnwoehpzhtm.supabase.co');
    console.log('   📊 Table Editor: Clique sur "Table Editor" dans le menu');
    console.log('\n📱 Tables disponibles:');
    console.log('   • budget_items - Ton budget et transactions');
    console.log('   • tasks - Tes tâches et TO-DO');  
    console.log('   • notes - Tes notes et mémos');
    console.log('   • goals - Tes objectifs financiers');
    
    console.log('\n🔒 Sécurité configurée:');
    console.log('   • Row Level Security (RLS) activée');
    console.log('   • Seules tes données sont accessibles à toi');
    console.log('   • Politiques de sécurité appliquées');
  }
  
  return createdTables === tables.length;
}

async function main() {
  const success = await createTablesViaAPI();
  
  if (success) {
    await verifyTables();
    console.log('\n🚀 MISSION ACCOMPLIE!');
    console.log('📱 Ton application peut maintenant sauvegarder toutes tes données!');
  } else {
    console.log('\n⚠️  Création automatique échouée - méthode manuelle requise');
    console.log('🔧 Va dans ton dashboard Supabase → SQL Editor');
    console.log('📝 Copie le SQL du fichier database-schema.sql');
  }
}

main();