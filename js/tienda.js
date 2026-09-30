// tienda.js: página de productos. Requiere config.js, data.js y comun.js antes.

// ---------- Funciones puras ----------

function formatearPrecio(precio) {
  return `$${Number(precio).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
}

function obtenerCategorias(productos) {
  return ["Todos", ...new Set(productos.map((p) => p.categoria).filter(Boolean))];
}

function filtrarProductos(productos, busqueda, categoria) {
  const texto = busqueda.trim().toLowerCase();
  return productos.filter(
    (p) => (categoria === "Todos" || p.categoria === categoria) && (!texto || p.nombre.toLowerCase().includes(texto))
  );
}

function mensajeProducto(producto, cantidad) {
  if (producto.agotado) return `Hola, ¿cuándo tendrán disponible: ${producto.nombre}?`;
  return `Hola, me interesa: ${producto.nombre} (cantidad: ${cantidad}). ¿Está disponible para agendar la compra?`;
}

// ---------- Bloques de la página ----------

function crearFoto(producto) {
  if (producto.imagen) return crearElemento("img", { class: "foto", src: producto.imagen, alt: producto.nombre });
  return crearElemento("div", { class: "foto foto-vacia", "aria-hidden": "true" }, producto.nombre.charAt(0).toUpperCase());
}

function crearTarjeta(producto, alAbrir) {
  const tarjeta = crearElemento("li", { class: "producto", tabindex: "0", role: "button", "aria-label": `Ver ${producto.nombre}` });
  const info = crearElemento("div", { class: "info" });
  info.append(
    crearElemento("span", { class: "categoria" }, producto.categoria || ""),
    crearElemento("h3", {}, producto.nombre),
    crearElemento("span", { class: "precio" }, formatearPrecio(producto.precio))
  );
  if (producto.agotado) {
    tarjeta.classList.add("agotado");
    info.append(crearElemento("span", { class: "etiqueta-agotado" }, "Agotado"));
  } else {
    info.append(crearElemento("span", { class: "ver-mas" }, "Ver y contactar"));
  }
  tarjeta.append(crearFoto(producto), info);
  tarjeta.addEventListener("click", () => alAbrir(producto));
  tarjeta.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alAbrir(producto); }
  });
  return tarjeta;
}

function abrirDetalle(producto, whatsapp) {
  const dialogo = document.getElementById("detalle");
  let cantidad = 1;

  const cerrar = crearElemento("button", { class: "cerrar", type: "button" }, "Cerrar");
  cerrar.addEventListener("click", () => dialogo.close());

  const contacto = crearBotonWhatsApp(
    "boton-principal", producto.agotado ? "Preguntar cuándo habrá" : "Contactar al vendedor", whatsapp, ""
  );
  const salida = crearElemento("output", {}, "1");

  function actualizar() {
    salida.textContent = cantidad;
    contacto.href = crearEnlaceWhatsApp(whatsapp.numero, mensajeProducto(producto, cantidad));
  }
  function cambiarCantidad(delta) {
    cantidad = Math.min(20, Math.max(1, cantidad + delta));
    actualizar();
  }

  const menos = crearElemento("button", { type: "button", "aria-label": "Menos" }, "−");
  const mas = crearElemento("button", { type: "button", "aria-label": "Más" }, "+");
  menos.addEventListener("click", () => cambiarCantidad(-1));
  mas.addEventListener("click", () => cambiarCantidad(1));
  const selector = crearElemento("div", { class: "cantidad" });
  selector.append(crearElemento("span", {}, "Cantidad"), menos, salida, mas);

  const info = crearElemento("div", { class: "detalle-info" });
  info.append(
    crearElemento("span", { class: "categoria" }, producto.categoria || ""),
    crearElemento("h3", {}, producto.nombre),
    crearElemento("span", { class: "precio" }, formatearPrecio(producto.precio)),
    crearElemento("p", {}, producto.descripcion || "")
  );
  if (producto.agotado) info.append(crearElemento("span", { class: "etiqueta-agotado" }, "Agotado por ahora"));
  else info.append(selector);
  info.append(contacto, crearElemento("p", { class: "nota" }, "Te responde el vendedor directamente por WhatsApp."));

  const cuerpo = crearElemento("div", { class: "detalle-cuerpo" });
  cuerpo.append(crearFoto(producto), info);

  dialogo.replaceChildren(cerrar, cuerpo);
  actualizar();
  dialogo.showModal();
}

function pintarProductos(productos, whatsapp) {
  const contenedor = document.getElementById("productos");
  contenedor.append(crearElemento("h1", { class: "titulo-pagina" }, "Productos"));

  if (productos.length === 0) {
    contenedor.append(crearElemento("p", { class: "vacio" }, "Aún no hay productos publicados. Escríbenos por WhatsApp y te contamos qué tenemos."));
    return;
  }

  const estado = { busqueda: "", categoria: "Todos" };
  const buscador = crearElemento("input", { class: "buscador", type: "search", placeholder: "Buscar producto", "aria-label": "Buscar producto" });
  const chips = crearElemento("div", { class: "chips" });
  const lista = crearElemento("ul", { class: "lista-productos" });
  const sinResultados = crearElemento("p", { class: "vacio", hidden: "" }, "No encontramos ese producto. Prueba con otra palabra o pregúntanos por WhatsApp.");

  function actualizar() {
    const visibles = filtrarProductos(productos, estado.busqueda, estado.categoria);
    lista.replaceChildren(...visibles.map((p) => crearTarjeta(p, (prod) => abrirDetalle(prod, whatsapp))));
    sinResultados.hidden = visibles.length > 0;
  }

  obtenerCategorias(productos).forEach((categoria) => {
    const chip = crearElemento("button", { class: "chip", type: "button", "aria-pressed": String(categoria === "Todos") }, categoria);
    chip.addEventListener("click", () => {
      estado.categoria = categoria;
      chips.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      actualizar();
    });
    chips.append(chip);
  });
  buscador.addEventListener("input", () => { estado.busqueda = buscador.value; actualizar(); });

  contenedor.append(buscador, chips, lista, sinResultados);
  actualizar();
}

function activarCierreDetalle() {
  const dialogo = document.getElementById("detalle");
  dialogo.addEventListener("click", (e) => { if (e.target === dialogo) dialogo.close(); });
}

// ---------- Punto de entrada ----------

async function iniciar() {
  const productos = await obtenerProductos();

  pintarBarra(CONFIG.negocio, CONFIG.whatsapp, "productos");
  pintarProductos(productos, CONFIG.whatsapp);
  pintarContacto(CONFIG.redes);
  pintarFlotante(CONFIG.whatsapp);
  activarCierreDetalle();
}

iniciar();
