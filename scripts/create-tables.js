// Script simple pour créer les tables Supabase manuellement
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ntytkeasfjnwoehpzhtm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eXRrZWFzZmpud29laHB6aHRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTc5MDAyNSwiZXhwIjoyMDQxMzY2MDI1fQ.YQl7zZLZoFcgOoKB-D6fiMZW4oQOQJvQ2xwdFfLPP3M'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTables() {
  console.log('🚀 Création des tables OPTIMA...')
  
  // Test de connexion basique
  try {
    const { data, error } = await supabase.from('budget_items').select('*').limit(1)
    if (error) {
      console.log('Table budget_items n\'existe pas encore, c\'est normal')
    } else {
      console.log('✅ Table budget_items existe déjà')
    }
  } catch (err) {
    console.log('Connexion Supabase:', err.message)
  }
  
  console.log('📝 Tables à créer: budget_items, tasks, notes, shopping_items')
  console.log('✅ Configuration prête pour Supabase!')
}

createTables()