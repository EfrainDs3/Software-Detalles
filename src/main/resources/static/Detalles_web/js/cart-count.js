async function updateCartCount() {
    if (!window.USER_ID) return; // No hay usuario logueado

    const res = await fetch(`/api/carrito/${window.USER_ID}/count`, {
        credentials: "include"
    });

    if (!res.ok) return;

    const data = await res.json();

    const badge = document.querySelector(".cart-count");
    if (badge) {
        badge.textContent = data.count;
    }
}

document.addEventListener("DOMContentLoaded", updateCartCount);
