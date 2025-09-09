/**
 * OPTIMA - Améliorations PWA pour feeling natif
 * Fonctionnalités mobiles avancées
 */

// Gestion des gestes natifs mobiles
export function initMobileGestures() {
  // Pull-to-refresh personnalisé
  let startY = 0;
  let currentY = 0;
  let pullDistance = 0;
  let isPulling = false;

  document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY;
      isPulling = true;
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (isPulling && window.scrollY === 0) {
      currentY = e.touches[0].clientY;
      pullDistance = Math.max(0, (currentY - startY) * 0.5);
      
      if (pullDistance > 80) {
        // Afficher indicateur de refresh
        showPullToRefreshIndicator(pullDistance);
      }
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (isPulling && pullDistance > 80) {
      // Déclencher le refresh
      triggerRefresh();
    }
    
    isPulling = false;
    pullDistance = 0;
    hidePullToRefreshIndicator();
  });
}

// Gestion des vibrations haptiques (iOS/Android)
export function hapticFeedback(type = 'light') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 50,
      heavy: 100,
      success: [10, 50, 10],
      error: [100, 50, 100, 50, 100]
    };
    
    navigator.vibrate(patterns[type] || patterns.light);
  }
}

// Gestion des notifications push
export async function initPushNotifications() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.log('Notifications non supportées');
    return false;
  }

  let permission = Notification.permission;
  
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  
  if (permission === 'granted') {
    console.log('✅ Notifications autorisées');
    return true;
  }
  
  return false;
}

// Gestion du mode sombre automatique
export function initDarkModeDetection() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  function handleDarkModeChange(e) {
    const isDark = e.matches;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    // Mettre à jour la couleur de la barre d'état
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.content = isDark ? '#0f0f0f' : '#dc2626';
    }
  }
  
  // Initial check
  handleDarkModeChange(mediaQuery);
  
  // Listen for changes
  mediaQuery.addEventListener('change', handleDarkModeChange);
}

// Optimisations performances mobiles
export function initMobilePerformance() {
  // Lazy loading des images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Optimisation du scroll
  let ticking = false;
  function updateScrollPosition() {
    // Logique de scroll optimisée
    ticking = false;
  }

  document.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollPosition);
      ticking = true;
    }
  }, { passive: true });
}

// Gestion de l'orientation
export function initOrientationHandling() {
  function handleOrientationChange() {
    // Ajuster l'interface selon l'orientation
    const isLandscape = window.innerWidth > window.innerHeight;
    document.documentElement.setAttribute('data-orientation', isLandscape ? 'landscape' : 'portrait');
    
    // Force reflow pour corriger les bugs d'affichage mobile
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  window.addEventListener('orientationchange', handleOrientationChange);
  window.addEventListener('resize', handleOrientationChange);
  
  // Initial setup
  handleOrientationChange();
}

// Gestion du clavier virtuel mobile
export function initVirtualKeyboardHandling() {
  let initialViewportHeight = window.innerHeight;
  
  function handleViewportChange() {
    const currentHeight = window.innerHeight;
    const diff = initialViewportHeight - currentHeight;
    
    // Détecter si le clavier est ouvert (différence > 150px)
    const isKeyboardOpen = diff > 150;
    
    document.documentElement.setAttribute('data-keyboard', isKeyboardOpen ? 'open' : 'closed');
    
    if (isKeyboardOpen) {
      // Ajuster l'interface quand le clavier est ouvert
      document.documentElement.style.setProperty('--keyboard-height', `${diff}px`);
    } else {
      document.documentElement.style.removeProperty('--keyboard-height');
    }
  }
  
  window.addEventListener('resize', handleViewportChange);
  
  // Gestion spécifique des champs de saisie
  const inputs = document.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      // Scroll vers l'input après un délai
      setTimeout(() => {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    });
  });
}

// Helpers pour les indicateurs de refresh
function showPullToRefreshIndicator(distance) {
  let indicator = document.getElementById('pull-refresh-indicator');
  
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'pull-refresh-indicator';
    indicator.innerHTML = '🔄';
    indicator.style.cssText = `
      position: fixed;
      top: -50px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(220, 38, 38, 0.9);
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 16px;
      z-index: 9999;
      transition: all 0.3s ease;
    `;
    document.body.appendChild(indicator);
  }
  
  const progress = Math.min(distance / 100, 1);
  indicator.style.top = `${Math.max(-50, (progress * 50) - 50)}px`;
  indicator.style.opacity = progress;
  
  if (distance > 80) {
    indicator.innerHTML = '🚀 Relâcher pour actualiser';
    indicator.style.background = 'rgba(34, 197, 94, 0.9)';
  } else {
    indicator.innerHTML = '🔄 Tirer pour actualiser';
    indicator.style.background = 'rgba(220, 38, 38, 0.9)';
  }
}

function hidePullToRefreshIndicator() {
  const indicator = document.getElementById('pull-refresh-indicator');
  if (indicator) {
    indicator.style.top = '-50px';
    indicator.style.opacity = '0';
    setTimeout(() => indicator.remove(), 300);
  }
}

function triggerRefresh() {
  console.log('🔄 Actualisation des données...');
  
  // Afficher feedback
  const indicator = document.getElementById('pull-refresh-indicator');
  if (indicator) {
    indicator.innerHTML = '⚡ Actualisation...';
    indicator.style.background = 'rgba(59, 130, 246, 0.9)';
  }
  
  // Simuler actualisation + feedback haptique
  hapticFeedback('success');
  
  // Recharger les données (à adapter selon votre app)
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

// Installation shortcuts
export function createInstallShortcut() {
  // Ajouter au menu contextuel si supporté
  if ('getInstalledRelatedApps' in navigator) {
    navigator.getInstalledRelatedApps().then(apps => {
      if (apps.length === 0) {
        // App non installée, afficher le raccourci
        console.log('💾 Installation disponible');
      }
    });
  }
}

// Initialisation complète PWA
export function initPWAEnhancements() {
  console.log('🚀 Initialisation PWA enhancements...');
  
  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupEnhancements();
    });
  } else {
    setupEnhancements();
  }
}

function setupEnhancements() {
  initMobileGestures();
  initDarkModeDetection();
  initMobilePerformance();
  initOrientationHandling();
  initVirtualKeyboardHandling();
  initPushNotifications();
  createInstallShortcut();
  
  console.log('✅ PWA enhancements initialisés');
}

// Export pour utilisation globale
window.OPTIMA_PWA = {
  hapticFeedback,
  initPushNotifications,
  initPWAEnhancements
};