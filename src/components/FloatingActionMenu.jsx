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
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.05
      }
    }
  };

  const menuContainerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 350,
        damping: 28,
        mass: 0.7,
        staggerChildren: 0.06,
        delayChildren: 0.12
      }
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.96,
      transition: {
        duration: 0.22,
        ease: [0.32, 0.72, 0, 1]
      }
    }
  };

  const actionItemVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 0.6
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop premium avec blur progressif */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 backdrop-blur-xl z-[200]"
            style={{ touchAction: 'none' }}
          />

          {/* Conteneur centré avec safe-area pour mobile */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pb-24 pointer-events-none">
            <motion.div
              variants={menuContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-md pointer-events-auto"
            >
              {/* Carte principale avec effet verre premium */}
              <div className="relative bg-gradient-to-br from-slate-900/98 via-slate-800/95 to-slate-900/98 backdrop-blur-2xl rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)] border border-white/[0.08] overflow-hidden">
                {/* Glow subtil derrière la carte */}
                <div className="absolute -inset-[1px] bg-gradient-to-br from-red-500/10 via-transparent to-purple-500/5 rounded-3xl -z-10 blur-xl" />

                {/* Header premium avec dégradé subtil */}
                <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/8 via-transparent to-transparent" />

                  <h3 className="relative text-lg font-bold text-white tracking-tight">Navigation</h3>
                  <motion.button
                    onClick={onClose}
                    whileTap={{ scale: 0.9 }}
                    className="relative p-2 rounded-xl hover:bg-white/10 active:bg-white/15 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-300" strokeWidth={2} />
                  </motion.button>
                </div>

                {/* Grille de navigation premium - responsive et évolutive */}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 p-5 max-h-[60vh] overflow-y-auto floating-menu-scroll">
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
                        className="group relative flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] active:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.12] transition-all duration-300 overflow-hidden min-h-[110px]"
                      >
                        {/* Gradient background subtil */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-[0.06] group-active:opacity-10 transition-opacity duration-300`} />

                        {/* Icon container avec design premium */}
                        <motion.div
                          className={`relative p-3 bg-gradient-to-br ${action.color} rounded-xl shadow-xl shadow-black/20`}
                          initial={{ scale: 1 }}
                          whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                          transition={{
                            scale: { type: 'spring', stiffness: 400, damping: 15 },
                            rotate: { duration: 0.4, ease: 'easeInOut' }
                          }}
                        >
                          <Icon className="w-6 h-6 text-white drop-shadow-lg" strokeWidth={2.2} />
                        </motion.div>

                        {/* Label avec typographie premium */}
                        <span className="relative text-sm font-bold text-white text-center leading-tight tracking-wide">
                          {action.label}
                        </span>

                        {/* Shimmer effect premium */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
                          initial={{ x: '-100%' }}
                          animate={{ x: '200%' }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatDelay: 5,
                            ease: 'easeInOut'
                          }}
                          style={{ pointerEvents: 'none' }}
                        />

                        {/* Border glow on hover */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                          background: `linear-gradient(135deg, ${action.color.replace('from-', 'rgba(').replace(' to-', ', 0.2), rgba(')})`,
                          filter: 'blur(8px)',
                          zIndex: -1
                        }} />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
