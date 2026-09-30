# Hyper Ventas

Sitio de dos páginas: **Inicio** (quién soy, qué hago, cómo comprar) y **Productos** (tienda con buscador, filtros por categoría, detalle de producto con botón para contactar al vendedor por WhatsApp), más redes, horario y ubicación.

## Cómo usarla
1. Abre `js/config.js` y cambia tu número de WhatsApp, redes, horario y ubicación.
2. Abre `index.html` en el navegador para verla.
3. Para publicarla, sube toda la carpeta a GitHub Pages o Netlify.

## Archivos
| Archivo | Para qué sirve |
|---|---|
| `index.html` | Página de inicio (presentación) |
| `productos.html` | Página de la tienda |
| `css/styles.css` | Colores y estilos (paleta tomada del logo) |
| `js/config.js` | Tus datos: lo único que editas |
| `js/data.js` | Productos (con `MODO_DEMO` para probar) |
| `js/comun.js` | Barra, botón flotante y contacto (las dos páginas) |
| `js/inicio.js` | Arma la página de inicio |
| `js/tienda.js` | Arma la tienda con `data.js` |
| `assets/logo.png` | Logo |

## Paleta
Fondo negro `#050508` con azul `#3b6df0` y violeta `#7c4ddb` (análogos) en degradado para los botones de contacto. Ámbar `#ffb454` (complementario) solo para avisos como "Agotado".

## Futuro
Cuando llegue la base de datos, cambia solo `obtenerProductos()` en `js/data.js` y pon `MODO_DEMO = false`.
