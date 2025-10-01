// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Submenús móviles
document.querySelectorAll('.menu-item-has-children > a').forEach(link => {
    link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            const submenu = link.nextElementSibling;
            submenu.classList.toggle('active');
            
            // Rotar ícono
            const icon = link.querySelector('i');
            if (icon) {
                icon.style.transform = submenu.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
            }
        }
    });
});

// Close mobile menu when clicking on a link (sin submenú)
document.querySelectorAll('.nav-menu a:not(.menu-item-has-children > a)').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-container')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Search functionality
const searchIcon = document.querySelector('.search-icon');
const searchOverlay = document.getElementById('searchOverlay');
const closeSearch = document.querySelector('.close-search');

searchIcon.addEventListener('click', (e) => {
    e.preventDefault();
    searchOverlay.classList.add('active');
});

closeSearch.addEventListener('click', () => {
    searchOverlay.classList.remove('active');
});

// Close search when clicking outside
searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) {
        searchOverlay.classList.remove('active');
    }
});

// Tag suggestions
document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => {
        const searchInput = document.querySelector('.search-input');
        searchInput.value = tag.textContent;
        searchInput.focus();
    });
});

// Cart functionality
let cartCount = 0;
const cartButtons = document.querySelectorAll('.add-to-cart');
const cartCountElement = document.querySelector('.cart-count');

cartButtons.forEach(button => {
    button.addEventListener('click', () => {
        cartCount++;
        cartCountElement.textContent = cartCount;
        
        // Add animation feedback
        button.textContent = '¡Añadido!';
        button.style.background = '#4CAF50';
        
        setTimeout(() => {
            button.textContent = 'Añadir al Carrito';
            button.style.background = '#333';
        }, 2000);
    });
});

// Quick View Modal
const quickViewButtons = document.querySelectorAll('.quick-view');
const modal = document.getElementById('quickViewModal');
const closeModal = document.querySelector('.close-modal');
const modalBody = document.querySelector('.modal-body');

quickViewButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const productCard = button.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        const productPrice = productCard.querySelector('.price').textContent;
        const productImage = productCard.querySelector('img').src;
        
        modalBody.innerHTML = `
            <div class="modal-product">
                <div class="modal-image">
                    <img src="${productImage}" alt="${productName}">
                </div>
                <div class="modal-info">
                    <h2>${productName}</h2>
                    <p class="modal-price">${productPrice}</p>
                    <p>Descripción del producto. Materiales de alta calidad, diseño exclusivo y comodidad garantizada.</p>
                    <div class="size-selector">
                        <label>Talla:</label>
                        <select>
                            <option>36</option>
                            <option>37</option>
                            <option>38</option>
                            <option>39</option>
                            <option>40</option>
                        </select>
                    </div>
                    <button class="add-to-cart-modal">Añadir al Carrito</button>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        
        // Add event listener to modal add to cart button
        const modalAddToCart = document.querySelector('.add-to-cart-modal');
        modalAddToCart.addEventListener('click', () => {
            cartCount++;
            cartCountElement.textContent = cartCount;
            modal.style.display = 'none';
        });
    });
});

// Close modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
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

// Newsletter form submission
const newsletterForm = document.querySelector('.newsletter-form');
newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]').value;
    alert(`¡Gracias por suscribirte con el email: ${email}!`);
    newsletterForm.reset();
});

// Contact form submission
const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('¡Gracias por tu mensaje! Te contactaremos pronto.');
    contactForm.reset();
});

// Search form submission
const searchForm = document.querySelector('.search-form');
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = document.querySelector('.search-input').value;
    if (searchTerm.trim()) {
        alert(`Buscando: ${searchTerm}`);
        searchOverlay.classList.remove('active');
    }
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#fff';
        navbar.style.backdropFilter = 'none';
    }
});

// Product image hover effect enhancement
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Close submenús when clicking outside (desktop)
document.addEventListener('click', (e) => {
    if (window.innerWidth > 768) {
        const isClickInsideSubmenu = e.target.closest('.menu-item-has-children');
        if (!isClickInsideSubmenu) {
            document.querySelectorAll('.submenu').forEach(submenu => {
                submenu.style.opacity = '0';
                submenu.style.visibility = 'hidden';
            });
        }
    }
});