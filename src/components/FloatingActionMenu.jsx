import React, { useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  FileText,
  Wallet,
  Play,
  ShoppingCart,
  X
} from 'lucide-react';

const FloatingActionMenu = React.memo(function FloatingActionMenu({ isOpen, onClose, onAction }) {
  // Gérer le bouton retour système (Android/iOS) et touche Échap (desktop)
  useEffect(() => {
    if (!isOpen) return;

    // Ajouter une entrée dans l'historique pour intercepter le retour
    const historyPushed = window.history.state?.menuOpen !== true;

    if (historyPushed) {
      try {
        window.history.pushState({ menuOpen: true }, '');
      } catch (e) {
        console.warn('Could not push history state:', e);
      }
    }

    const handlePopState = (event) => {
      // Seulement fermer si on quitte l'état menuOpen
      if (event.state?.menuOpen !== true) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      // Fermer avec la touche Échap
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);

      // NE PAS faire history.back() ici car ça déclenche popstate
      // L'utilisateur gère lui-même la navigation
    };
  }, [isOpen, onClose]);

  // Bloquer ABSOLUMENT tout le scroll et touch sur le viewport quand le menu est ouvert
  useEffect(() => {
    if (!isOpen) return;

    // Sauvegarder la position actuelle du scroll
    const scrollY = window.scrollY;

    // Ajouter les classes de blocage IMMÉDIATEMENT
    document.body.classList.add('menu-open');
    document.body.style.top = `-${scrollY}px`;

    const root = document.getElementById('root');
    if (root) {
      root.classList.add('menu-open');
    }

    // Bloquer TOUT par défaut sauf interactions menu
    const blockEverything = (e) => {
      // Autoriser les clics/touches dans le menu complet (pas juste le scroll)
      const menuContainer = e.target.closest('.floating-menu-container');
      const backdrop = e.target.closest('.menu-backdrop');

      if (menuContainer || backdrop) {
        // Laisser passer les interactions dans le menu ou sur le backdrop
        return;
      }

      // TOUT le reste est bloqué
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    };

    // Bloquer window scroll directement
    const blockWindowScroll = () => {
      window.scrollTo(0, scrollY);
    };

    // Ajouter les event listeners IMMÉDIATEMENT avec la priorité maximale
    window.addEventListener('touchstart', blockEverything, { passive: false, capture: true });
    window.addEventListener('touchmove', blockEverything, { passive: false, capture: true });
    window.addEventListener('touchend', blockEverything, { passive: false, capture: true });
    window.addEventListener('wheel', blockEverything, { passive: false, capture: true });
    window.addEventListener('scroll', blockWindowScroll, { passive: false, capture: true });
    document.addEventListener('touchstart', blockEverything, { passive: false, capture: true });
    document.addEventListener('touchmove', blockEverything, { passive: false, capture: true });
    document.addEventListener('touchend', blockEverything, { passive: false, capture: true });

    return () => {
      // Retirer tous les event listeners
      window.removeEventListener('touchstart', blockEverything, { capture: true });
      window.removeEventListener('touchmove', blockEverything, { capture: true });
      window.removeEventListener('touchend', blockEverything, { capture: true });
      window.removeEventListener('wheel', blockEverything, { capture: true });
      window.removeEventListener('scroll', blockWindowScroll, { capture: true });
      document.removeEventListener('touchstart', blockEverything, { capture: true });
      document.removeEventListener('touchmove', blockEverything, { capture: true });
      document.removeEventListener('touchend', blockEverything, { capture: true });

      // Retirer les classes
      document.body.classList.remove('menu-open');
      document.body.style.top = '';

      if (root) {
        root.classList.remove('menu-open');
      }

      // Restaurer la position de scroll
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Mémoïser les actions pour éviter re-création à chaque render
  const actions = useMemo(() => [
    {
      id: 'tasks',
      label: 'Tâches',
      icon: CheckSquare,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: FileText,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'shopping',
      label: 'Courses',
      icon: ShoppingCart,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'budget',
      label: 'Budget',
      icon: Wallet,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'media',
      label: 'Médias',
      icon: Play,
      color: 'from-red-500 to-red-600'
    }
  ], []);

  // Handler optimisé pour le clic sur action
  const handleActionClick = useCallback((actionId) => {
    onAction(actionId);
    onClose();
  }, [onAction, onClose]);

  // State pour tracker si l'animation d'entrée est terminée
  const [isAnimationComplete, setIsAnimationComplete] = React.useState(false);

  // Activer le backdrop après l'animation d'entrée (300ms)
  useEffect(() => {
    if (isOpen) {
      setIsAnimationComplete(false);
      const timer = setTimeout(() => {
        setIsAnimationComplete(true);
      }, 350); // Légèrement après la fin de l'animation (300ms)

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handler pour le backdrop avec protection contre les clics immédiats
  const handleBackdropClick = useCallback((e) => {
    // Ne pas fermer si l'animation n'est pas terminée
    if (!isAnimationComplete) {
      return;
    }

    // Vérifier que le clic vient bien du backdrop, pas d'un enfant
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose, isAnimationComplete]);

  // Mémoïser les variants d'animation pour éviter re-création
  const backdropVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  }), []);

  const menuContainerVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 30,
        mass: 0.6,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: 15,
      scale: 0.97,
      transition: {
        duration: 0.2,
        ease: [0.32, 0.72, 0, 1]
      }
    }
  }), []);

  const actionItemVariants = useMemo(() => ({
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 32,
        mass: 0.5
      }
    }
  }), []);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop premium avec blur progressif */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleBackdropClick}
            className="menu-backdrop fixed inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 backdrop-blur-xl z-[200]"
            style={{
              touchAction: 'auto',
              overscrollBehavior: 'none'
            }}
          />

          {/* Conteneur centré avec safe-area pour mobile */}
          <div
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pb-24 pointer-events-none"
            style={{
              overscrollBehavior: 'none',
              touchAction: 'none'
            }}
          >
            <motion.div
              variants={menuContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="floating-menu-container w-full max-w-md pointer-events-auto"
              style={{ overscrollBehavior: 'contain' }}
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
                <div
                  className="grid grid-cols-2 sm:grid-cols-2 gap-3 p-5 max-h-[60vh] overflow-y-auto floating-menu-scroll"
                  style={{
                    overscrollBehavior: 'contain',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {actions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <motion.button
                        key={action.id}
                        variants={actionItemVariants}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleActionClick(action.id)}
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
});

export default FloatingActionMenu;
