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
// Teclado: → ↓ espacio y AvPág avanzan; ← ↑ y RePág retroceden; Inicio y Fin. Al pasar del último paso se abre la
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

export function recorrido(raiz, alCambiar) {
  const pasos = [...raiz.querySelectorAll(".paso")];
  const mando = raiz.querySelector(".mando");
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
  const control = { ir, get actual() { return actual; }, total: pasos.length };
  window.__recorrido = control;

  const desdeHash = () => {
    if (location.hash === "#paso-fin") return pasos.length - 1;
    const m = location.hash.match(/^#paso-(\d+)$/);
    return m ? Math.min(pasos.length, Math.max(1, +m[1])) - 1 : 0;
  };
  addEventListener("hashchange", () => ir(desdeHash(), { desdeHash: true }));
  ir(desdeHash(), { desdeHash: true });
  return control;
}

// Teclado global (un solo lugar para todo el sitio). Si la página no tiene recorrido, las flechas cambian de etapa.
const esCampo = el => el?.closest?.("input, select, textarea, [contenteditable]");
addEventListener("keydown", e => {
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || esCampo(e.target)) return;
  if (document.querySelector("dialog[open]")) return;
  const r = window.__recorrido;
  const adelante = ["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key);
  const atras = ["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key);
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
