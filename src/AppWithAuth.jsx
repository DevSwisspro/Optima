import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AuthContainer from '@/components/Auth/AuthContainer';
import App from './App';

export default function AppWithAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    // La session sera automatiquement mise à jour via onAuthStateChange
  };

  // Écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas de session, afficher les écrans d'authentification
  if (!session) {
    return <AuthContainer onSuccess={handleAuthSuccess} />;
  }

  // Si session active, afficher l'application principale
  return <App session={session} />;
}
