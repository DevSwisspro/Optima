import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL ou Anon Key manquants - utilisation du localStorage en mode développement')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Fonction utilitaire pour vérifier si Supabase est configuré
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Fonction pour tester la connexion Supabase
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('test').select('*').limit(1)
    if (error && error.code !== '42P01') { // 42P01 = table doesn't exist
      throw error
    }
    return { success: true, message: 'Connexion Supabase OK' }
  } catch (error) {
    return { success: false, message: `Erreur Supabase: ${error.message}` }
  }
}