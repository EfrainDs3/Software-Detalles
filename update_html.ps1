# Script para actualizar ventas.html con el nuevo CSS

$filePath = "d:\Software-Detalles-6\src\main\resources\templates\software\ventas\ventas.html"
$content = Get-Content $filePath -Raw

# Crear backup
$backupPath = "$filePath.backup"
Copy-Item $filePath $backupPath -Force
Write-Host "Backup created at: $backupPath"

# Buscar y actualizar la línea del CSS
$pattern = '(<link rel="stylesheet" href="/css/ventas\.css">)'
$replacement = '$1' + "`r`n" + '    <link rel="stylesheet" href="/css/ventas_dropdown.css">'

$content = $content -replace $pattern, $replacement

# Guardar el archivo modificado
$content | Set-Content $filePath -NoNewline
Write-Host "HTML file updated successfully!"
Write-Host "Added ventas_dropdown.css reference"
