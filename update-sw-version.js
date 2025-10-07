// Script pour incrémenter automatiquement la version du Service Worker
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const SW_PATH = join(process.cwd(), 'public', 'sw.js');

try {
  let swContent = readFileSync(SW_PATH, 'utf8');

  // Générer une version basée sur le timestamp
  const version = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

  // Remplacer les versions dans le Service Worker
  swContent = swContent.replace(
    /const CACHE_NAME = ['"]optima-v[\d.-]+['"]/,
    `const CACHE_NAME = 'optima-v${version}'`
  );
  swContent = swContent.replace(
    /const STATIC_CACHE = ['"]optima-static-v[\d.-]+['"]/,
    `const STATIC_CACHE = 'optima-static-v${version}'`
  );
  swContent = swContent.replace(
    /const DYNAMIC_CACHE = ['"]optima-dynamic-v[\d.-]+['"]/,
    `const DYNAMIC_CACHE = 'optima-dynamic-v${version}'`
  );

  writeFileSync(SW_PATH, swContent, 'utf8');
  console.log(`✅ Service Worker version mise à jour : v${version}`);
} catch (error) {
  console.error('❌ Erreur lors de la mise à jour du Service Worker:', error);
  process.exit(1);
}
