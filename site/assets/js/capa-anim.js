// Animaciones de las capas de detalle (cifrado e inserción): un SVG que llena la «vista» de la capa
// y se repinta entero en cada cuadro con pintar(W, H, t), t de 0 a 1. Colores por clases CSS con tokens
// del tema (cambian solos con el tema). Uso:
//   const limpiar = capaSVG(vista, { ms: 2800, acento: "ciph", etiqueta: "…", pintar: (W, H, t) => "<g>…</g>" });
import { animar } from "./guia.js";

const NS = "http://www.w3.org/2000/svg";
let estilo = false;
function ponerEstilo() {
  if (estilo) return;
  estilo = true;
  const s = document.createElement("style");
  s.textContent = `
.ca { overflow: hidden; }
.ca text { font: 400 11px var(--f-mono); fill: var(--muted); }
.ca .r { font: 600 12px var(--f-body); fill: var(--muted); }
.ca .t { fill: var(--ink); }
.ca .big { font: 700 20px var(--f-display); fill: var(--ink); }
.ca text.ac, .ca .big.ac { fill: var(--ac); }
.ca .eje { stroke: var(--line); fill: none; }
.ca .rej { stroke: var(--line); stroke-dasharray: 2 3; fill: none; }
.ca .lin { stroke: var(--muted); fill: none; stroke-width: 1.5; }
.ca .lin.p { stroke-dasharray: 5 4; }
.ca .tin { stroke: var(--ink); fill: none; stroke-width: 1.5; }
.ca .tin.p { stroke-dasharray: 4 3; }
.ca .lac { stroke: var(--ac); fill: none; stroke-width: 2.2; }
.ca .gris { fill: var(--muted); }
.ca .suave { fill: var(--soft); }
.ca .caja { fill: var(--surface); stroke: var(--line); }
.ca .acf { fill: var(--ac); }
.ca .acb { fill: color-mix(in srgb, var(--ac) 16%, transparent); }
.ca .aco { fill: none; stroke: var(--ac); stroke-width: 2; }
.ca .tinf { fill: var(--ink); }
.ca .b1 { fill: var(--muted); }
.ca .b0 { fill: var(--surface); stroke: var(--muted); stroke-width: 1.2; }
.ca .b1.ac { fill: var(--ac); }
.ca .b0.ac { stroke: var(--ac); stroke-width: 2; }
.ca .bq { fill: var(--soft); stroke: var(--line); stroke-dasharray: 3 2; }
.ca text.d1 { fill: var(--surface); font-weight: 600; }
.ca text.d0 { fill: var(--muted); font-weight: 600; }
.ca text.d0.ac { fill: var(--ac); }
.vista-capa .repetir.ca-rep { left: 4px; bottom: 4px; padding: .3rem .5rem; font-size: .85rem; line-height: 1; }
`;
  document.head.append(s);
}

export function capaSVG(vista, { ms = 2800, pintar, etiqueta = "", acento = "ciph" }) {
  ponerEstilo();
  vista.style.setProperty("--ac", `var(--${acento})`);
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "ca");
  svg.setAttribute("role", "img");
  if (etiqueta) svg.setAttribute("aria-label", etiqueta);
  const boton = Object.assign(document.createElement("button"), { type: "button", className: "ghost repetir ca-rep", textContent: "↻", title: "Repetir la animación" });
  boton.setAttribute("aria-label", "Repetir la animación");
  vista.append(svg, boton);
  let t = 0, cancelar = () => {}, W = 0, H = 0;
  const pintarYa = () => {
    W = Math.max(1, Math.round(vista.clientWidth)); H = Math.max(1, Math.round(vista.clientHeight));
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = pintar(W, H, t);
  };
  const jugar = () => { cancelar(); t = 0; cancelar = animar(ms, x => { t = x; pintarYa(); }, () => { t = 1; pintarYa(); }); };
  const ro = new ResizeObserver(() => { if (vista.clientWidth !== W || vista.clientHeight !== H) pintarYa(); });
  ro.observe(vista);
  boton.addEventListener("click", jugar);
  pintarYa();
  jugar();
  return () => { cancelar(); ro.disconnect(); };
}

// Utilidades de dibujo.
export const fase = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
export const f = (n, d = 1) => (+n).toFixed(d);
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
export const txt = (x, y, s, cls = "", ancla = "start", extra = "") =>
  `<text x="${f(x)}" y="${f(y)}" class="${cls}" text-anchor="${ancla}" ${extra}>${s}</text>`;
export const titulo = s => `<title>${esc(s)}</title>`;
export const rect = (x, y, w, h, cls, tit = "", extra = "") =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(Math.max(0, w))}" height="${f(Math.max(0, h))}" class="${cls}" ${extra}>${tit ? titulo(tit) : ""}</rect>`;
export const linea = (x1, y1, x2, y2, cls) => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" class="${cls}"/>`;
export const camino = (pts, cls) => pts.length < 2 ? "" : `<path class="${cls}" d="M${pts.map(p => f(p[0]) + "," + f(p[1])).join("L")}"/>`;
// Celda de un bit: 1 relleno, 0 contorno, null = desconocido. op: opacidad. ac: acento.
export function bit(x, y, s, b, { ac = false, op = 1, tit = "", digito = true } = {}) {
  const r = Math.min(5, s * .2);
  if (op <= 0) return "";
  const cls = b == null ? "bq" : (b ? "b1" : "b0") + (ac ? " ac" : "");
  let g = `<g opacity="${f(op, 2)}"><rect x="${f(x + 1)}" y="${f(y + 1)}" width="${f(s - 2)}" height="${f(s - 2)}" rx="${f(r)}" class="${cls}"/>`;
  if (digito && s >= 15) g += `<text x="${f(x + s / 2)}" y="${f(y + s / 2 + s * .17)}" text-anchor="middle" class="${b == null ? "d0" : b ? "d1" : "d0" + (ac ? " ac" : "")}" style="font-size:${f(Math.min(13, s * .5))}px">${b == null ? "?" : b}</text>`;
  return g + (tit ? titulo(tit) : "") + "</g>";
}
// Marco de un gráfico con escalas lineales o logarítmicas.
export function ejes(caja, { x0, x1, y0, y1, logx = false }) {
  const lx = v => (logx ? Math.log10(v) : v);
  const X = v => caja.x + (lx(v) - lx(x0)) / (lx(x1) - lx(x0)) * caja.w;
  const Y = v => caja.y + caja.h - (v - y0) / (y1 - y0) * caja.h;
  return { X, Y };
}
export const bitsDe = n => n.toString(2).padStart(8, "0").split("").map(Number);
// Tamaño de letra según el ancho de la vista.
export const chico = W => W < 460;
