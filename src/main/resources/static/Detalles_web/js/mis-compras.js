/**
 * mis-compras.js
 * Maneja la visualización del historial de compras
 */

console.log("=== MIS-COMPRAS.JS CARGADO ===");

(function () {
    const API_COMPRAS = '/api/compras';

    console.log("IIFE ejecutándose, API_COMPRAS:", API_COMPRAS);

    /**
     * Inicialización
     */
    document.addEventListener('DOMContentLoaded', () => {
        console.log("=== DOMContentLoaded disparado en mis-compras.js ===");
        cargarCompras();
    });

    /**
     * Carga el historial de compras
     */
    async function cargarCompras() {
        console.log("=== cargarCompras() llamada ===");
        console.log("Haciendo fetch a:", API_COMPRAS);

        try {
            console.log("Iniciando fetch...");
            const response = await fetch(API_COMPRAS, { credentials: 'include' });
            console.log("Respuesta recibida, status:", response.status);

            if (response.status === 401) {
                console.log("401 - Redirigiendo a login");
                window.location.href = '/Detalles_web/login/logueo.html';
                return;
            }

            if (!response.ok) {
                console.error("Respuesta no OK:", response.status, response.statusText);
                throw new Error('Error al cargar compras');
            }

            const data = await response.json();
            console.log("Datos recibidos:", data);

            mostrarCompras(data.compras);

        } catch (error) {
            console.error('Error en cargarCompras:', error);
            mostrarError();
        }
    }

    /**
     * Muestra las compras en la página
     */
    function mostrarCompras(compras) {
        const container = document.querySelector('.purchases-container');

        if (!compras || compras.length === 0) {
            // Ya está el mensaje de "sin compras" en el HTML
            return;
        }

        // Reemplazar contenido
        container.innerHTML = `
            <h1>Historial de Compras</h1>
            <div class="compras-grid" style="display: grid; gap: 20px; margin-top: 30px;">
                ${compras.map(compra => crearCardCompra(compra)).join('')}
            </div>
        `;
    }

    /**
     * Crea una card de compra
     */
    function crearCardCompra(compra) {
        const fecha = new Date(compra.fechaEmision).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        const estadoBadge = obtenerBadgeEstado(compra.estado);

        return `
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">
                            ${fecha}
                        </div>
                        <div style="font-size: 18px; font-weight: 600; color: #333;">
                            ${compra.numeroComprobante}
                        </div>
                        <div style="font-size: 13px; color: #666; margin-top: 5px;">
                            ${compra.tipoComprobante}
                        </div>
                    </div>
                    <div>
                        ${estadoBadge}
                    </div>
                </div>

                <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #666;">Subtotal:</span>
                        <span>S/ ${parseFloat(compra.subtotal).toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #666;">IGV (18%):</span>
                        <span>S/ ${parseFloat(compra.igv).toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 18px; color: #e91e63;">
                        <span>Total:</span>
                        <span>S/ ${parseFloat(compra.total).toFixed(2)}</span>
                    </div>
                </div>

                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #666; font-size: 14px;">
                        <i class="fas fa-box"></i> ${compra.cantidadItems} item(s)
                    </span>
                    <button 
                        onclick="verDetalleCompra(${compra.idComprobante})"
                        style="padding: 8px 20px; background: #e91e63; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;"
                    >
                        <i class="fas fa-eye"></i> Ver Detalle
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Obtiene el badge HTML según el estado
     */
    function obtenerBadgeEstado(estado) {
        const estados = {
            'Emitido': { color: '#4caf50', texto: 'Emitido' },
            'Anulado': { color: '#f44336', texto: 'Anulado' },
            'Pendiente': { color: '#ff9800', texto: 'Pendiente' }
        };

        const config = estados[estado] || { color: '#9e9e9e', texto: estado };

        return `
            <div style="background: ${config.color}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                ${config.texto}
            </div>
        `;
    }

    /**
     * Ver detalle de una compra (función global)
     */
    window.verDetalleCompra = async function (idComprobante) {
        try {
            const response = await fetch(`${API_COMPRAS}/${idComprobante}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Error al cargar detalle');
            }

            const compra = await response.json();
            mostrarModalDetalle(compra);

        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar el detalle de la compra');
        }
    };

    /**
     * Muestra modal con detalle de compra
     */
    function mostrarModalDetalle(compra) {
        const fecha = new Date(compra.fechaEmision).toLocaleString('es-PE');

        const detallesHTML = compra.detalles.map(d => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px; text-align: left;">${d.producto}</td>
                <td style="padding: 12px; text-align: center;">${d.cantidad}</td>
                <td style="padding: 12px; text-align: right;">S/ ${parseFloat(d.precioUnitario).toFixed(2)}</td>
                <td style="padding: 12px; text-align: right; font-weight: 600;">S/ ${parseFloat(d.subtotal).toFixed(2)}</td>
            </tr>
        `).join('');

        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="background: white; border-radius: 12px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                    <div style="padding: 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; color: #333;">Detalle del Comprobante</h2>
                        <button onclick="this.closest('div').parentElement.parentElement.remove()" 
                                style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">
                            &times;
                        </button>
                    </div>
                    
                    <div style="padding: 25px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; background: #f5f5f5; padding: 20px; border-radius: 8px;">
                            <div>
                                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Número de Comprobante</div>
                                <div style="font-weight: 600; font-size: 16px;">${compra.numeroComprobante}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Tipo</div>
                                <div style="font-weight: 600;">${compra.tipoComprobante}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Fecha de Emisión</div>
                                <div style="font-weight: 600;">${fecha}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Estado</div>
                                <div style="font-weight: 600; color: #4caf50;">${compra.estado}</div>
                            </div>
                        </div>

                        <h3 style="margin-bottom: 15px; color: #333;">Productos</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;">
                                    <th style="padding: 12px; text-align: left;">Producto</th>
                                    <th style="padding: 12px; text-align: center;">Cant.</th>
                                    <th style="padding: 12px; text-align: right;">Precio Unit.</th>
                                    <th style="padding: 12px; text-align: right;">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${detallesHTML}
                            </tbody>
                        </table>

                        <div style="margin-top: 25px; padding-top: 20px; border-top: 2px solid #eee; text-align: right;">
                            <div style="display: flex; justify-content: flex-end; gap: 100px; margin-bottom: 10px;">
                                <span style="color: #666;">Subtotal:</span>
                                <span style="font-weight: 600;">S/ ${parseFloat(compra.subtotal).toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: flex-end; gap: 100px; margin-bottom: 10px;">
                                <span style="color: #666;">IGV (18%):</span>
                                <span style="font-weight: 600;">S/ ${parseFloat(compra.igv).toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: flex-end; gap: 100px; font-size: 20px; color: #e91e63;">
                                <span style="font-weight: 700;">Total:</span>
                                <span style="font-weight: 700;">S/ ${parseFloat(compra.total).toFixed(2)}</span>
                            </div>
                        </div>

                        <button onclick="this.closest('div').parentElement.parentElement.parentElement.remove()" 
                                style="width: 100%; margin-top: 25px; padding: 12px; background: #e91e63; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 600;">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Muestra mensaje de error
     */
    function mostrarError() {
        const container = document.querySelector('.purchases-container');
        container.innerHTML = `
            <h1>Historial de Compras</h1>
            <div class="empty-purchases">
                <i class="fas fa-exclamation-triangle" style="color: #f44336;"></i>
                <h2>Error al cargar compras</h2>
                <p>Por favor intenta nuevamente más tarde</p>
                <button onclick="window.location.reload()" 
                        style="padding: 12px 24px; background: #e91e63; color: white; border: none; border-radius: 6px; margin-top: 20px; cursor: pointer; font-size: 16px;">
                    Reintentar
                </button>
            </div>
        `;
    }

})();
