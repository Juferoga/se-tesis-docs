// Animaciones de las capas de detalle de la etapa 7 (seguridad de la clave). Conteos exactos con la
// representación entera de float64, flujos de clave reales con window.Modelo y ejemplos rotulados.
import { el, globo, tramo, lerp, fmtN } from "./capas-rsp.js";

const Mo = window.Modelo, C = Mo.CASO;
const txt = (p, x, y, s, cls = "", extra = {}) => el("text", { x, y, class: cls, ...extra }, p, s);
const sup = e => String(e).replace("-", "⁻").replace(/\d/g, ch => "⁰¹²³⁴⁵⁶⁷⁸⁹"[ch]).replace(".", "·");
const bitsF = x => { const v = new DataView(new ArrayBuffer(8)); v.setFloat64(0, x); return v.getBigUint64(0); };
const deBits = n => { const v = new DataView(new ArrayBuffer(8)); v.setBigUint64(0, n); return v.getFloat64(0); };
const siguiente = x => deBits(bitsF(x) + 1n);

// Avalancha: flujo de clave de la clave del caso y de tres vecinas (x0 + 1 ulp, r + 1 ulp, N + 1), 175 bytes.
const NB = 175;
const flujoDe = async (x0, r, N) => Array.from(Mo.flujo(await Mo.derivar(x0, r, N), NB).bits);
const [K0, KX, KR, KN] = await Promise.all([flujoDe(C.x0, C.r, C.N), flujoDe(siguiente(C.x0), C.r, C.N), flujoDe(C.x0, siguiente(C.r), C.N), flujoDe(C.x0, C.r, C.N + 1)]);

// Mapa de bits de una letra (40 × 35) para el ejemplo de reutilizar la clave.
function letra(s) {
  const cv = document.createElement("canvas"); cv.width = 40; cv.height = 35;
  const g = cv.getContext("2d"); g.fillStyle = "#000"; g.font = "700 34px system-ui, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(s, 20, 19);
  const d = g.getImageData(0, 0, 40, 35).data;
  return Array.from({ length: 1400 }, (_, i) => (d[4 * i + 3] > 110 ? 1 : 0));
}

export function capasSeguridad() {
  return {
    /* Paso 3 · Contar float64 con enteros: la recta real frente a la recta de enteros β(x) */
    "3-1": ({ svg }) => {
      const a = 40, b = 440, yR = 92, yB = 236, lo = 0.001, hi = 0.999;
      const bA = bitsF(lo), bB = bitsF(hi), tot = bB - bA + 1n;
      const xR = x => lerp(a, b, (x - lo) / (hi - lo)), xB = x => a + (b - a) * Number(bitsF(x) - bA) / Number(bB - bA);
      txt(svg, a, yR - 30, "x0 en la recta real", "t-m"); txt(svg, a, yB + 40, "β(x0): los 64 bits leídos como entero", "t-m");
      el("line", { x1: a, y1: yR, x2: b, y2: yR, class: "eje" }, svg); el("line", { x1: a, y1: yB, x2: b, y2: yB, class: "eje" }, svg);
      [["0.001", lo], ["0.5", 0.5], ["0.999", hi]].forEach(([s, v]) => txt(svg, xR(v), yR - 10, s, "t-m t-mono", { "text-anchor": "middle" }));
      const lineas = [];
      for (let e = -9; e <= -1; e++) {
        const v = 2 ** e, g = el("g", {}, svg);
        el("line", { x1: xR(v), y1: yR, x2: xB(v), y2: yB, class: "trazo-g", "stroke-width": 1, opacity: 0.55 }, g);
        el("line", { x1: xB(v), y1: yB - 6, x2: xB(v), y2: yB + 6, class: "eje" }, g);
        txt(g, xB(v), yB + 20, "2" + sup(e), "t-m", { "text-anchor": "middle", "font-size": 10.5 });
        globo(g, `2${sup(e)} = ${v}\nβ = 0x${bitsF(v).toString(16)}\ncada binada [2ᵉ, 2ᵉ⁺¹) tiene 2⁵² valores`);
        lineas.push(g);
      }
      // Media geométrica: divide el conteo casi exactamente en dos mitades
      const gm = Math.sqrt(lo * hi), mg = el("g", {}, svg);
      el("line", { x1: xR(gm), y1: yR, x2: xB(gm), y2: yB, class: "trazo-a" }, mg);
      el("circle", { cx: xB(gm), cy: yB, r: 5, class: "acento" }, mg); el("circle", { cx: xR(gm), cy: yR, r: 4, class: "acento" }, mg);
      txt(mg, xB(gm) + 10, yB - 26, "√(0.001·0.999) ≈ 0.0316", "t-a", { "font-size": 12 }); txt(mg, xB(gm) + 10, yB - 11, "mitad del conteo a cada lado", "t-a", { "font-size": 12 });
      globo(mg, `Por debajo de 0.0316 está el ${(100 * Number(bitsF(gm) - bA) / Number(tot)).toFixed(2)} % de los float64 de x0`);
      const cuenta = txt(svg, a, 330, "", "t-mono", { "font-size": 13 });
      return { ms: 3400, cuadro(u) {
        lineas.forEach((g, k) => g.setAttribute("opacity", tramo(u, 0.05 + k * 0.06, 0.15 + k * 0.06)));
        mg.setAttribute("opacity", tramo(u, 0.72, 0.85));
        const t = tramo(u, 0.8, 1);
        cuenta.textContent = `# = β(0.999) − β(0.001) + 1 = ${fmtN((tot * BigInt(Math.round(t * 1000)) / 1000n).toString())}`;
      } };
    },

    /* Paso 4 · La ulp en cada rango: escalera de log2(ulp) por binada, de 0.001 a 4 */
    "4-1": ({ svg }) => {
      const a = 60, b = 450, y0 = 300, y1 = 50, e0 = -10, e1 = 2, u0 = -63, u1 = -50;
      const X = l => lerp(a, b, (l - e0) / (e1 - e0)), Y = l => lerp(y0, y1, (l - u0) / (u1 - u0));
      el("line", { x1: a, y1: y0, x2: b, y2: y0, class: "eje" }, svg); el("line", { x1: a, y1: y0, x2: a, y2: y1, class: "eje" }, svg);
      txt(svg, a, 30, "log₂ ulp(x)", "t-m"); txt(svg, b, y0 + 36, "x (escala log₂)", "t-m", { "text-anchor": "end" });
      [-62, -56, -53, -51].forEach(l => txt(svg, a - 6, Y(l) + 4, l, "t-m t-mono", { "text-anchor": "end", "font-size": 11 }));
      [[-10, "2⁻¹⁰"], [-5, "2⁻⁵"], [0, "1"], [2, "4"]].forEach(([l, s]) => txt(svg, X(l), y0 + 16, s, "t-m", { "text-anchor": "middle", "font-size": 11 }));
      const pasos = [];
      for (let e = e0; e < e1; e++) {
        const g = el("g", {}, svg), enX = e <= -1, enR = e === 1, l = e - 52;
        const r = el("rect", { x: X(e) + 1, y: Y(l), width: X(e + 1) - X(e) - 2, height: y0 - Y(l), class: enX || enR ? "acento" : "gris", opacity: enX ? 0.35 : enR ? 0.9 : 0.25 }, g);
        el("line", { x1: X(e), y1: Y(l), x2: X(e + 1), y2: Y(l), class: enX || enR ? "trazo-a" : "trazo-g" }, g);
        globo(g, `[2${sup(e)}, 2${sup(e + 1)}): ulp = 2${sup(l)}${enX ? " · rango de x0" : enR ? " · aquí vive r" : ""}`);
        pasos.push(g);
      }
      const ex = el("g", {}, svg); txt(ex, X(-5), Y(-56) - 46, "x0: diez binadas, ulp de 2⁻⁶² a 2⁻⁵³", "t-a", { "text-anchor": "middle", "font-size": 12 });
      const er = el("g", {}, svg); txt(er, X(1.5), Y(-51) - 12, "r: 2⁻⁵¹", "t-a", { "text-anchor": "middle", "font-size": 12 });
      el("path", { d: `M${X(Math.log2(3.99))} ${y0 + 2}l-5 9h10z`, class: "acento" }, er);
      globo(er, "r ∈ [3.99, 4): una sola binada, 0.01 · 2⁵¹ ≈ 2.25 × 10¹³ valores (44.36 bits)");
      return { ms: 3000, cuadro(u) {
        pasos.forEach((g, k) => { const t = tramo(u, k * 0.06, k * 0.06 + 0.12); g.setAttribute("opacity", t); g.setAttribute("transform", `translate(0 ${(1 - t) * 12})`); });
        ex.setAttribute("opacity", tramo(u, 0.78, 0.9)); er.setAttribute("opacity", tramo(u, 0.85, 1));
      } };
    },

    /* Paso 7 · Cardinal frente a entropía: 112.91 bits del conjunto frente a 46.49 de una clave con seis decimales */
    "7-1": ({ svg }) => {
      const a = 40, b = 440, X = v => lerp(a, b, v / 144);
      el("line", { x1: a, y1: 250, x2: b, y2: 250, class: "eje" }, svg);
      [0, 50, 100, 144].forEach(v => { el("line", { x1: X(v), y1: 250, x2: X(v), y2: 256, class: "eje" }, svg); txt(svg, X(v), 272, v, "t-m t-mono", { "text-anchor": "middle", "font-size": 11 }); });
      txt(svg, b, 292, "bits", "t-m", { "text-anchor": "end" });
      el("rect", { x: a, y: 60, width: b - a, height: 34, rx: 4, class: "linea", "stroke-dasharray": "4 3" }, svg);
      txt(svg, a, 50, "conjunto de claves válidas  ·  en memoria: 144 bits", "t-m");
      txt(svg, a, 150, "clave escrita con seis decimales", "t-m");
      const fila = (y, partes, cls) => {
        let acc = 0;
        return partes.map(([n, v, op]) => { const g = el("g", {}, svg), x = X(acc), w = X(acc + v) - x; acc += v;
          el("rect", { x: x + 0.5, y, width: Math.max(0, w - 1), height: 34, rx: 3, class: cls, opacity: op }, g);
          if (w > 34) txt(g, x + w / 2, y + 22, n, "", { "text-anchor": "middle", "font-size": 12.5, style: "fill: var(--bg)" });
          globo(g, `${n}: ${v.toFixed(2)} bits`); return { g, w }; });
      };
      const A = fila(60, [["x0", 55.32, 1], ["r", 44.36, 0.75], ["N", 13.27, 0.55]], "acento");
      const B = fila(160, [["x0", Math.log2(998001), 0.75], ["r", Math.log2(10000), 0.6], ["N", Math.log2(9901), 0.45]], "gris");
      const tA = txt(svg, X(112.91) + 8, 83, "112.91", "t-g", { style: "fill: var(--key)" }), tB = txt(svg, X(46.49) + 8, 183, "46.49", "t-g");
      const ec = txt(svg, a, 330, "H(K) ≤ log₂|𝒦| = 112.91, con igualdad solo si K es uniforme", "", { "font-size": 14 });
      return { ms: 3200, cuadro(u) {
        A.forEach((p, k) => { const t = tramo(u, k * 0.13, k * 0.13 + 0.14); p.g.setAttribute("opacity", t); p.g.setAttribute("transform", `translate(${(1 - t) * -16} 0)`); });
        B.forEach((p, k) => { const t = tramo(u, 0.45 + k * 0.1, 0.55 + k * 0.1); p.g.setAttribute("opacity", t); p.g.setAttribute("transform", `translate(${(1 - t) * -16} 0)`); });
        tA.setAttribute("opacity", tramo(u, 0.38, 0.45)); tB.setAttribute("opacity", tramo(u, 0.78, 0.86)); ec.setAttribute("opacity", tramo(u, 0.86, 1));
      } };
    },

    /* Paso 7 · Frente a los criterios: 2^112.91 frente a 2^100 (Alvarez y Li) y 2^112 (NIST); es una cota superior */
    "7-2": ({ svg }) => {
      const a = 40, b = 440, v0 = 96, v1 = 116, X = v => lerp(a, b, (v - v0) / (v1 - v0)), y = 190;
      el("line", { x1: a, y1: y, x2: b, y2: y, class: "eje" }, svg);
      for (let v = v0; v <= v1; v += 2) { el("line", { x1: X(v), y1: y, x2: X(v), y2: y + 6, class: "eje" }, svg); txt(svg, X(v), y + 22, v, "t-m t-mono", { "text-anchor": "middle", "font-size": 11 }); }
      txt(svg, b, y + 42, "log₂ del número de claves", "t-m", { "text-anchor": "end" });
      const umbral = (v, s1, s2, alto) => { const g = el("g", {}, svg); el("line", { x1: X(v), y1: y - alto, x2: X(v), y2: y, class: "trazo-g discont" }, g); txt(g, X(v) - 6, y - alto + 4, s1, "", { "text-anchor": "end", "font-size": 13 }); txt(g, X(v) - 6, y - alto + 20, s2, "t-m", { "text-anchor": "end", "font-size": 11.5 }); return g; };
      const u100 = umbral(100, "2¹⁰⁰", "Alvarez y Li, 2006", 120), u112 = umbral(112, "2¹¹²", "NIST SP 800-57", 70);
      globo(u100, "Requisito de Alvarez y Li para criptosistemas caóticos"); globo(u112, "Fuerza de seguridad mínima aceptable hoy (NIST SP 800-57)");
      const p = el("g", {}, svg); el("circle", { r: 7, class: "acento" }, p); txt(p, 10, -14, "2¹¹²·⁹¹", "t-a", { "font-size": 15 });
      globo(p, "Tamaño del espacio de clave: cota de fuerza bruta");
      const flecha = el("g", {}, svg);
      el("path", { d: `M${X(112.91)} ${y + 62}H${X(101)}`, class: "trazo-a discont" }, flecha);
      el("path", { d: `M${X(101)} ${y + 62}l8 -5v10z`, class: "acento" }, flecha);
      txt(flecha, X(112.91), y + 90, "cota superior: un atajo mejor que probar claves la bajaría", "t-m", { "text-anchor": "end", "font-size": 12 });
      return { ms: 2800, cuadro(u) {
        u100.setAttribute("opacity", tramo(u, 0, 0.15)); u112.setAttribute("opacity", tramo(u, 0.12, 0.27));
        const t = tramo(u, 0.3, 0.7); p.setAttribute("transform", `translate(${X(lerp(v0, 112.91, t))} ${y})`); p.setAttribute("opacity", tramo(u, 0.28, 0.34));
        flecha.setAttribute("opacity", tramo(u, 0.78, 0.95));
      } };
    },

    /* Paso 8 · Avalancha: bits distintos entre el flujo de la clave del caso y el de tres claves vecinas */
    "8-1": ({ svg }) => {
      const n = K0.length, c = 5, gx = 30, gy = 60;
      const dif = [KX, KR, KN].map(k => k.map((v, i) => v ^ K0[i]));
      txt(svg, gx, 40, "flujo(K) ⊕ flujo(x0 + 1 ulp): bits distintos", "t-m");
      const celdas = dif[0].map((v, i) => el("rect", { x: gx + (i % 40) * c, y: gy + Math.floor(i / 40) * c, width: c - 0.8, height: c - 0.8, class: v ? "acento" : "suave" }, svg));
      // Medidores: fracción acumulada de bits distintos en escala de 40 % a 60 %, con la banda ±2σ de una cadena al azar
      const a = 260, b = 450, X = f => lerp(a, b, (f - 0.4) / 0.2), sd = 0.5 / Math.sqrt(n);
      txt(svg, a, 40, `fracción distinta (n = ${n} bits)`, "t-m");
      const nombres = ["x0 + 1 ulp", "r + 1 ulp", "N + 1"];
      const med = nombres.map((s, k) => {
        const y = 90 + k * 64, g = el("g", {}, svg);
        txt(g, a, y - 14, s, "", { "font-size": 13 });
        el("rect", { x: X(0.5 - 2 * sd), y: y - 6, width: X(0.5 + 2 * sd) - X(0.5 - 2 * sd), height: 12, class: "suave" }, g);
        el("line", { x1: a, y1: y, x2: b, y2: y, class: "eje" }, g); el("line", { x1: X(0.5), y1: y - 9, x2: X(0.5), y2: y + 9, class: "trazo-g" }, g);
        const m = el("circle", { cy: y, r: 5.5, class: "acento" }, g), v = txt(g, b, y - 14, "", "t-mono t-a", { "text-anchor": "end" });
        const total = dif[k].reduce((s2, x) => s2 + x, 0);
        globo(g, `${s}: ${total} de ${n} bits distintos (${(100 * total / n).toFixed(2)} %)`);
        return { m, v };
      });
      [["40 %", 0.4], ["50 %", 0.5], ["60 %", 0.6]].forEach(([s, f]) => txt(svg, X(f), 250, s, "t-m", { "text-anchor": "middle", "font-size": 11 }));
      txt(svg, a, 272, "banda: ±2σ de dos cadenas al azar", "t-m", { "font-size": 11.5 });
      txt(svg, gx, 270, "clave del caso; promedios en 200 claves:", "t-m", { "font-size": 12 });
      txt(svg, gx, 290, "49.93 %, 50.05 % y 50.11 %", "", { "font-size": 13 });
      return { ms: 3400, cuadro(u) {
        const k = Math.max(1, Math.round(n * tramo(u, 0.02, 0.9)));
        celdas.forEach((r, i) => r.setAttribute("visibility", i < k ? "visible" : "hidden"));
        med.forEach((mm, j) => { let s = 0; for (let i = 0; i < k; i++) s += dif[j][i]; const f = s / k; mm.m.setAttribute("cx", X(Math.max(0.4, Math.min(0.6, f)))); mm.v.textContent = `${(100 * f).toFixed(2)} %`; });
      } };
    },

    /* Paso 9 · Fuerza bruta frente a Grover, con 1024 claves (ilustrativo) */
    "9-1": ({ svg }) => {
      const N = 1024, obj = 511, c = 5, gx = 30, gy = 60, th = Math.asin(1 / Math.sqrt(N)), K = Math.round(Math.PI / 4 * Math.sqrt(N));
      txt(svg, gx, 26, `ilustrativo: ${N} claves, una correcta`, "t-m");
      txt(svg, gx, 50, "búsqueda clásica", "t-m");
      const celdas = Array.from({ length: N }, (_, i) => el("rect", { x: gx + (i % 32) * c, y: gy + Math.floor(i / 32) * c, width: c - 0.8, height: c - 0.8, class: i === obj ? "acento" : "suave" }, svg));
      const cc = txt(svg, gx, gy + 32 * c + 26, "", "t-mono");
      // Grover: probabilidad de medir la clave correcta tras k iteraciones, sin²((2k + 1)θ)
      const a = 250, b = 450, y0 = 220, y1 = 64, X = k => lerp(a, b, k / K), Y = p => lerp(y0, y1, p);
      txt(svg, a, 50, "Grover: P(clave correcta)", "t-m");
      el("line", { x1: a, y1: y0, x2: b, y2: y0, class: "eje" }, svg); el("line", { x1: a, y1: y0, x2: a, y2: y1, class: "eje" }, svg);
      txt(svg, a - 4, Y(1) + 4, "1", "t-m", { "text-anchor": "end" }); txt(svg, a - 4, y0 + 4, "0", "t-m", { "text-anchor": "end" });
      const curva = el("path", { class: "trazo-a" }, svg), punto = el("circle", { r: 4.5, class: "acento" }, svg);
      const cg = txt(svg, a, gy + 32 * c + 26, "", "t-mono t-a");
      const pie = txt(svg, gx, 330, "con 2¹¹²·⁹¹ claves: 2¹¹¹·⁹¹ en promedio frente a ≈ 2⁵⁶·¹", "", { "font-size": 14 });
      return { ms: 3600, cuadro(u) {
        const t = tramo(u, 0.02, 0.88), m = Math.round(t * (obj + 1)), k = Math.round(t * K);
        celdas.forEach((r, i) => r.setAttribute("class", i === obj ? (m > obj ? "acento" : "suave") : i < m ? "gris" : "suave"));
        celdas.forEach((r, i) => r.setAttribute("opacity", i === obj ? 1 : i < m ? 0.5 : 1));
        cc.textContent = `${m} evaluaciones`;
        let d = ""; for (let j = 0; j <= k; j++) d += `${j ? "L" : "M"}${X(j).toFixed(1)} ${Y(Math.sin((2 * j + 1) * th) ** 2).toFixed(1)}`;
        curva.setAttribute("d", d); punto.setAttribute("cx", X(k)); punto.setAttribute("cy", Y(Math.sin((2 * k + 1) * th) ** 2));
        cg.textContent = `${k} iteraciones · P = ${(Math.sin((2 * k + 1) * th) ** 2).toFixed(3)}`;
        pie.setAttribute("opacity", tramo(u, 0.88, 1));
      } };
    },

    /* Paso 9 · Computacional: H(K) frente al tamaño del mensaje y lo que filtra reutilizar el flujo de clave */
    "9-2": ({ svg }) => {
      const a = 30, b = 450, X = v => lerp(a, b, v / 1400);
      txt(svg, a, 26, "secreto perfecto exige H(K) ≥ H(M)", "t-m");
      const bM = el("rect", { x: a, y: 40, height: 18, rx: 3, class: "gris", opacity: 0.4 }, svg), bK = el("rect", { x: a, y: 66, height: 18, rx: 3, class: "acento" }, svg);
      const tM = txt(svg, b, 54, "mensaje cifrado: 1400 bits", "t-mono", { "text-anchor": "end", "font-size": 12 }), tK = txt(svg, X(112.91) + 8, 80, "H(K) ≤ 112.91 Sh", "t-mono t-a", { "font-size": 12 });
      globo(bK, "La entropía de la clave es a lo sumo 112.91 Sh");
      // Reutilizar K: c1 ⊕ c2 = m1 ⊕ m2 (flujo de clave real del caso, letras de ejemplo)
      const m1 = letra("K"), m2 = letra("M"), ks = K0;
      const c1 = m1.map((v, i) => v ^ ks[i]), c2 = m2.map((v, i) => v ^ ks[i]), x = c1.map((v, i) => v ^ c2[i]);
      txt(svg, a, 128, "mismo flujo de clave en dos mensajes (letras de ejemplo)", "t-m");
      const c = 3.4, gy = 146, gx = [a, a + 150, a + 300], nom = ["c₁ = m₁ ⊕ k", "c₂ = m₂ ⊕ k", "c₁ ⊕ c₂ = m₁ ⊕ m₂"];
      const paneles = [c1, c2, x].map((bits, p) => { const g = el("g", {}, svg); bits.forEach((v, i) => { if (v) el("rect", { x: gx[p] + (i % 40) * c, y: gy + Math.floor(i / 40) * c, width: c, height: c, class: p === 2 ? "acento" : "gris", opacity: p === 2 ? 1 : 0.7 }, g); });
        el("rect", { x: gx[p] - 1, y: gy - 1, width: 40 * c + 2, height: 35 * c + 2, class: "linea", fill: "none" }, g);
        txt(g, gx[p], gy + 35 * c + 20, nom[p], p === 2 ? "t-a" : "t-m", { "font-size": 12 });
        globo(g, p === 2 ? "La XOR de los dos cifrados elimina el flujo de clave: aparecen los dos mensajes superpuestos" : "Cifrado: parece ruido"); return g; });
      return { ms: 3400, cuadro(u) {
        const t = tramo(u, 0, 0.3);
        bM.setAttribute("width", (X(1400) - a) * t); bK.setAttribute("width", (X(112.91) - a) * tramo(u, 0.1, 0.3));
        tM.setAttribute("opacity", tramo(u, 0.25, 0.32)); tK.setAttribute("opacity", tramo(u, 0.28, 0.35));
        paneles.forEach((g, p) => g.setAttribute("opacity", tramo(u, 0.4 + p * 0.18, 0.52 + p * 0.18)));
      } };
    },

    /* Paso 10 · Lyapunov: distancia entre dos secuencias que empiezan a 10⁻¹⁵ */
    "10-1": ({ svg }) => {
      const r = C.r, n = 120, lam = Mo.lyapunov(r);
      let x = C.x0, y = C.x0 + 1e-15; const ds = [];
      for (let i = 0; i <= n; i++) { ds.push(Math.max(1e-17, Math.abs(x - y))); x = r * x * (1 - x); y = r * y * (1 - y); }
      const a = 60, b = 450, y0 = 290, y1 = 50, X = i => lerp(a, b, i / n), Y = l => lerp(y0, y1, (l + 16) / 16);
      el("line", { x1: a, y1: y0, x2: b, y2: y0, class: "eje" }, svg); el("line", { x1: a, y1: y0, x2: a, y2: y1, class: "eje" }, svg);
      [-15, -10, -5, 0].forEach(l => txt(svg, a - 6, Y(l) + 4, l ? "10" + sup(l) : "1", "t-m", { "text-anchor": "end", "font-size": 11 }));
      [0, 50, 100].forEach(i => txt(svg, X(i), y0 + 16, i, "t-m t-mono", { "text-anchor": "middle", "font-size": 11 }));
      txt(svg, a, 30, "|δₙ|, distancia entre las dos secuencias", "t-m"); txt(svg, b, y0 + 34, "iteración n", "t-m", { "text-anchor": "end" });
      const ref = el("path", { class: "trazo-g discont", d: `M${X(0)} ${Y(-15)}L${X(15 * Math.LN10 / lam)} ${Y(0)}` }, svg);
      globo(ref, `δ₀ e^{λn} con λ = ${lam.toFixed(3)}`);
      const nm = el("g", {}, svg); el("line", { x1: X(100), y1: y1, x2: X(100), y2: y0, class: "trazo-g discont" }, nm); txt(nm, X(100) - 4, y0 - 8, "N mínimo = 100", "t-m", { "text-anchor": "end", "font-size": 11.5 });
      const curva = el("path", { class: "trazo-a" }, svg);
      const i1 = ds.findIndex(v => v >= 0.1), hito = el("g", {}, svg);
      el("circle", { cx: X(i1), cy: Y(Math.log10(ds[i1])), r: 5, class: "acento" }, hito);
      txt(hito, X(i1) + 8, Y(Math.log10(ds[i1])) + 22, `orden de 1 en n = ${i1}`, "t-a", { "font-size": 12.5 });
      globo(hito, `|δ| ≥ 0.1 por primera vez en la iteración ${i1} (r = ${r}, x0 = ${C.x0})`);
      txt(svg, X(60), Y(-12), `λ(${r}) ≈ ${lam.toFixed(3)} ≈ ln 2`, "t-m", { "font-size": 12 });
      return { ms: 3000, cuadro(u) {
        const k = Math.round(n * tramo(u, 0, 0.85));
        curva.setAttribute("d", ds.slice(0, k + 1).map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(Math.log10(v)).toFixed(1)}`).join(""));
        hito.setAttribute("opacity", k >= i1 ? 1 : 0); nm.setAttribute("opacity", tramo(u, 0.8, 1));
      } };
    },

    /* Paso 11 · Propagación del error (valores de ejemplo) y probabilidad de llegar intacto */
    "11-1": ({ svg }) => {
      // Información por token de ejemplo, media 4.71 Sh; el bit invertido es j = 40
      let s = 12345; const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
      const T = 24, info = Array.from({ length: T }, () => -4.71 * Math.log(1 - azar())), I = []; info.reduce((acc, v, k) => (I[k] = acc + v), 0);
      const j = 40, t0 = I.findIndex(v => v >= j);
      const a = 50, b = 450, y0 = 170, y1 = 44, X = k => lerp(a, b, k / T), Y = v => lerp(y1, y0, v / 100);
      txt(svg, a, 26, "valores de ejemplo: el bit j = 40 llega invertido", "t-m");
      el("line", { x1: a, y1: y1, x2: a, y2: y0, class: "eje" }, svg);
      txt(svg, a - 6, Y(0) + 4, "0", "t-m", { "text-anchor": "end", "font-size": 11 }); txt(svg, a - 6, Y(j) + 4, "−40", "t-a", { "text-anchor": "end", "font-size": 11 }); txt(svg, a - 6, Y(100) + 4, "−100", "t-m", { "text-anchor": "end", "font-size": 11 });
      el("line", { x1: a, y1: Y(j), x2: b, y2: Y(j), class: "trazo-a discont" }, svg);
      txt(svg, b, Y(j) - 6, "2⁻ʲ: desplazamiento del valor", "t-a", { "text-anchor": "end", "font-size": 11.5 });
      txt(svg, b, y1 + 14, "log₂ Wₜ = −Iₜ", "t-m", { "text-anchor": "end", "font-size": 11.5 });
      const curva = el("path", { class: "trazo-g" }, svg);
      const fichas = info.map((v, k) => { const g = el("g", {}, svg); el("rect", { x: X(k) + 1, y: 186, width: (b - a) / T - 2, height: 16, rx: 3 }, g); globo(g, `token ${k + 1}: ${v.toFixed(2)} Sh · acumulado ${I[k].toFixed(1)} Sh${k >= t0 ? " · erróneo" : ""}`); return g; });
      const nota = txt(svg, a, 222, `primer token erróneo: el ${t0 + 1}, cuando Iₜ llega a 40 Sh`, "t-a", { "font-size": 12.5 });
      // (1 − p)^L
      const c0 = 340, c1 = 250, px = e => lerp(a, b, (e + 6) / 4), py = v => lerp(c0, c1, v);
      el("line", { x1: a, y1: c0, x2: b, y2: c0, class: "eje" }, svg);
      [-6, -5, -4, -3, -2].forEach(e => txt(svg, px(e), c0 + 14, "10" + sup(e), "t-m", { "text-anchor": "middle", "font-size": 10.5 }));
      txt(svg, b, c1 - 4, "P(intacto) = (1 − p)¹⁴⁰⁰", "t-m", { "text-anchor": "end", "font-size": 11.5 });
      const cp = el("path", { class: "trazo-a" }, svg);
      const pt = el("g", {}, svg); el("circle", { cx: px(-3), cy: py(0.999 ** 1400), r: 4.5, class: "acento" }, pt);
      txt(pt, px(-3) + 8, py(0.999 ** 1400) - 6, `p = 10⁻³: ${(0.999 ** 1400).toFixed(2)}`, "t-a", { "font-size": 12 });
      return { ms: 3600, cuadro(u) {
        const k = Math.round(T * tramo(u, 0, 0.6));
        let d = `M${X(0)} ${Y(0)}`; for (let i = 0; i < k; i++) d += `H${X(i + 1)}V${Y(Math.min(100, I[i]))}`;
        curva.setAttribute("d", d);
        fichas.forEach((g, i) => { g.setAttribute("opacity", i < k ? 1 : 0); g.firstChild.setAttribute("class", i >= t0 ? "gris" : "acento"); g.firstChild.setAttribute("opacity", i >= t0 ? 0.3 : 0.8); });
        nota.setAttribute("opacity", k > t0 ? 1 : 0);
        const m = tramo(u, 0.62, 0.95); let d2 = "";
        for (let i = 0; i <= 80 * m; i++) { const e = -6 + 4 * i / 80; d2 += `${i ? "L" : "M"}${px(e).toFixed(1)} ${py((1 - 10 ** e) ** 1400).toFixed(1)}`; }
        cp.setAttribute("d", d2); pt.setAttribute("opacity", tramo(u, 0.9, 1));
      } };
    },

    /* Paso 12 · Canal binario simétrico: capacidad 1 − h(p) y la BER medida en cada ataque */
    "12-1": ({ svg }) => {
      const h = p => (p <= 0 || p >= 1 ? 0 : -p * Math.log2(p) - (1 - p) * Math.log2(1 - p));
      const a = 60, b = 450, y0 = 290, y1 = 50, X = p => lerp(a, b, p / 0.5), Y = c => lerp(y0, y1, c);
      el("line", { x1: a, y1: y0, x2: b, y2: y0, class: "eje" }, svg); el("line", { x1: a, y1: y0, x2: a, y2: y1, class: "eje" }, svg);
      [0, 0.1, 0.2, 0.3, 0.4, 0.5].forEach(p => txt(svg, X(p), y0 + 16, `${Math.round(p * 100)} %`, "t-m", { "text-anchor": "middle", "font-size": 11 }));
      [0, 0.5, 1].forEach(c => txt(svg, a - 6, Y(c) + 4, c, "t-m t-mono", { "text-anchor": "end", "font-size": 11 }));
      txt(svg, a, 30, "capacidad C = 1 − h(p)", "t-m"); txt(svg, b, y0 + 34, "tasa de error de bits p", "t-m", { "text-anchor": "end" });
      const curva = el("path", { class: "trazo-g" }, svg);
      const ATQ = [["Sal y pimienta 5 %", 2.14, 1], ["Sal y pimienta 10 %", 5.36], ["Sal y pimienta 25 %", 13.07], ["Oclusión 5 %", 1.79, 0, 1], ["Oclusión 10 %", 3.79, 0, 1], ["Oclusión 25 %", 7.93, 0, 1], ["SNR 90 dB", 5.86], ["SNR 80 dB", 47.5, 1]];
      const puntos = ATQ.map(([n, ber, dest, rafaga]) => { const p = ber / 100, g = el("g", {}, svg);
        el("circle", { cx: X(p), cy: Y(1 - h(p)), r: dest ? 6 : 4, class: dest ? "acento" : rafaga ? "" : "gris", fill: rafaga ? "none" : null, stroke: rafaga ? "var(--muted)" : null, "stroke-width": rafaga ? 1.4 : null, opacity: dest ? 1 : 0.8 }, g);
        if (dest) txt(g, X(p) + (p > 0.3 ? -10 : 10), Y(1 - h(p)) + (p > 0.3 ? -26 : -8), `${n}: p = ${ber} % → C ≈ ${(1 - h(p)).toFixed(p > 0.3 ? 3 : 2)}`, "t-a", { "font-size": 12, "text-anchor": p > 0.3 ? "end" : "start" });
        globo(g, `${n}: BER ${ber} %, C = ${(1 - h(p)).toFixed(3)}${rafaga ? " (ráfagas: el supuesto de errores independientes no vale)" : ""}`); return g; });
      txt(svg, X(0.2), Y(0.62), "○ oclusión: errores en ráfagas", "t-m", { "font-size": 11.5 });
      return { ms: 2800, cuadro(u) {
        const m = tramo(u, 0, 0.6); let d = "";
        for (let i = 0; i <= 100 * m; i++) { const p = 0.5 * i / 100; d += `${i ? "L" : "M"}${X(p).toFixed(1)} ${Y(1 - h(p)).toFixed(1)}`; }
        curva.setAttribute("d", d);
        puntos.forEach((g, k) => g.setAttribute("opacity", tramo(u, 0.6 + k * 0.04, 0.68 + k * 0.04)));
      } };
    },
  };
}
