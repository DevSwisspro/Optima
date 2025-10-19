# 🚀 Guide de Configuration Netlify - OPTIMA

## ⚠️ Problème: Images de médias ne s'affichent pas sur le déploiement

Si les affiches de films/séries ne s'affichent pas sur l'application déployée (mais fonctionnent en local), c'est que **les variables d'environnement ne sont pas configurées sur Netlify**.

## 📝 Solution: Configurer les variables d'environnement

### Étape 1: Accéder aux paramètres Netlify

1. Connectez-vous à votre compte Netlify
2. Sélectionnez votre site **OPTIMA**
3. Allez dans **Site Settings** (Paramètres du site)
4. Dans le menu de gauche, cliquez sur **Environment variables** (Variables d'environnement)

### Étape 2: Ajouter les variables requises

Cliquez sur **Add a variable** et ajoutez les variables suivantes **une par une** :

#### 1. VITE_SUPABASE_URL
- **Key (Nom)**: `VITE_SUPABASE_URL`
- **Value (Valeur)**: `https://yduhoderreocqwjcebdv.supabase.co`
- **Scopes**: Cochez `All deployments`

#### 2. VITE_SUPABASE_ANON_KEY
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkdWhvZGVycmVvY3F3amNlYmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MjUzMTksImV4cCI6MjA3NTQwMTMxOX0.GASGF0xzafMXjLjfr-5bGlb-wnMFtWxYLQYZvssRDJI`
- **Scopes**: Cochez `All deployments`

#### 3. VITE_TMDB_API_KEY ⚡ **CRUCIAL POUR LES IMAGES**
- **Key**: `VITE_TMDB_API_KEY`
- **Value**: `b121567bcaadb1d20806b5f9fc7590dc`
- **Scopes**: Cochez `All deployments`

#### 4. VITE_ANILIST_CLIENT_ID
- **Key**: `VITE_ANILIST_CLIENT_ID`
- **Value**: `30614`
- **Scopes**: Cochez `All deployments`

### Étape 3: Redéployer le site

Après avoir ajouté toutes les variables :

1. Allez dans **Deploys** (Déploiements)
2. Cliquez sur **Trigger deploy** > **Deploy site**
3. Attendez que le build se termine (2-3 minutes)

## ✅ Vérification

Une fois le déploiement terminé :

1. Ouvrez l'application sur mobile ou web
2. Ouvrez la console du navigateur (F12)
3. Si vous voyez ce message au chargement :
   ```
   ❌ ERREUR: VITE_TMDB_API_KEY non configurée !
   ```
   → Les variables ne sont pas encore prises en compte, redéployez le site

4. Allez dans la section **Médias**
5. Essayez d'ajouter un film (ex: "Avatar")
6. Les suggestions avec affiches devraient apparaître !

## 🔍 Diagnostic en cas de problème

Si ça ne fonctionne toujours pas :

### Dans la console du navigateur (F12)

Cherchez ces messages :
- ✅ **Bon signe**: Pas de message d'erreur de clé API
- ❌ **Problème**: `❌ ERREUR: VITE_TMDB_API_KEY non configurée`
  → Vérifiez que la variable est bien ajoutée et redéployez

### Vérifier les variables sur Netlify

1. **Site Settings** > **Environment variables**
2. Vous devriez voir 4 variables avec le préfixe `VITE_`
3. Chacune doit avoir le scope **All deployments**

### Dernière étape si toujours bloqué

1. Supprimez toutes les variables existantes
2. Ajoutez-les à nouveau **une par une** en copiant exactement les valeurs ci-dessus
3. Redéployez le site
4. Videz le cache du navigateur (Ctrl+Shift+Del)

## 📞 Support

Si le problème persiste après avoir suivi ces étapes, vérifiez :
- La clé API TMDB est valide sur https://www.themoviedb.org/settings/api
- Les logs de build Netlify ne montrent pas d'erreur
- Le domaine Netlify est accessible

---

**Date de création**: 19 Octobre 2025
**Application**: OPTIMA v2.0 Premium
**Auteur**: Dev-Swiss
