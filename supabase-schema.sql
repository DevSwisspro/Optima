-- =====================================================
-- OPTIMA - Schéma de base de données Supabase complet
-- =====================================================

-- Enable RLS (Row Level Security) by default
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- =====================================================
-- 1. TABLE TASKS (Tâches)
-- =====================================================
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('urgent', 'normal')) DEFAULT 'normal',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX tasks_user_id_idx ON tasks(user_id);
CREATE INDEX tasks_priority_idx ON tasks(priority);

-- =====================================================
-- 2. TABLE NOTES (Notes)
-- =====================================================
CREATE TABLE notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT DEFAULT 'Note sans titre',
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX notes_user_id_idx ON notes(user_id);
CREATE INDEX notes_title_idx ON notes(title);

-- =====================================================
-- 3. TABLE SHOPPING_ITEMS (Courses)
-- =====================================================
CREATE TABLE shopping_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit TEXT DEFAULT 'p',
    category TEXT CHECK (category IN ('courant', 'futur')) DEFAULT 'courant',
    purchased BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX shopping_items_user_id_idx ON shopping_items(user_id);
CREATE INDEX shopping_items_category_idx ON shopping_items(category);

-- =====================================================
-- 4. TABLE BUDGET_ITEMS (Budget)
-- =====================================================
CREATE TABLE budget_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT CHECK (type IN ('revenus', 'depenses_fixes', 'depenses_variables', 'epargne', 'investissements')) NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX budget_items_user_id_idx ON budget_items(user_id);
CREATE INDEX budget_items_type_idx ON budget_items(type);
CREATE INDEX budget_items_date_idx ON budget_items(date);

-- =====================================================
-- 5. TABLE MEDIA_ITEMS (Médias - Films/Séries/Animés)
-- =====================================================
CREATE TABLE media_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    original_title TEXT,
    overview TEXT,
    poster_path TEXT,
    release_date TEXT,
    vote_average DECIMAL(3,1),
    genres JSONB DEFAULT '[]',
    type TEXT CHECK (type IN ('movie', 'tv', 'anime', 'documentary')) NOT NULL,
    status TEXT CHECK (status IN ('watched', 'towatch', 'watching')) DEFAULT 'watched',
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_watched TIMESTAMP WITH TIME ZONE,
    api_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX media_items_user_id_idx ON media_items(user_id);
CREATE INDEX media_items_type_idx ON media_items(type);
CREATE INDEX media_items_status_idx ON media_items(status);
CREATE INDEX media_items_rating_idx ON media_items(rating);

-- =====================================================
-- 6. TABLE USER_SETTINGS (Paramètres utilisateur)
-- =====================================================
CREATE TABLE user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    recurring_expenses JSONB DEFAULT '[]',
    budget_limits JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX user_settings_user_id_idx ON user_settings(user_id);

-- =====================================================
-- FONCTIONS DE MISE À JOUR AUTOMATIQUE (updated_at)
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_items_updated_at BEFORE UPDATE ON shopping_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_items_updated_at BEFORE UPDATE ON media_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- POLITIQUES TASKS
CREATE POLICY "Users can insert their own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
    FOR DELETE USING (auth.uid() = user_id);

-- POLITIQUES NOTES
CREATE POLICY "Users can insert their own notes" ON notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own notes" ON notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
    FOR DELETE USING (auth.uid() = user_id);

-- POLITIQUES SHOPPING_ITEMS
CREATE POLICY "Users can insert their own shopping items" ON shopping_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own shopping items" ON shopping_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping items" ON shopping_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping items" ON shopping_items
    FOR DELETE USING (auth.uid() = user_id);

-- POLITIQUES BUDGET_ITEMS
CREATE POLICY "Users can insert their own budget items" ON budget_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own budget items" ON budget_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget items" ON budget_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget items" ON budget_items
    FOR DELETE USING (auth.uid() = user_id);

-- POLITIQUES MEDIA_ITEMS
CREATE POLICY "Users can insert their own media items" ON media_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own media items" ON media_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own media items" ON media_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media items" ON media_items
    FOR DELETE USING (auth.uid() = user_id);

-- POLITIQUES USER_SETTINGS
CREATE POLICY "Users can insert their own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON user_settings
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FONCTION POUR CRÉER AUTOMATIQUEMENT LES PARAMÈTRES UTILISATEUR
-- =====================================================
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_settings (user_id, preferences)
    VALUES (NEW.id, '{"theme": "dark", "language": "fr"}');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement les paramètres lors de l'inscription
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_settings();

-- =====================================================
-- VUES UTILES POUR LE DASHBOARD
-- =====================================================

-- Vue pour les statistiques du budget par mois
CREATE VIEW monthly_budget_stats AS
SELECT
    user_id,
    DATE_TRUNC('month', date) as month,
    type,
    SUM(amount) as total_amount,
    COUNT(*) as item_count
FROM budget_items
GROUP BY user_id, DATE_TRUNC('month', date), type;

-- Vue pour les statistiques des médias
CREATE VIEW media_stats AS
SELECT
    user_id,
    type,
    status,
    AVG(rating) as avg_rating,
    COUNT(*) as item_count
FROM media_items
GROUP BY user_id, type, status;

-- =====================================================
-- INSERTION DE DONNÉES EXEMPLE (Optionnel)
-- =====================================================

-- Ces données ne seront pas insérées car elles nécessitent un user_id réel
-- Vous pourrez les ajouter après connexion dans l'interface

/*
-- Exemple de tâche (à remplacer user_id par votre vraie ID)
INSERT INTO tasks (user_id, title, priority) VALUES
    ('your-user-id', 'Configurer Supabase', 'urgent'),
    ('your-user-id', 'Tester l''application', 'normal');

-- Exemple de média
INSERT INTO media_items (user_id, title, type, status, rating, comment) VALUES
    ('your-user-id', 'Inception', 'movie', 'watched', 5, 'Un chef-d''œuvre de Christopher Nolan!');
*/