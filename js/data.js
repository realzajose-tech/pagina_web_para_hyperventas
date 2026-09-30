// data.js: única fuente de productos de la página.
// Cuando conectes la base de datos, cambia solo obtenerProductos(); main.js no se toca.
//
// Forma de cada producto:
// { id: 1, nombre: "...", categoria: "...", precio: 199.99,
//   descripcion: "...", imagen: "assets/p1.png" (o "" si no hay), agotado: false }

// true = muestra productos de ejemplo para probar la tienda. false = lista vacía.
const MODO_DEMO = true;

const PRODUCTOS_DEMO = [
  { id: 1, nombre: "Audífonos inalámbricos (demo)", categoria: "Audio", precio: 799, descripcion: "Producto de ejemplo. Aquí va la descripción real: material, medidas, garantía.", imagen: "", agotado: false },
  { id: 2, nombre: "Bocina portátil (demo)", categoria: "Audio", precio: 649, descripcion: "Producto de ejemplo con sonido claro y batería de larga duración.", imagen: "", agotado: false },
  { id: 3, nombre: "Cargador rápido (demo)", categoria: "Accesorios", precio: 299, descripcion: "Producto de ejemplo compatible con la mayoría de celulares.", imagen: "", agotado: false },
  { id: 4, nombre: "Funda protectora (demo)", categoria: "Accesorios", precio: 149, descripcion: "Producto de ejemplo. Se vende por pieza.", imagen: "", agotado: true },
  { id: 5, nombre: "Lámpara de escritorio (demo)", categoria: "Hogar", precio: 459, descripcion: "Producto de ejemplo con luz regulable.", imagen: "", agotado: false },
  { id: 6, nombre: "Organizador de cables (demo)", categoria: "Hogar", precio: 99, descripcion: "Producto de ejemplo para mantener tu espacio ordenado.", imagen: "", agotado: false }
];

async function obtenerProductos() {
  // FUTURO: aquí va la llamada a la base de datos, por ejemplo:
  // const respuesta = await fetch("URL_DE_TU_BASE_DE_DATOS");
  // return await respuesta.json();
  return MODO_DEMO ? PRODUCTOS_DEMO : [];
}
