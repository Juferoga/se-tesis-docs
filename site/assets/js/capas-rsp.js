// Animaciones de las capas de detalle (recuperación, seguridad y preguntas). Cada capa dibuja un SVG propio
// dentro de la vista que entrega guia.js. Uso:
//   import { gestorCapas } from "./assets/js/capas-rsp.js";
//   recorrido(raiz, alCambiar, gestorCapas({ "2-1": api => ({ ms: 2500, cuadro(u) {…} }) }));
// La función de cada capa construye el dibujo con api.el(…) y devuelve { ms, cuadro(u) } con u de 0 a 1;
// cuadro(1) es el estado final (lo que se ve sin movimiento). Colores: solo tokens del tema por CSS.
import { animar } from "./guia.js";

const NS = "http://www.w3.org/2000/svg";
export const W = 480, H = 360;

export function el(tag, attrs = {}, padre = null, texto = null) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
  if (texto != null) n.textContent = texto;
  padre?.append(n);
  return n;
}
// Globo nativo del SVG (hover) con el dato de la pieza.
export const globo = (n, txt) => { el("title", {}, n, txt); return n; };
// Tramo de la animación: 0 antes de a, 1 después de b, lineal entre ambos.
export const tramo = (u, a, b) => Math.max(0, Math.min(1, (u - a) / (b - a)));
export const lerp = (a, b, t) => a + (b - a) * t;
export const fmtN = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ").replace("-", "−");

const ESTILO = `
.cap-svg { font-family: var(--f-body); }
.cap-svg text { fill: var(--ink); font-size: 14px; }
.cap-svg .t-m { fill: var(--muted); font-size: 12.5px; }
.cap-svg .t-a { fill: var(--key); font-weight: 600; }
.cap-svg .t-g { font: 700 22px var(--f-display); fill: var(--ink); }
.cap-svg .t-mono { font-family: var(--f-mono); font-size: 12px; }
.cap-svg .linea { stroke: var(--line); stroke-width: 1.5; fill: none; }
.cap-svg .eje { stroke: var(--muted); stroke-width: 1; fill: none; opacity: .7; }
.cap-svg .gris { fill: var(--muted); }
.cap-svg .suave { fill: var(--soft); stroke: var(--line); }
.cap-svg .acento { fill: var(--key); }
.cap-svg .acento-s { fill: var(--key-soft); stroke: var(--key); }
.cap-svg .trazo-a { stroke: var(--key); stroke-width: 2.2; fill: none; }
.cap-svg .trazo-g { stroke: var(--muted); stroke-width: 1.6; fill: none; }
.cap-svg .discont { stroke-dasharray: 5 4; }
.cap-svg [data-oculto] { opacity: 0; }
/* En el teléfono la escena es baja: el dibujo deja libre la franja del botón «↻» */
@media (max-width: 900px) { .escena .vista-capa > svg.cap-svg { height: calc(100% - 44px); align-self: start; } }
`;
let estiloPuesto = false;
function ponerEstilo() {
  if (estiloPuesto) return;
  estiloPuesto = true;
  document.head.append(Object.assign(document.createElement("style"), { textContent: ESTILO }));
}

export function gestorCapas(defs) {
  let limpiar = null;
  return (i, k, titulo, vista) => {
    limpiar?.(); limpiar = null;
    if (!k || !vista) return;
    const f = defs[`${i + 1}-${k}`];
    if (!f) { vista.hidden = true; vista.parentElement.classList.remove("con-capa"); return; }
    ponerEstilo();
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid meet", class: "cap-svg", role: "img", "aria-label": titulo || "Animación de la capa" });
    vista.append(svg);
    const r = f({ svg, el, W, H, vista });
    let cancelar = () => {};
    const correr = () => { cancelar(); r.cuadro(0); cancelar = animar(r.ms || 2600, u => r.cuadro(u)); };
    const b = Object.assign(document.createElement("button"), { type: "button", className: "ghost repetir", textContent: "↻" });
    b.setAttribute("aria-label", "Repetir la animación"); b.title = "Repetir";
    b.addEventListener("click", correr);
    vista.append(b);
    correr();
    limpiar = () => { cancelar(); r.limpiar?.(); };
  };
}
