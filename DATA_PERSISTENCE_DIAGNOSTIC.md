# 🔍 Diagnostic de Persistance des Données - Optima

**Date**: 2025-10-08
**Problème**: Les données (Budget, Notes, Médias, Courses) ne persistent pas dans Supabase

---

## 📋 Résumé Exécutif

### Problème Identifié
L'application Optima utilise **exclusivement localStorage** pour la persistance des données. Aucune intégration Supabase n'est actuellement implémentée dans `App.jsx`, bien que :
- ✅ Le système d'authentification Supabase fonctionne correctement
- ✅ Le schéma de base de données est défini (`supabase-schema.sql`)
- ✅ Le client Supabase est configuré (`src/lib/supabase.js`)
- ❌ Aucun appel `supabase.from()` n'existe dans le code applicatif

### Impact
- Les données sont perdues lors du vidage du cache navigateur
- Impossible d'accéder aux données depuis un autre appareil
- Aucune sauvegarde ou synchronisation automatique
- Les utilisateurs ne peuvent pas partager leurs données entre sessions

---

## 🔬 Analyse Technique Détaillée

### 1. Architecture Actuelle

#### **AppWithAuth.jsx** (Wrapper d'authentification)
```javascript
// Fichier: src/AppWithAuth.jsx
- Gère la session Supabase avec `supabase.auth.getSession()`
- Passe `session` en prop à `<App />`
- Fonctionnel ✅
```

#### **App.jsx** (Application principale - 327 KB)
```javascript
// Fichier: src/App.jsx
// PROBLÈME: Aucun import Supabase
import React, { useEffect, useMemo, useState, useRef } from "react";
// ❌ Pas de: import { supabase } from "@/lib/supabase";
```

### 2. Clés localStorage Utilisées

| Module | Clé localStorage | Ligne | État Données |
|--------|------------------|-------|--------------|
| Tasks | `todo_coach_v2` | 14 | localStorage uniquement |
| Notes | `todo_coach_notes_v1` | 15 | localStorage uniquement |
| Shopping | `todo_coach_shopping_v1` | 16 | localStorage uniquement |
| Budget | `todo_coach_budget_v1` | 17 | localStorage uniquement |
| Recurring | `todo_coach_recurring_v1` | 18 | localStorage uniquement |
| Budget Limits | `todo_coach_budget_limits_v1` | 19 | localStorage uniquement |
| Media | `todo_coach_media_v1` | 20 | localStorage uniquement |

**Total: 18 opérations localStorage trouvées** (via `grep "localStorage\.(setItem|getItem)"`)
**Total: 0 opérations Supabase trouvées** (via `grep "supabase\.from"`)

### 3. Hooks useEffect Actuels

Tous les hooks utilisent localStorage exclusivement:

```javascript
// Ligne 885-891: Chargement/Sauvegarde Tasks
useEffect(() => {
  try { const raw = localStorage.getItem(LS_KEY); if (raw) setTasks(JSON.parse(raw)); } catch {}
}, []);

useEffect(() => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(tasks)); } catch {}
}, [tasks]);

// Ligne 894-904: Chargement/Sauvegarde Notes
useEffect(() => {
  try {
    const raw = localStorage.getItem(LS_NOTES_KEY);
    if (raw) setNotes(JSON.parse(raw));
  } catch {}
}, []);

useEffect(() => {
  try { localStorage.setItem(LS_NOTES_KEY, JSON.stringify(notes)); } catch {}
}, [notes]);

// Ligne 907-917: Chargement/Sauvegarde Shopping
useEffect(() => {
  try {
    const raw = localStorage.getItem(LS_SHOPPING_KEY);
    if (raw) setShoppingItems(JSON.parse(raw));
  } catch {}
}, []);

useEffect(() => {
  try { localStorage.setItem(LS_SHOPPING_KEY, JSON.stringify(shoppingItems)); } catch {}
}, [shoppingItems]);

// Ligne 927-945: Chargement/Sauvegarde Recurring + Limits
useEffect(() => {
  try {
    const rawRecurring = localStorage.getItem(LS_RECURRING_KEY);
    const rawLimits = localStorage.getItem(LS_BUDGET_LIMITS_KEY);
    // ...
  } catch {}
}, []);

useEffect(() => {
  try { localStorage.setItem(LS_RECURRING_KEY, JSON.stringify(recurringExpenses)); } catch {}
}, [recurringExpenses]);

useEffect(() => {
  try { localStorage.setItem(LS_BUDGET_LIMITS_KEY, JSON.stringify(budgetLimits)); } catch {}
}, [budgetLimits]);

// Ligne 948-958: Chargement/Sauvegarde Media
useEffect(() => {
  try {
    const raw = localStorage.getItem(LS_MEDIA_KEY);
    if (raw) setMediaItems(JSON.parse(raw));
  } catch {}
}, []);

useEffect(() => {
  try { localStorage.setItem(LS_MEDIA_KEY, JSON.stringify(mediaItems)); } catch {}
}, [mediaItems]);

// Ligne 1162-1203: Chargement/Sauvegarde Budget (avec données de test forcées)
useEffect(() => {
  const FORCE_TEST_DATA = true; // ⚠️ Données de test toujours actives!
  if (FORCE_TEST_DATA) {
    localStorage.setItem(LS_BUDGET_KEY, JSON.stringify(testData));
  }
  const raw = localStorage.getItem(LS_BUDGET_KEY);
  if (raw) setBudgetItems(JSON.parse(raw));
}, []);

useEffect(() => {
  try { localStorage.setItem(LS_BUDGET_KEY, JSON.stringify(budgetItems)); } catch {}
}, [budgetItems]);
```

---

## 🗄️ Schéma Supabase Existant

### Tables Définies (supabase-schema.sql)

#### 1. **tasks** (Tâches)
```sql
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'normal', 'low')),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. **notes** (Notes)
```sql
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. **shopping_items** (Liste de courses)
```sql
CREATE TABLE public.shopping_items (
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
```

#### 4. **budget_items** (Entrées budgétaires)
```sql
CREATE TABLE public.budget_items (
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
```

#### 5. **media_items** (Films, Séries, Animés)
```sql
CREATE TABLE public.media_items (
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
```

#### 6. **user_settings** (Paramètres utilisateur)
```sql
CREATE TABLE public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    budget_limits JSONB DEFAULT '{}'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Sécurité RLS (Row Level Security)
✅ Toutes les tables ont RLS activé
✅ Policies configurées pour isoler les données par utilisateur
✅ Triggers `updated_at` automatiques configurés
✅ Trigger `handle_new_user()` pour création auto des settings

---

## 🛠️ Plan de Migration

### Étape 1: Préparation (App.jsx lignes 1-20)

#### 1.1 Ajouter l'import Supabase
```javascript
// Ajouter après la ligne 11
import { supabase } from "@/lib/supabase";
```

#### 1.2 Récupérer l'utilisateur depuis la session
```javascript
// App.jsx doit recevoir la session en props
export default function App({ session }) {
  const user = session?.user; // Extraire l'utilisateur
  const userId = user?.id; // ID pour les requêtes Supabase

  // ... reste du code
}
```

### Étape 2: Migration Module TASKS

#### 2.1 Hook de chargement initial
```javascript
// Remplacer ligne 885-887
useEffect(() => {
  if (!userId) return;

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setTasks(data);
    } catch (error) {
      console.error('Erreur chargement tasks:', error);
    }
  };

  loadTasks();
}, [userId]);
```

#### 2.2 Fonction d'ajout de tâche
```javascript
// Localiser la fonction addTask() et modifier pour:
const addTask = async () => {
  if (!taskInput.trim() || !userId) return;

  const newTask = {
    user_id: userId,
    text: taskInput.trim(),
    priority: priorityChoice,
    completed: false
  };

  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert(newTask)
      .select()
      .single();

    if (error) throw error;
    setTasks([data, ...tasks]);
    setTaskInput("");
  } catch (error) {
    console.error('Erreur ajout task:', error);
  }
};
```

#### 2.3 Fonction de suppression
```javascript
const deleteTask = async (id) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    setTasks(tasks.filter(t => t.id !== id));
  } catch (error) {
    console.error('Erreur suppression task:', error);
  }
};
```

#### 2.4 Fonction de toggle completion
```javascript
const toggleTask = async (id) => {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  try {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  } catch (error) {
    console.error('Erreur toggle task:', error);
  }
};
```

#### 2.5 **SUPPRIMER** le hook localStorage
```javascript
// SUPPRIMER les lignes 889-891
// useEffect(() => {
//   try { localStorage.setItem(LS_KEY, JSON.stringify(tasks)); } catch {}
// }, [tasks]);
```

### Étape 3: Migration Module NOTES

#### 3.1 Hook de chargement
```javascript
// Remplacer ligne 894-900
useEffect(() => {
  if (!userId) return;

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setNotes(data);
    } catch (error) {
      console.error('Erreur chargement notes:', error);
    }
  };

  loadNotes();
}, [userId]);
```

#### 3.2 Fonction d'ajout de note
```javascript
const addNote = async () => {
  if (!noteContent.trim() || !userId) return;

  const newNote = {
    user_id: userId,
    title: noteTitle.trim() || null,
    content: noteContent.trim()
  };

  try {
    const { data, error } = await supabase
      .from('notes')
      .insert(newNote)
      .select()
      .single();

    if (error) throw error;
    setNotes([data, ...notes]);
    setNoteTitle("");
    setNoteContent("");
  } catch (error) {
    console.error('Erreur ajout note:', error);
  }
};
```

#### 3.3 Fonction de modification
```javascript
const updateNote = async (id, updates) => {
  try {
    const { error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
  } catch (error) {
    console.error('Erreur update note:', error);
  }
};
```

#### 3.4 Fonction de suppression
```javascript
const deleteNote = async (id) => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    setNotes(notes.filter(n => n.id !== id));
  } catch (error) {
    console.error('Erreur suppression note:', error);
  }
};
```

#### 3.5 **SUPPRIMER** le hook localStorage
```javascript
// SUPPRIMER les lignes 902-904
```

### Étape 4: Migration Module SHOPPING

#### 4.1 Hook de chargement
```javascript
// Remplacer ligne 907-913
useEffect(() => {
  if (!userId) return;

  const loadShopping = async () => {
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setShoppingItems(data);
    } catch (error) {
      console.error('Erreur chargement shopping:', error);
    }
  };

  loadShopping();
}, [userId]);
```

#### 4.2 Fonction d'ajout d'article
```javascript
const addShoppingItem = async () => {
  if (!shoppingInput.trim() || !userId) return;

  const newItem = {
    user_id: userId,
    name: shoppingInput.trim(),
    quantity: shoppingQty || 1,
    unit: shoppingUnit || 'pcs',
    category: shoppingCategory || 'now',
    checked: false
  };

  try {
    const { data, error } = await supabase
      .from('shopping_items')
      .insert(newItem)
      .select()
      .single();

    if (error) throw error;
    setShoppingItems([...shoppingItems, data]);
    // Reset form
  } catch (error) {
    console.error('Erreur ajout shopping:', error);
  }
};
```

#### 4.3 Toggle checked
```javascript
const toggleShoppingItem = async (id) => {
  const item = shoppingItems.find(i => i.id === id);
  if (!item) return;

  try {
    const { error } = await supabase
      .from('shopping_items')
      .update({ checked: !item.checked })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    setShoppingItems(shoppingItems.map(i =>
      i.id === id ? { ...i, checked: !i.checked } : i
    ));
  } catch (error) {
    console.error('Erreur toggle shopping:', error);
  }
};
```

#### 4.4 Suppression
```javascript
const deleteShoppingItem = async (id) => {
  try {
    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    setShoppingItems(shoppingItems.filter(i => i.id !== id));
  } catch (error) {
    console.error('Erreur suppression shopping:', error);
  }
};
```

#### 4.5 **SUPPRIMER** le hook localStorage
```javascript
// SUPPRIMER les lignes 915-917
```

### Étape 5: Migration Module BUDGET

#### 5.1 Hook de chargement
```javascript
// Remplacer ligne 1162-1198 (SUPPRIMER les données de test!)
useEffect(() => {
  if (!userId) return;

  const loadBudget = async () => {
    try {
      const { data, error } = await supabase
        .from('budget_items')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      if (data) setBudgetItems(data);
    } catch (error) {
      console.error('Erreur chargement budget:', error);
    }
  };

  loadBudget();
}, [userId]);
```

#### 5.2 Fonction d'ajout d'entrée budgétaire
```javascript
const addBudgetItem = async () => {
  if (!budgetDescription.trim() || !budgetAmount || !userId) return;

  const newItem = {
    user_id: userId,
    description: budgetDescription.trim(),
    amount: parseFloat(budgetAmount),
    type: budgetType,
    category: budgetCategory,
    date: budgetDate,
    recurring: false // Ou selon le formulaire
  };

  try {
    const { data, error } = await supabase
      .from('budget_items')
      .insert(newItem)
      .select()
      .single();

    if (error) throw error;
    setBudgetItems([data, ...budgetItems]);
    // Reset form
  } catch (error) {
    console.error('Erreur ajout budget:', error);
  }
};
```

#### 5.3 Fonction de modification
```javascript
const updateBudgetItem = async (id, updates) => {
  try {
    const { error } = await supabase
      .from('budget_items')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    setBudgetItems(budgetItems.map(b => b.id === id ? { ...b, ...updates } : b));
  } catch (error) {
    console.error('Erreur update budget:', error);
  }
};
```

#### 5.4 Fonction de suppression
```javascript
const deleteBudgetItem = async (id) => {
  try {
    const { error } = await supabase
      .from('budget_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    setBudgetItems(budgetItems.filter(b => b.id !== id));
  } catch (error) {
    console.error('Erreur suppression budget:', error);
  }
};
```

#### 5.5 **SUPPRIMER** le hook localStorage
```javascript
// SUPPRIMER les lignes 1201-1203
```

### Étape 6: Migration Module MEDIA

#### 6.1 Hook de chargement
```javascript
// Remplacer ligne 948-954
useEffect(() => {
  if (!userId) return;

  const loadMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setMediaItems(data);
    } catch (error) {
      console.error('Erreur chargement media:', error);
    }
  };

  loadMedia();
}, [userId]);
```

#### 6.2 Fonction d'ajout de média
```javascript
const addMediaItem = async (mediaData) => {
  if (!userId) return;

  const newMedia = {
    user_id: userId,
    title: mediaData.title,
    type: mediaData.type || 'movie',
    status: mediaData.status || 'towatch',
    rating: mediaData.rating || null,
    comment: mediaData.comment || '',
    // Champs API
    original_title: mediaData.original_title || null,
    overview: mediaData.overview || null,
    poster_path: mediaData.poster_path || null,
    release_date: mediaData.release_date || null,
    vote_average: mediaData.vote_average || null,
    genres: mediaData.genres || [],
    api_id: mediaData.api_id || null
  };

  try {
    const { data, error } = await supabase
      .from('media_items')
      .insert(newMedia)
      .select()
      .single();

    if (error) throw error;
    setMediaItems([data, ...mediaItems]);
  } catch (error) {
    console.error('Erreur ajout media:', error);
  }
};
```

#### 6.3 Fonction de modification
```javascript
const updateMediaItem = async (id, updates) => {
  try {
    const { error } = await supabase
      .from('media_items')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    setMediaItems(mediaItems.map(m => m.id === id ? { ...m, ...updates } : m));
  } catch (error) {
    console.error('Erreur update media:', error);
  }
};
```

#### 6.4 Fonction de suppression
```javascript
const deleteMediaItem = async (id) => {
  try {
    const { error } = await supabase
      .from('media_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    setMediaItems(mediaItems.filter(m => m.id !== id));
  } catch (error) {
    console.error('Erreur suppression media:', error);
  }
};
```

#### 6.5 **SUPPRIMER** le hook localStorage
```javascript
// SUPPRIMER les lignes 956-958
```

### Étape 7: Migration User Settings

#### 7.1 Hook de chargement
```javascript
// Remplacer ligne 927-935
useEffect(() => {
  if (!userId) return;

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore si pas trouvé

      if (data) {
        setBudgetLimits(data.budget_limits || {});
        // Charger autres préférences si nécessaire
      }
    } catch (error) {
      console.error('Erreur chargement settings:', error);
    }
  };

  loadSettings();
}, [userId]);
```

#### 7.2 Fonction de sauvegarde des limites budgétaires
```javascript
const updateBudgetLimits = async (newLimits) => {
  if (!userId) return;

  try {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        budget_limits: newLimits
      });

    if (error) throw error;
    setBudgetLimits(newLimits);
  } catch (error) {
    console.error('Erreur update budget limits:', error);
  }
};
```

#### 7.3 **SUPPRIMER** les hooks localStorage
```javascript
// SUPPRIMER les lignes 938-945
```

### Étape 8: Nettoyage Final

#### 8.1 Supprimer les constantes localStorage
```javascript
// SUPPRIMER ou COMMENTER les lignes 14-20
// const LS_KEY = "todo_coach_v2";
// const LS_NOTES_KEY = "todo_coach_notes_v1";
// const LS_SHOPPING_KEY = "todo_coach_shopping_v1";
// const LS_BUDGET_KEY = "todo_coach_budget_v1";
// const LS_RECURRING_KEY = "todo_coach_recurring_v1";
// const LS_BUDGET_LIMITS_KEY = "todo_coach_budget_limits_v1";
// const LS_MEDIA_KEY = "todo_coach_media_v1";
```

#### 8.2 Supprimer la fonction uuid() locale
```javascript
// SUPPRIMER la ligne 21
// const uuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
// Supabase génère les UUID automatiquement
```

---

## ✅ Checklist de Vérification

### Avant Migration
- [ ] Sauvegarder App.jsx original
- [ ] Vérifier que le schéma Supabase est bien exécuté
- [ ] Tester la connexion Supabase en console:
  ```javascript
  const { data, error } = await supabase.from('tasks').select('count');
  console.log(data, error);
  ```

### Pendant Migration
- [ ] Importer `supabase` dans App.jsx
- [ ] Extraire `userId` depuis `session.user.id`
- [ ] Migrer Tasks → Supabase
- [ ] Migrer Notes → Supabase
- [ ] Migrer Shopping → Supabase
- [ ] Migrer Budget → Supabase
- [ ] Migrer Media → Supabase
- [ ] Migrer Settings → Supabase
- [ ] Supprimer tous les hooks localStorage
- [ ] Supprimer les constantes LS_*

### Après Migration
- [ ] Test: Créer une tâche → Vérifier dans Supabase dashboard
- [ ] Test: Recharger la page → Vérifier que les données persistent
- [ ] Test: Se déconnecter/reconnecter → Vérifier que les données reviennent
- [ ] Test: Ouvrir un autre navigateur → Vérifier la synchronisation
- [ ] Test: Ajouter/Modifier/Supprimer pour chaque module
- [ ] Vider localStorage et vérifier que l'app fonctionne toujours
- [ ] Commit et déploiement Netlify

---

## 🚨 Points d'Attention

### 1. Gestion des Erreurs
Toutes les fonctions async doivent avoir un try/catch avec console.error pour le debug.

### 2. UUIDs
- localStorage utilisait `uuid()` local (non standard)
- Supabase utilise `uuid_generate_v4()` (PostgreSQL)
- Les anciens IDs localStorage seront perdus lors de la migration

### 3. Données de Test Budget
**CRITIQUE**: Ligne 1164 dans App.jsx:
```javascript
const FORCE_TEST_DATA = true; // ⚠️ METTRE À FALSE APRÈS MIGRATION
```
Cette ligne réinitialise le budget à chaque chargement. **DOIT ÊTRE SUPPRIMÉE**.

### 4. Dépenses Récurrentes
Le système de dépenses récurrentes (`recurringExpenses`) n'est pas stocké dans une table séparée actuellement. Décider si:
- Option A: Stocker dans `user_settings.preferences` comme JSONB
- Option B: Créer une table `recurring_expenses` dédiée
- Option C: Utiliser le champ `recurring` + `recurring_frequency` de `budget_items`

### 5. Performance
- Les hooks actuels rechargent tout à chaque fois
- Envisager d'ajouter une stratégie de cache/invalidation
- Utiliser Supabase Realtime pour la synchronisation multi-onglets (optionnel)

### 6. Migration des Données Existantes
Si des utilisateurs ont déjà des données en localStorage:
- Option A: Créer un script de migration one-time au premier login
- Option B: Perdre les anciennes données (acceptable si app en test)
- Option C: Offrir un bouton "Importer depuis localStorage"

---

## 📊 Impact Estimé

| Métrique | Avant | Après |
|----------|-------|-------|
| Persistance | ❌ localStorage | ✅ PostgreSQL |
| Multi-device | ❌ Non | ✅ Oui |
| Sauvegarde | ❌ Aucune | ✅ Automatique |
| Performances | ⚡ Instantané | 🐌 ~100-300ms (réseau) |
| Sécurité | ⚠️ Faible (client) | ✅ Élevée (RLS) |
| Taille max données | ~5-10MB (quota navigateur) | ~8GB (plan gratuit Supabase) |

---

## 🔗 Ressources

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)

---

**Prochaine Étape**: Commencer l'implémentation en suivant le plan de migration ci-dessus.
