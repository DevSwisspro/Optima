#!/usr/bin/env node

/**
 * Supprimer les tables créées via Table Editor
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tuxqlybmtjmlyadbtneb.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1eHFseWJtdGptbHlhZGJ0bmViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQwNDg2OSwiZXhwIjoyMDcyOTgwODY5fQ.sp1kcCwMNl-v58BhFkD-Y8ntUYl-USnmAmpr9ezDyOk'

async function deleteTables() {
  console.log('🗑️ Suppression des tables Table Editor...')
  
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
  
  const tables = ['user_preferences', 'shopping_items', 'notes', 'tasks', 'budget_items']
  
  for (const table of tables) {
    try {
      // Direct SQL via fetch to drop tables
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY
        },
        body: JSON.stringify({
          sql: `DROP TABLE IF EXISTS public.${table} CASCADE;`
        })
      })
      
      console.log(`🗑️ Table ${table}: Supprimée (ou n'existait pas)`)
      
    } catch (err) {
      console.log(`⚠️ Table ${table}: ${err.message}`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  console.log('✅ Suppression terminée!')
}

deleteTables()
  .then(() => {
    console.log('🎯 Tables Table Editor supprimées. Prêt pour SQL Editor!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Erreur:', error)
    process.exit(1)
  })