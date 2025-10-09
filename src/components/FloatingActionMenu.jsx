import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  FileText,
  Wallet,
  Play,
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
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const menuContainerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 30,
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  const actionItemVariants = {
    hidden: { opacity: 0, scale: 0.3, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 25
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

          {/* Menu flottant centré */}
          <motion.div
            variants={menuContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed left-1/2 bottom-32 -translate-x-1/2 z-[201] w-[90%] max-w-sm"
          >
            {/* Carte principale */}
            <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">Actions rapides</h3>
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </motion.button>
              </div>

              {/* Grid d'actions */}
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
                      className="relative flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 min-h-[120px] group overflow-hidden"
                    >
                      {/* Gradient background on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                      {/* Icon container */}
                      <div className={`relative p-4 bg-gradient-to-br ${action.color} rounded-2xl shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      {/* Label */}
                      <span className="relative text-sm font-semibold text-white text-center leading-tight">
                        {action.label}
                      </span>

                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 3,
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
