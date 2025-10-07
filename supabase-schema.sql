-- =====================================================
-- SCH�MA SQL POUR OPTIMA - � EX�CUTER DANS SUPABASE
-- =====================================================
-- Instructions :
-- 1. Allez sur https://app.supabase.com
-- 2. S�lectionnez votre projet
-- 3. Allez dans "SQL Editor"
-- 4. Cr�ez une nouvelle requ�te et collez ce code
-- 5. Cliquez sur "Run" pour ex�cuter
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: tasks (T�ches)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'normal', 'low')),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour am�liorer les performances
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- RLS (Row Level Security) pour tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
    ON public.tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
    ON public.tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON public.tasks FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: notes (Notes)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour am�liorer les performances
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);

-- RLS pour notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes"
    ON public.notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
    ON public.notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
    ON public.notes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
    ON public.notes FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: shopping_items (Liste de courses)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.shopping_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity NUMERIC DEFAULT 1,
    unit TEXT DEFAULT 'pcs',
    category TEXT DEFAULT 'now' CHECK (category IN ('now', 'later')),
    checked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour am�liorer les performances
CREATE INDEX IF NOT EXISTS idx_shopping_items_user_id ON public.shopping_items(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_category ON public.shopping_items(category);

-- RLS pour shopping_items
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shopping items"
    ON public.shopping_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shopping items"
    ON public.shopping_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping items"
    ON public.shopping_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping items"
    ON public.shopping_items FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: budget_items (Entr�es budg�taires)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('revenus', 'depenses_fixes', 'depenses_variables', 'epargne', 'investissements')),
    category TEXT,
    date DATE NOT NULL,
    recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly') OR recurring_frequency IS NULL),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour am�liorer les performances
CREATE INDEX IF NOT EXISTS idx_budget_items_user_id ON public.budget_items(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_date ON public.budget_items(date DESC);
CREATE INDEX IF NOT EXISTS idx_budget_items_type ON public.budget_items(type);

-- RLS pour budget_items
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget items"
    ON public.budget_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget items"
    ON public.budget_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget items"
    ON public.budget_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget items"
    ON public.budget_items FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: media_items (Films, S�ries, Anim�s)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.media_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    original_title TEXT,
    type TEXT NOT NULL CHECK (type IN ('movie', 'tv', 'anime')),
    status TEXT NOT NULL CHECK (status IN ('watched', 'watching', 'towatch')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 10 OR rating IS NULL),
    comment TEXT,
    overview TEXT,
    poster_path TEXT,
    release_date TEXT,
    vote_average NUMERIC,
    genres TEXT[],
    api_id TEXT,
    date_watched TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour am�liorer les performances
CREATE INDEX IF NOT EXISTS idx_media_items_user_id ON public.media_items(user_id);
CREATE INDEX IF NOT EXISTS idx_media_items_type ON public.media_items(type);
CREATE INDEX IF NOT EXISTS idx_media_items_status ON public.media_items(status);
CREATE INDEX IF NOT EXISTS idx_media_items_created_at ON public.media_items(created_at DESC);

-- RLS pour media_items
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own media items"
    ON public.media_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own media items"
    ON public.media_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media items"
    ON public.media_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media items"
    ON public.media_items FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: user_settings (Param�tres utilisateur)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    budget_limits JSONB DEFAULT '{}'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS pour user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- FONCTIONS TRIGGER pour updated_at automatique
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer les triggers sur toutes les tables
CREATE TRIGGER set_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_shopping_items_updated_at
    BEFORE UPDATE ON public.shopping_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_budget_items_updated_at
    BEFORE UPDATE ON public.budget_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_media_items_updated_at
    BEFORE UPDATE ON public.media_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- FONCTION pour cr�er automatiquement user_settings
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_settings (user_id, budget_limits, preferences)
    VALUES (
        NEW.id,
        '{
            "shortTerm": {"depenses_fixes": 0, "depenses_variables": 0},
            "longTerm": {"epargne": 0, "investissements": 0}
        }'::jsonb,
        '{}'::jsonb
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour cr�er automatiquement les param�tres utilisateur
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FIN DU SCH�MA
-- =====================================================
-- Toutes les tables sont cr��es avec RLS activ�
-- Chaque utilisateur peut uniquement voir et modifier ses propres donn�es
-- Les triggers g�rent automatiquement les timestamps updated_at
-- =====================================================
