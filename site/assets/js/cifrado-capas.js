// Animaciones propias de las capas de detalle de cifrado.html. Cada una ilustra su capa con los datos del caso
// (flujo real de la clave x0 = 0.123456, r = 3.999952, N = 6173) o va rotulada «ilustrativo».
import { capaSVG, fase, f, txt, rect, linea, camino, bit, ejes, bitsDe, chico, esc } from "./capa-anim.js";

const M = 12, ABAJO = 38;  // margen y franja inferior reservada al botón ↻
const hx = n => n.toString(16).padStart(2, "0").toUpperCase();
const sup = s => `<tspan dy="-0.45em" style="font-size:72%">${s}</tspan>`;

// Rejilla de filas de 16 bits centrada en la vista. filas: [{ alto: "fila" | "cab" | "hueco" }]
function rejilla(W, H, filas, { lw = 30, rw = 0, cols = 16, max = 40 } = {}) {
  const nF = filas.filter(x => x === "fila").length, nC = filas.filter(x => x === "cab").length, nH = filas.filter(x => x === "hueco").length;
  const hc = chico(W) ? 15 : 18;
  const disp = H - M - ABAJO;
  let s = Math.min(max, (W - 2 * M - lw - rw) / cols, (disp - nC * hc) / (nF * 1.1 + nH * .45));
  s = Math.max(8, s);
  const alto = nF * s * 1.1 + nH * s * .45 + nC * hc;
  let y = M + Math.max(0, (disp - alto) / 2);
  const ancho = lw + cols * s + rw, x0 = Math.max(M, (W - ancho) / 2) + lw;
  const ys = filas.map(tipo => { const y0 = y; y += tipo === "fila" ? s * 1.1 : tipo === "cab" ? hc : s * .45; return y0; });
  return { s, x0, ys, hc, ancho, xL: x0 - lw };
}

export function crearCapas(ctx) {
  const { K, CB, MSG, F, VB, VC, Mo, d } = ctx;
  const kb = [...bitsDe(K[0]), ...bitsDe(K[1])], mb = [...bitsDe(MSG[0]), ...bitsDe(MSG[1])], cb = [...bitsDe(CB[0]), ...bitsDe(CB[1])];

  /* ---- Paso 2 · capa 1: cifrado de flujo síncrono. Un bit invertido frente a un bit perdido. ---- */
  function sincrono(W, H, t) {
    const FLIP = 11, DEL = 3;
    const c1 = cb.map((b, j) => (j === FLIP ? 1 - b : b)), m1 = c1.map((b, j) => b ^ kb[j]);
    const c2 = cb.filter((_, j) => j !== DEL).concat([null]), m2 = c2.map((b, j) => (b == null ? null : b ^ kb[j]));
    const mal1 = m1.filter((b, j) => b !== mb[j]).length, mal2 = m2.filter((b, j) => b != null && b !== mb[j]).length;
    // En vistas bajas (teléfono) los encabezados pasan a notas a la derecha de cada par de filas.
    const bajo = H < 300;
    const L = bajo ? ["fila", "hueco", "fila", "fila", "hueco", "fila", "fila"] : ["cab", "fila", "hueco", "cab", "fila", "fila", "hueco", "cab", "fila", "fila"];
    const iy = bajo ? { k: 0, c1: 2, m1: 3, c2: 5, m2: 6 } : { hk: 0, k: 1, h1: 3, c1: 4, m1: 5, h2: 7, c2: 8, m2: 9 };
    const { s, x0, ys, hc, xL } = rejilla(W, H, L, { lw: 30, rw: bajo ? 104 : 0 });
    const X = j => x0 + j * s, xn = x0 + 16 * s + 10, yb = y => y + s * .72;
    let g = "";
    const tA = fase(t, 0, .22), tB = fase(t, .24, .58), tC = fase(t, .62, 1);
    // Flujo k
    if (!bajo) g += txt(xL, ys[iy.hk] + hc - 4, "flujo k = G(K): no depende de m ni de c", "r");
    else g += txt(xn, yb(ys[iy.k]), "k = G(K)", "r");
    g += txt(xL, yb(ys[iy.k]), "k", "t");
    kb.forEach((b, j) => (g += bit(X(j), ys[iy.k], s, b, { op: fase(tA, j / 19, j / 19 + .15), tit: `k, bit ${j + 1} = ${b}` })));
    // Un bit invertido
    const nota = (yh, ya, a, b, tt) => bajo
      ? txt(xn, yb(ys[ya]), a, "r") + (tt > .9 ? txt(xn, yb(ys[ya + 1]), b, "r ac") : "")
      : txt(xL, ys[yh] + hc - 4, a, "r") + (tt > .9 ? txt(xL + (chico(W) ? 150 : 170), ys[yh] + hc - 4, "→ " + b, "r ac") : "");
    g += nota(iy.h1, iy.c1, bajo ? "1 bit invertido" : "un bit invertido en c", `${mal1} bit erróneo${bajo ? "" : " en m"}`, tB);
    g += txt(xL, yb(ys[iy.c1]), "c′", "t") + txt(xL, yb(ys[iy.m1]), "m′", "t");
    c1.forEach((b, j) => (g += bit(X(j), ys[iy.c1], s, j === FLIP && tB < .3 ? cb[j] : b, { ac: j === FLIP && tB >= .3, op: fase(tB, 0, .2), tit: j === FLIP ? `c′, bit ${j + 1}: invertido en el canal` : `c′, bit ${j + 1} = ${b}` })));
    m1.forEach((b, j) => (g += bit(X(j), ys[iy.m1], s, b, { ac: b !== mb[j], op: fase(tB, .35 + j * .035, .45 + j * .035), tit: `m′ = c′ ⊕ k, bit ${j + 1}${b !== mb[j] ? ": erróneo" : ""}` })));
    // Un bit perdido: los siguientes se corren una casilla
    g += nota(iy.h2, iy.c2, bajo ? "1 bit perdido" : "un bit perdido en c", `${mal2} de 15 erróneos${bajo ? "" : " en m"}`, tC);
    g += txt(xL, yb(ys[iy.c2]), "c″", "t") + txt(xL, yb(ys[iy.m2]), "m″", "t");
    const Y8 = ys[iy.c2], Y9 = ys[iy.m2];
    const corre = fase(tC, .12, .4);
    cb.forEach((b, j) => {
      if (j === DEL) { g += bit(X(j), Y8 - corre * s * .6, s, b, { op: fase(tC, 0, .1) * (1 - corre), ac: true }); return; }
      const dx = j > DEL ? -corre * s : 0;
      g += bit(X(j) + dx, Y8, s, b, { op: fase(tC, 0, .1), tit: `c″: bit ${j + 1} de c, recibido en la casilla ${j > DEL ? j : j + 1}` });
    });
    if (corre >= 1) g += bit(X(15), Y8, s, null, { tit: "siguiente bit de c (fuera de la vista)" });
    m2.forEach((b, j) => { if (b == null) return; g += bit(X(j), Y9, s, b, { ac: b !== mb[j], op: fase(tC, .45 + j * .03, .55 + j * .03), tit: `m″ = c″ ⊕ k, bit ${j + 1}${b !== mb[j] ? ": erróneo" : ": correcto por azar"}` }); });
    return g;
  }

  /* ---- Paso 2 · capa 2: sesgo del flujo. Frecuencia de unos de b1, b2 y su XOR al crecer n. ---- */
  let corr = null;
  function datosSesgo() {
    if (corr) return corr;
    const G = Mo.flujo(d, 125000), N = G.bits.length, puntos = [];
    let a = 0, b = 0, c = 0, i = 0;
    for (let q = 0; q <= 150; q++) {
      const n = Math.min(N, Math.round(10 ** (2 + 4 * q / 150)));
      for (; i < n; i++) { a += G.b1[i]; b += G.b2[i]; c += G.bits[i]; }
      puntos.push([n, a / n, b / n, c / n]);
    }
    return (corr = puntos);
  }
  function sesgo(W, H, t) {
    const P = datosSesgo(), ch = chico(W), rw = 80;
    const caja = { x: M + 34, y: M + 22, w: W - 2 * M - 34 - rw, h: H - M - 22 - ABAJO - 14 };
    const { X, Y } = ejes(caja, { x0: 100, x1: 1e6, y0: .46, y1: .56, logx: true });
    let g = txt(M, M + 12, ch ? "frecuencia de unos" : "frecuencia de unos con la clave del caso", "r");
    // Banda de una moneda justa (±3σ)
    const nn = Array.from({ length: 61 }, (_, q) => 10 ** (2 + 4 * q / 60)), cl = v => Math.max(.46, Math.min(.56, v));
    const sup_ = nn.map(n => [X(n), Y(cl(.5 + 1.5 / Math.sqrt(n)))]), inf = nn.map(n => [X(n), Y(cl(.5 - 1.5 / Math.sqrt(n)))]).reverse();
    g += `<path class="suave" d="M${[...sup_, ...inf].map(p => f(p[0]) + "," + f(p[1])).join("L")}Z"><title>Moneda justa: 0.5 ± 3σ, con σ = 1/(2√n)</title></path>`;
    [.47, .5, .53, .56].forEach(v => (g += linea(caja.x, Y(v), caja.x + caja.w, Y(v), v === .5 ? "eje" : "rej") + txt(caja.x - 5, Y(v) + 4, v.toFixed(2), "", "end")));
    [2, 3, 4, 5, 6].forEach(e => (g += txt(X(10 ** e), caja.y + caja.h + 14, "10" + sup("" + e), "", "middle")));
    g += txt(caja.x + caja.w, caja.y + caja.h + 28, "n bits", "", "end");
    const hasta = 10 ** (2 + 4 * fase(t, 0, .85)), vis = P.filter(p => p[0] <= hasta);
    g += camino(vis.map(p => [X(p[0]), Y(cl(p[1]))]), "lin");
    g += camino(vis.map(p => [X(p[0]), Y(cl(p[2]))]), "lin p");
    g += camino(vis.map(p => [X(p[0]), Y(cl(p[3]))]), "lac");
    const u = vis[vis.length - 1];
    if (u) {
      const op = fase(t, .8, 1), xe = X(u[0]) + 6;
      g += `<g opacity="${f(op, 2)}">` + txt(xe, Y(u[1]) + 4, `b⁽¹⁾ ${u[1].toFixed(3)}`) + txt(xe, Y(u[2]) + 4, `b⁽²⁾ ${u[2].toFixed(3)}`) +
        txt(xe, Y(u[3]) + 4, `b ${u[3].toFixed(4)}`, "ac") + "</g>";
      g += `<circle cx="${f(X(u[0]))}" cy="${f(Y(u[3]))}" r="3.5" class="acf"><title>Flujo b = b⁽¹⁾ ⊕ b⁽²⁾: ${u[3].toFixed(5)} con n = ${u[0].toLocaleString("es-CO")}. Lema: 1/2 − 2ε₁ε₂ ≈ 0.49932</title></circle>`;
    }
    if (t >= 1) g += txt(W - M, M + 12, "ε = 2ε₁ε₂ ≈ 6.8 × 10⁻⁴", "ac", "end");
    return g;
  }

  /* ---- Paso 3: texto claro conocido. c y m conocidos revelan k₁k₂. ---- */
  function conocido(W, H, t) {
    const L = ["cab", "fila", "fila", "hueco", "fila", "hueco", "cab", "cab"];
    const { s, x0, ys, hc, xL } = rejilla(W, H, L, { lw: 22, rw: 52 });
    const X = j => x0 + j * s, xr = x0 + 16 * s + 8;
    let g = txt(xL, ys[0] + hc - 4, "lo que ve quien tiene c", "r");
    const t1 = fase(t, 0, .3), t2 = fase(t, .32, .72), t3 = fase(t, .75, 1);
    g += txt(xL, ys[1] + s * .68, "c", "t") + txt(xL, ys[2] + s * .68, "m", "t") + txt(xL, ys[4] + s * .68, "k", "t ac");
    cb.forEach((b, j) => (g += bit(X(j), ys[1], s, b, { op: fase(t1, 0, .5), tit: `c, bit ${j + 1}: cifrado observado` })));
    mb.forEach((b, j) => (g += bit(X(j), ys[2], s, b, { op: fase(t1, .4, 1), tit: `m, bit ${j + 1}: la longitud 173 = 0x00AD se deduce del tamaño de c` })));
    g += `<g opacity="${f(fase(t1, 0, .5), 2)}">${txt(xr, ys[1] + s * .68, hx(CB[0]) + " " + hx(CB[1]))}</g><g opacity="${f(fase(t1, .4, 1), 2)}">${txt(xr, ys[2] + s * .68, "00 AD")}</g>`;
    if (t2 > 0) g += linea(x0, ys[3] + s * .22, x0 + 16 * s, ys[3] + s * .22, "eje");
    kb.forEach((b, j) => (g += bit(X(j), ys[4], s, b, { ac: true, op: fase(t2, j / 18, j / 18 + .12), tit: `k, bit ${j + 1} = c ⊕ m = ${cb[j]} ⊕ ${mb[j]} = ${b}` })));
    g += `<g opacity="${f(fase(t2, .85, 1), 2)}">${txt(xr, ys[4] + s * .68, hx(K[0]) + " " + hx(K[1]), "ac")}</g>`;
    // Franja con los 1400 bits del flujo: solo los 16 primeros quedan expuestos.
    const anch = 16 * s + 8 + 44, xa = xL, wa = Math.min(W - 2 * M, x0 - xL + anch) * t3, ya = ys[6] + 2;
    g += rect(xa, ya, wa, 7, "suave", "Los 1400 bits del flujo de clave") + rect(xa, ya, Math.max(2, wa * 16 / 1400), 7, "acf", "16 bits expuestos: k₁ y k₂");
    if (t3 > .6) g += txt(xa, ys[7] + hc - 2, "16 de los 1400 bits del flujo quedan expuestos", "r", "start", `opacity="${f(fase(t3, .6, 1), 2)}"`);
    return g;
  }

  /* ---- Paso 4: maleabilidad. Invertir un bit de c₂ cambia la longitud declarada. ---- */
  function maleable(W, H, t) {
    const J = 14, D = Array.from({ length: 16 }, (_, j) => (j === J ? 1 : 0));
    const c2 = cb.map((b, j) => b ^ D[j]), m2 = c2.map((b, j) => b ^ kb[j]);
    const L = ["fila", "fila", "hueco", "fila", "fila", "hueco", "cab", "cab"];
    const { s, x0, ys, hc, xL } = rejilla(W, H, L, { lw: 44, rw: 52 });
    const X = j => x0 + j * s, xr = x0 + 16 * s + 8;
    const t1 = fase(t, 0, .2), t2 = fase(t, .22, .42), t3 = fase(t, .45, .65), t4 = fase(t, .68, .88), t5 = fase(t, .86, 1);
    let g = "";
    const fila = (y, lab, bits, tt, ac, tit, hex, acHex) => {
      g += `<g opacity="${f(fase(tt, 0, .4), 2)}">` + txt(xL, y + s * .68, lab, "t") + `</g>`;
      bits.forEach((b, j) => (g += bit(X(j), y, s, b, { ac: ac(j), op: fase(tt, j / 20, j / 20 + .2), tit: tit(j, b) })));
      g += `<g opacity="${f(fase(tt, .8, 1), 2)}">${txt(xr, y + s * .68, hex, acHex ? "ac" : "")}</g>`;
    };
    fila(ys[0], "c", cb, t1, () => false, (j, b) => `c, bit ${j + 1} = ${b}`, hx(CB[0]) + " " + hx(CB[1]));
    fila(ys[1], "⊕ Δ", D, t2, j => j === J, (j, b) => (b ? "Δ: el atacante invierte este bit" : "Δ = 0: sin cambio"), "00 02", true);
    fila(ys[3], "c ⊕ Δ", c2, t3, j => j === J, (j, b) => `c ⊕ Δ, bit ${j + 1} = ${b}`, hx(CB[0]) + " " + hx(CB[1] ^ 2));
    fila(ys[4], "⊕ k →", m2, t4, j => j === J, (j, b) => `descifrado: m ⊕ Δ, bit ${j + 1} = ${b}`, "00 " + hx(MSG[1] ^ 2), true);
    if (t2 > 0) { const xc = X(J) + s / 2; g += `<line x1="${f(xc)}" y1="${f(ys[0] - 2)}" x2="${f(xc)}" y2="${f(ys[0] + (ys[4] - ys[0] + s) * Math.max(t2 * .3, t4))}" class="lac" opacity=".35"/>`; }
    if (t5 > 0) {
      g += `<g opacity="${f(t5, 2)}">` + txt(xL, ys[6] + hc - 4, "longitud declarada", "r") + `<text x="${f(xL)}" y="${f(ys[7] + hc + 6)}" class="big">173 → <tspan class="ac" style="fill:var(--ac)">${(MSG[1] ^ 2)}</tspan></text>` + "</g>";
      g += txt(W - M, ys[7] + hc + 6, "sin conocer k", "r", "end", `opacity="${f(t5, 2)}"`);
    }
    return g;
  }

  /* Barras horizontales con rótulos (encima en vistas altas, a la izquierda en vistas bajas). */
  function barrasH(W, H, t, { titulo: tt0, max, ticks, lista, decimales, extra }) {
    const bajo = H < 320, lw = bajo ? Math.min(150, W * .42) : 0;
    const caja = { x: M + 4 + lw, y: M + 18, w: W - 2 * M - 8 - lw - (bajo ? 34 : 0), h: H - M - 18 - ABAJO - 18 };
    const n = lista.length, paso = Math.min(caja.h / (n + .6), bajo ? 40 : 70), hb = Math.min(bajo ? 14 : 22, paso * (bajo ? .55 : .36));
    caja.y += Math.max(0, (caja.h - n * paso - 24) / 2);
    const X = v => caja.x + v / max * caja.w;
    let g = txt(M + 4, caja.y - (bajo ? 4 : 6), tt0, "r");
    lista.forEach((b, q) => {
      const y = caja.y + q * paso + (bajo ? 6 : 16), a = fase(t, q * (.6 / n), q * (.6 / n) + .3);
      g += bajo ? txt(caja.x - 8, y + hb * .78, b.lab, "r", "end", `opacity="${f(Math.min(1, a * 3), 2)}"`) : txt(caja.x, y - 4, b.lab, "r", "start", `opacity="${f(Math.min(1, a * 3), 2)}"`);
      g += rect(caja.x, y, X(b.v * a) - caja.x, hb, b.cls, b.tit, b.cls === "suave" ? 'style="stroke:var(--line)"' : "");
      if (a > .95) {
        const dentro = X(b.v) > caja.x + caja.w - 60;
        g += dentro ? txt(X(b.v) - 6, y + hb * .78, b.val, "", "end", `style="fill:${b.cls === "suave" ? "var(--muted)" : "var(--surface)"}"`) : txt(X(b.v) + 6, y + hb * .78, b.val, b.cls === "acf" ? "ac" : "t");
      }
      if (b.sobre) { const s2 = fase(t, .72, 1); if (s2) { g += rect(caja.x, y, (X(b.sobre.v) - caja.x) * s2, hb, "acf", b.sobre.tit); if (hb >= 13) g += txt(caja.x + 5, y + hb * .78, b.sobre.lab, "", "start", `style="fill:var(--surface)" opacity="${f(s2, 2)}"`); } }
    });
    const yA = caja.y + n * paso + (bajo ? 8 : 12);
    g += linea(caja.x, yA, caja.x + caja.w, yA, "eje");
    (bajo ? [ticks[0], ticks[2], ticks[4]] : ticks).forEach((v, q, T) => (g += linea(X(v), yA, X(v), yA + 4, "eje") + txt(X(v), yA + 15, v, "", q === 0 ? "start" : q === T.length - 1 ? "end" : "middle")));
    if (extra && t > .85) g += txt(bajo ? caja.x : caja.x, Math.min(H - 8, yA + 32), extra(bajo), "r ac", "start", `opacity="${f(fase(t, .85, 1), 2)}"`);
    return g;
  }

  /* ---- Paso 5 · capa 1: Vernam. Tamaños en escala log₂. ---- */
  function vernam(W, H, t) {
    return barrasH(W, H, t, {
      titulo: "cantidades en escala log₂", max: 1400, ticks: [0, 350, 700, 1050, 1400],
      lista: [
        { lab: "mensajes de 1400 bits", v: 1400, val: "2" + sup("1400"), cls: "gris", tit: "2^1400 mensajes posibles de 1400 bits" },
        { lab: "claves de Vernam", v: 1400, val: "2" + sup("1400"), cls: "suave", tit: "Vernam: clave uniforme de 1400 bits, 2^1400 claves" },
        { lab: "claves de este esquema", v: 112.91, val: "2" + sup("112.91"), cls: "acf", tit: "2^112.91 claves válidas de K = (x0, r, N)" },
      ],
      extra: bajo => (bajo || chico(W) ? "sin secreto perfecto: 2¹¹²·⁹¹ ≪ 2¹⁴⁰⁰" : "un c admite a lo más 2¹¹²·⁹¹ mensajes: no hay secreto perfecto"),
    });
  }

  /* ---- Paso 5 · capa 2: ventaja del distinguidor por sesgo frente a n. ---- */
  const erf = x => { const s = Math.sign(x); x = Math.abs(x); const a = 1 / (1 + .3275911 * x); return s * (1 - (((((1.061405429 * a - 1.453152027) * a) + 1.421413741) * a - .284496736) * a + .254829592) * a * Math.exp(-x * x)); };
  const EPS = 2 * .0278 * .0122, adv = n => erf(EPS * Math.sqrt(n) / Math.SQRT2);
  function distinguidor(W, H, t) {
    const caja = { x: M + 30, y: M + 34, w: W - 2 * M - 30 - 10, h: H - M - 34 - ABAJO - 14 };
    const { X, Y } = ejes(caja, { x0: 10, x1: 1e8, y0: 0, y1: 1, logx: true });
    let g = txt(M, M + 12, "ventaja del mejor distinguidor que usa el sesgo", "r") + txt(M, M + 27, "|P[D(G(K))=1] − P[D(U)=1]|, aproximación normal", "", "start");
    [0, .5, 1].forEach(v => (g += linea(caja.x, Y(v), caja.x + caja.w, Y(v), v ? "rej" : "eje") + txt(caja.x - 5, Y(v) + 4, v, "", "end")));
    [1, 2, 4, 6, 8].forEach(e => (g += txt(X(10 ** e), caja.y + caja.h + 14, "10" + (e > 1 ? sup("" + e) : ""), "", "middle")));
    g += txt(caja.x + caja.w, caja.y + caja.h + 28, "n bits del flujo", "", "end");
    const hasta = 1 + 7 * fase(t, 0, .7), pts = [];
    for (let q = 0; q <= 140; q++) { const e = 1 + 7 * q / 140; if (e > hasta) break; pts.push([X(10 ** e), Y(adv(10 ** e))]); }
    g += camino(pts, "lac");
    const marcas = [[1400, "caso: 1400 bits", `ventaja ${adv(1400).toFixed(3)}`], [1 / EPS ** 2, "1/ε² ≈ 2 × 10⁶ bits", `ventaja ${adv(1 / EPS ** 2).toFixed(2)}`]];
    marcas.forEach(([n, a, b], q) => {
      const op = fase(t, .7 + q * .12, .82 + q * .12); if (!op) return;
      const x = X(n), y = Y(adv(n));
      g += `<g opacity="${f(op, 2)}">${linea(x, y, x, caja.y + caja.h, "rej")}<circle cx="${f(x)}" cy="${f(y)}" r="4" class="tinf"><title>${a}: ${b}</title></circle>` +
        txt(x + (q ? -8 : 8), y - (q ? 8 : 22), a, "r", q ? "end" : "start") + txt(x + (q ? -8 : 8), y - (q ? -6 : 8), b, "t", q ? "end" : "start") + "</g>";
    });
    return g;
  }

  /* ---- Paso 6 · capa 1: valores distintos al crecer el número de bytes. ---- */
  const distintosHasta = bs => { const v = new Set(); return Array.from(bs, b => (v.add(b), v.size)); };
  const DT = distintosHasta(VB), DC = distintosHasta(VC), NV = VB.length;
  const ED = n => 256 * (1 - (255 / 256) ** n);
  function distintos(W, H, t) {
    const rw = chico(W) ? 62 : 84, caja = { x: M + 28, y: M + 22, w: W - 2 * M - 28 - rw, h: H - M - 22 - ABAJO - 14 };
    const { X, Y } = ejes(caja, { x0: 0, x1: NV, y0: 0, y1: 100 });
    let g = txt(M, M + 12, chico(W) ? "valores de byte distintos en n bytes" : "valores de byte distintos en los primeros n bytes del verso", "r");
    [0, 50, 100].forEach(v => (g += linea(caja.x, Y(v), caja.x + caja.w, Y(v), v ? "rej" : "eje") + txt(caja.x - 5, Y(v) + 4, v, "", "end")));
    [0, 49, 98].forEach(v => (g += txt(X(v), caja.y + caja.h + 14, v, "", v ? v === NV ? "end" : "middle" : "start")));
    g += txt(caja.x + caja.w, caja.y + caja.h + 28, "n bytes", "", "end");
    const n = Math.max(1, Math.round(NV * fase(t, 0, .85))), r = Array.from({ length: n }, (_, i) => i + 1);
    g += camino([[X(0), Y(0)], ...r.map(i => [X(i), Y(ED(i))])], "tin p");
    g += camino([[X(0), Y(0)], ...r.map(i => [X(i), Y(DT[i - 1])])], "lin");
    g += camino([[X(0), Y(0)], ...r.map(i => [X(i), Y(DC[i - 1])])], "lac");
    const op = fase(t, .82, 1), xe = X(n) + 6;
    if (op) g += `<g opacity="${f(op, 2)}">` + txt(xe, Y(DC[n - 1]) - 4, `cifrado ${DC[n - 1]}`, "ac") + txt(xe, Y(ED(n)) + 12, `azar ${ED(n).toFixed(1)}`, "t") + txt(xe, Y(DT[n - 1]) + 4, `texto ${DT[n - 1]}`) + "</g>";
    g += `<circle cx="${f(X(n))}" cy="${f(Y(DC[n - 1]))}" r="3.5" class="acf"><title>Cifrado: ${DC[n - 1]} valores distintos en ${n} bytes; esperado con bytes uniformes: ${ED(n).toFixed(1)}</title></circle>`;
    return g;
  }

  /* ---- Paso 6 · capa 2: distancia de unicidad U = H(K)/D. ---- */
  function unicidad(W, H, t) {
    const caja = { x: M + 34, y: M + 22, w: W - 2 * M - 34 - 10, h: H - M - 22 - ABAJO - 14 };
    const { X, Y } = ejes(caja, { x0: 0, x1: 8, y0: 0, y1: 240 });
    let g = txt(M, M + 12, "U (bytes) ≈ H(K) / D, con H(K) = 112.91 bits", "r") + txt(W - M, M + 12, "ilustrativo", "", "end");
    [0, 120, 240].forEach(v => (g += linea(caja.x, Y(v), caja.x + caja.w, Y(v), v ? "rej" : "eje") + txt(caja.x - 5, Y(v) + 4, v, "", "end")));
    [0, 2, 4, 6, 8].forEach(v => (g += txt(X(v), caja.y + caja.h + 14, v, "", v ? v === 8 ? "end" : "middle" : "start")));
    g += txt(caja.x + caja.w, caja.y + caja.h + 28, "redundancia D (bits por byte)", "", "end");
    const U = D => 112.91 / D, pts = [];
    for (let q = 0; q <= 120; q++) { const D = .47 + (8 - .47) * q / 120; pts.push([X(D), Y(U(D))]); }
    g += camino(pts.slice(0, Math.max(2, Math.round(121 * fase(t, 0, .35)))), "lin");
    const t2 = fase(t, .35, 1);
    if (t2 > 0) {
      g += `<circle cx="${f(X(6))}" cy="${f(Y(U(6)))}" r="4" class="tinf"><title>Texto sin comprimir, D ≈ 6: U ≈ ${U(6).toFixed(0)} bytes</title></circle>` + txt(X(6), Y(U(6)) - 10, `sin comprimir: U ≈ ${U(6).toFixed(0)} B`, "t", "middle");
      const D = 6 - 4.8 * fase(t2, .15, 1), x = X(D), y = Y(U(D));
      g += `<circle cx="${f(x)}" cy="${f(y)}" r="5" class="acf"><title>D = ${D.toFixed(2)}: U ≈ ${U(D).toFixed(0)} bytes</title></circle>`;
      if (t2 > .15) g += txt(x + 9, y + 4, `comprimir: D = ${D.toFixed(1)}, U ≈ ${U(D).toFixed(0)} B`, "ac");
    }
    return g;
  }

  /* ---- Paso 7 · capa 1: estado interno frente a espacio de claves (en bits). ---- */
  function estado(W, H, t) {
    return barrasH(W, H, t, {
      titulo: "longitudes en bits", max: 256, ticks: [0, 64, 128, 192, 256],
      lista: [
        { lab: "estado (x₁, r₁, x₂, r₂)", v: 256, val: "256", cls: "gris", tit: "Cuatro float64: 256 bits de estado", sobre: { v: 112.91, lab: "entropía ≤ 112.91", tit: "Entropía del estado ≤ H(K) ≤ 112.91 bits" } },
        { lab: "K en memoria", v: 144, val: "144", cls: "gris", tit: "x0 y r en float64 y N en 16 bits: 144 bits" },
        { lab: "claves válidas: H(K) ≤", v: 112.91, val: "112.91", cls: "acf", tit: "2^112.91 claves válidas" },
        { lab: "solo r₁ ∈ [3.99, 4)", v: 44.36, val: "44.4", cls: "gris", tit: "0.01 × 2^51 ≈ 2^44.4 valores float64 distintos" },
      ],
    });
  }

  /* ---- Paso 7 · capa 2: reutilizar la clave. c ⊕ c′ = m ⊕ m′. ---- */
  const MA = new TextEncoder().encode("cita el lunes 10"), MB = new TextEncoder().encode("cita el jueves 9");
  function reuso(W, H, t) {
    const n = 16, CA = MA.map((b, j) => b ^ K[j]), CBx = MB.map((b, j) => b ^ K[j]), X2 = CA.map((b, j) => b ^ CBx[j]);
    const bajo = H < 300;
    const L = bajo ? ["cab", "fila", "fila", "fila", "fila", "fila", "cab"] : ["cab", "fila", "fila", "hueco", "fila", "fila", "hueco", "fila", "cab"];
    const iy = bajo ? [1, 2, 3, 4, 5, 6] : [1, 2, 4, 5, 7, 8];
    const { s, x0, ys, hc, xL } = rejilla(W, H, L, { lw: 40, cols: n, max: 32 });
    const X = j => x0 + j * s, fs = Math.min(12, s * .42);
    const t1 = fase(t, 0, .22), t2 = fase(t, .25, .55), t3 = fase(t, .6, .92), t4 = fase(t, .9, 1);
    let g = txt(xL, ys[0] + hc - 4, bajo ? "misma K, dos mensajes (valores de ejemplo)" : "dos mensajes con la misma K (valores de ejemplo)", "r");
    const celda = (j, y, cls, letra, op, tit, tcls = "t", ruido = null) => {
      if (op <= 0) return "";
      return `<g opacity="${f(op, 2)}"><rect x="${f(X(j) + 1)}" y="${f(y + 1)}" width="${f(s - 2)}" height="${f(s - 2)}" rx="3" class="${cls}"/>` +
        (ruido != null ? `<rect x="${f(X(j) + 1)}" y="${f(y + 1)}" width="${f(s - 2)}" height="${f(s - 2)}" rx="3" class="gris" opacity="${f(.12 + .5 * ruido / 255, 2)}"/>` : "") +
        (s >= 13 ? `<text x="${f(X(j) + s / 2)}" y="${f(y + s / 2 + fs * .36)}" text-anchor="middle" class="${tcls}" style="font-size:${f(fs)}px">${letra}</text>` : "") + `<title>${esc(tit)}</title></g>`;
    };
    const ch = b => (b === 32 ? "␣" : esc(String.fromCharCode(b)));
    [[MA, "m"], [MB, "m′"]].forEach(([mm, lab], q) => {
      const y = ys[iy[q]];
      g += txt(xL, y + s * .7, lab, "t");
      for (let j = 0; j < n; j++) g += celda(j, y, "caja", ch(mm[j]), fase(t1, j / 22 + q * .2, j / 22 + q * .2 + .2), `${lab}, byte ${j + 1}: «${String.fromCharCode(mm[j])}» = ${hx(mm[j])}`);
    });
    [[CA, "c"], [CBx, "c′"]].forEach(([cc, lab], q) => {
      const y = ys[iy[2 + q]];
      g += txt(xL, y + s * .7, lab, "t");
      for (let j = 0; j < n; j++) g += celda(j, y, "caja", s >= 20 ? hx(cc[j]) : "", fase(t2, j / 22 + q * .15, j / 22 + q * .15 + .2), `${lab}, byte ${j + 1} = ${hx(cc[j])} (k${j + 1} = ${hx(K[j])})`, "t", cc[j]);
    });
    const yx = ys[iy[4]];
    g += txt(xL, yx + s * .7, "c ⊕ c′", "t", "start", `style="font-size:${chico(W) ? 10 : 11}px"`);
    for (let j = 0; j < n; j++) g += celda(j, yx, X2[j] ? "caja" : "acf", s >= 20 ? hx(X2[j]) : "", fase(t3, j / 20, j / 20 + .2), `c ⊕ c′, byte ${j + 1} = ${hx(X2[j])} = m ⊕ m′${X2[j] ? "" : ": las letras coinciden"}`, X2[j] ? "t" : "d1");
    const ceros = [...X2].filter(x => !x).length;
    g += txt(xL, ys[iy[5]] + hc - 2, bajo ? "k se cancela: c ⊕ c′ = m ⊕ m′" : `k se cancela: c ⊕ c′ = m ⊕ m′ (${ceros} ceros donde las letras coinciden)`, "r ac", "start", `opacity="${f(t4, 2)}"`);
    return g;
  }

  const CAPAS = {
    "flujo-1": [sincrono, 3600, "Un bit invertido en el cifrado altera un bit; un bit perdido desordena todo lo que sigue"],
    "flujo-2": [sesgo, 3200, "Frecuencia de unos de las dos secuencias y de su XOR al crecer el número de bits"],
    "cifrar-1": [conocido, 3000, "Con c y la longitud conocida se obtienen los 16 primeros bits del flujo"],
    "descifrar-1": [maleable, 3200, "Invertir un bit del cifrado invierte el mismo bit del mensaje"],
    "porque-1": [vernam, 2600, "Número de claves frente a número de mensajes, en escala logarítmica"],
    "porque-2": [distinguidor, 3000, "Ventaja del distinguidor por sesgo según el número de bits observados"],
    "histograma-1": [distintos, 3000, "Valores de byte distintos del texto, del cifrado y del azar"],
    "histograma-2": [unicidad, 3200, "Distancia de unicidad frente a la redundancia, ilustrativo"],
    "dos-1": [estado, 2800, "Bits del estado interno frente a los de la clave"],
    "dos-2": [reuso, 3400, "Dos mensajes cifrados con la misma clave: el flujo se cancela"],
  };
  let limpiar = () => {};
  return (nombre, k, vista) => {
    limpiar(); limpiar = () => {};
    if (!k || !vista) return;
    const c = CAPAS[`${nombre}-${k}`];
    if (!c) return;
    limpiar = capaSVG(vista, { pintar: c[0], ms: c[1], etiqueta: c[2], acento: "ciph" });
  };
}
