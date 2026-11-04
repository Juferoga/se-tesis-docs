// Animaciones propias de las capas de detalle (↓) de la etapa «Caos».
// Uso: capasCaos(vista, i, k) desde alNivel; con vista = null limpia la animación anterior.
// El marco (contenedor, botón ↻, tamaño, tema, limpieza) es el mismo de la etapa «Clave».
import { montar, lienzo2d, S, T, tit, fase, svgDe, azar, miles, color } from "./clave-capas.js";

const M = window.Modelo, C = M.CASO, lg = M.logistic;
const d = await M.derivar(C.x0, C.r, C.N);
const x1 = d.x1, r1 = d.r1, LN2 = Math.LN2;
const camino = (pts, X, Y) => pts.map(([a, b], i) => `${i ? "L" : "M"}${X(a).toFixed(1)},${Y(b).toFixed(1)}`).join("");
const ejes = (p, l, top, r, bot) => { S("line", { x1: l, x2: r, y1: bot, y2: bot, class: "ca-ln" }, p); S("line", { x1: l, x2: l, y1: top, y2: bot, class: "ca-ln" }, p); };
// trazo que se dibuja de 0 a 1 con stroke-dashoffset
const trazo = (p, dd, cls, extra = {}) => { const n = S("path", { d: dd, class: cls, ...extra }, p); const L = n.getTotalLength?.() || 1; n.style.strokeDasharray = `${L} ${L}`; n.style.strokeDashoffset = L; n.dibujar = f => (n.style.strokeDashoffset = L * (1 - f)); return n; };
const telar = (orb, f) => { const pts = [[orb[0], 0]]; for (let i = 0; i < orb.length - 1; i++) pts.push([orb[i], f(orb[i])], [f(orb[i]), f(orb[i])]); return pts; };
// Cuadro con una curva y su telaraña
function cuadro(p, x, y, Sz, f, nombre, orb) {
  const X = v => x + v * Sz, Y = v => y + (1 - v) * Sz;
  S("rect", { x, y, width: Sz, height: Sz, class: "ca-fb ca-ln" }, p);
  S("line", { x1: X(0), y1: Y(0), x2: X(1), y2: Y(1), class: "ca-ln" }, p);
  const c = []; for (let i = 0; i <= 200; i++) c.push([i / 200, f(i / 200)]);
  S("path", { d: camino(c, X, Y), class: "ca-in", "stroke-width": 1.6, opacity: 0.75 }, p);
  T(p, X(0.5), y + Sz + 4, nombre, "m k", "middle", "hanging");
  const tel = orb ? trazo(p, camino(telar(orb, f), X, Y), "ca-ac", { "stroke-width": 1.4 }) : null;
  return { X, Y, tel };
}

const CAPAS = {
  // Paso 1 · f₄ ∘ h = h ∘ T: las dos telarañas avanzan juntas, unidas por h(y) = sin²(πy/2)
  "0-1": () => {
    const h = y => Math.sin(Math.PI * y / 2) ** 2, Tn = y => 1 - Math.abs(1 - 2 * y), f4 = x => 4 * x * (1 - x), n = 7;
    const ys = [0.17]; for (let i = 0; i < n; i++) ys.push(Tn(ys[i]));
    const xs = [h(ys[0])]; for (let i = 0; i < n; i++) xs.push(f4(xs[i]));
    return { ms: 4000, build(caja, { W, H, fs, chico }) {
      const svg = svgDe(caja, W, H), m = Math.max(10, W * 0.05), lado = W >= H * 1.25;
      const Sz = lado ? Math.min((W - 3 * m - fs * 4) / 2, H - 2 * m - fs * (chico ? 2 : 5)) : Math.min(W - 2 * m, (H - 3 * m - fs * 7) / 2);
      const pA = lado ? [(W - 2 * Sz - fs * 4) / 2, m] : [(W - Sz) / 2, m], pB = lado ? [pA[0] + Sz + fs * 4, m] : [pA[0], m + Sz + fs * 4];
      const A = cuadro(svg, pA[0], pA[1], Sz, Tn, "T(y) = 1 − |1 − 2y|", ys), B = cuadro(svg, pB[0], pB[1], Sz, f4, "f₄(x) = 4x(1 − x)", xs);
      const enl = S("line", { class: "ca-ac", "stroke-dasharray": "3 4", opacity: 0.8 }, svg);
      const tH = T(svg, 0, 0, "h", "m a b", "middle");
      const pa = S("circle", { r: 4, class: "ca-fa" }, svg), pb = S("circle", { r: 4, class: "ca-fa" }, svg);
      const tV = chico ? null : T(svg, W / 2, H - fs * 1.2, "", "m k", "middle");
      return t => {
        const s = t * n, k = Math.min(n, Math.floor(s + 1e-9));
        A.tel.dibujar(t); B.tel.dibujar(t);
        const ax = A.X(ys[k]), ay = A.Y(ys[k]), bx = B.X(xs[k]), by = B.Y(xs[k]);
        pa.setAttribute("cx", ax); pa.setAttribute("cy", ay); pb.setAttribute("cx", bx); pb.setAttribute("cy", by);
        enl.setAttribute("x1", ax); enl.setAttribute("y1", ay); enl.setAttribute("x2", bx); enl.setAttribute("y2", by);
        tH.setAttribute("x", (ax + bx) / 2); tH.setAttribute("y", (ay + by) / 2 - fs * 0.8);
        if (tV) tV.textContent = `n = ${k}: h(Tⁿ(y₀)) = ${h(ys[k]).toFixed(6)} · f₄ⁿ(x₀) = ${xs[k].toFixed(6)}`;
      };
    } };
  },

  // Paso 3 · el punto fijo x* repele: la telaraña gira alrededor y se aleja
  "2-1": () => {
    const xs = 1 - 1 / r1, der = 2 - r1, orb = [xs + 0.004]; for (let i = 0; i < 9; i++) orb.push(lg(orb[i], r1));
    return { ms: 3600, build(caja, { W, H, fs, chico }) {
      const svg = svgDe(caja, W, H), m = Math.max(10, W * 0.05);
      const Sz = Math.min(H - 2 * m - fs * 2, W - 2 * m - (W > H * 1.3 ? fs * 12 : 0)), x = W > H * 1.3 ? m + fs : (W - Sz) / 2, y = m;
      const f = v => lg(v, r1), X = v => x + v * Sz, Y = v => y + (1 - v) * Sz;
      S("rect", { x, y, width: Sz, height: Sz, class: "ca-fb ca-ln" }, svg);
      S("line", { x1: X(0), y1: Y(0), x2: X(1), y2: Y(1), class: "ca-ln" }, svg);
      const c = []; for (let i = 0; i <= 200; i++) c.push([i / 200, f(i / 200)]);
      S("path", { d: camino(c, X, Y), class: "ca-in", "stroke-width": 1.6, opacity: 0.75 }, svg);
      T(svg, X(0.5), y + Sz + 4, `f(x) = r(1)·x·(1 − x)`, "m", "middle", "hanging");
      // tangente en x*: pendiente 2 − r
      const dx = 0.09, tg = S("line", { x1: X(xs - dx), y1: Y(xs - der * dx), x2: X(xs + dx), y2: Y(xs + der * dx), class: "ca-in", "stroke-width": 2, "stroke-dasharray": "5 3" }, svg);
      const tel = trazo(svg, camino(telar(orb, f), X, Y), "ca-ac", { "stroke-width": 1.5 });
      const p0 = S("circle", { cx: X(0), cy: Y(0), r: 4, class: "ca-fi" }, svg), pf = S("circle", { cx: X(xs), cy: Y(xs), r: 4.5, class: "ca-fi" }, svg);
      tit(pf, `x* = 1 − 1/r = ${xs.toFixed(6)} · f′(x*) = 2 − r = ${der.toFixed(4)}`); tit(p0, `0 · f′(0) = r = ${r1.toFixed(6)}`);
      const lx = W > H * 1.3 ? x + Sz + fs * 1.2 : X(0.04), anc = "start";
      const et = [T(svg, lx, W > H * 1.3 ? y + Sz * 0.35 : Y(0.95), `x* = ${xs.toFixed(6)}`, "m k", anc), T(svg, lx, (W > H * 1.3 ? y + Sz * 0.35 : Y(0.95)) + fs * 1.4, `f′(x*) = ${der.toFixed(4)}`, "m a", anc)];
      if (!chico) et.push(T(svg, lx, (W > H * 1.3 ? y + Sz * 0.35 : Y(0.95)) + fs * 2.8, "|f′| > 1: repele", "", anc));
      return t => { tg.style.opacity = fase(t, 0, 0.2); et.forEach(e => (e.style.opacity = fase(t, 0.05, 0.25))); tel.dibujar(fase(t, 0.2, 1)); };
    } };
  },

  // Paso 4 · horizonte de predicción: log₁₀|δₙ| crece en línea recta con pendiente λ/ln 10
  "3-1": () => {
    const lam = M.lyapunov(r1), N = 70, ulp = 2 ** -54;
    const par = d0 => { let a = x1, b = x1 + d0; const o = [[0, Math.log10(Math.abs(b - a))]]; for (let i = 1; i <= N; i++) { a = lg(a, r1); b = lg(b, r1); o.push([i, Math.log10(Math.max(1e-18, Math.abs(a - b)))]); } return o; };
    const A = par(1e-10), B = par(ulp), sep = A.findIndex(p => p[1] > -1);
    return { ms: 3600, build(caja, { W, H, fs, chico }) {
      const svg = svgDe(caja, W, H), m = Math.max(10, W * 0.05);
      const l = m + fs * 3, r = W - m, top = m + fs * (chico ? 0.5 : 1.5), bot = H - fs * (chico ? 1.6 : 3.2);
      const X = n => l + (r - l) * n / N, Y = v => top + (bot - top) * (0.5 - Math.max(-17.5, Math.min(0.5, v))) / 18;
      ejes(svg, l, top, r, bot);
      for (const v of [0, -1, -10, -16]) { T(svg, l - 6, Y(v), v === 0 ? "1" : `10^${v}`, "m", "end"); if (v >= -1) S("line", { x1: l, x2: r, y1: Y(v), y2: Y(v), class: "ca-ln", "stroke-dasharray": "2 3" }, svg); }
      for (const n of [0, 20, 40, 60]) T(svg, X(n), bot + fs * 0.9, String(n), "m", "middle");
      if (!chico) T(svg, (l + r) / 2, bot + fs * 2.3, "iteración n", "", "middle");
      const teo = (d0, Δ) => { const nE = Math.log(Δ / d0) / lam; return `M${X(0)},${Y(Math.log10(d0))} L${X(nE)},${Y(Math.log10(Δ))}`; };
      const lA = trazo(svg, teo(1e-10, 0.1), "ca-in", { "stroke-dasharray": "6 4", opacity: 0.6 }), lB = trazo(svg, teo(ulp, 1), "ca-in", { "stroke-dasharray": "6 4", opacity: 0.4 });
      const cB = trazo(svg, camino(B, X, Y), "ca-mu", { "stroke-width": 1.5 }), cA = trazo(svg, camino(A, X, Y), "ca-ac", { "stroke-width": 2 });
      const mA = S("line", { x1: X(sep), x2: X(sep), y1: Y(-1), y2: bot, class: "ca-ac", "stroke-dasharray": "3 3" }, svg);
      const yL = chico ? Y(-1) + fs * 1.4 : Y(-12), xL = chico ? X(1.5) : X(N * 0.42);
      const tA = T(svg, xL, yL, chico ? "δ₀ = 10⁻¹⁰" : `δ₀ = 10⁻¹⁰: pasa de 0.1 en la iteración ${sep}`, "a b");
      const tB = T(svg, xL, yL + fs * 1.5, chico ? "δ₀ = 1 ulp" : "δ₀ = 1 ulp de x(1) = 2⁻⁵⁴: llega a 1 en ≈ 58", "");
      const tL = chico ? null : T(svg, xL, yL + fs * 3, `discontinuas: δ₀·e^(λn), λ = ${lam.toFixed(4)}`, "", "start");
      const tS = T(svg, X(sep), Y(-1) - fs * 0.8, String(sep), "m a b", "middle");
      return t => {
        const f = fase(t, 0.05, 0.85); cA.dibujar(f); cB.dibujar(f); lA.dibujar(fase(t, 0, 0.5)); lB.dibujar(fase(t, 0, 0.75));
        mA.style.opacity = tS.style.opacity = fase(t, 0.85, 1); tA.style.opacity = fase(t, 0.1, 0.3); tB.style.opacity = fase(t, 0.2, 0.4); if (tL) tL.style.opacity = fase(t, 0.6, 0.8);
      };
    } };
  },

  // Paso 5 · Sharkovskii y Li–Yorke: diagrama de bifurcación y el orden de los periodos
  "4-1": () => ({ ms: 3800, canvas: true, build(caja, { W, H, fs, chico }) {
    const g = lienzo2d(caja, W, H), svg = svgDe(caja, W, H), m = Math.max(10, W * 0.05);
    const l = m + fs * 1.5, r = W - m, top = m, bot = H * (chico ? 0.62 : 0.66), r0 = 3.8, r1b = 4, R = x => l + (r - l) * (x - r0) / (r1b - r0), Yx = v => bot - (bot - top) * v;
    const cols = Math.round(r - l), mu = color("muted"), ac = color("ciph"), p3 = 1 + Math.sqrt(8);
    const pts = []; for (let c = 0; c < cols; c++) { const rv = r0 + (r1b - r0) * (c + 0.5) / cols; let x = 0.3; for (let i = 0; i < 400; i++) x = lg(x, rv); const ys = new Float32Array(110); for (let i = 0; i < 110; i++) { x = lg(x, rv); ys[i] = x; } pts.push([rv, ys]); }
    S("rect", { x: R(3.99), y: top, width: R(4) - R(3.99), height: bot - top, class: "ca-fa", opacity: 0.14 }, svg);
    S("line", { x1: R(p3), x2: R(p3), y1: top, y2: bot, class: "ca-in", "stroke-dasharray": "3 3", opacity: 0.7 }, svg);
    const tP = T(svg, R(p3) + 5, top + fs * 0.7, chico ? "periodo 3" : "periodo 3: r = 1 + √8 ≈ 3.8284", "m k");
    for (const v of [3.8, 3.9, 4]) T(svg, R(v), bot + fs * 0.9, String(v), "m", "middle");
    T(svg, R(4), top - 2, "[3.99, 4]", "m a", "end", "auto");
    // orden de Sharkovskii
    const fichas = ["3", "5", "7", "…", "2·3", "2·5", "…", "4·3", "…", "8", "4", "2", "1"];
    const yF = chico ? H - fs * 0.9 : bot + fs * 3.2, ancho = (W - 2 * m) / fichas.length;
    const fx = fichas.map((s, i) => T(svg, m + (i + 0.5) * ancho, yF, s, "m k b", "middle"));
    const flechas = fichas.slice(1).map((_, i) => T(svg, m + (i + 1) * ancho, yF, "▷", "m", "middle"));
    const tLY = chico ? null : T(svg, W / 2, yF + fs * 1.6, "periodo 3 ⇒ ciclos de todos los periodos y caos de Li–Yorke", "a", "middle");
    return t => {
      g.clearRect(0, 0, W, H);
      const hasta = fase(t, 0, 0.6) * cols;
      for (let c = 0; c < hasta; c++) { const [rv, ys] = pts[c]; g.fillStyle = rv >= 3.99 ? ac : mu; g.globalAlpha = rv >= 3.99 ? 0.9 : 0.55; const x = l + c; for (const v of ys) g.fillRect(x, Yx(v), 1, 1); }
      g.globalAlpha = 1;
      tP.style.opacity = fase(t, 0.3, 0.45);
      const f = fase(t, 0.6, 0.95);
      fx.forEach((e, i) => { e.style.opacity = fase(t, 0.55, 0.65); e.setAttribute("class", "ca-t m b " + (i / fichas.length < f ? "a" : "k")); });
      flechas.forEach(e => (e.style.opacity = fase(t, 0.55, 0.65)));
      if (tLY) tLY.style.opacity = fase(t, 0.9, 1);
    };
  } }),

  // Paso 5 · ventanas densas: zoom de [3.99, 4) a la ventana de periodo 5 cerca de 3.99027
  "4-2": () => ({ ms: 3800, canvas: true, build(caja, { W, H, fs, chico }) {
    const g = lienzo2d(caja, W, H), svg = svgDe(caja, W, H), m = Math.max(10, W * 0.05);
    const l = m + fs * 1.5, r = W - m, top = m + fs * 1.6, bot = H - fs * (chico ? 1.7 : 3.4), Yx = v => bot - (bot - top) * v;
    const cols = Math.min(420, Math.round(r - l)), cw = (r - l) / cols, mu = color("muted"), ac = color("ciph");
    const a0 = 3.99, b0 = 4.0, a1 = 3.99021, b1 = 3.99037;
    S("rect", { x: l, y: top, width: r - l, height: bot - top, class: "ca-ln", fill: "none" }, svg);
    const tI = T(svg, l, bot + fs * 0.9, "", "m", "start"), tD = T(svg, r, bot + fs * 0.9, "", "m", "end");
    const tT = T(svg, l, top - fs * 0.8, "", "k b"), tW = chico ? null : T(svg, (l + r) / 2, bot + fs * 2.4, "", "a", "middle");
    let ult = -1;
    return t => {
      const z = fase(t, 0.15, 0.85), w = (b0 - a0) * ((b1 - a1) / (b0 - a0)) ** z, c = (a0 + b0) / 2 + ((a1 + b1) / 2 - (a0 + b0) / 2) * (((b0 - a0) - w) / ((b0 - a0) - (b1 - a1))), a = c - w / 2;
      if (z === ult) return; ult = z;
      g.clearRect(0, 0, W, H);
      for (let k = 0; k < cols; k++) {
        const rv = a + w * (k + 0.5) / cols; let x = 0.3; for (let i = 0; i < 700; i++) x = lg(x, rv);
        let s = 0; const ys = []; for (let i = 0; i < 90; i++) { x = lg(x, rv); ys.push(x); s += Math.log(Math.abs(rv * (1 - 2 * x)) + 1e-300); }
        const neg = s < 0; g.fillStyle = neg ? ac : mu; g.globalAlpha = neg ? 1 : 0.5;
        for (const v of ys) g.fillRect(l + k * cw, Yx(v), Math.max(1, cw), neg ? 1.6 : 1);
      }
      g.globalAlpha = 1;
      const dec = w < 1e-3 ? 6 : 3;
      tI.textContent = a.toFixed(dec); tD.textContent = (a + w).toFixed(dec);
      tT.textContent = z < 1 ? `r ∈ [${a.toFixed(dec)}, ${(a + w).toFixed(dec)}]` : "ventana de periodo 5 cerca de r ≈ 3.99027";
      if (tW) { tW.textContent = "en verde, λ̂ < 0: ancho ≈ 6·10⁻⁵, más fina que muchas rejillas"; tW.style.opacity = fase(t, 0.85, 1); }
    };
  } }),

  // Paso 6 · suma de Birkhoff: el promedio de ln|f′| converge a ln 2 en r = 4
  "5-1": () => {
    const NMAX = 100000, muestra = r => { let x = 0.3, s = 0; const o = []; let sig = 1; for (let n = 1; n <= NMAX; n++) { s += Math.log(Math.abs(r * (1 - 2 * x)) + 1e-300); x = lg(x, r); if (n >= sig) { o.push([n, s / n]); sig = Math.ceil(sig * 1.04); } } return o; };
    const A = muestra(4), B = muestra(r1);
    return { ms: 3400, build(caja, { W, H, fs, chico }) {
      const svg = svgDe(caja, W, H), m = Math.max(10, W * 0.05);
      const l = m + fs * 3, r = W - m - fs * (chico ? 3 : 4.5), top = m + fs, bot = H - fs * (chico ? 1.6 : 3.2), lo = 0.35, hi = 0.95;
      const X = n => l + (r - l) * Math.log10(n) / 5, Y = v => top + (bot - top) * (hi - Math.max(lo, Math.min(hi, v))) / (hi - lo);
      ejes(svg, l, top, r, bot);
      for (const n of [1, 10, 100, 1000, 10000, 100000]) T(svg, X(n), bot + fs * 0.9, n >= 1000 ? `10^${Math.log10(n)}` : String(n), "m", "middle");
      if (!chico) T(svg, (l + r) / 2, bot + fs * 2.3, "n (términos de la suma, escala log)", "", "middle");
      for (const v of [0.4, 0.6, 0.8]) T(svg, l - 6, Y(v), v.toFixed(1), "m", "end");
      S("line", { x1: l, x2: r, y1: Y(LN2), y2: Y(LN2), class: "ca-in", "stroke-dasharray": "6 4", opacity: 0.7 }, svg);
      T(svg, r + 6, Y(LN2), "ln 2", "m k", "start");
      const cB = trazo(svg, camino(B, X, Y), "ca-mu", { "stroke-width": 1.5 }), cA = trazo(svg, camino(A, X, Y), "ca-ac", { "stroke-width": 2 });
      const fA = A.at(-1)[1], fB = B.at(-1)[1];
      const tA = T(svg, r + 6, Y(fA) - fs * 1.3, `r = 4: ${fA.toFixed(4)}`, "m a", "start"), tB = T(svg, r + 6, Y(fB) + fs * 1.2, `r(1): ${fB.toFixed(4)}`, "m", "start");
      if (r + 6 + fs * 8 > W) { tA.setAttribute("x", r - 4); tA.setAttribute("text-anchor", "end"); tB.setAttribute("x", r - 4); tB.setAttribute("text-anchor", "end"); }
      const tE = chico ? null : T(svg, l + 8, top + fs * 0.4, "λₙ = (1/n) Σ ln|f′(xᵢ)| desde x₀ = 0.3", "k", "start");
      return t => { const f = fase(t, 0, 0.85); cA.dibujar(f); cB.dibujar(f); tA.style.opacity = tB.style.opacity = fase(t, 0.85, 1); };
    } };
  },

  // Paso 6 · fiabilidad de λ̂: 200 arranques por secuencia, frente al valor de 10⁷ términos
  "5-2": () => {
    const filas = [["r(1)", d.r1, 0.6433], ["r(2)", d.r2, 0.6734], ["rp", d.rp, 0.6615]].map(([n, r, larga]) => ({ n, r, larga, base: M.lyapunov(r), v: Array.from({ length: 200 }, (_, k) => M.lyapunov(r, 0.05 + 0.9 * k / 199)) }));
    const lo = 0.628, hi = 0.684, B = 56, bin = v => Math.max(0, Math.min(B - 1, Math.floor((v - lo) / (hi - lo) * B)));
    return { ms: 3400, build(caja, { W, H, fs, chico }) {
      const svg = svgDe(caja, W, H), m = Math.max(10, W * 0.05);
      const l = m + fs * 3, r = W - m, top = m + fs * (chico ? 0.6 : 2.4), bot = H - fs * (chico ? 1.6 : 3), alto = (bot - top) / 3;
      const X = v => l + (r - l) * (v - lo) / (hi - lo), bw = (r - l) / B;
      if (!chico) T(svg, l, m + fs * 0.4, "λ̂ de 200 arranques distintos · raya: x = 0.3 · discontinua: 10⁷ términos", "k");
      for (const v of [0.63, 0.65, 0.67]) T(svg, X(v), bot + fs * 0.9, v.toFixed(2), "m", "middle");
      const g = filas.map((f, j) => {
        const yb = top + (j + 1) * alto - 3, cnt = new Array(B).fill(0), orden = f.v.map(bin);
        const max = Math.max(...orden.reduce((c, b) => (c[b]++, c), new Array(B).fill(0)));
        S("line", { x1: l, x2: r, y1: yb, y2: yb, class: "ca-ln" }, svg);
        T(svg, l - 6, yb - alto * 0.35, f.n, "m k", "end");
        const rects = [...Array(B)].map((_, b) => { const e = S("rect", { x: l + b * bw + 0.5, width: Math.max(1, bw - 1), class: "ca-fm", opacity: 0.7 }, svg); return e; });
        const mb = S("line", { x1: X(f.base), x2: X(f.base), y1: yb - alto * 0.92, y2: yb, class: "ca-ac", "stroke-width": 2 }, svg);
        tit(mb, `${f.n}: λ̂ desde x = 0.3 = ${f.base.toFixed(4)}`);
        const ml = S("line", { x1: X(f.larga), x2: X(f.larga), y1: yb - alto * 0.92, y2: yb, class: "ca-in", "stroke-dasharray": "3 2", "stroke-width": 1.5 }, svg);
        tit(ml, `${f.n}: 10⁷ términos = ${f.larga}`);
        return { yb, cnt, orden, max, rects, mb, ml };
      });
      return t => {
        const a = Math.round(fase(t, 0, 0.8) * 200);
        g.forEach(o => {
          o.cnt.fill(0); for (let k = 0; k < a; k++) o.cnt[o.orden[k]]++;
          o.rects.forEach((e, b) => { const h = (alto * 0.85) * o.cnt[b] / o.max; e.setAttribute("y", o.yb - h); e.setAttribute("height", h); });
          o.mb.style.opacity = o.ml.style.opacity = fase(t, 0.8, 0.95);
        });
      };
    } };
  },

  // Paso 7 · en float64 toda secuencia entra en un ciclo: forma ρ con las longitudes medidas
  "6-1": () => {
    const SEC = [["secuencia 1", 12015279, 9213816], ["secuencia 2", 21158433, 2774760], ["posiciones", 27443276, 3494724]];
    return { ms: 4000, build(caja, { W, H, fs, chico }) {
      const svg = svgDe(caja, W, H), m = Math.max(10, W * 0.05), lab = chico ? fs * 5.5 : fs * 7;
      const maxL = Math.max(...SEC.map(([, mu, L]) => mu + L / Math.PI)), esc = (W - 2 * m - lab - 8) / maxL;
      const top = chico ? fs * 0.4 : m + fs * 2.2, alto = (H - top - (chico ? fs * 0.4 : fs * 3.4)) / 3;
      if (!chico) T(svg, m, m + fs * 0.4, "cola de μ iteraciones y ciclo de periodo L, a escala", "k");
      const total = Math.max(...SEC.map(([, mu, L]) => mu + 1.5 * L));
      const filas = SEC.map(([n, mu, L], j) => {
        const yb = top + (j + 0.62) * alto, x0 = m + lab, R = Math.min(L * esc / (2 * Math.PI), alto * 0.55), xc = x0 + mu * esc + R;
        T(svg, m, yb, n, "m k", "start");
        const cola = trazo(svg, `M${x0},${yb} L${x0 + mu * esc},${yb}`, "ca-mu", { "stroke-width": 1.6 });
        const ciclo = S("circle", { cx: x0 + mu * esc, cy: yb - R, r: R, class: "ca-mu", "stroke-width": 1.6, opacity: 0 }, svg);
        tit(ciclo, `${n}: periodo ${miles(L)}`);
        const tx = chico ? null : T(svg, x0 + 8, yb + fs * 1.1, `μ = ${miles(mu)} · L = ${miles(L)}`, "m", "start");
        const p = S("circle", { r: 3.5, class: "ca-fa" }, svg);
        return { mu, L, x0, yb, R, cola, ciclo, tx, p };
      });
      const uso = S("line", { x1: m + lab, x2: m + lab, y1: top, y2: top + 3 * alto, class: "ca-ac", "stroke-width": 2 }, svg);
      const tU = T(svg, m + lab + 6, chico ? H - fs * 0.8 : H - fs * 1.4, chico ? "uso del modelo: < 10⁴" : W < 720 ? "raya verde: < 10⁴ iteraciones usadas (0.06 % de la cola)" : "raya verde: las < 10⁴ iteraciones que usa el modelo (0.06 % de la cola de la secuencia 1)", "a", "start");
      return t => {
        const n = fase(t, 0, 0.92) * total;
        filas.forEach(o => {
          o.cola.dibujar(Math.min(1, n / o.mu)); o.ciclo.style.opacity = n > o.mu ? 1 : 0;
          let x, y; if (n <= o.mu) { x = o.x0 + (n / o.mu) * (o.mu * esc); y = o.yb; } else { const a = 2 * Math.PI * ((n - o.mu) % o.L) / o.L; x = o.x0 + o.mu * esc + o.R * Math.sin(a); y = o.yb - o.R + o.R * Math.cos(a); }
          o.p.setAttribute("cx", x); o.p.setAttribute("cy", y);
          if (o.tx) o.tx.style.opacity = fase(t, 0.3, 0.5);
        });
        uso.style.opacity = tU.style.opacity = fase(t, 0.85, 1);
      };
    } };
  },

  // Paso 7 · reproducibilidad: r·x·(1 − x) frente a r·x − r·x², mismo arranque
  "6-2": () => {
    const N = 80; let a = x1, b = x1; const A = [[0, a]], Bv = [[0, b]], dig = [[0, 16]];
    for (let n = 1; n <= N; n++) { a = r1 * a * (1 - a); b = r1 * b - r1 * b * b; A.push([n, a]); Bv.push([n, b]); dig.push([n, Math.max(0, Math.min(16, -Math.log10(Math.abs(a - b) || 1e-17)))]); }
    return { ms: 3400, build(caja, { W, H, fs, chico }) {
      const svg = svgDe(caja, W, H), m = Math.max(10, W * 0.05), l = m + fs * 2.6, r = W - m, X = n => l + (r - l) * n / N;
      const curvas = [];
      let top2 = m + fs;
      if (!chico) {
        const t1 = m + fs * 1.6, b1 = H * 0.42, Y = v => b1 - (b1 - t1) * v;
        ejes(svg, l, t1, r, b1);
        T(svg, l, m + fs * 0.3, "xₙ con r·x·(1 − x)  y con  r·x − r·x²", "k");
        for (const v of [0, 1]) T(svg, l - 6, Y(v), String(v), "m", "end");
        curvas.push(trazo(svg, camino(Bv, X, Y), "ca-mu", { "stroke-width": 1.4 }), trazo(svg, camino(A, X, Y), "ca-ac", { "stroke-width": 1.4, opacity: 0.85 }));
        top2 = H * 0.55;
      }
      const bot = H - fs * (chico ? 1.6 : 3.2), Y2 = v => bot - (bot - top2) * v / 16;
      ejes(svg, l, top2, r, bot);
      for (const v of [0, 8, 16]) T(svg, l - 6, Y2(v), String(v), "m", "end");
      for (const n of [0, 20, 40, 60, 80]) T(svg, X(n), bot + fs * 0.9, String(n), "m", "middle");
      T(svg, l + 8, top2 + fs * 0.2, "dígitos decimales en común", "k", "start");
      if (!chico) T(svg, (l + r) / 2, bot + fs * 2.3, "iteración n", "", "middle");
      curvas.push(trazo(svg, camino(dig, X, Y2), "ca-ac", { "stroke-width": 2 }));
      return t => curvas.forEach(c => c.dibujar(fase(t, 0.05, 0.95)));
    } };
  },

  // Paso 8 · histograma de la secuencia 1 que se acerca a la densidad del arcoseno
  "7-1": () => {
    const NM = 200000, s = M.secuencia(x1, r1, d.N, NM), B = 50, rho = x => 1 / (Math.PI * Math.sqrt(x * (1 - x)));
    return { ms: 3600, build(caja, { W, H, fs, chico }) {
      const svg = svgDe(caja, W, H), m = Math.max(10, W * 0.05);
      const l = m + fs * 1.6, r = W - m, top = m + fs * (chico ? 1 : 2.4), bot = H - fs * (chico ? 1.6 : 2.4), tope = 5;
      const X = v => l + (r - l) * v, Y = v => bot - (bot - top) * Math.min(tope, v) / tope, bw = (r - l) / B;
      ejes(svg, l, top, r, bot);
      for (const v of [0, 0.5, 1]) T(svg, X(v), bot + fs * 0.9, String(v), "m", "middle");
      for (const v of [1, 3, 5]) T(svg, l - 6, Y(v), String(v), "m", "end");
      const rects = [...Array(B)].map((_, i) => tit(S("rect", { x: X(i / B) + 0.5, width: Math.max(1, bw - 1), class: (i + 0.5) / B > 0.5 ? "ca-fa" : "ca-fm", opacity: (i + 0.5) / B > 0.5 ? 0.85 : 0.5 }, svg), `x ∈ [${(i / B).toFixed(2)}, ${((i + 1) / B).toFixed(2)})`));
      const c = []; for (let i = 1; i < 400; i++) c.push([i / 400, rho(i / 400)]);
      S("path", { d: camino(c, X, Y), class: "ca-in", "stroke-width": 1.6 }, svg);
      S("line", { x1: X(0.5), x2: X(0.5), y1: top, y2: bot, class: "ca-mu", "stroke-dasharray": "4 3" }, svg);
      T(svg, X(0.5) + 8, Y(1.5), "ρ(x), r = 4", "m k", "start");
      const tN = T(svg, l, top - fs * 0.9, "", chico ? "m a" : "m a b", "start");
      const cnt = new Float64Array(B); let hecho = 0;
      return t => {
        const n = Math.round(100 * (NM / 100) ** fase(t, 0, 0.9));
        if (n < hecho) { cnt.fill(0); hecho = 0; }
        for (; hecho < n; hecho++) cnt[Math.min(B - 1, Math.floor(s[hecho] * B))]++;
        let unos = 0; for (let i = B / 2; i < B; i++) unos += cnt[i];
        rects.forEach((e, i) => { const v = cnt[i] / n * B, y = Y(v); e.setAttribute("y", y); e.setAttribute("height", bot - y); });
        tN.textContent = `secuencia 1 · n = ${miles(n)} · x > 0.5: ${(unos / n * 100).toFixed(2)} %`;
      };
    } };
  },

  // Paso 8 · en r = 4: θ ↦ 2θ mod 1 corre los dígitos y bₙ = d₁ ⊕ d₂
  "7-2": () => {
    const rnd = azar(2024), D = Array.from({ length: 80 }, () => (rnd() < 0.5 ? 0 : 1)), pasos = 10;
    const theta = n => { let v = 0; for (let k = 0; k < 53; k++) v += D[n + k] * 2 ** -(k + 1); return v; };
    const xs = [...Array(pasos + 1)].map((_, n) => Math.sin(Math.PI * theta(n)) ** 2), bs = [...Array(pasos + 1)].map((_, n) => D[n] ^ D[n + 1]);
    return { ms: 4000, ilustrativo: "dígitos de ejemplo", build(caja, { W, H, fs, chico }) {
      const svg = svgDe(caja, W, H), m = Math.max(10, W * 0.05), vis = 24;
      const cw = Math.min(26, (W - 2 * m - fs * 4) / vis), x0 = m + fs * 4, y1 = chico ? H * 0.28 : H * 0.2;
      T(svg, x0 - 6, y1 + cw / 2, "θ = 0.", "m k", "end");
      const clip = S("clipPath", { id: "ca-clip72" }, svg); S("rect", { x: x0, y: y1 - 2, width: vis * cw, height: cw + 4 }, clip);
      const cinta = S("g", { "clip-path": "url(#ca-clip72)" }, svg), cg = S("g", {}, cinta);
      const dig = D.slice(0, vis + pasos + 1).map((b, i) => { const g = S("g", {}, cg); S("rect", { x: i * cw + 1, y: y1, width: cw - 2, height: cw, rx: 3, class: "ca-fb ca-ln" }, g); T(g, i * cw + cw / 2, y1 + cw / 2, String(b), "m k", "middle"); return g; });
      cg.setAttribute("transform", `translate(${x0},0)`);
      const ven = S("rect", { x: x0 - 1, y: y1 - 3, width: 2 * cw + 2, height: cw + 6, rx: 4, class: "ca-ac", "stroke-width": 2 }, svg);
      const tOp = T(svg, x0 + cw, y1 - fs * 0.9, "d₁ ⊕ d₂", "m a b", "middle");
      if (!chico) T(svg, x0 + vis * cw, y1 - fs * 0.9, "θ ↦ 2θ mod 1: los dígitos se corren a la izquierda", "", "end");
      const y2 = chico ? H * 0.62 : H * 0.48;
      const tX = T(svg, x0, y2, "", "m k", "start");
      const y3 = chico ? H * 0.86 : H * 0.7;
      T(svg, x0 - 6, y3 + cw / 2, "b =", "m k", "end");
      const sal = bs.map((b, n) => { const g = S("g", {}, svg); S("rect", { x: x0 + n * cw + 1, y: y3, width: cw - 2, height: cw, rx: 3, class: b ? "ca-fa" : "ca-fb ca-ac" }, g); T(g, x0 + n * cw + cw / 2, y3 + cw / 2, String(b), "m " + (b ? "" : "a"), "middle").style.fill = b ? "var(--bg)" : null; tit(g, `b${n} = d${n + 1} ⊕ d${n + 2} = ${b} · x${n} = ${xs[n].toFixed(6)}`); return g; });
      if (!chico) T(svg, x0, y3 + cw + fs * 1.4, "x > 1/2 ⇔ θ ∈ (1/4, 3/4) ⇔ d₁ ≠ d₂", "", "start");
      return t => {
        const s = t * (pasos + 0.999), k = Math.floor(s), fr = Math.min(1, (s - k) * 2.2), mov = Math.max(0, (s - k) * 2.2 - 1.2);
        const desp = k + Math.min(1, mov);
        cg.setAttribute("transform", `translate(${x0 - desp * cw},0)`);
        const kk = Math.min(pasos, k);
        sal.forEach((g, n) => (g.style.opacity = n < kk || (n === kk && fr >= 0.5) ? 1 : 0));
        tX.textContent = `n = ${kk}: x = sin²(πθ) = ${xs[kk].toFixed(6)} ${xs[kk] > 0.5 ? "> 0.5 → 1" : "≤ 0.5 → 0"}`;
        ven.style.opacity = tOp.style.opacity = 1;
      };
    } };
  },

  // Paso 9 · sesgo del XOR: dos monedas sesgadas y el área donde b₁ ⊕ b₂ = 1
  "8-1": () => {
    const p1 = 0.5277, p2 = 0.5122, e1 = p1 - 0.5, e2 = p2 - 0.5, ex = 2 * e1 * e2;
    return { ms: 3400, build(caja, { W, H, fs, chico }) {
      const svg = svgDe(caja, W, H), m = Math.max(10, W * 0.05), lado = W > H * 1.2 || chico;
      const Sz = lado ? Math.min(H - 2 * m - fs * 4, W * 0.42) : Math.min(W - 2 * m - fs * 7, H * 0.48), x0 = lado ? m + fs * 3.4 : (W - Sz) / 2, y0 = m + fs * 2.4;
      T(svg, x0, y0 - fs * 1.7, chico ? "b₁ ⊕ b₂ = 1 (verde)" : "área verde: P(b₁ ⊕ b₂ = 1)", "k", "start");
      const reg = [0, 1, 2, 3].map(() => S("rect", {}, svg));
      // rótulos de columnas (b₁) y filas (b₂)
      const rc = [[T(svg, 0, y0 - fs * 0.55, "b₁=1", "m", "middle"), q => x0 + Sz * q / 2, 0, "x"], [T(svg, 0, y0 - fs * 0.55, "b₁=0", "m", "middle"), q => x0 + Sz * (1 + q) / 2, 0, "x"],
        [T(svg, x0 - 5, 0, "b₂=1", "m", "end"), (q, p) => y0 + Sz * p / 2, 0, "y"], [T(svg, x0 - 5, 0, "b₂=0", "m", "end"), (q, p) => y0 + Sz * (1 + p) / 2, 0, "y"]];
      const tA = T(svg, x0 + Sz / 2, y0 + Sz + fs * 1.1, "", "m a b", "middle");
      const tb1 = T(svg, x0, y0 + Sz + fs * (chico ? 1.1 : 2.5), chico ? "" : `P(b₁ = 1) = ${p1}`, "m", "start"), tb2 = T(svg, x0 + Sz, y0 + Sz + fs * 2.5, chico ? "" : `P(b₂ = 1) = ${p2}`, "m", "end");
      tA.setAttribute("x", x0 + Sz / 2);
      // barras de sesgo
      const bx = lado ? x0 + Sz + fs * 3 : m + fs * 6, by = lado ? y0 + fs * 0.5 : y0 + Sz + fs * 4.5, bwM = lado ? W - bx - m - fs * 4 : W - bx - m - fs * 4, bh = Math.min(16, (lado ? Sz : H - by - m) / 7);
      const barras = [["ε₁", e1, "ca-fm"], ["ε₂", e2, "ca-fm"], ["ε del XOR", ex, "ca-fa"]].map(([n, e, cl], k) => {
        const y = by + k * bh * 2.4 + fs * 1.4;
        T(svg, bx, y - fs * 0.45, n, "m k", "start");
        const r = S("rect", { x: bx, y: y + 2, height: bh, rx: 2, class: cl }, svg); tit(r, `${n} = ${(e * 100).toFixed(3)} %`);
        const tv = T(svg, bx, y + 2 + bh / 2, `${(e * 100).toFixed(2)} %`, "m " + (cl === "ca-fa" ? "a b" : ""), "start");
        return { r, tv, e };
      });
      if (!chico) T(svg, bx, by + 3 * bh * 2.4 + fs * 2.4, "lema: 1/2 − 2ε₁ε₂ = 0.49933 · medido: 0.49929", "m a", "start");
      return t => {
        const f = fase(t, 0.05, 0.55), q1 = 0.5 + e1 * f, q2 = 0.5 + e2 * f, X1 = x0 + Sz * q1, Y2 = y0 + Sz * q2;
        rc.forEach(([e, a, b, c2]) => { e.setAttribute(c2, a(q1, q2)); });
        const pr = [[x0, y0, X1 - x0, Y2 - y0, 1], [X1, y0, x0 + Sz - X1, Y2 - y0, 0], [x0, Y2, X1 - x0, y0 + Sz - Y2, 0], [X1, Y2, x0 + Sz - X1, y0 + Sz - Y2, 1]];
        // filas: b₂ = 1 arriba; columnas: b₁ = 1 a la izquierda. XOR = 1 en las esquinas cruzadas.
        pr.forEach(([x, y, w, h, igual], i) => { const e = reg[i]; e.setAttribute("x", x); e.setAttribute("y", y); e.setAttribute("width", Math.max(0, w - 1)); e.setAttribute("height", Math.max(0, h - 1)); e.setAttribute("class", igual ? "ca-fs" : "ca-fa"); e.setAttribute("opacity", igual ? 1 : 0.75); });
        tA.textContent = `≈ ${(q1 * (1 - q2) + (1 - q1) * q2).toFixed(4)}`;
        const g = fase(t, 0.55, 0.95), max = e1;
        barras.forEach(b => { const w = Math.max(1.5, bwM * b.e / max) * g; b.r.setAttribute("width", w); b.tv.setAttribute("x", bx + w + 6); b.tv.style.opacity = g; });
        tb1.style.opacity = tb2.style.opacity = 1;
      };
    } };
  },
};

const hechas = {};
export function capasCaos(vista, i, k) {
  const c = `${i}-${k}`, f = vista && CAPAS[c];
  montar(vista, f ? (hechas[c] ??= f()) : null, "ciph");
}
