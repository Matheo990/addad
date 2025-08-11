/*
 * JavaScript Critique - TechShop E-commerce
 * Code essentiel pour le premier rendu et fonctionnalités critiques
 * ES6+ | Performance optimisée | Accessibilité
 */

(function() {
    'use strict';

    // Variables globales critiques
    const elements = {
        navToggle: null,
        navMenu: null,
        cartCount: null,
        searchForm: null
    };

    // État de l'application
    const appState = {
        isMenuOpen: false,
        cartItems: 0,
        isLoading: false
    };

    /**
     * Initialisation critique au DOMContentLoaded
     */
    function initCritical() {
        // Cache des éléments DOM critiques
        cacheElements();
        
        // Navigation mobile
        initMobileNavigation();
        
        // Indicateur de scroll
        initScrollIndicator();
        
        // Gestion du panier
        initCartCounter();
        
        // Optimisations performance
        initPerformanceOptimizations();
        
        console.log('✅ TechShop: JavaScript critique initialisé');
    }

    /**
     * Met en cache les éléments DOM critiques
     */
    function cacheElements() {
        elements.navToggle = document.querySelector('.navbar__toggle');
        elements.navMenu = document.querySelector('.navbar__menu');
        elements.cartCount = document.querySelector('#cart-count');
        elements.searchForm = document.querySelector('.search-form');
    }

    /**
     * Initialise la navigation mobile avec gestion du focus
     */
    function initMobileNavigation() {
        if (!elements.navToggle || !elements.navMenu) return;

        elements.navToggle.addEventListener('click', toggleMobileMenu);
        elements.navToggle.addEventListener('keydown', handleToggleKeydown);

        // Ferme le menu lors du clic à l'extérieur
        document.addEventListener('click', (e) => {
            if (appState.isMenuOpen && 
                !elements.navMenu.contains(e.target) && 
                !elements.navToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Ferme le menu sur Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && appState.isMenuOpen) {
                closeMobileMenu();
                elements.navToggle.focus();
            }
        });
    }

    /**
     * Bascule l'état du menu mobile
     */
    function toggleMobileMenu() {
        if (appState.isMenuOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    /**
     * Gestion du clavier pour le bouton menu
     */
    function handleToggleKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMobileMenu();
        }
    }

    /**
     * Ouvre le menu mobile
     */
    function openMobileMenu() {
        appState.isMenuOpen = true;
        elements.navToggle.classList.add('active');
        elements.navMenu.classList.add('active');
        elements.navToggle.setAttribute('aria-expanded', 'true');
        
        // Focus sur le premier lien du menu
        const firstLink = elements.navMenu.querySelector('a');
        if (firstLink) {
            firstLink.focus();
        }
        
        // Empêche le scroll de la page
        document.body.style.overflow = 'hidden';
    }

    /**
     * Ferme le menu mobile
     */
    function closeMobileMenu() {
        appState.isMenuOpen = false;
        elements.navToggle.classList.remove('active');
        elements.navMenu.classList.remove('active');
        elements.navToggle.setAttribute('aria-expanded', 'false');
        
        // Restaure le scroll de la page
        document.body.style.overflow = '';
    }

    /**
     * Initialise l'indicateur de progression de scroll
     */
    function initScrollIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        indicator.style.width = '0%';
        document.body.appendChild(indicator);

        // Utilise RAF pour optimiser les performances
        let ticking = false;

        function updateScrollIndicator() {
            const scrolled = window.pageYOffset;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrolled / maxScroll) * 100;
            
            indicator.style.width = `${Math.min(progress, 100)}%`;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollIndicator);
                ticking = true;
            }
        }, { passive: true });
    }

    /**
     * Initialise le compteur du panier
     */
    function initCartCounter() {
        if (!elements.cartCount) return;

        // Récupère la quantité depuis le localStorage
        const savedCart = localStorage.getItem('techshop_cart');
        if (savedCart) {
            try {
                const cartData = JSON.parse(savedCart);
                appState.cartItems = cartData.items?.length || 0;
                updateCartDisplay();
            } catch (e) {
                console.warn('Erreur lors de la lecture du panier:', e);
            }
        }
    }

    /**
     * Met à jour l'affichage du compteur de panier
     */
    function updateCartDisplay() {
        if (elements.cartCount) {
            elements.cartCount.textContent = appState.cartItems;
            elements.cartCount.parentElement.setAttribute(
                'aria-label', 
                `Panier (${appState.cartItems} ${appState.cartItems > 1 ? 'articles' : 'article'})`
            );
        }
    }

    /**
     * Optimisations de performance critiques
     */
    function initPerformanceOptimizations() {
        // Précharge les polices critiques
        preloadCriticalFonts();
        
        // Lazy loading des images avec IntersectionObserver
        initLazyLoading();
        
        // Préconnexion aux domaines externes
        preconnectExternalDomains();
    }

    /**
     * Précharge les polices critiques
     */
    function preloadCriticalFonts() {
        const fontPreloads = [
            'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
        ];

        fontPreloads.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
            link.href = url;
            document.head.appendChild(link);
        });
    }

    /**
     * Initialise le lazy loading des images
     */
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Charge l'image
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        
                        // Ajoute la classe loaded pour les animations
                        img.classList.add('loaded');
                        
                        // Arrête d'observer cette image
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });

            // Observe toutes les images lazy
            document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    /**
     * Préconnexion aux domaines externes pour optimiser les performances
     */
    function preconnectExternalDomains() {
        const domains = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://www.googletagmanager.com'
        ];

        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            document.head.appendChild(link);
        });
    }

    /**
     * API publique pour les autres scripts
     */
    window.TechShop = window.TechShop || {};
    window.TechShop.critical = {
        updateCartCount: (count) => {
            appState.cartItems = count;
            updateCartDisplay();
        },
        
        getCartCount: () => appState.cartItems,
        
        showLoading: () => {
            appState.isLoading = true;
            document.body.classList.add('loading');
        },
        
        hideLoading: () => {
            appState.isLoading = false;
            document.body.classList.remove('loading');
        }
    };

    // Initialisation quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCritical);
    } else {
        initCritical();
    }

})();