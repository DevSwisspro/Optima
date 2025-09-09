#!/usr/bin/env node

/**
 * Vérifier que la production utilise la bonne URL Supabase
 */

import fetch from 'node-fetch'

async function verifyProduction() {
  console.log('🔍 Vérification de la production...')
  
  try {
    // Test de la page principale
    const response = await fetch('https://optima.dev-swiss.ch')
    const html = await response.text()
    
    console.log('✅ Site accessible')
    
    // Vérifier les URLs Supabase
    const correctUrl = 'tuxqlybmtjmlyadbtneb.supabase.co'
    const wrongUrl = 'ntytkeasfjnwoehpzhtm.supabase.co'
    
    const hasCorrect = html.includes(correctUrl)
    const hasWrong = html.includes(wrongUrl)
    
    console.log('\n📊 RÉSULTATS:')
    console.log(`✅ URL correcte trouvée: ${hasCorrect ? 'OUI' : 'NON'}`)
    console.log(`❌ URL incorrecte trouvée: ${hasWrong ? 'OUI' : 'NON'}`)
    
    if (hasCorrect && !hasWrong) {
      console.log('\n🎉 SUCCESS! Production utilise la bonne URL Supabase')
      console.log('🔐 Authentification devrait maintenant fonctionner')
    } else if (hasWrong) {
      console.log('\n⚠️  ATTENTION: Ancienne URL encore présente')
      console.log('🔄 Il faut peut-être vider le cache du navigateur')
    } else {
      console.log('\n❓ URLs Supabase non détectées dans le HTML')
      console.log('ℹ️  URLs peuvent être chargées dynamiquement')
    }
    
    console.log('\n📏 Taille page:', html.length, 'caractères')
    console.log('📄 Titre:', html.match(/<title>(.*?)<\/title>/)?.[1] || 'Non trouvé')
    
  } catch (error) {
    console.error('💥 Erreur:', error.message)
  }
}

verifyProduction()
  .then(() => {
    console.log('\n🏁 Vérification terminée')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Erreur fatale:', error.message)
    process.exit(1)
  })