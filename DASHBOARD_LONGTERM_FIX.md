# 🔧 Correctif - TypeError Dashboard budgetLimits.longTerm

**Date**: 2025-10-08
**Status**: ✅ Corrigé
**Problème**: TypeError: Cannot read properties of undefined (reading 'epargne')

---

## 🐛 Problème Identifié

### Symptôme
Lors de l'accès au Dashboard, la console affichait :
```
TypeError: Cannot read properties of undefined (reading 'epargne')
```

L'application plantait et le Dashboard ne s'affichait pas.

### Cause Racine

**Ligne 999-1003** (`src/App.jsx`) : Lors du chargement des settings depuis Supabase, le merge de `budgetLimits` ne préservait **PAS** la propriété `longTerm` :

```javascript
// ❌ AVANT - longTerm manquant
setBudgetLimits(prevLimits => ({
  categories: { ...prevLimits.categories, ...(data.budget_limits.categories || {}) },
  epargne: { ...prevLimits.epargne, ...(data.budget_limits.epargne || {}) },
  investissements: { ...prevLimits.investissements, ...(data.budget_limits.investissements || {}) }
  // ⚠️ longTerm n'est PAS mergé -> devient undefined !
}));
```

**Ligne 2445, 2455, 2505** : Le Dashboard accédait à `budgetLimits.longTerm.epargne` qui était `undefined` après le chargement Supabase.

### Pourquoi c'était dangereux ?

1. **État initial OK** : Au démarrage, `budgetLimits` a une structure par défaut avec `longTerm: { epargne: 0, investissements: 0 }` (ligne 817-820)

2. **Chargement Supabase** : Le `setBudgetLimits` remplace **complètement** l'objet mais oublie de merger `longTerm`

3. **Résultat** : `budgetLimits = { categories: {...}, epargne: {...}, investissements: {...} }`
   - ❌ Plus de propriété `longTerm` !

4. **Crash** : `budgetLimits.longTerm.epargne` → `undefined.epargne` → TypeError

---

## ✅ Correctifs Appliqués

### Correctif 1 : Merger `longTerm` lors du chargement Supabase

**Fichier** : `src/App.jsx` ligne 999-1004

**Avant** :
```javascript
setBudgetLimits(prevLimits => ({
  categories: { ...prevLimits.categories, ...(data.budget_limits.categories || {}) },
  epargne: { ...prevLimits.epargne, ...(data.budget_limits.epargne || {}) },
  investissements: { ...prevLimits.investissements, ...(data.budget_limits.investissements || {}) }
}));
```

**Après** :
```javascript
setBudgetLimits(prevLimits => ({
  categories: { ...prevLimits.categories, ...(data.budget_limits.categories || {}) },
  epargne: { ...prevLimits.epargne, ...(data.budget_limits.epargne || {}) },
  investissements: { ...prevLimits.investissements, ...(data.budget_limits.investissements || {}) },
  longTerm: { ...prevLimits.longTerm, ...(data.budget_limits.longTerm || {}) }
}));
```

**Bénéfice** : Préserve toujours la structure `longTerm` même si Supabase ne renvoie rien.

---

### Correctif 2 : Ajouter nullish coalescing pour les conditions d'affichage

**Fichier** : `src/App.jsx` lignes 2446, 2455, 2505

**Avant** :
```javascript
{(budgetLimits.longTerm.epargne > 0 || budgetLimits.longTerm.investissements > 0) && (
  // Dashboard jauges d'objectifs
)}
```

**Après** :
```javascript
{(budgetLimits?.longTerm?.epargne > 0 || budgetLimits?.longTerm?.investissements > 0) && (
  // Dashboard jauges d'objectifs
)}
```

**Occurrences corrigées** :
- Ligne 2446 : Condition d'affichage du bloc "Progression des objectifs"
- Ligne 2455 : Condition d'affichage de la jauge "Objectif d'épargne"
- Ligne 2505 : Condition d'affichage de la jauge "Objectif d'investissement"

**Bénéfice** : Vérifie que `longTerm` existe avant d'accéder à ses propriétés.

---

### Correctif 3 : Ajouter fallback pour les inputs de paramètres

**Fichier** : `src/App.jsx` lignes 5241, 5259

**Avant** :
```javascript
<Input
  type="number"
  value={budgetLimits.longTerm.epargne}
  onChange={...}
/>
```

**Après** :
```javascript
<Input
  type="number"
  value={budgetLimits?.longTerm?.epargne || 0}
  onChange={...}
/>
```

**Occurrences corrigées** :
- Ligne 5241 : Input "Objectif d'épargne total"
- Ligne 5259 : Input "Objectif d'investissement total"

**Bénéfice** : Affiche toujours une valeur (0 par défaut) au lieu de crash.

---

## 📊 Résumé des Changements

| Fichier | Lignes Modifiées | Changement |
|---------|------------------|------------|
| `src/App.jsx` | 1003 | Ajout de `longTerm` dans le merge Supabase |
| `src/App.jsx` | 2446, 2455, 2505 | Ajout de `?.` pour nullish coalescing |
| `src/App.jsx` | 5241, 5259 | Ajout de fallback `|| 0` pour inputs |

**Total** : 7 lignes modifiées

---

## 🧪 Tests de Validation

### Test 1 : Dashboard charge sans erreur

```bash
1. Lancer npm run dev
2. Ouvrir http://localhost:3000
3. Se connecter avec un compte
4. Aller sur le Dashboard
5. Console F12 → Aucune erreur TypeError
```

**Résultat attendu** :
- ✅ Dashboard s'affiche correctement
- ✅ Pas d'erreur `Cannot read properties of undefined`
- ✅ Jauges d'objectifs visibles (si objectifs définis)

---

### Test 2 : Chargement depuis Supabase sans `longTerm`

```bash
1. Supprimer la propriété longTerm dans Supabase :
   - Dashboard → Table user_settings
   - Colonne budget_limits → Retirer la clé "longTerm"
2. Recharger l'application
3. Vérifier que le Dashboard fonctionne
```

**Résultat attendu** :
- ✅ Pas de crash
- ✅ `budgetLimits.longTerm` initialisé à `{ epargne: 0, investissements: 0 }`
- ✅ Dashboard affiche les valeurs par défaut

---

### Test 3 : Définir des objectifs dans les paramètres

```bash
1. Aller dans Paramètres → Onglet Objectifs
2. Définir "Objectif d'épargne total" : 100'000 CHF
3. Définir "Objectif d'investissement total" : 50'000 CHF
4. Sauvegarder
5. Retourner au Dashboard
6. Vérifier que les jauges apparaissent
```

**Résultat attendu** :
- ✅ Input accepte la saisie (pas de NaN)
- ✅ Sauvegarde dans Supabase avec `budget_limits.longTerm`
- ✅ Dashboard affiche les jauges de progression
- ✅ Pourcentage calculé correctement

---

## 🔍 Vérifications Post-Fix

### Console Browser (F12)

Avant le fix :
```
❌ TypeError: Cannot read properties of undefined (reading 'epargne')
    at App.jsx:2445
```

Après le fix :
```
✅ Aucune erreur
✅ Dashboard chargé correctement
```

### Supabase Dashboard

Table `user_settings` → Colonne `budget_limits` :

**Structure attendue** :
```json
{
  "categories": {
    "alimentation": 800,
    "restaurants": 200,
    ...
  },
  "epargne": {
    "compte_epargne": 1000,
    "pilier3": 500
  },
  "investissements": {
    "bourse": 500,
    "crypto": 200,
    ...
  },
  "longTerm": {
    "epargne": 100000,
    "investissements": 50000
  }
}
```

---

## 🚀 Déploiement

### Commit

```bash
git add src/App.jsx DASHBOARD_LONGTERM_FIX.md
git commit -m "Fix: Résoudre TypeError budgetLimits.longTerm undefined sur Dashboard

Problème corrigé:
- TypeError 'Cannot read properties of undefined (reading epargne)' sur Dashboard
- budgetLimits.longTerm devenait undefined après chargement Supabase

Changements:
- Ajouter longTerm au merge lors du loadSettings (ligne 1003)
- Ajouter nullish coalescing (?.) pour tous les accès à longTerm (lignes 2446, 2455, 2505)
- Ajouter fallback || 0 pour les inputs de paramètres (lignes 5241, 5259)

Modules affectés:
- Dashboard (jauges d'objectifs)
- Paramètres (inputs objectifs long terme)

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

---

## 📌 Points d'Attention Futurs

### Pattern à respecter lors de l'ajout de nouvelles propriétés

Si tu ajoutes une nouvelle propriété à `budgetLimits`, **TOUJOURS** l'inclure dans le merge Supabase :

```javascript
// ✅ BON
setBudgetLimits(prevLimits => ({
  categories: { ...prevLimits.categories, ...(data.budget_limits.categories || {}) },
  epargne: { ...prevLimits.epargne, ...(data.budget_limits.epargne || {}) },
  investissements: { ...prevLimits.investissements, ...(data.budget_limits.investissements || {}) },
  longTerm: { ...prevLimits.longTerm, ...(data.budget_limits.longTerm || {}) },
  nouvelleProp: { ...prevLimits.nouvelleProp, ...(data.budget_limits.nouvelleProp || {}) }
}));

// ❌ MAUVAIS - oublie de merger nouvelleProp
setBudgetLimits(prevLimits => ({
  categories: { ...prevLimits.categories, ...(data.budget_limits.categories || {}) },
  // nouvelleProp disparaît !
}));
```

### Toujours utiliser `?.` pour accéder à des propriétés imbriquées

```javascript
// ✅ BON
{budgetLimits?.longTerm?.epargne > 0 && <Component />}

// ❌ MAUVAIS
{budgetLimits.longTerm.epargne > 0 && <Component />}
```

---

## 🔗 Fichiers Associés

- [DIAGNOSTIC_FIX_SUPABASE.md](DIAGNOSTIC_FIX_SUPABASE.md) - Correctifs précédents (budgetLimits.categories)
- [DATA_PERSISTENCE_DIAGNOSTIC.md](DATA_PERSISTENCE_DIAGNOSTIC.md) - Migration localStorage → Supabase
- [src/App.jsx](src/App.jsx) - Fichier principal modifié

---

**Note** : Ce fix garantit que le Dashboard fonctionne même si Supabase ne renvoie pas de données `longTerm`, ou si l'utilisateur n'a jamais défini d'objectifs long terme. 🎯
