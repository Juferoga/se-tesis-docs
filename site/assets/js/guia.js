// Recorrido por pasos, común a todas las etapas, en modo presentación.
//
// Marcado esperado:
//   <div class="recorrido" id="recorrido">
//     <div class="narracion">
//       <article class="paso" data-paso="nombre"> ... </article>   (uno por paso)
//       <div class="mando"></div>                                   (lo llena este módulo)
//     </div>
//     <div class="escena"> ... </div>
//   </div>
//
// Uso:
//   import { recorrido } from "./assets/js/guia.js";
//   recorrido(document.getElementById("recorrido"), (i, nombre, dir) => { /* actualizar la escena */ });
//
// Teclado: → espacio y AvPág avanzan; ← y RePág retroceden; ↓ ↑ entran y salen de las capas de detalle; Inicio y Fin. Al pasar del último paso se abre la
// etapa siguiente, y al retroceder desde el primero, el último paso de la etapa anterior: todo el sitio es una
// sola secuencia. El paso actual queda en el hash (#paso-3).
import { ETAPAS } from "./etapas.js";

export const sinMovimiento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function color(nombre) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${nombre}`).trim();
}

export function alCambiarTema(fn) {
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", fn);
  new MutationObserver(fn).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}

const actualId = () => document.querySelector("header.barra")?.dataset.actual;
export function etapaVecina(delta) {
  const i = ETAPAS.findIndex(e => e.id === actualId());
  return i < 0 ? null : ETAPAS[i + delta] || null;
}
export function irAEtapa(delta) {
  const e = etapaVecina(delta);
  if (e) location.href = e.url + (delta < 0 ? "#paso-fin" : "#paso-1");
}

// Matemáticas con KaTeX, cargado solo cuando un texto lo necesita. Delimitadores: \( … \) en línea y \[ … \] en bloque.
let katexListo;
const cargar = (tag, attrs) => new Promise((ok, mal) => { const n = Object.assign(document.createElement(tag), attrs); n.onload = ok; n.onerror = mal; document.head.append(n); });
export function matematica(el) {
  if (!el || !/\\\(|\\\[/.test(el.innerHTML)) return;
  katexListo ??= (async () => {
    const base = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/";
    document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href: base + "katex.min.css" }));
    await cargar("script", { src: base + "katex.min.js" });
    await cargar("script", { src: base + "contrib/auto-render.min.js" });
  })();
  katexListo.then(() => window.renderMathInElement?.(el, {
    delimiters: [{ left: "\\[", right: "\\]", display: true }, { left: "\\(", right: "\\)", display: false }],
    throwOnError: false,
  })).catch(() => {});
}

// Ventana de información (botón «i» o tecla I). Cada paso deja a la vista solo su título y su primera frase;
// la analogía, los párrafos siguientes y el detalle técnico pasan a esta ventana, ordenados por secciones.
let ventana;
function ventanaInfo() {
  if (ventana) return ventana;
  ventana = document.createElement("dialog");
  ventana.className = "info";
  ventana.innerHTML = `<div class="info-cab"><div><span class="eyebrow"></span><h2></h2></div>
    <button type="button" class="cerrar" aria-label="Cerrar">✕</button></div><div class="info-cuerpo"></div>`;
  ventana.querySelector(".cerrar").addEventListener("click", () => ventana.close());
  ventana.addEventListener("click", e => { if (e.target === ventana) ventana.close(); });
  document.body.append(ventana);
  return ventana;
}
export function abrirInfo({ eyebrow = "", titulo = "", tituloHtml = "", secciones = [] }) {
  const v = ventanaInfo();
  v.querySelector(".eyebrow").textContent = eyebrow;
  const h2 = v.querySelector("h2");
  if (tituloHtml) h2.innerHTML = tituloHtml; else h2.textContent = titulo;
  const cuerpo = v.querySelector(".info-cuerpo");
  cuerpo.replaceChildren(...secciones.filter(s => s.nodos?.length || s.html).map(s => {
    const sec = document.createElement("section");
    sec.className = "info-sec" + (s.clase ? " " + s.clase : "");
    if (s.titulo) sec.append(Object.assign(document.createElement("h3"), { textContent: s.titulo }));
    if (s.html) sec.insertAdjacentHTML("beforeend", s.html);
    s.nodos?.forEach(n => {
      const copia = n.cloneNode(true);
      [copia, ...copia.querySelectorAll?.("[id]") ?? []].forEach(x => x.removeAttribute?.("id"));
      sec.append(copia);
    });
    sec.querySelectorAll("[id]").forEach(x => x.removeAttribute("id"));
    return sec;
  }));
  matematica(cuerpo);
  v.showModal();
  v.querySelector(".info-cuerpo").scrollTop = 0;
}

function prepararPaso(p, escena) {
  const titulo = p.querySelector("h2");
  const eyebrow = p.querySelector(".eyebrow");
  const hijos = [...p.children].filter(n => n !== titulo && n !== eyebrow && !n.matches(".nivel"));
  const primera = hijos.find(n => n.tagName === "P" && !n.classList.contains("analogia"));
  // Lo que la página actualiza por script (ids, controles) se queda a la vista.
  const vivo = n => n.id || n.matches("button, input, select, .mando") || n.querySelector("[id], button, input, select");
  const resto = hijos.filter(n => n !== primera && !vivo(n));
  if (!resto.length || !titulo) return;
  const guardado = document.createElement("template");
  guardado.content.append(...resto);
  const boton = Object.assign(document.createElement("button"), { type: "button", className: "boton-i", textContent: "i" });
  boton.setAttribute("aria-label", "Más información sobre este paso (tecla I)");
  boton.title = "Más información (I)";
  const cab = document.createElement("div");
  cab.className = "paso-cab";
  titulo.before(cab); cab.append(titulo, boton);
  p.abrirInfo = () => {
    const nodos = [...guardado.content.children];
    const analogia = nodos.filter(n => n.classList.contains("analogia"));
    const tecnico = nodos.filter(n => n.tagName === "DETAILS").flatMap(d => [...d.children].filter(x => x.tagName !== "SUMMARY"));
    const otros = nodos.filter(n => !analogia.includes(n) && n.tagName !== "DETAILS");
    const narra = escena?.querySelector(".narra");
    const texto = narra?.innerHTML.replace(/^\s*<b>[^<]*<\/b>\s*/, "").replace(/^\s*([a-záéíóúñ])/, (m, c) => c.toUpperCase());
    const viendo = texto ? Object.assign(document.createElement("p"), { innerHTML: texto }) : null;
    abrirInfo({
      eyebrow: eyebrow?.textContent || "", tituloHtml: titulo?.innerHTML || "",
      secciones: [
        { titulo: "En pocas palabras", nodos: otros },
        { titulo: "Una comparación", nodos: analogia, clase: "comparacion" },
        { titulo: "Qué muestra la escena", nodos: viendo ? [viendo] : [] },
        { titulo: "Detalle técnico", nodos: tecnico, clase: "tecnico" },
      ],
    });
  };
  boton.addEventListener("click", p.abrirInfo);
}

// Capas de detalle: cada paso puede tener <section class="nivel" data-titulo="…"> … </section> (una o varias).
// ↓ baja a la siguiente capa del paso actual y ↑ sube; ← → siguen cambiando de paso.
function prepararNiveles(p, i, irNivel) {
  const niveles = [...p.querySelectorAll(":scope > .nivel")];
  niveles.forEach((n, k) => {
    const cab = document.createElement("div");
    cab.className = "nivel-cab";
    cab.innerHTML = `<span class="eyebrow">Paso ${i + 1} · Profundizar ${k + 1} de ${niveles.length}</span><h3></h3>`;
    cab.querySelector("h3").textContent = n.dataset.titulo || "Más detalle";
    n.prepend(cab);
    const pie = document.createElement("div");
    pie.className = "nivel-pie";
    pie.innerHTML = `<button type="button" class="ghost" data-dir="-1">↑ ${k ? "Capa anterior" : "Volver al paso"}</button>` +
      (k < niveles.length - 1 ? `<button type="button" class="ghost" data-dir="1">↓ ${niveles[k + 1].dataset.titulo || "Más detalle"}</button>` : "");
    pie.addEventListener("click", e => { const b = e.target.closest("button"); if (b) irNivel(k + 1 + +b.dataset.dir); });
    n.append(pie);
  });
  if (niveles.length) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "boton-bajar";
    b.innerHTML = `<span aria-hidden="true">↓</span> Profundizar <small>${niveles.map(n => n.dataset.titulo || "detalle").join(" · ")}</small>`;
    b.title = "Más detalle formal (flecha abajo)";
    b.addEventListener("click", () => irNivel(1));
    const ultimo = [...p.children].filter(n => !n.matches(".nivel")).pop();
    ultimo.after(b);
  }
  return niveles;
}

export function recorrido(raiz, alCambiar, alNivel) {
  const pasos = [...raiz.querySelectorAll(".paso")];
  const mando = raiz.querySelector(".mando");
  const escena = raiz.querySelector(".escena");
  pasos.forEach(p => prepararPaso(p, escena));
  let nivel = 0;
  const niveles = pasos.map((p, i) => prepararNiveles(p, i, k => irNivel(k)));
  function irNivel(k, { desdeHash = false } = {}) {
    const lista = niveles[actual] || [];
    k = Math.max(0, Math.min(lista.length, k));
    if (k === nivel && !desdeHash) return;
    const dir = k > nivel ? 1 : -1;
    nivel = k;
    const p = pasos[actual];
    p.dataset.nivel = k;
    lista.forEach((n, j) => n.classList.toggle("activa", j === k - 1));
    raiz.classList.toggle("profundo", k > 0);
    const visible = k ? lista[k - 1] : p;
    if (k) matematica(lista[k - 1]);
    visible.classList.remove("baja", "sube");
    if (!sinMovimiento() && !desdeHash) { void visible.offsetWidth; visible.classList.add(dir > 0 ? "baja" : "sube"); }
    if (!desdeHash) history.replaceState(null, "", `#paso-${actual + 1}${k ? "-" + k : ""}`);
    document.dispatchEvent(new CustomEvent("nivel-cambiado", { detail: { i: actual, nivel: k, total: lista.length } }));
    try { alNivel?.(actual, k, lista[k - 1]?.dataset.titulo); } catch (e) { console.error(e); }
  }
  const ant = Object.assign(document.createElement("button"), { className: "ghost", type: "button" });
  const sig = Object.assign(document.createElement("button"), { type: "button" });
  const puntos = Object.assign(document.createElement("div"), { className: "puntos" });
  const cuenta = Object.assign(document.createElement("span"), { className: "cuenta" });
  pasos.forEach((p, i) => {
    const b = Object.assign(document.createElement("button"), { type: "button", title: p.querySelector("h2")?.textContent || `Paso ${i + 1}` });
    b.setAttribute("aria-label", `Ir al paso ${i + 1}: ${b.title}`);
    b.addEventListener("click", () => ir(i));
    puntos.append(b);
  });
  mando.append(ant, puntos, cuenta, sig);

  let actual = -1;
  function rotular() {
    const primera = actual === 0, ultima = actual === pasos.length - 1;
    const a = etapaVecina(-1), s = etapaVecina(1);
    ant.textContent = primera && a ? `← ${a.nombre}` : "← Anterior";
    sig.textContent = ultima && s ? `${s.nombre} →` : "Siguiente →";
    ant.disabled = primera && !a;
    sig.disabled = ultima && !s;
    sig.classList.toggle("salto", ultima && !!s);
  }
  function ir(i, { desdeHash = false } = {}) {
    if (i < 0) return irAEtapa(-1);
    if (i > pasos.length - 1) return irAEtapa(1);
    if (i === actual) return;
    const dir = i > actual ? 1 : -1;
    if (nivel && actual >= 0) irNivel(0, { desdeHash: true });
    actual = i;
    pasos.forEach((p, k) => {
      p.hidden = k !== i;
      p.classList.remove("entra-adelante", "entra-atras");
    });
    if (!sinMovimiento() && !desdeHash) {
      void pasos[i].offsetWidth;
      pasos[i].classList.add(dir > 0 ? "entra-adelante" : "entra-atras");
    }
    [...puntos.children].forEach((b, k) => (k === i ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current")));
    cuenta.textContent = `${i + 1} / ${pasos.length}`;
    rotular();
    history.replaceState(null, "", `#paso-${i + 1}`);
    document.dispatchEvent(new CustomEvent("paso-cambiado", { detail: { i, total: pasos.length } }));
    try { alCambiar?.(i, pasos[i].dataset.paso, dir); } catch (e) { console.error(e); }
  }
  ant.addEventListener("click", () => ir(actual - 1));
  sig.addEventListener("click", () => ir(actual + 1));
  const control = { ir, irNivel, get actual() { return actual; }, get nivel() { return nivel; }, total: pasos.length, info: () => pasos[actual]?.abrirInfo?.() };
  window.__recorrido = control;

  const desdeHash = () => {
    if (location.hash === "#paso-fin") return pasos.length - 1;
    const m = location.hash.match(/^#paso-(\d+)(?:-(\d+))?$/);
    return m ? Math.min(pasos.length, Math.max(1, +m[1])) - 1 : 0;
  };
  const nivelHash = () => +(location.hash.match(/^#paso-\d+-(\d+)$/)?.[1] || 0);
  const aplicarHash = () => { const k = nivelHash(); ir(desdeHash(), { desdeHash: true }); irNivel(k, { desdeHash: true }); if (k) history.replaceState(null, "", `#paso-${actual + 1}-${k}`); };
  addEventListener("hashchange", aplicarHash);
  aplicarHash();
  return control;
}

// Teclado global (un solo lugar para todo el sitio). Si la página no tiene recorrido, las flechas cambian de etapa.
const esCampo = el => el?.closest?.("input, select, textarea, [contenteditable]");
addEventListener("keydown", e => {
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || esCampo(e.target)) return;
  if (document.querySelector("dialog[open]")) return;
  const r = window.__recorrido;
  if (e.key.toLowerCase() === "i" && r?.info) { e.preventDefault(); return r.info(); }
  if (r && (e.key === "ArrowDown" || e.key === "ArrowUp")) { e.preventDefault(); return r.irNivel(r.nivel + (e.key === "ArrowDown" ? 1 : -1)); }
  const adelante = ["ArrowRight", "PageDown", " "].includes(e.key);
  const atras = ["ArrowLeft", "PageUp"].includes(e.key);
  if (!adelante && !atras && e.key !== "Home" && e.key !== "End") return;
  if (e.key === " " && e.target.closest?.("button, a, summary")) return;
  e.preventDefault();
  if (!r) return irAEtapa(adelante ? 1 : atras ? -1 : 0);
  if (e.key === "Home") return r.ir(0);
  if (e.key === "End") return r.ir(r.total - 1);
  r.ir(r.actual + (adelante ? 1 : -1));
}, true);

// Animación simple con requestAnimationFrame: fn(t) con t de 0 a 1. Devuelve una función para cancelarla.
export function animar(ms, fn, fin) {
  if (sinMovimiento()) { fn(1); fin?.(); return () => {}; }
  let id, t0;
  const paso = ts => {
    t0 ??= ts;
    const t = Math.min(1, (ts - t0) / ms);
    fn(t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    if (t < 1) id = requestAnimationFrame(paso); else fin?.();
  };
  id = requestAnimationFrame(paso);
  return () => cancelAnimationFrame(id);
}
