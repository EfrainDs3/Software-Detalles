// =================================================================================
// ARCHIVO: script.js (Versión Definitiva y Organizada)
// Contiene toda la lógica compartida: Menú, Búsqueda, Paginación, Carrito, etc.
// =================================================================================

document.addEventListener('DOMContentLoaded', function () {

    // --- LÓGICA DEL MENÚ DE NAVEGACIÓN (Tu código original, no se borró) ---
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
                    submenu.classList.toggle('active'); // Usamos clases para mejor control
                    const icon = link.querySelector('i');
                    if (icon) {
                        icon.style.transform = submenu.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
                    }
                }
            }
        });
    });


    // --- LÓGICA DE BÚSQUEDA (Tu código original, no se borró) ---
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
    
    // --- LÓGICA DE LA PAGINACIÓN (Código unificado) ---
    const productsGrid = document.querySelector('.products-grid-detailed');
    const paginationContainer = document.querySelector('.pagination');
    
    // Este "if" evita que el código de error en páginas que NO tienen grilla de productos.
    if (productsGrid && paginationContainer) {
        const allProducts = Array.from(productsGrid.querySelectorAll('.product-card-detailed'));
        const productsPerPage = 6; // Puedes cambiar este número
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

    // --- LÓGICA DEL CARRITO DE COMPRAS (Versión mejorada con localStorage) ---
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

    // Event listener global para los botones "Añadir al Carrito"
    document.body.addEventListener('click', event => {
        // Aseguramos que solo reaccione a los botones de añadir y no a los de "Aplicar Filtros"
        if (event.target.classList.contains('btn-add-cart') && event.target.closest('.product-card-detailed')) {
            const productCard = event.target.closest('.product-card-detailed');
            if (productCard) {
                const product = {
                    id: productCard.dataset.productId,
                    name: productCard.querySelector('.product-title-detailed').textContent,
                    price: parseFloat(productCard.querySelector('.current-price').textContent.replace('$', '')),
                    image: productCard.querySelector('.product-image-detailed img').src,
                    quantity: 1
                };
                addToCart(product);
            }
        }
    });

    // Iniciar el contador del carrito al cargar la página
    updateCartCounter();
    
    // --- OTRAS FUNCIONALIDADES (Tu código original, no se borró) ---
    
    // Filtros
    document.querySelectorAll('.size-option, .color-option').forEach(option => {
        option.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });
    
    // Navbar con scroll
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


}); // <-- FIN DEL DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    const productsGrid = document.querySelector('.products-grid-detailed');
    const allProducts = Array.from(productsGrid.querySelectorAll('.product-card-detailed'));
    const paginationContainer = document.querySelector('.pagination');
    
    const productsPerPage = 9; // Define cuántos productos quieres por página
    const totalProducts = allProducts.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    let currentPage = 1;

    function showPage(page) {
        // Calcula los índices de inicio y fin
        const startIndex = (page - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;

        // Oculta todos los productos
        allProducts.forEach(product => product.style.display = 'none');

        // Muestra solo los productos de la página actual
        const productsToShow = allProducts.slice(startIndex, endIndex);
        productsToShow.forEach(product => product.style.display = 'block'); // O 'grid', 'flex', etc., según tu layout
        
        // Desplaza la vista al inicio de la lista de productos
        productsGrid.scrollIntoView({ behavior: 'smooth' });
    }

    function setupPagination() {
        paginationContainer.innerHTML = ''; // Limpia los botones existentes

        // Botón "Anterior"
        const prevButton = document.createElement('a');
        prevButton.href = '#';
        prevButton.innerHTML = '&laquo;'; // Flecha izquierda
        if (currentPage === 1) {
            prevButton.classList.add('disabled');
        }
        prevButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                showPage(currentPage);
                setupPagination();
            }
        });
        paginationContainer.appendChild(prevButton);

        // Botones de números de página
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('a');
            pageButton.href = '#';
            pageButton.innerText = i;
            if (i === currentPage) {
                pageButton.classList.add('active');
            }

            pageButton.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                showPage(currentPage);
                setupPagination(); // Vuelve a dibujar para actualizar el estado 'active'
            });
            paginationContainer.appendChild(pageButton);
        }

        // Botón "Siguiente"
        const nextButton = document.createElement('a');
        nextButton.href = '#';
        nextButton.innerHTML = '&raquo;'; // Flecha derecha
        if (currentPage === totalPages) {
            nextButton.classList.add('disabled');
        }
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

    // Inicializa la vista con la primera página
    showPage(currentPage);
    setupPagination();
});