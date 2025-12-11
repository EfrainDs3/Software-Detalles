/**
 * Script para aplicar el modal de productos a todos los HTMLs de secciones
 * Este script actualiza automáticamente todos los archivos HTML de productos
 * para incluir la funcionalidad del modal
 */

const fs = require('fs');
const path = require('path');

// Archivos HTML de productos a actualizar
const productPages = [
    // Mujeres
    'mujeres/botas.html',
    'mujeres/sandalias.html',
    'mujeres/tacones.html',
    'mujeres/zapatillas-deportivas.html',
    'mujeres/zapatos-casuales.html',
    'mujeres-accesorios/billeteras.html',
    'mujeres-accesorios/bolsos.html',
    'mujeres-accesorios/cinturones.html',
    // Ya está actualizado: 'mujeres-accesorios/gafas-de-sol.html',

    // Hombres
    'hombres/botas-h.html',
    'hombres/sandalias-h.html',
    'hombres/zapatillas-deportivas-h.html',
    'hombres/zapatos-casuales-h.html',
    'hombres/zapatos-formales-h.html',
    'hombres-accesorios/billeteras-h.html',
    'hombres-accesorios/cinturones-h.html',
    'hombres-accesorios/gafas-de-sol-h.html',
    'hombres-accesorios/gorros-h.html',
    'hombres-accesorios/relojes-h.html',

    // Niños
    'niños/botas.html',
    'niños/pantuflas.html',
    'niños/sandalias.html',
    'niños/zapatillas-deportivas.html',
    'niños/zapatos-casuales.html',
    'niños/zapatos-escolares.html',
    'niños-accesorios/calcetines.html',
    'niños-accesorios/cinturones.html',
    'niños-accesorios/gorras.html',
    'niños-accesorios/lentes-sol.html'
];

const baseDir = 'E:/SEPTIMO CICLO/LP2/Software-Detalles/src/main/resources/static/Detalles_web/';

/**
 * Función para actualizar un archivo HTML
 */
function updateHtmlFile(filePath) {
    try {
        const fullPath = path.join(baseDir, filePath);

        if (!fs.existsSync(fullPath)) {
            console.log(`❌ Archivo no encontrado: ${filePath}`);
            return false;
        }

        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;

        // 1. Agregar CSS del modal si no existe
        if (!content.includes('product-modal.css')) {
            content = content.replace(
                /(<link rel="stylesheet" href=".*?styles\.css">)/,
                '$1\n    <link rel="stylesheet" href="../css/product-modal.css">'
            );
            modified = true;
        }

        // 2. Agregar JS del modal si no existe
        if (!content.includes('product-modal.js')) {
            // Buscar antes del cierre de body
            content = content.replace(
                /(<script src=".*?favorites-handler\.js"><\/script>)/,
                '<script src="../js/product-modal.js"></script>\n    $1'
            );
            modified = true;
        }

        // 3. Hacer las tarjetas de producto clickeables
        if (!content.includes('onclick="abrirModalProducto')) {
            // Actualizar las tarjetas de producto para que abran el modal
            content = content.replace(
                /<div class="product-card-detailed" data-product-id="\$\{producto\.id\}">/g,
                '<div class="product-card-detailed" data-product-id="${producto.id}" onclick="abrirModalProducto(${producto.id})" style="cursor: pointer;">'
            );

            // Actualizar botones para evitar propagación del evento
            content = content.replace(
                /onclick="agregarAlCarrito\(\$\{producto\.id\}\)"/g,
                'onclick="event.stopPropagation(); agregarAlCarrito(${producto.id})"'
            );

            content = content.replace(
                /onclick="agregarFavoritos\(\$\{producto\.id\}\)"/g,
                'onclick="event.stopPropagation(); agregarFavoritos(${producto.id})"'
            );

            // Actualizar botón de vista rápida
            content = content.replace(
                /onclick="vistaRapida\(\$\{producto\.id\}\)">Vista Rápida/g,
                'onclick="event.stopPropagation(); abrirModalProducto(${producto.id})">Ver Detalles'
            );

            modified = true;
        }

        // 4. Actualizar función vistaRapida si existe
        if (content.includes('function vistaRapida(productoId)')) {
            content = content.replace(
                /function vistaRapida\(productoId\) \{[\s\S]*?alert\(`Vista rápida del producto \$\{productoId\}`\);[\s\S]*?\}/,
                `function vistaRapida(productoId) {
            // Esta función ahora abre el modal
            abrirModalProducto(productoId);
        }`
            );
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`✅ Actualizado: ${filePath}`);
            return true;
        } else {
            console.log(`ℹ️  Ya actualizado: ${filePath}`);
            return false;
        }

    } catch (error) {
        console.error(`❌ Error procesando ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Función principal
 */
function main() {
    console.log('🚀 Iniciando actualización de archivos HTML...\n');

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    productPages.forEach(filePath => {
        const result = updateHtmlFile(filePath);
        if (result === true) {
            updated++;
        } else if (result === false) {
            skipped++;
        } else {
            errors++;
        }
    });

    console.log('\n📊 Resumen:');
    console.log(`   ✅ Actualizados: ${updated}`);
    console.log(`   ℹ️  Ya actualizados: ${skipped}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   📁 Total procesados: ${productPages.length}`);
    console.log('\n✨ Proceso completado!');
}

// Ejecutar
main();
