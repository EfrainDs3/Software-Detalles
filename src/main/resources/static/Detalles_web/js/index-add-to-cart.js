/**
 * index-add-to-cart.js
 * - Verifica si el usuario está autenticado consultando /api/auth/status.
 * - En botones .add-to-cart:
 *    - Si no autenticado: redirige a /Detalles_web/login/logueo.html
 *    - Si autenticado: agrega al carrito mediante API o navega a /carrito/agregar/{id}.
 *
 * Requisitos backend:
 * - GET /api/auth/status => { authenticated: boolean }
 * - Opcional: POST /api/cart/items (si usas API para carrito)
 *
 * Nota: Si usas el flujo actual de servidor (/carrito/agregar/{id})
 *       cambia USE_API_FLOW a false.
 */

(function () {

    const LOGIN_URL = "/Detalles_web/login/logueo.html";

    // Lógica REAL de tu backend
    async function agregarAlCarrito(productId, userId) {
        console.log("=== AGREGANDO AL CARRITO (FRONTEND) ===");
        console.log("Producto ID:", productId);
        console.log("Usuario ID:", userId);

        try {
            const url = `/api/carrito/${userId}/agregar`;
            console.log("URL de la petición:", url);

            const payload = {
                idProducto: productId,
                cantidad: 1
            };
            console.log("Payload:", JSON.stringify(payload));

            const res = await fetch(url, {
                credentials: "include",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            console.log("Respuesta status:", res.status);
            console.log("Respuesta OK:", res.ok);

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Error del servidor:", errorText);
                alert("Error al agregar al carrito: " + errorText);
                return;
            }

            const data = await res.json();
            console.log("Respuesta del servidor:", data);
            alert("Producto agregado al carrito");

            // Actualizar contador
            if (typeof updateCartCount === 'function') {
                updateCartCount();
            }
        } catch (error) {
            console.error("Error en agregarAlCarrito:", error);
            alert("Error: " + error.message);
        }
    }


    function wireButtons(authData) {
        console.log("=== CONFIGURANDO BOTONES ===");
        console.log("AuthData recibido:", authData);

        const isAuth = authData.authenticated === true;
        console.log("¿Usuario autenticado?:", isAuth);
        console.log("User ID:", authData.userId);

        const buttons = document.querySelectorAll(".add-to-cart");
        console.log("Botones encontrados:", buttons.length);

        buttons.forEach((btn, index) => {

            if (btn.dataset.bound === "1") {
                console.log(`Botón ${index} ya está vinculado, skip`);
                return;
            }
            btn.dataset.bound = "1";

            console.log(`Vinculando botón ${index}, producto ID:`, btn.getAttribute("data-id"));

            btn.addEventListener("click", (e) => {
                console.log("=== CLICK EN BOTÓN AÑADIR AL CARRITO ===");
                e.preventDefault();

                const productId = btn.getAttribute("data-id");
                console.log("Producto ID del botón:", productId);
                console.log("¿Autenticado?:", isAuth);

                if (!isAuth) {
                    console.log("Usuario NO autenticado, redirigiendo a login");
                    window.location.href = LOGIN_URL;
                    return;
                }

                console.log("Usuario autenticado, llamando a agregarAlCarrito");
                agregarAlCarrito(productId, authData.userId);
            });

        });
    }


    document.addEventListener("DOMContentLoaded", () => {
        console.log("=== INDEX-ADD-TO-CART.JS CARGADO ===");

        fetch("/api/auth/status", { credentials: "include" })
            .then(r => {
                console.log("Respuesta de /api/auth/status:", r.status);
                return r.ok ? r.json() : { authenticated: false };
            })
            .then(data => {
                console.log("Datos de autenticación:", data);
                wireButtons(data);
            })
            .catch(error => {
                console.error("Error al obtener auth status:", error);
                wireButtons({ authenticated: false });
            });
    });

})();

// Exponer función globalmente para re-vincular botones después de cargar contenido dinámico
window.wireCartButtons = function () {
    console.log("window.wireCartButtons() llamada - Re-vinculando botones...");
    fetch("/api/auth/status", { credentials: "include" })
        .then(r => r.ok ? r.json() : { authenticated: false })
        .then(data => {
            const buttons = document.querySelectorAll(".add-to-cart");
            console.log("Re-vinculación: botones encontrados:", buttons.length);
            buttons.forEach(btn => {
                if (btn.dataset.bound === "1") return;
                btn.dataset.bound = "1";

                btn.addEventListener("click", async (e) => {
                    e.preventDefault();
                    const productId = btn.getAttribute("data-id");

                    if (!data.authenticated) {
                        window.location.href = "/Detalles_web/login/logueo.html";
                        return;
                    }

                    // Llamar a agregar al carrito
                    try {
                        const res = await fetch(`/api/carrito/${data.userId}/agregar`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ idProducto: productId, cantidad: 1 })
                        });

                        if (res.ok) {
                            alert("Producto agregado al carrito");
                            if (typeof updateCartCount === 'function') {
                                updateCartCount();
                            }
                        } else {
                            alert("Error al agregar al carrito");
                        }
                    } catch (error) {
                        console.error("Error:", error);
                        alert("Error: " + error.message);
                    }
                });
            });
        });
};

// Auto-detect cuando se agregan nuevos botones al DOM
const observerAutowire = new MutationObserver(() => {
    const unboundButtons = document.querySelectorAll(".add-to-cart:not([data-bound='1'])");
    if (unboundButtons.length > 0) {
        console.log(`MutationObserver detectó ${unboundButtons.length} botones nuevos, auto-vinculando...`);
        window.wireCartButtons();
    }
});

// Observar cambios en el DOM
observerAutowire.observe(document.body, {
    childList: true,
    subtree: true
});

console.log("✅ MutationObserver activado para auto-vincular botones del carrito");

