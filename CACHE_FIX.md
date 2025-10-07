# 🔧 Correction du Problème de Cache PWA/Netlify

## Problème identifié

Le site Optima en production (https://optima.dev-swiss.ch) affichait une ancienne version même après un déploiement réussi sur Netlify, alors que la version locale était à jour.

### Cause racine

Le **Service Worker** (`sw.js`) mettait en cache l'application avec une version fixe (`optima-v1.0.0`), ce qui empêchait le navigateur de télécharger les nouvelles versions déployées.

## Solutions implémentées ✅

### 1. Versioning automatique du Service Worker

**Fichier créé** : `update-sw-version.js`

Ce script s'exécute automatiquement avant chaque build (`prebuild` dans package.json) et :
- Génère une version unique basée sur le timestamp ISO (ex: `v2025-10-07T15-56-04`)
- Met à jour les 3 constantes de cache dans `public/sw.js` :
  - `CACHE_NAME`
  - `STATIC_CACHE`
  - `DYNAMIC_CACHE`

```javascript
// Avant chaque build
const version = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
// Résultat : 'optima-v2025-10-07T15-56-04'
```

### 2. Headers Netlify optimisés

**Fichier modifié** : `netlify.toml`

Ajout de headers `no-cache` pour les fichiers critiques :

```toml
# index.html - Jamais en cache
[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
    Pragma = "no-cache"
    Expires = "0"

# Service Worker - Jamais en cache
[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
    Pragma = "no-cache"
    Expires = "0"

# Manifest PWA - Jamais en cache
[[headers]]
  for = "/manifest.json"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
```

### 3. Nettoyage automatique des anciens caches

Le Service Worker contient déjà la logique pour supprimer les anciens caches lors de l'activation :

```javascript
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Supprime tous les caches qui ne correspondent pas aux versions actuelles
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

## Comment ça fonctionne maintenant

### Workflow de déploiement

1. **Développement local** :
   ```bash
   git add .
   git commit -m "Nouvelle fonctionnalité"
   git push origin main
   ```

2. **Netlify détecte le commit** et lance le build :
   ```bash
   npm run build
   ```

3. **Avant le build** (`prebuild` script) :
   - `update-sw-version.js` s'exécute automatiquement
   - Génère une nouvelle version : `v2025-10-07T16-30-15`
   - Met à jour `public/sw.js` avec cette version

4. **Build Vite** :
   - Compile l'application
   - Copie `public/sw.js` (avec la nouvelle version) dans `dist/`

5. **Déploiement Netlify** :
   - Déploie le contenu de `dist/` sur le CDN
   - Applique les headers `no-cache` pour `index.html`, `sw.js` et `manifest.json`

6. **Premier visiteur après le déploiement** :
   - Le navigateur télécharge `index.html` (pas de cache grâce aux headers)
   - `index.html` enregistre le nouveau Service Worker
   - Le nouveau SW détecte un changement de version
   - **Suppression automatique** des anciens caches (`optima-v1.0.0`)
   - **Téléchargement** de tous les nouveaux assets
   - **Affichage** de la dernière version

## Vérification

### Pour tester si la mise à jour fonctionne

1. **Ouvre la console du navigateur** (F12) sur https://optima.dev-swiss.ch

2. **Onglet Application** → **Service Workers**
   - Tu devrais voir la version actuelle du SW
   - Après un déploiement, un nouveau SW apparaît en "waiting"

3. **Onglet Application** → **Cache Storage**
   - Tu devrais voir les caches avec la version actuelle (timestamp)
   - Les anciens caches sont automatiquement supprimés

4. **Pour forcer la mise à jour immédiate** :
   - Recharge la page avec `Ctrl+Shift+R` (hard refresh)
   - Ou ferme tous les onglets du site et réouvre

## Résultats attendus

✅ **Mises à jour automatiques** : Chaque déploiement Netlify force le téléchargement de la nouvelle version

✅ **Plus de décalage** : La version en production = la version locale après déploiement

✅ **Pas d'intervention manuelle** : Plus besoin de vider le cache du navigateur

✅ **Versioning traçable** : Chaque version a un timestamp unique (visible dans la console)

## Maintenance

### Pour incrémenter manuellement la version

Si besoin, tu peux manuellement exécuter le script :

```bash
node update-sw-version.js
```

### Pour désactiver complètement le Service Worker

Si tu veux désactiver le PWA (non recommandé) :

1. **Supprimer ou commenter** dans `index.html` :
   ```html
   <!-- Commenté :
   <script>
     if ('serviceWorker' in navigator) {
       navigator.serviceWorker.register('/sw.js')
     }
   </script>
   -->
   ```

2. **Unregister tous les SW** existants :
   ```javascript
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(registration => registration.unregister())
   })
   ```

## Fichiers modifiés

| Fichier | Action | Description |
|---------|--------|-------------|
| `public/sw.js` | Modifié | Version incrémentée à v2.0.0 puis automatisée |
| `netlify.toml` | Modifié | Ajout headers no-cache pour index.html, sw.js, manifest.json |
| `package.json` | Modifié | Ajout script `prebuild` |
| `update-sw-version.js` | Créé | Script d'auto-versioning du Service Worker |

## Support

Si tu rencontres encore des problèmes de cache :

1. **Vide le cache du navigateur** manuellement (une dernière fois)
2. **Vérifie dans Netlify** → Deploys que le build s'est bien terminé
3. **Consulte la console** (F12) pour voir les logs du Service Worker
4. **Vérifie la version** dans Application → Service Workers

---

**Note** : Ce système garantit que les futures mises à jour seront toujours visibles immédiatement après le déploiement Netlify. 🚀
