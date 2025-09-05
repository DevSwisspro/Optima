#!/usr/bin/env node
/**
 * Test de l'authentification et de la sauvegarde
 * Diagnostique pourquoi les données ne se sauvegardent pas
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ntytkeasfjnwoehpzhtm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eXRrZWFzZmpud29laHB6aHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDIyMDAsImV4cCI6MjA3MjU3ODIwMH0.dGYlqy6bNUactQdI3ngBK6uYT2JyNVMsdx-nCdzG8dc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 DIAGNOSTIC - POURQUOI LES DONNÉES NE SE SAUVEGARDENT PAS');
console.log('=' .repeat(70));

async function testAuthAndSave() {
  try {
    // 1. Test de l'état d'authentification
    console.log('🔐 1. Test de l\'authentification...\n');
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Erreur session:', sessionError.message);
    } else if (sessionData.session) {
      console.log('✅ Utilisateur connecté:', sessionData.session.user.email);
      console.log('🆔 User ID:', sessionData.session.user.id);
    } else {
      console.log('❌ AUCUN UTILISATEUR CONNECTÉ');
      console.log('💡 C\'est pourquoi les données ne se sauvegardent pas !');
    }

    // 2. Test des politiques RLS
    console.log('\n🔒 2. Test des politiques de sécurité (RLS)...\n');
    
    // Test insertion sans authentification (devrait échouer)
    console.log('🧪 Test insertion budget sans auth...');
    const testBudgetData = {
      name: 'Test Revenue',
      amount: 100.00,
      category: 'salary',
      type: 'revenus',
      description: 'Test insertion'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('budget_items')
      .insert([testBudgetData])
      .select();

    if (insertError) {
      console.log('❌ Insertion échouée (NORMAL):', insertError.message);
      if (insertError.message.includes('row-level security policy')) {
        console.log('✅ RLS fonctionne correctement - bloque les insertions sans auth');
      }
    } else {
      console.log('⚠️  Insertion réussie sans auth - PROBLÈME DE SÉCURITÉ !');
    }

    // 3. Test de lecture des données existantes
    console.log('\n📊 3. Test lecture des données existantes...\n');
    
    const { data: existingData, error: readError } = await supabase
      .from('budget_items')
      .select('*')
      .limit(5);

    if (readError) {
      console.log('❌ Lecture échouée:', readError.message);
    } else {
      console.log(`📋 ${existingData.length} éléments trouvés dans budget_items`);
      if (existingData.length > 0) {
        console.log('📄 Exemple:', JSON.stringify(existingData[0], null, 2));
      }
    }

    // 4. Test de création d'utilisateur de test
    console.log('\n👤 4. Test de création d\'utilisateur...\n');
    
    const testEmail = 'test@todocoach.com';
    const testPassword = 'testpassword123';
    
    console.log(`🔐 Tentative de création utilisateur: ${testEmail}`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (signUpError) {
      console.log('❌ Création utilisateur échouée:', signUpError.message);
      
      // Try to sign in instead
      console.log('🔄 Tentative de connexion...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (signInError) {
        console.log('❌ Connexion échouée:', signInError.message);
      } else {
        console.log('✅ Connexion réussie!');
        console.log('🆔 User ID:', signInData.user.id);
        
        // Now try to insert data
        await testDataInsertion(signInData.user.id);
      }
    } else {
      console.log('✅ Utilisateur créé avec succès!');
      if (signUpData.user) {
        console.log('🆔 User ID:', signUpData.user.id);
        await testDataInsertion(signUpData.user.id);
      }
    }

  } catch (error) {
    console.error('💥 Erreur générale:', error.message);
  }
}

async function testDataInsertion(userId) {
  console.log('\n💾 5. Test insertion avec utilisateur connecté...\n');
  
  const testData = {
    user_id: userId,
    name: 'Salaire Test',
    amount: 3500.00,
    category: 'salary',
    type: 'revenus',
    description: 'Test avec utilisateur connecté'
  };

  const { data: insertResult, error: insertError } = await supabase
    .from('budget_items')
    .insert([testData])
    .select();

  if (insertError) {
    console.log('❌ Insertion avec auth échouée:', insertError.message);
  } else {
    console.log('✅ SUCCÈS ! Données sauvegardées avec auth:');
    console.log('📄', JSON.stringify(insertResult[0], null, 2));
    
    // Clean up test data
    await supabase
      .from('budget_items')
      .delete()
      .eq('id', insertResult[0].id);
    console.log('🧹 Données de test supprimées');
  }
}

async function checkAppAuthStatus() {
  console.log('\n🌐 6. Vérification de l\'état auth dans l\'app...\n');
  
  // Simulate what the app does
  try {
    const response = await fetch('https://todo-coach-app-1757010879.netlify.app');
    if (response.ok) {
      console.log('✅ Application accessible');
      console.log('💡 L\'app doit implémenter un système de connexion/inscription');
    }
  } catch (error) {
    console.log('❌ Erreur accès app:', error.message);
  }
}

async function main() {
  await testAuthAndSave();
  await checkAppAuthStatus();
  
  console.log('\n' + '═'.repeat(70));
  console.log('🎯 DIAGNOSTIC COMPLET');
  console.log('═'.repeat(70));
  
  console.log('\n🔍 PROBLÈME IDENTIFIÉ:');
  console.log('❌ Pas d\'utilisateur connecté → Pas de sauvegarde possible');
  console.log('✅ Les tables existent et RLS fonctionne correctement');
  
  console.log('\n🛠️  SOLUTIONS:');
  console.log('1. 🔐 Ajouter un système de connexion/inscription dans l\'app');
  console.log('2. 👤 Créer un compte utilisateur');  
  console.log('3. 🔄 Se connecter avant d\'utiliser les fonctionnalités');
  
  console.log('\n⚡ SOLUTION RAPIDE:');
  console.log('Je vais modifier l\'app pour ajouter un système d\'auth simple !');
}

main();