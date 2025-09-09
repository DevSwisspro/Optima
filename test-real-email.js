#!/usr/bin/env node

/**
 * Test avec email réel pour Supabase
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tuxqlybmtjmlyadbtneb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1eHFseWJtdGptbHlhZGJ0bmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDQ4NjksImV4cCI6MjA3Mjk4MDg2OX0.hi22ZhvttiBpYjeFPh7TMG-NLueiH3YdW-vgXsnGQJY'

async function testRealEmail() {
  console.log('🔍 Test avec email réel...')
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  
  // Test avec email Gmail temporaire
  const testEmail = `test.optima.${Date.now()}@gmail.com`
  const testPassword = 'TestPassword123!'
  
  console.log(`📧 Test email: ${testEmail}`)
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })
    
    if (error) {
      console.log('❌ Erreur:', error.message)
      console.log('🔍 Code:', error.status)
      console.log('🔍 Détails:', JSON.stringify(error, null, 2))
    } else {
      console.log('✅ SUCCÈS! Compte créé')
      console.log('👤 User ID:', data.user?.id)
      console.log('📧 Email:', data.user?.email)
      console.log('✉️ Confirmation:', data.user?.email_confirmed_at ? 'Confirmé' : 'En attente')
    }
    
  } catch (err) {
    console.log('💥 Exception:', err.message)
  }

  // Test login avec email existant
  console.log('\n🔐 Test connexion...')
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@gmail.com',
      password: 'wrongpassword'
    })
    
    if (error) {
      console.log('❌ Login erreur (normal):', error.message)
    } else {
      console.log('✅ Login réussi')
    }
    
  } catch (err) {
    console.log('💥 Login exception:', err.message)
  }

  return true
}

testRealEmail()
  .then(() => {
    console.log('\n🏁 Test terminé')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Erreur fatale:', error)
    process.exit(1)
  })