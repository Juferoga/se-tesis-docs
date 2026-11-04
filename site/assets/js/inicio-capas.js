// Animaciones propias de las capas de detalle (↓) del panorama (index.html).
import { montarCapa, s, T, tramo, mezcla, globo, miles, anchoTxt } from "./compresion-capas.js";

// 1.1 · Modelo de amenaza: Alicia envía, Wendy observa sin tocar, Bruno recibe; abajo, P_C y P_S casi iguales.
function amenaza(g, W, H) {
  const m = 24, bajo = H < 320;
  const alto = Math.min(H - 16, 460), y0 = (H - alto) / 2;
  const yC = y0 + (bajo ? alto * 0.5 : alto * 0.36);
  const xA = m + 34, xB = W - m - 34, xW = W / 2, yW = yC - (bajo ? 56 : 84);
  T(g, m, y0 + 12, "El problema de los prisioneros: guardiana pasiva", { class: "rotulo" });
  s("line", { x1: xA, y1: yC, x2: xB, y2: yC, class: "s-line", "stroke-width": 3, "stroke-linecap": "round" }, g);
  const persona = (x, nom, cls) => { const gg = s("g", {}, g); s("circle", { cx: x, cy: yC - 9, r: 8, class: cls }, gg); s("path", { d: `M${x - 13} ${yC + 14}Q${x} ${yC - 6} ${x + 13} ${yC + 14}Z`, class: cls }, gg); T(gg, x, yC + 32, nom, { "text-anchor": "middle", "font-weight": 600 }); return gg; };
  persona(xA, "Alicia", "f-ink"); persona(xB, "Bruno", "f-ink");
  // Wendy: un ojo que sigue al paquete.
  const ojo = s("g", {}, g);
  s("path", { d: `M${xW - 24} ${yW}Q${xW} ${yW - 18} ${xW + 24} ${yW}Q${xW} ${yW + 18} ${xW - 24} ${yW}Z`, class: "f-soft s-mu", "stroke-width": 1.5 }, ojo);
  const pupila = s("circle", { cx: xW, cy: yW, r: 6, class: "f-mu" }, ojo);
  T(ojo, xW + 34, yW + 4, "Wendy", { "font-weight": 600 });
  T(ojo, xW + 34, yW + 20, "observa, no modifica", { class: "r" });
  globo(ojo, "Wendy conoce todo el sistema salvo la clave K (principio de Kerckhoffs) y no altera el estegoaudio");
  const mirada = s("line", { x1: xW, y1: yW + 10, class: "s-mu", "stroke-dasharray": "2 4" }, g);
  // Paquete: una onda corta (el estegoaudio).
  const paq = s("g", {}, g);
  let d = ""; for (let i = 0; i <= 24; i++) d += (i ? "L" : "M") + (i * 1.5 - 18).toFixed(1) + " " + (Math.sin(i * 0.9) * 7).toFixed(1);
  s("rect", { x: -24, y: -13, width: 48, height: 26, rx: 7, class: "f-bg s-ac", "stroke-width": 1.6 }, paq);
  s("path", { d, class: "s-ac nf", "stroke-width": 1.6 }, paq);
  globo(paq, "Estegoaudio: suena como el audio limpio");
  // Densidades del audio limpio y del estegoaudio (ilustrativas).
  let dens = null;
  if (!bajo) {
    const yb = y0 + alto - 34, hb = Math.min(140, alto * 0.3), x0 = m + 10, x1 = W - m - 10;
    T(g, m, yb - hb - 14, "Distribuciones del audio limpio P_C y del estegoaudio P_S · ilustrativo", { class: "rotulo" });
    s("line", { x1: x0, y1: yb, x2: x1, y2: yb, class: "s-mu" }, g);
    const f = (u, sh) => Math.exp(-((u - 0.5 - sh) ** 2) / 0.02) * 0.9 + Math.exp(-((u - 0.27 - sh) ** 2) / 0.006) * 0.35;
    const curva = sh => { let p = ""; for (let i = 0; i <= 120; i++) { const u = i / 120; p += (i ? "L" : "M") + (x0 + (x1 - x0) * u).toFixed(1) + " " + (yb - hb * f(u, sh)).toFixed(1); } return p; };
    s("path", { d: curva(0) + `L${x1} ${yb}L${x0} ${yb}Z`, class: "f-line" }, g);
    const ps = s("path", { class: "s-ac nf", "stroke-width": 2.2, "stroke-dasharray": "5 4" }, g);
    T(g, x0 + (x1 - x0) * 0.5, yb - hb * 0.95 - 8, "P_C", { class: "m mu", "text-anchor": "end" });
    const etS = T(g, x0 + (x1 - x0) * 0.56, yb - hb * 0.95 - 8, "P_S", { class: "m ac" });
    const cota = T(g, W / 2, yb + 22, "D(P_C ‖ P_S) ≤ ε: no demostrado para este sistema", { class: "r m", "text-anchor": "middle" });
    dens = u => { ps.setAttribute("d", curva(0.25 * (1 - u) + 0.004)); etS.setAttribute("x", x0 + (x1 - x0) * (0.56 + 0.25 * (1 - u))); cota.setAttribute("opacity", tramo(u, 0.8, 1)); };
  }
  return t => {
    const u = tramo(t, 0.05, 0.6), x = mezcla(xA + 34, xB - 34, u);
    paq.setAttribute("transform", `translate(${x},${yC})`);
    const dx = x - xW, dy = yC - yW, n = Math.hypot(dx, dy);
    pupila.setAttribute("cx", xW + 9 * dx / n); pupila.setAttribute("cy", yW + 4 * dy / n);
    mirada.setAttribute("x1", xW + 9 * dx / n); mirada.setAttribute("x2", x); mirada.setAttribute("y2", yC - 14);
    mirada.setAttribute("opacity", u > 0 && u < 1 ? 1 : 0.35);
    dens?.(tramo(t, 0.55, 0.95));
  };
}

// 5.1 · Qué es secreto y qué es público: solo K es secreta, y H(K) queda muy por debajo de H(M).
function secreto(g, W, H) {
  const m = 22, bajo = H < 320;
  const alto = Math.min(H - 12, 440), y0 = (H - alto) / 2;
  const PUB = ["Qwen2.5-1.5B", "tokenizador", "codificador aritmético", "SHA-512", "mapa logístico", "regla de posiciones", "inserción LSB", "cabecera de longitud"];
  const fs = bajo ? 9.5 : 12, hch = bajo ? 17 : 26, gap = bajo ? 4 : 6;
  T(g, m, y0 + 12, "Público (Kerckhoffs)", { class: "rotulo" });
  // Fichas en filas.
  let x = m, y = y0 + 22;
  const fichas = PUB.map(nom => {
    const w = anchoTxt(nom, fs) + 18;
    if (x + w > W - m) { x = m; y += hch + gap; }
    const gg = s("g", {}, g);
    s("rect", { x, y, width: w, height: hch, rx: hch / 2, class: "f-soft s-line" }, gg);
    T(gg, x + w / 2, y + hch / 2 + fs * 0.36, nom, { "text-anchor": "middle", style: `font-size:${fs}px` });
    x += w + gap;
    return gg;
  });
  const kw = anchoTxt("K = (x₀, r, N)", fs + 1, true) + 26;
  // En una vista baja la ficha secreta sigue en la misma fila de fichas.
  let kx = m, yK = y + hch + 30;
  if (bajo) { if (x + kw + 10 > W - m) { x = m; y += hch + gap; } kx = x + 10; yK = y - 4; }
  else T(g, m, yK - 4, "Secreto", { class: "rotulo" });
  const ficha = s("g", {}, g);
  s("rect", { x: kx, y: yK + 4, width: kw, height: hch + 2, rx: (hch + 2) / 2, class: "f-ac" }, ficha);
  T(ficha, kx + kw / 2, yK + 4 + (hch + 2) / 2 + (fs + 1) * 0.36, "K = (x₀, r, N)", { class: "m", "text-anchor": "middle", style: `font-size:${fs + 1}px;font-weight:600;fill:var(--bg)` });
  if (!bajo) T(ficha, kx + kw + 10, yK + 4 + (hch + 2) / 2 + 4, "144 bits en memoria · 2^112.91 claves válidas", { class: "r m", style: "font-size:11.5px" });
  else globo(ficha, "144 bits en memoria · 2^112.91 claves válidas");
  // Barras: H(K) frente a H(M).
  const yb = yK + hch + (bajo ? 34 : 54), x0 = m + (bajo ? 74 : 92), x1 = W - m - 10, esc = (x1 - x0) / 1400, hb = bajo ? 12 : 16, sep = bajo ? 22 : 34;
  T(g, m, yb - 10, "Secreto perfecto de Shannon: haría falta H(K) ≥ H(M)", { class: "rotulo", style: bajo ? "font-size:10.5px" : null });
  T(g, x0 - 8, yb + hb - 3, "H(M)", { class: "m", "text-anchor": "end" });
  T(g, x0 - 8, yb + sep + hb - 3, "H(K)", { class: "m ac", "text-anchor": "end" });
  const bm = globo(s("rect", { x: x0, y: yb, height: hb, rx: 3, class: "f-line" }, g), "Mensaje: 1400 bits casi incompresibles");
  const bk = globo(s("rect", { x: x0, y: yb + sep, height: hb, rx: 3, class: "f-ac" }, g), "Clave: a lo sumo 112.91 Sh");
  const tm = T(g, x1, yb - 3 + (bajo ? 0 : 0), "1400 bits", { class: "r m", "text-anchor": "end" });
  const tk = T(g, 0, yb + sep + hb - 3, "112.91 Sh", { class: "m ac" });
  const fin = T(g, x0 + 112.91 * esc + 86, yb + sep + hb - 3, "< 1400: no se cumple", { class: "m", style: "font-size:11.5px" });
  return t => {
    fichas.forEach((f, j) => f.setAttribute("opacity", tramo(t, 0.02 + j * 0.035, 0.08 + j * 0.035)));
    ficha.setAttribute("opacity", tramo(t, 0.34, 0.44));
    const u = tramo(t, 0.48, 0.66), v = tramo(t, 0.66, 0.84);
    bm.setAttribute("width", 1400 * esc * u); tm.setAttribute("opacity", u >= 1 ? 1 : 0);
    bk.setAttribute("width", Math.max(0.5, 112.91 * esc * v)); tk.setAttribute("x", x0 + 112.91 * esc * v + 6); tk.setAttribute("opacity", v > 0 ? 1 : 0);
    fin.setAttribute("opacity", tramo(t, 0.86, 0.98));
  };
}

// 6.1 · Una clave por mensaje: con la misma K, el flujo se cancela y c1 ⊕ c2 = m1 ⊕ m2.
let flujoReal = null;
async function byteFlujo() {
  if (flujoReal != null) return flujoReal;
  const { x0, r, N } = window.Modelo.CASO;
  const d = await window.Modelo.derivar(x0, r, N);
  flujoReal = window.Modelo.flujo(d, 1).bytes[0];
  return flujoReal;
}
async function reutilizar(g, W, H) {
  const k = await byteFlujo();
  const M1 = "S".charCodeAt(0), M2 = "N".charCodeAt(0);
  const bits = v => [...v.toString(2).padStart(8, "0")];
  const m = 20, ancho = W / H > 1.35, bajo = H < 320;
  const fila = (b, x, y, cw, cls) => b.map((c, i) => {
    const gg = s("g", { transform: `translate(${x + i * cw},${y})` }, g);
    s("rect", { width: cw - 3, height: cw - 3, rx: 3, class: c === "1" ? (cls || "f-mu") : "f-soft" }, gg);
    T(gg, (cw - 3) / 2, (cw - 3) / 2 + 4, c, { class: "m", "text-anchor": "middle", style: `font-size:${Math.min(12, cw * 0.45)}px;fill:${c === "1" ? "var(--bg)" : "var(--ink)"}` });
    return gg;
  });
  // Dos bloques (m, k, c) y el resultado.
  const filas = [];
  const etiquetas = [];
  const cw = ancho ? Math.min(24, (W / 2 - m - 60) / 8, (H - 60) / 5.6) : Math.min(30, (W - 2 * m - 80) / 8, (H - 90) / 10);
  const lab = 56;
  const blq = (b, x, y, mm, nom) => {
    const y1 = y, y2 = y + cw + 2, y3 = y + 2 * cw + 10;
    const r1 = fila(bits(mm), x + lab, y1, cw), r2 = fila(bits(k), x + lab, y2, cw, "f-ac"), r3 = fila(bits(mm ^ k), x + lab, y3, cw, "f-ink");
    const l1 = T(g, x + lab - 8, y1 + cw * 0.62, `m${nom}`, { class: "m", "text-anchor": "end" });
    const l2 = T(g, x + lab - 8, y2 + cw * 0.62, "⊕ k", { class: "m ac", "text-anchor": "end" });
    const l3 = T(g, x + lab - 8, y3 + cw * 0.62, `= c${nom}`, { class: "m", "text-anchor": "end" });
    s("line", { x1: x + lab, y1: y3 - 4, x2: x + lab + 8 * cw - 3, y2: y3 - 4, class: "s-mu" }, g);
    return { r1, r2, r3, l: [l1, l2, l3], y3 };
  };
  const anchoB = lab + 8 * cw;
  let A, B, yR;
  const yTop = (H - (ancho ? 3 * cw + 10 + 30 + 2 * cw + 30 : 2 * (3 * cw + 10) + 24 + 30 + 2 * cw + 30)) / 2 + 20;
  if (ancho) { const gx = (W - 2 * anchoB - 40) / 2; A = blq(0, gx, yTop, M1, "₁"); B = blq(0, gx + anchoB + 40, yTop, M2, "₂"); yR = yTop + 3 * cw + 10 + 30; }
  else { const gx = (W - anchoB) / 2; A = blq(0, gx, yTop, M1, "₁"); B = blq(0, gx, yTop + 3 * cw + 34, M2, "₂"); yR = yTop + 2 * (3 * cw + 10) + 24 + 30; }
  T(g, m, Math.max(14, yTop - 14), `bytes de ejemplo «S» y «N»; k = primer byte real del flujo de K (${k.toString(16).toUpperCase().padStart(2, "0")})`, { class: "rotulo", style: bajo ? "font-size:10px" : null });
  const gx = (W - (lab + 8 * cw)) / 2 - (ancho ? 70 : 40);
  const res = fila(bits((M1 ^ k) ^ (M2 ^ k)), gx + lab + 60, yR, cw, "f-ac");
  const lr = T(g, gx + lab + 52, yR + cw * 0.62, "c₁ ⊕ c₂", { class: "m", "text-anchor": "end" });
  const eq = T(g, gx + lab + 60 + 8 * cw + 8, yR + cw * 0.62, "= m₁ ⊕ m₂", { class: "m ac g" });
  const nota = T(g, W / 2, yR + cw + 20, "el flujo k se cancela: sin conocer K se obtiene la mezcla de los dos mensajes", { class: "r", "text-anchor": "middle", style: bajo ? "font-size:10px" : null });
  return t => {
    [A, B].forEach((b, j) => {
      const a = 0.04 + j * 0.2;
      b.r1.forEach(n => n.setAttribute("opacity", tramo(t, a, a + 0.06)));
      b.r2.forEach(n => n.setAttribute("opacity", tramo(t, a + 0.06, a + 0.12) * (1 - 0.65 * tramo(t, 0.6, 0.72))));
      b.r3.forEach((n, i) => n.setAttribute("opacity", tramo(t, a + 0.12 + i * 0.008, a + 0.16 + i * 0.008)));
      b.l.forEach((n, i) => n.setAttribute("opacity", tramo(t, a + i * 0.06, a + 0.06 + i * 0.06)));
    });
    res.forEach((n, i) => n.setAttribute("opacity", tramo(t, 0.72 + i * 0.012, 0.78 + i * 0.012)));
    lr.setAttribute("opacity", tramo(t, 0.7, 0.76));
    eq.setAttribute("opacity", tramo(t, 0.86, 0.94));
    nota.setAttribute("opacity", tramo(t, 0.9, 1));
  };
}

// 7.1 · Las métricas: de los 1400 bits, unos 696 cambian una muestra en ±1; de ahí MSE y PSNR.
function metricas(g, W, H) {
  const M = 25143552, L = 1400, K = 696;
  const mse = K / M, psnr = 10 * Math.log10(32767 ** 2 / mse);
  const m = 20, ancho = W / H > 1.25;
  const cols = ancho ? 50 : 40, filas = Math.ceil(L / cols);
  const zona = ancho ? { x: m, y: 34, w: W * 0.56 - m, h: H - 60 } : { x: m, y: 34, w: W - 2 * m, h: (H - 60) * 0.56 };
  const c = Math.min(zona.w / cols, zona.h / filas);
  const ox = zona.x + (zona.w - c * cols) / 2, oy = zona.y + (zona.h - c * filas) / 2;
  T(g, m, 20, "Los 1400 bits insertados · qué muestras cambian: ilustrativo", { class: "rotulo" });
  // Elegir exactamente K celdas (permutación fija).
  let sem = 12345; const az = () => ((sem = (sem * 48271) % 2147483647) / 2147483647);
  const orden = Array.from({ length: L }, (_, i) => i);
  for (let i = L - 1; i > 0; i--) { const j = Math.floor(az() * (i + 1)); [orden[i], orden[j]] = [orden[j], orden[i]]; }
  const cambia = new Set(orden.slice(0, K));
  const celdas = Array.from({ length: L }, (_, i) => s("rect", { x: ox + (i % cols) * c + 0.5, y: oy + Math.floor(i / cols) * c + 0.5, width: Math.max(0.5, c - 1), height: Math.max(0.5, c - 1), class: "f-line" }, g));
  const tx = ancho ? W * 0.6 : m, ty = ancho ? 60 : oy + c * filas + 32;
  const fsG = ancho ? 22 : 20, lin = ancho ? 22 : 19;
  const kT = T(g, tx, ty, "", { class: "m ac", style: `font-size:${fsG}px;font-weight:600` });
  T(g, tx, ty + 16, "muestras cambiadas en ±1 (k)", { class: "rotulo" });
  const estrecho = W - tx < 220;
  const r1 = T(g, tx, ty + 16 + lin * 1.5, estrecho ? `MSE = ${K} / ${miles(M)}` : `MSE = k / M = ${K} / ${miles(M)}`, { class: "m", style: `font-size:${estrecho ? 10.5 : 11.5}px` });
  const r2 = T(g, tx, ty + 16 + lin * 2.4, `= ${(mse * 1e5).toFixed(2)}×10⁻⁵`, { class: "m", style: "font-size:11.5px" });
  const r3 = T(g, tx, ty + 16 + lin * 3.6, `PSNR = ${psnr.toFixed(2)} dB`, { class: "m g" });
  const r4 = T(g, tx, ty + 16 + lin * 4.5, "k ≈ 696: estimación propia", { class: "r" });
  if (!ancho) { r1.setAttribute("x", tx); r2.setAttribute("x", W * 0.62); r2.setAttribute("y", ty + 16 + lin * 1.5); r3.setAttribute("x", tx); r3.setAttribute("y", ty + 16 + lin * 2.7); r4.setAttribute("x", W * 0.62); r4.setAttribute("y", ty + 16 + lin * 2.7); r4.setAttribute("x", W - m); r4.setAttribute("text-anchor", "end"); r2.setAttribute("x", W - m); r2.setAttribute("text-anchor", "end"); }
  return t => {
    const u = tramo(t, 0.04, 0.7), n = Math.round(L * u);
    let k = 0;
    celdas.forEach((cel, i) => {
      const on = i < n, cb = cambia.has(i);
      if (on && cb) k++;
      cel.setAttribute("class", !on ? "f-soft" : cb ? "f-ac" : "f-mu");
      cel.setAttribute("opacity", on && !cb ? 0.45 : 1);
    });
    kT.textContent = `${k} de ${n}`;
    [r1, r2].forEach(r => r.setAttribute("opacity", tramo(t, 0.72, 0.8)));
    r3.setAttribute("opacity", tramo(t, 0.82, 0.9));
    r4.setAttribute("opacity", tramo(t, 0.9, 1));
  };
}

const ESCENAS = {
  "1-1": [amenaza, 3200, "Alicia envía el estegoaudio a Bruno mientras Wendy observa"],
  "5-1": [secreto, 3000, "Componentes públicos, la clave secreta y la comparación entre H(K) y H(M)"],
  "6-1": [reutilizar, 3200, "Con la misma clave, el XOR de dos cifrados es el XOR de los mensajes"],
  "7-1": [metricas, 3400, "Muestras cambiadas por la inserción y el PSNR resultante"],
};

let limpiar = () => {};
export function capaInicio(i, k, titulo, vista) {
  limpiar(); limpiar = () => {};
  if (!k || !vista) return;
  const e = ESCENAS[`${i + 1}-${k}`];
  if (!e) return;
  limpiar = montarCapa(vista, e[0], { ms: e[1], acento: "var(--key)", etiqueta: e[2] });
}
