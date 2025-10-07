import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LogoDevSwiss from '@/components/LogoDevSwiss';

export default function Landing({ onNavigate }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    { icon: TrendingUp, text: 'Gestion budgétaire intelligente', color: 'text-red-400' },
    { icon: Shield, text: 'Données 100% sécurisées', color: 'text-blue-400' },
    { icon: Zap, text: 'Interface ultra-rapide', color: 'text-yellow-400' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Logo et titre */}
        <div
          className={`text-center mb-8 sm:mb-12 transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}
        >
          {/* Logo animé */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-purple-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 rounded-3xl border border-gray-700/50 shadow-2xl">
                <LogoDevSwiss className="w-16 h-16 sm:w-20 sm:h-20 text-white" showText={false} />
              </div>
            </div>
          </div>

          {/* Titre */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-3 sm:mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              Optima
            </span>
          </h1>

          {/* Sous-titre */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-400 max-w-2xl mx-auto font-light">
            Votre assistant personnel pour{' '}
            <span className="text-red-400 font-semibold">gérer</span>,{' '}
            <span className="text-blue-400 font-semibold">optimiser</span> et{' '}
            <span className="text-purple-400 font-semibold">réussir</span>
          </p>
        </div>

        {/* Features pills */}
        <div
          className={`flex flex-wrap justify-center gap-3 sm:gap-4 mb-10 sm:mb-16 max-w-3xl transition-all duration-1000 delay-200 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-full hover:border-gray-600/50 transition-all duration-300 hover:scale-105"
            >
              <feature.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${feature.color}`} />
              <span className="text-xs sm:text-sm text-gray-300 font-medium">{feature.text}</span>
            </div>
          ))}
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

        {/* Badge "Nouveau" */}
        <div
          className={`mt-12 sm:mt-16 transition-all duration-1000 delay-600 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-purple-500/30 rounded-full">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">
              Nouvelle fonctionnalité : Suivi des médias
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 sm:mt-20 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600 text-xs sm:text-sm">
            <span>Propulsé par</span>
            <LogoDevSwiss className="w-12 h-12 sm:w-14 sm:h-14 text-gray-600" showText={false} />
            <span className="font-semibold">Dev-Swiss</span>
          </div>
          <p className="text-gray-700 text-xs mt-2">© 2025 Optima. Tous droits réservés.</p>
        </div>
      </div>

      {/* Glow effects on hover */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .delay-1000 { animation-delay: 1s; }
        .delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}
