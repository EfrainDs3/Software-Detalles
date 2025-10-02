// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Submenús móviles
document.querySelectorAll('.menu-item-has-children > a').forEach(link => {
    link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            const submenu = link.nextElementSibling;
            if (submenu) {
                submenu.classList.toggle('active');
                
                // Rotar ícono
                const icon = link.querySelector('i');
                if (icon) {
                    icon.style.transform = submenu.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
                }
            }
        }
    });
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-container') && window.innerWidth <= 768) {
        if (hamburger) hamburger.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
    }
});

// Search functionality
const searchIcon = document.querySelector('.search-icon');
const searchOverlay = document.getElementById('searchOverlay');
const closeSearch = document.querySelector('.close-search');

if (searchIcon && searchOverlay) {
    searchIcon.addEventListener('click', (e) => {
        e.preventDefault();
        searchOverlay.classList.add('active');
    });
}

if (closeSearch) {
    closeSearch.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
    });
}

// Close search when clicking outside
if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            searchOverlay.classList.remove('active');
        }
    });
}

// Tag suggestions
document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = tag.textContent;
            searchInput.focus();
        }
    });
});

// ========== CARRITO Y FAVORITOS ==========
let cart = [];
let favorites = [];

// Funcionalidad de Favoritos
function toggleFavorite(button) {
    const productCard = button.closest('.product-card-detailed');
    const productId = productCard ? productCard.getAttribute('data-product-id') : '1';
    const heartIcon = button.querySelector('i');
    
    const index = favorites.indexOf(productId);
    
    if (index > -1) {
        // Remover de favoritos
        favorites.splice(index, 1);
        heartIcon.classList.remove('fas');
        heartIcon.classList.add('far');
        showNotification('Producto removido de favoritos');
    } else {
        // Agregar a favoritos
        favorites.push(productId);
        heartIcon.classList.remove('far');
        heartIcon.classList.add('fas');
        showNotification('Producto agregado a favoritos');
    }
    
    updateFavoritesCount();
}

// Funcionalidad de Carrito
function addToCart(button) {
    const productCard = button.closest('.product-card-detailed');
    const productId = productCard ? productCard.getAttribute('data-product-id') : '1';
    const productName = productCard.querySelector('.product-title-detailed').textContent;
    const price = productCard.querySelector('.current-price').textContent;
    const image = productCard.querySelector('img').src;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    updateCartCount();
    showNotification(`${productName} agregado al carrito`);
    
    // Animación del botón
    const originalText = button.textContent;
    button.textContent = '¡Añadido!';
    button.style.background = '#4CAF50';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 2000);
}

// Actualizar contadores
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

function updateFavoritesCount() {
    const favCount = document.querySelector('.favorites-count');
    if (favCount) {
        favCount.textContent = favorites.length;
    }
}

// Mostrar notificaciones
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Inicializar eventos de productos
function initializeProductEvents() {
    // Eventos para botones de carrito
    document.querySelectorAll('.btn-add-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            addToCart(this);
        });
    });
    
    // Eventos para botones de favoritos
    document.querySelectorAll('.btn-wishlist').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            toggleFavorite(this);
        });
    });
}

// ========== FILTROS ==========
function initializeFilters() {
    // Filtro de Tallas
    document.querySelectorAll('.size-option').forEach(option => {
        option.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });

    // Filtro de Colores
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });

    // Filtro de Precio
    const priceRange = document.querySelector('.price-range');
    if (priceRange) {
        priceRange.addEventListener('input', function() {
            const value = (this.value - this.min) / (this.max - this.min) * 100;
            this.style.background = `linear-gradient(to right, #e91e63 0%, #e91e63 ${value}%, #e0e0e0 ${value}%, #e0e0e0 100%)`;
        });
    }
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    initializeProductEvents();
    initializeFilters();
    updateCartCount();
    updateFavoritesCount();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Resto de funcionalidades...
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        alert(`¡Gracias por suscribirte con el email: ${email}!`);
        newsletterForm.reset();
    });
}

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = '#fff';
            navbar.style.backdropFilter = 'none';
        }
    }
});