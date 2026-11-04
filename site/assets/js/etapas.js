// Orden de la presentación. Las flechas del teclado recorren estas etapas de corrido.
export const ETAPAS = [
  { id: "inicio", n: "0", nombre: "Panorama", url: "index.html", rol: "key" },
  { id: "compresion", n: "1", nombre: "Compresión", url: "compresion.html", rol: "net" },
  { id: "clave", n: "2", nombre: "Clave", url: "clave.html", rol: "key" },
  { id: "caos", n: "3", nombre: "Caos", url: "caos.html", rol: "ciph" },
  { id: "cifrado", n: "4", nombre: "Cifrado", url: "cifrado.html", rol: "ciph" },
  { id: "insercion", n: "5", nombre: "Audio", url: "insercion.html", rol: "pos" },
  { id: "recuperacion", n: "6", nombre: "Receptor", url: "recuperacion.html", rol: "key" },
  { id: "seguridad", n: "7", nombre: "Seguridad", url: "seguridad.html", rol: "key" },
  { id: "preguntas", n: "?", nombre: "Preguntas", url: "preguntas.html", rol: "key" },
];
// Clave del archivo de mapa-datos.js para cada etapa.
export const archivo = e => e.url.replace(".html", "");
