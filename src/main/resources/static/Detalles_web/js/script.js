// =================================================================================
// ARCHIVO: script.js (Versión CORREGIDA)
// =================================================================================

document.addEventListener('DOMContentLoaded', function () {

    // --- ADAPTADOR DE API PARA VISTA CLIENTE (calzados) ---
    // Intercepta llamadas a `/api/productos/buscar?categoria=...` y las redirige
    // a los endpoints nuevos `/api/productos/calzados?sexo=...&tipo=...`
    (function installProductosApiAdapter(){
        const originalFetch = window.fetch.bind(window);

        const sexoMap = {
            'mujeres': 'MUJER',
            'mujer': 'MUJER',
            'hombres': 'HOMBRE',
            'hombre': 'HOMBRE',
            'ninos': 'NIÑO',
            'niños': 'NIÑO',
            'nino': 'NIÑO',
            'niño': 'NIÑO'
        };

        const tipoSlugToName = {
            'zapatillas-deportivas': 'Zapatillas Deportivas',
            'zapatos-casuales': 'Zapatos Casuales',
            'tacones': 'Tacones',
            'sandalias': 'Sandalias',
            'botas': 'Botas',
            'zapatos-formales': 'Zapatos Formales',
            'zapatos-escolares': 'Zapatos Escolares',
            'pantuflas': 'Pantuflas'
        };

        window.fetch = async function(input, init){
            try {
                const url = typeof input === 'string' ? input : (input && input.url) || '';
                if (!url || !url.startsWith('/api/productos/buscar')){
                    return originalFetch(input, init);
                }

                const u = new URL(url, window.location.origin);
                const params = new URLSearchParams(u.search);
                const categoria = params.get('categoria');
                const tipo = params.get('tipo');
                const nombre = params.get('nombre');

                if (categoria){
                    const sexo = sexoMap[categoria.toLowerCase()];
                    if (!sexo){
                        return originalFetch(input, init);
                    }
                    if (tipo){
                        const tipoName = tipoSlugToName[tipo.toLowerCase()];
                        if (!tipoName){
                            return originalFetch(input, init);
                        }
                        const newUrl = `/api/productos/calzados?sexo=${sexo}&tipo=${encodeURIComponent(tipoName)}`;
                        return originalFetch(newUrl, init);
                    }
                    if (nombre){
                        // buscar por nombre y filtrar por sexo en el cliente
                        const nameUrl = `/api/productos/buscar?nombre=${encodeURIComponent(nombre)}`;
                        const resp = await originalFetch(nameUrl, init);
                        if (!resp.ok) return resp;
                        const data = await resp.json();
                        const filtered = Array.isArray(data) ? data.filter(p => (p.tipo || '').toString().toUpperCase() === sexo) : data;
                        const body = JSON.stringify(filtered);
                        return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } });
                    }
                    // solo categoria -> listar por sexo
                    const newUrl = `/api/productos/calzados?sexo=${sexo}`;
                    return originalFetch(newUrl, init);
                }

                return originalFetch(input, init);
            } catch (e) {
                return originalFetch(input, init);
            }
        };
    })();

    // --- LÓGICA DEL MENÚ DE NAVEGACIÓN ---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    document.querySelectorAll('.menu-item-has-children > a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && e.target.closest('.menu-item-has-children')) {
                e.preventDefault();
                const submenu = link.nextElementSibling;
                if (submenu) {
                    submenu.classList.toggle('active');
                    const icon = link.querySelector('i');
                    if (icon) {
                        icon.style.transform = submenu.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
                    }
                }
            }
        });
    });

    // --- LÓGICA DE BÚSQUEDA ---
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
    
    // --- LÓGICA DE LA PAGINACIÓN ---
    const productsGrid = document.querySelector('.products-grid-detailed');
    const paginationContainer = document.querySelector('.pagination');
    
    if (productsGrid && paginationContainer) {
        const allProducts = Array.from(productsGrid.querySelectorAll('.product-card-detailed'));
        const productsPerPage = 9;
        const totalPages = Math.ceil(allProducts.length / productsPerPage);
        let currentPage = 1;

        function showPage(page) {
            const startIndex = (page - 1) * productsPerPage;
            const endIndex = startIndex + productsPerPage;
            allProducts.forEach(product => product.style.display = 'none');
            const productsToShow = allProducts.slice(startIndex, endIndex);
            productsToShow.forEach(product => product.style.display = 'block');
        }

        function setupPagination() {
            paginationContainer.innerHTML = '';
            
            // Botón "Anterior"
            const prevButton = document.createElement('a');
            prevButton.href = '#';
            prevButton.innerHTML = '&laquo;';
            if (currentPage === 1) prevButton.classList.add('disabled');
            prevButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentPage > 1) {
                    currentPage--;
                    showPage(currentPage);
                    setupPagination();
                }
            });
            paginationContainer.appendChild(prevButton);

            // Botones de números
            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('a');
                pageButton.href = '#';
                pageButton.innerText = i;
                if (i === currentPage) pageButton.classList.add('active');
                pageButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentPage = i;
                    showPage(currentPage);
                    setupPagination();
                });
                paginationContainer.appendChild(pageButton);
            }

            // Botón "Siguiente"
            const nextButton = document.createElement('a');
            nextButton.href = '#';
            nextButton.innerHTML = '&raquo;';
            if (currentPage === totalPages) nextButton.classList.add('disabled');
            nextButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentPage < totalPages) {
                    currentPage++;
                    showPage(currentPage);
                    setupPagination();
                }
            });
            paginationContainer.appendChild(nextButton);
        }

        if (allProducts.length > 0) {
            showPage(currentPage);
            setupPagination();
        }
    }

    // --- LÓGICA DEL CARRITO DE COMPRAS ---
    const cartCountElement = document.querySelector('.cart-count');

    const updateCartCounter = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cartCountElement) {
            cartCountElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        }
    };

    const addToCart = (product) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProductIndex = cart.findIndex(item => item.id === product.id);

        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            cart.push(product);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCounter();
        alert(`${product.name} ha sido añadido al carrito.`);
    };

    // Event listener para los botones "Añadir al Carrito"
    document.body.addEventListener('click', event => {
        if (event.target.classList.contains('btn-add-cart') && event.target.closest('.product-card-detailed')) {
            const productCard = event.target.closest('.product-card-detailed');
            if (productCard) {
                const product = {
                    id: productCard.dataset.productId,
                    name: productCard.querySelector('.product-title-detailed').textContent,
                    price: parseFloat(productCard.querySelector('.current-price').textContent.replace('S/', '').replace('$', '')),
                    image: productCard.querySelector('.product-image-detailed img').src,
                    quantity: 1
                };
                addToCart(product);
            }
        }
    });

    // Iniciar el contador del carrito
    updateCartCounter();
    
    // --- OTRAS FUNCIONALIDADES ---
    document.querySelectorAll('.size-option, .color-option').forEach(option => {
        option.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });
    
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

     // ===== CARRUSEL HERO =====
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    // Solo inicializar si existe el carrusel
    if (slides.length > 0) {
        let currentSlide = 0;
        let slideInterval;

        // Función para mostrar slide
        function showSlide(n) {
            slides.forEach(slide => slide.classList.remove('active'));
            indicators.forEach(indicator => indicator.classList.remove('active'));
            
            currentSlide = (n + slides.length) % slides.length;
            
            slides[currentSlide].classList.add('active');
            indicators[currentSlide].classList.add('active');
        }

        // Función para siguiente slide
        function nextSlide() {
            showSlide(currentSlide + 1);
        }

        // Función para slide anterior
        function prevSlide() {
            showSlide(currentSlide - 1);
        }

        // Iniciar carrusel automático
        function startSlider() {
            slideInterval = setInterval(nextSlide, 8000); // Cambia cada 5 segundos
        }

        // Detener carrusel automático
        function stopSlider() {
            clearInterval(slideInterval);
        }

        // Event listeners
        if (nextBtn && prevBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                stopSlider();
                startSlider();
            });

            prevBtn.addEventListener('click', () => {
                prevSlide();
                stopSlider();
                startSlider();
            });
        }

        // Event listeners para indicadores
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                showSlide(index);
                stopSlider();
                startSlider();
            });
        });

        // Pausar carrusel al hacer hover
        const heroSlider = document.querySelector('.hero-slider');
        if (heroSlider) {
            heroSlider.addEventListener('mouseenter', stopSlider);
            heroSlider.addEventListener('mouseleave', startSlider);
        }

        // Iniciar carrusel
        startSlider();
    }

}); // <-- FIN DEL DOMContentLoaded