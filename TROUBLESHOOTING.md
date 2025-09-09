# 🔧 Guide de Dépannage OPTIMA

## ❌ Erreur "Failed to fetch" lors de la création de compte

### 🕵️ **Problème principal : Mode Incognito/Privé**

Le mode navigation privée bloque souvent les requêtes vers les services d'authentification.

#### ✅ **Solutions rapides :**

1. **Basculer en mode normal :**
   - Fermez la fenêtre incognito/privée
   - Ouvrez https://optima.dev-swiss.ch en mode normal
   - Créez votre compte

2. **Dans Brave spécifiquement :**
   - Paramètres → Boucliers → Désactiver temporairement
   - OU Settings → Privacy and security → Allow third-party cookies

3. **Autoriser les cookies tiers :**
   - Chrome : Settings → Privacy → Third-party cookies → Allow
   - Firefox : Settings → Privacy → Custom → Accept cookies
   - Brave : Settings → Privacy → Cookies → Allow all cookies

---

## 🛠️ **Diagnostic automatique**

### **Outil de diagnostic :**
Accédez à : https://optima.dev-swiss.ch/debug-auth.html

Cet outil testera automatiquement :
- ✅ Connexion Supabase
- ✅ Configuration réseau
- ✅ Mode incognito
- ✅ Compatibilité navigateur

---

## 🌐 **Problèmes par navigateur**

### **Brave Browser :**
```
❌ Problème : Bloqueurs trop agressifs
✅ Solution : Désactiver Shields pour optima.dev-swiss.ch
📍 Menu → Brave Shields → Shields down for this site
```

### **Safari (iOS/Mac) :**
```
❌ Problème : Prévention du tracking
✅ Solution : Désactiver "Prevent cross-site tracking"
📍 Settings → Privacy → Prevent Cross-Site Tracking → OFF
```

### **Firefox :**
```
❌ Problème : Protection renforcée
✅ Solution : Mode standard pour optima.dev-swiss.ch
📍 Shield icon → Turn off Enhanced Tracking Protection
```

---

## 📱 **Problèmes mobiles**

### **Android :**
- Essayez Chrome au lieu du navigateur par défaut
- Autorisez les cookies dans les paramètres
- Désactivez le mode économie de données

### **iPhone/iPad :**
- Utilisez Safari (meilleur support PWA)
- Autorisez les cookies dans Réglages → Safari
- Désactivez le mode "Navigation privée"

---

## 🔍 **Messages d'erreur courants**

### `"Failed to fetch"`
**Cause :** Mode incognito ou bloqueur de contenu  
**Solution :** Mode navigation normale + autoriser cookies

### `"NetworkError"`
**Cause :** Bloqueur de publicité ou pare-feu  
**Solution :** Whitelist optima.dev-swiss.ch

### `"CORS error"`
**Cause :** Configuration navigateur restrictive  
**Solution :** Réinitialiser paramètres de confidentialité

### `"Invalid login credentials"`
**Cause :** Email/mot de passe incorrect  
**Solution :** Vérifier saisie ou créer nouveau compte

### `"Email not confirmed"`
**Cause :** Email non vérifié  
**Solution :** Cliquer sur lien dans email de confirmation

---

## ⚡ **Solutions express**

### **Si rien ne fonctionne :**

1. **Reset complet navigateur :**
   ```
   1. Effacer cache et cookies
   2. Désactiver extensions
   3. Réinitialiser paramètres par défaut
   4. Redémarrer navigateur
   ```

2. **Test avec autre navigateur :**
   - Chrome (recommandé)
   - Edge
   - Firefox
   - Safari (iOS/Mac)

3. **Test réseau :**
   - Désactiver VPN temporairement
   - Essayer autre connexion (4G/WiFi)
   - Tester sur autre appareil

---

## 📞 **Support technique**

### **Auto-diagnostic :**
1. Ouvrir https://optima.dev-swiss.ch/debug-auth.html
2. Cliquer "Test Inscription"
3. Noter les erreurs affichées

### **Console navigateur :**
1. F12 → Console
2. Essayer de créer compte
3. Copier messages d'erreur en rouge

---

## ✅ **Configuration optimale**

### **Navigateur recommandé :**
- **Chrome** ou **Edge** (meilleur support PWA)
- Mode navigation normale (pas incognito)
- Cookies autorisés
- Aucun bloqueur actif pour optima.dev-swiss.ch

### **Paramètres idéaux :**
```
✅ Cookies : Autorisés
✅ JavaScript : Activé
✅ HTTPS : Forcé
✅ Pop-ups : Autorisés pour optima.dev-swiss.ch
✅ Notifications : Autorisées (optionnel)
```

---

## 🎯 **Test rapide**

**Essayez cette séquence :**
1. Fermez tous onglets OPTIMA
2. Ouvrez **Chrome en mode normal**
3. Allez sur https://optima.dev-swiss.ch
4. Si bannière "Mode incognito détecté" → Vous êtes en privé !
5. Créez votre compte

**Si ça ne marche toujours pas :**
- Essayez sur votre téléphone
- Utilisez un autre réseau WiFi
- Contactez le support avec l'erreur exacte

---

*🚀 OPTIMA - Votre coach personnel, toujours accessible !*