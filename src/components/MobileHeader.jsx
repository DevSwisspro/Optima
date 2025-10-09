import React from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

export default function MobileHeader({ onSettingsClick }) {
  return (
    <motion.header
      className="md:hidden fixed top-0 left-0 right-0 z-40"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.1
      }}
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 0.5rem)',
        background: 'transparent'
      }}
    >
      <div className="relative flex items-center justify-center px-4 py-3">
        {/* Titre OPTIMA centré avec rouge signature */}
        <motion.h1
          className="text-[20px] font-bold tracking-[1px] uppercase relative"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: 0.25,
            ease: 'easeOut'
          }}
          style={{
            background: 'linear-gradient(180deg, #FF4D4D 0%, #E53935 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 8px rgba(255, 59, 48, 0.6)',
            filter: 'drop-shadow(0 0 8px rgba(255, 59, 48, 0.6))'
          }}
        >
          OPTIMA
        </motion.h1>

        {/* Bouton Paramètres à droite */}
        <motion.button
          onClick={onSettingsClick}
          className="absolute right-4 p-2.5 rounded-xl hover:bg-white/10 active:bg-white/15 transition-all duration-200"
          whileTap={{ scale: 0.92 }}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.3,
            delay: 0.35,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          <Settings className="w-5 h-5 text-gray-300" strokeWidth={2.2} />
        </motion.button>
      </div>
    </motion.header>
  );
}
