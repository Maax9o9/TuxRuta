# Script para aplicar el tema verde a todas las configuraciones de leyenda restantes

$filePath = "c:\Users\cachi\OneDrive\Escritorio\vsc\Multi6to\TuxRuta\src\app\features\admin\components\dashboard\passengers-total\passengers-total.component.ts"

# Leer el contenido del archivo
$content = Get-Content $filePath -Raw

# Patrón de reemplazo para las configuraciones básicas de leyenda
$pattern1 = 'labels: {\s*usePointStyle: true,\s*padding: 15,\s*\n\s*font: {\s*\n\s*}\s*}'
$replacement1 = @'
labels: {
            usePointStyle: true,
            padding: 15,
            generateLabels: (chart: any) => {
              const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
              const colors = ['#386641', '#6A994E', '#7BAD61'];
              return labels.map((label: any, index: number) => ({
                ...label,
                fontColor: colors[index % colors.length]
              }));
            },
            font: {
              
            }
          }
'@

# Aplicar el reemplazo
$newContent = $content -replace $pattern1, $replacement1

# Escribir el contenido modificado de vuelta al archivo
Set-Content $filePath $newContent -Encoding UTF8

Write-Host "Tema verde aplicado exitosamente a passengers-total.component.ts"
