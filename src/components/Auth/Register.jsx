import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LogoDevSwiss from '@/components/LogoDevSwiss';

export default function Register({ onToggleView, onSuccess, onBack }) {
  const [step, setStep] = useState(1); // 1: Formulaire, 2: Code de validation
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Code de validation
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Validation du formulaire
  const validateForm = () => {
    if (!email.trim() || !password || !confirmPassword || !fullName.trim()) {
      setError('Tous les champs sont requis');
      return false;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email invalide');
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      // Passer à l'étape de validation
      setStep(2);
    } catch (error) {
      setError(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  // Gestion du code à 6 chiffres
  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Seulement des chiffres

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Focus automatique sur le champ suivant
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join('');

    if (code.length !== 6) {
      setError('Veuillez entrer le code complet');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: 'signup'
      });

      if (error) throw error;

      // Succès !
      onSuccess && onSuccess();
    } catch (error) {
      setError(error.message || 'Code invalide');
      setVerificationCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });

      if (error) throw error;

      setError(''); // Clear any previous errors
      // Vous pouvez afficher un message de succès ici
    } catch (error) {
      setError(error.message || 'Erreur lors du renvoi du code');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    // Écran de validation du code
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className={`relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-full max-w-md">
            {/* Bouton retour */}
            <button
              onClick={() => setStep(1)}
              className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Retour</span>
            </button>

            {/* Logo/Header */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="flex justify-center mb-3">
                <LogoDevSwiss className="w-24 h-24 sm:w-28 sm:h-28 text-white drop-shadow-2xl" showText={false} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Vérifiez votre email</h1>
              <p className="text-gray-400 text-sm sm:text-base max-w-sm mx-auto">
                Nous avons envoyé un code à 6 chiffres à <span className="text-white font-semibold">{email}</span>
              </p>
            </div>

            {/* Formulaire de code */}
            <div className="bg-gray-800/30 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-gray-700/50 shadow-2xl">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Champs du code */}
              <div className="flex justify-center gap-2 sm:gap-3 mb-8">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-gray-900/50 border-2 border-gray-600 focus:border-purple-500 text-white rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                ))}
              </div>

              {/* Bouton valider */}
              <button
                onClick={handleVerifyCode}
                disabled={loading || verificationCode.join('').length !== 6}
                className="group relative w-full mb-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl shadow-xl transform transition-all duration-300 group-hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-base font-bold text-white">Vérification...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-white" />
                      <span className="text-base font-bold text-white">Valider</span>
                    </>
                  )}
                </div>
              </button>

              {/* Renvoyer le code */}
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Vous n'avez pas reçu le code ?{' '}
                  <button
                    onClick={resendCode}
                    disabled={loading}
                    className="text-red-400 hover:text-red-300 font-semibold transition-colors disabled:opacity-50"
                  >
                    Renvoyer
                  </button>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 sm:mt-12 text-center">
              <div className="flex items-center justify-center gap-2.5 text-gray-600 text-xs sm:text-sm mb-2">
                <span>Créé par</span>
                <LogoDevSwiss className="w-8 h-8 text-white/60" showText={false} />
                <span className="font-semibold text-gray-500">Dev-Swiss</span>
              </div>
              <p className="text-gray-700 text-xs">© 2025 Optima. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulaire d'inscription (step 1)
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
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
            <div className="flex justify-center mb-3">
              <LogoDevSwiss className="w-24 h-24 sm:w-28 sm:h-28 text-white drop-shadow-2xl" showText={false} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Créer un compte</h1>
            <p className="text-gray-400 text-sm sm:text-base">Rejoignez Optima en quelques secondes</p>
          </div>

          {/* Formulaire d'inscription */}
          <div className={`bg-gray-800/30 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-gray-700/50 shadow-2xl transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              {/* Nom complet */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jean Dupont"
                    required
                    className="pl-12 bg-gray-900/50 border-gray-600 text-white placeholder-gray-500 h-12 rounded-xl"
                  />
                </div>
              </div>

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

              {/* Confirmer mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-12 pr-12 bg-gray-900/50 border-gray-600 text-white placeholder-gray-500 h-12 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Bouton d'inscription */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full mt-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl shadow-xl transform transition-all duration-300 group-hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-base font-bold text-white">Inscription...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 text-white" />
                      <span className="text-base font-bold text-white">Créer mon compte</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Lien vers connexion */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm sm:text-base">
                Vous avez déjà un compte ?{' '}
                <button
                  onClick={() => onToggleView('login')}
                  className="text-red-400 hover:text-red-300 font-semibold transition-colors"
                >
                  Se connecter
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className={`mt-8 sm:mt-12 text-center transition-all duration-700 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center justify-center gap-2.5 text-gray-600 text-xs sm:text-sm mb-2">
              <span>Créé par</span>
              <LogoDevSwiss className="w-8 h-8 text-white/60" showText={false} />
              <span className="font-semibold text-gray-500">Dev-Swiss</span>
            </div>
            <p className="text-gray-700 text-xs">© 2025 Optima. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
