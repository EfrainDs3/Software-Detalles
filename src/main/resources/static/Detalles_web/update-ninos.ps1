# Script simple para actualizar archivos de Niños con modal
$baseDir = "E:\SEPTIMO CICLO\LP2\Software-Detalles\src\main\resources\static\Detalles_web\"

$files = @(
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

foreach ($file in $files) {
    $fullPath = Join-Path $baseDir $file
    
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        $modified = $false
        
        # 1. Agregar CSS del modal
        if ($content -notmatch 'product-modal\.css') {
            $content = $content -replace '(<link rel="stylesheet" href=".*?styles\.css">)', "`$1`r`n    <link rel=`"stylesheet`" href=`"../css/product-modal.css`">"
            $modified = $true
        }
        
        # 2. Agregar JS del modal
        if ($content -notmatch 'product-modal\.js') {
            $content = $content -replace '(<script src=".*?favorites-handler\.js"></script>)', "    <script src=`"../js/product-modal.js`"></script>`r`n    `$1"
            $modified = $true
        }
        
        # 3. Hacer tarjetas clickeables
        if ($content -notmatch 'onclick="abrirModalProducto') {
            $content = $content -replace '<div class="product-card-detailed" data-product-id="\$\{producto\.id\}">', '<div class="product-card-detailed" data-product-id="${producto.id}" onclick="abrirModalProducto(${producto.id})" style="cursor: pointer;">'
            $content = $content -replace 'onclick="vistaRapida\(\$\{producto\.id\}\)">Vista Rápida', 'onclick="event.stopPropagation(); abrirModalProducto(${producto.id})">Ver Detalles'
            $content = $content -replace 'onclick="agregarAlCarrito\(\$\{producto\.id\}\)"', 'onclick="event.stopPropagation(); agregarAlCarrito(${producto.id})"'
            $content = $content -replace 'onclick="agregarFavoritos\(\$\{producto\.id\}\)"', 'onclick="event.stopPropagation(); agregarFavoritos(${producto.id})"'
            $modified = $true
        }
        
        # 4. Actualizar función vistaRapida
        if ($content -match 'function vistaRapida\(productoId\).*?alert\(`Vista rápida') {
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
        }
    } else {
        Write-Host "No encontrado: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Total actualizado: $updated archivos" -ForegroundColor Cyan
