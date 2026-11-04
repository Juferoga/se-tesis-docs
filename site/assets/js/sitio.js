// Marco común de la presentación: barra con las etapas y el progreso global, tema, mapa general (tecla M),
// panel «Explorar» (tecla E) y la disposición de una sola vista sin scroll.
// Cada página pone <header class="barra" data-actual="compresion"></header>.
import { ETAPAS, archivo } from "./etapas.js";
import { PASOS } from "./mapa-datos.js";
export { ETAPAS };

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
const actual = barra?.dataset.actual;
const iEtapa = ETAPAS.findIndex(e => e.id === actual);
const total = ETAPAS.reduce((s, e) => s + Math.max(1, PASOS[archivo(e)]?.length || 0), 0);
const antes = ETAPAS.slice(0, Math.max(0, iEtapa)).reduce((s, e) => s + Math.max(1, PASOS[archivo(e)]?.length || 0), 0);

// 1. Disposición: título dentro de la narración, contenido adicional al panel «Explorar», sin pie ni enlaces al final.
const main = document.querySelector("main.pagina");
const rec = document.getElementById("recorrido");
const narracion = rec?.querySelector(".narracion");
const cabeza = main?.querySelector(".cabeza");
if (narracion && cabeza) narracion.prepend(cabeza);
let explorar = null;
if (main && rec) {
  const extra = [...main.children].filter(n => n !== rec && !n.matches(".siguiente-etapa"));
  if (extra.some(n => n.textContent.trim())) {
    explorar = document.createElement("dialog");
    explorar.className = "explorar";
    explorar.innerHTML = `<div class="explorar-cab"><div><span class="eyebrow">Para explorar</span><h2>Prueba tú mismo</h2></div>
      <button type="button" class="ghost" data-cerrar>Cerrar · Esc</button></div><div class="explorar-cuerpo"></div>`;
    explorar.querySelector(".explorar-cuerpo").append(...extra);
    document.body.append(explorar);
    explorar.querySelector("[data-cerrar]").addEventListener("click", () => explorar.close());
    explorar.addEventListener("click", e => { if (e.target === explorar) explorar.close(); });
  }
}
main?.querySelector(".siguiente-etapa")?.remove();
document.querySelector("footer.pie")?.remove();

// 2. Barra superior.
if (barra) {
  barra.innerHTML = `<div class="barra-in">
    <a class="marca" href="index.html" title="Inicio">Criptoestego<span>·</span>audio</a>
    <nav class="etapas" aria-label="Etapas">${ETAPAS.map(e =>
      `<a href="${e.url}#paso-1"${e.id === actual ? ' aria-current="page"' : ""} title="${e.nombre}"><b>${e.n}</b><span>${e.nombre}</span></a>`).join("")}</nav>
    <div class="acciones">
      ${explorar ? '<button class="ghost" type="button" id="boton-explorar" title="Tecla E">Explorar <kbd>E</kbd></button>' : ""}
      <button class="ghost" type="button" id="boton-mapa" title="Tecla M">Mapa <kbd>M</kbd></button>
      <button class="ghost" type="button" id="boton-tema" aria-label="Cambiar tema"></button>
    </div>
  </div>
  <div class="progreso" aria-hidden="true"><i></i>${ETAPAS.slice(1).map((e, k) => {
    const x = ETAPAS.slice(0, k + 1).reduce((s, f) => s + Math.max(1, PASOS[archivo(f)]?.length || 0), 0) / total * 100;
    return `<s style="left:${x}%"></s>`; }).join("")}</div>`;
  const bt = barra.querySelector("#boton-tema");
  const rotulo = () => (bt.textContent = { sistema: "◐", claro: "☀", oscuro: "☾" }[tema], bt.title = `Tema: ${tema}`);
  rotulo();
  bt.addEventListener("click", () => {
    tema = TEMAS[(TEMAS.indexOf(tema) + 1) % TEMAS.length];
    try { localStorage.setItem("tema", tema); } catch {}
    aplicarTema(tema); rotulo();
  });
  barra.querySelector('[aria-current="page"]')?.scrollIntoView({ inline: "center", block: "nearest" });
  barra.querySelector("#boton-explorar")?.addEventListener("click", () => explorar.showModal());
  barra.querySelector("#boton-mapa").addEventListener("click", abrirMapa);
  const barraProg = barra.querySelector(".progreso i");
  const pintar = (i = 0) => (barraProg.style.width = `${(antes + i + 1) / total * 100}%`);
  pintar();
  document.addEventListener("paso-cambiado", e => pintar(e.detail.i));
}

// 3. Mapa general: todas las etapas y sus pasos en una sola vista.
let mapa;
function construirMapa() {
  mapa = document.createElement("dialog");
  mapa.className = "mapa";
  const pasoActual = () => window.__recorrido?.actual ?? 0;
  mapa.innerHTML = `<div class="mapa-cab"><div><span class="eyebrow">Mapa del recorrido</span>
      <h2>Del texto al estegoaudio y de vuelta</h2></div>
      <p class="note">Elige una etapa o un paso. Flechas para moverte, Enter para entrar, Esc para cerrar.</p>
      <button type="button" class="ghost" data-cerrar>Cerrar · Esc</button></div>
    <ol class="mapa-ruta">${ETAPAS.map((e, k) => {
      const pasos = PASOS[archivo(e)] || [];
      return `<li class="mapa-etapa" data-rol="${e.rol}" style="--k:${k}"${e.id === actual ? ' data-actual=""' : ""}>
        <a class="mapa-titulo" href="${e.url}#paso-1"><b>${e.n}</b>${e.nombre}<small>${pasos.length ? `${pasos.length} pasos` : "consulta"}</small></a>
        <ol class="mapa-pasos">${pasos.map((t, j) => `<li><a href="${e.url}#paso-${j + 1}" data-j="${j}">${t}</a></li>`).join("")}</ol>
      </li>`; }).join("")}</ol>`;
  document.body.append(mapa);
  mapa.querySelector("[data-cerrar]").addEventListener("click", () => mapa.close());
  mapa.addEventListener("click", e => {
    const a = e.target.closest("a");
    if (!a) { if (e.target === mapa) mapa.close(); return; }
    const mismo = a.getAttribute("href").startsWith(ETAPAS[iEtapa]?.url + "#");
    e.preventDefault();
    const etapa = a.closest(".mapa-etapa");
    etapa.classList.add("zoom");
    setTimeout(() => {
      if (mismo && window.__recorrido) { mapa.close(); etapa.classList.remove("zoom"); window.__recorrido.ir(+(a.dataset.j ?? 0)); }
      else location.href = a.getAttribute("href");
    }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 380);
  });
  mapa.addEventListener("keydown", e => {
    const enlaces = [...mapa.querySelectorAll(".mapa-ruta a")];
    const k = enlaces.indexOf(document.activeElement);
    if (["ArrowRight", "ArrowDown"].includes(e.key)) { e.preventDefault(); enlaces[Math.min(enlaces.length - 1, k + 1)].focus(); }
    if (["ArrowLeft", "ArrowUp"].includes(e.key)) { e.preventDefault(); enlaces[Math.max(0, k - 1)].focus(); }
  });
  mapa.pasoActual = pasoActual;
}
function abrirMapa() {
  if (!mapa) construirMapa();
  mapa.querySelectorAll(".mapa-pasos a").forEach(a => a.removeAttribute("aria-current"));
  const etapa = mapa.querySelector(".mapa-etapa[data-actual]");
  const objetivo = etapa?.querySelectorAll(".mapa-pasos a")[mapa.pasoActual()] || etapa?.querySelector("a");
  objetivo?.setAttribute("aria-current", "step");
  mapa.showModal();
  objetivo?.focus();
}

addEventListener("keydown", e => {
  if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.("input, select, textarea, [contenteditable]")) return;
  const k = e.key.toLowerCase();
  if (k === "m") { e.preventDefault(); mapa?.open ? mapa.close() : (explorar?.close(), abrirMapa()); }
  if (k === "e" && explorar) { e.preventDefault(); explorar.open ? explorar.close() : (mapa?.close(), explorar.showModal()); }
});

// 4. Ayuda de teclado la primera vez.
let vista = false;
try { vista = sessionStorage.getItem("ayuda-teclas") === "1"; sessionStorage.setItem("ayuda-teclas", "1"); } catch {}
if (!vista && rec) {
  const t = Object.assign(document.createElement("div"), { className: "aviso-teclas" });
  t.innerHTML = "Usa <kbd>←</kbd> <kbd>→</kbd> para avanzar por toda la presentación · <kbd>M</kbd> mapa" + (explorar ? " · <kbd>E</kbd> explorar" : "");
  document.body.append(t);
  setTimeout(() => t.classList.add("fuera"), 4500);
  setTimeout(() => t.remove(), 5200);
}
