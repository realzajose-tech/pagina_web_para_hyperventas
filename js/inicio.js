// inicio.js: página de presentación. Requiere config.js y comun.js antes.

function pintarEncabezado(negocio, whatsapp) {
  const hero = document.getElementById("encabezado");
  const acciones = crearElemento("div", { class: "acciones" });
  acciones.append(
    crearElemento("a", { class: "boton-principal", href: "productos.html" }, "Ver productos"),
    crearBotonWhatsApp("boton-secundario", "Escríbeme por WhatsApp", whatsapp, whatsapp.mensaje)
  );
  const ventajas = crearElemento("ul", { class: "ventajas" });
  negocio.ventajas.forEach((v) => ventajas.append(crearElemento("li", {}, v)));

  hero.append(
    crearElemento("img", { src: "assets/logo.png", alt: `Logo de ${negocio.nombre}` }),
    crearElemento("h1", { class: "solo-lectores" }, negocio.nombre),
    crearElemento("p", {}, negocio.descripcion),
    acciones,
    ventajas
  );
}

function pintarSobreMi(sobre) {
  const contenedor = document.getElementById("sobre");
  contenedor.append(crearElemento("h2", {}, sobre.titulo), crearElemento("p", { class: "texto-largo" }, sobre.texto));
}

function pintarQueHago(items) {
  const contenedor = document.getElementById("quehago");
  const lista = crearElemento("ul", { class: "tarjetas" });
  items.forEach((item) => {
    const tarjeta = crearElemento("li", { class: "tarjeta" });
    tarjeta.append(crearElemento("h3", {}, item.titulo), crearElemento("p", {}, item.texto));
    lista.append(tarjeta);
  });
  contenedor.append(crearElemento("h2", {}, "Qué hago"), lista);
}

function pintarPasos(pasos) {
  const contenedor = document.getElementById("pasos");
  const lista = crearElemento("ol", { class: "pasos" });
  pasos.forEach((paso) => lista.append(crearElemento("li", {}, paso)));
  contenedor.append(
    crearElemento("h2", {}, "Cómo comprar"),
    lista,
    crearElemento("a", { class: "boton-principal", href: "productos.html" }, "Ver productos")
  );
}

// ---------- Punto de entrada ----------

function iniciar() {
  pintarBarra(CONFIG.negocio, CONFIG.whatsapp, "inicio");
  pintarEncabezado(CONFIG.negocio, CONFIG.whatsapp);
  pintarSobreMi(CONFIG.sobre);
  pintarQueHago(CONFIG.queHago);
  pintarPasos(CONFIG.pasos);
  pintarContacto(CONFIG.redes);
  pintarFlotante(CONFIG.whatsapp);
}

iniciar();
