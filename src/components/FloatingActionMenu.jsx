import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  FileText,
  Wallet,
  Play,
  ShoppingCart,
  X
} from 'lucide-react';

export default function FloatingActionMenu({ isOpen, onClose, onAction }) {
  // Bloquer le scroll quand le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const actions = [
    {
      id: 'tasks',
      label: 'Tâches',
      icon: CheckSquare,
      color: 'from-blue-500 to-blue-600',
      action: () => onAction('tasks')
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      action: () => onAction('notes')
    },
    {
      id: 'shopping',
      label: 'Courses',
      icon: ShoppingCart,
      color: 'from-orange-500 to-orange-600',
      action: () => onAction('shopping')
    },
    {
      id: 'budget',
      label: 'Budget',
      icon: Wallet,
      color: 'from-green-500 to-green-600',
      action: () => onAction('budget')
    },
    {
      id: 'media',
      label: 'Médias',
      icon: Play,
      color: 'from-red-500 to-red-600',
      action: () => onAction('media')
    }
  ];

  const backdropVariants = {
    hidden: { opacity: 0, backdropFilter: 'blur(0px)' },
    visible: {
      opacity: 1,
      backdropFilter: 'blur(12px)',
      transition: {
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: {
      opacity: 0,
      backdropFilter: 'blur(0px)',
      transition: {
        duration: 0.2
      }
    }
  };

  const menuContainerVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.04,
        delayChildren: 0.08
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const actionItemVariants = {
    hidden: { opacity: 0, scale: 0.4, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 600,
        damping: 28,
        mass: 0.8
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop avec blur iOS-style */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
            style={{ touchAction: 'none' }}
          />

          {/* Menu déroulant depuis le haut */}
          <motion.div
            variants={menuContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-20 right-4 z-[201] w-[90%] max-w-sm"
          >
            {/* Carte principale avec effet verre */}
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-white/20 overflow-hidden">
              {/* Header élégant */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-red-500/10 to-transparent">
                <h3 className="text-base font-semibold text-white">Navigation</h3>
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </motion.button>
              </div>

              {/* Grille de navigation en 2 colonnes */}
              <div className="grid grid-cols-2 gap-3 p-4">
                {actions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      variants={actionItemVariants}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        action.action();
                        onClose();
                      }}
                      className="relative flex flex-col items-center gap-3 p-5 rounded-xl bg-white/5 active:bg-white/[0.08] border border-white/10 transition-all duration-200 group overflow-hidden min-h-[110px]"
                    >
                      {/* Gradient background on active */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-active:opacity-15 transition-opacity duration-150`} />

                      {/* Icon container */}
                      <motion.div
                        className={`relative p-3 bg-gradient-to-br ${action.color} rounded-xl shadow-lg`}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.06,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                      >
                        <Icon className="w-6 h-6 text-white" strokeWidth={2.2} />
                      </motion.div>

                      {/* Label */}
                      <span className="relative text-sm font-semibold text-white text-center leading-tight">
                        {action.label}
                      </span>

                      {/* Subtle shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 6,
                          ease: 'easeInOut'
                        }}
                        style={{ pointerEvents: 'none' }}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
