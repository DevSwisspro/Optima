import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import SettingsPanel from './SettingsPanel';

const FloatingMenu = ({ onLogout, user }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);

  return (
    <>
      {/* Bouton engrenage flottant */}
      <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50">
        <motion.button
          className="relative w-16 h-16 rounded-full gradient-primary shadow-glow-primary flex items-center justify-center"
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSettings}
          animate={{ rotate: isSettingsOpen ? 135 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <motion.div
            initial={false}
            animate={{ rotate: isSettingsOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isSettingsOpen ? (
              <X className="w-7 h-7 text-white" />
            ) : (
              <Settings className="w-7 h-7 text-white" />
            )}
          </motion.div>

          {/* Pulse effect quand fermé */}
          {!isSettingsOpen && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}
        </motion.button>

        {/* Badge notification (optionnel) */}
        {!isSettingsOpen && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 bg-accent-orange rounded-full border-2 border-dark-900 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <span className="text-white text-xs font-bold">•</span>
          </motion.div>
        )}
      </div>

      {/* Panneau de paramètres */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onLogout={() => {
          setIsSettingsOpen(false);
          onLogout();
        }}
      />
    </>
  );
};

export default FloatingMenu;
