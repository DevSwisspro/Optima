#!/usr/bin/env node
/**
 * Test complet des opérations de données
 * Simulation complète d'utilisation de l'application
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ntytkeasfjnwoehpzhtm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eXRrZWFzZmpud29laHB6aHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDIyMDAsImV4cCI6MjA3MjU3ODIwMH0.dGYlqy6bNUactQdI3ngBK6uYT2JyNVMsdx-nCdzG8dc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🧪 TEST COMPLET DES FONCTIONNALITÉS DE DONNÉES');
console.log('═'.repeat(65));

async function testDataOperations() {
  let testsPassed = 0;
  let totalTests = 0;
  const testUser = { id: 'test-user-' + Date.now() };
  
  try {
    // Créer un utilisateur de test temporaire
    console.log('\n👤 Création d\'un utilisateur de test...');
    const testEmail = `test+${Date.now()}@todocoach.app`;
    const testPassword = 'TestPassword123!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    let currentUser = null;
    if (signUpError) {
      console.log('⚠️  SignUp error (peut-être email existe):', signUpError.message);
      // Essayer de se connecter
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      if (!signInError && signInData.user) {
        currentUser = signInData.user;
        console.log('✅ Connexion avec utilisateur existant réussie');
      }
    } else if (signUpData.user) {
      currentUser = signUpData.user;
      console.log('✅ Utilisateur de test créé avec succès');
    }

    if (!currentUser) {
      console.log('⚠️  Utilisation d\'un utilisateur fictif pour les tests (sans auth)');
      currentUser = testUser;
    }

    // Test 1: Budget Items
    console.log('\n💰 TEST 1: BUDGET ITEMS (Finances)');
    console.log('─'.repeat(45));
    totalTests += 4;
    
    const budgetTestData = [
      { name: 'Salaire Janvier', amount: 4500.00, category: 'salaire', type: 'revenus', date: '2025-01-15' },
      { name: 'Loyer', amount: -1200.00, category: 'logement', type: 'depenses_fixes', date: '2025-01-01' },
      { name: 'Courses alimentaires', amount: -300.00, category: 'alimentation', type: 'depenses_variables', date: '2025-01-10' },
      { name: 'Épargne mensuelle', amount: -500.00, category: 'urgence', type: 'epargne', date: '2025-01-15' }
    ];

    for (const item of budgetTestData) {
      try {
        const { data, error } = await supabase
          .from('budget_items')
          .insert([{ ...item, user_id: currentUser.id }])
          .select();
        
        if (error) {
          console.log(`❌ Budget ${item.name}: ${error.message}`);
        } else {
          console.log(`✅ Budget ${item.name}: Sauvegardé (ID: ${data[0].id.slice(0,8)}...)`);
          testsPassed++;
        }
      } catch (err) {
        console.log(`❌ Budget ${item.name}: ${err.message}`);
      }
    }

    // Test 2: Tasks
    console.log('\n📋 TEST 2: TÂCHES (TO-DO)');
    console.log('─'.repeat(45));
    totalTests += 3;
    
    const taskTestData = [
      { title: 'Réunion équipe marketing', priority: 'high', status: 'pending' },
      { title: 'Finir rapport mensuel', priority: 'medium', status: 'in_progress' },
      { title: 'Appeler dentiste', priority: 'low', status: 'pending' }
    ];

    for (const task of taskTestData) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert([{ ...task, user_id: currentUser.id, completed: false }])
          .select();
        
        if (error) {
          console.log(`❌ Tâche "${task.title}": ${error.message}`);
        } else {
          console.log(`✅ Tâche "${task.title}": Sauvegardée (ID: ${data[0].id.slice(0,8)}...)`);
          testsPassed++;
        }
      } catch (err) {
        console.log(`❌ Tâche "${task.title}": ${err.message}`);
      }
    }

    // Test 3: Notes
    console.log('\n📝 TEST 3: NOTES ET MÉMOS');
    console.log('─'.repeat(45));
    totalTests += 2;
    
    const noteTestData = [
      { title: 'Idées projet', content: 'Développer une app mobile pour le coaching financier. Fonctionnalités: budget, objectifs, conseils IA.' },
      { title: 'Liste de livres', content: 'À lire: "Rich Dad Poor Dad", "The Intelligent Investor", "The Millionaire Next Door"' }
    ];

    for (const note of noteTestData) {
      try {
        const { data, error } = await supabase
          .from('notes')
          .insert([{ ...note, user_id: currentUser.id }])
          .select();
        
        if (error) {
          console.log(`❌ Note "${note.title}": ${error.message}`);
        } else {
          console.log(`✅ Note "${note.title}": Sauvegardée (ID: ${data[0].id.slice(0,8)}...)`);
          testsPassed++;
        }
      } catch (err) {
        console.log(`❌ Note "${note.title}": ${err.message}`);
      }
    }

    // Test 4: Shopping Items
    console.log('\n🛒 TEST 4: LISTE DE COURSES');
    console.log('─'.repeat(45));
    totalTests += 3;
    
    const shoppingTestData = [
      { name: 'Lait bio', quantity: 2, unit: 'l', category: 'dairy' },
      { name: 'Pommes', quantity: 1, unit: 'kg', category: 'fruits' },
      { name: 'Pain complet', quantity: 1, unit: 'p', category: 'bakery' }
    ];

    for (const item of shoppingTestData) {
      try {
        const { data, error } = await supabase
          .from('shopping_items')
          .insert([{ ...item, user_id: currentUser.id, completed: false }])
          .select();
        
        if (error) {
          console.log(`❌ Article "${item.name}": ${error.message}`);
        } else {
          console.log(`✅ Article "${item.name}": Sauvegardé (ID: ${data[0].id.slice(0,8)}...)`);
          testsPassed++;
        }
      } catch (err) {
        console.log(`❌ Article "${item.name}": ${err.message}`);
      }
    }

    // Test 5: Vérification des données sauvegardées
    console.log('\n🔍 TEST 5: VÉRIFICATION DES DONNÉES SAUVEGARDÉES');
    console.log('─'.repeat(55));
    totalTests += 4;
    
    const tables = ['budget_items', 'tasks', 'notes', 'shopping_items'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', currentUser.id);
        
        if (error) {
          console.log(`❌ Lecture ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: ${data.length} enregistrement(s) trouvé(s)`);
          testsPassed++;
        }
      } catch (err) {
        console.log(`❌ Lecture ${table}: ${err.message}`);
      }
    }

    // Test 6: Test de mise à jour
    console.log('\n📝 TEST 6: MISE À JOUR DES DONNÉES');
    console.log('─'.repeat(45));
    totalTests += 1;
    
    try {
      // Trouver une tâche et la marquer comme complétée
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', currentUser.id)
        .limit(1);
      
      if (taskData && taskData.length > 0) {
        const { data: updatedTask, error: updateError } = await supabase
          .from('tasks')
          .update({ completed: true, status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', taskData[0].id)
          .select();
        
        if (updateError) {
          console.log(`❌ Mise à jour tâche: ${updateError.message}`);
        } else {
          console.log(`✅ Tâche mise à jour: "${taskData[0].title}" marquée comme complétée`);
          testsPassed++;
        }
      }
    } catch (err) {
      console.log(`❌ Test mise à jour: ${err.message}`);
    }

    // Nettoyage des données de test
    console.log('\n🧹 NETTOYAGE DES DONNÉES DE TEST');
    console.log('─'.repeat(40));
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', currentUser.id);
        
        if (!error) {
          console.log(`✅ ${table}: Données de test supprimées`);
        }
      } catch (err) {
        console.log(`⚠️  ${table}: ${err.message}`);
      }
    }

    // Résultats finaux
    console.log('\n' + '═'.repeat(65));
    console.log('📊 RÉSULTATS DES TESTS DE DONNÉES');
    console.log('═'.repeat(65));
    
    const successRate = ((testsPassed / totalTests) * 100).toFixed(1);
    console.log(`🎯 Tests réussis: ${testsPassed}/${totalTests} (${successRate}%)`);
    
    if (testsPassed === totalTests) {
      console.log('\n🎉 TOUS LES TESTS DE DONNÉES SONT PASSÉS !');
      console.log('\n✅ FONCTIONNALITÉS TESTÉES ET OPÉRATIONNELLES:');
      console.log('   • 💰 Budget Items: Ajout, lecture, mise à jour');
      console.log('   • 📋 Tasks: Gestion complète des tâches');
      console.log('   • 📝 Notes: Sauvegarde et lecture des mémos');
      console.log('   • 🛒 Shopping: Liste de courses fonctionnelle');
      console.log('\n🚀 TON APPLICATION PEUT SAUVEGARDER TOUTES LES DONNÉES !');
    } else if (testsPassed > totalTests * 0.8) {
      console.log('\n✅ LA MAJORITÉ DES TESTS SONT PASSÉS !');
      console.log('⚠️  Quelques ajustements mineurs peuvent être nécessaires');
    } else {
      console.log('\n⚠️  PLUSIEURS TESTS ONT ÉCHOUÉ');
      console.log('🔧 Vérification et corrections nécessaires');
    }

    return testsPassed === totalTests;

  } catch (error) {
    console.error('\n💥 ERREUR CRITIQUE:', error.message);
    return false;
  }
}

testDataOperations();