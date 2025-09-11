import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase Config:', { 
  url: supabaseUrl, 
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined' 
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL ou Anon Key manquants - utilisation du localStorage en mode développement')
  console.error('Variables d\'environnement:', {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Présente' : 'Manquante'
  })
}

// Toujours créer le client - Vite injecte les variables automatiquement
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Debug: vérifier que supabase.auth existe
if (supabase) {
  console.log('Supabase client créé:', { 
    hasAuth: !!supabase.auth,
    authMethods: supabase.auth ? Object.keys(supabase.auth) : 'N/A'
  })
} else {
  console.error('Supabase client non créé - variables d\'environnement manquantes')
}

// Fonction utilitaire pour vérifier si Supabase est configuré
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Fonction pour tester la connexion Supabase
export const testSupabaseConnection = async () => {
  try {
    if (!supabase || !supabaseUrl || !supabaseAnonKey) {
      return { success: false, message: 'Client Supabase non configuré' }
    }
    const { data, error } = await supabase.from('test').select('*').limit(1)
    if (error && error.code !== '42P01') { // 42P01 = table doesn't exist
      throw error
    }
    return { success: true, message: 'Connexion Supabase OK' }
  } catch (error) {
    return { success: false, message: `Erreur Supabase: ${error.message}` }
  }
}