import React from 'react';
import { motion } from 'framer-motion';

const LoaderPremium = ({ fullScreen = false }) => {
  const containerClass = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-dark-900/95 backdrop-blur-md"
    : "flex items-center justify-center py-12";

  return (
    <div className={containerClass}>
      <div className="relative">
        {/* Cercles animés */}
        <motion.div
          className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />

        {/* Logo OPTIMA au centre */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-2xl font-display font-bold text-gradient-primary">
            O
          </span>
        </motion.div>

        {/* Effet de glow pulsant */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {fullScreen && (
        <motion.p
          className="absolute bottom-20 text-white/60 text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Chargement...
        </motion.p>
      )}
    </div>
  );
};

export default LoaderPremium;
