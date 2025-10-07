import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import LogoDevSwiss from '@/components/LogoDevSwiss';

export default function Landing({ onNavigate }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Logo et titre */}
        <div
          className={`text-center mb-8 sm:mb-12 transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}
        >
          {/* Logo */}
          <div className="flex justify-center mb-3">
            <LogoDevSwiss className="w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48 text-white drop-shadow-2xl" showText={false} />
          </div>

          {/* Titre */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-3 sm:mb-4 tracking-tight">
            <span className="text-red-600">Optima</span>
          </h1>

          {/* Sous-titre */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-400 max-w-2xl mx-auto font-light">
            Votre outil personnel pour gérer, optimiser et contrôler vos finances.
          </p>
        </div>

        {/* Boutons d'action */}
        <div
          className={`w-full max-w-md space-y-4 sm:space-y-5 transition-all duration-1000 delay-400 transform ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Bouton Se connecter */}
          <button
            onClick={() => onNavigate('login')}
            className="group relative w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center gap-3 px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-2xl shadow-xl transform transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl">
              <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <span className="text-base sm:text-lg font-bold text-white">Se connecter</span>
            </div>
          </button>

          {/* Bouton Créer un compte */}
          <button
            onClick={() => onNavigate('register')}
            className="group relative w-full"
          >
            <div className="relative flex items-center justify-center gap-3 px-6 sm:px-8 py-4 sm:py-5 bg-gray-800/50 hover:bg-gray-800/70 backdrop-blur-xl border-2 border-gray-700/50 hover:border-gray-600/50 rounded-2xl shadow-xl transform transition-all duration-300 group-hover:scale-[1.02]">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <span className="text-base sm:text-lg font-bold text-white">Créer un compte</span>
            </div>
          </button>

          {/* Texte d'info */}
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8">
            En continuant, vous acceptez nos{' '}
            <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">
              conditions d'utilisation
            </span>
            {' '}et notre{' '}
            <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">
              politique de confidentialité
            </span>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 sm:mt-20 text-center">
          <div className="flex items-center justify-center gap-2.5 text-gray-600 text-xs sm:text-sm">
            <span>Créé par</span>
            <LogoDevSwiss className="w-8 h-8 text-white/60" showText={false} />
            <span className="font-semibold text-gray-500">Dev-Swiss</span>
          </div>
          <p className="text-gray-700 text-xs mt-2">© 2025 Optima. Tous droits réservés.</p>
        </div>
      </div>

      {/* Animation delays */}
      <style jsx>{`
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  );
}
