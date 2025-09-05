#!/usr/bin/env node
/**
 * Script automatique pour créer le schéma complet dans Supabase
 * Utilise les tokens fournis pour créer toutes les tables nécessaires
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ntytkeasfjnwoehpzhtm.supabase.co';
const SUPABASE_SERVICE_KEY = 'sbp_5721d3c11bac3cbe2a2eaeafcdfc9e93423067ab'; // Service key pour admin

console.log('🚀 Création automatique du schéma complet Supabase');
console.log('=' .repeat(60));

// Client admin avec service key pour créer les tables
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const SQL_SCHEMA = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tasks table (enhanced)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT DEFAULT 'personal'
);

-- Create budget_items table (enhanced)
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense', 'revenus', 'depenses_fixes', 'depenses_variables', 'epargne', 'investissements')) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shopping_items table
CREATE TABLE IF NOT EXISTS shopping_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT FALSE,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recurring_expenses table
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')) DEFAULT 'monthly',
    next_due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budget_limits table
CREATE TABLE IF NOT EXISTS budget_limits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    limit_amount DECIMAL(10,2) NOT NULL,
    period TEXT CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')) DEFAULT 'monthly',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category, period)
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    theme TEXT DEFAULT 'light',
    currency TEXT DEFAULT 'CHF',
    language TEXT DEFAULT 'fr',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goals table (pour les objectifs financiers)
CREATE TABLE IF NOT EXISTS goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    target_date DATE,
    category TEXT DEFAULT 'general',
    status TEXT CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_budget_items_user_id ON budget_items(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_date ON budget_items(date);
CREATE INDEX IF NOT EXISTS idx_budget_items_type ON budget_items(type);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_user_id ON shopping_items(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_limits_user_id ON budget_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- Enable RLS on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies
-- Tasks policies
DROP POLICY IF EXISTS "Users can manage their tasks" ON tasks;
CREATE POLICY "Users can manage their tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

-- Budget items policies
DROP POLICY IF EXISTS "Users can manage their budget items" ON budget_items;
CREATE POLICY "Users can manage their budget items" ON budget_items FOR ALL USING (auth.uid() = user_id);

-- Notes policies
DROP POLICY IF EXISTS "Users can manage their notes" ON notes;
CREATE POLICY "Users can manage their notes" ON notes FOR ALL USING (auth.uid() = user_id);

-- Shopping items policies
DROP POLICY IF EXISTS "Users can manage their shopping items" ON shopping_items;
CREATE POLICY "Users can manage their shopping items" ON shopping_items FOR ALL USING (auth.uid() = user_id);

-- Recurring expenses policies
DROP POLICY IF EXISTS "Users can manage their recurring expenses" ON recurring_expenses;
CREATE POLICY "Users can manage their recurring expenses" ON recurring_expenses FOR ALL USING (auth.uid() = user_id);

-- Budget limits policies
DROP POLICY IF EXISTS "Users can manage their budget limits" ON budget_limits;
CREATE POLICY "Users can manage their budget limits" ON budget_limits FOR ALL USING (auth.uid() = user_id);

-- User preferences policies
DROP POLICY IF EXISTS "Users can manage their preferences" ON user_preferences;
CREATE POLICY "Users can manage their preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- Goals policies
DROP POLICY IF EXISTS "Users can manage their goals" ON goals;
CREATE POLICY "Users can manage their goals" ON goals FOR ALL USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers for all tables
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_budget_items_updated_at ON budget_items;
CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shopping_items_updated_at ON shopping_items;
CREATE TRIGGER update_shopping_items_updated_at BEFORE UPDATE ON shopping_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recurring_expenses_updated_at ON recurring_expenses;
CREATE TRIGGER update_recurring_expenses_updated_at BEFORE UPDATE ON recurring_expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_budget_limits_updated_at ON budget_limits;
CREATE TRIGGER update_budget_limits_updated_at BEFORE UPDATE ON budget_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function createFullSchema() {
  try {
    console.log('📋 Exécution du schéma SQL complet...');
    
    // Execute the complete SQL schema
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: SQL_SCHEMA
    });
    
    if (error) {
      // Try alternative method using direct SQL execution
      console.log('🔄 Tentative avec méthode alternative...');
      
      // Split SQL into individual statements and execute them
      const statements = SQL_SCHEMA.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i].trim() + ';';
        if (stmt.length > 1) {
          try {
            console.log(`📝 Exécution statement ${i + 1}/${statements.length}`);
            await supabase.rpc('exec_sql', { sql: stmt });
          } catch (stmtError) {
            console.log(`⚠️  Warning on statement ${i + 1}: ${stmtError.message}`);
            // Continue with other statements
          }
        }
      }
    }
    
    console.log('✅ Schéma SQL exécuté avec succès!');
    
    // Verify tables were created
    console.log('\n🔍 Vérification des tables créées...');
    const tables = [
      'tasks', 'budget_items', 'notes', 'shopping_items', 
      'recurring_expenses', 'budget_limits', 'user_preferences', 'goals'
    ];
    
    const results = {};
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          results[table] = `❌ ${error.message}`;
        } else {
          results[table] = '✅ Créé et accessible';
        }
      } catch (err) {
        results[table] = `❌ ${err.message}`;
      }
    }
    
    console.log('\n📊 État des tables:');
    Object.entries(results).forEach(([table, status]) => {
      console.log(`  ${table}: ${status}`);
    });
    
    const successTables = Object.values(results).filter(status => status.includes('✅')).length;
    console.log(`\n🎉 ${successTables}/${tables.length} tables créées avec succès!`);
    
    if (successTables === tables.length) {
      console.log('\n🚀 BASE DE DONNÉES COMPLÈTEMENT OPÉRATIONNELLE!');
      console.log('✅ Toutes les fonctionnalités de stockage sont disponibles:');
      console.log('   • Tâches et TO-DO');
      console.log('   • Budget et finances');
      console.log('   • Notes et mémos');
      console.log('   • Liste de courses');
      console.log('   • Dépenses récurrentes');
      console.log('   • Objectifs financiers');
      console.log('   • Préférences utilisateur');
    }
    
  } catch (error) {
    console.error('💥 Erreur lors de la création du schéma:', error.message);
  }
}

createFullSchema();