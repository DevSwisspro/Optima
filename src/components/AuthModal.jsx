import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Lock, User, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const AuthModal = ({ isOpen, onClose, onAuth, isLoading, supabase }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showCodeVerification, setShowCodeVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      if (isLogin) {
        await onAuth(formData.email, formData.password, isLogin);
      } else {
        // Vérifier que supabase est disponible
        if (!supabase || !supabase.auth) {
          throw new Error('Service d\'authentification non disponible. Vérifiez votre configuration.');
        }

        // Pour l'inscription, utiliser directement Supabase avec phone auth comme fallback
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            // Désactiver la confirmation par email pour utiliser notre système de code
            emailRedirectTo: undefined
          }
        });

        if (error) throw error;

        if (data.user && !data.session) {
          // Utilisateur créé mais pas encore confirmé
          setPendingEmail(formData.email);
          setShowCodeVerification(true);
          setError('');
          return; // Ne pas appeler onAuth, attendre le code de vérification
        } else if (data.session) {
          // Connexion directe réussie
          await onAuth(formData.email, formData.password, isLogin);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      
      // Messages d'erreur améliorés pour mode incognito
      let errorMessage = '';
      
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        errorMessage = '⚠️ Problème de connexion détecté.\n\n' +
                      '🕵️ Si vous êtes en mode incognito/privé :\n' +
                      '• Essayez en mode normal\n' +
                      '• Ou autorisez les cookies tiers\n\n' +
                      '🔧 Autres solutions :\n' +
                      '• Désactivez les bloqueurs de pub\n' +
                      '• Vérifiez votre connexion internet';
      } else if (err.message?.includes('Invalid login credentials')) {
        errorMessage = '❌ Email ou mot de passe incorrect';
      } else if (err.message?.includes('Email not confirmed')) {
        errorMessage = '📧 Vérifiez votre email et cliquez sur le lien de confirmation';
      } else if (err.message?.includes('User already registered')) {
        errorMessage = '👤 Ce compte existe déjà. Essayez de vous connecter.';
      } else if (err.message?.includes('Password should be at least 6 characters')) {
        errorMessage = '🔑 Le mot de passe doit contenir au moins 6 caractères';
      } else {
        errorMessage = err.message || 'Une erreur s\'est produite. Réessayez.';
      }
      
      setError(errorMessage);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user starts typing
  };

  const handleCodeVerification = async (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Veuillez saisir un code à 6 chiffres');
      return;
    }

    try {
      if (!supabase || !supabase.auth) {
        throw new Error('Service d\'authentification non disponible');
      }

      // Supabase utilise des tokens OTP pour la vérification
      const { data, error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: verificationCode,
        type: 'signup'
      });

      if (error) throw error;

      if (data.session) {
        console.log('✅ Code vérifié avec succès !');
        setShowCodeVerification(false);
        onClose();
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du code:', error.message);
      if (error.message.includes('expired')) {
        setError('❌ Code expiré. Cliquez sur "Renvoyer le code"');
      } else if (error.message.includes('invalid')) {
        setError('❌ Code incorrect. Vérifiez et réessayez.');
      } else {
        setError('❌ Erreur lors de la vérification. Réessayez.');
      }
    }
  };

  const resendCode = async () => {
    try {
      if (!supabase || !supabase.auth) {
        throw new Error('Service d\'authentification non disponible');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail
      });

      if (error) throw error;
      setError('');
      alert('📧 Nouveau code envoyé par email !');
    } catch (error) {
      console.error('Erreur lors du renvoi:', error.message);
      setError('❌ Impossible de renvoyer le code. Réessayez.');
    }
  };

  const handleCodeInputChange = (value) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(cleanValue);
    setError('');
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="relative bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-10 shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute -top-px left-20 right-20 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
          <div className="absolute -bottom-px left-20 right-20 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-gray-800/50 rounded-full transition-all duration-200"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
          
          {/* Header */}
          <div className="text-center mb-10">
            {/* Premium Logo */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-red-400 to-red-600 p-4 rounded-full shadow-xl w-20 h-20 mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl font-black mb-3" style={{ 
              fontFamily: '"Bebas Neue", "Arial Black", sans-serif',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              OPTIMA
            </h1>
            <p className="text-gray-400 text-lg font-light">
              {isLogin ? 'Bon retour parmi nous' : 'Rejoignez l\'excellence'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="email"
                placeholder="Votre adresse email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="h-16 pl-12 pr-4 bg-gray-800/50 border-gray-600/50 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 text-white placeholder:text-gray-500 rounded-xl text-lg"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="h-16 pl-12 pr-12 bg-gray-800/50 border-gray-600/50 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 text-white placeholder:text-gray-500 rounded-xl text-lg"
                disabled={isLoading}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Confirm Password Field (for signup) */}
            {!isLogin && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmer le mot de passe"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="h-16 pl-12 pr-12 bg-gray-800/50 border-gray-600/50 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 text-white placeholder:text-gray-500 rounded-xl text-lg"
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
              >
                <p className="text-red-400 text-sm text-center font-medium">{error}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="group w-full h-16 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl hover:shadow-red-500/25 border border-red-500/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Connexion en cours...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Sparkles className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                  <span>{isLogin ? 'Se connecter' : 'Créer mon compte'}</span>
                </div>
              )}
            </Button>

            {/* Toggle Mode */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ email: '', password: '', confirmPassword: '' });
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }}
                className="text-gray-400 hover:text-white text-base transition-all duration-300 font-medium hover:underline underline-offset-4"
                disabled={isLoading}
              >
                {isLogin ? (
                  <>Nouveau sur OPTIMA ? <span className="text-red-400 font-semibold">Créez votre compte</span></>
                ) : (
                  <>Déjà membre ? <span className="text-red-400 font-semibold">Connectez-vous</span></>
                )}
              </button>
            </div>
          </form>

          {/* Trust indicator */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Connexion sécurisée SSL</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;