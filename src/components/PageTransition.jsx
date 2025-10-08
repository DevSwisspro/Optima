import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PageTransition = ({ children, pageKey }) => {
  const pageVariants = {
    initial: {
      opacity: 0,
      x: -20,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
