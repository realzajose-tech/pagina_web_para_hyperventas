

// true = muestra productos de ejemplo sin usar Supabase (solo para probar el diseño).
const MODO_DEMO = false;

const PRODUCTOS_DEMO = [
  { id: 1, nombre: "Bolsas para pollo (demo)", categoria: "Bolsas", precio: 12, descripcion: "Producto de ejemplo.", imagen: "", cantidad: 3, agotado: false, enlaceML: "" },
  { id: 2, nombre: "Clipadora manual (demo)", categoria: "Clipadoras", precio: 45, descripcion: "Producto de ejemplo.", imagen: "", cantidad: 20, agotado: false, enlaceML: "" },
  { id: 3, nombre: "Producto agotado (demo)", categoria: "Bolsas", precio: 9, descripcion: "Producto de ejemplo.", imagen: "", cantidad: 0, agotado: true, enlaceML: "" }
];

// Convierte una fila de la base de datos al formato que usa la tienda
function normalizarProducto(fila) {
  const cantidad = Number(fila.cantidad) || 0;
  return {
    id: fila.id,
    nombre: fila.nombre,
    categoria: fila.categoria || "",
    precio: Number(fila.precio),
    descripcion: fila.descripcion || "",
    imagen: fila.imagen || "",
    cantidad,
    agotado: Boolean(fila.agotado) || cantidad <= 0, // sin existencias = agotado
    enlaceML: fila.enlace_ml || ""
  };
}

async function obtenerProductos() {
  if (MODO_DEMO) return PRODUCTOS_DEMO;

  const { url, anonKey } = CONFIG.supabase;
  if (!url || !anonKey) return [];

  try {
    // Las claves nuevas (sb_publishable_...) no son JWT: van solo en "apikey".
    // Las claves viejas (anon) también llevan Authorization.
    const headers = { apikey: anonKey };
    if (!anonKey.startsWith("sb_")) headers.Authorization = `Bearer ${anonKey}`;
    const respuesta = await fetch(`${url}/rest/v1/productos?select=*&order=creado.desc`, { headers });
    if (!respuesta.ok) throw new Error(`Supabase respondió ${respuesta.status}`);
    const filas = await respuesta.json();
    return filas.map(normalizarProducto);
  } catch (error) {
    console.error("No se pudieron cargar los productos:", error);
    return [];
  }
}
