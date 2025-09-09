#!/usr/bin/env node

/**
 * Test de la configuration redirectTo pour Supabase
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tuxqlybmtjmlyadbtneb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1eHFseWJtdGptbHlhZGJ0bmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDQ4NjksImV4cCI6MjA3Mjk4MDg2OX0.hi22ZhvttiBpYjeFPh7TMG-NLueiH3YdW-vgXsnGQJY'

async function testRedirectConfig() {
  console.log('🔍 Test configuration redirectTo...')
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  
  const testEmail = `redirect.test.${Date.now()}@gmail.com`
  const testPassword = 'TestPassword123!'
  const prodUrl = 'https://optima.dev-swiss.ch'
  
  console.log(`📧 Email: ${testEmail}`)
  console.log(`🌐 Redirect URL: ${prodUrl}`)
  
  try {
    // Test AVEC redirectTo
    console.log('\n✅ Test AVEC redirectTo configuré:')
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: prodUrl
      }
    })
    
    if (error) {
      console.log('❌ Erreur:', error.message)
      console.log('🔍 Code:', error.status)
    } else {
      console.log('✅ Inscription réussie!')
      console.log('👤 User ID:', data.user?.id)
      console.log('📧 Email:', data.user?.email)
      console.log('✉️ Email envoyé avec redirectTo:', prodUrl)
      console.log('')
      console.log('🎯 IMPORTANT: Vérifiez votre email!')
      console.log(`📧 L'email de vérification devrait maintenant contenir:`)
      console.log(`   https://tuxqlybmtjmlyadbtneb.supabase.co/auth/v1/verify?token=...&redirect_to=${encodeURIComponent(prodUrl)}`)
      console.log(`   au lieu de localhost:3000`)
    }
    
  } catch (err) {
    console.log('💥 Exception:', err.message)
  }
}

async function testCurrentConfig() {
  console.log('\n🔍 Test configuration actuelle Dashboard...')
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  
  const testEmail2 = `current.test.${Date.now()}@gmail.com`
  const testPassword = 'TestPassword123!'
  
  try {
    // Test SANS redirectTo (utilise Site URL du dashboard)
    const { data, error } = await supabase.auth.signUp({
      email: testEmail2,
      password: testPassword
    })
    
    if (error) {
      console.log('❌ Erreur:', error.message)
    } else {
      console.log('✅ Inscription réussie!')
      console.log('📧 Email:', data.user?.email)
      console.log('⚙️  Utilise la Site URL du Dashboard Supabase')
    }
    
  } catch (err) {
    console.log('💥 Exception:', err.message)
  }
}

console.log('🚀 SOLUTION AU PROBLÈME localhost:3000')
console.log('=====================================')
console.log('')
console.log('📋 OPTIONS POUR CORRIGER:')
console.log('')
console.log('1. 🎯 Dashboard Supabase (RECOMMANDÉ):')
console.log('   • Allez sur https://supabase.com/dashboard/project/tuxqlybmtjmlyadbtneb')
console.log('   • Settings → Authentication → URL Configuration')
console.log('   • Site URL: Changez http://localhost:3000 → https://optima.dev-swiss.ch')
console.log('')
console.log('2. 🔧 Code avec redirectTo (ALTERNATIVE):')
console.log('   • Ajouter emailRedirectTo dans chaque signUp')
console.log('')

testRedirectConfig()
  .then(() => testCurrentConfig())
  .then(() => {
    console.log('\n🏁 Tests terminés')
    console.log('')
    console.log('💡 RECOMMANDATION:')
    console.log('   Changez la Site URL dans le Dashboard Supabase')
    console.log('   C\'est plus simple et ça marche pour toute l\'app!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Erreur fatale:', error.message)
    process.exit(1)
  })