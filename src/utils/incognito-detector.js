/**
 * OPTIMA - Détection du mode incognito et gestion des erreurs
 * Améliore l'expérience utilisateur en mode navigation privée
 */

// Détecter le mode incognito
export async function detectIncognito() {
  return new Promise((resolve) => {
    // Test 1: FileSystem API
    const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
    if (fs) {
      fs(window.TEMPORARY, 100, 
        () => resolve({ isIncognito: false, method: 'filesystem' }),
        () => resolve({ isIncognito: true, method: 'filesystem' })
      );
      return;
    }

    // Test 2: IndexedDB
    try {
      const openDB = indexedDB.open('test-incognito');
      openDB.onerror = () => resolve({ isIncognito: true, method: 'indexeddb' });
      openDB.onsuccess = () => {
        indexedDB.deleteDatabase('test-incognito');
        resolve({ isIncognito: false, method: 'indexeddb' });
      };
    } catch (e) {
      // Test 3: LocalStorage quota
      try {
        localStorage.setItem('test-incognito', 'test');
        localStorage.removeItem('test-incognito');
        resolve({ isIncognito: false, method: 'localstorage' });
      } catch (err) {
        resolve({ isIncognito: true, method: 'localstorage' });
      }
    }

    // Fallback
    setTimeout(() => resolve({ isIncognito: 'unknown', method: 'fallback' }), 100);
  });
}

// Améliorer les erreurs Supabase pour mode incognito
export function enhanceSupabaseError(error, isIncognito = false) {
  if (!error) return null;

  const originalMessage = error.message || '';
  
  // Erreurs réseau communes en mode incognito
  const networkErrors = [
    'Failed to fetch',
    'NetworkError',
    'TypeError: Failed to fetch',
    'Load failed',
    'CORS error'
  ];

  const isNetworkError = networkErrors.some(netErr => 
    originalMessage.includes(netErr)
  );

  if (isNetworkError) {
    return {
      ...error,
      message: isIncognito 
        ? '🕵️ Mode incognito détecté !\n\nLe mode navigation privée bloque certaines fonctionnalités.\n\n✅ Solutions :\n• Utilisez le mode normal\n• Autorisez les cookies tiers\n• Désactivez temporairement les bloqueurs'
        : '🌐 Problème de connexion\n\nVérifiez votre connexion internet ou réessayez dans quelques instants.',
      incognitoDetected: isIncognito,
      originalError: originalMessage
    };
  }

  // Autres erreurs Supabase
  const errorMappings = {
    'Invalid login credentials': '❌ Email ou mot de passe incorrect',
    'Email not confirmed': '📧 Confirmez votre email avant de vous connecter',
    'User already registered': '👤 Ce compte existe déjà. Essayez de vous connecter.',
    'Password should be at least 6 characters': '🔑 Le mot de passe doit contenir au moins 6 caractères',
    'Email address is invalid': '📧 Adresse email non valide',
    'Password is too weak': '🔑 Mot de passe trop faible. Ajoutez des chiffres ou symboles.',
  };

  for (const [key, message] of Object.entries(errorMappings)) {
    if (originalMessage.includes(key)) {
      return {
        ...error,
        message,
        originalError: originalMessage
      };
    }
  }

  return error;
}

// Créer un client Supabase avec retry automatique
export function createRobustSupabaseClient(supabase) {
  return {
    ...supabase,
    auth: {
      ...supabase.auth,
      signUp: async (credentials) => {
        try {
          return await supabase.auth.signUp(credentials);
        } catch (error) {
          const incognitoInfo = await detectIncognito();
          throw enhanceSupabaseError(error, incognitoInfo.isIncognito);
        }
      },
      signInWithPassword: async (credentials) => {
        try {
          return await supabase.auth.signInWithPassword(credentials);
        } catch (error) {
          const incognitoInfo = await detectIncognito();
          throw enhanceSupabaseError(error, incognitoInfo.isIncognito);
        }
      }
    }
  };
}

// Notification d'aide pour mode incognito
export function showIncognitoHelp() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('OPTIMA - Mode Incognito Détecté', {
      body: 'Pour une meilleure expérience, utilisez le mode navigation normal.',
      icon: '/icons/icon-192x192.svg'
    });
  }
}

// Créer une bannière d'information mode incognito
export function createIncognitoBanner() {
  const banner = document.createElement('div');
  banner.id = 'incognito-banner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    padding: 12px;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    animation: slideDown 0.3s ease;
  `;
  
  banner.innerHTML = `
    🕵️ <strong>Mode incognito détecté</strong> - 
    Certaines fonctionnalités peuvent être limitées. 
    <a href="#" onclick="this.parentElement.remove()" style="color: white; text-decoration: underline; margin-left: 8px;">
      Compris ✕
    </a>
  `;

  // Ajouter l'animation CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from { transform: translateY(-100%); }
      to { transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.prepend(banner);
  
  // Auto-remove après 10 secondes
  setTimeout(() => {
    if (banner && banner.parentElement) {
      banner.style.animation = 'slideDown 0.3s ease reverse';
      setTimeout(() => banner.remove(), 300);
    }
  }, 10000);
  
  return banner;
}

// Test de compatibilité complet
export async function runCompatibilityTest() {
  const results = {};

  // Test mode incognito
  try {
    const incognitoInfo = await detectIncognito();
    results.incognito = incognitoInfo;
  } catch (e) {
    results.incognito = { isIncognito: 'error', error: e.message };
  }

  // Test cookies
  try {
    document.cookie = 'test-cookie=1';
    results.cookies = document.cookie.includes('test-cookie');
    document.cookie = 'test-cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  } catch (e) {
    results.cookies = false;
  }

  // Test localStorage
  try {
    localStorage.setItem('test-storage', '1');
    localStorage.removeItem('test-storage');
    results.localStorage = true;
  } catch (e) {
    results.localStorage = false;
  }

  // Test fetch API
  try {
    await fetch('/favicon.ico', { method: 'HEAD' });
    results.fetch = true;
  } catch (e) {
    results.fetch = false;
  }

  return results;
}

// Initialisation automatique si nécessaire
export async function initIncognitoHandling() {
  const incognitoInfo = await detectIncognito();
  
  if (incognitoInfo.isIncognito === true) {
    console.warn('🕵️ Mode incognito détecté - Fonctionnalités limitées');
    
    // Afficher la bannière après un délai
    setTimeout(() => {
      createIncognitoBanner();
    }, 2000);
    
    return true;
  }
  
  return false;
}