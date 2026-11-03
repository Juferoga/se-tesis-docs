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

  return {
    THREE, scene, camera, renderer, controls, colores,
    alCuadro: f => porCuadro.push(f),
    alTema: f => deTema.push(f),
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
