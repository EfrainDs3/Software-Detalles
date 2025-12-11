# Script PowerShell para actualizar todos los HTML con la funcionalidad del modal
# Ejecutar desde: E:\SEPTIMO CICLO\LP2\Software-Detalles\src\main\resources\static\Detalles_web

Write-Host "Iniciando actualizacion de archivos HTML con modal de productos..." -ForegroundColor Cyan
Write-Host ""

# Lista de archivos a actualizar
$productPages = @(
    # Mujeres
    "mujeres\botas.html",
    "mujeres\sandalias.html",
    "mujeres\tacones.html",
    "mujeres\zapatillas-deportivas.html",
    "mujeres\zapatos-casuales.html",
    "mujeres-accesorios\billeteras.html",
    "mujeres-accesorios\bolsos.html",
    "mujeres-accesorios\cinturones.html",
    
    # Hombres
    "hombres\botas-h.html",
    "hombres\sandalias-h.html",
    "hombres\zapatillas-deportivas-h.html",
    "hombres\zapatos-casuales-h.html",
    "hombres\zapatos-formales-h.html",
    "hombres-accesorios\billeteras-h.html",
    "hombres-accesorios\cinturones-h.html",
    "hombres-accesorios\gafas-de-sol-h.html",
    "hombres-accesorios\gorros-h.html",
    "hombres-accesorios\relojes-h.html",
    
    # Niños
    "niños\botas.html",
    "niños\pantuflas.html",
    "niños\sandalias.html",
    "niños\zapatillas-deportivas.html",
    "niños\zapatos-casuales.html",
    "niños\zapatos-escolares.html",
    "niños-accesorios\calcetines.html",
    "niños-accesorios\cinturones.html",
    "niños-accesorios\gorras.html",
    "niños-accesorios\lentes-sol.html"
)

$updated = 0
$alreadyUpdated = 0
$errors = 0

foreach ($file in $productPages) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "Archivo no encontrado: $file" -ForegroundColor Red
        $errors++
        continue
    }
    
    try {
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        $originalContent = $content
        $modified = $false
        
        # 1. Agregar CSS del modal si no existe
        if ($content -notmatch 'product-modal\.css') {
            Write-Host "  -> Agregando CSS del modal a $file" -ForegroundColor Yellow
            $content = $content -replace '(<link rel="stylesheet" href=".*?styles\.css">)', "`$1`r`n    <link rel=`"stylesheet`" href=`"../css/product-modal.css`">"
            $modified = $true
        }
        
        # 2. Agregar JS del modal si no existe
        if ($content -notmatch 'product-modal\.js') {
            Write-Host "  -> Agregando JavaScript del modal a $file" -ForegroundColor Yellow
            $content = $content -replace '(<script src=".*?favorites-handler\.js"></script>)', "    <script src=`"../js/product-modal.js`"></script>`r`n    `$1"
            $modified = $true
        }
        
        # 3. Hacer las tarjetas clickeables si aún no lo están
        if ($content -notmatch 'onclick="abrirModalProducto') {
            Write-Host "  -> Haciendo tarjetas de producto clickeables en $file" -ForegroundColor Yellow
            
            # Actualizar div de tarjeta de producto
            $content = $content -replace '<div class="product-card-detailed" data-product-id="\$\{producto\.id\}">', '<div class="product-card-detailed" data-product-id="${producto.id}" onclick="abrirModalProducto(${producto.id})" style="cursor: pointer;">'
            
            # Actualizar botón de vista rápida
            $content = $content -replace 'onclick="vistaRapida\(\$\{producto\.id\}\)">Vista Rápida', 'onclick="event.stopPropagation(); abrirModalProducto(${producto.id})">Ver Detalles'
            
            # Actualizar botón de carrito
            $content = $content -replace 'onclick="agregarAlCarrito\(\$\{producto\.id\}\)"', 'onclick="event.stopPropagation(); agregarAlCarrito(${producto.id})"'
            
            # Actualizar botón de favoritos
            $content = $content -replace 'onclick="agregarFavoritos\(\$\{producto\.id\}\)"', 'onclick="event.stopPropagation(); agregarFavoritos(${producto.id})"'
            
            $modified = $true
        }
        
        # 4. Actualizar función vistaRapida
        if ($content -match 'function vistaRapida\(productoId\).*?alert\(`Vista rápida') {
            Write-Host "  -> Actualizando funcion vistaRapida en $file" -ForegroundColor Yellow
            $content = $content -replace 'function vistaRapida\(productoId\) \{[^\}]*alert\(`Vista rápida del producto \$\{productoId\}`\);[^\}]*\}', @"
function vistaRapida(productoId) {
            // Esta función ahora abre el modal
            abrirModalProducto(productoId);
        }
"@
            $modified = $true
        }
        
        if ($modified) {
            Set-Content -Path $fullPath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "Actualizado: $file" -ForegroundColor Green
            $updated++
        } else {
            Write-Host "Ya actualizado: $file" -ForegroundColor Gray
            $alreadyUpdated++
        }
        
    } catch {
        Write-Host "Error procesando $file : $_" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "RESUMEN DE ACTUALIZACION" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "Archivos actualizados:    $updated" -ForegroundColor Green
Write-Host "Ya estaban actualizados: $alreadyUpdated" -ForegroundColor Gray
Write-Host "Errores encontrados:      $errors" -ForegroundColor Red
Write-Host "Total procesados:         $($productPages.Count)" -ForegroundColor White
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proceso completado!" -ForegroundColor Green
Write-Host ""
