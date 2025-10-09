import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Lock,
  LogOut,
  Bell,
  HelpCircle,
  Info,
  Mail,
  Camera,
  ChevronRight,
  Shield,
  Settings
} from 'lucide-react';

export default function SettingsPanel({ isOpen, onClose, user, onLogout }) {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // Bloquer le scroll du body quand le panneau est ouvert
  useEffect(() => {
    if (isOpen) {
      // Sauvegarder la position de scroll actuelle
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll'; // Garder la scrollbar pour éviter le jump
    } else {
      // Restaurer le scroll
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      // Cleanup au démontage
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
    };
  }, [isOpen]);

  // Backdrop animation
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  // Panel animation (slide from right on desktop, bottom on mobile)
  const panelVariants = {
    hidden: {
      x: '100%',
      opacity: 0
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  const panelVariantsMobile = {
    hidden: {
      y: '100%',
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      y: '100%',
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  const MenuItem = ({ icon: Icon, label, onClick, variant = 'default', badge = null }) => {
    const variantClasses = {
      default: 'hover:bg-white/5 text-white',
      danger: 'hover:bg-red-500/10 text-red-400 hover:text-red-300'
    };

    return (
      <motion.button
        onClick={onClick}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${variantClasses[variant]} group`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${variant === 'danger' ? 'bg-red-500/20' : 'bg-white/10'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="px-2 py-1 text-xs rounded-full bg-red-500 text-white">
              {badge}
            </span>
          )}
          <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
      </motion.button>
    );
  };

  const SectionTitle = ({ children }) => (
    <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3 px-2">
      {children}
    </h3>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop avec blur */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Panel Desktop */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="hidden md:flex fixed right-0 top-0 bottom-0 w-full max-w-md bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-[101] flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Paramètres</h2>
                  <p className="text-sm text-gray-400">Gérez votre compte</p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </motion.button>
            </div>

            {/* Content avec scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Profil utilisateur */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-colors">
                      <Camera className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">
                      {user?.email?.split('@')[0] || 'Utilisateur'}
                    </h3>
                    <p className="text-sm text-gray-400 truncate flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {user?.email || 'email@example.com'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Section Profil */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SectionTitle>Mon profil</SectionTitle>
                <div className="space-y-2">
                  <MenuItem
                    icon={User}
                    label="Modifier mon profil"
                    onClick={() => setShowProfileEdit(true)}
                  />
                  <MenuItem
                    icon={Mail}
                    label="Changer l'email"
                    onClick={() => alert('Fonctionnalité à venir')}
                  />
                </div>
              </motion.div>

              {/* Section Compte & Sécurité */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SectionTitle>Compte & Sécurité</SectionTitle>
                <div className="space-y-2">
                  <MenuItem
                    icon={Lock}
                    label="Changer le mot de passe"
                    onClick={() => setShowPasswordChange(true)}
                  />
                  <MenuItem
                    icon={Shield}
                    label="Sécurité du compte"
                    onClick={() => alert('Fonctionnalité à venir')}
                  />
                </div>
              </motion.div>

              {/* Section Préférences */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <SectionTitle>Préférences</SectionTitle>
                <div className="space-y-2">
                  <MenuItem
                    icon={Bell}
                    label="Notifications"
                    onClick={() => alert('Fonctionnalité à venir')}
                    badge="Bientôt"
                  />
                  <MenuItem
                    icon={Sparkles}
                    label="Animations"
                    onClick={() => alert('Fonctionnalité à venir')}
                  />
                </div>
              </motion.div>

              {/* Section Support */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <SectionTitle>Support & Aide</SectionTitle>
                <div className="space-y-2">
                  <MenuItem
                    icon={HelpCircle}
                    label="Centre d'aide"
                    onClick={() => alert('Centre d\'aide - Fonctionnalité à venir')}
                  />
                  <MenuItem
                    icon={Info}
                    label="À propos d'Optima"
                    onClick={() => alert('Optima v2.0 - Premium Productivity App')}
                  />
                </div>
              </motion.div>

              {/* Déconnexion */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <MenuItem
                  icon={LogOut}
                  label="Se déconnecter"
                  onClick={onLogout}
                  variant="danger"
                />
              </motion.div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 pt-4 pb-2">
                Optima Premium v2.0
                <br />
                © 2025 DevSwissPro
              </div>
            </div>
          </motion.div>

          {/* Panel Mobile (from bottom) */}
          <motion.div
            variants={panelVariantsMobile}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden fixed inset-x-0 bottom-0 top-20 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-t-3xl border-t border-white/10 shadow-2xl z-[101] flex flex-col"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Paramètres</h2>
                  <p className="text-xs text-gray-400">Gérez votre compte</p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5 text-gray-400" />
              </motion.button>
            </div>

            {/* Content avec scroll - Version mobile condensée */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Profil utilisateur mobile */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-lg font-bold">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">
                      {user?.email?.split('@')[0] || 'Utilisateur'}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">
                      {user?.email || 'email@example.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sections mobiles (plus compactes) */}
              <div className="space-y-2">
                <MenuItem icon={User} label="Modifier mon profil" onClick={() => setShowProfileEdit(true)} />
                <MenuItem icon={Lock} label="Changer le mot de passe" onClick={() => setShowPasswordChange(true)} />
                <MenuItem icon={Bell} label="Notifications" onClick={() => alert('Bientôt disponible')} badge="Bientôt" />
                <MenuItem icon={HelpCircle} label="Centre d'aide" onClick={() => alert('Centre d\'aide')} />
                <MenuItem icon={Info} label="À propos" onClick={() => alert('Optima v2.0')} />
              </div>

              {/* Déconnexion mobile */}
              <MenuItem icon={LogOut} label="Se déconnecter" onClick={onLogout} variant="danger" />

              <div className="text-center text-xs text-gray-500 py-4">
                Optima Premium v2.0
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
