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

      const res = await fetch(`/api/carrito/${userId}/agregar`, {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              idProducto: productId,
              cantidad: 1
          })
      });

      if (!res.ok) {
          alert("Error al agregar al carrito");
          return;
      }

      alert("Producto agregado al carrito");
  }


  function wireButtons(authData) {

      const isAuth = authData.authenticated === true;

      document.querySelectorAll(".add-to-cart").forEach(btn => {

          if (btn.dataset.bound === "1") return;
          btn.dataset.bound = "1";

          btn.addEventListener("click", (e) => {
              e.preventDefault();

              const productId = btn.getAttribute("data-id");

              if (!isAuth) {
                  // Usuario no logueado → login
                  window.location.href = LOGIN_URL;
                  return;
              }

              // Usuario logueado → backend real
              agregarAlCarrito(productId, authData.userId);
          });

      });
  }


  document.addEventListener("DOMContentLoaded", () => {

      fetch("/api/auth/status", { credentials: "include" })
          .then(r => (r.ok ? r.json() : { authenticated: false }))
          .then(data => wireButtons(data))
          .catch(() => wireButtons({ authenticated: false }));
  });

})();
