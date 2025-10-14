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
      id: 'task',
      label: 'Ajouter une tâche',
      icon: CheckSquare,
      color: 'from-blue-500 to-blue-600',
      action: () => onAction('tasks')
    },
    {
      id: 'note',
      label: 'Ajouter une note',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      action: () => onAction('notes')
    },
    {
      id: 'shopping',
      label: 'Ajouter une course',
      icon: ShoppingCart,
      color: 'from-orange-500 to-orange-600',
      action: () => onAction('shopping')
    },
    {
      id: 'budget',
      label: 'Gérer budget',
      icon: Wallet,
      color: 'from-green-500 to-green-600',
      action: () => onAction('budget')
    },
    {
      id: 'media',
      label: 'Ajouter un média',
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
    hidden: { opacity: 0, x: 350 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      x: 350,
      transition: {
        duration: 0.25,
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

          {/* Menu latéral droit */}
          <motion.div
            variants={menuContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-3 bottom-24 z-[201] w-[85%] max-w-xs"
          >
            {/* Carte principale */}
            <div className="bg-gradient-to-b from-[#1A1A1A] to-[#101010] backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden">
              {/* Header compact */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h3 className="text-base font-semibold text-white">Actions rapides</h3>
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </motion.button>
              </div>

              {/* Liste verticale d'actions */}
              <div className="flex flex-col gap-2 p-3">
                {actions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      variants={actionItemVariants}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        action.action();
                        onClose();
                      }}
                      className="relative flex items-center gap-4 p-4 rounded-xl bg-white/5 active:bg-white/[0.08] border border-white/10 transition-all duration-200 group overflow-hidden"
                    >
                      {/* Gradient background on active */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-active:opacity-15 transition-opacity duration-150`} />

                      {/* Icon container */}
                      <motion.div
                        className={`relative p-3 bg-gradient-to-br ${action.color} rounded-xl shadow-lg flex-shrink-0`}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.08,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                      >
                        <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
                      </motion.div>

                      {/* Label */}
                      <span className="relative text-sm font-semibold text-white leading-tight flex-1 text-left">
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
                          repeatDelay: 5,
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
