#!/usr/bin/env node

/**
 * Corriger les variables d'environnement Netlify
 * Fix l'URL Supabase incorrecte en production
 */

const NETLIFY_TOKEN = 'nfp_NM2gqkJ6q38XnowdqWVoK8NzmfLJiFmb4748'
const SITE_ID = 'e96c7f60-0837-4893-bcab-39048e4da769'

const CORRECT_SUPABASE_URL = 'https://tuxqlybmtjmlyadbtneb.supabase.co'
const CORRECT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1eHFseWJtdGptbHlhZGJ0bmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDQ4NjksImV4cCI6MjA3Mjk4MDg2OX0.hi22ZhvttiBpYjeFPh7TMG-NLueiH3YdW-vgXsnGQJY'

async function fixNetlifyEnv() {
  console.log('🔧 Correction des variables d\'environnement Netlify...')
  
  try {
    // 1. Récupérer les variables actuelles
    console.log('📋 Lecture des variables actuelles...')
    const getResponse = await fetch(`https://api.netlify.com/api/v1/accounts/${SITE_ID}/env`, {
      headers: {
        'Authorization': `Bearer ${NETLIFY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!getResponse.ok) {
      throw new Error(`Erreur lecture variables: ${getResponse.status}`)
    }
    
    const currentVars = await getResponse.json()
    console.log('✅ Variables actuelles récupérées')
    
    // Afficher les variables Supabase actuelles
    const supabaseUrlVar = currentVars.find(v => v.key === 'VITE_SUPABASE_URL')
    const supabaseKeyVar = currentVars.find(v => v.key === 'VITE_SUPABASE_ANON_KEY')
    
    console.log('\n🔍 Variables actuelles:')
    if (supabaseUrlVar) {
      console.log(`   VITE_SUPABASE_URL: ${supabaseUrlVar.values[0]?.value || 'Non définie'}`)
    }
    if (supabaseKeyVar) {
      console.log(`   VITE_SUPABASE_ANON_KEY: ${supabaseKeyVar.values[0]?.value?.substring(0, 30)}...`)
    }
    
    // 2. Mettre à jour les variables
    console.log('\n🔄 Mise à jour des variables...')
    
    const updatePayload = [
      {
        key: 'VITE_SUPABASE_URL',
        scopes: ['builds', 'functions'],
        values: [
          {
            value: CORRECT_SUPABASE_URL,
            context: 'all'
          }
        ]
      },
      {
        key: 'VITE_SUPABASE_ANON_KEY',
        scopes: ['builds', 'functions'],
        values: [
          {
            value: CORRECT_SUPABASE_ANON_KEY,
            context: 'all'
          }
        ]
      }
    ]
    
    for (const envVar of updatePayload) {
      const updateResponse = await fetch(`https://api.netlify.com/api/v1/accounts/${SITE_ID}/env/${envVar.key}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${NETLIFY_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(envVar)
      })
      
      if (updateResponse.ok) {
        console.log(`✅ ${envVar.key}: Mis à jour`)
      } else {
        console.log(`❌ ${envVar.key}: Erreur ${updateResponse.status}`)
      }
    }
    
    // 3. Déclencher un nouveau build
    console.log('\n🚀 Déclenchement d\'un nouveau build...')
    
    const buildResponse = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/builds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NETLIFY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clear_cache: true
      })
    })
    
    if (buildResponse.ok) {
      const buildData = await buildResponse.json()
      console.log('✅ Nouveau build déclenché:', buildData.id)
      console.log('🔗 URL build:', buildData.url)
    } else {
      console.log('❌ Erreur déclenchement build:', buildResponse.status)
    }
    
    console.log('\n🎉 Correction terminée!')
    console.log('⏳ Attendez 2-3 minutes que le build se termine')
    console.log('🌐 Puis testez: https://optima.dev-swiss.ch')
    
  } catch (error) {
    console.error('💥 Erreur:', error.message)
    
    // Plan B: Afficher les instructions manuelles
    console.log('\n📋 PLAN B - Configuration manuelle:')
    console.log('1. Allez sur https://app.netlify.com/sites/optimav1/settings/env')
    console.log('2. Modifiez ces variables:')
    console.log(`   VITE_SUPABASE_URL = ${CORRECT_SUPABASE_URL}`)
    console.log(`   VITE_SUPABASE_ANON_KEY = ${CORRECT_SUPABASE_ANON_KEY}`)
    console.log('3. Sauvegardez et redéployez')
  }
}

// Alternative: API Sites
async function fixViaSites() {
  console.log('🔄 Tentative via API Sites...')
  
  try {
    const response = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NETLIFY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        build_settings: {
          env: {
            'VITE_SUPABASE_URL': CORRECT_SUPABASE_URL,
            'VITE_SUPABASE_ANON_KEY': CORRECT_SUPABASE_ANON_KEY
          }
        }
      })
    })
    
    if (response.ok) {
      console.log('✅ Variables mises à jour via Sites API')
      return true
    } else {
      console.log('❌ Erreur Sites API:', response.status)
      return false
    }
  } catch (error) {
    console.log('❌ Exception Sites API:', error.message)
    return false
  }
}

fixNetlifyEnv()
  .then(() => {
    console.log('\n✅ Script terminé')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Erreur fatale:', error)
    process.exit(1)
  })