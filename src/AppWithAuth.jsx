import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AuthContainer from '@/components/Auth/AuthContainer';
import LoaderPremium from '@/components/LoaderPremium';
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // Écran de chargement premium
  if (loading) {
    return <LoaderPremium fullScreen />;
  }

  // Si pas de session, afficher les écrans d'authentification
  if (!session) {
    return <AuthContainer onSuccess={handleAuthSuccess} />;
  }

  // Si session active, afficher l'application principale
  return <App session={session} onLogout={handleLogout} />;
}
