// ===== ÚNICO archivo que necesitas editar =====
// Cambia los textos entre comillas. No borres las comas ni las llaves.

const CONFIG = {
  negocio: {
    nombre: "Hyper Ventas",
    descripcion: "Elige tu producto, compra en nuestra tienda de Mercado Libre y recibe tu envío gratis.",
    ventajas: ["Envío gratis por Mercado Libre", "Atención directa", "Respuesta rápida"]
  },

  // Página de inicio: escribe aquí tu presentación
  sobre: {
    titulo: "Quién soy",
    texto: "Escribe aquí tu historia: quién eres, desde cuándo vendes y qué te hace diferente. Con dos o tres frases basta."
  },

  queHago: [
    { titulo: "Qué vendo", texto: "Describe en una frase el tipo de productos que ofreces." },
    { titulo: "Cómo trabajo", texto: "Atiendo directo por WhatsApp, sin intermediarios." },
    { titulo: "Por qué conmigo", texto: "Cuenta qué te hace confiable: garantía, trato, rapidez." }
  ],

  pasos: [
    "Elige tu producto en la tienda",
    "Toca el enlace de Mercado Libre y realiza tu compra en nuestra tienda",
    "Recibe tu envío gratis"
  ],

  // El envío gratis aplica solo comprando por Mercado Libre
  mercadoLibre: {
    url: "https://www.mercadolibre.com.mx/tu-tienda",
    titulo: "Envío gratis comprando por Mercado Libre",
    texto: "El envío gratis aplica únicamente si compras por Mercado Libre. Toca el enlace, realiza tu compra en nuestra tienda y recibe tu envío gratis.",
    boton: "Comprar en Mercado Libre"
  },

  whatsapp: {
    // Código de país + número, sin espacios ni signos. Ejemplo México: 5215512345678
    numero: "5210000000000",
    mensaje: "Hola, quiero agendar una compra"
  },

  redes: [
    { nombre: "Instagram", url: "https://instagram.com/tu_usuario" },
    { nombre: "Facebook",  url: "https://facebook.com/tu_pagina" },
    { nombre: "TikTok",    url: "https://tiktok.com/@tu_usuario" }
  ],

  horario: {
    dias: "Lunes a sábado, 10:00 a 19:00",
    ubicacion: "Tu ciudad, tu colonia"
  }
};
