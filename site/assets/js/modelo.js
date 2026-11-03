/* Núcleo del modelo, idéntico a src/utils/caos.py (float64 de JS = float64 de NumPy). */
window.Modelo = (() => {
  const logistic = (x, r) => r * x * (1 - x);
  async function sha512(x0, r, N) {
    const buf = new ArrayBuffer(18), v = new DataView(buf);
    v.setFloat64(0, x0, false); v.setFloat64(8, r, false); v.setUint16(16, N, false);
    const h = new Uint8Array(await crypto.subtle.digest("SHA-512", buf));
    return { input: new Uint8Array(buf), hash: h };
  }
  function uniforme(b) { // 8 bytes big-endian >> 11, / 2^53
    let n = 0n; for (const x of b) n = (n << 8n) | BigInt(x);
    return Number(n >> 11n) / 2 ** 53;
  }
  async function derivar(x0, r, N) {
    const { input, hash } = await sha512(x0, r, N);
    const bloques = [], u = [];
    for (let i = 0; i < 8; i++) { const b = hash.slice(8 * i, 8 * i + 8); bloques.push(b); u.push(uniforme(b)); }
    return {
      input, hash, bloques, u,
      x1: 0.001 + 0.998 * u[0], r1: 3.99 + 0.01 * u[1],
      x2: 0.001 + 0.998 * u[2], r2: 3.99 + 0.01 * u[3],
      xp: 0.001 + 0.998 * u[4], rp: 3.99 + 0.0099 * u[5],
      N, Np: N + 1000,
    };
  }
  function secuencia(x, r, transitorio, n) {
    for (let i = 0; i < transitorio; i++) x = logistic(x, r);
    const out = new Float64Array(n);
    for (let i = 0; i < n; i++) { x = logistic(x, r); out[i] = x; }
    return out;
  }
  function flujo(d, nBytes) {
    const s1 = secuencia(d.x1, d.r1, d.N, nBytes * 8), s2 = secuencia(d.x2, d.r2, d.N, nBytes * 8);
    const b1 = Uint8Array.from(s1, v => v > 0.5 ? 1 : 0), b2 = Uint8Array.from(s2, v => v > 0.5 ? 1 : 0);
    const bits = b1.map((b, i) => b ^ b2[i]);
    const bytes = new Uint8Array(nBytes);
    for (let j = 0; j < nBytes; j++) { let k = 0; for (let t = 0; t < 8; t++) k = (k << 1) | bits[8 * j + t]; bytes[j] = k; }
    return { s1, s2, b1, b2, bits, bytes };
  }
  function posiciones(d, L, M) {
    let y = d.xp; for (let i = 0; i < d.Np; i++) y = logistic(y, d.rp);
    const P = [], usadas = new Set(); let iter = 0;
    while (P.length < L) { iter++; y = logistic(y, d.rp); const p = Math.max(0, Math.min(Math.floor(y * M), M - 1)); if (!usadas.has(p)) { usadas.add(p); P.push(p); } }
    return { P, iter };
  }
  function lyapunov(r, x0 = 0.3, nt = 20000, n = 4000) {
    let x = x0; for (let i = 0; i < nt; i++) x = r * x * (1 - x);
    let a = 0; for (let i = 0; i < n; i++) { x = r * x * (1 - x); a += Math.log(Math.abs(r * (1 - 2 * x)) + 1e-300); }
    return a / n;
  }
  const hex = b => Array.from(b, x => x.toString(16).padStart(2, "0")).join("");
  const bin8 = n => n.toString(2).padStart(8, "0");
  const CASO = { x0: 0.123456, r: 3.999952, N: 6173, M: 25143552, n: 175 };
  return { logistic, sha512, derivar, secuencia, flujo, posiciones, lyapunov, hex, bin8, CASO };
})();
