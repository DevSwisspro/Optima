import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PageTransition = ({ children, pageKey }) => {
  const pageVariants = {
    initial: {
      opacity: 0,
      x: -15,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }
    },
    exit: {
      opacity: 0,
      x: 15,
      scale: 0.98,
      transition: {
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1],
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
        className="w-full page-transition"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
