#!/usr/bin/env node
/**
 * Debug avancé pour comprendre pourquoi les tables n'apparaissent pas 
 * dans le dashboard Supabase
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ntytkeasfjnwoehpzhtm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eXRrZWFzZmpud29laHB6aHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDIyMDAsImV4cCI6MjA3MjU3ODIwMH0.dGYlqy6bNUactQdI3ngBK6uYT2JyNVMsdx-nCdzG8dc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 DIAGNOSTIC AVANCÉ DES TABLES SUPABASE');
console.log('=' .repeat(60));
console.log('URL:', SUPABASE_URL);
console.log('Dashboard: https://ntytkeasfjnwoehpzhtm.supabase.co\n');

async function debugTables() {
  try {
    // 1. Test de base - est-ce que l'API répond ?
    console.log('🔌 1. Test de connectivité de base...');
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      console.log(`✅ API REST accessible (${response.status})`);
    } catch (error) {
      console.log('❌ API REST inaccessible:', error.message);
    }

    // 2. Test direct des tables via différentes méthodes
    console.log('\n📋 2. Test direct des tables...\n');
    
    const tablesToTest = ['tasks', 'budget_items', 'notes', 'goals'];
    
    for (const tableName of tablesToTest) {
      console.log(`🔍 Test de la table "${tableName}":`);
      
      // Method 1: Supabase client
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' });
        
        if (error) {
          console.log(`  📊 Client Supabase: ❌ ${error.message}`);
          console.log(`  🔍 Code erreur: ${error.code}`);
          console.log(`  📝 Détails: ${error.details || 'N/A'}`);
        } else {
          console.log(`  📊 Client Supabase: ✅ Table accessible, ${count || 0} rows`);
        }
      } catch (clientError) {
        console.log(`  📊 Client Supabase: ❌ Exception: ${clientError.message}`);
      }

      // Method 2: Direct REST API
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=count`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'count=exact'
          }
        });
        
        if (response.ok) {
          const countHeader = response.headers.get('content-range');
          console.log(`  🌐 REST API: ✅ Table accessible, count: ${countHeader || 'unknown'}`);
        } else {
          const errorText = await response.text();
          console.log(`  🌐 REST API: ❌ ${response.status} - ${errorText}`);
        }
      } catch (fetchError) {
        console.log(`  🌐 REST API: ❌ ${fetchError.message}`);
      }
      
      console.log(''); // Ligne vide
    }

    // 3. Vérifier si les tables sont dans le schéma public
    console.log('🗂️  3. Vérification du schéma des tables...\n');
    
    try {
      // Cette requête spéciale permet de voir les métadonnées des tables
      const { data, error } = await supabase.rpc('get_schema_tables');
      
      if (error) {
        console.log('❌ Impossible de récupérer le schéma:', error.message);
      } else {
        console.log('✅ Schéma récupéré:', data);
      }
    } catch (schemaError) {
      console.log('❌ Erreur schéma:', schemaError.message);
    }

    // 4. Test avec une insertion pour voir si les tables sont vraiment utilisables
    console.log('🧪 4. Test d\'insertion (sera annulée)...\n');
    
    try {
      // Test d'insertion dans la table budget_items
      const testData = {
        name: 'Test Budget Item',
        amount: 10.00,
        category: 'test',
        type: 'expense',
        description: 'Test insertion'
      };

      const { data, error } = await supabase
        .from('budget_items')
        .insert([testData])
        .select();

      if (error) {
        console.log('📊 Test insertion budget_items:', error.message);
        console.log('🔍 Cela peut révéler pourquoi les tables n\'apparaissent pas');
        
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log('💡 DIAGNOSTIC: Les tables n\'existent pas vraiment dans la base!');
        } else if (error.message.includes('RLS')) {
          console.log('💡 DIAGNOSTIC: Tables existent mais RLS bloque (normal sans auth)');
        } else if (error.message.includes('user_id')) {
          console.log('💡 DIAGNOSTIC: Tables existent, problème de contrainte user_id');
        }
      } else {
        console.log('✅ Insertion réussie - les tables fonctionnent!');
        // Nettoyer le test
        if (data && data[0]) {
          await supabase.from('budget_items').delete().eq('id', data[0].id);
          console.log('🧹 Test data supprimée');
        }
      }
    } catch (insertError) {
      console.log('❌ Erreur test insertion:', insertError.message);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('🎯 DIAGNOSTIC COMPLET');
    console.log('═'.repeat(60));
    
    console.log('\n🔍 Si tu ne vois pas les tables dans ton dashboard Supabase:');
    console.log('1. Va sur: https://ntytkeasfjnwoehpzhtm.supabase.co');
    console.log('2. Clique sur "Table Editor" dans le menu de gauche');
    console.log('3. Vérifie que tu es bien dans le schéma "public"');
    console.log('4. Si aucune table n\'apparaît, elles n\'ont pas été créées correctement');
    
    console.log('\n🛠️  Solution si les tables n\'existent pas:');
    console.log('1. Va dans "SQL Editor" sur ton dashboard');
    console.log('2. Crée une nouvelle query'); 
    console.log('3. Copie le contenu du fichier "database-schema.sql"');
    console.log('4. Exécute la query avec le bouton "RUN"');

  } catch (error) {
    console.error('💥 Erreur diagnostique:', error);
  }
}

debugTables();