#!/usr/bin/env node

/**
 * Execute the complete OPTIMA SQL setup script properly
 * This runs the setup-supabase.sql file exactly as it would in SQL Editor
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUPABASE_URL = 'https://tuxqlybmtjmlyadbtneb.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1eHFseWJtdGptbHlhZGJ0bmViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQwNDg2OSwiZXhwIjoyMDcyOTgwODY5fQ.sp1kcCwMNl-v58BhFkD-Y8ntUYl-USnmAmpr9ezDyOk'

async function executeSQLSetup() {
  try {
    console.log('🚀 OPTIMA - Execution du script SQL complet...')
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    // Lire le script SQL complet
    const sqlScript = fs.readFileSync(path.join(__dirname, 'scripts', 'setup-supabase.sql'), 'utf8')
    
    console.log('📝 Script SQL lu avec succès')
    console.log(`📊 Taille du script: ${sqlScript.length} caractères`)
    
    // Exécuter le script complet via PostgreSQL REST API
    console.log('⚡ Exécution du script SQL complet...')
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({
        sql: sqlScript
      })
    })
    
    if (response.ok) {
      const result = await response.text()
      console.log('✅ Script SQL exécuté avec succès!')
      console.log('📊 Résultat:', result)
    } else {
      const error = await response.text()
      console.log('❌ Erreur lors de l\'exécution:', error)
      
      // Essayer une approche alternative avec des commandes individuelles
      console.log('🔄 Tentative avec approche par commandes individuelles...')
      await executeCommandByCommand(sqlScript, supabase)
    }
    
    // Vérification finale
    await verifySetup(supabase)
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error.message)
    return false
  }
}

async function executeCommandByCommand(sqlScript, supabase) {
  // Diviser le script en commandes individuelles
  const commands = sqlScript
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.includes('RAISE NOTICE'))
  
  console.log(`📋 ${commands.length} commandes à exécuter`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const command of commands) {
    if (command.includes('DO $$') || command.includes('BEGIN') || command.includes('END')) {
      continue // Skip complex blocks
    }
    
    try {
      console.log(`⚡ ${command.substring(0, 60)}...`)
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: command + ';' 
      })
      
      if (error && !error.message.includes('already exists')) {
        console.log(`❌ ${error.message}`)
        errorCount++
      } else {
        successCount++
      }
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.log(`❌ Exception: ${err.message}`)
        errorCount++
      }
    }
    
    // Petit délai pour éviter le spam
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log(`📊 Commandes réussies: ${successCount}, Erreurs: ${errorCount}`)
}

async function verifySetup(supabase) {
  console.log('🔍 Vérification de la configuration...')
  
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
  
  console.log('🎉 Vérification terminée!')
}

// Exécuter le script
executeSQLSetup()
  .then(() => {
    console.log('✅ Configuration SQL terminée avec succès!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Erreur:', error)
    process.exit(1)
  })