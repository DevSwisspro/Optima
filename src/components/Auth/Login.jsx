import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LogoDevSwiss from '@/components/LogoDevSwiss';

export default function Login({ onToggleView, onSuccess, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data?.user) {
        onSuccess && onSuccess();
      }
    } catch (error) {
      setError(error.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className={`relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-full max-w-md">
          {/* Bouton retour */}
          {onBack && (
            <button
              onClick={onBack}
              className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Retour</span>
            </button>
          )}

          {/* Logo/Header */}
          <div className={`text-center mb-8 sm:mb-10 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-2xl border border-gray-700/50">
                  <LogoDevSwiss className="w-12 h-12 sm:w-14 sm:h-14 text-white" showText={false} />
                </div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Bon retour !</h1>
            <p className="text-gray-400 text-sm sm:text-base">Connectez-vous à votre compte Optima</p>
          </div>

          {/* Formulaire de connexion */}
          <div className={`bg-gray-800/30 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-gray-700/50 shadow-2xl transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="pl-12 bg-gray-900/50 border-gray-600 text-white placeholder-gray-500 h-12 rounded-xl"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-12 pr-12 bg-gray-900/50 border-gray-600 text-white placeholder-gray-500 h-12 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl shadow-xl transform transition-all duration-300 group-hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-base font-bold text-white">Connexion...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 text-white" />
                    <span className="text-base font-bold text-white">Se connecter</span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Lien vers inscription */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm sm:text-base">
              Pas encore de compte ?{' '}
              <button
                onClick={() => onToggleView('register')}
                className="text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                S'inscrire
              </button>
            </p>
          </div>

          {/* Lien mot de passe oublié */}
          <div className="mt-4 text-center">
            <button
              onClick={() => onToggleView('reset')}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Mot de passe oublié ?
            </button>
          </div>
          </div>

          {/* Footer */}
          <div className={`mt-8 sm:mt-12 text-center transition-all duration-700 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center justify-center gap-2 text-gray-600 text-xs sm:text-sm mb-2">
              <span>Propulsé par</span>
              <LogoDevSwiss className="w-10 h-10 text-gray-600" showText={false} />
              <span className="font-semibold">Dev-Swiss</span>
            </div>
            <p className="text-gray-700 text-xs">© 2025 Optima. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
