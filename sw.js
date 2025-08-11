/*
 * Service Worker - TechShop PWA
 * Cache stratégique et fonctionnement offline
 * Version 1.0.0
 */

const CACHE_NAME = 'techshop-v1.0.0';
const CACHE_CRITICAL = 'techshop-critical-v1.0.0';
const CACHE_IMAGES = 'techshop-images-v1.0.0';

// Ressources critiques à mettre en cache immédiatement
const CRITICAL_ASSETS = [
    '/',
    '/index.html',
    '/assets/css/critical.css',
    '/assets/js/critical.js',
    '/assets/images/logo.svg'
];

// Ressources secondaires à mettre en cache
const SECONDARY_ASSETS = [
    '/assets/css/style.css',
    '/assets/js/app.js',
    '/assets/images/hero-tech.webp',
    '/assets/images/category-smartphone.webp',
    '/assets/images/category-laptop.webp'
];

/**
 * Installation du Service Worker
 */
self.addEventListener('install', event => {
    console.log('📦 Service Worker: Installation en cours...');
    
    event.waitUntil(
        Promise.all([
            // Cache critique
            caches.open(CACHE_CRITICAL)
                .then(cache => {
                    console.log('✅ Cache critique créé');
                    return cache.addAll(CRITICAL_ASSETS);
                }),
            
            // Cache principal
            caches.open(CACHE_NAME)
                .then(cache => {
                    console.log('✅ Cache principal créé');
                    return cache.addAll(SECONDARY_ASSETS);
                })
        ]).then(() => {
            console.log('🚀 Service Worker installé avec succès');
            // Force l'activation immédiate
            return self.skipWaiting();
        })
    );
});

/**
 * Activation du Service Worker
 */
self.addEventListener('activate', event => {
    console.log('🔄 Service Worker: Activation en cours...');
    
    event.waitUntil(
        // Nettoie les anciens caches
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && 
                        cacheName !== CACHE_CRITICAL && 
                        cacheName !== CACHE_IMAGES) {
                        console.log('🗑️ Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker activé');
            // Prend le contrôle immédiatement
            return self.clients.claim();
        })
    );
});

/**
 * Interception des requêtes réseau
 */
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Ignore les requêtes non-HTTP
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // Stratégie selon le type de ressource
    if (isCriticalAsset(request.url)) {
        // Cache First pour les ressources critiques
        event.respondWith(cacheFirst(request, CACHE_CRITICAL));
    } else if (isImageAsset(request.url)) {
        // Cache First pour les images
        event.respondWith(cacheFirstImage(request));
    } else if (isAPIRequest(request.url)) {
        // Network First pour les API
        event.respondWith(networkFirst(request));
    } else if (isNavigationRequest(request)) {
        // Stale While Revalidate pour la navigation
        event.respondWith(staleWhileRevalidate(request));
    } else {
        // Cache First par défaut
        event.respondWith(cacheFirst(request, CACHE_NAME));
    }
});

/**
 * Stratégie Cache First
 * Cherche d'abord dans le cache, sinon réseau
 */
async function cacheFirst(request, cacheName = CACHE_NAME) {
    try {
        const cache = await caches.open(cacheName);
        const cached = await cache.match(request);
        
        if (cached) {
            console.log('💾 Cache hit:', request.url);
            return cached;
        }
        
        console.log('🌐 Fetch from network:', request.url);
        const response = await fetch(request);
        
        // Met en cache les réponses valides
        if (response.status === 200) {
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.error('❌ Cache First error:', error);
        return new Response('Ressource non disponible', { 
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

/**
 * Stratégie Network First
 * Essaie le réseau d'abord, puis le cache
 */
async function networkFirst(request) {
    try {
        console.log('🌐 Network first:', request.url);
        const response = await fetch(request);
        
        // Met en cache les réponses API valides
        if (response.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.log('💾 Fallback to cache:', request.url);
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        
        if (cached) {
            return cached;
        }
        
        // Réponse offline générique pour les API
        return new Response(JSON.stringify({
            error: 'Connexion non disponible',
            offline: true
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Stratégie Stale While Revalidate
 * Retourne le cache immédiatement et met à jour en arrière-plan
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    // Promesse de mise à jour en arrière-plan
    const fetchPromise = fetch(request).then(response => {
        if (response.status === 200) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(error => {
        console.warn('🔄 Background update failed:', error);
    });
    
    // Retourne le cache s'il existe, sinon attend le réseau
    if (cached) {
        console.log('💾 Stale cache:', request.url);
        return cached;
    }
    
    console.log('🌐 Wait for network:', request.url);
    return fetchPromise;
}

/**
 * Gestion spéciale des images
 */
async function cacheFirstImage(request) {
    try {
        const cache = await caches.open(CACHE_IMAGES);
        const cached = await cache.match(request);
        
        if (cached) {
            return cached;
        }
        
        const response = await fetch(request);
        
        if (response.status === 200) {
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        // Image placeholder SVG en cas d'erreur
        const placeholderSVG = `
            <svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
                <rect width="300" height="200" fill="#f3f4f6"/>
                <text x="150" y="100" text-anchor="middle" font-family="Arial" font-size="16" fill="#9ca3af">
                    Image non disponible
                </text>
            </svg>
        `;
        
        return new Response(placeholderSVG, {
            headers: { 'Content-Type': 'image/svg+xml' }
        });
    }
}

/**
 * Helpers pour identifier les types de requêtes
 */
function isCriticalAsset(url) {
    return CRITICAL_ASSETS.some(asset => url.includes(asset));
}

function isImageAsset(url) {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
}

function isAPIRequest(url) {
    return url.includes('/api/') || url.includes('/ajax/');
}

function isNavigationRequest(request) {
    return request.mode === 'navigate' || 
           (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

/**
 * Gestion des messages depuis l'application
 */
self.addEventListener('message', event => {
    console.log('📨 Message reçu:', event.data);
    
    switch (event.data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;
            
        case 'CLEAN_CACHE':
            cleanOldCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
            
        default:
            console.warn('⚠️ Message non reconnu:', event.data.type);
    }
});

/**
 * Nettoyage des anciens caches
 */
async function cleanOldCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        name.startsWith('techshop-') && 
        name !== CACHE_NAME && 
        name !== CACHE_CRITICAL && 
        name !== CACHE_IMAGES
    );
    
    return Promise.all(oldCaches.map(name => caches.delete(name)));
}

/**
 * Préchargement intelligent des ressources importantes
 */
self.addEventListener('install', event => {
    // Précharge les ressources populaires
    event.waitUntil(
        preloadPopularResources()
    );
});

async function preloadPopularResources() {
    const cache = await caches.open(CACHE_NAME);
    
    // Liste des produits populaires à précharger
    const popularProducts = [
        '/assets/images/products/iphone-15-pro.webp',
        '/assets/images/products/macbook-pro-14.webp'
    ];
    
    try {
        await cache.addAll(popularProducts);
        console.log('✅ Ressources populaires préchargées');
    } catch (error) {
        console.warn('⚠️ Erreur préchargement:', error);
    }
}

/**
 * Synchronisation en arrière-plan (Background Sync)
 */
self.addEventListener('sync', event => {
    console.log('🔄 Background sync:', event.tag);
    
    switch (event.tag) {
        case 'cart-sync':
            event.waitUntil(syncCart());
            break;
            
        case 'analytics-sync':
            event.waitUntil(syncAnalytics());
            break;
    }
});

async function syncCart() {
    try {
        // Synchronise le panier avec le serveur quand la connexion revient
        const cartData = await getStoredCartData();
        if (cartData) {
            await fetch('/api/cart/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cartData)
            });
            console.log('✅ Panier synchronisé');
        }
    } catch (error) {
        console.error('❌ Erreur sync panier:', error);
    }
}

async function syncAnalytics() {
    try {
        // Envoie les événements analytics en attente
        const pendingEvents = await getStoredAnalytics();
        if (pendingEvents.length > 0) {
            await fetch('/api/analytics/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events: pendingEvents })
            });
            await clearStoredAnalytics();
            console.log('✅ Analytics synchronisées');
        }
    } catch (error) {
        console.error('❌ Erreur sync analytics:', error);
    }
}

// Helpers pour le localStorage
async function getStoredCartData() {
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
        return new Promise(resolve => {
            clients[0].postMessage({ type: 'GET_CART_DATA' });
            // Écoute la réponse... (implémentation simplifiée)
            resolve(null);
        });
    }
    return null;
}

async function getStoredAnalytics() {
    // Implémentation simplifiée
    return [];
}

async function clearStoredAnalytics() {
    // Implémentation simplifiée
    return true;
}

console.log('🚀 Service Worker TechShop chargé - Version:', CACHE_NAME);