# 🚀 Guide de Déploiement - Todo Coach App

## ✅ **ÉTAT ACTUEL**
- ✅ Repository GitHub privé créé
- ✅ Code poussé avec succès
- ✅ Build de production testée (816kB)
- ✅ Intégration Supabase configurée
- ✅ Fichiers de configuration créés

---

## 📋 **ÉTAPES RESTANTES (2 minutes)**

### **1. Exécuter le schéma de base de données**

1. **Allez dans votre projet Supabase** :
   - URL : https://ntytkeasfjnwoehpzhtm.supabase.co
   - Allez dans `SQL Editor`

2. **Copiez-collez ce schéma SQL complet** :

```sql
-- Schema de base de données pour Todo Coach App
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer la table pour les éléments de budget/tâches
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('revenus', 'depenses_fixes', 'depenses_variables', 'epargne', 'investissements')),
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table pour les tâches
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT NOT NULL CHECK (priority IN ('urgent', 'normal', 'low')),
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table pour les notes
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table pour les éléments de shopping
CREATE TABLE IF NOT EXISTS shopping_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table pour les dépenses récurrentes
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    day_of_month INTEGER NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table pour les limites de budget
CREATE TABLE IF NOT EXISTS budget_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category_type TEXT NOT NULL,
    category_key TEXT NOT NULL,
    limit_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_type, category_key)
);

-- Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_budget_items_user_id ON budget_items(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_date ON budget_items(date);
CREATE INDEX IF NOT EXISTS idx_budget_items_type ON budget_items(type);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_user_id ON shopping_items(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_limits_user_id ON budget_limits(user_id);

-- Activer RLS (Row Level Security)
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_limits ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour sécuriser les données
-- Budget Items
CREATE POLICY "Users can only see their own budget items" ON budget_items
    FOR ALL USING (auth.uid() = user_id);

-- Tasks
CREATE POLICY "Users can only see their own tasks" ON tasks
    FOR ALL USING (auth.uid() = user_id);

-- Notes
CREATE POLICY "Users can only see their own notes" ON notes
    FOR ALL USING (auth.uid() = user_id);

-- Shopping Items
CREATE POLICY "Users can only see their own shopping items" ON shopping_items
    FOR ALL USING (auth.uid() = user_id);

-- Recurring Expenses
CREATE POLICY "Users can only see their own recurring expenses" ON recurring_expenses
    FOR ALL USING (auth.uid() = user_id);

-- Budget Limits
CREATE POLICY "Users can only see their own budget limits" ON budget_limits
    FOR ALL USING (auth.uid() = user_id);

-- Fonction pour mettre à jour le timestamp updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Créer les triggers pour auto-update des timestamps
CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_items_updated_at BEFORE UPDATE ON shopping_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_expenses_updated_at BEFORE UPDATE ON recurring_expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_limits_updated_at BEFORE UPDATE ON budget_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

3. **Cliquez sur "Run" pour exécuter** ✅

---

### **2. Déployer sur Netlify**

1. **Allez sur [netlify.com](https://netlify.com)** et connectez-vous

2. **Nouveau site depuis Git** :
   - Cliquez sur `"New site from Git"`
   - Sélectionnez `"GitHub"`
   - Trouvez et sélectionnez `"todo-coach-app"`

3. **Configuration de build** :
   - **Branch to deploy** : `main`
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`

4. **Variables d'environnement** :
   - Dans `Site Settings > Environment variables`
   - **Ajoutez ces 4 variables** :

```
VITE_SUPABASE_URL = https://ntytkeasfjnwoehpzhtm.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eXRrZWFzZmpud29laHB6aHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDIyMDAsImV4cCI6MjA3MjU3ODIwMH0.dGYlqy6bNUactQdI3ngBK6uYT2JyNVMsdx-nCdzG8dc
VITE_APP_NAME = Todo Coach App
VITE_APP_VERSION = 1.0.0
```

5. **Cliquez sur "Deploy site"** 🚀

---

## 🎯 **RÉSULTAT ATTENDU**

Votre application sera accessible à une URL comme :
**`https://votre-site-name.netlify.app`**

### **Fonctionnalités disponibles** :
- ✅ **Interface Budget** avec alignement parfait (8 500 CHF)
- ✅ **Dashboard interactif** avec graphiques
- ✅ **Gestion des tâches** par priorité
- ✅ **Listes de courses** collaboratives
- ✅ **Notes personnelles**
- ✅ **Données persistantes** en base Supabase
- ✅ **Responsive mobile** parfait
- ✅ **Sécurité RLS** activée

### **Test mobile** :
- Ouvrez l'URL sur votre téléphone
- L'interface s'adapte automatiquement
- Toutes les données sont sauvegardées

---

## ⚡ **DÉPANNAGE**

**Si la build échoue** :
- Vérifiez que les variables d'environnement sont bien configurées
- Relancez le déploiement

**Si Supabase ne fonctionne pas** :
- Vérifiez que le schéma SQL a été exécuté
- Testez la connexion dans les logs Netlify

---

## 🎉 **SUCCÈS !**

Une fois ces 2 étapes terminées, votre Todo Coach App sera **100% fonctionnelle** et accessible sur mobile !

**Temps estimé : 2-3 minutes** ⏱️