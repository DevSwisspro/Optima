-- SCHÉMA COMPLET SUPABASE POUR TODO COACH APP
-- Exécuter ce script dans le SQL Editor de Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLE BUDGET_ITEMS (Budget et transactions financières)
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('revenus', 'depenses_fixes', 'depenses_variables', 'epargne', 'investissements')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE TASKS (Tâches et TO-DO)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    category TEXT DEFAULT 'personal',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE NOTES (Notes et mémos)
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE SHOPPING_ITEMS (Liste de courses)
CREATE TABLE IF NOT EXISTS shopping_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit TEXT DEFAULT 'p',
    category TEXT DEFAULT 'courant',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE RECURRING_EXPENSES (Dépenses récurrentes)
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    day_of_month INTEGER DEFAULT 1 CHECK (day_of_month >= 1 AND day_of_month <= 31),
    next_due_date DATE NOT NULL,
    last_applied_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLE BUDGET_LIMITS (Limites de budget par catégorie)
CREATE TABLE IF NOT EXISTS budget_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category_type TEXT NOT NULL,
    category_name TEXT NOT NULL,
    limit_amount DECIMAL(10,2) NOT NULL,
    period TEXT DEFAULT 'monthly' CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category_type, category_name, period)
);

-- 7. TABLE USER_PREFERENCES (Préférences utilisateur)
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    theme TEXT DEFAULT 'dark',
    currency TEXT DEFAULT 'CHF',
    language TEXT DEFAULT 'fr',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    dashboard_layout JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_budget_items_user_id ON budget_items(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_date ON budget_items(date);
CREATE INDEX IF NOT EXISTS idx_budget_items_type ON budget_items(type);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_user_id ON shopping_items(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_limits_user_id ON budget_limits(user_id);

-- Activer Row Level Security sur toutes les tables
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can manage their budget items" ON budget_items;
DROP POLICY IF EXISTS "Users can manage their tasks" ON tasks;
DROP POLICY IF EXISTS "Users can manage their notes" ON notes;
DROP POLICY IF EXISTS "Users can manage their shopping items" ON shopping_items;
DROP POLICY IF EXISTS "Users can manage their recurring expenses" ON recurring_expenses;
DROP POLICY IF EXISTS "Users can manage their budget limits" ON budget_limits;
DROP POLICY IF EXISTS "Users can manage their preferences" ON user_preferences;

-- Créer les politiques RLS (Row Level Security)
CREATE POLICY "Users can manage their budget items" ON budget_items
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their tasks" ON tasks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their notes" ON notes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their shopping items" ON shopping_items
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their recurring expenses" ON recurring_expenses
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their budget limits" ON budget_limits
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Fonction pour auto-update des timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer les anciens triggers s'ils existent
DROP TRIGGER IF EXISTS update_budget_items_updated_at ON budget_items;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
DROP TRIGGER IF EXISTS update_shopping_items_updated_at ON shopping_items;
DROP TRIGGER IF EXISTS update_recurring_expenses_updated_at ON recurring_expenses;
DROP TRIGGER IF EXISTS update_budget_limits_updated_at ON budget_limits;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;

-- Créer les triggers pour auto-update des timestamps
CREATE TRIGGER update_budget_items_updated_at
    BEFORE UPDATE ON budget_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_items_updated_at
    BEFORE UPDATE ON shopping_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_expenses_updated_at
    BEFORE UPDATE ON recurring_expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_limits_updated_at
    BEFORE UPDATE ON budget_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour gérer les dépenses récurrentes automatiquement
CREATE OR REPLACE FUNCTION process_recurring_expenses()
RETURNS void AS $$
DECLARE
    expense_record RECORD;
    new_expense_date DATE;
BEGIN
    FOR expense_record IN 
        SELECT * FROM recurring_expenses 
        WHERE is_active = true 
        AND next_due_date <= CURRENT_DATE
    LOOP
        -- Insérer la dépense récurrente dans budget_items
        INSERT INTO budget_items (user_id, name, amount, category, type, date, description)
        VALUES (
            expense_record.user_id,
            expense_record.name,
            expense_record.amount,
            expense_record.category,
            'depenses_fixes',
            expense_record.next_due_date,
            'Dépense récurrente automatique'
        );
        
        -- Calculer la prochaine date
        CASE expense_record.frequency
            WHEN 'daily' THEN
                new_expense_date := expense_record.next_due_date + INTERVAL '1 day';
            WHEN 'weekly' THEN
                new_expense_date := expense_record.next_due_date + INTERVAL '1 week';
            WHEN 'monthly' THEN
                new_expense_date := (DATE_TRUNC('month', expense_record.next_due_date) + INTERVAL '1 month' + (expense_record.day_of_month - 1) * INTERVAL '1 day')::DATE;
            WHEN 'yearly' THEN
                new_expense_date := expense_record.next_due_date + INTERVAL '1 year';
        END CASE;
        
        -- Mettre à jour la prochaine date
        UPDATE recurring_expenses 
        SET next_due_date = new_expense_date,
            last_applied_date = expense_record.next_due_date
        WHERE id = expense_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;