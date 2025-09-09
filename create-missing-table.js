#!/usr/bin/env node

/**
 * Créer la table user_preferences manquante via Management API
 */

const SUPABASE_TOKEN = 'sbp_5721d3c11bac3cbe2a2eaeafcdfc9e93423067ab'
const PROJECT_REF = 'tuxqlybmtjmlyadbtneb'

async function createUserPreferencesTable() {
  console.log('🚀 Création de la table user_preferences via Management API...')
  
  try {
    // Create the table via Management API
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/tables`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'user_preferences',
        schema: 'public',
        comment: 'User preferences and settings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            is_primary_key: true,
            default: 'gen_random_uuid()',
            is_nullable: false
          },
          {
            name: 'user_id',
            type: 'uuid',
            is_nullable: false,
            is_foreign_key: true,
            foreign_key_relation: {
              schema: 'auth',
              table: 'users',
              column: 'id'
            }
          },
          {
            name: 'theme',
            type: 'text',
            default: "'dark'",
            is_nullable: true
          },
          {
            name: 'language',
            type: 'text',
            default: "'fr'",
            is_nullable: true
          },
          {
            name: 'notifications',
            type: 'boolean',
            default: 'true',
            is_nullable: true
          },
          {
            name: 'budget_limits',
            type: 'jsonb',
            default: "'{}'",
            is_nullable: true
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: "timezone('utc'::text, now())",
            is_nullable: false
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: "timezone('utc'::text, now())",
            is_nullable: false
          }
        ],
        rls_enabled: true,
        replica_identity: 'DEFAULT'
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Table user_preferences créée avec succès!')
      console.log('📊 Résultat:', result)
      
      // Enable RLS and create policies
      await createRLSPolicies()
      
      return true
    } else {
      const error = await response.text()
      console.log('❌ Erreur création table:', error)
      
      if (error.includes('already exists')) {
        console.log('⚠️ Table existe déjà, passage aux politiques...')
        await createRLSPolicies()
        return true
      }
      
      return false
    }
    
  } catch (error) {
    console.error('💥 Erreur:', error.message)
    return false
  }
}

async function createRLSPolicies() {
  console.log('🔒 Création des politiques RLS...')
  
  const policies = [
    {
      name: 'Users can view their own preferences',
      table: 'user_preferences',
      action: 'SELECT',
      using: 'auth.uid() = user_id'
    },
    {
      name: 'Users can insert their own preferences',
      table: 'user_preferences',
      action: 'INSERT',
      with_check: 'auth.uid() = user_id'
    },
    {
      name: 'Users can update their own preferences',
      table: 'user_preferences',
      action: 'UPDATE',
      using: 'auth.uid() = user_id'
    },
    {
      name: 'Users can delete their own preferences',
      table: 'user_preferences',
      action: 'DELETE',
      using: 'auth.uid() = user_id'
    }
  ]

  for (const policy of policies) {
    try {
      const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/policies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          schema: 'public',
          table: policy.table,
          name: policy.name,
          action: policy.action,
          using: policy.using,
          with_check: policy.with_check
        })
      })

      if (response.ok) {
        console.log(`✅ Politique "${policy.name}" créée`)
      } else {
        const error = await response.text()
        if (error.includes('already exists')) {
          console.log(`⚠️ Politique "${policy.name}" existe déjà`)
        } else {
          console.log(`❌ Erreur politique "${policy.name}": ${error}`)
        }
      }
    } catch (err) {
      console.log(`❌ Exception politique "${policy.name}": ${err.message}`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
  }
}

createUserPreferencesTable()
  .then(success => {
    console.log(success ? '🎉 Configuration user_preferences terminée!' : '⚠️ Problèmes de configuration')
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Erreur fatale:', error)
    process.exit(1)
  })