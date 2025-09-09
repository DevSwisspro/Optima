#!/usr/bin/env node

/**
 * Execute SQL directly via Supabase Management API
 * This is the proper way to run SQL scripts programmatically
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROJECT_REF = 'tuxqlybmtjmlyadbtneb'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1eHFseWJtdGptbHlhZGJ0bmViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQwNDg2OSwiZXhwIjoyMDcyOTgwODY5fQ.sp1kcCwMNl-v58BhFkD-Y8ntUYl-USnmAmpr9ezDyOk'

async function executeSQL() {
  try {
    console.log('🚀 OPTIMA - Exécution SQL directe...')
    
    // Lire le script SQL
    const sqlScript = fs.readFileSync(path.join(__dirname, 'scripts', 'setup-supabase.sql'), 'utf8')
    
    console.log('📝 Script SQL lu avec succès')
    console.log(`📊 Taille: ${sqlScript.length} caractères`)
    
    // Utiliser l'API PostgreSQL directement
    const response = await fetch(`https://${PROJECT_REF}.supabase.co/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        query: sqlScript
      })
    })
    
    if (!response.ok) {
      // Essayer une approche différente avec l'API Management
      console.log('🔄 Tentative avec API Management...')
      return await executeViaManagementAPI(sqlScript)
    }
    
    const result = await response.json()
    console.log('✅ SQL exécuté avec succès!')
    console.log('📊 Résultat:', result)
    
    return true
    
  } catch (error) {
    console.error('💥 Erreur:', error.message)
    return false
  }
}

async function executeViaManagementAPI(sqlScript) {
  try {
    console.log('⚡ Exécution via Management API...')
    
    // Diviser le script en commandes logiques
    const commands = splitSQLScript(sqlScript)
    
    console.log(`📋 ${commands.length} blocs de commandes à exécuter`)
    
    let successCount = 0
    let errorCount = 0
    
    for (const [index, command] of commands.entries()) {
      try {
        console.log(`⚡ [${index + 1}/${commands.length}] ${command.substring(0, 50)}...`)
        
        const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: command
          })
        })
        
        if (response.ok) {
          successCount++
          console.log('✅ OK')
        } else {
          const error = await response.text()
          if (error.includes('already exists') || error.includes('duplicate')) {
            console.log('⚠️ Déjà existant')
            successCount++
          } else {
            console.log(`❌ Erreur: ${error}`)
            errorCount++
          }
        }
        
      } catch (err) {
        console.log(`❌ Exception: ${err.message}`)
        errorCount++
      }
      
      // Délai entre les commandes
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    console.log(`📊 Résumé: ${successCount} réussies, ${errorCount} erreurs`)
    return successCount > errorCount
    
  } catch (error) {
    console.error('💥 Erreur Management API:', error.message)
    return false
  }
}

function splitSQLScript(script) {
  // Diviser intelligemment le script SQL
  const commands = []
  let current = ''
  let inFunction = false
  let braceLevel = 0
  
  const lines = script.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Ignorer les commentaires et lignes vides
    if (trimmed.startsWith('--') || trimmed === '') {
      continue
    }
    
    current += line + '\n'
    
    // Détecter les fonctions et blocs
    if (trimmed.includes('$$') && !inFunction) {
      inFunction = true
    } else if (trimmed.includes('$$') && inFunction) {
      inFunction = false
      commands.push(current.trim())
      current = ''
      continue
    }
    
    // Détecter les DO blocks
    if (trimmed.startsWith('DO $$')) {
      inFunction = true
    }
    
    // Compter les accolades pour les blocs
    braceLevel += (line.match(/\{/g) || []).length
    braceLevel -= (line.match(/\}/g) || []).length
    
    // Si pas dans une fonction/bloc et se termine par ;
    if (!inFunction && braceLevel === 0 && trimmed.endsWith(';')) {
      commands.push(current.trim())
      current = ''
    }
  }
  
  // Ajouter le reste s'il y en a
  if (current.trim()) {
    commands.push(current.trim())
  }
  
  return commands.filter(cmd => cmd.length > 0)
}

// Exécuter
executeSQL()
  .then(success => {
    if (success) {
      console.log('🎉 Configuration SQL complète réussie!')
      process.exit(0)
    } else {
      console.log('⚠️ Configuration SQL avec erreurs')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('💥 Erreur fatale:', error)
    process.exit(1)
  })