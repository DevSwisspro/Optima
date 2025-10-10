import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const containerRef = useRef(null);

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e) => {
      // Seulement si on est au top de la page
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        setTouchStart(startY);
      }
    };

    const handleTouchMove = (e) => {
      if (!startY || window.scrollY > 0) return;

      currentY = e.touches[0].clientY;
      const distance = Math.min(currentY - startY, MAX_PULL);

      if (distance > 0) {
        setPullDistance(distance);
        // Empêcher le scroll natif pendant le pull
        if (distance > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        onRefresh?.().finally(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        });
      } else {
        setPullDistance(0);
      }
      startY = 0;
      setTouchStart(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const rotation = progress * 360;

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Indicateur de pull */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg"
              animate={{
                rotate: isRefreshing ? 360 : rotation,
                scale: isRefreshing ? [1, 1.1, 1] : 1
              }}
              transition={{
                rotate: isRefreshing ? {
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear'
                } : { duration: 0 },
                scale: isRefreshing ? {
                  duration: 0.8,
                  repeat: Infinity,
                  ease: 'easeInOut'
                } : { duration: 0 }
              }}
            >
              <RefreshCw className="w-6 h-6 text-white" strokeWidth={2.5} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}
