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
      <button class="ghost" type="button" id="boton-dudas" title="Buscar dudas · tecla /">Dudas <kbd>/</kbd></button>
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
  barra.querySelector("#boton-dudas").addEventListener("click", () => abrirDudas());
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
  if (e.key === "/" && !document.querySelector("dialog[open]")) { e.preventDefault(); abrirDudas(); }
  if (k === "e" && explorar) { e.preventDefault(); explorar.open ? explorar.close() : (mapa?.close(), explorar.showModal()); }
});

// 4. Banco de dudas con buscador (tecla /). Los datos están en dudas.js.
let dudasDlg = null, DUDAS = null;
const NIVELES = [["hecha", "1 · Las que ya preguntaron", "para empezar por lo conocido"], ["normal", "2 · Para entender mejor", "concepto y funcionamiento"], ["experta", "3 · Nivel experto", "rigor matemático y de seguridad"]];
const norm = t => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/<[^>]+>/g, "").toLowerCase();
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const sinEtiquetas = t => esc(t).replace(/&lt;(\/?)(sub|sup)&gt;/g, "<$1$2>");
export async function abrirDudas(consulta = "") {
  mapa?.close(); explorar?.close();
  if (!dudasDlg) {
    dudasDlg = document.createElement("dialog");
    dudasDlg.className = "dudas";
    dudasDlg.innerHTML = `<div class="dudas-cab"><div><span class="eyebrow">Banco de preguntas</span><h2>Busca tu duda</h2></div>
        <button type="button" class="ghost" data-cerrar>Cerrar · Esc</button></div>
      <div class="dudas-busca"><input type="search" placeholder="Escribe una palabra: ulp, colisión, SHA-512, canal, Lyapunov…" aria-label="Buscar entre las preguntas" autocomplete="off">
        <div class="dudas-filtros" role="group" aria-label="Filtrar por etapa"></div><p class="dudas-cuenta" aria-live="polite"></p></div>
      <div class="dudas-lista"></div>`;
    document.body.append(dudasDlg);
    dudasDlg.querySelector("[data-cerrar]").addEventListener("click", () => dudasDlg.close());
    dudasDlg.addEventListener("click", e => { if (e.target === dudasDlg) dudasDlg.close(); if (e.target.closest(".dudas-ir")) dudasDlg.close(); });
    const inp = dudasDlg.querySelector("input");
    let filtro = "";
    const pintar = () => {
      const q = norm(inp.value).split(/\s+/).filter(Boolean);
      const lista = DUDAS.filter(d => (!filtro || d.etapa === filtro) && q.every(w => d._t.includes(w)));
      dudasDlg.querySelector(".dudas-cuenta").textContent = `${lista.length} de ${DUDAS.length} preguntas`;
      const item = d => `<details${q.length && lista.length <= 3 ? " open" : ""}><summary><span class="dudas-et">${esc(d.etapa)}</span><span>${sinEtiquetas(d.p)}</span></summary>
        <div class="dudas-r"><p>${sinEtiquetas(d.r)}</p>${d.f ? `<p class="dudas-f">${sinEtiquetas(d.f)}</p>` : ""}
        <p class="dudas-pie">${d.fuente ? `<span>Fuente: ${sinEtiquetas(d.fuente)}</span>` : ""}<a class="dudas-ir" href="${esc(d.url)}">Ver en el sitio →</a></p></div></details>`;
      dudasDlg.querySelector(".dudas-lista").innerHTML = lista.length ? NIVELES.map(([n, t, e]) => {
          const g = lista.filter(d => (d.nivel || "normal") === n);
          return g.length ? `<h3 class="dudas-grupo">${t} <small>${g.length} · ${e}</small></h3>` + g.map(item).join("") : "";
        }).join("")
        : `<p class="note">No hay preguntas con esas palabras. Prueba con otra o quita el filtro de etapa.</p>`;
    };
    inp.addEventListener("input", pintar);
    dudasDlg.querySelector(".dudas-filtros").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      filtro = filtro === b.dataset.e ? "" : b.dataset.e;
      dudasDlg.querySelectorAll(".dudas-filtros button").forEach(x => x.setAttribute("aria-pressed", x.dataset.e === filtro));
      pintar();
    });
    dudasDlg.pintar = pintar;
  }
  dudasDlg.showModal();
  const inp = dudasDlg.querySelector("input");
  if (!DUDAS) {
    dudasDlg.querySelector(".dudas-lista").innerHTML = `<p class="note">Cargando…</p>`;
    try { DUDAS = (await import("./dudas.js")).DUDAS; } catch { dudasDlg.querySelector(".dudas-lista").innerHTML = `<p class="note">No se pudieron cargar las preguntas.</p>`; return; }
    DUDAS.forEach(d => (d._t = norm([d.etapa, d.p, d.r, d.f, d.fuente, ...(d.claves || []), NIVELES.find(n => n[0] === d.nivel)?.[1]].join(" "))));
    const ORDEN = ["Inicio", "Compresión", "Clave", "Caos", "Cifrado", "Inserción", "Recuperación", "Seguridad"];
    const etapas = [...new Set(DUDAS.map(d => d.etapa))].sort((a, b) => ORDEN.indexOf(a) - ORDEN.indexOf(b));
    dudasDlg.querySelector(".dudas-filtros").innerHTML = etapas.map(e => `<button type="button" class="ghost" data-e="${esc(e)}" aria-pressed="false">${esc(e)}</button>`).join("");
  }
  if (consulta) inp.value = consulta;
  dudasDlg.pintar();
  inp.focus();
}

// 5. Ayuda de teclado la primera vez.
let vista = false;
try { vista = sessionStorage.getItem("ayuda-teclas") === "1"; sessionStorage.setItem("ayuda-teclas", "1"); } catch {}
if (!vista && rec) {
  const t = Object.assign(document.createElement("div"), { className: "aviso-teclas" });
  t.innerHTML = "Usa <kbd>←</kbd> <kbd>→</kbd> para avanzar por toda la presentación · <kbd>M</kbd> mapa · <kbd>/</kbd> buscar dudas" + (explorar ? " · <kbd>E</kbd> explorar" : "");
  document.body.append(t);
  setTimeout(() => t.classList.add("fuera"), 4500);
  setTimeout(() => t.remove(), 5200);
}
