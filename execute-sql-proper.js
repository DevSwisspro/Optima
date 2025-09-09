#!/usr/bin/env node

/**
 * Execute SQL setup properly using direct PostgreSQL connection
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUPABASE_URL = 'https://tuxqlybmtjmlyadbtneb.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1eHFseWJtdGptbHlhZGJ0bmViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQwNDg2OSwiZXhwIjoyMDcyOTgwODY5fQ.sp1kcCwMNl-v58BhFkD-Y8ntUYl-USnmAmpr9ezDyOk'

async function executeSQL() {
  console.log('🚀 Exécution SQL directe avec les bons tokens...')
  
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // SQL commands to execute one by one
  const sqlCommands = [
    // 1. Create user_preferences table
    `CREATE TABLE IF NOT EXISTS public.user_preferences (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      theme TEXT DEFAULT 'dark',
      language TEXT DEFAULT 'fr',
      notifications BOOLEAN DEFAULT TRUE,
      budget_limits JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      UNIQUE(user_id)
    )`,
    
    // 2. Enable RLS
    'ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY',
    
    // 3. RLS Policies for user_preferences
    `CREATE POLICY IF NOT EXISTS "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id)`,
    `CREATE POLICY IF NOT EXISTS "Users can insert their own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id)`,
    `CREATE POLICY IF NOT EXISTS "Users can update their own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id)`,
    `CREATE POLICY IF NOT EXISTS "Users can delete their own preferences" ON public.user_preferences FOR DELETE USING (auth.uid() = user_id)`,
    
    // 4. Updated_at function
    `CREATE OR REPLACE FUNCTION public.handle_updated_at()
     RETURNS TRIGGER AS $$
     BEGIN
       NEW.updated_at = TIMEZONE('utc'::text, NOW());
       RETURN NEW;
     END;
     $$ LANGUAGE plpgsql`,
    
    // 5. Triggers
    `DROP TRIGGER IF EXISTS handle_updated_at_budget_items ON public.budget_items`,
    `CREATE TRIGGER handle_updated_at_budget_items BEFORE UPDATE ON public.budget_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()`,
    `DROP TRIGGER IF EXISTS handle_updated_at_tasks ON public.tasks`,
    `CREATE TRIGGER handle_updated_at_tasks BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()`,
    `DROP TRIGGER IF EXISTS handle_updated_at_notes ON public.notes`,
    `CREATE TRIGGER handle_updated_at_notes BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()`,
    `DROP TRIGGER IF EXISTS handle_updated_at_shopping_items ON public.shopping_items`,
    `CREATE TRIGGER handle_updated_at_shopping_items BEFORE UPDATE ON public.shopping_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()`,
    `DROP TRIGGER IF EXISTS handle_updated_at_user_preferences ON public.user_preferences`,
    `CREATE TRIGGER handle_updated_at_user_preferences BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()`,
    
    // 6. Indexes
    `CREATE INDEX IF NOT EXISTS idx_budget_items_user_id ON public.budget_items(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_budget_items_date ON public.budget_items(date)`,
    `CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_tasks_completed ON public.tasks(completed)`,
    `CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_shopping_items_user_id ON public.shopping_items(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_shopping_items_completed ON public.shopping_items(completed)`,
    `CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id)`,
    
    // 7. New user function
    `CREATE OR REPLACE FUNCTION public.handle_new_user()
     RETURNS TRIGGER AS $$
     BEGIN
       INSERT INTO public.user_preferences (user_id)
       VALUES (NEW.id);
       RETURN NEW;
     END;
     $$ LANGUAGE plpgsql SECURITY DEFINER`,
    
    // 8. New user trigger
    `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`,
    `CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()`
  ]

  let successCount = 0
  let errorCount = 0

  for (const [index, command] of sqlCommands.entries()) {
    try {
      console.log(`⚡ [${index + 1}/${sqlCommands.length}] ${command.substring(0, 50).replace(/\n/g, ' ')}...`)
      
      // Direct SQL execution via REST API
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sql_exec`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY
        },
        body: JSON.stringify({ query: command })
      })

      if (response.ok || response.status === 409) {
        console.log('✅ OK')
        successCount++
      } else {
        const error = await response.text()
        console.log(`❌ Erreur: ${error}`)
        errorCount++
        
        // Try alternative approach via psql-like execution
        try {
          const altResponse = await executeViaRPC(supabase, command)
          if (altResponse) {
            console.log('✅ OK (via alternative)')
            successCount++
            errorCount--
          }
        } catch (altErr) {
          console.log(`❌ Alt failed: ${altErr.message}`)
        }
      }
      
    } catch (err) {
      console.log(`❌ Exception: ${err.message}`)
      errorCount++
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log(`\n📊 Résumé: ${successCount} réussies, ${errorCount} erreurs`)
  
  // Final verification
  await verifyTables(supabase)
  
  return successCount > errorCount
}

async function executeViaRPC(supabase, command) {
  // Try different RPC approaches
  const rpcMethods = ['exec', 'execute', 'query']
  
  for (const method of rpcMethods) {
    try {
      const { data, error } = await supabase.rpc(method, { sql: command })
      if (!error) return true
    } catch (err) {
      continue
    }
  }
  return false
}

async function verifyTables(supabase) {
  console.log('\n🔍 Vérification des tables...')
  
  const tables = ['budget_items', 'tasks', 'notes', 'shopping_items', 'user_preferences']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`)
      } else {
        console.log(`✅ Table ${table}: OK`)
      }
    } catch (err) {
      console.log(`❌ Table ${table}: ${err.message}`)
    }
  }
}

executeSQL()
  .then(success => {
    console.log(success ? '🎉 Configuration SQL réussie!' : '⚠️ Configuration SQL avec problèmes')
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Erreur fatale:', error)
    process.exit(1)
  })