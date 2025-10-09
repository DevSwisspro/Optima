import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import SettingsPanel from './SettingsPanel';

export default function Header({ session, onLogout }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <motion.div
        className="hidden md:flex items-center justify-end px-6 py-4 glass-strong sticky top-0 z-30 border-b border-white/5"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {/* Bouton Paramètres */}
        <motion.button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2.5 rounded-xl text-primary hover:text-red-400 hover:bg-white/5 transition-all duration-200"
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <Settings className="w-6 h-6" />
        </motion.button>

        {/* Effet de brillance */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 5,
            ease: "easeInOut",
          }}
          style={{ pointerEvents: "none" }}
        />
      </motion.div>

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
