// Animaciones propias de las capas de detalle de insercion.html. Usan las 1400 posiciones reales del caso
// (Modelo.posiciones) o van rotuladas «ilustrativo».
import { capaSVG, fase, f, txt, rect, linea, camino, ejes, chico, esc } from "./capa-anim.js";

const M0 = 12, ABAJO = 38;
const sup = s => `<tspan dy="-0.45em" style="font-size:72%">${s}</tspan>`;
const fmtN = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const fmtT = s => { const m = Math.floor(s / 60), r = s - 60 * m; return m + ":" + r.toFixed(0).padStart(2, "0"); };

export function crearCapas({ P, HOBS, HREF, M, L, FS, d, Mo }) {
  const DUR = M / 2 / FS, NB = HOBS.length;

  /* ---- Paso 4: capacidad. Áreas proporcionales: M, L máx y L, con un acercamiento. ---- */
  const LMAX = 8 * (65535 + 2);
  function capacidad(W, H, t) {
    const caja = { x: M0, y: M0 + 6, w: W - 2 * M0, h: H - M0 - 6 - ABAJO };
    const hor = caja.w / caja.h > 1.25, et = chico(W) ? 30 : 36, gap = hor ? Math.max(28, caja.w * .1) : 22;
    const S = hor ? Math.min((caja.w - gap) / 2, caja.h - et) : Math.min(caja.w * .8, (caja.h - gap - 2 * et) / 2);
    const xA = hor ? caja.x + (caja.w - 2 * S - gap) / 2 : caja.x + (caja.w - S) / 2;
    const yA = hor ? caja.y + (caja.h - S - et) / 2 : caja.y + (caja.h - 2 * S - 2 * et - gap) / 2;
    const xB = hor ? xA + S + gap : xA, yB = hor ? yA : yA + S + et + gap;
    const t1 = fase(t, 0, .2), t2 = fase(t, .2, .45), t3 = fase(t, .45, .72), t4 = fase(t, .72, .92), t5 = fase(t, .86, 1);
    const sMax = S * Math.sqrt(LMAX / M), sL = S * Math.sqrt(L / M), sLB = S * Math.sqrt(L / LMAX);
    let g = `<g opacity="${f(t1, 2)}">` + rect(xA, yA, S, S, "suave", `M = ${fmtN(M)} muestras: un bit por muestra`, 'style="stroke:var(--line)"') + "</g>";
    if (t2) g += rect(xA, yA, sMax * t2, sMax * t2, "acb", `L máx = ${fmtN(LMAX)} bits: el 2.09 % de M`, 'style="stroke:var(--ac);stroke-width:1.5"');
    if (t4) g += rect(xA, yA, Math.max(1, sL), Math.max(1, sL), "acf", "L = 1400 bits del caso");
    if (t3) {
      const z = t3;
      g += `<g opacity="${f(z, 2)}">` + linea(xA + sMax, yA, xB + (hor ? 0 : S), yB, "rej") + linea(xA + (hor ? sMax : 0), yA + (hor ? sMax : sMax), xB + (hor ? 0 : 0), yB + (hor ? S : 0), "rej") + "</g>";
      g += rect(xB, yB, S * z, S * z, "acb", `Acercamiento: el cuadro de L máx = ${fmtN(LMAX)} bits`, 'style="stroke:var(--ac);stroke-width:1.5"');
    }
    if (t4) { const k = Math.max(3, sLB * Math.min(1, t4 * 1.4)); g += rect(xB, yB, k, k, "acf", "L = 1400 bits: 0.27 % de L máx"); }
    const ch = chico(W);
    g += txt(xA, yA + S + 16, ch ? `M = ${fmtN(M)}` : `M = ${fmtN(M)} muestras`, "r", "start", `opacity="${f(t1, 2)}"`) + txt(xA, yA + S + 30, ch ? "1 bit por muestra" : "un bit por muestra", "", "start", `opacity="${f(t1, 2)}"`);
    if (t5) {
      g += txt(xB, yB + S + 16, ch ? `L máx = ${fmtN(LMAX)}` : `L máx = ${fmtN(LMAX)} bits (2.09 %)`, "r", "start", `opacity="${f(t5, 2)}"`);
      g += txt(xB, yB + S + 30, "L = 1400 bits", "ac", "start", `opacity="${f(t5, 2)}"`);
      g += txt(xB + sLB + 6, yB + Math.max(sLB, 10) + 2, "α = 5.57 × 10⁻⁵", "ac", "start", `opacity="${f(t5, 2)}"`);
    }
    return g;
  }

  /* ---- Paso 5: densidad de y. Histograma de la secuencia real frente a la arcoseno. ---- */
  let Yg = null;
  const NY = 200000, BY = 40;
  function datosY() {
    if (Yg) return Yg;
    const Y = Mo.secuencia(d.xp, d.rp, d.Np, NY);
    // Conteos acumulados por bin en cortes logarítmicos de n, para animar sin recontar.
    const cortes = Array.from({ length: 81 }, (_, q) => Math.round(10 ** (2 + Math.log10(NY / 100) * q / 80)));
    const tablas = []; const h = new Array(BY).fill(0); let i = 0;
    for (const n of cortes) { for (; i < n; i++) h[Math.min(BY - 1, Math.floor(Y[i] * BY))]++; tablas.push([n, h.slice()]); }
    let mn = 1, mx = 0; for (const v of Y) { if (v < mn) mn = v; if (v > mx) mx = v; }
    return (Yg = { tablas, mn, mx });
  }
  function densidad(W, H, t) {
    const { tablas, mn, mx } = datosY();
    const caja = { x: M0 + 26, y: M0 + 24, w: W - 2 * M0 - 26 - 8, h: H - M0 - 24 - ABAJO - 16 };
    const { X, Y } = ejes(caja, { x0: 0, x1: 1, y0: 0, y1: 6 });
    let g = txt(M0, M0 + 12, chico(W) ? "densidad de y (secuencia real)" : "densidad de los valores y de la tercera secuencia (clave del caso)", "r");
    [0, 2, 4, 6].forEach(v => (g += linea(caja.x, Y(v), caja.x + caja.w, Y(v), v ? "rej" : "eje") + txt(caja.x - 5, Y(v) + 4, v, "", "end")));
    (chico(W) ? [0, 1] : [0, .5, 1]).forEach(v => (g += txt(X(v), caja.y + caja.h + 14, v, "", v ? v === 1 ? "end" : "middle" : "start")));
    const [n, h] = tablas[Math.round(fase(t, 0, .85) * (tablas.length - 1))], bw = caja.w / BY;
    h.forEach((c, k) => {
      const dens = c / n * BY, yv = Math.min(6, dens);
      g += rect(caja.x + k * bw + .5, Y(yv), bw - 1, Y(0) - Y(yv), "acf", `y ∈ [${(k / BY).toFixed(3)}, ${((k + 1) / BY).toFixed(3)}): ${fmtN(c)} de ${fmtN(n)} valores (densidad ${dens.toFixed(2)})`, 'opacity=".55"');
    });
    const curva = [];
    for (let q = 0; q <= 240; q++) { const y = .001 + .998 * q / 240, r = 1 / (Math.PI * Math.sqrt(y * (1 - y))); curva.push([X(y), Y(Math.min(6, r))]); }
    g += `<g opacity="${f(fase(t, .1, .4), 2)}">` + camino(curva, "tin") + "</g>";
    g += txt(caja.x + caja.w / 2, Y(1 / Math.PI) - 10, "arcoseno, r = 4", "t", "middle", `opacity="${f(fase(t, .1, .4), 2)}"`);
    g += txt(caja.x + caja.w, M0 + 12, `n = ${fmtN(n)}`, "ac", "end");
    if (t > .85) g += txt(caja.x + caja.w / 2, caja.y + caja.h + 14, chico(W) ? `y ∈ [${mn.toFixed(5)}, ${mx.toFixed(5)}]` : `observado: y ∈ [${mn.toFixed(5)}, ${mx.toFixed(5)}]`, "", "middle", `opacity="${f(fase(t, .85, 1), 2)}"`);
    return g;
  }

  /* ---- Paso 6 · capa 1: las 1400 posiciones caen en 20 tramos del audio. ---- */
  const extremos = HOBS[0] + HOBS[NB - 1];
  function posiciones(W, H, t) {
    const caja = { x: M0 + 26, y: M0 + 52, w: W - 2 * M0 - 26 - 6, h: H - M0 - 52 - ABAJO - 16 };
    const { Y } = ejes(caja, { x0: 0, x1: 1, y0: 0, y1: 210 });
    const X = u => caja.x + u * caja.w, bw = caja.w / NB;
    const n = Math.round(L * fase(t, 0, .75));
    let g = txt(M0, M0 + 12, chico(W) ? "las 1400 posiciones reales" : "las 1400 posiciones reales, en el orden en que se eligen", "r");
    // Cinta del audio con una marca por posición ya elegida.
    const yC = M0 + 24;
    g += rect(caja.x, yC, caja.w, 14, "suave", "El audio: 4:45 de duración");
    let marcas = "";
    for (let i = 0; i < n; i++) { const x = X(P[i] / M); marcas += `M${f(x)},${yC}v14`; }
    g += `<path d="${marcas}" class="lin" style="stroke-width:1;opacity:.45"/>`;
    for (let i = Math.max(0, n - 6); i < n && t < .76; i++) g += linea(X(P[i] / M), yC - 3, X(P[i] / M), yC + 17, "lac");
    // Histograma con los conteos de las posiciones ya elegidas.
    const h = new Array(NB).fill(0); for (let i = 0; i < n; i++) h[Math.min(NB - 1, Math.floor(P[i] / M * NB))]++;
    [0, 70, 140, 210].forEach(v => (g += linea(caja.x, Y(v), caja.x + caja.w, Y(v), v ? "rej" : "eje") + txt(caja.x - 5, Y(v) + 4, v, "", "end")));
    h.forEach((c, k) => {
      const ext = k === 0 || k === NB - 1;
      g += rect(caja.x + k * bw + 1.5, Y(c), bw - 3, Y(0) - Y(c), ext ? "acf" : "gris", `${fmtT(k * DUR / NB)}–${fmtT((k + 1) * DUR / NB)}: ${c} posiciones (densidad con r_p: ${HREF[k]}; uniforme: 70)`, ext ? "" : 'opacity=".55"');
    });
    const tr = fase(t, .75, .95);
    if (tr) {
      g += `<g opacity="${f(tr, 2)}">`;
      HREF.forEach((r, k) => (g += linea(caja.x + k * bw + 1, Y(r), caja.x + (k + 1) * bw - 1, Y(r), "tin")));
      g += linea(caja.x, Y(70), caja.x + caja.w, Y(70), "tin p") + "</g>";
      g += txt(caja.x + caja.w / 2, Y(70) - 6, "uniforme: 70", "", "middle", `opacity="${f(tr, 2)}"`);
    }
    g += txt(caja.x, caja.y + caja.h + 14, "0:00") + txt(caja.x + caja.w, caja.y + caja.h + 14, "4:45", "", "end");
    if (t > .9) g += txt(caja.x + caja.w / 2, caja.y + caja.h + 14, chico(W) ? `${extremos} en los extremos (${(100 * extremos / L).toFixed(1)} %)` : `${extremos} en el primer y último 5 % (${(100 * extremos / L).toFixed(1)} %)`, "ac", "middle", `opacity="${f(fase(t, .9, 1), 2)}"`);
    return g;
  }

  /* ---- Paso 6 · capa 2: colisiones esperadas al elegir n posiciones. ---- */
  function colisiones(W, H, t) {
    const rw = chico(W) ? 92 : 112, caja = { x: M0 + 34, y: M0 + 22, w: W - 2 * M0 - 34 - rw, h: H - M0 - 22 - ABAJO - 16 };
    const { X, Y } = ejes(caja, { x0: 0, x1: 1400, y0: 0, y1: .2 });
    let g = txt(M0, M0 + 12, "colisiones esperadas ≈ C(n, 2) · Σ q²", "r");
    [0, .1, .2].forEach(v => (g += linea(caja.x, Y(v), caja.x + caja.w, Y(v), v ? "rej" : "eje") + txt(caja.x - 5, Y(v) + 4, v.toFixed(1), "", "end")));
    [0, 700, 1400].forEach(v => (g += txt(X(v), caja.y + caja.h + 14, fmtN(v), "", v ? v === 1400 ? "end" : "middle" : "start")));
    g += txt(caja.x + caja.w / 2, caja.y + caja.h + 28, "n posiciones elegidas", "", "middle");
    const E = (n, s) => n * (n - 1) / 2 * s / M, hasta = 1400 * fase(t, 0, .75);
    const curva = s => { const p = []; for (let n = 0; n <= hasta; n += 14) p.push([X(n), Y(E(n, s))]); p.push([X(hasta), Y(E(hasta, s))]); return p; };
    g += camino(curva(1), "lin p") + camino(curva(4.26), "lac");
    const op = fase(t, .75, .95), xe = X(1400) + 8;
    if (op) {
      g += `<g opacity="${f(op, 2)}">` + txt(xe, Y(E(1400, 4.26)) + 4, `arcoseno ${E(1400, 4.26).toFixed(2)}`, "ac") + txt(xe, Y(E(1400, 1)) + 4, `uniforme ${E(1400, 1).toFixed(3)}`) + "</g>";
      g += `<circle cx="${f(X(1400))}" cy="${f(Y(0))}" r="4.5" class="tinf" opacity="${f(op, 2)}"><title>Clave del caso: 1400 iteraciones, 0 colisiones</title></circle>` + txt(xe, Y(0) + 4, "caso: 0", "t", "start", `opacity="${f(op, 2)}"`);
    }
    return g;
  }

  /* ---- Paso 8: LSB por reemplazo. Pares (2k, 2k+1) y su igualación con la carga (ilustrativo). ---- */
  const VAL = [-4, -3, -2, -1, 0, 1, 2, 3], H0 = [30, 45, 62, 80, 80, 62, 45, 30];
  function lsb(W, H, t) {
    const caja = { x: M0 + 6, y: M0 + 20, w: W - 2 * M0 - 12, h: H - M0 - 20 - ABAJO };
    const bajo = H < 300, hl = bajo ? 44 : Math.min(90, caja.h * .3);
    const gp = caja.w / 8, X = i => caja.x + gp * (i + .5);
    let g = txt(M0, M0 + 12, "s′ = 2⌊s/2⌋ + w", "r") + txt(W - M0, M0 + 12, "ilustrativo", "", "end");
    // Recta de enteros con los pares y las únicas transiciones posibles.
    const yR = caja.y + hl * .55, t1 = fase(t, 0, .3);
    g += linea(caja.x, yR, caja.x + caja.w, yR, "eje");
    VAL.forEach((v, i) => (g += `<circle cx="${f(X(i))}" cy="${f(yR)}" r="3" class="gris"/>` + txt(X(i), yR + 15, String(v).replace("-", "−"), "t", "middle")));
    for (let p = 0; p < 4; p++) {
      const a = X(2 * p), b = X(2 * p + 1), m = (a + b) / 2, r = (b - a) / 2, al = Math.min(r * .8, hl * .35);
      const k = t1;
      g += `<path class="lac" d="M${f(a)},${f(yR - 4)} Q${f(m)},${f(yR - 4 - al * 2)} ${f(a + (b - a) * k)},${f(yR - 4 - (k < 1 ? al * 2 * k * (1 - k) * 2 : 0))}" style="stroke-width:1.6"><title>${VAL[2 * p]} par: con w = 1 sube a ${VAL[2 * p + 1]}</title></path>`;
      if (p < 3) g += linea((b + X(2 * p + 2)) / 2, yR - 10, (b + X(2 * p + 2)) / 2, yR + 6, "rej");
    }
    g += txt(caja.x + caja.w, yR - hl * .45, "par → +1 · impar → −1", "", "end", `opacity="${f(t1, 2)}"`);
    // Histograma: con carga α cada valor cede α/2 a su pareja.
    const a = fase(t, .32, .92), yB = caja.y + hl + 18, hB = caja.y + caja.h - yB - 18;
    const Yb = v => yB + hB - v / 90 * hB;
    g += linea(caja.x, Yb(0), caja.x + caja.w, Yb(0), "eje");
    VAL.forEach((v, i) => {
      const pa = i ^ 1, h = H0[i] * (1 - a / 2) + H0[pa] * a / 2, w = gp * .62;
      g += rect(X(i) - w / 2, Yb(h), w, Yb(0) - Yb(h), "gris", `valor ${v}: frecuencia ${h.toFixed(1)} (antes ${H0[i]})`, 'opacity=".6"');
      g += linea(X(i) - w / 2 - 2, Yb(H0[i]), X(i) + w / 2 + 2, Yb(H0[i]), "tin p");
    });
    g += txt(caja.x, yB - 4, `carga α = ${a.toFixed(2)}`, "ac");
    if (t > .92) g += txt(caja.x + caja.w, yB - 4, bajo ? "cada par se iguala" : "con α = 1 cada par se iguala; el caso usa α = 5.6 × 10⁻⁵", "r", "end", `opacity="${f(fase(t, .92, 1), 2)}"`);
    return g;
  }

  /* ---- Paso 9: cota de Cachin sobre cualquier detector (curva ROC alcanzable). ---- */
  const dB = (a, y) => (a > 0 ? a * Math.log2(a / y) : 0) + (a < 1 ? (1 - a) * Math.log2((1 - a) / (1 - y)) : 0);
  function yMax(a, e) { let lo = a, hi = 1; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (dB(a, m) <= e) lo = m; else hi = m; } return lo; }
  function cachin(W, H, t) {
    const S0 = H - M0 - 30 - ABAJO - 20, lado = W - 2 * M0 - 40 - S0 > 150;
    const S = Math.max(60, Math.min(W - 2 * M0 - 40 - (lado ? 150 : 0), S0));
    const caja = { x: lado ? M0 + 40 : (W - S) / 2 + 14, y: M0 + 26, w: S, h: S };
    const { X, Y } = ejes(caja, { x0: 0, x1: 1, y0: 0, y1: 1 });
    const e = 10 ** (Math.log10(2) + (Math.log10(.01) - Math.log10(2)) * fase(t, .05, .9));
    let g = txt(M0, M0 + 12, chico(W) ? "cota de Cachin" : "detectores posibles según la cota de Cachin", "r") + txt(W - M0, M0 + 12, "ε ilustrativo", "", "end");
    g += rect(caja.x, caja.y, caja.w, caja.h, "caja", "");
    g += linea(X(0), Y(0), X(1), Y(1), "lin p");
    const pts = []; for (let q = 0; q <= 60; q++) { const a = q / 60; pts.push([X(a), Y(yMax(a, e))]); }
    g += `<path class="acb" d="M${pts.map(p => f(p[0]) + "," + f(p[1])).join("L")}L${f(X(1))},${f(Y(1))}L${f(X(0))},${f(Y(0))}Z"><title>Pares (falsa alarma, detección) que algún detector podría alcanzar con D(P_C‖P_S) = ${e.toFixed(3)} bits</title></path>`;
    g += camino(pts, "lac");
    g += txt(caja.x + caja.w / 2, caja.y + caja.h + 15, "falsa alarma", "", "middle") + `<text class="" transform="translate(${f(caja.x - 8)},${f(caja.y + caja.h / 2)}) rotate(-90)" text-anchor="middle">detección</text>`;
    g += txt(caja.x - 3, caja.y + caja.h + 12, "0", "", "end") + (S < 140 ? "" : txt(caja.x + caja.w, caja.y + caja.h + 12, "1", "", "end")) + txt(caja.x - 3, caja.y + 8, "1", "", "end");
    const xt = lado ? caja.x + caja.w + 16 : caja.x + 8, yt = lado ? caja.y + 20 : caja.y + 18;
    g += txt(xt, yt, `ε = ${e < .1 ? e.toFixed(3) : e.toFixed(2)} bits`, "ac");
    if (lado && t > .9) g += txt(xt, yt + 20, "con ε → 0 todo detector", "r", "start", `opacity="${f(fase(t, .9, 1), 2)}"`) + txt(xt, yt + 36, "se acerca al azar", "r", "start", `opacity="${f(fase(t, .9, 1), 2)}"`);
    return g;
  }

  /* ---- Paso 10 · capa 1: PSNR con los mismos 695 cambios según la duración del audio. ---- */
  const PSNR = T => 10 * Math.log10(32767 ** 2 * T * 2 * FS / 695);
  function psnr(W, H, t) {
    const caja = { x: M0 + 30, y: M0 + 24, w: W - 2 * M0 - 30 - 8, h: H - M0 - 24 - ABAJO - 16 };
    const { X, Y } = ejes(caja, { x0: 1, x1: 1000, y0: 70, y1: 150, logx: true });
    let g = txt(M0, M0 + 12, chico(W) ? "PSNR con 695 cambios de ±1" : "PSNR con los mismos 695 cambios de ±1, según la duración", "r");
    [70, 110, 150].forEach(v => (g += linea(caja.x, Y(v), caja.x + caja.w, Y(v), v === 70 ? "eje" : "rej") + txt(caja.x - 5, Y(v) + 4, v, "", "end")));
    [[1, "1 s"], [10, "10 s"], [100, "100 s"], [1000, "1000 s"]].forEach(([v, s], q) => (g += txt(X(v), caja.y + caja.h + 14, s, "", q ? q === 3 ? "end" : "middle" : "start")));
    g += linea(caja.x, Y(80), caja.x + caja.w, Y(80), "tin p") + txt(caja.x + caja.w, Y(80) - 5, "80 dB, umbral del artículo", "", "end");
    const hasta = 3 * fase(t, 0, .6), pts = [];
    for (let q = 0; q <= 60; q++) { const e = 3 * q / 60; if (e > hasta) break; pts.push([X(10 ** e), Y(PSNR(10 ** e))]); }
    g += camino(pts, "lin");
    const op1 = fase(t, .6, .78), op2 = fase(t, .78, .96);
    const T0 = DUR, p0 = [X(T0), Y(PSNR(T0))], p1 = [X(T0 / 10), Y(PSNR(T0 / 10))];
    if (op1) g += `<g opacity="${f(op1, 2)}"><circle cx="${f(p0[0])}" cy="${f(p0[1])}" r="5" class="acf"><title>Caso: ${fmtT(T0)}, M = ${fmtN(M)}, MSE = 695/M, PSNR = ${PSNR(T0).toFixed(2)} dB</title></circle>` + txt(p0[0] - 8, p0[1] - 10, `caso: ${PSNR(T0).toFixed(2)} dB`, "ac", "end") + "</g>";
    if (op2) g += `<g opacity="${f(op2, 2)}"><circle cx="${f(p1[0])}" cy="${f(p1[1])}" r="4" class="tinf"><title>Audio 10 veces más corto: ${PSNR(T0 / 10).toFixed(2)} dB</title></circle>` + txt(p1[0] + 8, p1[1] + 16, `10 × más corto: ${PSNR(T0 / 10).toFixed(2)} dB`, "t") + "</g>";
    return g;
  }

  /* ---- Paso 10 · capa 2: análisis por ventanas de 5 s (tasa local de inserción). ---- */
  const VW = 5 * FS * 2, NV = Math.floor(M / VW), cuentas = [];
  for (let k = 0; k < NV; k++) { const hi = M - (NV - 1 - k) * VW, lo = hi - VW; cuentas.push(P.filter(p => p >= lo && p < hi).length); }
  const tasa = c => 100 * c / VW, global = 100 * L / M, imax = cuentas.indexOf(Math.max(...cuentas));
  function ventanas(W, H, t) {
    const caja = { x: M0 + 44, y: M0 + 24, w: W - 2 * M0 - 44 - 6, h: H - M0 - 24 - ABAJO - 16 };
    const { Y } = ejes(caja, { x0: 0, x1: 1, y0: 0, y1: .03 }), bw = caja.w / NV;
    let g = txt(M0, M0 + 12, W < 640 ? "tasa por ventana de 5 s" : "tasa local de inserción por ventana de 5 s (posiciones reales)", "r");
    [0, .01, .02, .03].forEach(v => (g += linea(caja.x, Y(v), caja.x + caja.w, Y(v), v ? "rej" : "eje") + txt(caja.x - 5, Y(v) + 4, v ? v.toFixed(2) + " %" : "0", "", "end")));
    const k1 = Math.floor((NV + 1) * fase(t, 0, .8));
    cuentas.forEach((c, k) => {
      if (k >= k1) return;
      const ac = k === imax, x = caja.x + k * bw;
      g += rect(x + .5, Y(tasa(c)), Math.max(1, bw - 1), Y(0) - Y(tasa(c)), ac ? "acf" : "gris", `${fmtT(DUR - (NV - k) * 5)}–${fmtT(DUR - (NV - 1 - k) * 5)}: ${c} bits, tasa ${tasa(c).toFixed(4)} %`, ac ? "" : 'opacity=".55"');
    });
    if (k1 < NV) g += rect(caja.x + k1 * bw, caja.y, bw, caja.h, "acb", "");
    g += linea(caja.x, Y(global), caja.x + caja.w, Y(global), "tin p") + txt(W - M0, M0 + 12, `- - global ${global.toFixed(4)} %`, "t", "end");
    g += txt(caja.x, caja.y + caja.h + 14, "0:00") + txt(caja.x + caja.w, caja.y + caja.h + 14, fmtT(DUR), "", "end");
    if (t > .85) {
      const c = cuentas[imax], op = `opacity="${f(fase(t, .85, 1), 2)}"`;
      g += txt(caja.x + caja.w - 4, Y(tasa(c)) + 10, `últimos 5 s: ${c} bits, ${(tasa(c) / global).toFixed(1)} ×${chico(W) ? "" : " la global"}`, "ac", "end", op + ` transform="translate(${f(-bw - 4)},0)"`);
    }
    return g;
  }

  const CAPAS = {
    "capacidad-1": [capacidad, 3200, "Áreas proporcionales: las M muestras, el máximo del mensaje y los 1400 bits del caso"],
    "elegir-1": [densidad, 3400, "Histograma de la tercera secuencia real acercándose a la densidad arcoseno"],
    "todas-1": [posiciones, 3800, "Las 1400 posiciones caen en la cinta del audio y forman el histograma por tramos"],
    "todas-2": [colisiones, 2800, "Colisiones esperadas con posiciones uniformes y con la densidad arcoseno"],
    "lsb-1": [lsb, 3400, "LSB por reemplazo: transiciones dentro de cada par e igualación de sus frecuencias, ilustrativo"],
    "comparar-1": [cachin, 3400, "Región de detectores posibles según la cota de Cachin al reducir la divergencia"],
    "metricas-1": [psnr, 3000, "PSNR del caso y del mismo mensaje en un audio diez veces más corto"],
    "metricas-2": [ventanas, 3600, "Tasa local de inserción en ventanas de 5 segundos"],
  };
  let limpiar = () => {};
  return (nombre, k, vista) => {
    limpiar(); limpiar = () => {};
    if (!k || !vista) return;
    const c = CAPAS[`${nombre}-${k}`];
    if (!c) return;
    limpiar = capaSVG(vista, { pintar: c[0], ms: c[1], etiqueta: c[2], acento: "pos" });
  };
}
