

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

function pintarEnvioGratis(mercadoLibre) {
  const contenedor = document.getElementById("envio");
  contenedor.append(
    crearElemento("h2", {}, mercadoLibre.titulo),
    crearElemento("p", {}, mercadoLibre.texto),
    crearElemento("a", { class: "boton-principal", href: mercadoLibre.url, target: "_blank", rel: "noopener" }, mercadoLibre.boton)
  );
}

function pintarFlotante(whatsapp) {
  const boton = document.getElementById("flotante");
  boton.textContent = "WhatsApp";
  boton.href = crearEnlaceWhatsApp(whatsapp.numero, whatsapp.mensaje);
  boton.target = "_blank";
  boton.rel = "noopener";
}

function pintarContacto(redes, horario) {
  const contenedor = document.getElementById("contacto");
  const columnaRedes = crearElemento("div");
  const listaRedes = crearElemento("ul", { class: "lista-redes" });
  redes.forEach((red) => {
    const item = crearElemento("li");
    item.append(crearElemento("a", { href: red.url, target: "_blank", rel: "noopener" }, red.nombre));
    listaRedes.append(item);
  });
  columnaRedes.append(crearElemento("h2", {}, "Síguenos"), listaRedes);

  const columnaHorario = crearElemento("div");
  const tarjeta = crearElemento("div", { class: "tarjeta" });
  tarjeta.append(crearElemento("p", {}, horario.dias), crearElemento("p", {}, horario.ubicacion));
  columnaHorario.append(crearElemento("h2", {}, "Horario y ubicación"), tarjeta);

  contenedor.append(columnaRedes, columnaHorario);
}
