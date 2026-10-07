
const BUCKET = "productos"; 

// ---------- Funciones puras ----------

function leerFormulario(formulario) {
  const datos = new FormData(formulario);
  return {
    nombre: datos.get("nombre").trim(),
    categoria: datos.get("categoria").trim(),
    precio: Number(datos.get("precio")),
    cantidad: Math.max(0, parseInt(datos.get("cantidad"), 10) || 0),
    descripcion: datos.get("descripcion").trim(),
    enlace_ml: datos.get("enlace_ml").trim(),
    agotado: datos.get("agotado") === "on"
  };
}

// De la dirección pública de una foto saca su ruta dentro de la carpeta
function rutaDeImagen(url) {
  const marca = `/object/public/${BUCKET}/`;
  const posicion = url.indexOf(marca);
  return posicion === -1 ? null : decodeURIComponent(url.slice(posicion + marca.length));
}

function estaAgotado(producto) {
  return Boolean(producto.agotado) || Number(producto.cantidad) <= 0;
}

// Reduce la foto a máx. 900 px para que la tienda cargue rápido
function redimensionarImagen(archivo, maximo = 900) {
  return new Promise((resolver, rechazar) => {
    const imagen = new Image();
    imagen.onload = () => {
      const escala = Math.min(1, maximo / Math.max(imagen.width, imagen.height));
      const lienzo = document.createElement("canvas");
      lienzo.width = Math.round(imagen.width * escala);
      lienzo.height = Math.round(imagen.height * escala);
      lienzo.getContext("2d").drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
      URL.revokeObjectURL(imagen.src);
      lienzo.toBlob((blob) => (blob ? resolver(blob) : rechazar(new Error("No se pudo procesar la imagen"))), "image/jpeg", 0.85);
    };
    imagen.onerror = () => rechazar(new Error("El archivo no es una imagen válida"));
    imagen.src = URL.createObjectURL(archivo);
  });
}

// ---------- Acceso a Supabase (db entra por parámetro) ----------

async function pedirProductos(db) {
  const { data, error } = await db.from("productos").select("*").order("creado", { ascending: false });
  if (error) throw error;
  return data;
}

async function subirImagen(db, blob) {
  const ruta = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await db.storage.from(BUCKET).upload(ruta, blob, { contentType: "image/jpeg" });
  if (error) throw error;
  return db.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
}

async function borrarImagen(db, url) {
  const ruta = rutaDeImagen(url || "");
  if (ruta) await db.storage.from(BUCKET).remove([ruta]);
}

// Sin id crea el producto; con id lo modifica. Si no hay permiso, avisa en vez de fallar en silencio.
async function guardarProducto(db, id, campos) {
  if (!id) {
    const { error } = await db.from("productos").insert(campos);
    if (error) throw error;
    return;
  }
  const { data, error } = await db.from("productos").update(campos).eq("id", id).select();
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("No tienes permiso para modificar productos");
}

async function borrarProducto(db, producto) {
  const { data, error } = await db.from("productos").delete().eq("id", producto.id).select();
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("No tienes permiso para eliminar productos");
  await borrarImagen(db, producto.imagen);
}

// ---------- Mensajes ----------

function mostrarAviso(texto, esError = false) {
  const aviso = document.getElementById("aviso");
  aviso.textContent = texto;
  aviso.className = `aviso ${esError ? "error" : "ok"}`;
  aviso.hidden = false;
  clearTimeout(mostrarAviso.temporizador);
  mostrarAviso.temporizador = setTimeout(() => { aviso.hidden = true; }, 4000);
}

// ---------- Inicio de sesión ----------

function pintarLogin(app, db) {
  const formulario = crearElemento("form", { class: "login" });
  const correo = crearElemento("input", { class: "buscador", type: "email", name: "correo", placeholder: "Correo", autocomplete: "username", required: "" });
  const clave = crearElemento("input", { class: "buscador", type: "password", name: "clave", placeholder: "Contraseña", autocomplete: "current-password", required: "" });
  const boton = crearElemento("button", { class: "boton-principal", type: "submit" }, "Entrar");
  const mensaje = crearElemento("p", { class: "nota", role: "alert" });

  formulario.append(crearElemento("h1", { class: "titulo-pagina" }, "Administrador"), correo, clave, boton, mensaje);
  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    boton.disabled = true;
    const { error } = await db.auth.signInWithPassword({ email: correo.value.trim(), password: clave.value });
    boton.disabled = false;
    if (error) mensaje.textContent = "Correo o contraseña incorrectos.";
  });
  app.append(formulario);
}

// ---------- Formulario de producto (crear y editar) ----------

function crearCampo(etiqueta, tipo, nombre, valor = "", extra = {}) {
  const campo = crearElemento("label", { class: "campo" });
  const entrada = tipo === "textarea"
    ? crearElemento("textarea", { name: nombre, rows: "3", ...extra })
    : crearElemento("input", { type: tipo, name: nombre, ...extra });
  if (tipo === "textarea") entrada.value = valor;
  else if (tipo !== "file") entrada.value = valor;
  campo.append(crearElemento("span", {}, etiqueta), entrada);
  return campo;
}

function abrirFormulario(db, producto, alGuardar) {
  const dialogo = document.getElementById("formulario");
  const formulario = crearElemento("form", { class: "formulario" });
  const p = producto || { nombre: "", categoria: "", precio: "", cantidad: 1, descripcion: "", enlace_ml: "", agotado: false };

  const agotado = crearElemento("input", { type: "checkbox", name: "agotado" });
  agotado.checked = Boolean(p.agotado);
  const campoAgotado = crearElemento("label", { class: "campo-marca" });
  campoAgotado.append(agotado, crearElemento("span", {}, "Marcar como agotado"));

  const vista = crearElemento("img", { class: "vista-previa", alt: "Foto actual" });
  vista.hidden = !p.imagen;
  if (p.imagen) vista.src = p.imagen;
  const campoFoto = crearCampo(producto ? "Cambiar foto (opcional)" : "Foto", "file", "imagen", "", { accept: "image/*" });
  campoFoto.querySelector("input").addEventListener("change", (e) => {
    const archivo = e.target.files[0];
    if (archivo) { vista.src = URL.createObjectURL(archivo); vista.hidden = false; }
  });

  const guardar = crearElemento("button", { class: "boton-principal", type: "submit" }, producto ? "Guardar cambios" : "Agregar producto");
  const cerrar = crearElemento("button", { class: "cerrar", type: "button" }, "Cancelar");
  cerrar.addEventListener("click", () => dialogo.close());

  formulario.append(
    crearElemento("h2", {}, producto ? "Editar producto" : "Nuevo producto"),
    crearCampo("Nombre", "text", "nombre", p.nombre, { required: "", maxlength: "120" }),
    crearCampo("Categoría", "text", "categoria", p.categoria || "", { maxlength: "60" }),
    crearCampo("Precio", "number", "precio", p.precio, { required: "", min: "0", step: "0.01" }),
    crearCampo("Cantidad disponible", "number", "cantidad", p.cantidad, { required: "", min: "0", step: "1" }),
    campoAgotado,
    crearCampo("Descripción", "textarea", "descripcion", p.descripcion || ""),
    crearCampo("Enlace de Mercado Libre de este producto (opcional)", "url", "enlace_ml", p.enlace_ml || "", { placeholder: "https://..." }),
    campoFoto,
    vista,
    guardar
  );

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    guardar.disabled = true;
    try {
      const campos = leerFormulario(formulario);
      const archivo = formulario.elements.imagen.files[0];
      if (archivo) campos.imagen = await subirImagen(db, await redimensionarImagen(archivo));
      else if (!producto) campos.imagen = "";

      await guardarProducto(db, producto && producto.id, campos);
      if (archivo && producto && producto.imagen) await borrarImagen(db, producto.imagen); // quita la foto vieja
      dialogo.close();
      mostrarAviso(producto ? "Cambios guardados" : "Producto agregado");
      alGuardar();
    } catch (error) {
      mostrarAviso(error.message || "No se pudo guardar", true);
    } finally {
      guardar.disabled = false;
    }
  });

  dialogo.replaceChildren(cerrar, formulario);
  dialogo.showModal();
}

// ---------- Lista de productos ----------

function crearFila(producto, db, recargar, editar) {
  const fila = crearElemento("li", { class: "fila-admin" });
  const miniatura = producto.imagen
    ? crearElemento("img", { class: "mini", src: producto.imagen, alt: "" })
    : crearElemento("div", { class: "mini foto-vacia", "aria-hidden": "true" }, (producto.nombre || "?").charAt(0).toUpperCase());

  const estado = crearElemento("span", { class: "estado" });
  function pintarEstado() {
    const agotado = estaAgotado(producto);
    estado.textContent = agotado ? "Agotado" : "Disponible";
    estado.classList.toggle("estado-agotado", agotado);
  }
  pintarEstado();

  async function actualizar(campos) {
    try {
      await guardarProducto(db, producto.id, campos);
      Object.assign(producto, campos);
      pintarEstado();
      mostrarAviso("Guardado");
    } catch (error) {
      mostrarAviso(error.message || "No se pudo guardar", true);
      recargar();
    }
  }

  const datos = crearElemento("div", { class: "fila-datos" });
  datos.append(crearElemento("strong", {}, producto.nombre), crearElemento("span", { class: "categoria" }, `${formatearPrecio(producto.precio)}${producto.categoria ? " · " + producto.categoria : ""}`), estado);

  const cantidad = crearElemento("input", { class: "entrada-cantidad", type: "number", min: "0", step: "1", "aria-label": `Cantidad de ${producto.nombre}` });
  cantidad.value = producto.cantidad;
  cantidad.addEventListener("change", () => {
    const valor = Math.max(0, parseInt(cantidad.value, 10) || 0);
    cantidad.value = valor;
    actualizar({ cantidad: valor });
  });
  const campoCantidad = crearElemento("label", { class: "campo-fila" });
  campoCantidad.append(crearElemento("span", {}, "Cantidad"), cantidad);

  const agotado = crearElemento("input", { type: "checkbox", "aria-label": `Marcar ${producto.nombre} como agotado` });
  agotado.checked = Boolean(producto.agotado);
  agotado.addEventListener("change", () => actualizar({ agotado: agotado.checked }));
  const campoAgotado = crearElemento("label", { class: "campo-fila" });
  campoAgotado.append(agotado, crearElemento("span", {}, "Agotado"));

  const botonEditar = crearElemento("button", { class: "boton-secundario boton-chico", type: "button" }, "Editar");
  botonEditar.addEventListener("click", () => editar(producto));
  const botonEliminar = crearElemento("button", { class: "boton-peligro boton-chico", type: "button" }, "Eliminar");
  botonEliminar.addEventListener("click", async () => {
    if (!confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await borrarProducto(db, producto);
      mostrarAviso("Producto eliminado");
      recargar();
    } catch (error) {
      mostrarAviso(error.message || "No se pudo eliminar", true);
    }
  });

  const controles = crearElemento("div", { class: "fila-controles" });
  controles.append(campoCantidad, campoAgotado, botonEditar, botonEliminar);
  fila.append(miniatura, datos, controles);
  return fila;
}

function pintarPanel(app, db) {
  const panel = crearElemento("div", { class: "panel" });
  const lista = crearElemento("ul", { class: "lista-admin" });

  const nuevo = crearElemento("button", { class: "boton-principal boton-chico", type: "button" }, "Agregar producto");
  const salir = crearElemento("button", { class: "boton-secundario boton-chico", type: "button" }, "Salir");
  salir.addEventListener("click", () => db.auth.signOut());

  const encabezado = crearElemento("div", { class: "panel-encabezado" });
  const acciones = crearElemento("div", { class: "acciones" });
  acciones.append(nuevo, crearElemento("a", { class: "boton-secundario boton-chico", href: "productos.html" }, "Ver tienda"), salir);
  encabezado.append(crearElemento("h1", { class: "titulo-pagina" }, "Mis productos"), acciones);

  async function recargar() {
    try {
      const productos = await pedirProductos(db);
      lista.replaceChildren(...productos.map((p) => crearFila(p, db, recargar, (prod) => abrirFormulario(db, prod, recargar))));
      if (productos.length === 0) lista.append(crearElemento("li", { class: "vacio" }, "Aún no hay productos. Toca “Agregar producto” para crear el primero."));
    } catch (error) {
      mostrarAviso("No se pudieron cargar los productos", true);
    }
  }

  nuevo.addEventListener("click", () => abrirFormulario(db, null, recargar));
  panel.append(encabezado, lista);
  app.append(panel);
  recargar();
}

// ---------- Punto de entrada ----------

function mostrarPantalla(app, db, sesion) {
  app.replaceChildren();
  if (sesion) pintarPanel(app, db);
  else pintarLogin(app, db);
}

async function iniciar() {
  const app = document.getElementById("app");
  const { url, anonKey } = CONFIG.supabase;
  if (!url || !anonKey) {
    app.append(crearElemento("p", { class: "vacio" }, "Falta configurar Supabase: llena url y anonKey en js/config.js."));
    return;
  }

  const db = window.supabase.createClient(url, anonKey);
  const { data } = await db.auth.getSession();
  mostrarPantalla(app, db, data.session);

  // Solo reaccionar a entrar/salir (no a renovaciones de sesión, que borrarían lo que se está escribiendo)
  db.auth.onAuthStateChange((evento, sesion) => {
    if (evento === "SIGNED_OUT") mostrarPantalla(app, db, null);
    if (evento === "SIGNED_IN" && !app.querySelector(".panel")) mostrarPantalla(app, db, sesion);
  });
}

iniciar();
