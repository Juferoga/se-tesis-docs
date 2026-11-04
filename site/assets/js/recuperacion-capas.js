// Animaciones de las capas de detalle de la etapa 6 (el receptor). Datos reales de la clave del caso,
// calculados con window.Modelo; los ejemplos de juguete van rotulados «valores de ejemplo».
import { el, globo, tramo, lerp, fmtN, W } from "./capas-rsp.js";

const Mo = window.Modelo;
const bitsDe = bytes => Array.from(bytes).flatMap(b => [...Mo.bin8(b)].map(Number));
const txt = (p, x, y, s, cls = "", extra = {}) => el("text", { x, y, class: cls, ...extra }, p, s);
// Texto con subíndice: base y sub (p. ej. A con f)
const conSub = (p, x, y, base, sub, cls = "", extra = {}) => { const t = el("text", { x, y, class: cls, ...extra }, p, base); el("tspan", { "baseline-shift": "sub", "font-size": "70%" }, t, sub); return t; };
const sup = e => String(e).replace("-", "⁻").replace(/\d/g, ch => "⁰¹²³⁴⁵⁶⁷⁸⁹"[ch]);
const cient = v => { const e = Math.floor(Math.log10(v)); return `${(v / 10 ** e).toFixed(1)} × 10${sup(e)}`; };

// Para la capa del SHA-256: dos textos que difieren en un solo bit (l = 0x6C, m = 0x6D).
const T1 = "El texto recuperado es idéntico al original", T2 = T1.slice(0, -1) + "m";
const sha256 = async s => bitsDe(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))));
const [H1, H2] = await Promise.all([sha256(T1), sha256(T2)]);

export function capasRecuperacion({ d, pos, fl, W16, K16, M, L }) {
  return {
    /* Paso 2 · Derivación determinista: los 8 bloques de 64 bits, el corrimiento de 11 bits y los seis valores */
    "2-1": ({ svg }) => {
      const usos = [["x⁽¹⁾", d.x1, 0], ["r⁽¹⁾", d.r1, 1], ["x⁽²⁾", d.x2, 0], ["r⁽²⁾", d.r2, 1], ["xp", d.xp, 0], ["rp", d.rp, 1]];
      txt(svg, 20, 24, "SHA-512(enc K): 8 bloques de 64 bits", "t-m");
      const c = 4.6, x0 = 52, y0 = 40, dy = 20;
      const filas = d.bloques.map((b, f) => {
        const g = el("g", {}, svg), bits = bitsDe(b), usa = f < 6;
        txt(g, 20, y0 + f * dy + 9, "H" + (f + 1), "t-m t-mono");
        const altos = el("g", {}, g), bajos = el("g", {}, g);
        bits.forEach((v, j) => el("rect", { x: x0 + j * c, y: y0 + f * dy, width: c - 0.8, height: 11, rx: 1,
          class: v ? (usa && j < 53 ? "acento" : "gris") : "suave", opacity: v ? 1 : 0.9 }, j < 53 ? altos : bajos));
        const val = usa ? txt(g, 360, y0 + f * dy + 10, `u${f + 1} = ${d.u[f].toFixed(6)}`, "t-mono") : txt(g, 360, y0 + f * dy + 10, "no se usa", "t-m");
        globo(g, usa ? `H${f + 1} = ${Mo.hex(b)}\n⌊H${f + 1} / 2¹¹⌋ / 2⁵³ = ${d.u[f]}\n${usos[f][0]} = ${usos[f][1]}` : `H${f + 1} = ${Mo.hex(b)} (no se usa)`);
        return { g, bajos, val, usa };
      });
      // Ejes de destino: x en [0.001, 0.999] y r en [3.99, 4]
      const ax = 40, bx = 440, yx = 250, yr = 318;
      const eje = (y, a, b, rot) => { el("line", { x1: ax, y1: y, x2: bx, y2: y, class: "eje" }, svg); txt(svg, ax, y + 18, a, "t-m t-mono"); txt(svg, bx, y + 18, b, "t-m t-mono", { "text-anchor": "end" }); txt(svg, ax, y - 28, rot, "t-m"); };
      eje(yx, "0.001", "0.999", "x = 0.001 + 0.998·u");
      eje(yr, "3.99", "4", "r = 3.99 + 0.01·u   (rp: 0.0099·u)");
      const puntos = usos.map(([n, v, esR], k) => {
        const u = esR ? (v - 3.99) / 0.01 : (v - 0.001) / 0.998, x = lerp(ax, bx, u), y = esR ? yr : yx;
        const g = el("g", {}, svg);
        el("circle", { cx: x, cy: y, r: 4.5, class: "acento" }, g);
        txt(g, x, y - 9 - (k % 4 > 1 ? 11 : 0), n, "t-a", { "text-anchor": x > 400 ? "end" : x < 80 ? "start" : "middle", "font-size": 12 });
        globo(g, `${n} = ${v}`);
        return { g, y, f: k };
      });
      return { ms: 3200, cuadro(u) {
        filas.forEach((r, f) => {
          r.g.setAttribute("opacity", tramo(u, f * 0.03, f * 0.03 + 0.08));
          const s = r.usa ? tramo(u, 0.32, 0.52) : 0;
          r.bajos.setAttribute("transform", `translate(${s * 40} 0)`); r.bajos.setAttribute("opacity", 1 - s);
          r.val.setAttribute("opacity", r.usa ? tramo(u, 0.48 + f * 0.03, 0.56 + f * 0.03) : tramo(u, 0.3, 0.4));
        });
        puntos.forEach(p => { const t = tramo(u, 0.64 + p.f * 0.05, 0.74 + p.f * 0.05); p.g.setAttribute("opacity", t); p.g.setAttribute("transform", `translate(0 ${(1 - t) * -30})`); });
      } };
    },

    /* Paso 5 · Posiciones sin reemplazo: las 1400 posiciones reales caen en el audio y llenan el histograma por décimos */
    "5-1": ({ svg }) => {
      const a = 40, b = 440, ya = 64, base = 300, alto = 190, cols = 10, ancho = (b - a) / cols;
      txt(svg, a, 28, `Audio: ${fmtN(M)} muestras`, "t-m");
      el("rect", { x: a, y: ya - 20, width: b - a, height: 40, rx: 6, class: "suave", opacity: 0.6 }, svg);
      const marcas = el("path", { class: "trazo-a", "stroke-width": 1.6, "stroke-linecap": "round", opacity: 0.7 }, svg);
      const xDe = p => a + (b - a) * p / M;
      const segs = pos.P.map((p, i) => `M${xDe(p).toFixed(2)} ${(ya - 16 + ((i * 0.6180339887) % 1) * 32).toFixed(2)}h0.01`);
      const dec = new Array(cols).fill(0);
      const decil = pos.P.map(p => Math.min(cols - 1, Math.floor(p * cols / M)));
      // Densidad arcoseno esperada por décimo: L·(2/π)(asin√b − asin√a)
      const esp = Array.from({ length: cols }, (_, k) => L * 2 / Math.PI * (Math.asin(Math.sqrt((k + 1) / cols)) - Math.asin(Math.sqrt(k / cols))));
      const escala = alto / 300;
      el("line", { x1: a, y1: base, x2: b, y2: base, class: "eje" }, svg);
      const barras = dec.map((_, k) => {
        const g = el("g", {}, svg);
        const r = el("rect", { x: a + k * ancho + 3, width: ancho - 6, y: base, height: 0, class: k === 0 || k === cols - 1 ? "acento" : "gris", opacity: k === 0 || k === cols - 1 ? 0.85 : 0.45 }, g);
        const t = txt(g, a + (k + 0.5) * ancho, base - 6, "", k === 0 || k === cols - 1 ? "t-a" : "t-m", { "text-anchor": "middle", "font-size": 12 });
        return { g, r, t };
      });
      const curva = el("path", { class: "trazo-g discont", d: esp.map((v, k) => `${k ? "L" : "M"}${a + k * ancho + 3} ${base - v * escala}H${a + (k + 1) * ancho - 3}`).join("") }, svg);
      globo(curva, "Arcoseno esperada por décimo: " + esp.map(v => v.toFixed(0)).join(", "));
      txt(svg, a, base + 22, "inicio", "t-m"); txt(svg, b, base + 22, "fin del audio", "t-m", { "text-anchor": "end" });
      txt(svg, (a + b) / 2, base + 22, "posiciones por décimo · – – arcoseno", "t-m", { "text-anchor": "middle" });
      const desc = txt(svg, b, 28, "", "t-m", { "text-anchor": "end" });
      return { ms: 3400, cuadro(u) {
        const n = Math.round(L * tramo(u, 0.05, 0.9));
        marcas.setAttribute("d", segs.slice(0, n).join(""));
        dec.fill(0); for (let i = 0; i < n; i++) dec[decil[i]]++;
        barras.forEach((r, k) => { const h = dec[k] * escala; r.r.setAttribute("y", base - h); r.r.setAttribute("height", h); r.t.setAttribute("y", base - h - 5); r.t.textContent = n ? dec[k] : ""; globo(r.g, `Décimo ${k + 1}: ${dec[k]} posiciones (arcoseno: ${esp[k].toFixed(0)})`); });
        curva.setAttribute("opacity", tramo(u, 0.85, 1));
        desc.textContent = `${n} de ${L} · repetidas: ${n === L ? pos.iter - L : "…"}`;
      } };
    },

    /* Paso 6 · Corrección: la cabecera real recorre E_K y D_K; cada pieza se cancela con su inversa */
    "6-1": ({ svg }) => {
      const xs = [80, 190, 300], yE = 70, yD = 290, xa = 418;
      const caja = (x, y, s, sb, sp, info) => { const g = el("g", {}, svg); el("rect", { x: x - 42, y: y - 20, width: 84, height: 40, rx: 9, class: "suave" }, g); const t = conSub(g, x, y + 6, s, sb, "", { "text-anchor": "middle", "font-size": 17 }); if (sp) el("tspan", { "baseline-shift": "super", "font-size": "70%", dx: -4 }, t, sp); globo(g, info); return g; };
      txt(svg, 20, 28, "emisor", "t-m"); txt(svg, 20, 340, "receptor", "t-m");
      const cE = [caja(xs[0], yE, "A", "f", "", "Codificación aritmética con las frecuencias f"), caja(xs[1], yE, "X", "k", "", "XOR con el flujo de clave k = G(K)"), caja(xs[2], yE, "I", "P", "", "Inserción en las posiciones P(K, M)")];
      const cD = [caja(xs[0], yD, "A", "f", "−1", "Decodificación con las mismas f"), caja(xs[1], yD, "X", "k", "", "XOR con el mismo flujo de clave"), caja(xs[2], yD, "R", "P", "", "Lectura del último bit en las mismas posiciones")];
      const aud = el("g", {}, svg); el("rect", { x: xa - 34, y: 150, width: 68, height: 60, rx: 9, class: "suave" }, aud);
      for (let i = 0; i < 16; i++) el("line", { x1: xa - 26 + i * 3.4, x2: xa - 26 + i * 3.4, y1: 180 - 8 - 6 * Math.sin(i), y2: 180 + 8 + 6 * Math.cos(i * 1.3), class: "trazo-g", "stroke-width": 1.2 }, aud);
      txt(aud, xa, 228, "s′", "t-m", { "text-anchor": "middle" }); globo(aud, "Estegoaudio: los 16 bits van en el último bit de 16 muestras");
      const ruta = `M20 ${yE}H${xa}V${yD}H20`;
      el("path", { d: ruta, class: "linea" }, svg);
      [...cE, ...cD, aud].forEach(g => svg.append(g));
      const guia = el("path", { d: ruta, fill: "none", stroke: "none" }, svg), largo = guia.getTotalLength();
      const punto = el("circle", { r: 6, class: "acento" }, svg);
      // Tira de 16 bits en el centro: muestra lo que viaja en cada tramo
      const etapas = [["texto", null], ["m: longitud 173 = 0x00AD", bitsDe([0x00, 0xAD])], ["c = m ⊕ k", W16], ["c en el LSB de 16 muestras", W16], ["c leído", W16], ["c ⊕ k = m", bitsDe([0x00, 0xAD])], ["texto", null]];  // el último tramo devuelve el texto
      const rot = txt(svg, 210, 150, "", "t-m", { "text-anchor": "middle" }), chip = txt(svg, 210, 180, "", "t-a", { "text-anchor": "middle", "font-size": 17 });
      const celdas = Array.from({ length: 16 }, (_, i) => { const g = el("g", {}, svg); const r = el("rect", { x: 98 + i * 14 + (i > 7 ? 4 : 0), y: 162, width: 12, height: 22, rx: 2 }, g); const t = txt(g, 104 + i * 14 + (i > 7 ? 4 : 0), 178, "", "t-mono", { "text-anchor": "middle", "font-size": 11 }); return { r, t }; });
      // Pares inversos: líneas verticales «= id» que se cierran de adentro hacia afuera
      const pares = [2, 1, 0].map(k => { const g = el("g", {}, svg); el("line", { x1: xs[k], y1: yE + 22, x2: xs[k], y2: 132, class: "trazo-a discont" }, g); el("line", { x1: xs[k], y1: 200, x2: xs[k], y2: yD - 22, class: "trazo-a discont" }, g); txt(g, xs[k] + 6, yD - 34, "= id", "t-a", { "font-size": 12 }); return g; });
      // Hitos de la ruta (largo recorrido) en que cambia lo que viaja: salida de cada caja y llegada al audio
      const hitos = [0, xs[0] + 42 - 20, xs[1] + 42 - 20, xs[2] + 42 - 20, 2 * (xa - 20) + (yD - yE) - (xa - xs[2] + 42), 2 * (xa - 20) + (yD - yE) - (xa - xs[1] + 42), 2 * (xa - 20) + (yD - yE) - (xa - xs[0] + 42)];
      return { ms: 4000, cuadro(u) {
        const s = tramo(u, 0, 0.78), p = guia.getPointAtLength(s * largo);
        punto.setAttribute("cx", p.x); punto.setAttribute("cy", p.y); punto.setAttribute("opacity", u >= 1 ? 0 : 1);
        let e = 0; for (let k = 1; k < hitos.length; k++) if (s * largo >= hitos[k]) e = k;
        const [nom, bits] = etapas[e];
        rot.textContent = bits ? nom : ""; chip.textContent = bits ? "" : e === 6 ? (u >= 1 ? "texto idéntico al original" : "texto") : "texto";
        celdas.forEach((c, i) => { const v = bits ? bits[i] : null; c.r.setAttribute("class", v == null ? "suave" : v ? (e === 2 || e === 3 || e === 4 ? "gris" : "acento") : "suave"); c.r.setAttribute("opacity", bits ? 1 : 0); c.t.textContent = v == null ? "" : v; c.t.setAttribute("fill", v ? "var(--surface)" : "var(--muted)"); });
        pares.forEach((g, k) => g.setAttribute("opacity", tramo(u, 0.8 + k * 0.06, 0.86 + k * 0.06)));
        [...cE, ...cD].forEach(g => g.setAttribute("opacity", 1));
      } };
    },

    /* Paso 7 · Regla de decodificación: el valor c elige el token cuyo tramo de frecuencias contiene el índice */
    "7-1": ({ svg }) => {
      const toks = ["el", "sol", "de", "mar"], f = [7, 5, 3, 1], F = 16, Fv = [0, 7, 12, 15], c = 703;
      // Tres decisiones con enteros (valores de ejemplo, sin renormalizar)
      const pasos = []; let l = 0, R = 1000;
      for (let k = 0; k < 3; k++) {
        const idx = Math.floor(((c - l + 1) * F - 1) / R), v = Fv.findIndex((a, j) => a <= idx && idx < a + f[j]);
        const nl = l + Math.floor(R * Fv[v] / F), nR = Math.floor(R * (Fv[v] + f[v]) / F) - Math.floor(R * Fv[v] / F);
        pasos.push({ l, R, idx, v, nl, nR }); l = nl; R = nR;
      }
      const a = 40, b = 440, y1 = 86, y2 = 196, hb = 30;
      txt(svg, a, 26, "valores de ejemplo: F = 16, c = 703, sin renormalizar", "t-m");
      txt(svg, a, y1 - 12, "intervalo [l, l + R)", "t-m"); txt(svg, a, y2 - 12, "frecuencias acumuladas [0, F)", "t-m");
      const est = txt(svg, b, y1 - 12, "", "t-m t-mono", { "text-anchor": "end" });
      const clip = el("clipPath", { id: "rec-c71" }, el("defs", {}, svg)); el("rect", { x: a, y: y1, width: b - a, height: hb }, clip);
      const zona = el("g", { "clip-path": "url(#rec-c71)" }, svg);
      const tramos1 = toks.map((t, j) => { const g = el("g", {}, zona); const r = el("rect", { y: y1, height: hb, class: "suave" }, g); const s = txt(g, 0, y1 + 20, t, "", { "text-anchor": "middle", "font-size": 13 }); return { g, r, s }; });
      const tramos2 = toks.map((t, j) => { const g = el("g", {}, svg); const x = lerp(a, b, Fv[j] / F), w = (b - a) * f[j] / F; const r = el("rect", { x: x + 1, y: y2, width: w - 2, height: hb, class: "suave" }, g); txt(g, x + w / 2, y2 + 20, t, "", { "text-anchor": "middle", "font-size": 13 }); if (x < b - 30) txt(g, x + 2, y2 + hb + 14, Fv[j], "t-m t-mono"); globo(g, `${t}: F_v = ${Fv[j]}, f_v = ${f[j]}`); return { r }; });
      txt(svg, b, y2 + hb + 14, F, "t-m t-mono", { "text-anchor": "end" });
      const etC = txt(svg, 0, y1 + hb + 26, "c", "t-a", { "text-anchor": "middle", "font-size": 12 });
      const marcaC = el("path", { class: "acento" }, svg), marcaI = el("path", { class: "acento" }, svg), enlace = el("line", { class: "trazo-a discont" }, svg);
      const formula = txt(svg, (a + b) / 2, y2 + 66, "", "t-mono", { "text-anchor": "middle", "font-size": 12.5 });
      txt(svg, a, 300, "decodificado:", "t-m");
      const salida = txt(svg, a + 92, 300, "", "t-a", { "font-size": 16 });
      const ponerVentana = (lo, R0, ventLo, ventR, paso) => tramos1.forEach((t, j) => {
        const x = a + (b - a) * ((lo + Math.floor(R0 * Fv[j] / F)) - ventLo) / ventR, x2 = a + (b - a) * ((lo + Math.floor(R0 * (Fv[j] + f[j]) / F)) - ventLo) / ventR;
        t.r.setAttribute("x", x + 1); t.r.setAttribute("width", Math.max(0, x2 - x - 2)); t.s.setAttribute("x", (x + x2) / 2);
        t.r.setAttribute("class", paso && paso.v === j ? "acento-s" : "suave");
      });
      return { ms: 4200, cuadro(u) {
        const k = Math.min(2, Math.floor(u * 3)), t = u >= 1 ? 1 : u * 3 - k, P = pasos[k];
        // Durante el acercamiento (no en la última decisión), la ventana pasa de [l, l + R) al tramo elegido
        const zoom = k < 2 ? tramo(t, 0.62, 0.95) : 0, elegido = t >= 0.36 || u >= 1;
        const vx = lerp(P.l, P.nl, zoom), vr = lerp(P.R, P.nR, zoom);
        ponerVentana(P.l, P.R, vx, vr, elegido ? P : null);
        tramos2.forEach((r, j) => r.r.setAttribute("class", elegido && P.v === j ? "acento-s" : "suave"));
        const xc = a + (b - a) * (c - vx) / vr, xi = lerp(a, b, (P.idx + 0.5) / F), tm = tramo(t, 0.05, 0.3);
        marcaC.setAttribute("d", `M${xc} ${y1 + hb + 2}l-6 10h12z`); marcaC.setAttribute("opacity", tm); etC.setAttribute("x", xc - 12); etC.setAttribute("opacity", tm);
        marcaI.setAttribute("d", `M${xi} ${y2 - 2}l-6 -10h12z`); marcaI.setAttribute("opacity", tramo(t, 0.2, 0.36));
        enlace.setAttribute("x1", xc); enlace.setAttribute("y1", y1 + hb + 12); enlace.setAttribute("x2", xi); enlace.setAttribute("y2", y2 - 12);
        enlace.setAttribute("opacity", tramo(t, 0.15, 0.3) * (1 - zoom));
        est.textContent = `l = ${P.l}, R = ${P.R}`;
        formula.textContent = `⌊((c − l + 1)·F − 1) / R⌋ = ⌊(${c - P.l + 1}·16 − 1) / ${P.R}⌋ = ${P.idx}`;
        formula.setAttribute("opacity", tramo(t, 0.15, 0.3));
        salida.textContent = pasos.slice(0, k + (elegido ? 1 : 0)).map(p => toks[p.v]).join(" ");
      } };
    },

    /* Paso 7 · Determinismo: la suma no asociativa en float32 y un piso que salta con un cambio diminuto de p */
    "7-2": ({ svg }) => {
      const f32 = Math.fround, A = f32(f32(f32(1e8) + 1) - f32(1e8)), B = f32(f32(f32(1e8) - f32(1e8)) + 1);
      txt(svg, 30, 28, "float32", "t-m");
      const ex1 = txt(svg, 30, 58, "(10⁸ + 1) − 10⁸ = ", "", { "font-size": 16 }), r1 = txt(svg, 200, 58, String(A), "t-g");
      const ex2 = txt(svg, 250, 58, "(10⁸ − 10⁸) + 1 = ", "", { "font-size": 16 }), r2 = txt(svg, 420, 58, String(B), "t-g", { class: "t-g t-a" });
      r2.setAttribute("style", "fill: var(--key)");
      globo(r1, "En float32, 10⁸ + 1 se redondea a 10⁸ (la separación entre float32 junto a 10⁸ es 8)");
      // Regla con marcas cada 1/(2^24 − V): f_v = ⌊p_v (2^24 − V)⌋ + 1 salta al cruzar una marca
      const a = 50, b = 430, y = 160, n = 6, paso = (b - a) / n;
      const tp = conSub(svg, 30, 112, "p", "v", "t-m"); el("tspan", {}, tp, " en una regla con pasos de 1/(2²⁴ − V) ≈ 6.0 × 10⁻⁸ (ilustrativo)");
      el("line", { x1: a, y1: y, x2: b, y2: y, class: "eje" }, svg);
      for (let k = 0; k <= n; k++) el("line", { x1: a + k * paso, y1: y - 8, x2: a + k * paso, y2: y + 8, class: "eje" }, svg);
      const xm = a + 3 * paso;
      const pC = el("g", {}, svg), pG = el("g", {}, svg);
      el("circle", { r: 6, class: "gris" }, pC); txt(pC, -4, -14, "CPU", "t-m", { "text-anchor": "end" }); const fC = txt(pC, -4, 30, "", "t-mono", { "text-anchor": "end" });
      el("circle", { r: 6, class: "acento" }, pG); txt(pG, 4, -14, "GPU", "t-a", { "font-size": 12 }); const fG = txt(pG, 4, 30, "", "t-mono t-a");
      globo(pC, "p calculada en CPU"); globo(pG, "p calculada en GPU: difiere en los últimos bits");
      // Longitud del mensaje comprimido en cada equipo (bytes reales del artículo)
      const yb = 262, x0 = 150, esc = 290 / 174;
      txt(svg, 30, 236, "mensaje comprimido del poema", "t-m");
      const bC = el("rect", { x: x0, y: yb, height: 16, rx: 3, class: "gris", opacity: 0.6 }, svg), bG = el("rect", { x: x0, y: yb + 30, height: 16, rx: 3, class: "acento" }, svg);
      txt(svg, 30, yb + 13, "CPU · 173 bytes", "t-mono"); txt(svg, 30, yb + 43, "GPU · 174 bytes", "t-mono t-a");
      return { ms: 3600, cuadro(u) {
        ex1.setAttribute("opacity", tramo(u, 0, 0.1)); r1.setAttribute("opacity", tramo(u, 0.1, 0.18));
        ex2.setAttribute("opacity", tramo(u, 0.15, 0.25)); r2.setAttribute("opacity", tramo(u, 0.25, 0.33));
        const s = tramo(u, 0.38, 0.62), xc = xm - 14, xg = lerp(xm - 14, xm + 14, s);
        pC.setAttribute("transform", `translate(${xc} ${y})`); pG.setAttribute("transform", `translate(${xg} ${y - 0})`);
        pC.setAttribute("opacity", tramo(u, 0.34, 0.4)); pG.setAttribute("opacity", tramo(u, 0.34, 0.4));
        fC.textContent = "f"; fG.textContent = xg > xm ? "f + 1" : "f";
        const w = tramo(u, 0.68, 0.95);
        bC.setAttribute("width", 173 * esc * w); bG.setAttribute("width", 174 * esc * w);
      } };
    },

    /* Paso 8 · SHA-256: un bit distinto en el texto cambia cerca de la mitad de los 256 bits del resumen */
    "8-1": ({ svg }) => {
      const c = 8.6, gx = [30, 175, 320], gy = 70;
      const titulos = ["SHA-256(m)", "SHA-256(m̂)", "bits distintos"];
      titulos.forEach((t, k) => txt(svg, gx[k], gy - 12, t, k === 2 ? "t-a" : "t-m", { "font-size": 12.5 }));
      txt(svg, 30, 28, `m̂: «…original» → «…originam» (1 bit distinto)`, "t-m");
      const dif = H1.map((v, i) => v ^ H2[i]), total = dif.reduce((s, v) => s + v, 0);
      const celdas = [H1, H2, dif].map((bits, k) => bits.map((v, i) => el("rect", { x: gx[k] + (i % 16) * c, y: gy + Math.floor(i / 16) * c, width: c - 1.2, height: c - 1.2, rx: 1, class: v ? (k === 2 ? "acento" : "gris") : "suave", opacity: v && k < 2 ? 0.75 : 1 }, svg)));
      const cuenta = txt(svg, 30, 250, "", "t-g");
      txt(svg, 30, 276, "de 256 bits cambian con un solo bit distinto en el texto", "t-m");
      const prob = txt(svg, 30, 318, "coincidir por azar si m̂ ≠ m:  2⁻²⁵⁶", "", { "font-size": 16 });
      globo(cuenta, `SHA-256 calculado en tu navegador: ${total} de 256 bits distintos`);
      return { ms: 3000, cuadro(u) {
        const n = Math.round(256 * tramo(u, 0, 0.45)), m = Math.round(256 * tramo(u, 0.45, 0.8));
        celdas[0].forEach((r, i) => r.setAttribute("visibility", i < n ? "visible" : "hidden"));
        celdas[1].forEach((r, i) => r.setAttribute("visibility", i < n ? "visible" : "hidden"));
        celdas[2].forEach((r, i) => r.setAttribute("visibility", i < m ? "visible" : "hidden"));
        cuenta.textContent = dif.slice(0, m).reduce((s, v) => s + v, 0);
        prob.setAttribute("opacity", tramo(u, 0.85, 1));
      } };
    },

    /* Paso 10 · Costo computacional: escala logarítmica, 294 pasadas de la red frente a las etapas lineales */
    "10-1": ({ svg }) => {
      const P = 1.54e9, Q1 = 294, lin = 2 * (d.N + 8 * 175) + d.Np + pos.iter, a = 60, b = 440;
      const ejeLog = (y, e0, e1, rot) => {
        el("line", { x1: a, y1: y, x2: b, y2: y, class: "eje" }, svg);
        for (let e = e0; e <= e1; e++) { const x = lerp(a, b, (e - e0) / (e1 - e0)); el("line", { x1: x, y1: y, x2: x, y2: y + 5, class: "eje" }, svg); if ((e - e0) % (e1 - e0 > 8 ? 3 : 1) === 0) txt(svg, x, y + 18, `10${sup(e)}`, "t-m", { "text-anchor": "middle", "font-size": 11 }); }
        txt(svg, a - 40, y - 62, rot, "t-m");
        return v => lerp(a, b, (Math.log10(v) - e0) / (e1 - e0));
      };
      const xO = ejeLog(140, 0, 12, "operaciones (orden de magnitud)"), xT = ejeLog(300, -2, 3, "tiempo medido (s)");
      const barra = (y, cls) => el("rect", { x: a, y, height: 14, rx: 3, class: cls }, svg);
      const bRed = barra(96, "acento"), bLin = barra(116, "gris"), tRed = barra(256, "acento"), tLin = barra(276, "gris");
      [bLin, tLin].forEach(r => r.setAttribute("opacity", 0.6));
      const lRed = txt(svg, a + 8, 108, "", "t-mono", { style: "fill: var(--bg)" }), lLin = txt(svg, 0, 128, "", "t-mono");
      const sRed = txt(svg, a + 8, 268, "110.06 s con la red", "t-mono", { style: "fill: var(--bg)" }), sLin = txt(svg, 0, 288, "0.073 s sin red", "t-mono");
      globo(bRed, "2P(Q + 1) ≈ 9.1 × 10¹¹ con P = 1.54 × 10⁹ y 294 símbolos");
      globo(bLin, `Lineal: unas ${fmtN(lin)} iteraciones del mapa logístico y ${L} lecturas`);
      const cont = txt(svg, b, 40, "", "t-m", { "text-anchor": "end" });
      return { ms: 3400, cuadro(u) {
        const t = Math.max(1, Math.round(Q1 * tramo(u, 0.05, 0.6))), ops = 2 * P * t;
        const s = tramo(u, 0.05, 0.6);
        bRed.setAttribute("width", Math.max(0, xO(ops) - a)); lRed.textContent = s ? cient(ops) : "";
        const wl = tramo(u, 0.1, 0.4); bLin.setAttribute("width", (xO(lin + L) - a) * wl); lLin.setAttribute("x", a + (xO(lin + L) - a) * wl + 6); lLin.textContent = wl ? "≈ " + cient(lin + L) : "";
        cont.textContent = `pasadas de la red: ${t} de ${Q1}`;
        const w2 = tramo(u, 0.62, 0.95);
        tRed.setAttribute("width", (xT(110.06) - a) * w2); tLin.setAttribute("width", (xT(0.073) - a) * w2);
        sLin.setAttribute("x", a + (xT(0.073) - a) * w2 + 6);
        sRed.setAttribute("opacity", tramo(u, 0.9, 1)); sLin.setAttribute("opacity", tramo(u, 0.9, 1));
      } };
    },
  };
}
