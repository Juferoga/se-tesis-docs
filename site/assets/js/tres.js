// Escena 3D común (three.js). Se carga con el importmap de cada página:
//   <script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
//     "three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
//
// Uso:
//   import { escena3d } from "./assets/js/tres.js";
//   const e = escena3d(document.getElementById("mi-lienzo"), { camara: [6, 4, 8] });
//   e.scene.add(malla); e.alCuadro(dt => { ... });   // animación por cuadro (se pausa fuera de pantalla)
//   e.colores()  -> colores actuales del tema como THREE.Color: { ink, muted, line, soft, key, ciph, pos, net, hash, surface }
//   e.alTema(fn) -> se llama cuando cambia el tema claro/oscuro
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { color, alCambiarTema, sinMovimiento } from "./guia.js";

export { THREE };

export function escena3d(contenedor, { camara = [6, 4, 8], mirar = [0, 0, 0], fov = 45 } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  contenedor.append(renderer.domElement);
  const ayuda = Object.assign(document.createElement("span"), { className: "ayuda3d", textContent: "Arrastra para girar · rueda o pellizco para acercar" });
  contenedor.append(ayuda);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 4 / 3, 0.1, 500);
  camera.position.set(...camara);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(...mirar);
  controls.enableDamping = true;
  controls.update();

  const amb = new THREE.AmbientLight(0xffffff, 0.75);
  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(5, 10, 7);
  scene.add(amb, dir);

  const nombres = ["ink", "muted", "line", "soft", "key", "ciph", "pos", "net", "hash", "surface", "bg"];
  const colores = () => Object.fromEntries(nombres.map(n => [n, new THREE.Color(color(n) || "#888")]));
  const deTema = [];
  alCambiarTema(() => deTema.forEach(f => f(colores())));

  function tamano() {
    const w = contenedor.clientWidth, h = contenedor.clientHeight || w * 0.75;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(tamano).observe(contenedor);
  tamano();

  const porCuadro = [];
  let visible = true, ultimo = performance.now();
  new IntersectionObserver(es => (visible = es[0].isIntersecting)).observe(contenedor);
  renderer.setAnimationLoop(ahora => {
    const dt = Math.min(0.05, (ahora - ultimo) / 1000);
    ultimo = ahora;
    if (!visible) return;
    if (!sinMovimiento()) porCuadro.forEach(f => f(dt, ahora / 1000));
    controls.update();
    renderer.render(scene, camera);
  });

  // Hover (y toque en pantallas táctiles): resalta el objeto bajo el puntero y muestra un globo con su dato.
  //   e.alPasar(() => listaDeObjetos, (obj, punto) => "html del globo" | null, { color: "key" })
  // Cada objeto puede ser una malla o un grupo (se resalta todo el grupo). Devolver null = sin globo.
  const globo = Object.assign(document.createElement("div"), { className: "globo3d", role: "status" });
  contenedor.append(globo);
  const rayo = new THREE.Raycaster(), puntero = new THREE.Vector2();
  const pasadores = [];
  let encima = null;
  const resaltar = (obj, si, tono) => obj?.traverse?.(m => {
    const mats = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : [];
    mats.forEach(mt => {
      if (!("emissive" in mt)) { if (si) { mt.userData.op ??= mt.opacity; mt.opacity = Math.min(1, (mt.opacity ?? 1) + .25); } else if (mt.userData.op != null) mt.opacity = mt.userData.op; return; }
      if (si) { mt.userData.em ??= mt.emissive.getHex(); mt.userData.emi ??= mt.emissiveIntensity; mt.emissive.copy(tono); mt.emissiveIntensity = .55; }
      else if (mt.userData.em != null) { mt.emissive.setHex(mt.userData.em); mt.emissiveIntensity = mt.userData.emi; }
    });
  });
  function buscar(ev) {
    const r = renderer.domElement.getBoundingClientRect();
    puntero.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    rayo.setFromCamera(puntero, camera);
    for (const p of pasadores) {
      const objs = (typeof p.objetos === "function" ? p.objetos() : p.objetos).filter(o => o?.visible !== false);
      const hit = rayo.intersectObjects(objs, true).find(h => h.object.visible);
      if (!hit) continue;
      let o = hit.object;
      while (o && !objs.includes(o)) o = o.parent;
      const html = p.texto(o || hit.object, hit.point);
      if (html) return { p, obj: o || hit.object, html, x: ev.clientX - r.left, y: ev.clientY - r.top };
    }
    return null;
  }
  function mover(ev) {
    if (!pasadores.length) return;
    const h = buscar(ev);
    if (encima && encima.obj !== h?.obj) resaltar(encima.obj, false);
    if (!h) { globo.classList.remove("ver"); renderer.domElement.style.cursor = ""; encima = null; return; }
    if (encima?.obj !== h.obj) resaltar(h.obj, true, new THREE.Color(color(h.p.color || "key")));
    encima = h;
    globo.innerHTML = h.html;
    const w = contenedor.clientWidth, gw = globo.offsetWidth, gh = globo.offsetHeight;
    globo.style.left = `${Math.min(w - gw - 6, Math.max(6, h.x + 14))}px`;
    globo.style.top = `${Math.max(6, h.y - gh - 12)}px`;
    globo.classList.add("ver");
    renderer.domElement.style.cursor = "pointer";
  }
  renderer.domElement.addEventListener("pointermove", mover);
  renderer.domElement.addEventListener("pointerdown", ev => { if (ev.pointerType !== "mouse") mover(ev); });
  renderer.domElement.addEventListener("pointerleave", () => { resaltar(encima?.obj, false); encima = null; globo.classList.remove("ver"); });

  return {
    THREE, scene, camera, renderer, controls, colores,
    alCuadro: f => porCuadro.push(f),
    alTema: f => deTema.push(f),
    alPasar: (objetos, texto, { color: c = "key" } = {}) => pasadores.push({ objetos, texto, color: c }),
  };
}

// Etiqueta de texto como sprite (siempre mirando a la cámara).
export function etiqueta(texto, { tam = 0.35, color: c = "ink", peso = 600 } = {}) {
  const lienzo = document.createElement("canvas");
  const ctx = lienzo.getContext("2d");
  const fuente = `${peso} 64px "Source Sans 3", system-ui, sans-serif`;
  ctx.font = fuente;
  const w = Math.ceil(ctx.measureText(texto).width) + 24;
  lienzo.width = w; lienzo.height = 88;
  const pintar = () => {
    ctx.clearRect(0, 0, w, 88);
    ctx.font = fuente; ctx.textBaseline = "middle"; ctx.fillStyle = color(c);
    ctx.fillText(texto, 12, 46);
    tex.needsUpdate = true;
  };
  const tex = new THREE.CanvasTexture(lienzo);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set(tam * w / 88, tam, 1);
  pintar();
  alCambiarTema(pintar);
  return sprite;
}
