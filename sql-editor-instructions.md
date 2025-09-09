# Instructions pour SQL Editor Supabase

## ⚠️ IMPORTANT
Tu as raison - nous devons utiliser le **SQL Editor** dans Supabase Dashboard, pas les approches programmatiques.

## 🎯 Étapes à suivre

### 1. Accéder au SQL Editor
1. Aller sur https://supabase.com/dashboard/project/tuxqlybmtjmlyadbtneb
2. Cliquer sur "SQL Editor" dans la barre latérale
3. Créer une nouvelle requête

### 2. Exécuter ce script complet

Copier-coller exactement ce code dans le SQL Editor :

```sql
-- OPTIMA - Configuration complète manquante
-- Créer la table user_preferences qui manque

CREATE TABLE IF NOT EXISTS public.user_preferences (
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

-- Activer RLS pour user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour user_preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own preferences" ON public.user_preferences FOR DELETE USING (auth.uid() = user_id);

-- Fonction pour updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour toutes les tables
CREATE TRIGGER handle_updated_at_budget_items BEFORE UPDATE ON public.budget_items FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at_tasks BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at_notes BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at_shopping_items BEFORE UPDATE ON public.shopping_items FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at_user_preferences BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Activer Realtime pour toutes les tables
ALTER publication supabase_realtime ADD TABLE public.budget_items;
ALTER publication supabase_realtime ADD TABLE public.tasks;
ALTER publication supabase_realtime ADD TABLE public.notes;
ALTER publication supabase_realtime ADD TABLE public.shopping_items;
ALTER publication supabase_realtime ADD TABLE public.user_preferences;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_budget_items_user_id ON public.budget_items(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_date ON public.budget_items(date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON public.tasks(completed);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_user_id ON public.shopping_items(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_completed ON public.shopping_items(completed);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Fonction pour initialiser les préférences utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement les préférences
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### 3. Vérifier le résultat

Après exécution, vérifier dans l'onglet "Tables" que nous avons :
- ✅ budget_items (avec RLS activé)
- ✅ tasks (avec RLS activé)
- ✅ notes (avec RLS activé)
- ✅ shopping_items (avec RLS activé)
- ✅ user_preferences (avec RLS activé)

## 🎯 Pourquoi SQL Editor est meilleur

Tu as parfaitement raison :
1. **Contrôle total** - On voit exactement ce qui s'exécute
2. **Débogage facile** - Messages d'erreur clairs
3. **Exécution immédiate** - Pas de problèmes d'API
4. **Visibilité complète** - On peut voir les tables créées immédiatement

## ✅ Résultat attendu

Après cette exécution dans SQL Editor, l'application OPTIMA aura :
- 5 tables complètes avec RLS
- 20 politiques de sécurité
- 5 triggers automatiques
- Realtime activé partout
- Index de performance
- Initialisation automatique des préférences utilisateur