document.addEventListener('DOMContentLoaded', () => {
    const cartItemsList = document.querySelector('.cart-items-list');
    const cartSubtotalElement = document.getElementById('cart-subtotal');
    const cartTotalElement = document.getElementById('cart-total');
    const cartContent = document.querySelector('.cart-content');
    const emptyCartMessage = document.querySelector('.empty-cart-message');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const renderCart = () => {
        if (cart.length === 0) {
            // Si el carrito está vacío, muestra el mensaje y oculta el resto
            cartContent.style.display = 'none';
            emptyCartMessage.style.display = 'block';
            return;
        }
        
        // Si hay productos, asegúrate de que se muestre el contenido principal
        cartContent.style.display = 'grid';
        emptyCartMessage.style.display = 'none';

        cartItemsList.innerHTML = ''; // Limpiar la lista antes de volver a renderizar
        let subtotal = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const cartItemHTML = `
                <div class="cart-item" data-index="${index}">
                    <div class="cart-item-img">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-info">
                        <h3>${item.name}</h3>
                        <p class="item-price">$${item.price.toFixed(2)}</p>
                        <div class="quantity-controls">
                            <button class="quantity-decrease">-</button>
                            <input type="number" class="item-quantity" value="${item.quantity}" min="1" readonly>
                            <button class="quantity-increase">+</button>
                        </div>
                    </div>
                    <button class="remove-item" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            cartItemsList.innerHTML += cartItemHTML;
        });
        
        // Actualizar totales
        cartSubtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        cartTotalElement.textContent = `$${subtotal.toFixed(2)}`; // Asumiendo envío gratis
    };

    // Event listener para los controles de cantidad y eliminación
    cartItemsList.addEventListener('click', (event) => {
        const target = event.target;
        const cartItem = target.closest('.cart-item');
        if (!cartItem) return;

        const index = parseInt(cartItem.dataset.index);

        if (target.classList.contains('quantity-increase') || target.parentElement.classList.contains('quantity-increase')) {
            cart[index].quantity++;
        } else if (target.classList.contains('quantity-decrease') || target.parentElement.classList.contains('quantity-decrease')) {
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
            }
        } else if (target.classList.contains('remove-item') || target.parentElement.classList.contains('remove-item')) {
            // Eliminar el item del array
            cart.splice(index, 1);
        }

        // Guardar cambios en localStorage y volver a renderizar
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        // Actualizar el contador del header (si la función está disponible globalmente o importada)
        if(typeof updateCartCounter === 'function') {
            updateCartCounter();
        }
    });

    renderCart();
});