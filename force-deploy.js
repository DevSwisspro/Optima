#!/usr/bin/env node
/**
 * Script de déploiement forcé pour Netlify
 * Contourne les problèmes de build local
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

console.log('🚀 DÉPLOIEMENT FORCÉ NETLIFY');
console.log('═'.repeat(40));

async function forceDeploy() {
  try {
    // Vérifier si dist existe
    if (fs.existsSync('dist')) {
      console.log('📁 Dossier dist trouvé');
      
      try {
        // Essayer le déploiement direct
        console.log('🚀 Tentative de déploiement direct...');
        const { stdout, stderr } = await execAsync('netlify deploy --prod --dir=dist --skip-functions-cache', {
          timeout: 120000 // 2 minutes
        });
        
        console.log('✅ Déploiement réussi !');
        console.log(stdout);
        
        if (stderr && !stderr.includes('warn')) {
          console.log('⚠️  Warnings:', stderr);
        }
        
        return true;
        
      } catch (deployError) {
        console.log('❌ Déploiement direct échoué:', deployError.message);
      }
    }
    
    // Méthode alternative : forcer via API
    console.log('\n🔄 Méthode alternative : Hook de déploiement...');
    
    try {
      // Utiliser les hooks de déploiement Netlify
      const hookResponse = await fetch('https://api.netlify.com/build_hooks/675b03c2b68c7c8e1c6e0d2f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trigger_branch: 'main',
          trigger_title: 'Force deploy via API'
        })
      });
      
      if (hookResponse.ok) {
        console.log('✅ Hook de déploiement déclenché !');
        console.log('⏳ Netlify va rebuilder automatiquement depuis GitHub...');
        return true;
      } else {
        console.log('❌ Hook échoué:', hookResponse.status);
      }
    } catch (hookError) {
      console.log('❌ Erreur hook:', hookError.message);
    }
    
    // Méthode finale : commit vide pour déclencher auto-deploy
    console.log('\n🔄 Méthode finale : Auto-deploy via commit...');
    
    try {
      const timestamp = new Date().toISOString();
      await execAsync(`git commit --allow-empty -m "🚀 Auto-deploy ${timestamp}"`);
      await execAsync('git push');
      
      console.log('✅ Commit vide pushé - déploiement automatique déclenché !');
      console.log('⏳ Attendre 1-2 minutes pour que Netlify rebuilde...');
      return true;
      
    } catch (gitError) {
      console.log('❌ Erreur git:', gitError.message);
    }
    
    return false;
    
  } catch (error) {
    console.error('💥 Erreur générale:', error.message);
    return false;
  }
}

async function checkDeployment() {
  console.log('\n🔍 Vérification du déploiement...');
  
  try {
    const response = await fetch('https://todo-coach-app-1757010879.netlify.app', {
      method: 'HEAD',
      cache: 'no-cache'
    });
    
    if (response.ok) {
      const lastModified = response.headers.get('last-modified');
      const now = new Date();
      const deployTime = lastModified ? new Date(lastModified) : null;
      
      console.log('✅ Application accessible');
      console.log(`🕐 Dernière modification: ${lastModified || 'Inconnue'}`);
      
      if (deployTime && (now - deployTime) < 10 * 60 * 1000) { // moins de 10 minutes
        console.log('🎉 Déploiement récent détecté !');
        return true;
      } else {
        console.log('⚠️  Déploiement semble ancien');
        return false;
      }
    } else {
      console.log('❌ Application inaccessible');
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur vérification:', error.message);
    return false;
  }
}

async function main() {
  const deployed = await forceDeploy();
  
  if (deployed) {
    console.log('\n⏳ Attente du déploiement (60 secondes)...');
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    const verified = await checkDeployment();
    
    console.log('\n' + '═'.repeat(50));
    console.log('📊 RÉSULTAT FINAL');
    console.log('═'.repeat(50));
    
    if (verified) {
      console.log('🎉 DÉPLOIEMENT RÉUSSI !');
      console.log('🔗 Application mise à jour : https://todo-coach-app-1757010879.netlify.app');
    } else {
      console.log('⚠️  Déploiement en cours...');
      console.log('🔗 Vérifier dans 2-3 minutes : https://todo-coach-app-1757010879.netlify.app');
    }
  } else {
    console.log('\n❌ Tous les déploiements ont échoué');
    console.log('🔧 Vérification manuelle nécessaire sur Netlify dashboard');
  }
}

main();