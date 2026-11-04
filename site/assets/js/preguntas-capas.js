// Animaciones de las «Respuesta formal» de las preguntas frecuentes: versiones compactas y propias de cada
// respuesta. Datos reales con window.Modelo; los ejemplos de juguete van rotulados.
import { el, globo, tramo, lerp, fmtN } from "./capas-rsp.js";

const Mo = window.Modelo, C = Mo.CASO;
const txt = (p, x, y, s, cls = "", extra = {}) => el("text", { x, y, class: cls, ...extra }, p, s);
const sup = e => String(e).replace("-", "⁻").replace(/\d/g, ch => "⁰¹²³⁴⁵⁶⁷⁸⁹"[ch]).replace(".", "·");
const conSub = (p, x, y, base, sub, cls = "", extra = {}) => { const t = el("text", { x, y, class: cls, ...extra }, p, base); el("tspan", { "baseline-shift": "sub", "font-size": "70%" }, t, sub); return t; };

const d = await Mo.derivar(C.x0, C.r, C.N);
const K5 = 5, d5 = await Mo.derivar(C.x0, C.r, C.N + K5);
const fl = Mo.flujo(d, 2);
const pos = Mo.posiciones(d, 1400, C.M);
// Valores de u cercanos a 1 con b(u) = 3.99 + 0.01·u = 4.0 exactamente en float64
let n392 = 0; for (let k = 2 ** 53 - 1; 3.99 + 0.01 * (k / 2 ** 53) === 4; k--) n392++;

export function capasPreguntas() {
  return {
    /* 1 · Una capa del Transformer: flujo residual, 12 cabezas de consulta sobre 2 de clave y valor, y sus parámetros */
    "1-1": ({ svg }) => {
      const y = 92, a = 30, b = 450;
      txt(svg, a, 26, "una de las 28 capas (dimensión 1536)", "t-m");
      el("line", { x1: a, y1: y, x2: b, y2: y, class: "linea", "stroke-width": 3 }, svg);
      const bloque = (x, w, s, info) => { const g = el("g", {}, svg); el("path", { d: `M${x} ${y}V${y - 30}M${x + w} ${y - 30}V${y}`, class: "linea" }, g); el("rect", { x, y: y - 52, width: w, height: 26, rx: 6, class: "suave" }, g); txt(g, x + w / 2, y - 34, s, "", { "text-anchor": "middle", "font-size": 12.5 }); el("circle", { cx: x + w, cy: y, r: 7, class: "suave" }, g); txt(g, x + w, y + 4, "+", "", { "text-anchor": "middle", "font-size": 12 }); globo(g, info); return g; };
      bloque(70, 150, "RMSNorm → atención", "H = X + Attn(RMSNorm(X))");
      bloque(260, 170, "RMSNorm → FFN", "Y = H + FFN(RMSNorm(H)), FFN(h) = W₂(SiLU(W₁h) ⊙ W₃h)");
      // Consultas agrupadas: 12 cabezas de consulta comparten 2 de clave y valor
      const cab = el("g", {}, svg);
      for (let q = 0; q < 12; q++) { const x = 72 + q * 12 + (q > 5 ? 6 : 0); el("rect", { x, y: 120, width: 9, height: 9, rx: 2, class: "acento", opacity: 0.85 }, cab); el("line", { x1: x + 4.5, y1: 129, x2: q > 5 ? 182 : 104, y2: 150, class: "trazo-g", "stroke-width": 0.8 }, cab); }
      [104, 182].forEach(x => el("rect", { x: x - 7, y: 150, width: 14, height: 12, rx: 2, class: "gris" }, cab));
      txt(cab, 72, 180, "12 consultas · 2 clave/valor", "t-m", { "font-size": 11.5 });
      globo(cab, "Atención con consultas agrupadas: 12 cabezas de consulta de dimensión 128, 2 cabezas de clave y valor");
      const ffn = el("g", {}, svg); [[275, 6], [345, 30], [415, 6]].forEach(([x, h]) => el("rect", { x: x - 6, y: 150 - h, width: 12, height: 2 * h, rx: 2, class: "gris", opacity: 0.6 }, ffn));
      txt(ffn, 345, 196, "1536 → 8960 → 1536", "t-m", { "text-anchor": "middle", "font-size": 11.5 });
      const punto = el("circle", { r: 5.5, cy: y, class: "acento" }, svg);
      // Parámetros por capa (barras a escala) y total
      const P = [["atención", 5507072], ["red prealimentada", 41287680], ["normalización", 3072]], esc = 400 / 41287680;
      const barras = P.map(([n, v], k) => { const g = el("g", {}, svg), yy = 222 + k * 26; const r = el("rect", { x: a, y: yy, height: 14, rx: 3, class: k === 1 ? "acento" : "gris", opacity: k === 1 ? 1 : 0.6 }, g); const t = txt(g, a, yy + 11, "", "t-mono", { "font-size": 11.5 }); globo(g, `${n}: ${fmtN(v)} parámetros por capa`); return { r, t, v, n }; });
      const tot = txt(svg, a, 334, "", "t-mono", { "font-size": 12.5 });
      const T = 28 * (5507072 + 41287680 + 3072) + 151936 * 1536 + 1536;
      return { ms: 3600, cuadro(u) {
        const s = tramo(u, 0, 0.35); punto.setAttribute("cx", lerp(a, b, s)); punto.setAttribute("opacity", s > 0 && s < 1 ? 1 : 0);
        barras.forEach((x, k) => { const t = tramo(u, 0.35 + k * 0.08, 0.55 + k * 0.08), w = Math.max(1, x.v * esc * t); x.r.setAttribute("width", w); x.t.setAttribute("x", k === 1 ? a + 6 : a + w + 6); x.t.setAttribute("style", k === 1 ? "fill: var(--bg)" : ""); x.t.textContent = t ? `${x.n} ${fmtN(Math.round(x.v * t))}` : ""; });
        const t2 = tramo(u, 0.75, 1);
        tot.textContent = t2 ? `28 capas + embeddings atados = ${fmtN(Math.round(T * t2))} ≈ 1.54 × 10⁹` : "";
      } };
    },

    /* 2 · Intervalos anidados: W_t = W_{t−1}·p, y ℓ = ⌈I⌉ + 1 (valores de ejemplo) */
    "2-1": ({ svg }) => {
      const p = [0.5, 0.3, 0.2], elige = [1, 0, 2, 0], a = 40, b = 372, h = 24, dy = 62, y0 = 44;
      txt(svg, a, 26, "valores de ejemplo: p = 0.5, 0.3, 0.2 en cada paso", "t-m");
      let W = 1; const filas = [];
      for (let k = 0; k <= elige.length; k++) {
        const g = el("g", {}, svg), y = y0 + k * dy;
        if (k < elige.length) {
          let acc = 0; p.forEach((q, j) => { const x = lerp(a, b, acc), w = (b - a) * q; acc += q; el("rect", { x: x + 1, y, width: w - 2, height: h, rx: 3, class: j === elige[k] ? "acento-s" : "suave" }, g); txt(g, x + w / 2, y + 16, q, j === elige[k] ? "t-a" : "t-m", { "text-anchor": "middle", "font-size": 11.5 }); });
          const c0 = p.slice(0, elige[k]).reduce((s, v) => s + v, 0), c1 = c0 + p[elige[k]];
          el("path", { d: `M${lerp(a, b, c0)} ${y + h}L${a} ${y + dy}M${lerp(a, b, c1)} ${y + h}L${b} ${y + dy}`, class: "trazo-a discont", "stroke-width": 1, opacity: 0.6 }, g);
        } else el("rect", { x: a, y, width: b - a, height: h, rx: 3, class: "acento", opacity: 0.85 }, g);
        txt(g, b + 10, y + 16, `W = ${+W.toPrecision(3)}`, "t-mono", { "font-size": 11 });
        filas.push(g); if (k < elige.length) W *= p[elige[k]];
      }
      const I = -Math.log2(W), l = Math.ceil(I) + 1;
      const fin = txt(svg, a, 340, `I = −log₂ W = ${I.toFixed(2)} Sh  →  ℓ = ⌈I⌉ + 1 = ${l} bits < I + 2`, "t-a", { "font-size": 13.5 });
      return { ms: 3200, cuadro(u) {
        filas.forEach((g, k) => { const t = tramo(u, k * 0.17, k * 0.17 + 0.14); g.setAttribute("opacity", t); g.setAttribute("transform", `translate(0 ${(1 - t) * -10})`); });
        fin.setAttribute("opacity", tramo(u, 0.88, 1));
      } };
    },

    /* 3 · Bits comunes que se escriben y renormalización l ← 2l − b, h ← 2h − b (valores de ejemplo) */
    "3-1": ({ svg }) => {
      const l0 = 177 / 256, h0 = 183 / 256, a = 40, b = 440, y = 120;
      txt(svg, a, 26, "valores de ejemplo: l = 0.10110001₂, h = 0.10110111₂", "t-m");
      el("line", { x1: a, y1: y, x2: b, y2: y, class: "eje" }, svg);
      [0, 0.25, 0.5, 0.75, 1].forEach(v => { el("line", { x1: lerp(a, b, v), y1: y - 4, x2: lerp(a, b, v), y2: y + 4, class: "eje" }, svg); txt(svg, lerp(a, b, v), y + 20, v, "t-m t-mono", { "text-anchor": "middle", "font-size": 11 }); });
      const banda = el("rect", { y: y - 14, height: 28, rx: 4, class: "acento", opacity: 0.35 }, svg);
      const bl = txt(svg, a, 200, "", "t-mono", { "font-size": 15 }), bh = txt(svg, a, 224, "", "t-mono", { "font-size": 15 });
      txt(svg, a - 6, 200, "l", "t-m", { "text-anchor": "end" }); txt(svg, a - 6, 224, "h", "t-m", { "text-anchor": "end" }); txt(svg, a, 176, "en binario", "t-m", { "font-size": 11.5 });
      txt(svg, a, 272, "mensaje comprimido", "t-m");
      const sal = txt(svg, a, 300, "", "t-mono t-a", { "font-size": 20 });
      const anchoT = txt(svg, b, 60, "", "t-mono", { "text-anchor": "end", "font-size": 12 });
      const bin = (x, n) => { let s = "0."; for (let i = 0; i < n; i++) { x *= 2; const bt = Math.floor(x); s += bt; x -= bt; } return s; };
      // Estados: tras escribir k bits comunes
      const est = []; let l = l0, h = h0, bits = "";
      for (let k = 0; k <= 5; k++) { est.push({ l, h, bits }); const bt = Math.floor(2 * l); bits += bt; l = 2 * l - bt; h = 2 * h - bt; }
      return { ms: 3600, cuadro(u) {
        const x = 5 * tramo(u, 0.1, 0.9), k = Math.floor(x), f = x - k, A = est[k], B = est[Math.min(5, k + 1)];
        const lv = k < 5 ? lerp(A.l, B.l, f) : A.l, hv = k < 5 ? lerp(A.h, B.h, f) : A.h;
        banda.setAttribute("x", lerp(a, b, lv)); banda.setAttribute("width", (b - a) * (hv - lv));
        const E = est[Math.round(x)];
        bl.textContent = bin(E.l, 8 - Math.round(x) + 3); bh.textContent = bin(E.h, 8 - Math.round(x) + 3);
        sal.textContent = E.bits || "·";
        anchoT.textContent = `h − l = ${(E.h - E.l).toFixed(4)}`;
      } };
    },

    /* 4 · Costo de cuantizar p en f_v = ⌊p_v(2^24 − V)⌋ + 1: log2(p/q) frente a la cota 0.0131 Sh */
    "4-1": ({ svg }) => {
      const T = 2 ** 24, V = 151936, cota = -Math.log2(1 - V / T);
      const a = 70, b = 450, y0 = 290, y1 = 50, l0 = -8, l1 = 0, v0 = -0.06, v1 = 0.02;
      const X = l => lerp(a, b, (l - l0) / (l1 - l0)), Y = v => lerp(y0, y1, (v - v0) / (v1 - v0));
      el("line", { x1: a, y1: Y(0), x2: b, y2: Y(0), class: "eje" }, svg); el("line", { x1: a, y1: y0, x2: a, y2: y1, class: "eje" }, svg);
      [-8, -6, -4, -2, 0].forEach(l => txt(svg, X(l), y0 + 16, l ? "10" + sup(l) : "1", "t-m", { "text-anchor": "middle", "font-size": 11 }));
      [-0.06, -0.04, -0.02, 0, 0.02].forEach(v => txt(svg, a - 6, Y(v) + 4, v, "t-m t-mono", { "text-anchor": "end", "font-size": 10.5 }));
      txt(svg, a, 30, "log₂(p/q) en Sh, con q = f/2²⁴", "t-m"); txt(svg, b, y0 + 34, "probabilidad p del token", "t-m", { "text-anchor": "end" });
      const lc = el("line", { x1: a, y1: Y(cota), x2: b, y2: Y(cota), class: "trazo-a discont" }, svg);
      const tc = txt(svg, a + 8, Y(cota) - 8, `cota −log₂(1 − V/2²⁴) ≈ ${cota.toFixed(4)} Sh`, "t-a", { "font-size": 12 });
      const curva = el("path", { class: "trazo-g", "stroke-width": 1.2 }, svg), clip = el("clipPath", { id: "pre-c41" }, el("defs", {}, svg));
      el("rect", { x: a, y: y1, width: b - a, height: y0 - y1 }, clip); curva.setAttribute("clip-path", "url(#pre-c41)");
      const pts = []; for (let i = 0; i <= 700; i++) { const l = l0 + (l1 - l0) * i / 700, p = 10 ** l, q = (Math.floor(p * (T - V)) + 1) / T; pts.push([X(l), Y(Math.max(v0 - 0.01, Math.log2(p / q)))]); }
      txt(svg, b, Y(-0.03), "el + 1 favorece a los tokens improbables", "t-m", { "font-size": 11.5, "text-anchor": "end" });
      const pie = txt(svg, a, 340, `294 símbolos × ${cota.toFixed(4)} ≈ ${(294 * cota).toFixed(1)} Sh, de 1384 bits`, "", { "font-size": 13.5 });
      globo(curva, "q = (⌊p(2²⁴ − V)⌋ + 1) / 2²⁴, suponiendo que las frecuencias suman 2²⁴");
      return { ms: 3000, cuadro(u) {
        const n = Math.round(pts.length * tramo(u, 0, 0.7));
        curva.setAttribute("d", pts.slice(0, n).map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(""));
        lc.setAttribute("opacity", tramo(u, 0.6, 0.75)); tc.setAttribute("opacity", tramo(u, 0.65, 0.8)); pie.setAttribute("opacity", tramo(u, 0.85, 1));
      } };
    },

    /* 5 · Información acumulada: la suma de −log2 p crece con pendiente Ĥ ≈ 4.71 Sh por token */
    "5-1": ({ svg }) => {
      const Q1 = 294, H = 1384 / Q1; let s = 7; const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
      const info = Array.from({ length: Q1 }, () => -H * Math.log(1 - azar())), esc = 1384 / info.reduce((x, v) => x + v, 0);
      const I = []; info.reduce((acc, v, k) => (I[k] = acc + v * esc), 0);
      const a = 60, b = 450, y0 = 250, y1 = 50, X = t => lerp(a, b, t / Q1), Y = v => lerp(y0, y1, v / 1400);
      txt(svg, a, 30, "informaciones de ejemplo con la media real 1384/294 Sh", "t-m");
      el("line", { x1: a, y1: y0, x2: b, y2: y0, class: "eje" }, svg); el("line", { x1: a, y1: y0, x2: a, y2: y1, class: "eje" }, svg);
      [0, 700, 1384].forEach(v => txt(svg, a - 6, Y(v) + 4, v, "t-m t-mono", { "text-anchor": "end", "font-size": 10.5 }));
      [0, 147, 294].forEach(t => txt(svg, X(t), y0 + 15, t, "t-m t-mono", { "text-anchor": "middle", "font-size": 10.5 }));
      txt(svg, b, y0 + 32, "token t", "t-m", { "text-anchor": "end" });
      el("line", { x1: X(0), y1: Y(0), x2: X(Q1), y2: Y(1384), class: "trazo-g discont" }, svg);
      const curva = el("path", { class: "trazo-a", "stroke-width": 1.6 }, svg), barras = el("path", { class: "trazo-g", "stroke-width": 1, opacity: 0.6 }, svg);
      const cont = txt(svg, a + 8, y1 + 8, "", "t-mono t-a");
      const pie = txt(svg, a, 316, `Ĥ = ${H.toFixed(2)} Sh/token · perplejidad 2^Ĥ ≈ ${2 ** H < 100 ? Math.round(2 ** H) : ""} · ${(1384 / 901).toFixed(2)} bits/carácter`, "", { "font-size": 13 });
      pie.textContent = `Ĥ = ${H.toFixed(2)} Sh/token · perplejidad ≈ ${Math.round(2 ** H)} · ${(1384 / 901).toFixed(2)} bits/carácter`;
      globo(curva, "Información acumulada Σ −log₂ p(xₜ | x<ₜ) en Sh");
      return { ms: 3200, cuadro(u) {
        const n = Math.round(Q1 * tramo(u, 0, 0.82));
        let dd = `M${X(0)} ${Y(0)}`, db = ""; for (let t = 0; t < n; t++) { dd += `H${X(t + 1).toFixed(1)}V${Y(I[t]).toFixed(1)}`; db += `M${X(t + 0.5).toFixed(1)} ${y0}v${(-info[t] * esc * 4).toFixed(1)}`; }
        curva.setAttribute("d", dd); barras.setAttribute("d", db);
        cont.textContent = n ? `${n} tokens · ${(n ? I[n - 1] : 0).toFixed(1)} Sh` : "";
        pie.setAttribute("opacity", tramo(u, 0.85, 1));
      } };
    },

    /* 6 · De los 8 bloques del resumen a los seis valores; H7 y H8 no se usan */
    "6-1": ({ svg }) => {
      const nom = ["x⁽¹⁾ = a(u₁)", "r⁽¹⁾ = b(u₂)", "x⁽²⁾ = a(u₃)", "r⁽²⁾ = b(u₄)", "xp = a(u₅)", "rp = b′(u₆)"], val = [d.x1, d.r1, d.x2, d.r2, d.xp, d.rp];
      txt(svg, 30, 26, "SHA-512(enc(x0, r, N)) con la clave del caso", "t-m");
      const filas = d.bloques.map((bl, k) => {
        const g = el("g", {}, svg), y = 44 + k * 30, usa = k < 6;
        el("rect", { x: 30, y, width: 150, height: 22, rx: 4, class: usa ? "suave" : "suave", opacity: usa ? 1 : 0.5 }, g);
        txt(g, 38, y + 15, `H${k + 1} ${Mo.hex(bl).slice(0, 12)}…`, usa ? "t-mono" : "t-mono t-m", { "font-size": 11 });
        if (usa) { el("line", { x1: 184, y1: y + 11, x2: 236, y2: y + 11, class: "trazo-g" }, g); txt(g, 244, y + 15, nom[k], "", { "font-size": 12.5 }); txt(g, 450, y + 15, val[k].toFixed(6), "t-mono t-a", { "text-anchor": "end" }); }
        else txt(g, 192, y + 15, "no se usa", "t-m");
        globo(g, usa ? `${nom[k]} = ${val[k]}` : `H${k + 1} no se usa`); return g;
      });
      const pie = el("g", {}, svg);
      txt(pie, 30, 300, "a(u) = 0.001 + 0.998u · b(u) = 3.99 + 0.01u · b′(u) = 3.99 + 0.0099u", "t-m", { "font-size": 11.5 });
      txt(pie, 30, 326, `${n392} valores de u junto a 1 dan b(u) = 4.0 exacto (contados en tu navegador)`, "t-a", { "font-size": 12 });
      return { ms: 2600, cuadro(u) {
        filas.forEach((g, k) => { const t = tramo(u, k * 0.08, k * 0.08 + 0.15); g.setAttribute("opacity", t); g.setAttribute("transform", `translate(${(1 - t) * -14} 0)`); });
        pie.setAttribute("opacity", tramo(u, 0.8, 1));
      } };
    },

    /* 7 · El flujo de clave como composición G = β ∘ Φ ∘ g ∘ SHA-512 ∘ enc; solo K es secreta */
    "7-1": ({ svg }) => {
      const etapas = [
        ["K", `(${C.x0}, ${C.r}, ${C.N})`, "clave secreta"],
        ["enc", Mo.hex(d.input).slice(0, 24) + "…", "18 bytes"],
        ["SHA-512", Mo.hex(d.hash).slice(0, 24) + "…", "512 bits"],
        ["g", `x⁽¹⁾ = ${d.x1.toFixed(6)} …`, "seis valores"],
        ["Φ", `${fl.s1[0].toFixed(4)}, ${fl.s1[1].toFixed(4)}, ${fl.s1[2].toFixed(4)} …`, "dos secuencias"],
        ["β", Array.from(fl.bits.slice(0, 16)).join(""), "flujo de clave"],
      ];
      txt(svg, 30, 24, "solo K es secreta; el resto es público (Kerckhoffs)", "t-m");
      el("line", { x1: 70, y1: 52, x2: 70, y2: 52 + 5 * 52, class: "linea", "stroke-width": 2 }, svg);
      const filas = etapas.map(([n, v, r], k) => {
        const g = el("g", {}, svg), y = 52 + k * 52;
        el("rect", { x: 30, y: y - 16, width: 80, height: 32, rx: 8, class: k === 0 ? "acento" : "suave" }, g);
        txt(g, 70, y + 5, n, "", { "text-anchor": "middle", "font-size": 14, style: k === 0 ? "fill: var(--bg)" : "" });
        txt(g, 126, y - 1, v, k === 5 ? "t-mono t-a" : "t-mono", { "font-size": 12 }); txt(g, 126, y + 15, r, "t-m", { "font-size": 11 });
        globo(g, `${n}: ${r}`); return g;
      });
      const punto = el("circle", { cx: 70, r: 5, class: "acento" }, svg);
      return { ms: 3000, cuadro(u) {
        const s = tramo(u, 0, 0.9); punto.setAttribute("cy", 52 + s * 5 * 52); punto.setAttribute("opacity", u < 1 ? 1 : 0);
        filas.forEach((g, k) => g.setAttribute("opacity", k === 0 ? 1 : tramo(s * 5, k - 0.6, k)));
      } };
    },

    /* 8 · Toda secuencia en float64 termina en un ciclo: lo que se usa frente a los periodos medidos */
    "8-1": ({ svg }) => {
      txt(svg, 30, 26, "forma ilustrativa: cola y ciclo de una secuencia en float64", "t-m");
      const ruta = el("path", { d: "M40 130 C 90 128, 140 120, 190 110 C 230 100, 250 70, 300 60 C 360 48, 420 80, 420 120 C 420 165, 360 180, 310 170 C 260 160, 230 130, 190 110", class: "trazo-g" }, svg);
      const lar = ruta.getTotalLength(); ruta.setAttribute("stroke-dasharray", lar);
      const uso = el("circle", { cx: 40, cy: 130, r: 5, class: "acento" }, svg); txt(svg, 40, 152, "x₀", "t-m");
      // Barras logarítmicas: iteraciones usadas frente a la longitud del ciclo (algoritmo de Brent)
      const S = [["cifrado 1", C.N + 1400, 9213816], ["cifrado 2", C.N + 1400, 2774760], ["posiciones", d.Np + pos.iter, 3494724]];
      const a = 120, b = 450, X = v => lerp(a, b, (Math.log10(v) - 3) / 4);
      [3, 4, 5, 6, 7].forEach(e => { el("line", { x1: X(10 ** e), y1: 216, x2: X(10 ** e), y2: 320, class: "eje", opacity: 0.3 }, svg); txt(svg, X(10 ** e), 336, "10" + sup(e), "t-m", { "text-anchor": "middle", "font-size": 11 }); });
      const filas = S.map(([n, us, ci], k) => { const g = el("g", {}, svg), y = 222 + k * 32; txt(g, 30, y + 13, n, "t-m", { "font-size": 12 });
        const rc = el("rect", { x: a, y, height: 10, rx: 2, class: "gris", opacity: 0.5 }, g), ru = el("rect", { x: a, y: y + 12, height: 6, rx: 2, class: "acento" }, g);
        globo(g, `${n}: se usan ${fmtN(us)} iteraciones; ciclo de ${fmtN(ci)}`); return { rc, ru, us, ci }; });
      txt(svg, 30, 206, "gris: ciclo medido · azul: iteraciones usadas", "t-m", { "font-size": 11.5 });
      return { ms: 3200, cuadro(u) {
        ruta.setAttribute("stroke-dashoffset", lar * (1 - tramo(u, 0, 0.45)));
        const t = tramo(u, 0.45, 0.95);
        filas.forEach(f => { f.rc.setAttribute("width", (X(f.ci) - a) * t); f.ru.setAttribute("width", Math.max(0, (X(f.us) - a) * t)); });
      } };
    },

    /* 9 · Sesgo de cada secuencia binarizada y de su XOR (frecuencias medidas en 5 × 10⁷ iteraciones) */
    "9-1": ({ svg }) => {
      const a = 40, b = 440, v0 = 49.5, v1 = 53, X = v => lerp(a, b, (v - v0) / (v1 - v0));
      txt(svg, a, 26, "porcentaje de unos, medido en 5 × 10⁷ iteraciones", "t-m");
      txt(svg, X(50), 268, "50 %", "t-m", { "text-anchor": "middle", "font-size": 11 }); txt(svg, X(53), 268, "53 %", "t-m", { "text-anchor": "middle", "font-size": 11 });
      const F = [["cifrado 1 (r = 3.99178)", 52.78], ["cifrado 2 (r = 3.99848)", 51.22], ["XOR de las dos", 50 - 0.078]];
      const bars = F.map(([n, v], k) => { const g = el("g", {}, svg), y = 62 + k * 64; txt(g, a, y, n, "", { "font-size": 12.5 });
        el("line", { x1: X(50), y1: y + 4, x2: X(50), y2: y + 34, class: "trazo-g" }, g);
        const r = el("rect", { y: y + 10, height: 18, rx: 3, class: k === 2 ? "acento" : "gris", opacity: k === 2 ? 1 : 0.6 }, g), t = txt(g, 0, y + 24, "", k === 2 ? "t-mono t-a" : "t-mono", { "font-size": 12 });
        globo(g, `${n}: ${v.toFixed(3)} % de unos`); return { r, t, v, k }; });
      const pred = el("g", {}, svg); el("line", { x1: X(50 - 0.068), y1: 190, x2: X(50 - 0.068), y2: 222, class: "trazo-a discont" }, pred);
      txt(pred, X(50 - 0.068) + 6, 236, "lema: ½ − 2ε₁ε₂ = ½ − 0.00068", "t-a", { "font-size": 11.5 });
      const pie = txt(svg, a, 310, "detectar un sesgo ε exige del orden de 1/ε² ≈ 1.6 × 10⁶ bits", "", { "font-size": 13.5 });
      return { ms: 2800, cuadro(u) {
        bars.forEach(x => { const t = tramo(u, x.k * 0.2, x.k * 0.2 + 0.3), v = lerp(50, x.v, t), x1 = X(Math.min(50, v)), x2 = X(Math.max(50, v));
          x.r.setAttribute("x", x1); x.r.setAttribute("width", Math.max(1, x2 - x1)); x.t.setAttribute("x", x.k === 2 ? x1 - 6 : x2 + 6); x.t.setAttribute("text-anchor", x.k === 2 ? "end" : "start"); x.t.textContent = t ? `${v.toFixed(x.k === 2 ? 3 : 2)} %` : ""; });
        pred.setAttribute("opacity", tramo(u, 0.75, 0.88)); pie.setAttribute("opacity", tramo(u, 0.88, 1));
      } };
    },

    /* 10 · Las N iteraciones del transitorio se descartan; las 8n siguientes se usan */
    "10-1": ({ svg }) => {
      const a = 40, b = 440, tot = C.N + 1400, X = v => lerp(a, b, v / (d.Np + 1400));
      txt(svg, a, 26, "iteraciones de cada secuencia con la clave del caso", "t-m");
      const fila = (y, n0, nom) => { const g = el("g", {}, svg); txt(g, a, y - 8, nom, "", { "font-size": 12.5 });
        const r0 = el("rect", { x: a, y, height: 22, rx: 3, class: "gris", opacity: 0.35 }, g), r1 = el("rect", { x: X(n0), y, height: 22, rx: 3, class: "acento" }, g);
        txt(g, a + 6, y + 15, `${fmtN(n0)} descartadas`, "t-m", { "font-size": 11.5 }); const t1 = txt(g, b, y - 8, "", "t-mono t-a", { "font-size": 11.5, "text-anchor": "end" });
        globo(g, `${nom}: transitorio ${fmtN(n0)}, después 1400 valores, uno por bit`); return { r0, r1, t1, n0 }; };
      const F = [fila(70, C.N, "cifrado 1 y cifrado 2: N = 6173"), fila(150, d.Np, "posiciones: Np = N + 1000")];
      const cur = el("line", { y1: 54, y2: 182, class: "trazo-a" }, svg), cn = txt(svg, b, 46, "", "t-mono", { "text-anchor": "end", "font-size": 12 });
      // Primeras 50 iteraciones: una diferencia de 10⁻¹⁵ ya llega al orden de 1
      const Z = v => lerp(a, b, v / 100), z = el("g", {}, svg); el("rect", { x: a, y: 232, width: Z(50) - a, height: 16, class: "acento", opacity: 0.9 }, z); el("rect", { x: Z(50), y: 232, width: Z(100) - Z(50), height: 16, class: "acento-s" }, z);
      txt(z, a, 212, "primeras 100 iteraciones: 10⁻¹⁵ crece al orden de 1", "t-m", { "font-size": 11.5 }); txt(z, a, 226, "en ≈ 50 (λ ≈ 0.69), menos que N mínimo = 100", "t-m", { "font-size": 11.5 });
      [0, 50, 100].forEach(v => txt(z, Z(v), 266, v, "t-m t-mono", { "text-anchor": "middle", "font-size": 11 }));
      const pie = txt(svg, a, 316, `N + 8n = ${C.N} + 1400 = ${tot}`, "t-a", { "font-size": 15 });
      return { ms: 3200, cuadro(u) {
        const n = (d.Np + 1400) * tramo(u, 0, 0.75);
        F.forEach(f => { f.r0.setAttribute("width", Math.max(0, X(Math.min(n, f.n0)) - a)); f.r1.setAttribute("width", Math.max(0, X(Math.min(n, f.n0 + 1400)) - X(f.n0))); f.t1.textContent = n >= f.n0 + 1400 ? "1400 usadas" : ""; });
        cur.setAttribute("x1", X(n)); cur.setAttribute("x2", X(n)); cur.setAttribute("opacity", u < 1 ? 1 : 0); cn.textContent = `n = ${fmtN(Math.round(n))}`;
        z.setAttribute("opacity", tramo(u, 0.7, 0.85)); pie.setAttribute("opacity", tramo(u, 0.85, 1));
      } };
    },

    /* 11 · Suma de bits: 55.3182 + 44.3561 + 13.2734 − 0.0340 = 112.9137 */
    "11-1": ({ svg }) => {
      const a = 30, b = 450, X = v => lerp(a, b, v / 144), y = 130;
      const P = [["x0", 55.3182, 1], ["r", 44.3561, 0.75], ["N", 13.2734, 0.55]];
      el("rect", { x: a, y, width: b - a, height: 36, rx: 4, class: "linea", "stroke-dasharray": "4 3" }, svg);
      txt(svg, b, y - 10, "144 en memoria", "t-m", { "text-anchor": "end", "font-size": 11.5 });
      let acc = 0;
      const seg = P.map(([n, v, op], k) => { const g = el("g", {}, svg), x = X(acc); acc += v; const w = X(acc) - x;
        el("rect", { x: x + 0.5, y, width: w - 1, height: 36, rx: 3, class: "acento", opacity: op }, g);
        txt(g, x + w / 2, y + 23, n, "", { "text-anchor": "middle", "font-size": 13, style: "fill: var(--bg)" });
        txt(g, x + w / 2, y + 58, v.toFixed(4), "t-mono", { "text-anchor": "middle", "font-size": 11.5 }); globo(g, `${n}: ${v} bits`); return g; });
      const quita = el("g", {}, svg); txt(quita, X(112.95) + 4, y + 80, "−0.0340 (97.67 % válidas)", "t-m", { "font-size": 11, "text-anchor": "end" });
      const ref = el("g", {}, svg);
      [[100, "mínimo 2¹⁰⁰"], [46.49, "seis decimales: 2⁴⁶·⁴⁹"]].forEach(([v, s]) => { el("line", { x1: X(v), y1: y + 92, x2: X(v), y2: y + 122, class: "trazo-g discont" }, ref); txt(ref, X(v), y + 136, s, "t-m", { "text-anchor": "middle", "font-size": 11.5 }); });
      const suma = txt(svg, a, 60, "", "t-g");
      txt(svg, a, 84, "log₂|𝒦| en bits", "t-m");
      return { ms: 3000, cuadro(u) {
        seg.forEach((g, k) => { const t = tramo(u, k * 0.18, k * 0.18 + 0.2); g.setAttribute("opacity", t); g.setAttribute("transform", `translate(${(1 - t) * 20} 0)`); });
        quita.setAttribute("opacity", tramo(u, 0.6, 0.7)); ref.setAttribute("opacity", tramo(u, 0.8, 1));
        const parcial = P.reduce((s, [, v], k) => s + v * tramo(u, k * 0.18, k * 0.18 + 0.2), 0) - 0.034 * tramo(u, 0.6, 0.7);
        suma.textContent = parcial.toFixed(4);
      } };
    },

    /* 12 · Antes, N solo desplazaba la misma secuencia; con SHA-512, N y N + 5 dan secuencias sin relación */
    "12-1": ({ svg }) => {
      const n = 34, c = 11, a = 40;
      const directo = Mo.secuencia(C.x0, C.r, C.N, n + K5), sA = directo.slice(0, n), sB = directo.slice(K5, K5 + n);
      const hA = Mo.secuencia(d.x1, d.r1, d.N, n), hB = Mo.secuencia(d5.x1, d5.r1, d5.N, n + K5);
      const bit = v => (v > 0.5 ? 1 : 0);
      const cl = el("clipPath", { id: "pre-c121" }, el("defs", {}, svg)); el("rect", { x: a - 1, y: 0, width: n * c + 2, height: 360 }, cl);
      const tira = (y, vals, cls) => { const g = el("g", {}, el("g", { "clip-path": "url(#pre-c121)" }, svg)); Array.from(vals).forEach((v, i) => el("rect", { x: a + i * c, y, width: c - 1.5, height: c - 1.5, rx: 1.5, class: bit(v) ? cls : "suave", opacity: bit(v) ? 0.85 : 1 }, g)); return g; };
      txt(svg, a, 26, `antes: (x0, r, N) y (x0, r, N + ${K5}) iterando directo`, "t-m");
      tira(40, sA, "gris"); const tB = tira(58, sB, "gris");
      const cA = txt(svg, a, 96, "", "t-a", { "font-size": 12.5 });
      txt(svg, a, 166, `con SHA-512: x⁽¹⁾ de (x0, r, N) y de (x0, r, N + ${K5})`, "t-m");
      tira(180, hA, "gris"); const tD = tira(198, hB.slice(0, n), "gris");
      const cD = txt(svg, a, 236, "", "t-m", { "font-size": 12.5 });
      // Tras correr la segunda tira k lugares a la derecha, su celda j queda bajo la celda j + k de la primera
      const iguala = (X, Y, i, k) => bit(X[i]) === bit(Y[i - k]);
      const coinc = (X, Y, k) => { let s = 0; for (let i = k; i < n; i++) s += iguala(X, Y, i, k) ? 1 : 0; return s; };
      const marcas = el("g", {}, svg);
      const pie = txt(svg, a, 300, "un par (x0, r) daba todos los N recorriendo una sola secuencia", "", { "font-size": 13 });
      globo(tB, `Misma secuencia desplazada ${K5} lugares: s⁽ᴺ⁺ᵏ⁾ⱼ = s⁽ᴺ⁾ⱼ₊ₖ`);
      return { ms: 3200, cuadro(u) {
        const off = K5 * tramo(u, 0.05, 0.5), k = Math.round(off);
        tB.setAttribute("transform", `translate(${off * c} 0)`); tD.setAttribute("transform", `translate(${off * c} 0)`);
        const iguales = coinc(sA, sB, k), igH = coinc(hA, hB, k);
        cA.textContent = u > 0.5 ? `corrida ${K5} lugares: ${iguales} de ${n - K5} bits iguales, la misma secuencia` : "";
        cD.textContent = u > 0.5 ? `corrida ${K5} lugares: ${igH} de ${n - K5} iguales, como al azar` : "";
        marcas.replaceChildren(); if (u > 0.5) for (let i = K5; i < n; i++) if (iguala(sA, sB, i, K5)) el("rect", { x: a + i * c - 1, y: 38, width: c + 0.5, height: 2 * c + 7, rx: 2, fill: "none", stroke: "var(--key)", "stroke-width": 1.2, opacity: tramo(u, 0.5, 0.7) }, marcas);
        pie.setAttribute("opacity", tramo(u, 0.8, 1));
      } };
    },
  };
}
