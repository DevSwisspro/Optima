import { createClient } from '@supabase/supabase-js'

// ⚠️ Ces variables sont évaluées par Vite (pas disponibles en HTML statique)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // Aide au debug en dev
  // eslint-disable-next-line no-console
  console.error('[Supabase] Variables VITE_* manquantes. Vérifie Netlify/.env et lance via Vite (port 5173).')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Expose pour les pages de debug (évite d'utiliser import.meta.env dans du HTML statique)
export const SUPABASE_URL = supabaseUrl
export const SUPABASE_ANON_KEY = supabaseAnonKey

// Logs utiles en dev
// eslint-disable-next-line no-console
console.log('Supabase URL:', SUPABASE_URL)
// eslint-disable-next-line no-console
console.log('Key prefix:', (SUPABASE_ANON_KEY ?? '').substring(0, 8))

// Test de la configuration au démarrage
if (supabase && supabase.auth) {
  console.log('✅ Supabase client TypeScript initialisé avec succès')
  console.log('📊 Auth methods disponibles:', Object.keys(supabase.auth))
} else {
  console.error('❌ Erreur d\'initialisation du client Supabase TypeScript')
}