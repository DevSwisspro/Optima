# Todo Coach App

Une application de gestion budgétaire et de tâches complète, développée avec React et Vite.

## 🚀 Fonctionnalités

- **Dashboard interactif** avec graphiques et statistiques
- **Gestion de budget** avec catégories personnalisées
- **Suivi des revenus et dépenses** avec comparaisons périodiques
- **Objectifs d'épargne et d'investissement** avec barres de progression
- **Interface responsive** optimisée mobile et desktop
- **Formatage intelligent** des montants avec séparateurs de milliers

## 🛠️ Technologies

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS 3.3
- **Animations**: Framer Motion
- **Graphiques**: Recharts
- **Icons**: Lucide React
- **Components**: Radix UI
- **Base de données**: Supabase

## 📱 Installation

### Prérequis
- Node.js 18+
- npm ou yarn

### Configuration locale
```bash
# Cloner le repository
git clone <repository-url>
cd todo-coach-app

# Installer les dépendances
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env

# Lancer le serveur de développement
npm run dev
```

### Variables d'environnement
Configurez votre fichier `.env` avec vos clés Supabase :
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 Build et déploiement

### Build local
```bash
# Créer la build de production
npm run build

# Prévisualiser la build
npm run preview
```

### Déploiement
L'application est configurée pour être déployée sur Netlify avec intégration continue GitHub.

## 📊 Architecture

### Structure des composants
- **App.jsx** - Composant principal avec routing
- **components/** - Composants réutilisables
- **lib/utils.js** - Fonctions utilitaires (formatage, etc.)

### Gestion des données
- **localStorage** - Stockage local temporaire
- **Supabase** - Base de données persistante
- **Context/State** - Gestion d'état React

## 🎨 Fonctionnalités UI/UX

- **Design moderne** avec dégradés et animations
- **Cartes interactives** avec effets hover
- **Formatage intelligent** des montants (8 500 CHF)
- **Alignement parfait** des données numériques
- **Interface responsive** adaptative

## 🔒 Sécurité

- **Repository privé** GitHub
- **Variables d'environnement** sécurisées
- **Clés API** non exposées côté client
- **HTTPS** forcé en production

## 🆘 Support

Pour toute question ou problème, consultez les issues GitHub ou contactez l'équipe de développement.

---

**Version**: 1.0.0  
**Dernière mise à jour**: $(date)  
**Statut**: En production