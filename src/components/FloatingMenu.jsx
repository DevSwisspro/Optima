import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, User, Bell, HelpCircle, LogOut, X } from 'lucide-react';

const FloatingMenu = ({ onLogout, userName = "Utilisateur" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: User, label: 'Profil', color: '#2196F3', action: () => console.log('Profil') },
    { icon: Settings, label: 'Paramètres', color: '#9C27B0', action: () => console.log('Paramètres') },
    { icon: Bell, label: 'Notifications', color: '#FB8C00', action: () => console.log('Notifications') },
    { icon: HelpCircle, label: 'Aide', color: '#00C853', action: () => console.log('Aide') },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMenu}
          />
        )}
      </AnimatePresence>

      {/* Container du menu */}
      <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50">
        {/* Menu items en cercle */}
        <AnimatePresence>
          {isOpen && (
            <>
              {menuItems.map((item, index) => {
                const angle = (index * 360) / menuItems.length - 90; // Commence en haut
                const radius = 100;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;

                return (
                  <motion.button
                    key={item.label}
                    className="absolute bottom-0 right-0 w-14 h-14 rounded-full glass-strong shadow-lg hover:scale-110 transition-transform flex items-center justify-center group"
                    initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                    animate={{
                      scale: 1,
                      x: x,
                      y: y,
                      opacity: 1,
                      transition: {
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: index * 0.05,
                      }
                    }}
                    exit={{
                      scale: 0,
                      x: 0,
                      y: 0,
                      opacity: 0,
                      transition: { duration: 0.2, delay: (menuItems.length - index) * 0.03 }
                    }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                    style={{
                      backgroundColor: `${item.color}15`,
                      border: `2px solid ${item.color}40`,
                    }}
                  >
                    <item.icon
                      className="w-6 h-6 transition-colors"
                      style={{ color: item.color }}
                    />

                    {/* Tooltip */}
                    <motion.span
                      className="absolute right-full mr-3 px-3 py-1.5 bg-dark-800 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 0, x: 0 }}
                      whileHover={{ opacity: 1, x: 0 }}
                    >
                      {item.label}
                    </motion.span>
                  </motion.button>
                );
              })}

              {/* Bouton Déconnexion au centre haut */}
              <motion.button
                className="absolute bottom-0 right-0 w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/40 shadow-lg hover:scale-110 transition-transform flex items-center justify-center group"
                initial={{ scale: 0, y: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  y: -120,
                  opacity: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: menuItems.length * 0.05,
                  }
                }}
                exit={{
                  scale: 0,
                  y: 0,
                  opacity: 0,
                  transition: { duration: 0.2 }
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
              >
                <LogOut className="w-5 h-5 text-primary" />

                {/* Tooltip */}
                <span className="absolute right-full mr-3 px-3 py-1.5 bg-dark-800 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                  Déconnexion
                </span>
              </motion.button>
            </>
          )}
        </AnimatePresence>

        {/* Bouton principal */}
        <motion.button
          className="relative w-16 h-16 rounded-full gradient-primary shadow-glow-primary flex items-center justify-center"
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMenu}
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? (
              <X className="w-7 h-7 text-white" />
            ) : (
              <Settings className="w-7 h-7 text-white" />
            )}
          </motion.div>

          {/* Pulse effect */}
          {!isOpen && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}
        </motion.button>

        {/* Badge notification (optionnel) */}
        {!isOpen && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 bg-accent-orange rounded-full border-2 border-dark-900 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <span className="text-white text-xs font-bold">3</span>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default FloatingMenu;
