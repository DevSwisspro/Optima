import React from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

export default function MobileHeader({ onSettingsClick }) {
  return (
    <motion.header
      className="md:hidden fixed top-0 left-0 right-0 z-40 glass-strong border-b border-white/5"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: 0.1
      }}
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 0.5rem)'
      }}
    >
      <div className="relative flex items-center justify-center px-4 py-3">
        {/* Titre OPTIMA centré */}
        <motion.h1
          className="text-[19px] font-semibold tracking-wide text-white relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1]
          }}
          style={{
            textShadow: '0 0 20px rgba(255, 255, 255, 0.2), 0 0 40px rgba(229, 57, 53, 0.15)'
          }}
        >
          OPTIMA

          {/* Subtle glow effect */}
          <motion.span
            className="absolute inset-0 blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(229, 57, 53, 0.2))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            OPTIMA
          </motion.span>
        </motion.h1>

        {/* Bouton Paramètres à droite */}
        <motion.button
          onClick={onSettingsClick}
          className="absolute right-4 p-2 rounded-xl hover:bg-white/10 active:bg-white/15 transition-colors"
          whileTap={{ scale: 0.92 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
            delay: 0.4
          }}
        >
          <Settings className="w-5 h-5 text-gray-300" strokeWidth={2} />
        </motion.button>
      </div>

      {/* Shimmer effect subtil */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 5,
          ease: 'easeInOut'
        }}
      />
    </motion.header>
  );
}
