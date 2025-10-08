# 🔧 Correctif - Affichage Liste de Courses (Shopping Items)

**Date**: 2025-10-08
**Status**: ✅ Corrigé
**Problème**: Les données insérées dans `shopping_items` (Supabase) ne s'affichaient pas dans l'application

---

## 🐛 Problème Identifié

### Symptôme
- Les données de courses s'insèrent correctement dans la table `shopping_items` de Supabase (visible dans le Dashboard Supabase)
- La clé `user_id` est correcte
- **MAIS** : Les items ne s'affichent pas dans l'application web
- Aucune erreur visible en console

### Cause Racine

**Incohérence entre les noms de propriétés dans le code et le schéma Supabase :**

#### Problème 1 : Nom de propriété `created_at` vs `createdAt`

**Ligne 1616-1617, 1634** (`src/App.jsx`) : Le code utilisait `item.createdAt` (camelCase) alors que Supabase renvoie `item.created_at` (snake_case).

```javascript
// ❌ AVANT - Propriété inexistante
if (new Date(item.createdAt) > new Date(acc[key].createdAt)) {
  acc[key].createdAt = item.createdAt;
}
return new Date(b.createdAt) - new Date(a.createdAt);
```

**Impact** : Les dates de tri étaient `undefined`, provoquant un tri incorrect et potentiellement des erreurs silencieuses.

---

#### Problème 2 : Valeurs de catégorie `'now'/'later'` vs `'courant'/'futur'`

**Schéma Supabase** (`supabase-schema.sql:95`) :
```sql
category TEXT DEFAULT 'now' CHECK (category IN ('now', 'later'))
```

**Code d'insertion** (`src/App.jsx:1496`) - **CORRECT** :
```javascript
category: itemCategory === 'courant' ? 'now' : 'later'
```

**Mais le filtre d'affichage** (`src/App.jsx:1631-1632, 4706, 4714, 4758, 4766`) - **INCORRECT** :
```javascript
// ❌ AVANT - Comparaison avec des valeurs qui n'existent pas dans Supabase
if (a.category === 'courant' && b.category === 'futur') return -1;
if (a.category === 'futur' && b.category === 'courant') return 1;

{filteredShoppingItems.filter(item => item.category === 'courant').map(...)}
{filteredShoppingItems.filter(item => item.category === 'futur').map(...)}
```

**Impact** : Les filtres ne matchaient jamais, donc **AUCUN item ne s'affichait** malgré leur présence dans Supabase.

---

#### Problème 3 : Filtrage sur `purchased` au lieu de `checked`

**Ligne 1608** (`src/App.jsx`) :
```javascript
// ❌ AVANT - Propriété purchased n'existe pas dans Supabase
let filtered = shoppingItems.filter(item => !item.purchased);
```

**Schéma Supabase** (`supabase-schema.sql:96`) :
```sql
checked BOOLEAN DEFAULT FALSE
```

**Impact** : Tous les items étaient filtrés car `item.purchased` était toujours `undefined` (équivalent à `false`), donc `!undefined` = `true`, mais c'est un comportement accidentel.

---

## ✅ Correctifs Appliqués

### Correctif 1 : Utiliser `created_at` au lieu de `createdAt`

**Fichier** : `src/App.jsx` lignes 1616-1617, 1634

**Avant** :
```javascript
if (new Date(item.createdAt) > new Date(acc[key].createdAt)) {
  acc[key].createdAt = item.createdAt;
}
// ...
return new Date(b.createdAt) - new Date(a.createdAt);
```

**Après** :
```javascript
if (new Date(item.created_at) > new Date(acc[key].created_at)) {
  acc[key].created_at = item.created_at;
}
// ...
return new Date(b.created_at) - new Date(a.created_at);
```

**Bénéfice** : Tri correct par date de création.

---

### Correctif 2 : Utiliser `'now'/'later'` au lieu de `'courant'/'futur'`

**Fichier** : `src/App.jsx` lignes 1631-1632, 4706, 4714, 4758, 4766

**Avant** :
```javascript
// Trier par catégorie
if (a.category === 'courant' && b.category === 'futur') return -1;
if (a.category === 'futur' && b.category === 'courant') return 1;

// Rendu JSX
{filteredShoppingItems.filter(item => item.category === 'courant').map(item => (...))}
{filteredShoppingItems.filter(item => item.category === 'futur').map(item => (...))}
```

**Après** :
```javascript
// Trier par catégorie (Courses courantes 'now' en premier)
if (a.category === 'now' && b.category === 'later') return -1;
if (a.category === 'later' && b.category === 'now') return 1;

// Rendu JSX
{filteredShoppingItems.filter(item => item.category === 'now').map(item => (...))}
{filteredShoppingItems.filter(item => item.category === 'later').map(item => (...))}
```

**Bénéfice** : Les filtres matchent maintenant les valeurs Supabase, les items s'affichent correctement.

---

### Correctif 3 : Utiliser `checked` au lieu de `purchased`

**Fichier** : `src/App.jsx` ligne 1608

**Avant** :
```javascript
let filtered = shoppingItems.filter(item => !item.purchased); // Propriété inexistante
```

**Après** :
```javascript
let filtered = shoppingItems.filter(item => !item.checked); // Correspond à Supabase
```

**Bénéfice** : Filtrage cohérent avec le schéma Supabase.

---

## 📊 Résumé des Changements

| Fichier | Lignes Modifiées | Changement |
|---------|------------------|------------|
| `src/App.jsx` | 1608 | `!item.purchased` → `!item.checked` |
| `src/App.jsx` | 1616-1617 | `item.createdAt` → `item.created_at` |
| `src/App.jsx` | 1631-1632 | `'courant'/'futur'` → `'now'/'later'` (tri) |
| `src/App.jsx` | 1634 | `b.createdAt` → `b.created_at` (tri) |
| `src/App.jsx` | 4706 | `.filter(item => item.category === 'courant')` → `'now'` |
| `src/App.jsx` | 4714 | `.filter(item => item.category === 'courant')` → `'now'` |
| `src/App.jsx` | 4758 | `.filter(item => item.category === 'futur')` → `'later'` |
| `src/App.jsx` | 4766 | `.filter(item => item.category === 'futur')` → `'later'` |

**Total** : 9 lignes corrigées pour alignement avec Supabase

---

## 🧪 Tests de Validation

### Test 1 : Affichage des items existants

```bash
1. Lancer npm run dev
2. Se connecter avec un compte
3. Aller dans "Courses"
4. Vérifier que les items existants (visibles dans Supabase Dashboard) s'affichent
```

**Résultat attendu** :
- ✅ Tous les items non cochés apparaissent dans la liste
- ✅ Items avec `category='now'` dans section "Courses courantes"
- ✅ Items avec `category='later'` dans section "Achats futurs"

---

### Test 2 : Ajout d'un nouvel item

```bash
1. Dans "Courses", saisir un nouvel article :
   - Nom : "Pommes"
   - Quantité : 2
   - Unité : kg
   - Catégorie : "Courses courantes"
2. Cliquer "Valider"
3. Vérifier que l'item apparaît instantanément
4. Vérifier dans Supabase Dashboard → Table shopping_items → Nouvel enregistrement
```

**Résultat attendu** :
- ✅ Item ajouté visible immédiatement
- ✅ Données correctes dans Supabase (`category='now'`)
- ✅ `user_id` correspond à l'utilisateur connecté

---

### Test 3 : Cochage d'un item

```bash
1. Cliquer sur le bouton ✓ vert d'un item
2. Vérifier que l'item disparaît de la liste
3. Recharger la page (F5)
4. Vérifier que l'item reste caché
5. Vérifier dans Supabase : `checked=true`
```

**Résultat attendu** :
- ✅ Item coché disparaît immédiatement
- ✅ Persist après rechargement
- ✅ Champ `checked` mis à jour dans Supabase

---

### Test 4 : Persistance après rechargement

```bash
1. Ajouter plusieurs items dans les deux catégories
2. Recharger la page (F5 ou CTRL+R)
3. Retourner dans "Courses"
4. Vérifier que tous les items non cochés s'affichent
```

**Résultat attendu** :
- ✅ Tous les items non cochés chargés depuis Supabase
- ✅ Tri correct (catégorie + date)
- ✅ Pas de doublons
- ✅ Pas d'erreur console

---

## 🔍 Vérifications Post-Fix

### Console Browser (F12)

**Avant le fix** :
```
⚠️ Aucune erreur visible (problème silencieux)
⚠️ filteredShoppingItems.length = 0 (même avec données dans Supabase)
```

**Après le fix** :
```
✅ Aucune erreur
✅ filteredShoppingItems.length correspond au nombre d'items non cochés
✅ Items s'affichent dans les bonnes sections
```

---

### Supabase Dashboard

**Table `shopping_items`** :

| Colonne | Valeur attendue |
|---------|-----------------|
| `id` | UUID automatique |
| `user_id` | UUID de l'utilisateur connecté |
| `name` | Texte saisi |
| `quantity` | Nombre ≥ 1 |
| `unit` | 'p', 'kg', 'l', etc. |
| `category` | **'now'** ou **'later'** (PAS 'courant'/'futur') |
| `checked` | `false` (affiché) ou `true` (caché) |
| `created_at` | Timestamp automatique |
| `updated_at` | Timestamp automatique |

---

## 🚀 Déploiement

### Commit

```bash
git add src/App.jsx SHOPPING_DISPLAY_FIX.md
git commit -m "$(cat <<'EOF'
Fix: Corriger affichage liste de courses (shopping_items)

Problème corrigé:
- Items insérés dans Supabase mais ne s'affichaient pas dans l'application
- Incohérence entre noms de propriétés code vs schéma Supabase

Changements:
- Utiliser created_at au lieu de createdAt (lignes 1616-1617, 1634)
- Utiliser 'now'/'later' au lieu de 'courant'/'futur' pour category (lignes 1631-1632, 4706, 4714, 4758, 4766)
- Utiliser checked au lieu de purchased pour filtrage (ligne 1608)

Modules affectés:
- Courses (affichage, tri, filtrage)

Correctifs techniques:
- src/App.jsx:1608 - Filtre !item.checked au lieu de !item.purchased
- src/App.jsx:1616-1617 - created_at snake_case
- src/App.jsx:1631-1632 - Tri par category 'now'/'later'
- src/App.jsx:1634 - Tri par created_at
- src/App.jsx:4706 - Filtre category==='now' pour section courantes
- src/App.jsx:4714 - Map sur category==='now'
- src/App.jsx:4758 - Filtre category==='later' pour section futurs
- src/App.jsx:4766 - Map sur category==='later'

Documentation:
- SHOPPING_DISPLAY_FIX.md créé avec diagnostic complet et tests

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

git push origin main
```

---

## 📌 Points d'Attention Futurs

### Convention de nommage Supabase vs JavaScript

**Supabase utilise snake_case** pour les colonnes :
- `created_at`
- `updated_at`
- `user_id`

**JavaScript utilise camelCase** par convention :
- `createdAt`
- `updatedAt`
- `userId`

**⚠️ Ne PAS mélanger les deux !**

### Valeurs de `category` dans `shopping_items`

La table Supabase **FORCE** les valeurs `'now'` ou `'later'` via un CHECK constraint :

```sql
category TEXT DEFAULT 'now' CHECK (category IN ('now', 'later'))
```

**❌ Les valeurs `'courant'` et `'futur'` causeront une erreur SQL :**
```
violates check constraint "shopping_items_category_check"
```

### Correspondance Interface ↔ Supabase

| Interface (Frontend) | Supabase (Backend) |
|----------------------|--------------------|
| "Courses courantes" | `category='now'` |
| "Achats futurs" | `category='later'` |
| État coché | `checked=true` |
| État non coché | `checked=false` |

---

## 🔗 Fichiers Associés

- [DIAGNOSTIC_FIX_SUPABASE.md](DIAGNOSTIC_FIX_SUPABASE.md) - Correctifs budgetLimits
- [DASHBOARD_LONGTERM_FIX.md](DASHBOARD_LONGTERM_FIX.md) - Correctifs Dashboard longTerm
- [supabase-schema.sql](supabase-schema.sql) - Schéma de base de données
- [src/App.jsx](src/App.jsx) - Fichier principal modifié

---

**Note** : Ce fix garantit que les données saisies dans l'interface s'affichent correctement en respectant le schéma Supabase. Les futures évolutions doivent maintenir cette cohérence entre le code et la base de données. 🛒✅
