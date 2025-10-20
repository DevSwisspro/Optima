-- =====================================================
-- SCHÉMA SQL POUR BASE DE CONNAISSANCES - OPTIMA
-- =====================================================
-- Instructions :
-- 1. Allez sur https://app.supabase.com
-- 2. Sélectionnez votre projet
-- 3. Allez dans "SQL Editor"
-- 4. Créez une nouvelle requête et collez ce code
-- 5. Cliquez sur "Run" pour exécuter
-- =====================================================

-- =====================================================
-- TABLE: knowledge_entries (Base de connaissances)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.knowledge_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titre TEXT NOT NULL,
    categorie TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    date DATE NOT NULL,
    contenu TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_user_id ON public.knowledge_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_date ON public.knowledge_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_categorie ON public.knowledge_entries(categorie);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_created_at ON public.knowledge_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_tags ON public.knowledge_entries USING GIN(tags);

-- RLS (Row Level Security) pour knowledge_entries
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own knowledge entries"
    ON public.knowledge_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own knowledge entries"
    ON public.knowledge_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge entries"
    ON public.knowledge_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge entries"
    ON public.knowledge_entries FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: knowledge_categories (Catégories personnalisées)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.knowledge_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_knowledge_categories_user_id ON public.knowledge_categories(user_id);

-- RLS pour knowledge_categories
ALTER TABLE public.knowledge_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories"
    ON public.knowledge_categories FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
    ON public.knowledge_categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
    ON public.knowledge_categories FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS pour updated_at automatique
-- =====================================================
CREATE TRIGGER set_knowledge_entries_updated_at
    BEFORE UPDATE ON public.knowledge_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- FONCTION pour initialiser les catégories par défaut
-- =====================================================
CREATE OR REPLACE FUNCTION public.init_default_knowledge_categories()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.knowledge_categories (user_id, name)
    VALUES
        (NEW.id, 'Programmation'),
        (NEW.id, 'Cybersécurité'),
        (NEW.id, 'Systèmes'),
        (NEW.id, 'Réseaux'),
        (NEW.id, 'DevOps'),
        (NEW.id, 'Méthodologie'),
        (NEW.id, 'Autre')
    ON CONFLICT (user_id, name) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement les catégories par défaut
DROP TRIGGER IF EXISTS on_auth_user_created_knowledge_categories ON auth.users;
CREATE TRIGGER on_auth_user_created_knowledge_categories
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.init_default_knowledge_categories();

-- =====================================================
-- FIN DU SCHÉMA BASE DE CONNAISSANCES
-- =====================================================
