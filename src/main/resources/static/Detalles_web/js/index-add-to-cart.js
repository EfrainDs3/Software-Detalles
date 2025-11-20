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
  const USE_API_FLOW = true; // true: llama a /api/cart/items; false: redirige a /carrito/agregar/{id}
  const LOGIN_URL = '/Detalles_web/login/logueo.html';

  function addToCartApi(productId) {
    return fetch('/api/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ productId, qty: 1 }),
      credentials: 'same-origin'
    });
  }

  function addToCartServerRedirect(productId) {
    window.location.href = '/carrito/agregar/' + encodeURIComponent(productId);
  }

  function wireButtons(isAuth) {
    const buttons = document.querySelectorAll('.add-to-cart');
    buttons.forEach((btn) => {
      // Evitar listeners duplicados si el script se carga más de una vez
      if (btn.dataset.boundAddToCart === '1') return;
      btn.dataset.boundAddToCart = '1';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const productId = btn.getAttribute('data-id');
        if (!productId) {
          console.warn('Botón Add to Cart sin data-id');
          return;
        }

        if (!isAuth) {
          window.location.href = LOGIN_URL;
          return;
        }

        if (USE_API_FLOW) {
          addToCartApi(productId)
            .then((res) => {
              if (res.status === 401) {
                window.location.href = LOGIN_URL;
                return;
              }
              if (!res.ok) {
                alert('Error al agregar al carrito');
                return;
              }
              // Feedback: aquí puedes actualizar contador del carrito si tienes función global updateCartCounter()
              if (typeof updateCartCounter === 'function') {
                try { updateCartCounter(); } catch (_) {}
              }
              // Opcional: notificación visual
              // alert('Producto añadido al carrito');
            })
            .catch(() => alert('Error de red'));
        } else {
          addToCartServerRedirect(productId);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Consultar estado de autenticación
    fetch('/api/auth/status', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : { authenticated: false }))
      .then((d) => {
        const isAuth = !!d.authenticated;
        wireButtons(isAuth);
      })
      .catch(() => {
        wireButtons(false);
      });
  });
})();