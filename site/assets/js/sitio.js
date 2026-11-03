// Barra superior, selector de tema y pie, iguales en todas las páginas.
// Cada página pone <header class="barra" data-actual="compresion"></header> y <footer class="pie"></footer>.
export const ETAPAS = [
  { id: "inicio", n: "0", nombre: "Panorama", url: "index.html" },
  { id: "compresion", n: "1", nombre: "Compresión", url: "compresion.html" },
  { id: "clave", n: "2", nombre: "Clave", url: "clave.html" },
  { id: "caos", n: "3", nombre: "Caos", url: "caos.html" },
  { id: "cifrado", n: "4", nombre: "Cifrado", url: "cifrado.html" },
  { id: "insercion", n: "5", nombre: "Audio", url: "insercion.html" },
  { id: "recuperacion", n: "6", nombre: "Receptor", url: "recuperacion.html" },
  { id: "seguridad", n: "7", nombre: "Seguridad", url: "seguridad.html" },
  { id: "preguntas", n: "?", nombre: "Preguntas", url: "preguntas.html" },
];

const TEMAS = ["sistema", "claro", "oscuro"];
function aplicarTema(t) {
  if (t === "claro") document.documentElement.dataset.theme = "light";
  else if (t === "oscuro") document.documentElement.dataset.theme = "dark";
  else delete document.documentElement.dataset.theme;
}
let tema = "sistema";
try { tema = localStorage.getItem("tema") || "sistema"; } catch {}
aplicarTema(tema);

const barra = document.querySelector("header.barra");
if (barra) {
  const actual = barra.dataset.actual;
  barra.innerHTML = `<div class="barra-in">
    <a class="marca" href="index.html">Criptoestego<span style="color:var(--key)">·</span>audio</a>
    <nav class="etapas" aria-label="Etapas del recorrido">${ETAPAS.map(e =>
      `<a href="${e.url}"${e.id === actual ? ' aria-current="page"' : ""}><b>${e.n}</b>${e.nombre}</a>`).join("")}</nav>
    <button class="ghost tema" type="button" id="boton-tema"></button>
  </div>`;
  const bt = barra.querySelector("#boton-tema");
  const rotulo = () => (bt.textContent = { sistema: "Tema: sistema", claro: "Tema: claro", oscuro: "Tema: oscuro" }[tema]);
  rotulo();
  bt.addEventListener("click", () => {
    tema = TEMAS[(TEMAS.indexOf(tema) + 1) % TEMAS.length];
    try { localStorage.setItem("tema", tema); } catch {}
    aplicarTema(tema); rotulo();
  });
  barra.querySelector('[aria-current="page"]')?.scrollIntoView({ inline: "center", block: "nearest" });

  // Enlaces a la etapa anterior y siguiente al final de la página.
  const i = ETAPAS.findIndex(e => e.id === actual);
  const destino = document.querySelector(".siguiente-etapa");
  if (destino && i >= 0) {
    const a = ETAPAS[i - 1], s = ETAPAS[i + 1];
    destino.innerHTML = (a ? `<a href="${a.url}"><small>← Etapa anterior</small>${a.n} · ${a.nombre}</a>` : "<span></span>") +
      (s ? `<a href="${s.url}" style="text-align:right"><small>Etapa siguiente →</small>${s.n} · ${s.nombre}</a>` : "");
  }
}

const pie = document.querySelector("footer.pie");
if (pie) pie.innerHTML = `Rodríguez-Galindo, Bohórquez-Rodríguez, Alvarado-Nieto y Amaya-Barrera · Universidad Distrital Francisco José de Caldas ·
  Código: <a href="https://github.com/Juferoga/se-tesis">github.com/Juferoga/se-tesis</a> ·
  DOI <a href="https://doi.org/10.5281/zenodo.23810658">10.5281/zenodo.23810658</a>`;
