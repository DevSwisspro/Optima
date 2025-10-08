import React from 'react';
import { motion } from 'framer-motion';
import LogoDevSwiss from './LogoDevSwiss';

export default function Header() {
  return (
    <motion.div
      className="flex items-center justify-between px-6 py-4 glass-strong sticky top-0 z-30 border-b border-white/5"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2
          }}
        >
          <LogoDevSwiss className="text-white drop-shadow-lg" />
        </motion.div>

        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col"
        >
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gradient-primary leading-none">
            OPTIMA
          </h1>
          <p className="text-xs text-white/50 font-medium mt-0.5 hidden sm:block">
            Productivité Premium
          </p>
        </motion.div>
      </div>

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
  );
}
