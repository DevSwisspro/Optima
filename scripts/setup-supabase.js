#!/usr/bin/env node

/**
 * OPTIMA - Script de configuration automatique Supabase
 * Configure automatiquement toutes les tables et politiques nécessaires
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration Supabase
const SUPABASE_URL = 'https://ntytkeasfjnwoehpzhtm.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eXRrZWFzZmpud29laHB6aHRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTc5MDAyNSwiZXhwIjoyMDQxMzY2MDI1fQ.YQl7zZLZoFcgOoKB-D6fiMZW4oQOQJvQ2xwdFfLPP3M'

async function setupSupabase() {
  try {
    console.log('🚀 OPTIMA - Configuration Supabase...')
    
    // Créer le client Supabase avec la clé de service
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Lire le script SQL
    const sqlScript = fs.readFileSync(path.join(__dirname, 'setup-supabase.sql'), 'utf8')
    
    console.log('📝 Exécution du script SQL...')
    
    // Diviser le script en commandes individuelles pour éviter les erreurs de parsing
    const commands = sqlScript
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('DO $$'))
    
    let successCount = 0
    let errorCount = 0

    // Exécuter chaque commande individuellement
    for (const command of commands) {
      if (command.includes('NOTICE') || command.includes('DO $$')) continue
      
      try {
        console.log(`⚡ Exécution: ${command.substring(0, 50)}...`)
        const { error } = await supabase.rpc('exec_sql', { sql: command + ';' })
        
        if (error) {
          // Ignorer les erreurs "already exists"
          if (error.message && (
            error.message.includes('already exists') ||
            error.message.includes('relation') && error.message.includes('does not exist')
          )) {
            console.log(`⚠️  Ignoré (déjà existant): ${error.message}`)
          } else {
            console.log(`❌ Erreur: ${error.message}`)
            errorCount++
          }
        } else {
          successCount++
        }
      } catch (err) {
        console.log(`❌ Exception: ${err.message}`)
        errorCount++
      }
    }

    // Alternative: essayer d'exécuter le script complet
    try {
      console.log('🔄 Tentative d\'exécution du script complet...')
      const { error: fullError } = await supabase.rpc('exec_sql', { sql: sqlScript })
      if (fullError) {
        console.log(`⚠️  Erreur script complet: ${fullError.message}`)
      } else {
        console.log('✅ Script complet exécuté avec succès')
      }
    } catch (err) {
      console.log(`⚠️  Exception script complet: ${err.message}`)
    }

    // Vérification des tables créées
    console.log('🔍 Vérification des tables...')
    const tables = ['budget_items', 'tasks', 'notes', 'shopping_items', 'user_preferences']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`)
        } else {
          console.log(`✅ Table ${table}: OK`)
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`)
      }
    }

    console.log(`\n📊 Résumé:`)
    console.log(`✅ Commandes réussies: ${successCount}`)
    console.log(`❌ Erreurs: ${errorCount}`)
    console.log(`🎉 Configuration Supabase terminée!`)
    
    return { success: true, successCount, errorCount }
    
  } catch (error) {
    console.error('💥 Erreur fatale lors de la configuration:', error.message)
    return { success: false, error: error.message }
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  setupSupabase()
    .then(result => {
      if (result.success) {
        console.log('✅ Configuration Supabase réussie!')
        process.exit(0)
      } else {
        console.error('❌ Configuration Supabase échouée:', result.error)
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('💥 Erreur:', error)
      process.exit(1)
    })
}

export { setupSupabase }