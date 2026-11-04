// Animaciones propias de las capas de detalle (↓) de la etapa «Clave».
// Uso: capasClave(vista, i, k, { caso, eps }) desde alNivel; con vista = null limpia la animación anterior.
// Cada animación se arma con el tamaño real de la vista (se rehace al cambiar de tamaño) y termina quieta.
import { animar, alCambiarTema, color } from "./guia.js";

const M = window.Modelo;
const NS = "http://www.w3.org/2000/svg";
const S = (tag, a = {}, p) => { const n = document.createElementNS(NS, tag); for (const k in a) if (a[k] != null) n.setAttribute(k, a[k]); p?.append(n); return n; };
const T = (p, x, y, s, cls = "", anc = "start", base = "middle") => { const n = S("text", { x, y, class: "ca-t " + cls, "text-anchor": anc, "dominant-baseline": base }, p); n.textContent = s; return n; };
const tit = (n, s) => { S("title", {}, n).textContent = s; return n; };
const fase = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const svgDe = (caja, W, H) => S("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img" }, caja);
const azar = semilla => () => ((semilla = (semilla * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const permutar = (n, sem) => { const a = [...Array(n).keys()], r = azar(sem); for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const miles = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// ---------- Marco común: contenedor, botón ↻, tamaño, tema y limpieza ----------
let estilosListos = false;
function estilos() {
  if (estilosListos) return; estilosListos = true;
  document.head.append(Object.assign(document.createElement("style"), { textContent: `
.ca-caja{position:absolute;inset:0}
.ca-caja>svg,.ca-caja>canvas{position:absolute;inset:0;width:100%;height:100%}
.ca-t{font-family:var(--f-body);font-size:var(--ca-fs,12px);fill:var(--muted)}
.ca-t.m{font-family:var(--f-mono);font-size:calc(var(--ca-fs,12px)*.92)}
.ca-t.k{fill:var(--ink)} .ca-t.a{fill:var(--ca-acc)} .ca-t.b{font-weight:600}
.ca-t.g{font-family:var(--f-display);font-weight:700;font-size:calc(var(--ca-fs,12px)*1.45)}
.ca-ln{stroke:var(--line);fill:none} .ca-mu{stroke:var(--muted);fill:none} .ca-ac{stroke:var(--ca-acc);fill:none} .ca-in{stroke:var(--ink);fill:none}
.ca-fa{fill:var(--ca-acc)} .ca-fl{fill:var(--line)} .ca-fm{fill:var(--muted)} .ca-fs{fill:var(--soft)} .ca-fi{fill:var(--ink)} .ca-fb{fill:var(--bg)}
.vista-capa .repetir.ca-rep{width:2rem;height:2rem;padding:0;border-radius:50%;background:transparent;color:var(--muted);border:1px solid var(--line);font-size:1rem;line-height:1}
.vista-capa .repetir.ca-rep:hover{color:var(--ink);border-color:var(--ink)}
.vista-capa .ca-ilus{position:absolute;right:12px;top:8px;z-index:3;margin:0}
.vista-capa.ca-baja .ca-ilus{top:1px;right:6px;font-size:.68rem}
.vista-capa.ca-baja .repetir.ca-rep{left:2px;bottom:2px;width:1.6rem;height:1.6rem;font-size:.85rem}
` }));
}
let actual = null, enTema = null;
alCambiarTema(() => enTema?.());
export function montar(vista, spec, acento) {
  actual?.(); actual = null; enTema = null;
  if (!vista || !spec) return;
  estilos();
  const caja = Object.assign(document.createElement("div"), { className: "ca-caja" });
  caja.style.setProperty("--ca-acc", `var(--${acento})`);
  vista.append(caja);
  // vista baja (teléfono): margen izquierdo para el botón ↻ y franja arriba para el rótulo
  if (vista.clientHeight < 260) { caja.style.left = "30px"; if (spec.ilustrativo) caja.style.top = "16px"; vista.classList.add("ca-baja"); } else vista.classList.remove("ca-baja");
  if (spec.ilustrativo) vista.append(Object.assign(document.createElement("p"), { className: "rotulo ca-ilus", textContent: spec.ilustrativo }));
  const rep = Object.assign(document.createElement("button"), { type: "button", className: "repetir ca-rep", textContent: "↻", title: "Repetir la animación" });
  rep.setAttribute("aria-label", "Repetir la animación");
  vista.append(rep);
  let prog = 0, upd = null, cancel = () => {}, W = 0, H = 0;
  const construir = () => {
    const w = caja.clientWidth, h = caja.clientHeight;
    if (!w || !h) return;
    W = w; H = h; caja.replaceChildren();
    const fs = Math.max(10, Math.min(14, Math.min(w / 40, h / 15)));
    caja.style.setProperty("--ca-fs", fs + "px");
    try { upd = spec.build(caja, { W: w, H: h, fs, chico: h < 240 || w < 300 }); upd?.(prog); } catch (e) { console.error(e); upd = null; }
  };
  const correr = () => { cancel(); prog = 0; construir(); cancel = animar(spec.ms || 2800, t => { prog = t; upd?.(t); }, () => { prog = 1; upd?.(1); }); };
  rep.addEventListener("click", correr);
  const ro = new ResizeObserver(() => { if (caja.clientWidth !== W || caja.clientHeight !== H) construir(); });
  ro.observe(caja);
  enTema = () => { if (spec.canvas) construir(); };
  correr();
  actual = () => { cancel(); ro.disconnect(); };
}
export const lienzo2d = (caja, W, H) => {
  const cv = document.createElement("canvas"), dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); caja.append(cv);
  const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); return g;
};
export { S, T, tit, fase, svgDe, azar, permutar, miles, color };

// ---------- Datos fijos del caso ----------
const C = M.CASO;
const bitsF64 = x => { const v = new DataView(new ArrayBuffer(8)); v.setFloat64(0, x); const o = []; for (let i = 0; i < 8; i++) for (let t = 7; t >= 0; t--) o.push((v.getUint8(i) >> t) & 1); return o; };
// Esquema anterior (valores de ejemplo): N pequeño y desplazamiento m
const EJ = { N: 8, m: 3, L: 10 };
const viejo = (() => { const s = [C.x0]; for (let i = 1; i <= EJ.N + EJ.L + 2; i++) s.push(M.logistic(s[i - 1], C.r)); return s; })();
const dK = await M.derivar(C.x0, C.r, EJ.N), dK2 = await M.derivar(viejo[EJ.m], C.r, EJ.N - EJ.m);
const nuevoK = M.secuencia(dK.x1, dK.r1, EJ.N, EJ.L), nuevoK2 = M.secuencia(dK2.x1, dK2.r1, EJ.N - EJ.m, EJ.L);

// Fila de bits en celdas (helper de varias capas)
function celdas(p, bits, x0, y, cw, { gap = () => 0, cls = () => null } = {}) {
  return bits.map((b, i) => {
    const x = x0 + i * cw + gap(i), r = S("rect", { x: x + cw * 0.08, y, width: cw * 0.84, height: cw * 0.84, rx: Math.min(2, cw * 0.15) }, p);
    r.dataset.b = b; r.setAttribute("class", cls(i, b) || (b ? "ca-fm" : "ca-fb ca-ln")); return r;
  });
}

// ---------- Las capas ----------
const CAPAS = {
  // Paso 1 · conteo exacto: el producto de los tres conteos es la suma de sus exponentes
  "0-1": () => ({ ms: 3200, build(caja, { W, H, fs, chico }) {
    const svg = svgDe(caja, W, H);
    const l = Math.max(fs * 2.2, W * 0.07), A = W - l - Math.max(fs * 2.2, W * 0.07), X = e => l + A * e / 120;
    const comp = [["x0", 55.32, "x0 ∈ [0.001, 0.999]: 44 918 902 683 393 328 float64"], ["r", 44.36, "r ∈ [3.99, 4): 22 517 998 136 852 float64"], ["N", 13.27, "N ∈ [100, 10 000]: 9901 enteros"]];
    const bh = chico ? Math.max(12, H * 0.13) : Math.min(30, Math.max(14, H * 0.05));
    const ySum = chico ? H * 0.42 : H * 0.62, yFil = [0.14, 0.25, 0.36].map(f => H * f);
    const clase = ["ca-fi", "ca-fm", "ca-fl"], opa = [0.55, 0.75, 1];
    // eje del exponente
    const yEje = ySum + bh / 2 + fs * 1.1;
    S("line", { x1: X(0), x2: X(120), y1: yEje, y2: yEje, class: "ca-ln" }, svg);
    for (const e of [0, 40, 80, 120]) if (e !== 80 || A > 300) T(svg, X(e), yEje + fs * 0.9, String(e), "m", "middle");
    if (!chico) T(svg, X(60), yEje + fs * 2.3, "exponente de 2 (escala lineal)", "", "middle");
    const min = S("line", { x1: X(100), x2: X(100), y1: ySum - bh / 2, y2: yEje + fs * 0.3, class: "ca-mu", "stroke-dasharray": "4 3" }, svg);
    const tMin = T(svg, X(100), yEje + fs * 0.9, "mín. 2^100", "m", "middle");
    if (!chico) comp.forEach(([n, e], k) => { const g = S("g", { class: "ca-fantasma" }, svg); S("rect", { x: l, y: yFil[k] - bh / 2, width: X(e) - l, height: bh, rx: 3, class: clase[k], opacity: 0.3 }, g); T(g, X(e) + 6, yFil[k], `${n} · 2^${e}`, "m", "start"); });
    const fantasmas = [...svg.querySelectorAll(".ca-fantasma")];
    const barras = comp.map(([n, e, txt], k) => {
      const g = S("g", {}, svg), r = S("rect", { y: 0, height: bh, rx: 3, class: clase[k], opacity: opa[k] }, g);
      tit(r, txt + ` ≈ 2^${e}`);
      const tt = T(g, 0, -fs * 0.75, e < 20 && A < 560 ? n : `${n} · 2^${e}`, "m k", "middle");
      return { g, r, tt, e, inicio: comp.slice(0, k).reduce((s, c) => s + c[1], 0) };
    });
    const llave = S("path", { class: "ca-ac", "stroke-width": 1.6 }, svg);
    const tTot = T(svg, 0, 0, "", "a b", "middle");
    const tFin = T(svg, X(56), chico ? H * 0.12 : yEje + fs * 4.4, "2^112.95 × 97.67 % de claves válidas = 2^112.91", "a b", "middle");
    const marca = S("line", { class: "ca-ac", "stroke-width": 2 }, svg);
    return t => {
      const a = chico ? 1 : fase(t, 0.42, 0.72);
      barras.forEach((b, k) => {
        const crece = chico ? fase(t, k * 0.18, k * 0.18 + 0.3) : fase(t, k * 0.12, k * 0.12 + 0.3);
        const x = l + (X(b.inicio) - l) * a, y = (chico ? ySum : yFil[k] + (ySum - yFil[k]) * a) - bh / 2, w = (X(b.e) - l) * crece;
        b.g.setAttribute("transform", `translate(${x},${y})`);
        b.r.setAttribute("width", Math.max(0, w));
        b.tt.setAttribute("x", w / 2); b.tt.style.opacity = crece > 0.6 ? 1 : 0;
      });
      const f = fase(t, chico ? 0.6 : 0.74, chico ? 0.85 : 0.9), xe = X(112.95);
      llave.setAttribute("d", `M${l},${ySum - bh / 2 - fs * 1.7} v${-fs * 0.5} H${xe} v${fs * 0.5}`);
      llave.style.opacity = f;
      tTot.setAttribute("x", (l + xe) / 2); tTot.setAttribute("y", ySum - bh / 2 - fs * 2.9); tTot.textContent = "producto = 2^(55.32 + 44.36 + 13.27) = 2^112.95"; tTot.style.opacity = f;
      if (chico) tTot.style.opacity = 0;
      fantasmas.forEach(g => (g.style.opacity = fase(t, 0.45, 0.7)));
      const g2 = fase(t, 0.88, 1);
      marca.setAttribute("x1", X(112.91)); marca.setAttribute("x2", X(112.91)); marca.setAttribute("y1", ySum - bh * 0.8); marca.setAttribute("y2", ySum + bh * 0.8);
      marca.style.opacity = g2; tFin.style.opacity = g2;
      min.style.opacity = tMin.style.opacity = fase(t, 0.6, 0.8);
    };
  } }),

  // Paso 2 · binary64: campos de x0 y r, y la ulp que crece por rangos
  "1-1": ({ caso }) => ({ ms: 3400, build(caja, { W, H, fs, chico }) {
    const svg = svgDe(caja, W, H), m = Math.max(10, W * 0.05);
    const filas = [["x0 = 0.123456", bitsF64(C.x0), "e − 1023 = −4 → ulp = 2^−56"], ["r = 3.999952", bitsF64(C.r), "e − 1023 = 1 → ulp = 2^−51"]];
    const cw = Math.min(16, (W - 2 * m) / 65.5), sep = cw * 0.75, gap = i => (i >= 1 ? sep : 0) + (i >= 12 ? sep : 0);
    const x0 = (W - (64 * cw + 2 * sep)) / 2;
    const usar = chico ? filas.slice(0, 1) : filas;
    const yF = chico ? [H * 0.3] : [H * 0.1, H * 0.31];
    const grupos = usar.map(([nom, bits, ulp], f) => {
      const y = yF[f];
      T(svg, x0, y - fs * 0.9, nom, "m k");
      const cs = celdas(svg, bits, x0, y, cw);
      cs.forEach((c, i) => tit(c, `${nom.split(" ")[0]} · bit ${i + 1} de 64 = ${bits[i]} · ${i === 0 ? "signo" : i < 12 ? `exponente, bit ${i} de 11` : `fracción, bit ${i - 11} de 52`}`));
      const yl = y + cw + fs * 0.9;
      const rot = [[x0 + cw / 2, cw < 10 ? "" : "s"], [x0 + sep + 6.5 * cw, "exponente · 11"], [x0 + 2 * sep + 38 * cw, "fracción · 52"]].map(([x, s]) => T(svg, x, yl, s, "", "middle"));
      const res = T(svg, x0 + 64 * cw + 2 * sep, y - fs * 0.9, ulp, "m a", "end");
      return { cs, rot, res, bits };
    });
    // ulp(x) en [0.001, 0.999]: escalones por potencia de 2
    let curva = null, punto = null, tP = null, ejes = [];
    if (!chico) {
      const l = m + fs * 3.2, top = H * 0.53, bot = H - fs * 2.6, r = W - m - fs, X = x => l + (r - l) * x, Y = e => top + (bot - top) * (e - -52.5) / (-62.5 - -52.5);
      ejes.push(S("line", { x1: l, x2: r, y1: bot, y2: bot, class: "ca-ln" }, svg), S("line", { x1: l, x2: l, y1: top, y2: bot, class: "ca-ln" }, svg));
      for (const e of [-53, -56, -62]) ejes.push(T(svg, l - 6, Y(e), `2^${e}`, "m", "end"));
      for (const x of [0, 0.5, 1]) ejes.push(T(svg, X(x), bot + fs * 0.9, String(x), "m", "middle"));
      ejes.push(T(svg, X(0.5), top - fs * 0.9, "ulp(x) para x ∈ [0.001, 0.999]: más valores cerca de 0", "", "middle"));
      let d = "";
      for (let e = -10; e <= -1; e++) { const a = Math.max(0.001, 2 ** e), b = Math.min(0.999, 2 ** (e + 1)); d += `${d ? "L" : "M"}${X(a)},${Y(e - 52)} L${X(b)},${Y(e - 52)} `; }
      curva = S("path", { d, class: "ca-in", "stroke-width": 1.6 }, svg);
      const len = 4 * (r - l); curva.style.strokeDasharray = len; curva.dataset.len = len;
      punto = S("circle", { cx: X(C.x0), cy: Y(-56), r: 4.5, class: "ca-fa" }, svg); tit(punto, "x0 = 0.123456 ∈ [1/16, 1/8): ulp = 2^−56 ≈ 1.39·10⁻¹⁷");
      tP = T(svg, X(C.x0) + 8, Y(-56) - fs, "x0: 2^−56", "m a");
    }
    return t => {
      grupos.forEach((g, f) => {
        const a = fase(t, f * 0.18, f * 0.18 + 0.32), dest = fase(t, 0.42, 0.56);
        g.cs.forEach((c, i) => {
          c.style.opacity = i / 64 < a ? 1 : 0;
          const campo = i < 12 && dest > 0, b = +c.dataset.b;
          c.setAttribute("class", campo ? (b ? "ca-fa" : "ca-fb ca-ac") : b ? "ca-fm" : "ca-fb ca-ln");
        });
        g.rot.forEach(r => (r.style.opacity = dest));
        g.res.style.opacity = fase(t, 0.5 + f * 0.06, 0.62 + f * 0.06);
      });
      if (curva) {
        const c = fase(t, 0.6, 0.95);
        curva.style.strokeDashoffset = (1 - c) * curva.dataset.len;
        ejes.forEach(e => (e.style.opacity = fase(t, 0.55, 0.65)));
        punto.style.opacity = tP.style.opacity = fase(t, 0.9, 1);
      }
    };
  } }),

  // Paso 3 · oráculo aleatorio: 8 bloques uniformes y el costo de los ataques genéricos
  "2-1": ({ caso }) => ({ ms: 3400, build(caja, { W, H, fs, chico }) {
    const svg = svgDe(caja, W, H), m = Math.max(10, W * 0.05);
    let cs = [], orden = null, rotH = [];
    if (!chico) {
      const lab = fs * 2.2, cw = Math.min(11, (W - 2 * m - lab) / 64, (H * 0.36) / 8), x0 = (W - 64 * cw + lab) / 2, y0 = H * 0.08;
      for (let j = 0; j < 8; j++) {
        rotH.push(T(svg, x0 - 6, y0 + j * cw * 1.25 + cw * 0.42, "h" + (j + 1), "m", "end"));
        const fila = celdas(svg, Array.from(caso.hb.slice(64 * j, 64 * j + 64)), x0, y0 + j * cw * 1.25, cw);
        fila.forEach((c, i) => tit(c, `h${j + 1} · bit ${i + 1} de 64 = ${c.dataset.b}`));
        cs.push(...fila);
      }
      orden = permutar(512, 7); const pos = new Uint16Array(512); orden.forEach((n, k) => (pos[n] = k)); orden = pos;
      T(svg, W / 2, y0 + 8 * cw * 1.25 + fs * 0.6, "SHA-512(K): 8 bloques de 64 bits, uniformes e independientes si H es un oráculo aleatorio", "", "middle", "hanging");
    }
    const filas = [["claves válidas: a lo sumo 2^112.91 salidas", 112.91, "ca-fa"], ["colisión genérica: 2^256", 256, "ca-fm"], ["preimagen genérica: 2^512", 512, "ca-fm"]];
    const l = m, A = W - 2 * m, X = e => l + A * e / 512;
    const top = chico ? H * 0.12 : H * 0.48, paso = chico ? (H * 0.62) / 3 : Math.min(42, H * 0.1), bh = Math.min(14, paso * 0.38);
    const barras = filas.map(([s, e, cl], k) => {
      const y = top + k * paso, tt = T(svg, l, y, s, cl === "ca-fa" ? "a b" : "k");
      const r = S("rect", { x: l, y: y + fs * 0.7, height: bh, rx: 3, class: cl, opacity: cl === "ca-fa" ? 1 : 0.55 }, svg); tit(r, s);
      return { r, tt, e };
    });
    const yE = top + 2 * paso + fs * 0.7 + bh + fs * 0.9;
    for (const e of [0, 128, 256, 384, 512]) T(svg, X(e), yE, String(e), "m", "middle");
    if (!chico) T(svg, W / 2, yE + fs * 1.3, "exponente de 2", "", "middle");
    return t => {
      if (orden) { const a = fase(t, 0, 0.45) * 512; cs.forEach((c, n) => (c.style.opacity = orden[n] < a ? 1 : 0)); }
      barras.forEach((b, k) => { const f = fase(t, (chico ? 0.1 : 0.45) + k * 0.13, (chico ? 0.35 : 0.65) + k * 0.13); b.r.setAttribute("width", Math.max(0, X(b.e) - l) * f); b.tt.style.opacity = f > 0 ? 1 : 0; });
    };
  } }),

  // Paso 6 · ≫ 11 y división por 2^53: rejilla uniforme
  "5-1": ({ caso }) => ({ ms: 3600, build(caja, { W, H, fs, chico }) {
    const svg = svgDe(caja, W, H), m = Math.max(10, W * 0.05);
    const bits = Array.from(caso.hb.slice(0, 64)), u1 = caso.d.u[0];
    const cw = Math.min(15, (W - 2 * m) / 64), x0 = (W - 64 * cw) / 2, y = chico ? H * 0.18 : H * 0.14;
    T(svg, x0, y - fs * 0.9, "H₁ (64 bits del bloque h1)", "k");
    const cs = celdas(svg, bits, x0, y, cw); cs.forEach((c, i) => tit(c, `h1 · bit ${i + 1} de 64 = ${bits[i]}${i >= 53 ? " · se descarta" : ""}`));
    const ceros = [...Array(11)].map((_, i) => S("rect", { x: x0 + i * cw + cw * 0.08, y, width: cw * 0.84, height: cw * 0.84, rx: 2, class: "ca-fb ca-ac", "stroke-dasharray": "2 2" }, svg));
    const tShift = T(svg, x0 + 64 * cw, y - fs * 0.9, "≫ 11: quedan 53 bits", "a b", "end");
    // recta [0, 1)
    const yR = chico ? H * 0.7 : H * 0.48, l = m + 6, r = W - m - 6, X = v => l + (r - l) * v;
    const recta = S("g", {}, svg);
    S("line", { x1: l, x2: r, y1: yR, y2: yR, class: "ca-mu" }, recta);
    T(recta, l, yR + fs * 1.1, "0", "m", "middle"); T(recta, r, yR + fs * 1.1, "1 (nunca)", "m", "end");
    S("circle", { cx: l, cy: yR, r: 3.5, class: "ca-fi" }, recta); S("circle", { cx: r, cy: yR, r: 3.5, class: "ca-fb ca-in" }, recta);
    const mk = S("path", { class: "ca-fa" }, svg), tU = T(svg, 0, yR - fs * 1.6, `u₁ = ${u1.toFixed(10)}`, "m a b", "middle");
    tit(mk, `u₁ = (H₁ ≫ 11) / 2^53 = ${u1}`);
    // detalle de la rejilla: 2^11 preimágenes por punto
    let zoom = null;
    if (!chico) {
      zoom = S("g", {}, svg);
      const zc = W / 2, zy = H * 0.8, zw = Math.min(W - 2 * m, 460), paso = zw / 8;
      S("line", { x1: zc - zw / 2, x2: zc + zw / 2, y1: zy, y2: zy, class: "ca-mu" }, zoom);
      for (let k = -4; k <= 4; k++) S("line", { x1: zc + k * paso, x2: zc + k * paso, y1: zy - 5, y2: zy + 5, class: k ? "ca-mu" : "ca-ac", "stroke-width": k ? 1 : 2 }, zoom);
      for (let k = 0; k < 17; k++) S("line", { x1: zc + (k - 8) * paso * 0.11, y1: zy - H * 0.11, x2: zc, y2: zy - 6, class: "ca-ac", opacity: 0.45 }, zoom);
      T(zoom, zc, zy - H * 0.11 - fs * 0.8, "2^11 = 2048 valores de H₁ caen en cada punto", "", "middle");
      T(zoom, zc + paso * 0.5, zy + fs * 1.3, "paso 2^−53", "m", "middle");
      T(zoom, zc - zw / 2, zy + fs * 1.3, "detalle de la rejilla", "", "start");
      S("path", { d: `M${X(u1)},${yR + 6} L${zc - zw / 2},${zy - H * 0.13} M${X(u1)},${yR + 6} L${zc + zw / 2},${zy - H * 0.13}`, class: "ca-ln", "stroke-dasharray": "3 3" }, zoom);
    }
    return t => {
      const ap = fase(t, 0, 0.22), sh = fase(t, 0.25, 0.5);
      cs.forEach((c, i) => {
        const vis = i / 64 < ap;
        if (i >= 53) { c.setAttribute("transform", `translate(0,${sh * cw * 2.2})`); c.style.opacity = vis ? 1 - sh : 0; }
        else { c.setAttribute("transform", `translate(${sh * 11 * cw},0)`); c.style.opacity = vis ? 1 : 0; }
      });
      ceros.forEach(c => (c.style.opacity = fase(t, 0.45, 0.52)));
      tShift.style.opacity = fase(t, 0.3, 0.42);
      const rv = fase(t, 0.5, 0.58), mv = fase(t, 0.55, 0.8), x = X(u1 * mv);
      recta.style.opacity = rv; mk.style.opacity = rv;
      mk.setAttribute("d", `M${x},${yR - 3} l-5,-9 h10 z`);
      tU.setAttribute("x", Math.min(r - 70, Math.max(l + 70, x))); tU.style.opacity = fase(t, 0.75, 0.82);
      if (zoom) zoom.style.opacity = fase(t, 0.82, 1);
    };
  } }),

  // Paso 7 · redondeo al escalar: cuántos u₂ consecutivos caen en cada float64 r(1)
  "6-1": ({ caso }) => {
    const k0 = Math.round(caso.d.u[1] * 2 ** 53), r1 = caso.d.r1, grupos = [];
    let prev = null, n = 0;
    for (let k = k0 - 400 * 18; k <= k0 + 400 * 18; k++) { const r = 3.99 + 0.01 * (k / 2 ** 53); if (r !== prev) { if (prev !== null) grupos.push([prev, n]); prev = r; n = 0; } n++; }
    grupos.shift(); // el primero y el último están cortados
    return { ms: 3000, build(caja, { W, H, fs, chico }) {
      const svg = svgDe(caja, W, H), m = Math.max(10, W * 0.05);
      const l = m + fs * 2.6, r = W - m, top = chico ? H * 0.2 : H * 0.2, bot = chico ? H - fs * 1.6 : H * 0.78;
      const lo = 396, hi = 403, Y = c => bot - (bot - top) * (c - lo) / (hi - lo), bw = (r - l) / grupos.length;
      T(svg, l, top - fs * (chico ? 0.9 : 2.2), "valores consecutivos de u₂ que dan cada r(1) = fl(3.99 + 0.01·u₂)", "k");
      if (!chico) T(svg, l, top - fs * 0.9, "eje recortado: de 396 a 403", "");
      for (const c of [399, 400, 401]) { S("line", { x1: l, x2: r, y1: Y(c), y2: Y(c), class: "ca-ln", "stroke-dasharray": c === 400 ? null : "3 3" }, svg); T(svg, l - 6, Y(c), String(c), "m", "end"); }
      const bars = grupos.map(([rv, c], i) => {
        const es = rv === r1, b = S("rect", { x: l + i * bw + bw * 0.12, width: bw * 0.76, class: es ? "ca-fa" : "ca-fm", opacity: es ? 1 : 0.6 }, svg);
        tit(b, `r = ${rv.toPrecision(17)}: ${c} valores de u₂${es ? " · es r(1) del caso" : ""}`);
        return { b, c, es };
      });
      const i1 = bars.findIndex(b => b.es);
      const tR = i1 >= 0 ? T(svg, l + (i1 + 0.5) * bw, Y(bars[i1].c) - fs * 0.9, "r(1)", "a b", "middle") : null;
      if (!chico) {
        T(svg, (l + r) / 2, bot + fs * 1.1, `${grupos.length} valores consecutivos de r(1), separados por 2^−51 ≈ 4.44·10⁻¹⁶`, "", "middle");
        T(svg, (l + r) / 2, bot + fs * 2.6, "cada r recibe 399, 400 o 401: falta de uniformidad ≤ 1/400", "a", "middle");
      }
      return t => {
        bars.forEach((o, i) => { const f = fase(t, (i / bars.length) * 0.7, (i / bars.length) * 0.7 + 0.3); const y = Y(lo + (o.c - lo) * f); o.b.setAttribute("y", y); o.b.setAttribute("height", Math.max(0, bot - y)); });
        if (tR) tR.style.opacity = fase(t, 0.85, 1);
      };
    } };
  },

  // Paso 7 · colisiones: palomar con una secuencia, casi ninguna coincidencia con las dos
  "6-2": () => ({ ms: 3400, ilustrativo: "ilustrativo", build(caja, { W, H, fs, chico }) {
    const svg = svgDe(caja, W, H), m = Math.max(12, W * 0.05);
    const lado = W > H * 1.05, pw = lado ? (W - 3 * m) / 2 : W - 2 * m, ph = lado ? H - 2 * m - fs * 4 : (H - 3 * m - fs * 6) / 2;
    const P1 = { x: m, y: m + fs * 2.6 }, P2 = lado ? { x: 2 * m + pw, y: P1.y } : { x: m, y: P1.y + ph + m + fs * 3 };
    const r = azar(11), dots = 49;
    // panel 1: 10 cajas, 49 claves
    const nb = 10, cols = 5, bw = pw / cols, bh = Math.min(ph / 2, bw * 1.1), asig = [...Array(dots)].map((_, i) => (i < nb ? i : Math.floor(r() * nb)));
    T(svg, P1.x, P1.y - fs * 1.6, "solo la secuencia 1", "k b");
    T(svg, P1.x, P1.y - fs * 0.5, chico ? "≈ 5 claves por par" : "2^99.64 claves, 2^97.36 pares (x(1), r(1)): ≈ 5 por par", "");
    const cajas1 = [...Array(nb)].map((_, b) => { const x = P1.x + (b % cols) * bw, y = P1.y + Math.floor(b / cols) * bh + fs * 0.4; S("rect", { x: x + 2, y, width: bw - 4, height: bh - 4, rx: 4, class: "ca-fb ca-ln" }, svg); return { x: x + 2, y, n: 0 }; });
    const rad = Math.max(2, Math.min(bw / 12, bh / 12));
    const d1 = asig.map(b => { const c = cajas1[b], k = c.n++, per = Math.max(1, Math.floor((bw - 8) / (rad * 2.6))); return { el: S("circle", { r: rad, class: "ca-fm" }, svg), x: c.x + 4 + rad + (k % per) * rad * 2.6, y: c.y + bh - 8 - rad - Math.floor(k / per) * rad * 2.6 }; });
    cajas1.forEach((c, b) => { if (c.n > 1) d1.filter((_, i) => asig[i] === b).forEach(o => o.el.setAttribute("class", "ca-fa")); });
    // panel 2: rejilla de 20 × 20 combinaciones, cada clave en su celda
    const g = 20, cel = Math.min(pw / g, ph / g * 1.6), gx = P2.x, gy = P2.y + fs * 0.4;
    T(svg, P2.x, P2.y - fs * 1.6, "secuencias 1 y 2 juntas", "k b");
    T(svg, P2.x, P2.y - fs * 0.5, chico ? "casi nunca coinciden" : "2^194.7 combinaciones: dos claves casi nunca coinciden", "");
    S("rect", { x: gx, y: gy, width: cel * g, height: cel * g * 0.62, class: "ca-fb ca-ln" }, svg);
    for (let i = 1; i < g; i++) S("line", { x1: gx + i * cel, x2: gx + i * cel, y1: gy, y2: gy + cel * g * 0.62, class: "ca-ln", opacity: 0.5 }, svg);
    const filas = Math.floor(g * 0.62);
    for (let j = 1; j < filas; j++) S("line", { x1: gx, x2: gx + cel * g, y1: gy + j * cel, y2: gy + j * cel, class: "ca-ln", opacity: 0.5 }, svg);
    const libres = permutar(g * filas, 5).slice(0, dots);
    const d2 = libres.map(c => ({ el: S("circle", { r: Math.max(1.6, cel * 0.28), class: "ca-fm" }, svg), x: gx + (c % g + 0.5) * cel, y: gy + (Math.floor(c / g) + 0.5) * cel }));
    return t => {
      d1.forEach((o, i) => { const f = fase(t, (i / dots) * 0.4, (i / dots) * 0.4 + 0.1); o.el.setAttribute("cx", o.x); o.el.setAttribute("cy", o.y - (1 - f) * H * 0.15); o.el.style.opacity = f; });
      d2.forEach((o, i) => { const f = fase(t, 0.5 + (i / dots) * 0.4, 0.5 + (i / dots) * 0.4 + 0.1); o.el.setAttribute("cx", o.x); o.el.setAttribute("cy", o.y - (1 - f) * H * 0.1); o.el.style.opacity = f; });
    };
  } }),

  // Paso 8 · antes: (x0, r, N) y (f^m(x0), r, N − m) daban el mismo flujo; ahora no
  "7-1": () => ({ ms: 3800, ilustrativo: "valores de ejemplo: N = 8, m = 3", build(caja, { W, H, fs, chico }) {
    const svg = svgDe(caja, W, H), m = Math.max(10, W * 0.04), lab = Math.min(W * 0.3, fs * 11);
    const n = EJ.N + EJ.L + 1, cw = (W - 2 * m - lab) / n, x0 = m + lab, X = i => x0 + i * cw;
    const fh = chico ? (H - fs * 2) / 2.3 : Math.min(H * 0.17, 70), bwid = cw * 0.62;
    const y = chico ? [fs * 0.6 + fh, fs * 0.6 + 2.1 * fh] : [H * 0.12 + fh, H * 0.12 + 2.15 * fh, H * 0.62 + fh * 0.75, H * 0.62 + 1.85 * fh];
    const fila = (yb, vals, desde, usadoDesde, cls, nombre, h = fh) => {
      const g = S("g", {}, svg);
      T(g, m, yb - h * 0.45, nombre, "m k");
      const bars = vals.map((v, j) => { const i = desde + j, us = i >= usadoDesde; const b = S("rect", { x: X(i) + (cw - bwid) / 2, y: yb - v * h * 0.9, width: bwid, height: Math.max(1, v * h * 0.9), rx: 1.5, class: us ? cls : "ca-fl" }, g); tit(b, `${us ? "valor usado" : "transitorio"}: ${v.toFixed(6)}`); return b; });
      S("line", { x1: X(desde), x2: X(desde + vals.length), y1: yb + 1, y2: yb + 1, class: "ca-ln" }, g);
      return { g, bars };
    };
    const used = EJ.N + 1;
    const A = fila(y[0], viejo.slice(0, n), 0, used, "ca-fa", "(x0, r, N = 8)");
    const B = fila(y[1], viejo.slice(EJ.m, n), EJ.m, used, "ca-fa", "(f³(x0), r, N = 5)");
    const iguales = S("g", {}, svg);
    for (let i = used; i < n; i++) S("line", { x1: X(i) + cw / 2, x2: X(i) + cw / 2, y1: y[0] + 3, y2: y[1] - fh * 0.92, class: "ca-ac", "stroke-dasharray": "2 3" }, iguales);
    T(iguales, m, y[0] + fs * 0.9, "mismo flujo", "a b", "start", "hanging");
    if (!chico) T(svg, m, y[0] - fh - fs * 0.2, "antes: se iteraba desde x0 y N era el transitorio", "k b");
    let C2 = null, D2 = null, nota = null;
    if (!chico) {
      T(svg, m, H * 0.62 - fs * 0.6, "ahora: SHA-512 da otros x(1), r(1) para cada clave", "k b");
      C2 = fila(y[2], Array.from(nuevoK), used, used, "ca-fa", "(x0, r, N = 8)", fh * 0.75);
      D2 = fila(y[3], Array.from(nuevoK2), used, used, "ca-fm", "(f³(x0), r, N = 5)", fh * 0.75);
      nota = T(svg, X(used), y[3] + fs * 0.9, "flujos distintos", "k b", "start", "hanging");
    }
    return t => {
      A.bars.forEach((b, j) => (b.style.opacity = fase(t, j * 0.012, j * 0.012 + 0.1)));
      A.g.style.opacity = 1;
      const s = fase(t, 0.28, 0.5);
      B.g.setAttribute("transform", `translate(${-(1 - s) * EJ.m * cw},0)`); B.g.style.opacity = fase(t, 0.25, 0.32);
      iguales.style.opacity = fase(t, 0.5, 0.6);
      if (C2) { C2.g.style.opacity = fase(t, 0.65, 0.75); D2.g.style.opacity = fase(t, 0.75, 0.85); nota.style.opacity = fase(t, 0.88, 1); }
    };
  } }),

  // Paso 9 · avalancha: los bits que cambian y su conteo frente a Bin(512, 1/2)
  "8-1": ({ caso, eps }) => {
    const dif = []; for (let n = 0; n < 512; n++) if (caso.hb[n] !== eps.hb[n]) dif.push(n);
    const D = dif.length, lp = []; let acc = 0; for (let k = 0; k <= 512; k++) { lp.push(acc - 512 * Math.LN2); acc += Math.log(512 - k) - Math.log(k + 1); }
    const pmf = lp.map(Math.exp), cola = pmf.reduce((s, p, k) => s + (Math.abs(k - 256) >= Math.abs(D - 256) ? p : 0), 0);
    return { ms: 3600, build(caja, { W, H, fs, chico }) {
      const svg = svgDe(caja, W, H), m = Math.max(10, W * 0.05);
      let cs = null, orden = null;
      const tD = T(svg, W - m, chico ? fs * 1.1 : H * 0.05, "", "g a", "end");
      if (!chico) {
        const cw = Math.min(10, (W - 2 * m) / 64, (H * 0.34) / 8 / 1.2), x0 = (W - 64 * cw) / 2, y0 = H * 0.12;
        cs = [];
        for (let j = 0; j < 8; j++) cs.push(...celdas(svg, Array.from(caso.hb.slice(64 * j, 64 * j + 64)), x0, y0 + j * cw * 1.2, cw, { cls: () => "ca-fs" }));
        cs.forEach((c, n) => tit(c, `bit ${n + 1} de 512: ${caso.hb[n]} → ${eps.hb[n]}`));
        orden = new Map(permutar(D, 3).map((k, i) => [dif[k], i]));
        T(svg, m, H * 0.05, "x0 → x0 + 10⁻¹⁵: bits del hash que cambian", "k");
      }
      const l = m + fs * 1.5, r = W - m, top = chico ? fs * 2.6 : H * 0.55, bot = H - fs * (chico ? 1.5 : 2.8), lo = 206, hi = 306;
      const X = k => l + (r - l) * (k - lo) / (hi - lo), pmax = pmf[256], Y = p => bot - (bot - top) * p / pmax;
      const bars = [];
      for (let k = lo; k <= hi; k++) { const cl = Math.abs(k - 256) >= Math.abs(D - 256); const b = S("rect", { x: X(k - 0.42), width: (X(1) - X(0)) * 0.84, class: cl ? "ca-fm" : "ca-fl" }, svg); tit(b, `P(D = ${k}) = ${pmf[k].toExponential(2)}`); bars.push([b, pmf[k]]); }
      S("line", { x1: l, x2: r, y1: bot, y2: bot, class: "ca-ln" }, svg);
      for (const k of [226, 256, 286]) T(svg, X(k), bot + fs * 0.9, String(k), "m", "middle");
      const mD = S("line", { x1: X(D), x2: X(D), y1: top + fs * 0.9, y2: bot, class: "ca-ac", "stroke-width": 2 }, svg);
      const tM = T(svg, X(D) - 6, top + fs * 1.4, `D = ${D}`, "m a b", "end");
      const tB = T(svg, chico ? X(256) + 8 : l, chico ? top + fs * 0.2 : top - fs * 1.4, chico ? "Bin(512, ½)" : `Bin(512, ½): media 256, σ ≈ 11.3 · P(|D − 256| ≥ ${Math.abs(D - 256)}) ≈ ${cola.toFixed(2)}`, "", "start");
      return t => {
        if (cs) { const a = fase(t, 0.05, 0.5) * D; cs.forEach((c, n) => { const o = orden.get(n); c.setAttribute("class", o != null && o < a ? "ca-fa" : "ca-fs"); }); }
        tD.textContent = `${Math.round(fase(t, 0.05, 0.5) * D)} / 512`;
        const f = fase(t, chico ? 0.3 : 0.5, chico ? 0.8 : 0.85);
        bars.forEach(([b, p]) => { const y = Y(p * f); b.setAttribute("y", y); b.setAttribute("height", bot - y); });
        mD.style.opacity = tM.style.opacity = fase(t, 0.82, 0.95); tB.style.opacity = fase(t, 0.85, 1);
      };
    } };
  },

  // Paso 10 · la prueba de validez sobre una rejilla de r ∈ [3.99, 4)
  "9-1": ({ caso }) => {
    const NR = 1200;
    lyapRejilla ??= Array.from({ length: NR }, (_, i) => { const r = 3.99 + 0.01 * (i + 0.5) / NR; return [r, M.lyapunov(r)]; });
    const neg = lyapRejilla.filter(p => p[1] < 0).length, d = caso.d;
    const caso3 = [["r(1)", d.r1], ["r(2)", d.r2], ["rp", d.rp]].map(([n, r]) => [n, r, M.lyapunov(r)]);
    return { ms: 3000, build(caja, { W, H, fs, chico }) {
      const svg = svgDe(caja, W, H), m = Math.max(10, W * 0.05);
      const l = m + fs * 2.6, r = W - m, top = chico ? fs * 1.8 : H * 0.14, bot = H - fs * (chico ? 1.6 : 3);
      const lo = -0.6, hi = 0.8, X = v => l + (r - l) * (v - 3.99) / 0.01, Y = v => top + (bot - top) * (hi - Math.max(lo, Math.min(hi, v))) / (hi - lo);
      S("line", { x1: l, x2: r, y1: Y(0), y2: Y(0), class: "ca-mu" }, svg);
      S("line", { x1: l, x2: r, y1: Y(Math.LN2), y2: Y(Math.LN2), class: "ca-ln", "stroke-dasharray": "5 4" }, svg);
      T(svg, l - 6, Y(0), "0", "m", "end"); T(svg, l - 6, Y(Math.LN2), "ln 2", "m", "end"); T(svg, l - 6, Y(-0.5), "−0.5", "m", "end");
      for (const v of [3.99, 3.995, 4]) T(svg, X(v), bot + fs * 0.9, String(v), "m", "middle");
      const pts = lyapRejilla.map(([rv, lv]) => { const ng = lv < 0, c = S("circle", { cx: X(rv), cy: Y(lv), r: ng ? 2.8 : 1.6, class: ng ? "ca-fa" : "ca-fm" }, svg); if (ng) tit(c, `r = ${rv.toFixed(6)}: λ̂ = ${lv.toFixed(3)} < 0 · la clave se rechaza`); return c; });
      const marcas = caso3.map(([n, rv, lv]) => { const g = S("g", {}, svg); tit(S("circle", { cx: X(rv), cy: Y(lv), r: 5, class: "ca-in", "stroke-width": 1.5 }, g), `${n} = ${rv.toFixed(6)} · λ̂ = ${lv.toFixed(4)}`); T(g, X(rv), Y(lv) - fs * 1.1, n, "m k", "middle"); return g; });
      const tN = T(svg, l, chico ? fs * 0.7 : H * 0.05, chico || W < 720 ? `λ̂ < 0 (ventanas periódicas): ${neg} de ${NR} valores de r` : `λ̂ < 0 (ventanas periódicas): ${neg} de ${NR} valores de r en esta rejilla · x = 0.3, 20 000 + 4000 iteraciones`, "a", "start");
      return t => {
        const a = fase(t, 0, 0.75) * NR; pts.forEach((c, i) => (c.style.opacity = i < a ? 1 : 0));
        marcas.forEach(g => (g.style.opacity = fase(t, 0.8, 0.95))); tN.style.opacity = fase(t, 0.7, 0.9);
      };
    } };
  },
};
let lyapRejilla = null;

const hechas = {};
export function capasClave(vista, i, k, datos) {
  const c = `${i}-${k}`, f = vista && CAPAS[c];
  montar(vista, f ? (hechas[c] ??= f(datos)) : null, "key");
}
