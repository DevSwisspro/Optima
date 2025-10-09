import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  ShoppingCart,
  Wallet,
  Play,
  Settings,
  Plus
} from 'lucide-react';
import SettingsPanel from './SettingsPanel';
import FloatingActionMenu from './FloatingActionMenu';

export default function Sidebar({ activeTab, setActiveTab, session, onLogout }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tâches', icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'shopping', label: 'Courses', icon: ShoppingCart },
    { id: 'budget', label: 'Budget', icon: Wallet },
    { id: 'media', label: 'Médias', icon: Play }
  ];

  return (
    <>
      {/* Sidebar Desktop */}
      <motion.aside
        className="hidden md:flex fixed top-0 left-0 h-full z-40 bg-slate-900/70 backdrop-blur-md shadow-lg shadow-red-500/10 border-r border-white/5 flex-col transition-all duration-300 ease-out"
        style={{ width: isExpanded ? '16rem' : '5rem' }}
        initial={{ x: -100, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1
        }}
        transition={{
          x: { type: 'spring', stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 }
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* En-tête - Titre OPTIMA (visible uniquement quand menu ouvert) */}
        <div className="flex flex-col items-center justify-center pt-6 pb-4 px-2 border-b border-white/10 min-h-[5rem]">
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.h1
                className="text-2xl font-display font-bold text-gradient-primary leading-none whitespace-nowrap tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
              >
                OPTIMA
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation principale */}
        <nav className="flex-1 flex flex-col items-start w-full py-4 px-2 gap-2 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative w-full flex items-center gap-4 px-3 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                    : 'text-gray-300 hover:text-red-400 hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.05, x: 4 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                {/* Glow effect pour l'item actif */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-red-500/20"
                    layoutId="activeMenuItem"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icône */}
                <Icon className={`w-6 h-6 flex-shrink-0 relative z-10 ${isActive ? 'text-white' : ''}`} />

                {/* Label avec animation */}
                {isExpanded && (
                  <motion.span
                    className="text-sm whitespace-nowrap relative z-10 overflow-hidden"
                    initial={{ opacity: 0, maxWidth: 0 }}
                    animate={{ opacity: 1, maxWidth: 200 }}
                    exit={{ opacity: 0, maxWidth: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {item.label}
                  </motion.span>
                )}

                {/* Indicator actif à droite (mode compact) */}
                {isActive && !isExpanded && (
                  <motion.div
                    className="absolute right-0 w-1 h-8 bg-red-500 rounded-l-full"
                    layoutId="activeIndicator"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer - Paramètres + Signature */}
        <div className="border-t border-white/10 py-4 px-2">
          {/* Bouton Paramètres */}
          <motion.button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl font-medium transition-all duration-300 text-gray-300 hover:text-red-400 hover:bg-white/5 mb-3"
            whileHover={{ scale: 1.05, x: 4 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-6 h-6 flex-shrink-0" />

            {isExpanded && (
              <motion.span
                className="text-sm whitespace-nowrap overflow-hidden"
                initial={{ opacity: 0, maxWidth: 0 }}
                animate={{ opacity: 1, maxWidth: 200 }}
                exit={{ opacity: 0, maxWidth: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                Paramètres
              </motion.span>
            )}
          </motion.button>

          {/* Signature Dev-Swiss (visible quand expanded) */}
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.div
                className="px-3 py-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <div className="flex flex-col items-center text-center">
                  <p className="text-xs font-semibold text-white/70">Dev-Swiss</p>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    Solutions web & apps
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1">
                    v2.0 Premium
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Version compacte (mode réduit) */}
          {!isExpanded && (
            <motion.div
              className="flex justify-center mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-[10px] text-gray-600">v2.0</p>
            </motion.div>
          )}
        </div>
      </motion.aside>

      {/* Navigation Mobile (bottom bar intelligent) */}
      <motion.nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-white/10 safe-area-bottom"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
      >
        <div className="relative flex items-center justify-around max-w-lg mx-auto px-2 py-2 pb-safe">
          {/* Dashboard */}
          <motion.button
            onClick={() => setActiveTab('dashboard')}
            className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-2.5 rounded-xl transition-all duration-200 min-w-[70px] min-h-[56px] ${
              activeTab === 'dashboard' ? 'active:bg-primary/5' : 'active:bg-white/5'
            }`}
            whileTap={{ scale: 0.92 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            {activeTab === 'dashboard' && (
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-xl shadow-glow-primary"
                layoutId="activeMobileTab"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <LayoutDashboard
              className={`w-6 h-6 relative z-10 transition-colors ${
                activeTab === 'dashboard' ? 'text-primary drop-shadow-glow' : 'text-gray-400'
              }`}
            />
            <span
              className={`text-[10px] font-semibold relative z-10 transition-colors leading-tight ${
                activeTab === 'dashboard' ? 'text-white' : 'text-gray-500'
              }`}
            >
              Dashboard
            </span>
            {activeTab === 'dashboard' && (
              <motion.div
                className="absolute -top-1 w-1 h-1 bg-primary rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              />
            )}
          </motion.button>

          {/* Budget */}
          <motion.button
            onClick={() => setActiveTab('budget')}
            className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-2.5 rounded-xl transition-all duration-200 min-w-[70px] min-h-[56px] ${
              activeTab === 'budget' ? 'active:bg-primary/5' : 'active:bg-white/5'
            }`}
            whileTap={{ scale: 0.92 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {activeTab === 'budget' && (
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-xl shadow-glow-primary"
                layoutId="activeMobileTab"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Wallet
              className={`w-6 h-6 relative z-10 transition-colors ${
                activeTab === 'budget' ? 'text-primary drop-shadow-glow' : 'text-gray-400'
              }`}
            />
            <span
              className={`text-[10px] font-semibold relative z-10 transition-colors leading-tight ${
                activeTab === 'budget' ? 'text-white' : 'text-gray-500'
              }`}
            >
              Budget
            </span>
            {activeTab === 'budget' && (
              <motion.div
                className="absolute -top-1 w-1 h-1 bg-primary rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              />
            )}
          </motion.button>

          {/* Bouton central flottant (+) */}
          <motion.button
            onClick={() => setIsActionMenuOpen(true)}
            className="relative flex items-center justify-center w-16 h-16 -mt-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-2xl shadow-red-500/40"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.15 }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-red-400 blur-xl opacity-50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.7, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <Plus className="w-7 h-7 text-white relative z-10" strokeWidth={2.5} />
          </motion.button>

          {/* Médias */}
          <motion.button
            onClick={() => setActiveTab('media')}
            className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-2.5 rounded-xl transition-all duration-200 min-w-[70px] min-h-[56px] ${
              activeTab === 'media' ? 'active:bg-primary/5' : 'active:bg-white/5'
            }`}
            whileTap={{ scale: 0.92 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {activeTab === 'media' && (
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-xl shadow-glow-primary"
                layoutId="activeMobileTab"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Play
              className={`w-6 h-6 relative z-10 transition-colors ${
                activeTab === 'media' ? 'text-primary drop-shadow-glow' : 'text-gray-400'
              }`}
            />
            <span
              className={`text-[10px] font-semibold relative z-10 transition-colors leading-tight ${
                activeTab === 'media' ? 'text-white' : 'text-gray-500'
              }`}
            >
              Médias
            </span>
            {activeTab === 'media' && (
              <motion.div
                className="absolute -top-1 w-1 h-1 bg-primary rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              />
            )}
          </motion.button>

          {/* Paramètres */}
          <motion.button
            onClick={() => setIsSettingsOpen(true)}
            className="relative flex flex-col items-center justify-center gap-0.5 px-3 py-2.5 rounded-xl transition-all duration-200 min-w-[70px] min-h-[56px] active:bg-white/5"
            whileTap={{ scale: 0.92 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Settings className="w-6 h-6 text-gray-400 relative z-10" />
            <span className="text-[10px] font-semibold text-gray-500 leading-tight relative z-10">
              Réglages
            </span>
          </motion.button>
        </div>
      </motion.nav>

      {/* Menu flottant d'actions */}
      <FloatingActionMenu
        isOpen={isActionMenuOpen}
        onClose={() => setIsActionMenuOpen(false)}
        onAction={(section) => {
          setActiveTab(section);
          setIsActionMenuOpen(false);
        }}
      />

      {/* Panneau de paramètres */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={session?.user}
        onLogout={() => {
          setIsSettingsOpen(false);
          onLogout();
        }}
      />
    </>
  );
}
