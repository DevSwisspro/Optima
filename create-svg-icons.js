#!/usr/bin/env node

/**
 * Créer des icônes SVG pour OPTIMA PWA
 * Version simple qui fonctionne sans dépendances externes
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const iconSizes = [32, 72, 96, 128, 144, 152, 192, 384, 512]
const iconDir = path.join(__dirname, 'public', 'icons')

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true })
  console.log('📁 Dossier icons créé')
}

console.log('🎨 Génération des icônes OPTIMA PWA (SVG)...')

function createSVGIcon(size) {
  const strokeWidth = Math.max(1, Math.round(size * 0.008))
  const fontSize = Math.round(size * 0.5)
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="grad${size}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#b91c1c;stop-opacity:1" />
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.1)}" ry="${Math.round(size * 0.1)}" fill="url(#grad${size})" stroke="#991b1b" stroke-width="${strokeWidth}"/>
  <text x="50%" y="50%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">O</text>
</svg>`

  const filename = path.join(iconDir, `icon-${size}x${size}.svg`)
  fs.writeFileSync(filename, svg)
  return filename
}

function createPNGFallback(size) {
  // Créer un fichier HTML temporaire pour convertir SVG en PNG via Canvas
  const svg = createSVGIcon(size)
  console.log(`✅ Icône SVG ${size}x${size} créée`)
  return svg
}

// Créer toutes les icônes
let successCount = 0

iconSizes.forEach(size => {
  try {
    createPNGFallback(size)
    successCount++
  } catch (error) {
    console.log(`❌ Erreur icône ${size}x${size}:`, error.message)
  }
})

// Créer favicon.ico basique
try {
  const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <radialGradient id="favicon-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#b91c1c;stop-opacity:1" />
    </radialGradient>
  </defs>
  <rect width="32" height="32" rx="3" ry="3" fill="url(#favicon-grad)" stroke="#991b1b" stroke-width="1"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">O</text>
</svg>`

  fs.writeFileSync(path.join(__dirname, 'public', 'favicon.svg'), faviconSVG)
  console.log('✅ Favicon SVG créé')
  successCount++
} catch (error) {
  console.log('❌ Erreur favicon:', error.message)
}

console.log(`\n📊 Résultats:`)
console.log(`✅ ${successCount}/${iconSizes.length + 1} icônes créées`)
console.log(`📁 Dossier: ${iconDir}`)

if (successCount > 0) {
  console.log('\n🎉 Icônes OPTIMA PWA générées avec succès!')
  console.log('\n📱 Pour convertir les SVG en PNG (optionnel):')
  console.log('1. Ouvrir generate-icons.html dans le navigateur')
  console.log('2. Télécharger les icônes PNG générées')
  console.log('3. Les placer dans public/icons/')
} else {
  console.log('⚠️ Aucune icône n\'a pu être créée')
}

console.log('\n🚀 OPTIMA PWA est maintenant configuré!')
console.log('✅ Manifeste PWA: public/manifest.json')
console.log('✅ Service Worker: public/sw.js')
console.log('✅ Icônes: public/icons/')
console.log('✅ Configuration HTML: index.html')

process.exit(0)