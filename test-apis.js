// Script de test pour les APIs externes
// Exécuter avec : node test-apis.js

const TMDB_API_KEY = 'your_tmdb_key_here'; // Remplacez par votre vraie clé
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Test TMDB
async function testTMDB() {
  console.log('🎬 Test TMDB API...');

  if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_key_here') {
    console.log('❌ TMDB API Key manquante');
    return;
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=inception&language=fr-FR`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      console.log('✅ TMDB fonctionne !');
      console.log(`   Trouvé: ${data.results[0].title} (${data.results[0].release_date})`);
    } else {
      console.log('❌ TMDB ne retourne pas de résultats');
    }
  } catch (error) {
    console.log('❌ Erreur TMDB:', error.message);
  }
}

// Test AniList
async function testAniList() {
  console.log('🎌 Test AniList API...');

  const query = `
    query ($search: String) {
      Page(page: 1, perPage: 1) {
        media(search: $search, type: ANIME) {
          id
          title {
            romaji
            english
          }
          startDate {
            year
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: { search: 'naruto' }
      })
    });

    const data = await response.json();

    if (data.data?.Page?.media?.[0]) {
      console.log('✅ AniList fonctionne !');
      const anime = data.data.Page.media[0];
      console.log(`   Trouvé: ${anime.title.romaji} (${anime.startDate?.year})`);
    } else {
      console.log('❌ AniList ne retourne pas de résultats');
    }
  } catch (error) {
    console.log('❌ Erreur AniList:', error.message);
  }
}

// Test des deux APIs
async function runTests() {
  console.log('🚀 Test des APIs externes pour Optima\n');

  await testTMDB();
  console.log('');
  await testAniList();

  console.log('\n📋 Instructions:');
  console.log('1. Si TMDB ❌: Vérifiez votre clé API dans ce fichier');
  console.log('2. Si AniList ❌: Vérifiez votre connexion internet');
  console.log('3. Si tout ✅: Les APIs sont prêtes pour Netlify !');
}

runTests();