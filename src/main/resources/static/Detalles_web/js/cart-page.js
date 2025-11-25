document.addEventListener("DOMContentLoaded", async () => {

    // Espera a que auth-status cargue
    await new Promise(resolve => setTimeout(resolve, 150));

    if (!window.USER_ID) {
        window.location.href = "/Detalles_web/login/logueo.html";
        return;
    }

    cargarCarrito();
});


async function cargarCarrito() {

    const res = await fetch(`/api/carrito/${window.USER_ID}`, {
        credentials: "include"
    });

    const data = await res.json();

    const container = document.getElementById("cart-container");

    if (!data.items || data.items.length === 0) {
        container.innerHTML = "<p>Tu carrito está vacío</p>";
        document.getElementById("cart-total").textContent = "S/ 0.00";
        return;
    }

    let html = `
        <table class="cart-table">
            <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cant.</th>
                <th>Subtotal</th>
                <th></th>
            </tr>
    `;

    data.items.forEach(item => {
        html += `
            <tr>
                <td>${item.nombreProducto}</td>
                <td>S/ ${item.precio.toFixed(2)}</td>
                <td>
                    <input type="number" value="${item.cantidad}"
                           min="1"
                           onchange="cambiarCantidad(${item.idDetalle}, this.value)">
                </td>
                <td>S/ ${(item.precio * item.cantidad).toFixed(2)}</td>
                <td>
                    <button onclick="eliminarDelCarrito(${item.idDetalle})">X</button>
                </td>
            </tr>
        `;
    });

    html += "</table>";

    container.innerHTML = html;
    document.getElementById("cart-total").textContent = `S/ ${data.total.toFixed(2)}`;
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
    await fetch(`/api/carrito/detalle/${idDetalle}`, {
        credentials: "include",
        method: "DELETE"
    });

    cargarCarrito();
    if (typeof updateCartCount === "function") updateCartCount();
}
