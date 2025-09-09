#!/usr/bin/env node

/**
 * Test direct de l'authentification Supabase
 * Pour diagnostiquer le problème de création de compte
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tuxqlybmtjmlyadbtneb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1eHFseWJtdGptbHlhZGJ0bmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDQ4NjksImV4cCI6MjA3Mjk4MDg2OX0.hi22ZhvttiBpYjeFPh7TMG-NLueiH3YdW-vgXsnGQJY'

async function testAuth() {
  console.log('🔍 Test authentification Supabase direct...')
  console.log('=' .repeat(50))
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  
  // Test 1: Connexion base
  console.log('\n📡 Test 1: Connexion de base')
  try {
    const { data, error } = await supabase.from('tasks').select('count', { count: 'exact', head: true })
    if (error) {
      console.log('❌ Erreur connexion:', error.message)
      return false
    }
    console.log('✅ Connexion Supabase OK')
  } catch (err) {
    console.log('💥 Exception connexion:', err.message)
    return false
  }

  // Test 2: Test signup avec email temporaire
  console.log('\n👤 Test 2: Création compte test')
  const testEmail = `test-${Date.now()}@exemple-temporaire.com`
  const testPassword = 'TestPassword123!'
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })
    
    if (error) {
      console.log('❌ Erreur signup:', error.message)
      console.log('🔍 Code erreur:', error.status)
      console.log('🔍 Détails:', JSON.stringify(error, null, 2))
      
      // Analyser le type d'erreur
      if (error.message.includes('Failed to fetch')) {
        console.log('\n🕵️ DIAGNOSTIC: Problème réseau/CORS')
        console.log('   • Vérifiez les bloqueurs de contenu')
        console.log('   • Testez en mode navigation normale')
        console.log('   • Vérifiez la connexion internet')
      } else if (error.message.includes('Email')) {
        console.log('\n📧 DIAGNOSTIC: Problème email')
        console.log('   • Format email invalide ?')
        console.log('   • Email déjà utilisé ?')
      } else if (error.message.includes('Password')) {
        console.log('\n🔑 DIAGNOSTIC: Problème mot de passe')
        console.log('   • Mot de passe trop faible ?')
        console.log('   • Critères non respectés ?')
      }
      
    } else {
      console.log('✅ Signup réussi!')
      console.log('📧 User ID:', data.user?.id)
      console.log('📧 Email:', data.user?.email)
      console.log('🔐 Session:', data.session ? 'Créée' : 'Aucune')
      
      if (data.user && !data.session) {
        console.log('⚠️ Confirmation email requise')
      }
    }
    
  } catch (err) {
    console.log('💥 Exception signup:', err.message)
    console.log('🔍 Stack:', err.stack)
  }

  // Test 3: Configuration auth
  console.log('\n⚙️ Test 3: Configuration Supabase')
  try {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('👤 Utilisateur actuel:', user ? user.email : 'Aucun')
  } catch (err) {
    console.log('❌ Erreur getUser:', err.message)
  }

  // Test 4: Vérification des tables
  console.log('\n📋 Test 4: Accès aux tables')
  const tables = ['tasks', 'budget_items', 'notes', 'shopping_items', 'user_preferences']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true })
      if (error) {
        console.log(`❌ Table ${table}:`, error.message)
      } else {
        console.log(`✅ Table ${table}: Accessible`)
      }
    } catch (err) {
      console.log(`💥 Table ${table}:`, err.message)
    }
  }

  return true
}

// Test environnement
console.log('🌍 Environnement:')
console.log('   Node.js:', process.version)
console.log('   Platform:', process.platform)
console.log('   URL Supabase:', SUPABASE_URL)
console.log('   Clé (premiers chars):', SUPABASE_ANON_KEY.substring(0, 20) + '...')

testAuth()
  .then(() => {
    console.log('\n🏁 Test terminé')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Erreur fatale:', error)
    process.exit(1)
  })