/**
 * cart-page.js
 * Mejorado con estilos para la tabla y funcionalidad de vaciar carrito
 */

document.addEventListener("DOMContentLoaded", async () => {

    // Espera a que auth-status cargue
    await new Promise(resolve => setTimeout(resolve, 150));

    if (!window.USER_ID) {
        window.location.href = "/Detalles_web/login/logueo.html";
        return;
    }

    cargarCarrito();

    // Vincular botón de vaciar carrito
    const btnVaciar = document.getElementById("vaciar-carrito");
    if (btnVaciar) {
        btnVaciar.addEventListener("click", vaciarCarrito);
    }
});


async function cargarCarrito() {

    const res = await fetch(`/api/carrito/${window.USER_ID}`, {
        credentials: "include"
    });

    const data = await res.json();

    const container = document.querySelector(".cart-items-list");

    if (!data.items || data.items.length === 0) {
        container.innerHTML = "<p>Tu carrito está vacío</p>";
        document.getElementById("cart-total").textContent = "S/ 0.00";
        document.getElementById("cart-subtotal").textContent = "S/ 0.00";

        // Actualizar contador a 0
        if (typeof updateCartCount === "function") updateCartCount();
        return;
    }

    let html = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.items.forEach(item => {
        html += `
            <tr>
                <td class="product-name" data-label="Producto">${item.nombreProducto}</td>
                <td class="product-price" data-label="Precio">S/ ${item.precio.toFixed(2)}</td>
                <td class="product-quantity" data-label="Cantidad">
                    <input type="number" value="${item.cantidad}"
                           min="1"
                           class="quantity-input"
                           onchange="cambiarCantidad(${item.idDetalle}, this.value)">
                </td>
                <td class="product-subtotal" data-label="Subtotal">S/ ${(item.precio * item.cantidad).toFixed(2)}</td>
                <td class="product-actions" data-label="Acciones">
                    <button onclick="eliminarDelCarrito(${item.idDetalle})" class="btn-delete" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
    document.getElementById("cart-total").textContent = `S/ ${data.total.toFixed(2)}`;
    document.getElementById("cart-subtotal").textContent = `S/ ${data.subtotal.toFixed(2)}`;
}

async function cambiarCantidad(idDetalle, cantidad) {
    await fetch(`/api/carrito/detalle/${idDetalle}/cantidad`, {
        credentials: "include",
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad: parseInt(cantidad) })
    });

    cargarCarrito();
    if (typeof updateCartCount === "function") updateCartCount();
}

async function eliminarDelCarrito(idDetalle) {
    if (!confirm("¿Eliminar este producto del carrito?")) return;

    await fetch(`/api/carrito/detalle/${idDetalle}`, {
        credentials: "include",
        method: "DELETE"
    });

    cargarCarrito();
    if (typeof updateCartCount === "function") updateCartCount();
}

async function vaciarCarrito() {
    if (!confirm("¿Estás seguro de que quieres vaciar todo el carrito?")) return;

    try {
        const res = await fetch(`/api/carrito/${window.USER_ID}/vaciar`, {
            credentials: "include",
            method: "DELETE"
        });

        if (res.ok) {
            alert("Carrito vaciado exitosamente");
            cargarCarrito();
            if (typeof updateCartCount === "function") updateCartCount();
        } else {
            alert("Error al vaciar el carrito");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al vaciar el carrito");
    }
}
