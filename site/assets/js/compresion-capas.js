// Animaciones propias de las capas de detalle (↓) de la etapa 1 (compresión).
// También exporta el montaje común (montarCapa y ayudas de SVG) que usa inicio-capas.js.
//
// Cada escena es construir(svg, W, H) → pintar(t), con t de 0 a 1: dibuja en un SVG cuyo viewBox mide W × H
// (mismo aspecto que la vista) y pinta el estado de la animación en t. pintar(1) es el estado final quieto.
import { animar, sinMovimiento } from "./guia.js";

const NS = "http://www.w3.org/2000/svg";
export function s(tag, at = {}, padre) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(at)) {
    if (v == null) continue;
    if (k === "text") n.textContent = v; else n.setAttribute(k, v);
  }
  padre?.append(n);
  return n;
}
export const T = (padre, x, y, text, at = {}) => s("text", { x, y, text, ...at }, padre);
export const tramo = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
export const mezcla = (a, b, u) => a + (b - a) * u;
export const globo = (n, txt) => { s("title", { text: txt }, n); return n; };
export const miles = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
// Ancho aproximado de un texto (en unidades del SVG) para repartir el espacio.
export const anchoTxt = (txt, fs = 13, mono = false) => [...txt].length * fs * (mono ? 0.61 : 0.5);

// Estilos de las vistas: grises del tema y un solo acento (--acento, que fija cada página).
const CSS = `
.cv { font-family: var(--f-body); overflow: visible; }
.cv text { fill: var(--ink); font-size: 13px; }
.cv .m { font-family: var(--f-mono); }
.cv text.r, .cv .rotulo { fill: var(--muted); font-size: 11.5px; font-weight: 400; }
.cv text.g { font-size: 15px; font-weight: 600; }
.cv text.ac, .cv .f-ac { fill: var(--acento); }
.cv text.mu, .cv .f-mu { fill: var(--muted); }
.cv .f-soft { fill: var(--soft); } .cv .f-line { fill: var(--line); } .cv .f-bg { fill: var(--bg); } .cv .f-ink { fill: var(--ink); }
.cv .s-ac { stroke: var(--acento); } .cv .s-line { stroke: var(--line); } .cv .s-mu { stroke: var(--muted); } .cv .s-ink { stroke: var(--ink); } .cv .s-bg { stroke: var(--bg); }
.cv .nf { fill: none; }
.cv [data-oc] { transition: none; }
`;
let cssPuesto = false;
function ponerCss() {
  if (cssPuesto) return;
  cssPuesto = true;
  document.head.append(Object.assign(document.createElement("style"), { textContent: CSS }));
}

// Monta una escena en la vista de la capa. Devuelve la función de limpieza.
export function montarCapa(vista, construir, { ms = 3000, acento = "var(--net)", etiqueta = "" } = {}) {
  ponerCss();
  let vivo = true, cancelar = () => {}, pintar = () => {}, t = 0, medida = "", cuadroRO = 0, tanda = 0;
  const svg = s("svg", { class: "cv", role: "img", "aria-label": etiqueta, preserveAspectRatio: "xMidYMid meet", style: `--acento:${acento}` });
  const boton = Object.assign(document.createElement("button"), { type: "button", className: "ghost repetir", textContent: "↻", title: "Repetir la animación" });
  boton.setAttribute("aria-label", "Repetir la animación");
  vista.append(svg, boton);
  async function armar() {
    const vw = vista.clientWidth || 640, h = vista.clientHeight || 480;
    medida = `${vw}x${h}`;
    // En una vista baja (teléfono) el botón «↻» ocupa su propia franja a la izquierda y no tapa el dibujo.
    const franja = h < 300 ? 34 : 0, w = vw - franja;
    svg.style.marginLeft = franja ? franja + "px" : "";
    svg.style.width = franja ? `calc(100% - ${franja}px)` : "";
    boton.style.cssText = franja ? "left:2px;bottom:6px;padding:.25rem .45rem;font-size:.8rem" : "";
    const W = Math.round(Math.max(420, Math.min(760, w))), H = Math.round(W * h / w);
    const mia = ++tanda;
    // El grupo se monta antes de construir: getTotalLength y compañía necesitan el nodo en el documento.
    const g = s("g");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.replaceChildren(g);
    const f = await construir(g, W, H);
    if (!vivo || mia !== tanda) return;
    pintar = f || (() => {});
    pintar(t);
  }
  function correr() {
    cancelar();
    t = sinMovimiento() ? 1 : 0;
    pintar(t);
    cancelar = animar(ms, u => { t = u; pintar(u); });
  }
  boton.addEventListener("click", correr);
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(cuadroRO);
    cuadroRO = requestAnimationFrame(() => {
      if (!vivo || !vista.clientWidth) return;
      if (`${vista.clientWidth}x${vista.clientHeight}` !== medida) armar();
    });
  });
  armar().then(() => { if (vivo) { correr(); ro.observe(vista); } });
  return () => { vivo = false; cancelar(); ro.disconnect(); cancelAnimationFrame(cuadroRO); };
}

/* ====================================================================================================
   Escenas de la compresión
   ==================================================================================================== */

// 1.1 · Comprimir es predecir: árbol de un código sin prefijos con ℓ = ⌈−log2 Q⌉ y la suma de Kraft.
function kraft(g, W, H) {
  const m = 20;
  const SIM = [["a", 0.4], ["b", 0.2], ["c", 0.2], ["d", 0.1], ["e", 0.1]];
  // Código canónico con ℓ = ⌈−log2 Q⌉: 2, 3, 3, 4, 4.
  let siguiente = 0, ant = 0;
  const cod = SIM.map(([x, q]) => {
    const l = Math.ceil(-Math.log2(q));
    siguiente <<= l - ant; ant = l;
    const c = siguiente.toString(2).padStart(l, "0"); siguiente++;
    return { x, q, l, c };
  });
  const kraftSum = cod.reduce((a, c) => a + 2 ** -c.l, 0);
  const Hq = cod.reduce((a, c) => a - c.q * Math.log2(c.q), 0);
  const El = cod.reduce((a, c) => a + c.q * c.l, 0);

  const alto = Math.min(H - 20, 520);
  const y0 = (H - alto) / 2;
  const top = y0 + 46, yBar = y0 + alto - 58, treeB = yBar - 46;
  const x0 = m, x1 = W - m;
  const X = c => c.length ? x0 + (x1 - x0) * (parseInt(c, 2) + 0.5) / 2 ** c.length : (x0 + x1) / 2;
  const Y = d => top + (treeB - top) * d / 4;
  T(g, m, y0 + 16, "Código sin prefijos con ℓ = ⌈−log₂ Q⌉", { class: "rotulo" });
  T(g, W - m, y0 + 16, "Q de ejemplo", { class: "rotulo", "text-anchor": "end" });

  // Esqueleto gris del árbol completo hasta profundidad 4, salvo lo que cuelga de una hoja.
  const esHojaOBajo = c => cod.some(k => c.length > k.c.length && c.startsWith(k.c));
  const esq = s("g", {}, g);
  for (let d = 1; d <= 4; d++) for (let i = 0; i < 2 ** d; i++) {
    const c = i.toString(2).padStart(d, "0");
    if (esHojaOBajo(c)) continue;
    s("line", { x1: X(c.slice(0, -1)), y1: Y(d - 1), x2: X(c), y2: Y(d), class: "s-line", "stroke-width": 1.2, "stroke-dasharray": "3 4" }, esq);
  }
  // Aristas de cada palabra de código, en el orden en que aparecen.
  const aristas = new Map();
  cod.forEach((k, j) => { for (let d = 1; d <= k.l; d++) { const c = k.c.slice(0, d); if (!aristas.has(c)) aristas.set(c, j); } });
  const T0 = 0.06, DT = 0.13;
  const lineas = [...aristas].map(([c, j]) => {
    const d = c.length, a = [X(c.slice(0, -1)), Y(d - 1)], b = [X(c), Y(d)];
    const l = s("line", { x1: a[0], y1: a[1], x2: a[0], y2: a[1], class: "s-ac", "stroke-width": 2.4, "stroke-linecap": "round" }, g);
    const et = T(g, (a[0] + b[0]) / 2 + (c.at(-1) === "0" ? -9 : 9), (a[1] + b[1]) / 2 + 2, treeB - top > 120 ? c.at(-1) : "", { class: "r m", "text-anchor": "middle" });
    const t0 = T0 + j * DT + (d - 1) / cod[j].l * DT * 0.6, t1 = t0 + DT * 0.6 / cod[j].l;
    return { l, et, a, b, t0, t1 };
  });
  s("circle", { cx: X(""), cy: Y(0), r: 4, class: "f-ink" }, g);
  // Barra [0, 1): cada hoja ocupa un intervalo diádico de longitud 2^−ℓ, justo debajo de ella.
  const bh = 16;
  s("rect", { x: x0, y: yBar, width: x1 - x0, height: bh, rx: 3, class: "f-soft" }, g);
  const hojas = cod.map((k, j) => {
    const x = X(k.c), y = Y(k.l), a = x0 + (x1 - x0) * parseInt(k.c, 2) / 2 ** k.l, w = (x1 - x0) / 2 ** k.l;
    const guia = s("line", { x1: x, y1: y + 18, x2: x, y2: yBar, class: "s-line", "stroke-dasharray": "2 3" }, g);
    const seg = globo(s("rect", { x: a + 1, y: yBar, width: w - 2, height: bh, rx: 2, class: "f-ac" }, g), `${k.x}: Q = ${k.q}, ℓ = ${k.l}, palabra ${k.c}, ocupa 2^−${k.l} = ${2 ** -k.l}`);
    const nodo = globo(s("circle", { cx: x, cy: y, r: 6, class: "f-ac" }, g), `${k.x}: Q = ${k.q} → ℓ = ${k.l} bits, palabra ${k.c}`);
    const et = T(g, x, y + 20, k.x, { "text-anchor": "middle", class: "m", "font-weight": 600 });
    return { guia, seg, nodo, et, t: T0 + (j + 1) * DT };
  });
  T(g, x0, yBar + bh + 14, "0", { class: "r m", "text-anchor": "middle" });
  T(g, x1, yBar + bh + 14, "1", { class: "r m", "text-anchor": "middle" });
  const suma = T(g, (x0 + x1) / 2, yBar + bh + 18, "", { class: "m", "text-anchor": "middle" });
  const cota = T(g, (x0 + x1) / 2, yBar + bh + 38, `H = ${Hq.toFixed(2)} Sh ≤ E[ℓ] = ${El.toFixed(2)} bits < H + 1`, { class: "r m", "text-anchor": "middle" });
  return t => {
    lineas.forEach(({ l, et, a, b, t0, t1 }) => {
      const u = tramo(t, t0, t1);
      l.setAttribute("x2", mezcla(a[0], b[0], u)); l.setAttribute("y2", mezcla(a[1], b[1], u));
      et.setAttribute("opacity", u >= 1 ? 1 : 0);
    });
    let acum = 0;
    hojas.forEach((h, j) => {
      const u = tramo(t, h.t - 0.03, h.t + 0.04);
      [h.nodo, h.et, h.guia].forEach(n => n.setAttribute("opacity", u));
      h.seg.setAttribute("opacity", 0.85 * u);
      if (u > 0) acum += 2 ** -cod[j].l * u;
    });
    const fin = tramo(t, 0.8, 0.95);
    suma.textContent = `Σ 2^−ℓ = ${acum.toFixed(3)}${fin > 0 ? " ≤ 1" : ""}`;
    cota.setAttribute("opacity", fin);
    if (t >= 1) suma.textContent = `Σ 2^−ℓ = ${kraftSum.toFixed(3)} ≤ 1`;
  };
}

// 2.1 · Tokenización reversible: los bytes UTF-8 se agrupan en tokens y, al unirlos, vuelven idénticos.
function tokens(g, W, H) {
  const TOKS = ["Oh", " dul", "ce", " ni", "ña", " p", "ál", "ida"];
  const enc = new TextEncoder();
  const grupos = TOKS.map(t => [...enc.encode(t)]);
  const bytes = grupos.flat();
  const n = bytes.length, m = 18, hueco = 7;
  const anchoU = W - 2 * m;
  const bw = Math.min(30, (anchoU - hueco * (TOKS.length - 1)) / n);
  const bh = Math.min(26, bw * 1.15);
  const filas = 3, sep = Math.min(96, (H - 60) / filas);
  const y0 = (H - (sep * 2 + bh + 40)) / 2 + (H < 300 ? 6 : 24);
  const yA = y0, yB = y0 + sep, yC = y0 + 2 * sep;
  const xJunto = k => m + (anchoU - n * bw) / 2 + k * bw;
  const totG = n * bw + hueco * (TOKS.length - 1);
  const xGrupo = [];
  { let k = 0, x = m + (anchoU - totG) / 2; grupos.forEach(gr => { gr.forEach(() => { xGrupo.push(x); x += bw; k++; }); x += hueco; }); }
  const hx = b => b.toString(16).toUpperCase().padStart(2, "0");
  const fsB = Math.max(8.5, Math.min(11, bw * 0.42));
  const bajo = H < 300;
  if (!bajo) {
    T(g, m, yA - 12, "x: los bytes UTF-8", { class: "rotulo" });
    T(g, m, yB - (bh > 20 ? 26 : 22), "τ(x): tokens", { class: "rotulo" });
    T(g, m, yC - 12, "τ⁻¹(τ(x)): bytes unidos", { class: "rotulo" });
  }
  const caja = (x, y, b, multi) => {
    const gg = s("g", { transform: `translate(${x},${y})` }, g);
    s("rect", { width: bw - 1.5, height: bh, rx: 3, class: multi ? "f-ac" : "f-soft", "fill-opacity": multi ? 0.2 : 1 }, gg);
    T(gg, (bw - 1.5) / 2, bh / 2 + fsB * 0.36, hx(b), { class: "m", "text-anchor": "middle", style: `font-size:${fsB}px` });
    return gg;
  };
  // Bytes de un carácter de 2 bytes (ñ, á) en acento.
  const multi = new Set();
  { let k = 0; TOKS.forEach(t => { for (const ch of t) { const l = enc.encode(ch).length; for (let q = 0; q < l; q++) { if (l > 1) multi.add(k); k++; } } }); }
  const fila = (y, xs) => bytes.map((b, k) => caja(xs(k), y, b, multi.has(k)));
  const A = fila(yA, xJunto), B = fila(yA, xJunto), C = fila(yA, xJunto);
  // Rótulos de los tokens sobre la fila B.
  let k0 = 0;
  const rot = grupos.map((gr, j) => {
    const xa = xGrupo[k0], xb = xGrupo[k0 + gr.length - 1] + bw - 1.5; k0 += gr.length;
    const gg = s("g", {}, g);
    s("path", { d: `M${xa} ${yB - 5}V${yB - 9}H${xb}V${yB - 5}`, class: "s-ac nf", "stroke-width": 1.4 }, gg);
    T(gg, (xa + xb) / 2, yB - 13, `«${TOKS[j].replace(/^ /, "␣")}»`, { class: "m", "text-anchor": "middle", style: `font-size:${Math.min(12, fsB + 1.5)}px` });
    globo(gg, `token «${TOKS[j]}»: ${gr.length} byte${gr.length > 1 ? "s" : ""} (${gr.map(hx).join(" ")})`);
    return gg;
  });
  const ok = T(g, W / 2, yC + bh + 26, `${n} bytes idénticos: «Oh dulce niña pálida»`, { class: "ac", "text-anchor": "middle", "font-weight": 600 });
  const nota = T(g, W / 2, yA + bh + 18, bajo ? "" : "ñ = C3 B1 y á = C3 A1: dos bytes cada una", { class: "r", "text-anchor": "middle" });
  return t => {
    const u1 = tramo(t, 0.08, 0.45), u2 = tramo(t, 0.55, 0.88);
    B.forEach((n, k) => n.setAttribute("transform", `translate(${mezcla(xJunto(k), xGrupo[k], u1)},${mezcla(yA, yB, u1)})`));
    C.forEach((n, k) => {
      const x = u2 > 0 ? mezcla(xGrupo[k], xJunto(k), u2) : mezcla(xJunto(k), xGrupo[k], u1);
      const y = u2 > 0 ? mezcla(yB, yC, u2) : mezcla(yA, yB, u1);
      n.setAttribute("transform", `translate(${x},${y})`);
      n.setAttribute("opacity", u2 > 0 ? 1 : 0);
    });
    rot.forEach((r, j) => r.setAttribute("opacity", tramo(t, 0.3 + j * 0.025, 0.4 + j * 0.025)));
    ok.setAttribute("opacity", tramo(t, 0.88, 1));
    nota.setAttribute("opacity", tramo(t, 0, 0.1) * (1 - tramo(t, 0.1, 0.2)) + tramo(t, 0.9, 1));
  };
}

// 4.1 · Las ecuaciones de un bloque: el vector h viaja por la corriente residual y por las dos ramas.
function bloque(g, W, H) {
  const m = 22;
  const conBarras = H > 330;
  const altoDiag = 150, altoBarras = conBarras ? Math.min(200, H - altoDiag - 110) : 0;
  const total = altoDiag + (conBarras ? altoBarras + 50 : 0);
  const y0 = (H - total) / 2;
  const yL = y0 + altoDiag - 30, yR = yL - 74; // línea principal y carril de las ramas
  const xa = m + 26, xb = W - m - 26;
  const L = xb - xa;
  const xs1 = xa + L * 0.06, xp1 = xa + L * 0.47, xs2 = xa + L * 0.53, xp2 = xa + L * 0.94;
  T(g, m, y0 + 4, "Una capa (k = 1, …, 28) con normalización previa y residuales", { class: "rotulo" });
  s("line", { x1: xa, y1: yL, x2: xb, y2: yL, class: "s-line", "stroke-width": 3 }, g);
  T(g, xa - 6, yL + 5, "h", { class: "m g", "text-anchor": "end" });
  T(g, xb + 6, yL + 5, "h′", { class: "m g" });
  const ramas = [[xs1, xp1, "Atn"], [xs2, xp2, "FFN"]].map(([a, b, nom]) => {
    const camino = s("path", { d: `M${a} ${yL}V${yR}H${b}V${yL - 9}`, class: "s-line nf", "stroke-width": 2 }, g);
    const bw = (b - a) * 0.42, bh = 26;
    const c1 = a + (b - a) * 0.27, c2 = a + (b - a) * 0.73;
    const caja = (cx, txt) => { const gg = s("g", {}, g); const r = s("rect", { x: cx - bw / 2, y: yR - bh / 2, width: bw, height: bh, rx: 6, class: "f-soft s-line", "stroke-width": 1.2 }, gg); T(gg, cx, yR + 4.5, txt, { class: "m", "text-anchor": "middle", style: `font-size:${Math.min(12, bw / 5.2)}px` }); return r; };
    const n1 = caja(c1, "RMSNorm"), n2 = caja(c2, nom);
    const suma = s("g", {}, g);
    const cs = s("circle", { cx: b, cy: yL, r: 9, class: "f-bg s-mu", "stroke-width": 1.5 }, suma);
    T(suma, b, yL + 4.5, "+", { class: "m", "text-anchor": "middle" });
    const largo = camino.getTotalLength?.() || (2 * 74 + (b - a));
    return { a, b, c1, c2, n1, n2, cs, nom, largo, camino };
  });
  const fsF = Math.min(11.5, (xp1 - xs1) / 15);
  T(g, (xs1 + xp1) / 2, yL + 22, "u = h + Atn(RMSNorm(h))", { class: "r m", "text-anchor": "middle", style: `font-size:${fsF}px` });
  T(g, (xs2 + xp2) / 2, yL + 22, "h′ = u + FFN(RMSNorm(u))", { class: "r m", "text-anchor": "middle", style: `font-size:${fsF}px` });
  const pulso = s("circle", { r: 6, class: "f-ac" }, g);
  const resid = s("circle", { r: 4.5, class: "f-mu" }, g);
  // Barras de RMSNorm: x y x / rms(x) (valores ilustrativos).
  let barras = null;
  if (conBarras) {
    const yb = yL + 64, hb = altoBarras, mid = yb + hb / 2;
    const X = [0.9, -2.1, 1.4, 3.2, -0.6, 2.4, -1.7, 0.3, -2.8, 1.1, 2.0, -1.2, 0.7, -3.4, 1.8, -0.4];
    const rms = Math.sqrt(X.reduce((a, v) => a + v * v, 0) / X.length);
    const esc = hb / 2 / 3.6;
    T(g, m, yb - 6, "RMSNorm: x (gris) y x / rms(x) (acento) · valores ilustrativos", { class: "rotulo" });
    s("line", { x1: xa, y1: mid, x2: xb, y2: mid, class: "s-line" }, g);
    [-1, 1].forEach(sg => s("line", { x1: xa, y1: mid - sg * esc, x2: xb, y2: mid - sg * esc, class: "s-mu", "stroke-dasharray": "3 4", "stroke-width": 1 }, g));
    T(g, xb + 4, mid - esc + 4, "+1", { class: "r m" });
    T(g, xb + 4, mid + esc + 4, "−1", { class: "r m" });
    const paso = L / X.length;
    barras = X.map((v, i) => {
      const x = xa + i * paso + paso * 0.12, w = paso * 0.36;
      const gris = s("rect", { x, width: w, class: "f-line" }, g);
      const ac = s("rect", { x: x + w + 2, width: w, class: "f-ac" }, g);
      const alto = (r, val) => { const h = Math.abs(val) * esc; r.setAttribute("y", val >= 0 ? mid - h : mid); r.setAttribute("height", h); };
      alto(gris, v);
      return u => alto(ac, (v / rms) * u);
    });
    T(g, (xa + xb) / 2, yb + hb + 22, `rms(x) = ${rms.toFixed(2)} → la lista queda con rms 1 (ε = 10⁻⁶)`, { class: "r m", "text-anchor": "middle" });
  }
  const punto = (path, u) => { const p = path.getPointAtLength(u * path.getTotalLength()); return [p.x, p.y]; };
  return t => {
    // 0 → 0.1 tramo inicial; 0.1 → 0.45 rama 1; 0.5 → 0.85 rama 2.
    const seg = [[0.08, 0.44], [0.5, 0.86]];
    let px = xa, py = yL, rx = xa;
    ramas.forEach((r, j) => {
      const [a, b] = seg[j];
      const u = tramo(t, a, b);
      const enRama = t >= a && t <= b;
      r.camino.setAttribute("class", "nf " + (u > 0 ? "s-ac" : "s-line"));
      r.camino.setAttribute("stroke-dasharray", `${u * r.largo} ${r.largo}`);
      const pasa = (cx, nodo) => { const x0 = r.a + (r.b - r.a) * 0; const on = u > 0 && enRama && Math.abs(punto(r.camino, u)[0] - cx) < (r.b - r.a) * 0.2; nodo.setAttribute("class", (on ? "f-ac" : "f-soft") + " s-line"); nodo.setAttribute("fill-opacity", on ? 0.25 : 1); };
      pasa(r.c1, r.n1); pasa(r.c2, r.n2);
      r.cs.setAttribute("class", (u >= 1 ? "f-bg s-ac" : "f-bg s-mu"));
      if (enRama) { [px, py] = punto(r.camino, u); rx = mezcla(r.a, r.b, u); }
    });
    if (t < seg[0][0]) { px = rx = mezcla(xa, xs1, tramo(t, 0, seg[0][0])); py = yL; }
    else if (t > seg[0][1] && t < seg[1][0]) { px = rx = mezcla(xp1, xs2, tramo(t, seg[0][1], seg[1][0])); py = yL; }
    else if (t >= seg[1][1]) { px = rx = mezcla(xp2, xb, tramo(t, seg[1][1], 0.95)); py = yL; }
    pulso.setAttribute("cx", px); pulso.setAttribute("cy", py);
    resid.setAttribute("cx", rx); resid.setAttribute("cy", yL);
    resid.setAttribute("opacity", (t > seg[0][0] && t < seg[0][1]) || (t > seg[1][0] && t < seg[1][1]) ? 1 : 0);
    barras?.forEach(f => f(tramo(t, 0.86, 1)));
  };
}

// 4.2 · Conteo de parámetros: pila con área proporcional al número de parámetros.
function conteo(g, W, H) {
  const EMB = 233373696, ATN = 5507072, FFN = 41287680, NORM = 2 * 1536, CAPA = ATN + FFN + NORM, TOTAL = EMB + 28 * CAPA + 1536;
  const m = 20;
  const ancho = W / H > 1.3;
  // La pila crece a lo largo de un eje: hacia arriba (vertical) o hacia la derecha (apaisado).
  const texto = ancho ? 0 : 0;
  let largo, grosor, ox, oy;
  if (ancho) { largo = W - 2 * m; grosor = Math.min(70, H * 0.3); ox = m; oy = H * 0.52; }
  else { largo = Math.min(H - 150, 560); grosor = Math.min(150, W * 0.3); ox = m + 10; oy = (H + largo) / 2 + 10; }
  const porParam = largo / TOTAL;
  // rect a lo largo del eje: desde a (parámetros acumulados) con longitud l, y fracción transversal [f0, f1].
  const rect = (a, l, f0, f1, cls) => ancho
    ? s("rect", { x: ox + a * porParam, y: oy - grosor / 2 + f0 * grosor, width: Math.max(0.6, l * porParam - 0.6), height: (f1 - f0) * grosor, class: cls }, g)
    : s("rect", { x: ox + f0 * grosor, y: oy - (a + l) * porParam + 0.3, width: (f1 - f0) * grosor, height: Math.max(0.6, l * porParam - 0.6), class: cls }, g);
  const emb = globo(rect(0, EMB, 0, 1, "f-mu"), `Embeddings (compartidos con la salida): 151 936 × 1536 = ${miles(EMB)}`);
  const capas = [];
  for (let k = 0; k < 28; k++) {
    const a = EMB + k * CAPA, fa = ATN / CAPA;
    const gg = s("g", {}, g);
    const r1 = rect(a, CAPA, 0, fa, "f-line"); gg.append(r1);
    const r2 = rect(a, CAPA, fa, 1, "f-ac"); gg.append(r2);
    globo(gg, `Capa ${k + 1}: ${miles(CAPA)} parámetros (atención ${miles(ATN)}, prealimentada ${miles(FFN)}, RMSNorm ${miles(NORM)})`);
    capas.push(gg);
  }
  // Texto
  const tx = ancho ? m : ox + grosor + 26, ty = ancho ? Math.max(22, oy - grosor / 2 - 70) : oy - largo;
  const cuenta = T(g, tx, ty + 18, "0", { class: "m", style: `font-size:${ancho ? 22 : 26}px;font-weight:600` });
  T(g, tx, ty + 38, "parámetros", { class: "rotulo" });
  const ley = ancho
    ? [[ox, oy + grosor / 2 + 20, "f-mu", `embeddings ${miles(EMB)}`], [ox + anchoTxt(`embeddings ${miles(EMB)}`, 11.5, true) + 36, oy + grosor / 2 + 20, "f-line", `atención 28 × ${miles(ATN)}`], [ox, oy + grosor / 2 + 38, "f-ac", `prealimentada 28 × ${miles(FFN)}`]]
    : [[tx, oy - 6, "f-mu", `embeddings ${miles(EMB)}`], [tx, oy - largo * 0.5 + 20, "f-line", `atención 28 × ${miles(ATN)}`], [tx, oy - largo * 0.5, "f-ac", `prealimentada 28 × ${miles(FFN)}`]];
  const leyendas = ley.map(([x, y, cls, txt]) => { const gg = s("g", {}, g); s("rect", { x, y: y - 9, width: 10, height: 10, rx: 2, class: cls }, gg); T(gg, x + 15, y, txt, { class: "m", style: "font-size:11.5px" }); return gg; });
  const pct = T(g, ancho ? W - m : tx, ancho ? oy - grosor / 2 - 10 : oy - largo * 0.5 + 44, "88 % de cada capa está en la red prealimentada", { class: "r", "text-anchor": ancho ? "end" : "start" });
  const extra = T(g, ancho ? W - m : tx, ancho ? oy + grosor / 2 + 56 : ty + 58, `+ RMSNorm 28 × ${miles(NORM)} + ${miles(1536)}`, { class: "r m", "text-anchor": ancho ? "end" : "start" });
  return t => {
    const ue = tramo(t, 0.02, 0.18);
    emb.setAttribute("opacity", ue);
    let n = EMB * ue;
    capas.forEach((c, k) => { const u = tramo(t, 0.2 + k * 0.024, 0.2 + (k + 1) * 0.024); c.setAttribute("opacity", u); n += CAPA * u; });
    if (t >= 0.9) n = TOTAL;
    cuenta.textContent = miles(Math.round(n));
    leyendas.forEach((l, j) => l.setAttribute("opacity", tramo(t, j ? 0.3 : 0.1, j ? 0.4 : 0.2)));
    pct.setAttribute("opacity", tramo(t, 0.88, 0.98));
    extra.setAttribute("opacity", tramo(t, 0.9, 1));
  };
}

// 5.1 · Atención con consultas agrupadas: 12 cabezas de consulta en 2 grupos y la máscara causal fila a fila.
function gqa(g, W, H) {
  const TOKS = ["Oh", "␣dul", "ce", "␣ni", "ña", "␣p", "ál", "ida"];
  const m = 18, ancho = W / H > 1.15;
  const n = TOKS.length;
  // Zona de cabezas y zona de la matriz.
  let cab, mat;
  if (ancho) { cab = { x: m, y: 30, w: W * 0.4, h: H - 70 }; const lado = Math.min(H - 80, W * 0.5); mat = { x: W - m - lado, y: (H - lado) / 2 + 2, lado }; }
  else { const hc = Math.min(170, H * 0.3); cab = { x: m, y: 34, w: W - 2 * m, h: hc }; const lado = Math.min(W - 2 * m - 50, H - hc - 150); mat = { x: (W - lado) / 2 + 22, y: cab.y + hc + 44, lado }; }
  T(g, cab.x, cab.y - 12, "12 cabezas de consulta, 2 pares clave/valor", { class: "rotulo" });
  // Cabezas: Q arriba (12), KV abajo (2) en horizontal (o en columnas si cabe mejor).
  const yQ = cab.y + cab.h * 0.2, yK = cab.y + cab.h * 0.78;
  const xQ = j => cab.x + cab.w * (0.06 + 0.88 * (j + (j >= 6 ? 0.8 : 0)) / 11.8);
  const xK = g2 => (xQ(6 * g2) + xQ(6 * g2 + 5)) / 2;
  const enlaces = [], qs = [];
  for (let j = 0; j < 12; j++) {
    const l = s("line", { x1: xQ(j), y1: yQ, x2: xQ(j), y2: yQ, class: "s-ac", "stroke-width": 1.2, "stroke-opacity": 0.6 }, g);
    enlaces.push({ l, a: [xQ(j), yQ], b: [xK(Math.floor(j / 6)), yK] });
  }
  for (let j = 0; j < 12; j++) qs.push(globo(s("circle", { cx: xQ(j), cy: yQ, r: Math.min(7, cab.w / 40), class: "f-ac" }, g), `Cabeza de consulta ${j}: usa el par clave/valor g(${j}) = ⌊${j}/6⌋ = ${Math.floor(j / 6)}`));
  const ks = [0, 1].map(k => { const gg = s("g", {}, g); s("rect", { x: xK(k) - 13, y: yK - 9, width: 26, height: 18, rx: 4, class: "f-mu" }, gg); T(gg, xK(k), yK + 4, `KV${k}`, { class: "m", "text-anchor": "middle", style: "font-size:9.5px;fill:var(--bg)" }); return globo(gg, `Par clave/valor ${k}: lo comparten las cabezas ${6 * k} a ${6 * k + 5}`); });
  T(g, cab.x, yQ - 14, "Q", { class: "r m" });
  // Matriz causal 8 × 8 con pesos ilustrativos (softmax de puntuaciones fijas).
  const c = mat.lado / n;
  T(g, ancho ? mat.x + mat.lado : mat.x, mat.y - 10, ancho ? "pesos ilustrativos" : "Máscara causal · pesos ilustrativos", { class: "rotulo", "text-anchor": ancho ? "end" : "start" });
  let semilla = 7;
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
  const celdas = [];
  for (let t = 0; t < n; t++) {
    const z = Array.from({ length: t + 1 }, () => azar() * 3);
    const mx = Math.max(...z), ex = z.map(v => Math.exp(v - mx)), su = ex.reduce((a, b) => a + b, 0);
    for (let u = 0; u < n; u++) {
      const x = mat.x + u * c, y = mat.y + t * c;
      if (u > t) { s("rect", { x: x + 1, y: y + 1, width: c - 2, height: c - 2, rx: 2, class: "f-soft" }, g); if (c > 18) T(g, x + c / 2, y + c / 2 + 3.5, "−∞", { class: "r m", "text-anchor": "middle", style: `font-size:${Math.min(10, c / 2.6)}px` }); continue; }
      const p = ex[u] / su;
      const r = globo(s("rect", { x: x + 1, y: y + 1, width: c - 2, height: c - 2, rx: 2, class: "f-ac" }, g), `«${TOKS[t]}» mira a «${TOKS[u]}»: peso ${p.toFixed(2)} (ilustrativo)`);
      celdas.push({ r, t, p });
    }
  }
  const fs = Math.min(11, c * 0.42);
  TOKS.forEach((tk, j) => {
    T(g, mat.x - 5, mat.y + j * c + c / 2 + fs * 0.35, tk, { class: "r m", "text-anchor": "end", style: `font-size:${fs}px` });
  });
  if (!ancho || H > 330) T(g, mat.x + mat.lado / 2, mat.y + mat.lado + 16, "cada fila (token t) ve solo s ≤ t", { class: "r", "text-anchor": "middle" });
  const kv = s("g", {}, g);
  if (ancho) { T(kv, cab.x, yK + 32, "caché K, V por token:", { class: "r" }); T(kv, cab.x, yK + 48, "2 × 28 × 2 × 128 = 14 336", { class: "r m", style: "font-size:10.5px" }); }
  else T(kv, W / 2, mat.y + mat.lado + 36, "caché K, V: 2 × 28 × 2 × 128 = 14 336 números por token", { class: "r m", "text-anchor": "middle", style: "font-size:11px" });
  return t => {
    enlaces.forEach(({ l, a, b }, j) => { const u = tramo(t, 0.04 + j * 0.012, 0.14 + j * 0.012); l.setAttribute("x2", mezcla(a[0], b[0], u)); l.setAttribute("y2", mezcla(a[1], b[1], u)); });
    ks.forEach(k => k.setAttribute("opacity", tramo(t, 0.02, 0.1)));
    celdas.forEach(({ r, t: fila, p }) => { const u = tramo(t, 0.32 + fila * 0.07, 0.4 + fila * 0.07); r.setAttribute("opacity", u * (0.15 + 0.85 * p)); });
    kv.setAttribute("opacity", tramo(t, 0.9, 1));
  };
}

// 5.2 · RoPE: q y k giran con su posición; si la distancia n − m no cambia, el producto tampoco.
function rope(g, W, H) {
  const m = 20, ancho = W / H > 1.3;
  const R = ancho ? Math.min(H * 0.34, W * 0.2) : Math.min(W * 0.3, (H - 190) * 0.42);
  const cx = ancho ? m + R + 20 : W / 2, cy = ancho ? H / 2 + 6 : 40 + R + 16;
  T(g, m, 18, "Un par de coordenadas de q y k (par i = 0: θ₀ = 1 rad por posición)", { class: "rotulo" });
  s("circle", { cx, cy, r: R, class: "s-line nf", "stroke-width": 1.2 }, g);
  s("line", { x1: cx - R - 6, y1: cy, x2: cx + R + 6, y2: cy, class: "s-line" }, g);
  s("line", { x1: cx, y1: cy - R - 6, x2: cx, y2: cy + R + 6, class: "s-line" }, g);
  const q0 = 0.35, k0 = 1.6, rq = 0.78, rk = 0.95, th = 1, D = 2; // n = m + D
  const fl = (x, y, cls, w) => { const gg = s("g", {}, g); const l = s("line", { x1: cx, y1: cy, x2: x, y2: y, class: cls, "stroke-width": w, "stroke-linecap": "round" }, gg); const c = s("circle", { r: 4.5, class: cls.replace("s-", "f-") }, gg); return { gg, l, c }; };
  const huellas = s("g", {}, g);
  const vq = fl(cx, cy, "s-ac", 3), vk = fl(cx, cy, "s-ink", 2.4);
  const arco = s("path", { class: "s-ac nf", "stroke-width": 1.5, "stroke-dasharray": "3 3" }, g);
  const eq = T(g, 0, 0, "q", { class: "ac m", "font-weight": 600 }), ek = T(g, 0, 0, "k", { class: "m", "font-weight": 600 });
  const tx = ancho ? cx + R + 34 : m, ty = ancho ? cy - R + 6 : cy + R + 36;
  const lin1 = T(g, tx, ty, "", { class: "m g" });
  const lin2 = T(g, tx, ty + 22, "", { class: "m" });
  const lin3 = T(g, tx, ty + 42, `n − m = ${D}: el producto no cambia`, { class: "r" });
  // Tira de frecuencias θ_i = b^(−2i/128), b = 10^6, en escala logarítmica.
  const tira = { x: tx, y: ancho ? ty + 88 : ty + 80, w: (ancho ? W - tx - m : W - 2 * m) };
  const conTira = tira.y + 30 < H - 10 && H > 300;
  const puntos = [];
  if (conTira) {
    T(g, tira.x, tira.y - 10, "Los 64 pares giran a ritmos distintos: θᵢ = (10⁶)^(−2i/128)", { class: "rotulo" });
    s("line", { x1: tira.x, y1: tira.y + 8, x2: tira.x + tira.w, y2: tira.y + 8, class: "s-line" }, g);
    for (let i = 0; i < 64; i++) {
      const v = 1e6 ** (-2 * i / 128), x = tira.x + tira.w * (1 - (-Math.log10(v)) / 6.2);
      puntos.push(globo(s("circle", { cx: x, cy: tira.y + 8, r: 2.6, class: i === 0 ? "f-ac" : "f-mu" }, g), `par ${i}: θ = ${v.toExponential(2)} rad por posición`));
    }
    T(g, tira.x + tira.w, tira.y + 26, "par 0: 1 rad", { class: "r m", "text-anchor": "end" });
    T(g, tira.x, tira.y + 26, "par 63: 1.24×10⁻⁶ rad", { class: "r m" });
  }
  const POS = 5;
  const marca = (pos, a, r) => { const x = cx + r * R * Math.cos(a), y = cy - r * R * Math.sin(a); s("circle", { cx: x, cy: y, r: 2.4, class: "f-line" }, huellas); };
  let ultimo = -1;
  return t => {
    const p = tramo(t, 0.05, 0.85) * POS; // posición m, de 0 a 5
    const aq = q0 + p * th, ak = k0 + p * th;
    const P = (a, r) => [cx + r * R * Math.cos(a), cy - r * R * Math.sin(a)];
    const [qx, qy] = P(aq, rq), [kx, ky] = P(ak, rk);
    vq.l.setAttribute("x2", qx); vq.l.setAttribute("y2", qy); vq.c.setAttribute("cx", qx); vq.c.setAttribute("cy", qy);
    vk.l.setAttribute("x2", kx); vk.l.setAttribute("y2", ky); vk.c.setAttribute("cx", kx); vk.c.setAttribute("cy", ky);
    const [lqx, lqy] = P(aq, rq + 0.2), [lkx, lky] = P(ak, rk + 0.14);
    eq.setAttribute("x", lqx - 4); eq.setAttribute("y", lqy + 4); ek.setAttribute("x", lkx - 4); ek.setAttribute("y", lky + 4);
    const ra = 0.32 * R, [ax, ay] = P(aq, 0.32), [bx, by] = P(ak, 0.32);
    arco.setAttribute("d", `M${ax} ${ay}A${ra} ${ra} 0 0 0 ${bx} ${by}`);
    const pe = Math.floor(p + 1e-9);
    if (pe !== ultimo) { huellas.replaceChildren(); for (let j = 0; j <= pe; j++) { marca(j, q0 + j * th, rq); marca(j, k0 + j * th, rk); } ultimo = pe; }
    const dot = rq * rk * Math.cos(ak - aq);
    lin1.textContent = `m = ${p.toFixed(1)},  n = ${(p + D).toFixed(1)}`;
    lin2.textContent = `⟨R_m q, R_n k⟩ = ${dot.toFixed(3)}`;
    lin3.setAttribute("opacity", tramo(t, 0.5, 0.7));
    puntos.forEach((c, i) => c.setAttribute("opacity", tramo(t, 0.6 + i * 0.004, 0.66 + i * 0.004)));
  };
}

// 8.1 · Regla de la cadena: la información de los 8 primeros tokens se suma y el producto de probabilidades se encoge.
const OCHO = [["Oh", "0.0021 %", 15.57], ["␣dul", "< 0.0001 %", 24.0], ["ce", "39.93 %", 1.32], ["␣ni", "0.02 %", 12.49], ["ña", "79.17 %", 0.34], ["␣p", "0.17 %", 9.18], ["ál", "1.72 %", 5.86], ["ida", "97.29 %", 0.04]];
function cadena(g, W, H) {
  const m = 22, total = OCHO.reduce((a, x) => a + x[2], 0);
  const alto = Math.min(H - 30, 420), y0 = (H - alto) / 2;
  const x0 = m + 4, x1 = W - m;
  const yCol = y0 + alto * 0.52, hMax = alto * 0.38; // columnas por token (alto ∝ Sh)
  const yStack = y0 + alto - 44, hs = 18;
  T(g, m, y0 + 10, "−log₂ Q(x₁…x₈) = suma de la información de cada token", { class: "rotulo" });
  const cw = (x1 - x0) / OCHO.length;
  const esc = hMax / 24;
  const porSh = (x1 - x0) / 70;
  s("rect", { x: x0, y: yStack, width: x1 - x0, height: hs, rx: 3, class: "f-soft" }, g);
  let acum = 0;
  const items = OCHO.map(([tk, p, sh], j) => {
    const x = x0 + j * cw + cw * 0.2, w = cw * 0.6, h = Math.max(1.5, sh * esc);
    const col = globo(s("rect", { x, y: yCol - h, width: w, height: h, rx: 2, class: "f-ac", "fill-opacity": 0.85 }, g), `«${tk}»: p = ${p}, ${sh.toFixed(2)} Sh`);
    T(g, x + w / 2, yCol + 15, tk, { class: "m", "text-anchor": "middle", style: `font-size:${Math.min(12, cw / 4.2)}px` });
    const val = T(g, x + w / 2, yCol - h - 5, sh.toFixed(2), { class: "r m", "text-anchor": "middle", style: `font-size:${Math.min(11, cw / 4.6)}px` });
    const seg = globo(s("rect", { x: x0 + acum * porSh, y: yStack, width: Math.max(0.8, sh * porSh - 1), height: hs, class: "f-ac" }, g), `«${tk}»: ${sh.toFixed(2)} Sh`);
    // Copia que viaja de la columna a la barra.
    const viaja = s("rect", { width: w, height: h, rx: 2, class: "f-ac", "fill-opacity": 0.5 }, g);
    const it = { col, val, seg, viaja, x, w, h, a: acum, sh };
    acum += sh;
    return it;
  });
  T(g, x0, yStack + hs + 15, "0", { class: "r m", "text-anchor": "middle" });
  T(g, x0 + 70 * porSh, yStack + hs + 15, "70 Sh", { class: "r m", "text-anchor": "end" });
  const suma = T(g, x0, yStack - 10, "", { class: "m g" });
  const prod = T(g, x1, yStack - 10, "", { class: "m", "text-anchor": "end" });
  return t => {
    let s1 = 0;
    items.forEach((it, j) => {
      const a = 0.08 + j * 0.1, u = tramo(t, a, a + 0.08);
      it.col.setAttribute("opacity", tramo(t, 0, 0.06));
      it.val.setAttribute("opacity", tramo(t, 0, 0.06));
      it.seg.setAttribute("opacity", u >= 1 ? 1 : 0);
      const vx = mezcla(it.x, x0 + it.a * porSh, u), vy = mezcla(yCol - it.h, yStack, u), vw = mezcla(it.w, it.sh * porSh, u), vh = mezcla(it.h, hs, u);
      it.viaja.setAttribute("x", vx); it.viaja.setAttribute("y", vy); it.viaja.setAttribute("width", Math.max(0.8, vw)); it.viaja.setAttribute("height", Math.max(1, vh));
      it.viaja.setAttribute("opacity", u > 0 && u < 1 ? 1 : 0);
      s1 += it.sh * u;
    });
    if (t >= 0.9) s1 = total;
    suma.textContent = `Σ = ${s1.toFixed(2)} Sh`;
    prod.textContent = `Q = 2^−${s1.toFixed(2)} ≈ ${(2 ** -s1).toExponential(1).replace("e", "×10^").replace("+", "")}`;
  };
}

// 9.1 · Cota de longitud: el intervalo del texto contiene un intervalo diádico de ℓ ≤ ⌈log2 1/P⌉ + 1 bits.
function cota(g, W, H) {
  const m = 26, A = 0.53, B = 0.60, P = B - A;
  const lMax = Math.ceil(Math.log2(1 / P)) + 1; // 5
  const alto = Math.min(H - 24, 440), y0 = (H - alto) / 2;
  const x0 = m, x1 = W - m, X = v => x0 + (x1 - x0) * v;
  T(g, m, y0 + 8, `Intervalo del texto [${A}, ${B}) · P = ${P.toFixed(2)} · valores de ejemplo`, { class: "rotulo" });
  const yTop = y0 + 34;
  s("line", { x1: x0, y1: yTop, x2: x1, y2: yTop, class: "s-mu" }, g);
  T(g, x0, yTop + 15, "0", { class: "r m", "text-anchor": "middle" }); T(g, x1, yTop + 15, "1", { class: "r m", "text-anchor": "middle" });
  s("rect", { x: X(A), y: yTop - 7, width: X(B) - X(A), height: 14, rx: 2, class: "f-ac", "fill-opacity": 0.85 }, g);
  T(g, (X(A) + X(B)) / 2, yTop - 11, "P(x)", { class: "m ac", "text-anchor": "middle", style: "font-size:11px" });
  // Bandas que guían la vista hacia abajo.
  const fs = alto - 100, paso = fs / lMax;
  const yUlt = yTop + 24 + paso * (lMax - 1) + 14;
  s("rect", { x: X(A), y: yTop + 8, width: X(B) - X(A), height: yUlt - yTop, class: "f-ac", "fill-opacity": 0.07 }, g);
  const filas = [];
  for (let l = 1; l <= lMax; l++) {
    const y = yTop + 24 + paso * (l - 1);
    const gg = s("g", {}, g);
    T(gg, x0 - 6, y + 11, `${l}`, { class: "r m", "text-anchor": "end" });
    const n = 2 ** l, w = 1 / n;
    let rotulado = false;
    for (let k = 0; k < n; k++) {
      const a = k * w, b = a + w, dentro = a >= A && b <= B, toca = b > A && a < B;
      const cod = k.toString(2).padStart(l, "0");
      const r = s("rect", { x: X(a) + 0.8, y, width: X(b) - X(a) - 1.6, height: 14, rx: 2, class: dentro ? "f-ac" : toca ? "f-line" : "f-soft" }, gg);
      globo(r, `[0.${cod}, +2^−${l}) = [${a}, ${b})${dentro ? ": cabe dentro" : toca ? ": se sale" : ""}`);
      if (dentro && !rotulado && (rotulado = true)) T(gg, (X(a) + X(b)) / 2, y + 28, `0.${cod}`, { class: "m ac", "text-anchor": "middle", "font-weight": 600, style: "font-size:11px" });
    }
    filas.push(gg);
  }
  T(g, x0 - 6, yTop + 4, "ℓ", { class: "r m", "text-anchor": "end" });
  const res = T(g, W / 2, y0 + alto - 4, `log₂(1/P) = ${Math.log2(1 / P).toFixed(2)} → ℓ ≤ ⌈${Math.log2(1 / P).toFixed(2)}⌉ + 1 = ${lMax} bits`, { class: "m", "text-anchor": "middle" });
  return t => {
    filas.forEach((f, j) => f.setAttribute("opacity", tramo(t, 0.1 + j * 0.15, 0.2 + j * 0.15)));
    res.setAttribute("opacity", tramo(t, 0.88, 1));
  };
}

// 9.2 · Enteros de 62 bits: en escala log2, R > 2^60 dividido entre T ≤ 2^24 deja al menos 2^36.
function enteros(g, W, H) {
  const m = 26, x0 = m, x1 = W - m, X = e => x0 + (x1 - x0) * e / 62;
  const alto = Math.min(H - 20, 330), y0 = (H - alto) / 2, yA = y0 + alto * 0.55;
  T(g, m, y0 + 10, "Escala log₂ de los enteros del codificador", { class: "rotulo" });
  s("line", { x1: x0, y1: yA, x2: x1, y2: yA, class: "s-mu", "stroke-width": 1.4 }, g);
  for (let e = 0; e <= 62; e += 2) s("line", { x1: X(e), y1: yA, x2: X(e), y2: yA + (e % 12 === 0 ? 7 : 4), class: "s-mu" }, g);
  [0, 12, 24, 36, 48, 60].forEach(e => T(g, X(e), yA + 20, `2^${e}`, { class: "r m", "text-anchor": "middle" }));
  const marca = (e, txt, cls, arriba, dy = 0) => {
    const gg = s("g", {}, g);
    s("line", { x1: X(e), y1: yA, x2: X(e), y2: yA + (arriba ? -34 - dy : 34 + dy), class: cls, "stroke-width": 2 }, gg);
    s("circle", { cx: X(e), cy: yA, r: 4.5, class: cls.replace("s-", "f-") }, gg);
    const izq = e > 30;
    T(gg, X(e) + (izq ? -4 : 4), yA + (arriba ? -40 - dy : 50 + dy), txt, { class: "m" + (cls === "s-ac" ? " ac" : ""), "text-anchor": izq ? "end" : "start", style: "font-size:11.5px" });
    return gg;
  };
  const m62 = marca(62, "2^62: extremos", "s-mu", true, 22);
  const m60 = marca(60, "R > 2^60", "s-ink", true, 0);
  const m24 = marca(24, "T ≤ 2^24", "s-mu", false);
  const m36 = marca(36, "ancho ≥ 2^36", "s-ac", true, 0);
  const flecha = s("path", { class: "s-ac nf", "stroke-width": 2 }, g);
  const div = T(g, 0, yA - 12, "÷ 2^24", { class: "m ac", "text-anchor": "middle", style: "font-size:11px" });
  const nota = T(g, W / 2, y0 + alto - 4, "error relativo de un corte < 2^−36 → menos de 2.1×10⁻¹¹ Sh por token", { class: "r", "text-anchor": "middle" });
  return t => {
    m62.setAttribute("opacity", tramo(t, 0.02, 0.12));
    m60.setAttribute("opacity", tramo(t, 0.14, 0.24));
    m24.setAttribute("opacity", tramo(t, 0.28, 0.38));
    const u = tramo(t, 0.42, 0.78), e = 60 - 24 * u;
    flecha.setAttribute("d", u > 0 ? `M${X(60)} ${yA - 6}Q${(X(60) + X(e)) / 2} ${yA - 26} ${X(e)} ${yA - 6}` : "");
    div.setAttribute("x", (X(60) + X(e)) / 2); div.setAttribute("opacity", u > 0.2 ? 1 : 0);
    m36.setAttribute("opacity", tramo(t, 0.78, 0.86));
    nota.setAttribute("opacity", tramo(t, 0.86, 0.98));
  };
}

// 10.1 · Lo que cuesta cuantizar p: −log2 q̂ frente a −log2 p, con el tope de 24 Sh.
function cuantizar(g, W, H) {
  const V = 151936, F = 2 ** 24 - V;
  const m = 22, alto = Math.min(H - 16, 460), y0 = (H - alto) / 2;
  const px0 = m + 30, px1 = W - m - 8, py0 = y0 + alto - 40, py1 = y0 + 46;
  const XM = 36, YM = 28;
  const X = v => px0 + (px1 - px0) * v / XM, Y = v => py0 - (py0 - py1) * v / YM;
  T(g, m, y0 + 12, "Costo de cada token tras cuantizar (con Σ f = 2^24, la cota)", { class: "rotulo" });
  s("line", { x1: px0, y1: py0, x2: px1, y2: py0, class: "s-mu" }, g);
  s("line", { x1: px0, y1: py0, x2: px0, y2: py1, class: "s-mu" }, g);
  for (let v = 0; v <= XM; v += 6) { s("line", { x1: X(v), y1: py0, x2: X(v), y2: py0 + 4, class: "s-mu" }, g); T(g, X(v), py0 + 16, v, { class: "r m", "text-anchor": "middle" }); }
  for (let v = 0; v <= 24; v += 6) { T(g, px0 - 6, Y(v) + 4, v, { class: "r m", "text-anchor": "end" }); }
  T(g, px1, py0 + 32, "−log₂ p (Sh), lo que pide la red", { class: "r", "text-anchor": "end" });
  T(g, px0 + 6, py1 - 8, "−log₂ q̂ (Sh), lo que se escribe", { class: "r" });
  s("line", { x1: X(0), y1: Y(0), x2: X(YM), y2: Y(YM), class: "s-line", "stroke-dasharray": "4 4" }, g);
  const tope = s("line", { x1: px0, y1: Y(24), x2: px1, y2: Y(24), class: "s-mu", "stroke-dasharray": "2 4" }, g);
  const topeT = T(g, px0 + 6, Y(24) - 6, "tope: log₂ Σ f ≤ 24 Sh", { class: "r" });
  let d = "";
  for (let i = 0; i <= 360; i++) {
    const x = XM * i / 360, p = 2 ** -x, f = Math.floor(p * F) + 1, y = Math.log2(2 ** 24 / f);
    d += (i ? "L" : "M") + X(x).toFixed(1) + " " + Y(Math.min(YM, y)).toFixed(1);
  }
  const curva = s("path", { d, class: "s-ac nf", "stroke-width": 2.6 }, g);
  const largo = curva.getTotalLength?.() || 1000;
  const pce = 0.3993, xce = -Math.log2(pce), yce = Math.log2(2 ** 24 / (Math.floor(pce * F) + 1));
  const ce = s("g", {}, g);
  globo(s("circle", { cx: X(xce), cy: Y(yce), r: 5, class: "f-ac" }, ce), `«ce»: p = 39.93 % → ${xce.toFixed(2)} Sh; tras cuantizar, a lo sumo ${yce.toFixed(4)} Sh`);
  T(ce, X(xce) + 10, Y(yce) + 4, "«ce» 1.32 Sh", { class: "m", style: "font-size:11px" });
  const dul = T(g, px1, Y(24) - 6, "« dul»: 24.00 Sh", { class: "m ac", "text-anchor": "end", style: "font-size:11px" });
  const nota = T(g, X(7), Y(3.2), "sobre la diagonal: +0.0131 Sh como máximo", { class: "r" });
  return t => {
    const u = tramo(t, 0.05, 0.75);
    curva.setAttribute("stroke-dasharray", `${u * largo} ${largo}`);
    ce.setAttribute("opacity", tramo(t, 0.12, 0.2));
    nota.setAttribute("opacity", tramo(t, 0.25, 0.35));
    tope.setAttribute("opacity", tramo(t, 0.6, 0.7)); topeT.setAttribute("opacity", tramo(t, 0.6, 0.7));
    dul.setAttribute("opacity", tramo(t, 0.8, 0.92));
  };
}

// 11.1 · Bits por carácter y perplejidad.
function perplejidad(g, W, H) {
  const m = 22, ancho = W / H > 1.45;
  const alto = Math.min(H - 16, 420), y0 = (H - alto) / 2;
  const x0 = m + 70, x1 = ancho ? W * 0.52 : W - m - 50;
  const esc = (x1 - x0) / 8.24;
  T(g, m, y0 + 12, "Bits por carácter del poema", { class: "rotulo" });
  const y1 = y0 + 30, y2 = y1 + 34;
  T(g, x0 - 8, y1 + 13, "UTF-8", { class: "r", "text-anchor": "end" });
  T(g, x0 - 8, y2 + 13, "red", { class: "r", "text-anchor": "end" });
  s("rect", { x: x0, y: y1, width: 8.24 * esc, height: 18, rx: 3, class: "f-line" }, g);
  T(g, x0 + 8.24 * esc + 6, y1 + 13, "8.24", { class: "m r" });
  const bar = s("rect", { x: x0, y: y2, height: 18, rx: 3, class: "f-ac" }, g);
  const val = T(g, 0, y2 + 13, "", { class: "m ac", "font-weight": 600 });
  // Rejilla de 26 opciones.
  const cols = ancho ? 9 : 13, filas = Math.ceil(26 / cols);
  const zona = ancho ? { x: W * 0.6, y: y0 + 26, w: W * 0.4 - m, h: alto - 70 } : { x: m, y: y2 + 64, w: W - 2 * m, h: alto - (y2 - y0) - 120 };
  const lado = Math.min(zona.w / cols, zona.h / filas, 44);
  const ox = zona.x + (zona.w - lado * cols) / 2, oy = zona.y + 14;
  T(g, ancho ? zona.x : m, zona.y + (ancho ? 0 : 0), "PPL = 2^H̄ ≈ 25.6 a 26.1", { class: "rotulo" });
  const caras = [];
  for (let k = 0; k < 26; k++) {
    const x = ox + (k % cols) * lado, y = oy + Math.floor(k / cols) * lado;
    caras.push(s("rect", { x: x + 2, y: y + 2, width: lado - 4, height: lado - 4, rx: lado * 0.18, class: k === 9 ? "f-ac" : "f-soft s-line" }, g));
  }
  const pie = T(g, ancho ? zona.x : m, oy + filas * lado + 18, "En promedio, la red duda como si eligiera entre unas 26 opciones igual de probables", { class: "r" });
  const pie2 = T(g, ancho ? zona.x : m, oy + filas * lado + 34, "4.71 bits por token · 1.536 bits por carácter", { class: "r m" });
  if (ancho) { pie.textContent = "≈ 26 opciones igual de probables"; pie2.textContent = "4.71 bits por token"; }
  return t => {
    const u = tramo(t, 0.08, 0.45), v = mezcla(8.24, 1.536, u);
    bar.setAttribute("width", v * esc);
    val.setAttribute("x", x0 + v * esc + 6); val.setAttribute("y", y2 + 13); val.textContent = v.toFixed(u >= 1 ? 3 : 2);
    caras.forEach((c, k) => c.setAttribute("opacity", tramo(t, 0.5 + k * 0.012, 0.56 + k * 0.012)));
    pie.setAttribute("opacity", tramo(t, 0.86, 0.96)); pie2.setAttribute("opacity", tramo(t, 0.9, 1));
  };
}

// 11.2 · Límites de la comparación: de escala lineal a logarítmica, los pesos de la red aparecen.
function limites(g, W, H) {
  const m = 22, alto = Math.min(H - 16, 380), y0 = (H - alto) / 2;
  const x0 = m + 4, x1 = W - m - 4;
  const lin = v => x0 + (x1 - x0) * Math.min(v, 700) / 700;
  const lg = v => x0 + (x1 - x0) * (Math.log10(v) - 2) / 8;
  T(g, m, y0 + 12, "Tamaños en bytes: ℓ_total = ℓ(x | Q) + ℓ(Q)", { class: "rotulo" });
  const filas = [["la red: el poema", 173, 173, "f-ac", "173 B"], ["compresores comunes", 535, 597, "f-mu", "535–597 B"], ["pesos de la red (bfloat16)", 3.1e9, 3.1e9, "f-line", "3.1 GB"], ["pesos en float32", 6.2e9, 6.2e9, "f-line", "6.2 GB"]];
  const yF = j => y0 + 44 + j * Math.max(30, Math.min(52, (alto - 120) / 4));
  const objs = filas.map(([nom, a, b, cls, txt], j) => {
    const y = yF(j);
    const gg = s("g", {}, g);
    T(gg, x0, y - 5, nom, { class: "r" });
    const r = s("rect", { x: x0, y, height: 12, rx: 2, class: cls }, gg);
    const rb = a !== b ? s("rect", { y, height: 12, class: "f-mu", "fill-opacity": 0.35 }, gg) : null;
    const v = T(gg, 0, y + 10.5, txt, { class: "m", style: "font-size:11.5px" });
    return { gg, r, rb, v, a, b, j };
  });
  const yEje = yF(4) + 4;
  s("line", { x1: x0, y1: yEje, x2: x1, y2: yEje, class: "s-mu" }, g);
  const tLin = [0, 100, 200, 300, 400, 500, 600, 700].map(v => T(g, lin(v), yEje + 15, v, { class: "r m", "text-anchor": "middle" }));
  const tLog = [["100 B", 1e2], ["10 kB", 1e4], ["1 MB", 1e6], ["100 MB", 1e8], ["10 GB", 1e10]].map(([n, v]) => T(g, lg(v), yEje + 15, n, { class: "r m", "text-anchor": v === 1e10 ? "end" : "middle" }));
  const esc = T(g, x1, yEje + 32, "", { class: "r", "text-anchor": "end" });
  const nota = T(g, x0, yEje + 50, "La red ya está en ambos lados: sus pesos no viajan.", { class: "r" });
  return t => {
    const u = tramo(t, 0.35, 0.7); // 0 lineal, 1 logarítmica
    const X = v => u >= 1 ? lg(v) : v > 700 ? mezcla(x1 + 40, lg(v), u) : mezcla(lin(v), lg(v), u);
    objs.forEach(({ gg, r, rb, v, a, b, j }) => {
      const xa = X(a), xb = X(b);
      r.setAttribute("width", Math.max(1, Math.min(x1, xa) - x0));
      if (rb) { rb.setAttribute("x", Math.min(x1, xa)); rb.setAttribute("width", Math.max(1, xb - xa)); }
      const xr = Math.min(x1, xb);
      v.setAttribute("x", xr + 6 > x1 - 50 ? xr - 6 : xr + 6);
      v.setAttribute("text-anchor", xr + 6 > x1 - 50 ? "end" : "start");
      if (xr + 6 > x1 - 50) v.setAttribute("y", yF(j) - 5); else v.setAttribute("y", yF(j) + 10.5);
      gg.setAttribute("opacity", j < 2 ? tramo(t, 0.02 + j * 0.08, 0.12 + j * 0.08) : tramo(t, 0.6 + (j - 2) * 0.1, 0.72 + (j - 2) * 0.1));
    });
    tLin.forEach(n => n.setAttribute("opacity", 1 - tramo(t, 0.35, 0.5)));
    tLog.forEach(n => n.setAttribute("opacity", tramo(t, 0.55, 0.7)));
    esc.textContent = u < 0.5 ? "escala lineal" : "escala logarítmica";
    nota.setAttribute("opacity", tramo(t, 0.88, 1));
  };
}

// 12.1 · Determinismo en coma flotante: cerca de 10^8 los float32 van de 8 en 8.
function flotante(g, W, H) {
  const f = Math.fround;
  const m = 26, alto = Math.min(H - 16, 380), y0 = (H - alto) / 2;
  const x0 = m + 10, x1 = W - m - 10, c = -1e8, X = v => x0 + (x1 - x0) * (v - (c - 20)) / 40;
  T(g, m, y0 + 12, "float32 cerca de −10⁸: un valor cada 8", { class: "rotulo" });
  const yA = y0 + alto * 0.34;
  s("line", { x1: x0, y1: yA, x2: x1, y2: yA, class: "s-mu" }, g);
  for (let v = c - 20; v <= c + 20; v++) s("line", { x1: X(v), y1: yA - 2, x2: X(v), y2: yA + 2, class: "s-line" }, g);
  for (let v = c - 16; v <= c + 16; v += 8) {
    globo(s("circle", { cx: X(v), cy: yA, r: 5, class: "f-mu" }, g), `${v} es un float32`);
    T(g, X(v), yA + 22, (v - c === 0 ? "−10⁸" : `${v - c > 0 ? "+" : "−"}${Math.abs(v - c)}`), { class: "r m", "text-anchor": "middle" });
  }
  const exacto = c + 1, red = f(exacto);
  const punto = s("circle", { r: 5.5, class: "f-ac" }, g);
  const et = T(g, 0, yA - 14, "−10⁸ + 1", { class: "m ac", "text-anchor": "middle", style: "font-size:11.5px" });
  const yB = yA + 66, sep = Math.min(30, (alto - (yB - y0) - 20) / 2);
  const r1 = f(f(f(1e8) - f(1e8)) + 1), r2 = f(f(1e8) + f(-1e8 + 1));
  const l1 = T(g, W / 2, yB, `(10⁸ − 10⁸) + 1 = 0 + 1 = ${r1}`, { class: "m", "text-anchor": "middle" });
  const l2 = T(g, W / 2, yB + sep, `10⁸ + (−10⁸ + 1) = 10⁸ + (${red === -1e8 ? "−10⁸" : red}) = ${r2}`, { class: "m", "text-anchor": "middle" });
  const l3 = T(g, W / 2, yB + 2 * sep + 4, W < 560 ? `${r1} ≠ ${r2}: el orden cambia el resultado` : `${r1} ≠ ${r2}: el orden de la suma cambia el resultado`, { class: "m ac g", "text-anchor": "middle" });
  return t => {
    const u = tramo(t, 0.15, 0.4);
    const x = mezcla(X(exacto), X(red), u);
    punto.setAttribute("cx", x); punto.setAttribute("cy", yA);
    et.setAttribute("x", x);
    l1.setAttribute("opacity", tramo(t, 0.45, 0.55));
    l2.setAttribute("opacity", tramo(t, 0.6, 0.7));
    l3.setAttribute("opacity", tramo(t, 0.8, 0.92));
  };
}

// 12.2 · Un error se propaga: un bit cambiado lleva al decodificador a otros subintervalos.
function propaga(g, W, H) {
  const SIM = ["a", "b", "c", "d"], P = [0.5, 0.25, 0.15, 0.1];
  const acum = [0, 0.5, 0.75, 0.9, 1];
  const BITS = "0110100111000101", FLIP = 4;
  const aNum = b => [...b].reduce((a, c, i) => a + (+c) * 2 ** -(i + 1), 0) + 2 ** -(b.length + 1);
  const bits2 = BITS.slice(0, FLIP) + (BITS[FLIP] === "0" ? "1" : "0") + BITS.slice(FLIP + 1);
  const x = aNum(BITS), x2 = aNum(bits2);
  const PASOS = 7;
  const decod = v => { let lo = 0, w = 1; const out = []; for (let t = 0; t < PASOS; t++) { const z = (v - lo) / w; let k = 0; while (k < 3 && z >= acum[k + 1]) k++; out.push({ lo, w, k }); lo += w * acum[k]; w *= P[k]; } return out; };
  const d1 = decod(x), d2 = decod(x2);
  const m = 20, ancho = W / H > 1.45;
  const alto = Math.min(H - 10, 470), y0 = (H - alto) / 2;
  // Bits arriba.
  const nb = BITS.length, bwid = Math.min(22, (W - 2 * m - 70) / nb);
  const bx = m + 70;
  T(g, m, y0 + 14, "mensaje", { class: "r" });
  const cajas = [...BITS].map((b, i) => { const r = s("rect", { x: bx + i * bwid, y: y0 + 2, width: bwid - 2, height: 17, rx: 2, class: "f-soft" }, g); const tx = T(g, bx + i * bwid + (bwid - 2) / 2, y0 + 15, b, { class: "m", "text-anchor": "middle", style: "font-size:11px" }); return { r, tx }; });
  T(g, bx + nb * bwid + 6, y0 + 15, "…", { class: "r" });
  // Escalera: cada fila es el intervalo del decodificador correcto, ampliado a todo el ancho.
  const xL = m + 30, xR = ancho ? W * 0.68 : W - m - 74;
  const yF0 = y0 + 44, paso = (alto - 88) / PASOS, hb = Math.min(18, paso * 0.6);
  T(g, xL, yF0 - 8, W < 560 ? "intervalo ampliado · probabilidades de ejemplo" : "intervalo del decodificador (ampliado) · probabilidades de ejemplo", { class: "rotulo", style: `font-size:${W < 560 ? 10.5 : 11.5}px` });
  const colA = xR + 22, colB = xR + 48;
  T(g, colA, yF0 - 8, "bien", { class: "r", "text-anchor": "middle" });
  T(g, colB, yF0 - 8, "error", { class: "r", "text-anchor": "middle" });
  const filas = d1.map((st, t) => {
    const y = yF0 + t * paso, gg = s("g", {}, g);
    T(gg, xL - 12, y + hb * 0.75, t + 1, { class: "r m", "text-anchor": "end" });
    acum.slice(0, 4).forEach((a, k) => {
      const xa = mezcla(xL, xR, a), xb = mezcla(xL, xR, acum[k + 1]);
      s("rect", { x: xa + 0.8, y, width: xb - xa - 1.6, height: hb, rx: 2, class: k === st.k ? "f-line" : "f-soft" }, gg);
      if (xb - xa > 18) T(gg, (xa + xb) / 2, y + hb * 0.72, SIM[k], { class: "r m", "text-anchor": "middle", style: "font-size:10px" });
    });
    const z = v => (v - st.lo) / st.w;
    const zb = z(x2), fuera = zb < 0 || zb >= 1;
    const pa = s("circle", { cx: mezcla(xL, xR, z(x)), cy: y + hb / 2, r: 4.5, class: "f-ink" }, gg);
    const pb = fuera
      ? T(gg, zb < 0 ? xL - 1 : xR + 1, y + hb * 0.8, zb < 0 ? "◂" : "▸", { class: "ac", "text-anchor": zb < 0 ? "end" : "start", style: "font-size:13px" })
      : s("circle", { cx: mezcla(xL, xR, zb), cy: y + hb / 2, r: 4.5, class: "f-bg s-ac", "stroke-width": 2 }, gg);
    const igual = d2[t].k === st.k;
    T(gg, colA, y + hb * 0.75, SIM[st.k], { class: "m", "text-anchor": "middle", "font-weight": 600 });
    T(gg, colB, y + hb * 0.75, SIM[d2[t].k], { class: "m" + (igual ? "" : " ac"), "text-anchor": "middle", "font-weight": 600 });
    return gg;
  });
  const div = d2.findIndex((s2, t) => s2.k !== d1[t].k);
  const ley = T(g, m, y0 + alto - 20, "● con el mensaje correcto   ○ con el bit cambiado   ◂ ▸ fuera del intervalo", { class: "r", style: `font-size:${W < 560 ? 10.5 : 11.5}px` });
  const nota = T(g, m, y0 + alto - 2, div >= 0 ? `desde el símbolo ${div + 1} todo difiere: el error no se corrige solo` : "", { class: "r" });
  // Leyenda de puntos.
  return t => {
    const fl = tramo(t, 0.05, 0.12);
    cajas[FLIP].r.setAttribute("class", fl > 0.5 ? "f-ac" : "f-soft");
    cajas[FLIP].tx.textContent = fl > 0.5 ? bits2[FLIP] : BITS[FLIP];
    cajas[FLIP].tx.setAttribute("style", `font-size:11px;fill:${fl > 0.5 ? "var(--bg)" : "var(--ink)"}`);
    filas.forEach((f, j) => f.setAttribute("opacity", tramo(t, 0.15 + j * 0.1, 0.22 + j * 0.1)));
    nota.setAttribute("opacity", tramo(t, 0.88, 1));
    ley.setAttribute("opacity", tramo(t, 0.15, 0.25));
  };
}

const ESCENAS = {
  "1-1": [kraft, 3200, "Árbol binario de un código sin prefijos y la suma de Kraft"],
  "2-1": [tokens, 3000, "Bytes UTF-8 agrupados en tokens y unidos de nuevo"],
  "4-1": [bloque, 3600, "Un bloque del Transformer con normalización previa y conexiones residuales"],
  "4-2": [conteo, 3200, "Parámetros de Qwen2.5-1.5B, con área proporcional"],
  "5-1": [gqa, 3400, "Cabezas de consulta agrupadas y máscara causal"],
  "5-2": [rope, 3600, "Vectores q y k girando con su posición"],
  "8-1": [cadena, 3400, "Suma de la información de los ocho primeros tokens"],
  "9-1": [cota, 3000, "Intervalos diádicos dentro del intervalo del texto"],
  "9-2": [enteros, 3000, "Escala logarítmica de los enteros del codificador"],
  "10-1": [cuantizar, 3000, "Costo tras cuantizar las probabilidades"],
  "11-1": [perplejidad, 3000, "Bits por carácter y perplejidad"],
  "11-2": [limites, 3600, "Tamaño del mensaje frente al tamaño de la red"],
  "12-1": [flotante, 3000, "Suma no asociativa en float32"],
  "12-2": [propaga, 3600, "Un bit cambiado se propaga en la decodificación"],
};

let limpiar = () => {};
export function capaCompresion(i, k, titulo, vista) {
  limpiar(); limpiar = () => {};
  if (!k || !vista) return;
  const e = ESCENAS[`${i + 1}-${k}`];
  if (!e) return;
  limpiar = montarCapa(vista, e[0], { ms: e[1], acento: "var(--net)", etiqueta: e[2] });
}
