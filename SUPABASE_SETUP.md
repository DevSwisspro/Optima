# 🚀 Configuration Supabase pour Optima

Ce guide vous explique comment configurer complètement Supabase pour votre application Optima.

## 📋 Étape 1 : Créer un projet Supabase

1. Allez sur [https://app.supabase.com](https://app.supabase.com)
2. Cliquez sur "New Project"
3. Choisissez un nom pour votre projet (ex: "optima-prod")
4. Choisissez un mot de passe de base de données sécurisé
5. Sélectionnez une région proche de vos utilisateurs (ex: Europe West)
6. Cliquez sur "Create new project"

⏱️ La création du projet prend environ 2 minutes.

## 📋 Étape 2 : Récupérer vos clés API

Une fois le projet créé :

1. Allez dans **Settings** (icône d'engrenage en bas à gauche)
2. Cliquez sur **API**
3. Copiez les informations suivantes :
   - **Project URL** : votre URL Supabase
   - **anon public** : votre clé publique (anon key)

## 📋 Étape 3 : Configurer les variables d'environnement

1. Créez un fichier `.env.local` à la racine du projet :

```bash
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=votre-anon-key-ici
```

2. Remplacez les valeurs par celles copiées à l'étape 2

⚠️ **Important** : Ne commitez JAMAIS le fichier `.env.local` sur Git ! Il contient vos clés secrètes.

## 📋 Étape 4 : Exécuter le schéma SQL

1. Dans votre projet Supabase, allez dans **SQL Editor** (icône <> dans la barre latérale)
2. Cliquez sur **New query**
3. Ouvrez le fichier `supabase-schema.sql` de ce projet
4. Copiez tout le contenu
5. Collez-le dans l'éditeur SQL de Supabase
6. Cliquez sur **Run** (bouton en bas à droite)

✅ Vous devriez voir un message de succès. Cela crée toutes les tables nécessaires :
- `tasks` (Tâches)
- `notes` (Notes)
- `shopping_items` (Liste de courses)
- `budget_items` (Entrées budgétaires)
- `user_settings` (Paramètres utilisateur)

## 📋 Étape 5 : Configurer l'authentification par email

1. Allez dans **Authentication** → **Providers**
2. Assurez-vous que **Email** est activé
3. Configurez les paramètres suivants :

### Paramètres recommandés :

**Confirm email** : ✅ Activé (pour vérifier les emails)
**Secure email change** : ✅ Activé
**Secure password change** : ✅ Activé

### Templates d'email (optionnel mais recommandé)

Dans **Authentication** → **Email Templates**, personnalisez :
- **Confirm signup** : Email de confirmation d'inscription
- **Magic link** : Email de connexion magique
- **Change email address** : Email de changement d'adresse
- **Reset password** : Email de réinitialisation du mot de passe

## 📋 Étape 6 : Configurer les URLs de redirection (pour production)

1. Allez dans **Authentication** → **URL Configuration**
2. Ajoutez vos URLs de redirection :
   - `http://localhost:3000/**` (développement)
   - `https://votre-domaine.com/**` (production)

## 📋 Étape 7 : Vérifier Row Level Security (RLS)

Le schéma SQL a automatiquement configuré RLS pour toutes les tables. Pour vérifier :

1. Allez dans **Database** → **Tables**
2. Cliquez sur chaque table (`tasks`, `notes`, etc.)
3. Allez dans l'onglet **Policies**
4. Vous devriez voir 4 policies pour chaque table :
   - ✅ Users can view their own [table]
   - ✅ Users can insert their own [table]
   - ✅ Users can update their own [table]
   - ✅ Users can delete their own [table]

**Cela garantit que chaque utilisateur ne peut voir et modifier QUE ses propres données.**

## 📋 Étape 8 : Tester l'installation

Pour tester que tout fonctionne :

1. Lancez l'application en local : `npm run dev`
2. Allez sur `http://localhost:3000`
3. Vous devriez voir la page de connexion/inscription
4. Créez un compte de test
5. Ajoutez une tâche, une note, etc.
6. Vérifiez dans Supabase (Table Editor) que les données apparaissent

## 📋 Configuration pour Netlify (Production)

Pour déployer sur Netlify avec les variables d'environnement :

1. Allez dans votre projet Netlify
2. **Site settings** → **Environment variables**
3. Ajoutez les variables :
   - `VITE_SUPABASE_URL` = votre URL Supabase
   - `VITE_SUPABASE_ANON_KEY` = votre anon key
4. Redéployez le site

## 🔐 Sécurité

### ✅ Ce qui est sécurisé :

- **RLS activé** : Chaque utilisateur ne voit que ses données
- **Policies strictes** : Impossible d'accéder aux données d'un autre utilisateur
- **Authentification Supabase** : Gestion sécurisée des mots de passe
- **Triggers automatiques** : Timestamps et user_settings créés automatiquement

### ⚠️ Bonnes pratiques :

- Ne partagez JAMAIS vos clés API publiquement
- Utilisez `.env.local` pour le développement local
- Utilisez les variables d'environnement Netlify pour la production
- Changez régulièrement votre mot de passe de base de données
- Activez 2FA sur votre compte Supabase

## 📊 Surveillance et monitoring

Dans Supabase, vous pouvez :

1. **Database** → **Reports** : Voir l'utilisation de la base de données
2. **Auth** → **Users** : Gérer les utilisateurs
3. **Logs** : Voir les requêtes et erreurs

## 🆘 En cas de problème

### Erreur "Invalid API key"
- Vérifiez que vous avez bien copié l'anon key (pas la service_role key)
- Vérifiez que le fichier `.env.local` est à la racine du projet

### Erreur "Row Level Security"
- Assurez-vous d'avoir exécuté tout le script `supabase-schema.sql`
- Vérifiez que les policies sont bien créées dans chaque table

### Les données ne s'affichent pas
- Vérifiez que vous êtes bien connecté (regardez la console du navigateur)
- Vérifiez que `user_id` est bien renseigné dans les données

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

---

✨ **Votre application est maintenant prête à être utilisée avec Supabase !**
