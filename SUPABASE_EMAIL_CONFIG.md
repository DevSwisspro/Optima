# 📧 Configuration des Emails Supabase pour Optima

## ✅ Ce qui a été implémenté

Le système d'authentification avec validation par code à 6 chiffres est **déjà intégré** dans le code :

- ✅ Formulaire d'inscription moderne avec validation
- ✅ Écran de saisie du code à 6 chiffres
- ✅ Focus automatique entre les champs
- ✅ Fonction de renvoi du code
- ✅ Gestion des erreurs

## 🔧 Configuration requise dans Supabase

### Étape 1 : Activer l'authentification par email

1. Allez dans votre projet Supabase : https://app.supabase.com
2. Menu **Authentication** → **Providers**
3. Assurez-vous que **Email** est activé ✅

### Étape 2 : Configurer l'envoi d'emails OTP (Code à 6 chiffres)

1. Menu **Authentication** → **Email Templates**
2. Sélectionnez **"Magic Link"** ou **"Confirm Signup"**
3. **IMPORTANT** : Modifiez le template pour utiliser un code à 6 chiffres au lieu d'un lien

#### Template Email recommandé :

```html
<h2>Bienvenue sur Optima !</h2>
<p>Votre code de vérification est :</p>
<h1 style="font-size: 48px; letter-spacing: 8px; text-align: center; color: #dc2626;">
  {{ .Token }}
</h1>
<p>Ce code expire dans 60 minutes.</p>
<p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
<br>
<p style="color: #666; font-size: 12px;">© 2025 Optima. Tous droits réservés.</p>
```

### Étape 3 : Configuration OTP dans Supabase

Par défaut, Supabase utilise des **Magic Links**. Pour utiliser des codes OTP à 6 chiffres :

1. Menu **Authentication** → **Settings**
2. Section **Email Auth**
3. Activez **"Enable email confirmations"** ✅
4. **OTP Expiry** : 3600 secondes (1 heure) recommandé
5. **OTP Length** : 6 (par défaut)

### Étape 4 : Désactiver les confirmations automatiques (si nécessaire)

1. Menu **Authentication** → **Settings**
2. Section **Email Auth**
3. Si vous voulez forcer la validation par code :
   - Désactivez **"Enable auto-confirming users"**
   - Cela force l'utilisateur à valider son email avant de pouvoir se connecter

## 🎨 Configuration des templates d'email (Optionnel)

Pour personnaliser l'apparence des emails :

1. Menu **Authentication** → **Email Templates**
2. Vous pouvez personnaliser :
   - **Confirm signup** : Email de confirmation d'inscription
   - **Invite user** : Email d'invitation
   - **Magic Link** : Email de lien magique
   - **Change Email Address** : Email de changement d'adresse
   - **Reset Password** : Email de réinitialisation

### Variables disponibles dans les templates :

- `{{ .Token }}` : Le code OTP à 6 chiffres
- `{{ .TokenHash }}` : Hash du token (pour les liens)
- `{{ .SiteURL }}` : URL de votre site
- `{{ .ConfirmationURL }}` : URL de confirmation complète
- `{{ .Email }}` : Email de l'utilisateur

## 📧 Configuration SMTP (Production recommandée)

Pour la production, configurez un service SMTP professionnel :

### Option 1 : Utiliser un service tiers (Recommandé)

1. Menu **Project Settings** → **Authentication**
2. Section **SMTP Settings**
3. Configurez votre service SMTP :
   - **SendGrid** (gratuit jusqu'à 100 emails/jour)
   - **Mailgun** (gratuit jusqu'à 5000 emails/mois)
   - **AWS SES** (très bon rapport qualité/prix)
   - **Resend** (moderne et simple)

### Exemple de configuration SMTP (SendGrid) :

```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [Votre clé API SendGrid]
Sender email: noreply@votre-domaine.com
Sender name: Optima
```

### Option 2 : Utiliser l'email Supabase par défaut

Supabase fournit un service d'email par défaut **limité à 4 emails/heure**. C'est suffisant pour le développement mais **pas pour la production**.

## 🔒 Sécurité des URLs de redirection

1. Menu **Authentication** → **URL Configuration**
2. Ajoutez vos URLs autorisées :

```
http://localhost:5173
http://localhost:3000
https://votre-domaine.com
https://votre-site.netlify.app
```

## 🧪 Tester l'envoi d'emails

### Test en local :

1. Lancez l'application : `npm run dev`
2. Allez sur http://localhost:5173
3. Cliquez sur "Créer un compte"
4. Remplissez le formulaire
5. Vérifiez votre boîte email
6. Entrez le code à 6 chiffres reçu

### Vérifier dans Supabase :

1. Menu **Authentication** → **Users**
2. Vous devriez voir le nouvel utilisateur
3. Statut : "Waiting for email confirmation" jusqu'à validation du code

## 🐛 Dépannage

### Problème : Je ne reçois pas d'email

**Solutions :**
1. Vérifiez vos spams/courrier indésirable
2. Attendez 2-3 minutes (parfois les emails sont retardés)
3. Vérifiez que l'email est activé dans **Authentication** → **Providers**
4. Vérifiez les logs dans **Logs** → **Auth Logs**

### Problème : "Invalid OTP"

**Solutions :**
1. Vérifiez que le code n'a pas expiré (60 minutes par défaut)
2. Assurez-vous de ne pas avoir d'espaces dans le code
3. Le code est sensible à la casse ? Non, les codes OTP sont en chiffres uniquement

### Problème : Rate limit atteint

Supabase limite l'envoi d'emails à **4 emails/heure** en mode gratuit. Pour la production, configurez un SMTP externe.

## 📚 Documentation officielle

- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [OTP Authentication](https://supabase.com/docs/guides/auth/phone-login#using-otp)

## ✨ Fonctionnalités supplémentaires possibles

- [ ] Ajouter une authentification Google/GitHub
- [ ] Implémenter une authentification par SMS
- [ ] Ajouter un système de sessions remember me
- [ ] Implémenter une authentification à deux facteurs (2FA)

---

**Note** : Une fois la configuration terminée dans Supabase, l'application fonctionnera automatiquement ! Le code est déjà prêt. 🚀
