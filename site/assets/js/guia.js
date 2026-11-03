// Recorrido por pasos, común a todas las etapas.
//
// Marcado esperado:
//   <div class="recorrido" id="recorrido">
//     <div class="narracion">
//       <article class="paso" data-paso="nombre"> ... </article>   (uno por paso)
//       <div class="mando"></div>                                   (lo llena este módulo)
//     </div>
//     <div class="escena"> ... </div>
//   </div>
//
// Uso:
//   import { recorrido } from "./assets/js/guia.js";
//   recorrido(document.getElementById("recorrido"), (i, nombre, dir) => { /* actualizar la escena */ });
//
// Teclado: ← y → cambian de paso. El paso actual queda en el hash (#paso-3) para poder compartirlo.

export const sinMovimiento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function color(nombre) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${nombre}`).trim();
}

export function alCambiarTema(fn) {
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", fn);
  new MutationObserver(fn).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}

export function recorrido(raiz, alCambiar) {
  const pasos = [...raiz.querySelectorAll(".paso")];
  const mando = raiz.querySelector(".mando");
  const ant = Object.assign(document.createElement("button"), { className: "ghost", textContent: "← Anterior", type: "button" });
  const sig = Object.assign(document.createElement("button"), { textContent: "Siguiente →", type: "button" });
  const puntos = Object.assign(document.createElement("div"), { className: "puntos" });
  const cuenta = Object.assign(document.createElement("span"), { className: "cuenta" });
  pasos.forEach((p, i) => {
    const b = Object.assign(document.createElement("button"), { type: "button", title: p.querySelector("h2")?.textContent || `Paso ${i + 1}` });
    b.setAttribute("aria-label", `Ir al paso ${i + 1}: ${b.title}`);
    b.addEventListener("click", () => ir(i));
    puntos.append(b);
  });
  mando.append(ant, puntos, cuenta, sig);

  let actual = -1;
  function ir(i, { desdeHash = false } = {}) {
    i = Math.max(0, Math.min(pasos.length - 1, i));
    if (i === actual) return;
    const dir = i > actual ? 1 : -1;
    actual = i;
    pasos.forEach((p, k) => (p.hidden = k !== i));
    [...puntos.children].forEach((b, k) => (k === i ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current")));
    cuenta.textContent = `${i + 1} / ${pasos.length}`;
    ant.disabled = i === 0;
    sig.disabled = i === pasos.length - 1;
    if (!desdeHash) history.replaceState(null, "", `#paso-${i + 1}`);
    try { alCambiar?.(i, pasos[i].dataset.paso, dir); } catch (e) { console.error(e); }
    if (!desdeHash && matchMedia("(max-width: 960px)").matches) pasos[i].scrollIntoView({ block: "nearest" });
  }
  ant.addEventListener("click", () => ir(actual - 1));
  sig.addEventListener("click", () => ir(actual + 1));
  document.addEventListener("keydown", e => {
    if (e.target.closest("input, select, textarea")) return;
    if (e.key === "ArrowRight") ir(actual + 1);
    if (e.key === "ArrowLeft") ir(actual - 1);
  });
  const desdeHash = () => { const m = location.hash.match(/^#paso-(\d+)$/); return m ? +m[1] - 1 : 0; };
  addEventListener("hashchange", () => ir(desdeHash(), { desdeHash: true }));
  ir(desdeHash(), { desdeHash: true });
  return { ir, get actual() { return actual; }, total: pasos.length };
}

// Animación simple con requestAnimationFrame: fn(t) con t de 0 a 1. Devuelve una función para cancelarla.
export function animar(ms, fn, fin) {
  if (sinMovimiento()) { fn(1); fin?.(); return () => {}; }
  let id, t0;
  const paso = ts => {
    t0 ??= ts;
    const t = Math.min(1, (ts - t0) / ms);
    fn(t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    if (t < 1) id = requestAnimationFrame(paso); else fin?.();
  };
  id = requestAnimationFrame(paso);
  return () => cancelAnimationFrame(id);
}
