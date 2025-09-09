#!/usr/bin/env node

/**
 * Créer des icônes basiques pour OPTIMA PWA
 * Version simple avec Canvas pour générer les icônes manquantes
 */

import { createCanvas } from 'canvas'
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
}

console.log('🎨 Génération des icônes OPTIMA PWA...')

function generateIcon(size) {
  try {
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d')

    // Arrière-plan dégradé
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
    gradient.addColorStop(0, '#dc2626') // Rouge principal
    gradient.addColorStop(1, '#b91c1c') // Rouge plus foncé
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    // Texte centré "O"
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${size * 0.6}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('O', size/2, size/2)

    // Ajouter une bordure subtile
    ctx.strokeStyle = '#991b1b'
    ctx.lineWidth = Math.max(1, size * 0.008)
    ctx.strokeRect(0, 0, size, size)

    // Sauvegarder l'icône
    const buffer = canvas.toBuffer('image/png')
    const filename = path.join(iconDir, `icon-${size}x${size}.png`)
    fs.writeFileSync(filename, buffer)
    
    console.log(`✅ Icône ${size}x${size} créée`)
    return true
  } catch (error) {
    console.log(`❌ Erreur icône ${size}x${size}:`, error.message)
    return false
  }
}

async function generateAllIcons() {
  let successCount = 0
  
  for (const size of iconSizes) {
    if (generateIcon(size)) {
      successCount++
    }
    
    // Petit délai pour éviter la surcharge
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`\n📊 Résultats:`)
  console.log(`✅ ${successCount}/${iconSizes.length} icônes créées`)
  
  if (successCount === iconSizes.length) {
    console.log('🎉 Toutes les icônes PWA ont été générées avec succès!')
    console.log(`📁 Dossier: ${iconDir}`)
  } else {
    console.log('⚠️ Certaines icônes n\'ont pas pu être créées')
  }
  
  return successCount === iconSizes.length
}

// Si canvas n'est pas disponible, créer des icônes SVG alternatives
function generateSVGIcons() {
  console.log('🎨 Génération d\'icônes SVG alternatives...')
  
  iconSizes.forEach(size => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <defs>
          <radialGradient id="grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#b91c1c;stop-opacity:1" />
          </radialGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#grad)" stroke="#991b1b" stroke-width="${Math.max(1, size * 0.008)}"/>
        <text x="50%" y="50%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" 
              font-size="${size * 0.6}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">O</text>
      </svg>
    `
    
    const filename = path.join(iconDir, `icon-${size}x${size}.svg`)
    fs.writeFileSync(filename, svg.trim())
    console.log(`✅ Icône SVG ${size}x${size} créée`)
  })
  
  console.log('🎉 Icônes SVG créées avec succès!')
}

// Essayer avec Canvas d'abord, sinon SVG
generateAllIcons()
  .then(success => {
    if (!success) {
      console.log('🔄 Tentative avec icônes SVG...')
      generateSVGIcons()
    }
  })
  .catch(error => {
    console.log('💥 Erreur Canvas, génération SVG...')
    generateSVGIcons()
  })