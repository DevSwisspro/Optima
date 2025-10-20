import React from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

export default function MobileHeader({ onSettingsClick, activeTab = "dashboard" }) {
  // Mapping des titres selon l'onglet actif
  const pageTitles = {
    dashboard: "Dashboard",
    tasks: "Mes Tâches",
    notes: "Notes",
    shopping: "Mes Courses",
    budget: "Mon Budget",
    "budget-dashboard": "Budget Avancé",
    media: "Mes Médias",
    knowledge: "Connaissances",
    settings: "Paramètres"
  };

  const currentTitle = pageTitles[activeTab] || "Dashboard";

  return (
    <header
      className="md:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/10"
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 0.75rem)',
        background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.98) 0%, rgba(30, 30, 47, 0.95) 100%)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
        willChange: 'auto',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
    >
      <div className="relative flex items-center justify-center px-4 py-4 pb-3">
        {/* Titre dynamique de la page avec style signature OPTIMA */}
        <h1
          className="text-[20px] font-bold tracking-[1px] uppercase relative"
          style={{
            background: 'linear-gradient(180deg, #FF4D4D 0%, #E53935 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 8px rgba(255, 59, 48, 0.6)',
            filter: 'drop-shadow(0 0 8px rgba(255, 59, 48, 0.6))'
          }}
        >
          {currentTitle}
        </h1>

        {/* Bouton Paramètres à droite */}
        <motion.button
          onClick={onSettingsClick}
          className="absolute right-4 p-2.5 rounded-xl hover:bg-white/10 active:bg-white/15 transition-all duration-200"
          whileTap={{ scale: 0.92 }}
          style={{
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <Settings className="w-5 h-5 text-gray-300" strokeWidth={2.2} />
        </motion.button>
      </div>
    </header>
  );
}
