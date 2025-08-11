/*
 * JavaScript Principal - TechShop E-commerce
 * Fonctionnalités complètes | ES6+ | Fetch API | Architecture modulaire
 * Performance optimisée | Accessibilité | Gestion d'erreurs robuste
 */

(function() {
    'use strict';

    // Configuration de l'API
    const API_CONFIG = {
        baseUrl: '/api',
        timeout: 10000,
        retries: 3
    };

    // Données simulées pour le développement frontend
    const MOCK_PRODUCTS = [
        {
            id: 1,
            name: "iPhone 15 Pro Max",
            description: "Le smartphone le plus avancé d'Apple avec puce A17 Pro",
            price: 1229,
            originalPrice: 1299,
            image: "/assets/images/products/iphone-15-pro.webp",
            category: "smartphones",
            badge: "Nouveau",
            rating: 4.8,
            reviews: 324,
            inStock: true
        },
        {
            id: 2,
            name: "MacBook Pro 14\" M3",
            description: "Ordinateur portable professionnel avec puce M3",
            price: 2199,
            originalPrice: 2399,
            image: "/assets/images/products/macbook-pro-14.webp",
            category: "ordinateurs",
            badge: "Promo",
            rating: 4.9,
            reviews: 187,
            inStock: true
        },
        {
            id: 3,
            name: "PlayStation 5 Slim",
            description: "Console de jeu nouvelle génération plus compacte",
            price: 449,
            originalPrice: 499,
            image: "/assets/images/products/ps5-slim.webp",
            category: "gaming",
            badge: "Populaire",
            rating: 4.7,
            reviews: 892,
            inStock: false
        },
        {
            id: 4,
            name: "AirPods Pro 2",
            description: "Écouteurs sans fil avec réduction de bruit active",
            price: 279,
            originalPrice: null,
            image: "/assets/images/products/airpods-pro-2.webp",
            category: "accessoires",
            badge: null,
            rating: 4.6,
            reviews: 456,
            inStock: true
        }
    ];

    // Classes pour l'architecture modulaire
    class TechShopApp {
        constructor() {
            this.components = {
                productManager: new ProductManager(),
                cartManager: new CartManager(),
                searchManager: new SearchManager(),
                newsletterManager: new NewsletterManager(),
                notificationManager: new NotificationManager()
            };
            
            this.init();
        }

        async init() {
            try {
                console.log('🚀 Initialisation de TechShop...');
                
                // Initialise tous les composants
                await Promise.all([
                    this.components.productManager.init(),
                    this.components.cartManager.init(),
                    this.components.searchManager.init(),
                    this.components.newsletterManager.init()
                ]);

                // Gestion des animations au scroll
                this.initScrollAnimations();

                // Gestion des formulaires
                this.initFormValidation();

                // Service Worker pour le cache (optionnel)
                this.initServiceWorker();

                console.log('✅ TechShop initialisé avec succès');
                
            } catch (error) {
                console.error('❌ Erreur lors de l\'initialisation:', error);
                this.components.notificationManager.showError(
                    'Une erreur est survenue lors du chargement. Veuillez rafraîchir la page.'
                );
            }
        }

        initScrollAnimations() {
            if ('IntersectionObserver' in window) {
                const animationObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('fade-in');
                            animationObserver.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: 0.1,
                    rootMargin: '50px 0px'
                });

                document.querySelectorAll('.category-card, .benefit-card').forEach(el => {
                    animationObserver.observe(el);
                });
            }
        }

        initFormValidation() {
            document.querySelectorAll('form').forEach(form => {
                form.addEventListener('submit', this.handleFormSubmit.bind(this));
            });
        }

        handleFormSubmit(e) {
            const form = e.target;
            const inputs = form.querySelectorAll('[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!this.validateInput(input)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                e.preventDefault();
            }
        }

        validateInput(input) {
            const value = input.value.trim();
            const type = input.type;
            let isValid = true;
            let message = '';

            if (!value) {
                isValid = false;
                message = 'Ce champ est requis';
            } else if (type === 'email' && !this.isValidEmail(value)) {
                isValid = false;
                message = 'Adresse e-mail invalide';
            }

            this.toggleInputError(input, !isValid, message);
            return isValid;
        }

        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        toggleInputError(input, hasError, message) {
            const errorEl = input.parentNode.querySelector('.error-message');
            
            if (hasError) {
                input.classList.add('error');
                input.setAttribute('aria-invalid', 'true');
                
                if (!errorEl) {
                    const error = document.createElement('span');
                    error.className = 'error-message';
                    error.textContent = message;
                    error.style.color = '#ef4444';
                    error.style.fontSize = '0.875rem';
                    error.style.marginTop = '0.25rem';
                    input.parentNode.appendChild(error);
                }
            } else {
                input.classList.remove('error');
                input.setAttribute('aria-invalid', 'false');
                if (errorEl) {
                    errorEl.remove();
                }
            }
        }

        async initServiceWorker() {
            if ('serviceWorker' in navigator) {
                try {
                    await navigator.serviceWorker.register('/sw.js');
                    console.log('✅ Service Worker enregistré');
                } catch (error) {
                    console.log('ℹ️ Service Worker non disponible');
                }
            }
        }
    }

    // Gestionnaire des produits
    class ProductManager {
        constructor() {
            this.products = [];
            this.currentCategory = 'all';
            this.sortBy = 'featured';
        }

        async init() {
            await this.loadProducts();
            this.renderFeaturedProducts();
            this.bindEvents();
        }

        async loadProducts() {
            try {
                // En développement, utilise les données simulées
                // En production, remplacer par un appel API réel
                this.products = MOCK_PRODUCTS;
                
                // Simulation d'un appel API
                // const response = await this.fetchWithRetry(`${API_CONFIG.baseUrl}/products`);
                // this.products = response.data;
                
            } catch (error) {
                console.error('Erreur lors du chargement des produits:', error);
                this.products = MOCK_PRODUCTS; // Fallback
            }
        }

        renderFeaturedProducts() {
            const container = document.getElementById('featured-products-grid');
            if (!container) return;

            const featuredProducts = this.products.slice(0, 8);
            
            container.innerHTML = featuredProducts.map(product => 
                this.createProductCard(product)
            ).join('');

            this.bindProductEvents(container);
        }

        createProductCard(product) {
            const badge = product.badge ? 
                `<div class="product-card__badge">${product.badge}</div>` : '';
            
            const originalPrice = product.originalPrice ? 
                `<span class="product-card__price-original">${product.originalPrice}€</span>` : '';

            const stockStatus = product.inStock ? 
                '<span class="stock-available">En stock</span>' : 
                '<span class="stock-unavailable">Rupture de stock</span>';

            return `
                <article class="product-card" data-product-id="${product.id}">
                    <div class="product-card__image">
                        ${badge}
                        <img src="${product.image}" 
                             alt="${product.name}" 
                             width="300" 
                             height="250"
                             loading="lazy">
                    </div>
                    <div class="product-card__content">
                        <h3 class="product-card__title">${product.name}</h3>
                        <p class="product-card__description">${product.description}</p>
                        
                        <div class="product-card__rating">
                            ${this.createStarRating(product.rating)}
                            <span class="rating-count">(${product.reviews} avis)</span>
                        </div>
                        
                        <div class="product-card__price">
                            <span class="product-card__price-current">${product.price}€</span>
                            ${originalPrice}
                        </div>
                        
                        <div class="product-card__stock">
                            ${stockStatus}
                        </div>
                        
                        <div class="product-card__actions">
                            <button class="btn btn--primary btn--small add-to-cart" 
                                    data-product-id="${product.id}"
                                    ${!product.inStock ? 'disabled' : ''}
                                    aria-label="Ajouter ${product.name} au panier">
                                ${product.inStock ? 'Ajouter au panier' : 'Indisponible'}
                            </button>
                            <button class="btn btn--outline btn--small quick-view" 
                                    data-product-id="${product.id}"
                                    aria-label="Aperçu rapide de ${product.name}">
                                Aperçu
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }

        createStarRating(rating) {
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 !== 0;
            const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

            let stars = '';
            
            // Étoiles pleines
            for (let i = 0; i < fullStars; i++) {
                stars += '<span class="star star--full">★</span>';
            }
            
            // Demi-étoile
            if (hasHalfStar) {
                stars += '<span class="star star--half">★</span>';
            }
            
            // Étoiles vides
            for (let i = 0; i < emptyStars; i++) {
                stars += '<span class="star star--empty">☆</span>';
            }

            return `<div class="rating" aria-label="${rating} étoiles sur 5">${stars}</div>`;
        }

        bindEvents() {
            // Filtres de catégorie (si présents)
            document.querySelectorAll('[data-category-filter]').forEach(filter => {
                filter.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.filterByCategory(filter.dataset.categoryFilter);
                });
            });

            // Tri des produits (si présent)
            const sortSelect = document.querySelector('#product-sort');
            if (sortSelect) {
                sortSelect.addEventListener('change', (e) => {
                    this.sortProducts(e.target.value);
                });
            }
        }

        bindProductEvents(container) {
            // Ajout au panier
            container.querySelectorAll('.add-to-cart').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = parseInt(e.target.dataset.productId);
                    this.addToCart(productId);
                });
            });

            // Aperçu rapide
            container.querySelectorAll('.quick-view').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = parseInt(e.target.dataset.productId);
                    this.showQuickView(productId);
                });
            });
        }

        addToCart(productId) {
            const product = this.products.find(p => p.id === productId);
            if (product && window.TechShop?.components?.cartManager) {
                window.TechShop.components.cartManager.addItem(product);
            }
        }

        showQuickView(productId) {
            const product = this.products.find(p => p.id === productId);
            if (product) {
                // Implémentation du modal d'aperçu rapide
                console.log('Aperçu rapide:', product.name);
                // TODO: Créer et afficher un modal
            }
        }

        async fetchWithRetry(url, options = {}, retries = API_CONFIG.retries) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();

            } catch (error) {
                if (retries > 0 && error.name !== 'AbortError') {
                    console.warn(`Tentative ${API_CONFIG.retries - retries + 1} échouée, nouvelle tentative...`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return this.fetchWithRetry(url, options, retries - 1);
                }
                throw error;
            }
        }
    }

    // Gestionnaire du panier
    class CartManager {
        constructor() {
            this.items = [];
            this.total = 0;
        }

        async init() {
            this.loadFromStorage();
            this.bindEvents();
        }

        loadFromStorage() {
            try {
                const saved = localStorage.getItem('techshop_cart');
                if (saved) {
                    const data = JSON.parse(saved);
                    this.items = data.items || [];
                    this.updateTotal();
                    this.updateUI();
                }
            } catch (error) {
                console.warn('Erreur lors du chargement du panier:', error);
            }
        }

        saveToStorage() {
            try {
                localStorage.setItem('techshop_cart', JSON.stringify({
                    items: this.items,
                    total: this.total,
                    lastUpdated: Date.now()
                }));
            } catch (error) {
                console.warn('Erreur lors de la sauvegarde du panier:', error);
            }
        }

        addItem(product, quantity = 1) {
            const existingItem = this.items.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                this.items.push({
                    ...product,
                    quantity
                });
            }

            this.updateTotal();
            this.updateUI();
            this.saveToStorage();

            // Notification
            if (window.TechShop?.components?.notificationManager) {
                window.TechShop.components.notificationManager.showSuccess(
                    `${product.name} ajouté au panier`
                );
            }
        }

        removeItem(productId) {
            this.items = this.items.filter(item => item.id !== productId);
            this.updateTotal();
            this.updateUI();
            this.saveToStorage();
        }

        updateQuantity(productId, quantity) {
            const item = this.items.find(item => item.id === productId);
            if (item) {
                if (quantity <= 0) {
                    this.removeItem(productId);
                } else {
                    item.quantity = quantity;
                    this.updateTotal();
                    this.updateUI();
                    this.saveToStorage();
                }
            }
        }

        updateTotal() {
            this.total = this.items.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);
        }

        updateUI() {
            // Met à jour le compteur dans le header
            if (window.TechShop?.critical) {
                window.TechShop.critical.updateCartCount(this.items.length);
            }

            // Met à jour le panier latéral (si présent)
            this.updateCartSidebar();
        }

        updateCartSidebar() {
            const sidebar = document.querySelector('.cart-sidebar');
            if (sidebar) {
                // Implémentation du panier latéral
                // TODO: Créer l'interface du panier latéral
            }
        }

        bindEvents() {
            // Événements pour le panier (ajout/suppression/modification)
            document.addEventListener('click', (e) => {
                if (e.target.matches('.remove-from-cart')) {
                    const productId = parseInt(e.target.dataset.productId);
                    this.removeItem(productId);
                }
            });
        }

        getItemCount() {
            return this.items.reduce((count, item) => count + item.quantity, 0);
        }

        getTotalPrice() {
            return this.total;
        }

        clear() {
            this.items = [];
            this.total = 0;
            this.updateUI();
            this.saveToStorage();
        }
    }

    // Gestionnaire de recherche
    class SearchManager {
        constructor() {
            this.searchInput = null;
            this.searchResults = null;
            this.searchTimeout = null;
        }

        async init() {
            this.searchInput = document.querySelector('.search-input');
            if (!this.searchInput) return;

            this.bindEvents();
            this.createSearchResults();
        }

        bindEvents() {
            this.searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value.trim());
                }, 300);
            });

            this.searchInput.addEventListener('focus', () => {
                this.showSearchResults();
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.navbar__search')) {
                    this.hideSearchResults();
                }
            });
        }

        createSearchResults() {
            this.searchResults = document.createElement('div');
            this.searchResults.className = 'search-results';
            this.searchResults.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-lg);
                max-height: 400px;
                overflow-y: auto;
                z-index: 1000;
                display: none;
            `;
            
            this.searchInput.parentNode.style.position = 'relative';
            this.searchInput.parentNode.appendChild(this.searchResults);
        }

        async performSearch(query) {
            if (query.length < 2) {
                this.hideSearchResults();
                return;
            }

            try {
                // Simulation de recherche (remplacer par un appel API réel)
                const results = MOCK_PRODUCTS.filter(product => 
                    product.name.toLowerCase().includes(query.toLowerCase()) ||
                    product.description.toLowerCase().includes(query.toLowerCase())
                );

                this.displaySearchResults(results, query);
                
            } catch (error) {
                console.error('Erreur lors de la recherche:', error);
            }
        }

        displaySearchResults(results, query) {
            if (results.length === 0) {
                this.searchResults.innerHTML = `
                    <div class="search-no-results">
                        <p>Aucun résultat pour "${query}"</p>
                    </div>
                `;
            } else {
                this.searchResults.innerHTML = `
                    <div class="search-results-header">
                        <p>${results.length} résultat(s) pour "${query}"</p>
                    </div>
                    ${results.map(product => `
                        <a href="/products/${product.id}" class="search-result-item">
                            <img src="${product.image}" alt="${product.name}" width="40" height="40">
                            <div class="search-result-content">
                                <h4>${product.name}</h4>
                                <p class="search-result-price">${product.price}€</p>
                            </div>
                        </a>
                    `).join('')}
                    <div class="search-results-footer">
                        <a href="/search?q=${encodeURIComponent(query)}">Voir tous les résultats</a>
                    </div>
                `;
            }

            this.showSearchResults();
        }

        showSearchResults() {
            if (this.searchResults) {
                this.searchResults.style.display = 'block';
            }
        }

        hideSearchResults() {
            if (this.searchResults) {
                this.searchResults.style.display = 'none';
            }
        }
    }

    // Gestionnaire de newsletter
    class NewsletterManager {
        async init() {
            const form = document.querySelector('.newsletter__form');
            if (!form) return;

            form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        async handleSubmit(e) {
            e.preventDefault();
            
            const form = e.target;
            const email = form.querySelector('input[type="email"]').value;
            const submitBtn = form.querySelector('button[type="submit"]');
            
            // Validation
            if (!this.isValidEmail(email)) {
                this.showError(form, 'Adresse e-mail invalide');
                return;
            }

            // État de chargement
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Inscription...';
            submitBtn.disabled = true;

            try {
                // Simulation d'appel API
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                this.showSuccess(form, 'Inscription réussie ! Merci de votre confiance.');
                form.reset();
                
            } catch (error) {
                console.error('Erreur lors de l\'inscription:', error);
                this.showError(form, 'Erreur lors de l\'inscription. Veuillez réessayer.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }

        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        showError(form, message) {
            this.showMessage(form, message, 'error');
        }

        showSuccess(form, message) {
            this.showMessage(form, message, 'success');
        }

        showMessage(form, message, type) {
            // Supprime les anciens messages
            const existingMessage = form.querySelector('.form-message');
            if (existingMessage) {
                existingMessage.remove();
            }

            // Crée le nouveau message
            const messageEl = document.createElement('div');
            messageEl.className = `form-message form-message--${type}`;
            messageEl.textContent = message;
            messageEl.style.cssText = `
                margin-top: 1rem;
                padding: 0.75rem;
                border-radius: var(--border-radius);
                font-size: 0.875rem;
                ${type === 'error' ? 
                    'background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;' : 
                    'background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0;'
                }
            `;

            form.appendChild(messageEl);

            // Supprime automatiquement après 5 secondes
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.remove();
                }
            }, 5000);
        }
    }

    // Gestionnaire de notifications
    class NotificationManager {
        constructor() {
            this.container = null;
            this.init();
        }

        init() {
            this.createContainer();
        }

        createContainer() {
            this.container = document.createElement('div');
            this.container.className = 'notifications-container';
            this.container.style.cssText = `
                position: fixed;
                top: 1rem;
                right: 1rem;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(this.container);
        }

        show(message, type = 'info', duration = 5000) {
            const notification = document.createElement('div');
            notification.className = `notification notification--${type}`;
            notification.style.cssText = `
                padding: 1rem;
                margin-bottom: 0.5rem;
                border-radius: var(--border-radius);
                background: white;
                border-left: 4px solid;
                box-shadow: var(--shadow-lg);
                transform: translateX(100%);
                transition: transform 0.3s ease;
                ${this.getTypeStyles(type)}
            `;

            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-icon">${this.getIcon(type)}</span>
                    <span class="notification-message">${message}</span>
                    <button class="notification-close" aria-label="Fermer">&times;</button>
                </div>
            `;

            this.container.appendChild(notification);

            // Animation d'entrée
            requestAnimationFrame(() => {
                notification.style.transform = 'translateX(0)';
            });

            // Gestion de la fermeture
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => this.remove(notification));

            // Suppression automatique
            if (duration > 0) {
                setTimeout(() => this.remove(notification), duration);
            }

            return notification;
        }

        showSuccess(message, duration) {
            return this.show(message, 'success', duration);
        }

        showError(message, duration) {
            return this.show(message, 'error', duration);
        }

        showWarning(message, duration) {
            return this.show(message, 'warning', duration);
        }

        showInfo(message, duration) {
            return this.show(message, 'info', duration);
        }

        remove(notification) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }

        getTypeStyles(type) {
            const styles = {
                success: 'border-color: #10b981; background: #f0fdf4;',
                error: 'border-color: #ef4444; background: #fef2f2;',
                warning: 'border-color: #f59e0b; background: #fffbeb;',
                info: 'border-color: #3b82f6; background: #eff6ff;'
            };
            return styles[type] || styles.info;
        }

        getIcon(type) {
            const icons = {
                success: '✓',
                error: '✕',
                warning: '⚠',
                info: 'ℹ'
            };
            return icons[type] || icons.info;
        }
    }

    // Initialisation de l'application
    window.TechShop = window.TechShop || {};
    
    // Initialise l'application quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.TechShop.app = new TechShopApp();
        });
    } else {
        window.TechShop.app = new TechShopApp();
    }

})();