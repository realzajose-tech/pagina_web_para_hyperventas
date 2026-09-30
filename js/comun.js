// comun.js: piezas que usan las DOS páginas (barra, botón flotante, contacto).
// Requiere config.js cargado antes.

// ---------- Funciones puras ----------

function crearEnlaceWhatsApp(numero, mensaje) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

// ---------- Ayudantes para crear elementos ----------

function crearElemento(etiqueta, atributos = {}, texto = "") {
  const el = document.createElement(etiqueta);
  Object.entries(atributos).forEach(([clave, valor]) => el.setAttribute(clave, valor));
  el.textContent = texto;
  return el;
}

function crearBotonWhatsApp(clase, texto, whatsapp, mensaje) {
  return crearElemento(
    "a",
    { class: clase, href: crearEnlaceWhatsApp(whatsapp.numero, mensaje), target: "_blank", rel: "noopener" },
    texto
  );
}

// ---------- Bloques compartidos ----------

// paginaActual: "inicio" o "productos" (marca el enlace activo)
function pintarBarra(negocio, whatsapp, paginaActual) {
  const barra = document.getElementById("barra");
  const nav = crearElemento("nav", { "aria-label": "Principal" });
  [["inicio", "Inicio", "index.html"], ["productos", "Productos", "productos.html"]].forEach(([id, texto, href]) => {
    const enlace = crearElemento("a", { href }, texto);
    if (id === paginaActual) enlace.setAttribute("aria-current", "page");
    nav.append(enlace);
  });
  barra.append(
    crearElemento("a", { class: "marca", href: "index.html" }, negocio.nombre),
    nav,
    crearBotonWhatsApp("boton-mini", "Contactar", whatsapp, whatsapp.mensaje)
  );
}

function pintarFlotante(whatsapp) {
  const boton = document.getElementById("flotante");
  boton.textContent = "WhatsApp";
  boton.href = crearEnlaceWhatsApp(whatsapp.numero, whatsapp.mensaje);
  boton.target = "_blank";
  boton.rel = "noopener";
}

function pintarContacto(redes) {
  const contenedor = document.getElementById("contacto");
  const listaRedes = crearElemento("ul", { class: "lista-redes" });
  redes.forEach((red) => {
    const item = crearElemento("li");
    item.append(crearElemento("a", { href: red.url, target: "_blank", rel: "noopener" }, red.nombre));
    listaRedes.append(item);
  });
  contenedor.append(crearElemento("h2", {}, "Síguenos"), listaRedes);
}
