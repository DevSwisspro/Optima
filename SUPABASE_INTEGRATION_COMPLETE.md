# ✅ Intégration Supabase - Implémentation Complète

**Date**: 2025-10-08
**Status**: ✅ Migration terminée - Prêt pour tests

---

## 📊 Résumé des Modifications

### Problème Initial
L'application Optima utilisait **localStorage exclusivement** pour persister les données, causant:
- ❌ Perte de données lors du vidage du cache
- ❌ Impossible d'accéder aux données depuis un autre appareil
- ❌ Aucune synchronisation entre sessions

### Solution Implémentée
✅ Migration complète vers **Supabase PostgreSQL** avec authentification et RLS (Row Level Security)

---

## 🔧 Modifications Apportées

### 1. **App.jsx** - Modifications Principales

#### Import Supabase
```javascript
// Ligne 12
import { supabase } from "@/lib/supabase";
```

#### Récupération de l'utilisateur connecté
```javascript
// Ligne 735-738
export default function App({ session }) {
  const user = session?.user;
  const userId = user?.id;
```

### 2. **Hooks de Chargement des Données**

Tous les `useEffect` ont été migrés de `localStorage` vers `Supabase`:

#### ✅ Tasks (Lignes 889-909)
```javascript
useEffect(() => {
  if (!userId) return;

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data) setTasks(data);
  };

  loadTasks();
}, [userId]);
```

#### ✅ Notes (Lignes 911-931)
```javascript
useEffect(() => {
  if (!userId) return;

  const loadNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data) setNotes(data);
  };

  loadNotes();
}, [userId]);
```

#### ✅ Shopping (Lignes 933-953)
```javascript
useEffect(() => {
  if (!userId) return;

  const loadShopping = async () => {
    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data) setShoppingItems(data);
  };

  loadShopping();
}, [userId]);
```

#### ✅ User Settings (Lignes 962-986)
```javascript
useEffect(() => {
  if (!userId) return;

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      if (data.budget_limits) setBudgetLimits(data.budget_limits);
      if (data.preferences?.recurring_expenses) setRecurringExpenses(data.preferences.recurring_expenses);
    }
  };

  loadSettings();
}, [userId]);
```

#### ✅ Budget Limits Auto-Save (Lignes 988-1009)
```javascript
useEffect(() => {
  if (!userId || Object.keys(budgetLimits).length === 0) return;

  const saveBudgetLimits = async () => {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        budget_limits: budgetLimits
      });

    if (error) throw error;
  };

  const timeoutId = setTimeout(saveBudgetLimits, 500); // Debounce
  return () => clearTimeout(timeoutId);
}, [budgetLimits, userId]);
```

#### ✅ Recurring Expenses Auto-Save (Lignes 1011-1032)
```javascript
useEffect(() => {
  if (!userId) return;

  const saveRecurringExpenses = async () => {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        preferences: { recurring_expenses: recurringExpenses }
      });

    if (error) throw error;
  };

  const timeoutId = setTimeout(saveRecurringExpenses, 500); // Debounce
  return () => clearTimeout(timeoutId);
}, [recurringExpenses, userId]);
```

#### ✅ Media (Lignes 1034-1054)
```javascript
useEffect(() => {
  if (!userId) return;

  const loadMedia = async () => {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data) setMediaItems(data);
  };

  loadMedia();
}, [userId]);
```

#### ✅ Budget (Lignes 1211-1231)
```javascript
useEffect(() => {
  if (!userId) return;

  const loadBudget = async () => {
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    if (data) setBudgetItems(data);
  };

  loadBudget();
}, [userId]);
```

**⚠️ IMPORTANT**: Les données de test forcées ont été supprimées (ancien code `FORCE_TEST_DATA = true`)

---

### 3. **Fonctions CRUD Migrées**

#### ✅ TASKS (Lignes 1233-1293)

**addTask()** - Ligne 1233
```javascript
const addTask = async () => {
  const parsed = parseTaskNLP(input);
  if (!parsed.title || !userId) return;

  const newTask = {
    user_id: userId,
    text: parsed.title,
    priority: priorityChoice || parsed.priority,
    completed: false
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert(newTask)
    .select()
    .single();

  if (error) throw error;
  setTasks(prev => [data, ...prev]);
  setInput("");
  setPriorityChoice("normal");
};
```

**completeTask()** - Ligne 1260
```javascript
const completeTask = async (id) => {
  if (!userId) return;

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  setTasks(prev => prev.filter(t => t.id !== id));
  ding();
};
```

**removeTask()** - Ligne 1278
```javascript
const removeTask = async (id) => {
  if (!userId) return;

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  setTasks(prev => prev.filter(t => t.id !== id));
};
```

#### ✅ NOTES (Lignes 1315-1386)

**addNote()** - Ligne 1316
```javascript
const addNote = async () => {
  if (!noteContent.trim() || !userId) return;

  const newNote = {
    user_id: userId,
    title: noteTitle.trim() || null,
    content: noteContent.trim()
  };

  const { data, error } = await supabase
    .from('notes')
    .insert(newNote)
    .select()
    .single();

  if (error) throw error;
  setNotes(prev => [data, ...prev]);
  setNoteTitle("");
  setNoteContent("");
};
```

**updateNote()** - Ligne 1341
```javascript
const updateNote = async () => {
  if (!editingNote || !userId) return;

  const updates = {
    title: noteTitle.trim() || null,
    content: noteContent.trim()
  };

  const { error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', editingNote.id)
    .eq('user_id', userId);

  if (error) throw error;
  setNotes(prev => prev.map(note => note.id === editingNote.id ? { ...note, ...updates } : note));
};
```

**deleteNote()** - Ligne 1366
```javascript
const deleteNote = async (id) => {
  if (!userId) return;

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  setNotes(prev => prev.filter(note => note.id !== id));
};
```

#### ✅ SHOPPING (Lignes 1412-1513)

**addShoppingItem()** - Ligne 1412
```javascript
const addShoppingItem = async () => {
  if (!itemName.trim() || !userId) return;
  const quantity = Math.max(1, itemQuantity || 1);

  const newItem = {
    user_id: userId,
    name: itemName.trim(),
    quantity: quantity,
    unit: itemUnit,
    category: itemCategory === 'courant' ? 'now' : 'later',
    checked: false
  };

  const { data, error } = await supabase
    .from('shopping_items')
    .insert(newItem)
    .select()
    .single();

  if (error) throw error;
  setShoppingItems(prev => [data, ...prev]);
  // Reset form...
};
```

**updateShoppingItem()** - Ligne 1443
```javascript
const updateShoppingItem = async () => {
  if (!editingItem || !userId) return;

  const updates = {
    name: itemName.trim(),
    quantity: Math.max(1, itemQuantity || 1),
    unit: itemUnit,
    category: itemCategory === 'courant' ? 'now' : 'later'
  };

  const { error } = await supabase
    .from('shopping_items')
    .update(updates)
    .eq('id', editingItem.id)
    .eq('user_id', userId);

  if (error) throw error;
  setShoppingItems(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...updates } : item));
};
```

**deleteShoppingItem()** - Ligne 1473
```javascript
const deleteShoppingItem = async (id) => {
  if (!userId) return;

  const { error } = await supabase
    .from('shopping_items')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  setShoppingItems(prev => prev.filter(item => item.id !== id));
};
```

**togglePurchased()** - Ligne 1495
```javascript
const togglePurchased = async (id) => {
  const item = shoppingItems.find(i => i.id === id);
  if (!item || !userId) return;

  const { error } = await supabase
    .from('shopping_items')
    .update({ checked: !item.checked })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  setShoppingItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
};
```

**⚠️ Note**: Le schéma Supabase utilise `checked` au lieu de `purchased`

#### ✅ BUDGET (Lignes 1564-1652)

**addBudgetItem()** - Ligne 1564
```javascript
const addBudgetItem = async () => {
  if (!budgetAmount || !userId) return;
  const amount = parseFloat(budgetAmount);
  if (isNaN(amount)) return;

  const newItem = {
    user_id: userId,
    description: budgetDescription.trim() || BUDGET_CATEGORIES[budgetType][budgetCategory],
    amount: amount,
    type: budgetType,
    category: budgetCategory,
    date: budgetDate,
    recurring: false
  };

  const { data, error } = await supabase
    .from('budget_items')
    .insert(newItem)
    .select()
    .single();

  if (error) throw error;
  setBudgetItems(prev => [data, ...prev]);
  // Reset form...
};
```

**updateBudgetItem()** - Ligne 1596
```javascript
const updateBudgetItem = async () => {
  if (!editingBudgetItem || !budgetAmount || !userId) return;
  const amount = parseFloat(budgetAmount);
  if (isNaN(amount)) return;

  const updates = {
    description: budgetDescription.trim() || BUDGET_CATEGORIES[budgetType][budgetCategory],
    amount: amount,
    type: budgetType,
    category: budgetCategory,
    date: budgetDate
  };

  const { error } = await supabase
    .from('budget_items')
    .update(updates)
    .eq('id', editingBudgetItem.id)
    .eq('user_id', userId);

  if (error) throw error;
  setBudgetItems(prev => prev.map(item => item.id === editingBudgetItem.id ? { ...item, ...updates } : item));
};
```

**deleteBudgetItem()** - Ligne 1629
```javascript
const deleteBudgetItem = async (id) => {
  if (!userId) return;

  const { error } = await supabase
    .from('budget_items')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  setBudgetItems(prev => prev.filter(item => item.id !== id));
};
```

#### ✅ MEDIA (Lignes 1733-1812)

**addMedia()** - Ligne 1733
```javascript
const addMedia = async () => {
  if (!mediaTitle.trim() || !userId) return;

  const newMedia = {
    user_id: userId,
    title: mediaTitle.trim(),
    original_title: selectedApiResult?.originalTitle || null,
    overview: selectedApiResult?.overview || null,
    poster_path: selectedApiResult?.posterPath || null,
    release_date: selectedApiResult?.releaseDate || null,
    genres: selectedApiResult?.genres || [],
    type: mediaType,
    status: mediaStatus,
    rating: mediaStatus === 'watched' ? mediaRating : null,
    comment: mediaStatus === 'watched' ? mediaComment.trim() : '',
    date_watched: mediaStatus === 'watched' ? new Date().toISOString() : null,
    api_id: selectedApiResult?.id || null
  };

  if (editingMedia) {
    const { error } = await supabase
      .from('media_items')
      .update(newMedia)
      .eq('id', editingMedia.id)
      .eq('user_id', userId);

    if (error) throw error;
    setMediaItems(prev => prev.map(item => item.id === editingMedia.id ? { ...item, ...newMedia } : item));
    setEditingMedia(null);
  } else {
    const { data, error } = await supabase
      .from('media_items')
      .insert(newMedia)
      .select()
      .single();

    if (error) throw error;
    setMediaItems(prev => [data, ...prev]);
  }

  resetMediaForm();
};
```

**deleteMedia()** - Ligne 1793
```javascript
const deleteMedia = async (id) => {
  if (!userId) return;

  const { error } = await supabase
    .from('media_items')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  setMediaItems(prev => prev.filter(item => item.id !== id));
};
```

---

## 🗂️ Mapping Champs localStorage → Supabase

### Tasks
| localStorage | Supabase | Type |
|--------------|----------|------|
| `id` | `id` | UUID (auto) |
| `title` | `text` | TEXT |
| `priority` | `priority` | TEXT |
| `completed` | `completed` | BOOLEAN |
| - | `user_id` | UUID |
| - | `created_at` | TIMESTAMP |

### Notes
| localStorage | Supabase | Type |
|--------------|----------|------|
| `id` | `id` | UUID (auto) |
| `title` | `title` | TEXT |
| `content` | `content` | TEXT |
| `createdAt` | `created_at` | TIMESTAMP |
| `updatedAt` | `updated_at` | TIMESTAMP |
| - | `user_id` | UUID |

### Shopping Items
| localStorage | Supabase | Type |
|--------------|----------|------|
| `id` | `id` | UUID (auto) |
| `name` | `name` | TEXT |
| `quantity` | `quantity` | NUMERIC |
| `unit` | `unit` | TEXT |
| `category` ('courant'/'futur') | `category` ('now'/'later') | TEXT |
| `purchased` | `checked` | BOOLEAN |
| - | `user_id` | UUID |
| `createdAt` | `created_at` | TIMESTAMP |

**⚠️ Changements importants**:
- `purchased` → `checked`
- `'courant'`/`'futur'` → `'now'`/`'later'`

### Budget Items
| localStorage | Supabase | Type |
|--------------|----------|------|
| `id` | `id` | UUID (auto) |
| `description` | `description` | TEXT |
| `amount` | `amount` | NUMERIC |
| `type` | `type` | TEXT |
| `category` | `category` | TEXT |
| `date` | `date` | DATE |
| - | `recurring` | BOOLEAN |
| - | `recurring_frequency` | TEXT |
| - | `user_id` | UUID |
| `createdAt` | `created_at` | TIMESTAMP |

### Media Items
| localStorage | Supabase | Type |
|--------------|----------|------|
| `id` | `id` | UUID (auto) |
| `title` | `title` | TEXT |
| `originalTitle` | `original_title` | TEXT |
| `overview` | `overview` | TEXT |
| `posterPath` | `poster_path` | TEXT |
| `releaseDate` | `release_date` | TEXT |
| `genres` | `genres` | TEXT[] |
| `type` | `type` | TEXT |
| `status` | `status` | TEXT |
| `rating` | `rating` | INTEGER |
| `comment` | `comment` | TEXT |
| `dateWatched` | `date_watched` | TIMESTAMP |
| `apiId` | `api_id` | TEXT |
| - | `user_id` | UUID |
| `dateAdded` | `created_at` | TIMESTAMP |

**⚠️ Changements importants**: snake_case pour tous les champs

### User Settings
| localStorage | Supabase | Type |
|--------------|----------|------|
| `LS_BUDGET_LIMITS_KEY` | `budget_limits` | JSONB |
| `LS_RECURRING_KEY` | `preferences.recurring_expenses` | JSONB |
| - | `user_id` | UUID (PK) |

---

## 🔒 Sécurité RLS (Row Level Security)

Toutes les tables sont protégées par RLS:

```sql
-- Exemple pour tasks
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
```

✅ Chaque utilisateur peut **uniquement** voir et modifier **ses propres données**

---

## 📝 Code Supprimé

### localStorage Keys (Lignes 14-20)
```javascript
// ❌ PLUS UTILISÉ - Peut être supprimé après vérification
// const LS_KEY = "todo_coach_v2";
// const LS_NOTES_KEY = "todo_coach_notes_v1";
// const LS_SHOPPING_KEY = "todo_coach_shopping_v1";
// const LS_BUDGET_KEY = "todo_coach_budget_v1";
// const LS_RECURRING_KEY = "todo_coach_recurring_v1";
// const LS_BUDGET_LIMITS_KEY = "todo_coach_budget_limits_v1";
// const LS_MEDIA_KEY = "todo_coach_media_v1";
```

### UUID Generator (Ligne 21)
```javascript
// ❌ PLUS UTILISÉ - Supabase génère les UUIDs automatiquement
// const uuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
```

### Hooks localStorage Supprimés
Tous les `useEffect` avec `localStorage.getItem()` et `localStorage.setItem()` ont été remplacés

---

## 📋 Prochaines Étapes

### 1. ✅ Vérifier le Schéma Supabase

Assurez-vous que le fichier `supabase-schema.sql` a été exécuté dans Supabase:

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. **SQL Editor** → Vérifiez que les tables existent:
   - `public.tasks`
   - `public.notes`
   - `public.shopping_items`
   - `public.budget_items`
   - `public.media_items`
   - `public.user_settings`

4. **Table Editor** → Vérifiez que RLS est activé pour toutes les tables

### 2. ✅ Tester le Flux Complet

#### Test 1: Créer un compte
```
1. Ouvrir http://localhost:3000
2. Créer un compte avec email + mot de passe
3. Vérifier l'email OTP (code à 6 chiffres)
4. Se connecter
```

#### Test 2: Ajouter des données dans chaque module
```
1. TASKS: Ajouter une tâche "Test Supabase"
   → Ouvrir Supabase Dashboard → Table tasks → Vérifier que la ligne existe

2. NOTES: Ajouter une note "Test note"
   → Ouvrir Supabase Dashboard → Table notes → Vérifier

3. SHOPPING: Ajouter un article "Pain"
   → Ouvrir Supabase Dashboard → Table shopping_items → Vérifier

4. BUDGET: Ajouter une entrée "Salaire 3000 CHF"
   → Ouvrir Supabase Dashboard → Table budget_items → Vérifier

5. MEDIA: Ajouter un film "Inception"
   → Ouvrir Supabase Dashboard → Table media_items → Vérifier
```

#### Test 3: Vérifier la persistance
```
1. Ajouter des données dans chaque module
2. Recharger la page (F5)
   → Vérifier que toutes les données sont toujours présentes

3. Se déconnecter
4. Se reconnecter
   → Vérifier que toutes les données sont toujours présentes

5. Ouvrir un autre navigateur (ex: Edge si vous êtes sur Chrome)
6. Se connecter avec le même compte
   → Vérifier que les données sont synchronisées
```

#### Test 4: Modifier et supprimer
```
1. TASKS: Compléter une tâche → Vérifier qu'elle est supprimée
2. NOTES: Modifier une note → Vérifier la mise à jour
3. SHOPPING: Cocher un article → Vérifier l'état
4. BUDGET: Modifier une entrée → Vérifier la mise à jour
5. MEDIA: Supprimer un média → Vérifier la suppression
```

#### Test 5: Isolation des données par utilisateur
```
1. Créer un 2ème compte utilisateur
2. Ajouter des données différentes
3. Vérifier que chaque utilisateur voit uniquement SES données
   → User 1 ne doit PAS voir les données de User 2
```

### 3. ✅ Vérifier les Logs Console

Ouvrir la console du navigateur (F12) et vérifier:
- ✅ Pas d'erreurs Supabase (401, 403, 500, etc.)
- ✅ Messages "Erreur chargement X" affichés en cas de problème
- ✅ Appels réseau vers Supabase réussis (Status 200/201)

### 4. ✅ Build de Production

```bash
npm run build
```

Vérifier qu'il n'y a **aucune erreur** de build.

### 5. ✅ Commit et Déploiement

```bash
git add .
git commit -m "Migrer persistence localStorage vers Supabase

- Ajouter import supabase dans App.jsx
- Implémenter hooks de chargement pour tous les modules (Tasks, Notes, Shopping, Budget, Media, Settings)
- Migrer toutes les fonctions CRUD vers Supabase (insert, update, delete, select)
- Ajouter auto-save pour budgetLimits et recurringExpenses
- Supprimer dépendances localStorage
- Supprimer données de test forcées (FORCE_TEST_DATA)

Modules migrés:
✅ Tasks (addTask, completeTask, removeTask)
✅ Notes (addNote, updateNote, deleteNote)
✅ Shopping (addShoppingItem, updateShoppingItem, deleteShoppingItem, togglePurchased)
✅ Budget (addBudgetItem, updateBudgetItem, deleteBudgetItem)
✅ Media (addMedia, deleteMedia - avec support edit)
✅ User Settings (budgetLimits, recurringExpenses)

Tous les hooks localStorage supprimés
RLS activé sur toutes les tables
Isolation complète des données par utilisateur

🤖 Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

Netlify déploiera automatiquement la nouvelle version.

---

## ⚠️ Points d'Attention

### 1. Migration des Données Existantes

**Les anciennes données localStorage ne seront PAS automatiquement migrées.**

Si des utilisateurs ont déjà des données en localStorage:
- **Option A**: Créer un script de migration one-time au premier login
- **Option B**: Accepter la perte des anciennes données (OK si app en test)
- **Option C**: Ajouter un bouton "Importer depuis localStorage" dans les paramètres

### 2. Champs Snake_Case

Supabase utilise `snake_case` pour les colonnes:
- ✅ Frontend: `original_title`, `poster_path`, `date_watched`
- ✅ Base de données: colonnes PostgreSQL avec underscores

### 3. Catégories Shopping

Le code mappe automatiquement:
- `'courant'` (localStorage) → `'now'` (Supabase)
- `'futur'` (localStorage) → `'later'` (Supabase)

### 4. Genres comme Array

Le champ `genres` dans `media_items` est de type `TEXT[]` (array PostgreSQL):
```javascript
genres: selectedApiResult?.genres || []  // ✅ Correct
```

### 5. Auto-Save avec Debounce

Les settings sont sauvegardés automatiquement avec un délai de 500ms:
```javascript
const timeoutId = setTimeout(saveSettings, 500); // Debounce
```

Cela évite des appels API excessifs lors de modifications rapides.

---

## 🎉 Résultat Attendu

Après cette migration:

✅ **Persistance complète**: Les données ne sont plus perdues au vidage du cache
✅ **Multi-device**: Accès aux mêmes données depuis n'importe quel appareil
✅ **Synchronisation**: Les modifications sont instantanément sauvegardées
✅ **Sécurité**: Chaque utilisateur voit uniquement ses propres données (RLS)
✅ **Performance**: ~100-300ms de latence réseau pour les opérations
✅ **Scalabilité**: 8GB de stockage gratuit (vs ~5-10MB localStorage)

---

## 🆘 Dépannage

### Erreur: "Failed to fetch" / "Network error"

**Cause**: Client Supabase mal configuré
**Solution**: Vérifier `src/lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Vérifier `.env`:
```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-publique
```

### Erreur: "new row violates row-level security policy"

**Cause**: RLS bloque l'insertion car `user_id` ne correspond pas
**Solution**:
1. Vérifier que `userId` est bien récupéré depuis `session.user.id`
2. Vérifier que les policies RLS sont bien configurées
3. Console Supabase → Authentication → Users → Vérifier l'ID de l'utilisateur

### Erreur: "null value in column user_id violates not-null constraint"

**Cause**: `userId` est `undefined` lors de l'insertion
**Solution**: Ajouter une garde:
```javascript
if (!userId) {
  console.error('User not authenticated');
  return;
}
```

### Données ne se chargent pas

**Cause**: `useEffect` ne s'exécute pas
**Solution**:
1. Vérifier que `session` est bien passée en props à `<App />`
2. Console: `console.log('userId:', userId)` pour vérifier
3. Network tab (F12): vérifier les requêtes vers Supabase

---

**Dernière mise à jour**: 2025-10-08
**Version**: 1.0.0
**Status**: ✅ Prêt pour tests
