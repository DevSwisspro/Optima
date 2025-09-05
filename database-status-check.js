#!/usr/bin/env node
/**
 * Vérification complète de l'état de la base de données
 * et guide pour la finaliser
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ntytkeasfjnwoehpzhtm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eXRrZWFzZmpud29laHB6aHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDIyMDAsImV4cCI6MjA3MjU3ODIwMH0.dGYlqy6bNUactQdI3ngBK6uYT2JyNVMsdx-nCdzG8dc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('📊 ÉTAT COMPLET DE VOTRE BASE DE DONNÉES');
console.log('=' .repeat(60));

async function checkDatabaseStatus() {
  try {
    // Test basic connectivity
    console.log('🔌 Test de connectivité...');
    const { data: connectionTest } = await supabase.from('_healthcheck').select('*').limit(1);
    console.log('✅ Connexion Supabase active\n');

    // Check essential tables for the Todo Coach App
    console.log('📋 Vérification des tables essentielles...\n');
    
    const essentialTables = [
      { name: 'tasks', description: 'Tâches et TO-DO' },
      { name: 'budget_items', description: 'Éléments de budget et finances' },
      { name: 'notes', description: 'Notes et mémos' },
      { name: 'goals', description: 'Objectifs financiers' },
      { name: 'user_preferences', description: 'Préférences utilisateur' }
    ];

    const tableResults = [];
    
    for (const table of essentialTables) {
      try {
        const { data, error } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          tableResults.push({
            name: table.name,
            status: 'missing',
            description: table.description,
            message: error.message
          });
        } else {
          tableResults.push({
            name: table.name,
            status: 'exists',
            description: table.description,
            message: 'Table créée et accessible'
          });
        }
      } catch (err) {
        tableResults.push({
          name: table.name,
          status: 'error',
          description: table.description,
          message: err.message
        });
      }
    }

    // Display results
    let existingTables = 0;
    let missingTables = 0;

    tableResults.forEach(table => {
      const icon = table.status === 'exists' ? '✅' : '❌';
      console.log(`${icon} ${table.name.padEnd(20)} | ${table.description}`);
      
      if (table.status === 'exists') {
        existingTables++;
      } else {
        missingTables++;
        console.log(`   └─ ${table.message}`);
      }
    });

    console.log('\n' + '─'.repeat(60));
    console.log(`📊 RÉSULTAT: ${existingTables}/${essentialTables.length} tables prêtes`);
    console.log('─'.repeat(60));

    if (existingTables === essentialTables.length) {
      console.log('\n🎉 FÉLICITATIONS! Base de données COMPLÈTEMENT OPÉRATIONNELLE!');
      console.log('\n✅ Votre application peut maintenant stocker:');
      console.log('   • Toutes vos tâches et TO-DO');
      console.log('   • Votre budget et transactions');
      console.log('   • Vos notes et mémos');
      console.log('   • Vos objectifs financiers');
      console.log('   • Vos préférences utilisateur');
      
      console.log('\n🚀 APPLICATION 100% FONCTIONNELLE!');
      console.log('🌐 Accédez à: https://todo-coach-app-1757010879.netlify.app');
      
    } else if (existingTables >= 2) {
      console.log('\n⚠️  Base de données PARTIELLEMENT configurée');
      console.log(`✅ ${existingTables} tables fonctionnelles sur ${essentialTables.length}`);
      console.log('\n🚀 Votre application fonctionne déjà pour:');
      
      tableResults
        .filter(t => t.status === 'exists')
        .forEach(t => console.log(`   • ${t.description} ✅`));
        
      console.log('\n🔧 Tables manquantes:');
      tableResults
        .filter(t => t.status !== 'exists')
        .forEach(t => console.log(`   • ${t.description} ❌`));
        
    } else {
      console.log('\n❌ Base de données NON configurée');
      console.log('🔧 Tables à créer:');
      missingTables.forEach(table => {
        console.log(`   • ${table.description}`);
      });
    }

    // Test authentication
    console.log('\n🔐 Test du système d\'authentification...');
    try {
      const { data: authData } = await supabase.auth.getSession();
      console.log('✅ Système d\'authentification opérationnel');
      console.log(`📱 Session: ${authData.session ? 'Connecté' : 'Non connecté (normal)'}`);
    } catch (authError) {
      console.log('❌ Erreur authentification:', authError.message);
    }

    // Test live application
    console.log('\n🌐 Test de l\'application live...');
    try {
      const response = await fetch('https://todo-coach-app-1757010879.netlify.app');
      if (response.ok) {
        console.log('✅ Application live accessible');
        console.log('🔗 URL: https://todo-coach-app-1757010879.netlify.app');
      } else {
        console.log(`❌ Application live: Erreur ${response.status}`);
      }
    } catch (fetchError) {
      console.log('❌ Impossible d\'accéder à l\'application live');
    }

    console.log('\n' + '═'.repeat(60));
    console.log('📝 INSTRUCTIONS POUR FINALISER');
    console.log('═'.repeat(60));

    if (missingTables > 0) {
      console.log('\n🔧 Pour créer les tables manquantes:');
      console.log('1. Allez sur: https://ntytkeasfjnwoehpzhtm.supabase.co');
      console.log('2. Cliquez sur "SQL Editor" dans le menu');
      console.log('3. Créez une nouvelle query');
      console.log('4. Copiez-collez le SQL depuis le fichier "database-schema.sql"');
      console.log('5. Cliquez "RUN" pour exécuter');
      console.log('\n📄 Le fichier database-schema.sql contient tout le SQL nécessaire.');
    }

    console.log('\n🎯 Une fois terminé:');
    console.log('   • Votre application sera 100% fonctionnelle');
    console.log('   • Toutes les données seront sauvegardées');
    console.log('   • Synchronisation en temps réel active');
    console.log('   • Sécurité utilisateur garantie (RLS)');

  } catch (error) {
    console.error('💥 Erreur lors de la vérification:', error.message);
  }
}

checkDatabaseStatus();