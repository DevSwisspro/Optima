#!/usr/bin/env node

/**
 * Test authentification avec différents domaines email
 * Pour identifier si Supabase bloque spécifiquement certains domaines
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tuxqlybmtjmlyadbtneb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1eHFseWJtdGptbHlhZGJ0bmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDQ4NjksImV4cCI6MjA3Mjk4MDg2OX0.hi22ZhvttiBpYjeFPh7TMG-NLueiH3YdW-vgXsnGQJY'

async function testDomainEmail() {
  console.log('🔍 Test authentification domaines multiples...\n')
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  
  // Liste des domaines à tester
  const testDomains = [
    // Domaines populaires (devraient fonctionner)
    { domain: 'gmail.com', type: 'mainstream', expected: 'success' },
    { domain: 'outlook.com', type: 'mainstream', expected: 'success' },
    { domain: 'yahoo.com', type: 'mainstream', expected: 'success' },
    { domain: 'hotmail.com', type: 'mainstream', expected: 'success' },
    
    // Domaines business courants (devraient fonctionner)
    { domain: 'protonmail.com', type: 'business', expected: 'success' },
    { domain: 'icloud.com', type: 'business', expected: 'success' },
    
    // Domaines personnalisés (potentiellement bloqués)
    { domain: 'dev-swiss.ch', type: 'custom', expected: 'unknown' },
    { domain: 'example.com', type: 'custom', expected: 'unknown' },
    { domain: 'test.local', type: 'invalid', expected: 'fail' }
  ]
  
  const results = []
  const timestamp = Date.now()
  
  for (const testCase of testDomains) {
    const testEmail = `test.${timestamp}.${Math.random().toString(36).substr(2,5)}@${testCase.domain}`
    const testPassword = 'TestPassword123!'
    
    console.log(`📧 Test: ${testEmail}`)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })
      
      if (error) {
        console.log(`❌ ${testCase.domain}: ${error.message}`)
        console.log(`🔍 Code: ${error.status || 'N/A'}`)
        
        results.push({
          domain: testCase.domain,
          type: testCase.type,
          status: 'error',
          error: error.message,
          code: error.status,
          email: testEmail
        })
        
        // Analyser les types d'erreurs spécifiques
        if (error.message.includes('email_address_invalid')) {
          console.log(`⚠️  Domain ${testCase.domain} est rejeté par Supabase`)
        } else if (error.message.includes('rate_limit')) {
          console.log(`⚠️  Rate limit atteint, pausons...`)
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        
      } else {
        console.log(`✅ ${testCase.domain}: Inscription réussie`)
        console.log(`👤 User ID: ${data.user?.id}`)
        
        results.push({
          domain: testCase.domain,
          type: testCase.type,
          status: 'success',
          userId: data.user?.id,
          email: testEmail,
          emailConfirmed: data.user?.email_confirmed_at ? 'yes' : 'no'
        })
      }
      
    } catch (err) {
      console.log(`💥 ${testCase.domain}: Exception - ${err.message}`)
      results.push({
        domain: testCase.domain,
        type: testCase.type,
        status: 'exception',
        error: err.message,
        email: testEmail
      })
    }
    
    console.log('') // Ligne vide pour séparer
    
    // Pause entre tests pour éviter rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // Résumé des résultats
  console.log('\n📊 RÉSUMÉ DES TESTS:')
  console.log('==================')
  
  const byType = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = { success: 0, error: 0, total: 0 }
    acc[result.type].total++
    if (result.status === 'success') {
      acc[result.type].success++
    } else {
      acc[result.type].error++
    }
    return acc
  }, {})
  
  for (const [type, stats] of Object.entries(byType)) {
    console.log(`${type.toUpperCase()}: ${stats.success}/${stats.total} réussi(s)`)
  }
  
  // Domaines bloqués
  const blocked = results.filter(r => r.error?.includes('email_address_invalid'))
  if (blocked.length > 0) {
    console.log('\n🚫 DOMAINES POTENTIELLEMENT BLOQUÉS:')
    blocked.forEach(r => {
      console.log(`• ${r.domain} (${r.type})`)
    })
  }
  
  // Recommandations
  console.log('\n💡 RECOMMANDATIONS:')
  if (blocked.some(r => r.type === 'custom')) {
    console.log('• Supabase semble bloquer certains domaines personnalisés')
    console.log('• Solution: Configurer Custom SMTP dans Supabase Dashboard')
    console.log('• Ou: Utiliser un service d\'email transactionnel (SendGrid, Mailgun)')
    console.log('• Temporaire: Demander aux utilisateurs d\'utiliser Gmail/Outlook')
  } else {
    console.log('• Aucun blocage de domaine détecté')
    console.log('• Le problème pourrait être ailleurs (réseau, configuration)')
  }
  
  return results
}

testDomainEmail()
  .then((results) => {
    console.log('\n🏁 Test terminé')
    console.log(`📈 ${results.length} domaines testés`)
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Erreur fatale:', error.message)
    process.exit(1)
  })