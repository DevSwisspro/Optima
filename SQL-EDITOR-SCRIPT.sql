-- ============================================================================
-- OPTIMA - Script SQL complet et optimisé pour SQL Editor
-- Copier-coller ce script COMPLET dans Supabase SQL Editor
-- ============================================================================

-- 1. CRÉATION DES TABLES
-- ============================================================================

-- Table budget_items (gestion financière)
CREATE TABLE public.budget_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('revenus', 'depenses_fixes', 'depenses_variables', 'epargne', 'investissements')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table tasks (gestion des tâches)
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table notes (notes personnelles)
CREATE TABLE public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table shopping_items (liste de courses)
CREATE TABLE public.shopping_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit TEXT DEFAULT 'pièce(s)',
    category TEXT DEFAULT 'courant',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table user_preferences (préférences utilisateur)
CREATE TABLE public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    theme TEXT DEFAULT 'dark',
    language TEXT DEFAULT 'fr',
    notifications BOOLEAN DEFAULT TRUE,
    budget_limits JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- 2. ACTIVATION ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 3. POLITIQUES DE SÉCURITÉ RLS
-- ============================================================================

-- Politiques pour budget_items
CREATE POLICY "Users can view their own budget items" ON public.budget_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own budget items" ON public.budget_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget items" ON public.budget_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget items" ON public.budget_items FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour tasks
CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour notes
CREATE POLICY "Users can view their own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour shopping_items
CREATE POLICY "Users can view their own shopping items" ON public.shopping_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own shopping items" ON public.shopping_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shopping items" ON public.shopping_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shopping items" ON public.shopping_items FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour user_preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own preferences" ON public.user_preferences FOR DELETE USING (auth.uid() = user_id);

-- 4. FONCTION POUR MISE À JOUR AUTOMATIQUE DU TIMESTAMP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- ============================================================================

CREATE TRIGGER handle_updated_at_budget_items
    BEFORE UPDATE ON public.budget_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_tasks
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_notes
    BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_shopping_items
    BEFORE UPDATE ON public.shopping_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_preferences
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. ACTIVATION REALTIME POUR SYNCHRONISATION EN TEMPS RÉEL
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.budget_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_preferences;

-- 7. INDEX POUR OPTIMISATION DES PERFORMANCES
-- ============================================================================

-- Index pour budget_items
CREATE INDEX idx_budget_items_user_id ON public.budget_items(user_id);
CREATE INDEX idx_budget_items_date ON public.budget_items(date);
CREATE INDEX idx_budget_items_type ON public.budget_items(type);

-- Index pour tasks
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_completed ON public.tasks(completed);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

-- Index pour notes
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_created_at ON public.notes(created_at);

-- Index pour shopping_items
CREATE INDEX idx_shopping_items_user_id ON public.shopping_items(user_id);
CREATE INDEX idx_shopping_items_completed ON public.shopping_items(completed);
CREATE INDEX idx_shopping_items_category ON public.shopping_items(category);

-- Index pour user_preferences
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

-- 8. FONCTION POUR INITIALISATION AUTOMATIQUE DES PRÉFÉRENCES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. TRIGGER POUR CRÉATION AUTOMATIQUE DES PRÉFÉRENCES
-- ============================================================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. NOTIFICATION DE FIN D'INSTALLATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 OPTIMA Database Setup Complete!';
    RAISE NOTICE '✅ 5 Tables created with full RLS security';
    RAISE NOTICE '✅ 20 Security policies activated';
    RAISE NOTICE '✅ 5 Auto-update triggers configured';
    RAISE NOTICE '✅ Realtime synchronization enabled';
    RAISE NOTICE '✅ Performance indexes optimized';
    RAISE NOTICE '✅ Auto-preferences initialization ready';
    RAISE NOTICE '🚀 OPTIMA is ready for production!';
END $$;