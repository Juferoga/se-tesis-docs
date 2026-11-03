# Criptoestegoaudio: recorrido interactivo

Sitio que explica, paso a paso y con visualizaciones interactivas, el modelo criptoesteganográfico del artículo
*Modelo criptoesteganográfico, sobre archivos de audio, basado en redes neuronales y atractores caóticos* (Revista TecnoLógicas).

**Sitio:** https://juferoga.github.io/se-tesis-docs/

**Código del modelo:** [github.com/Juferoga/se-tesis](https://github.com/Juferoga/se-tesis) · DOI [10.5281/zenodo.23810658](https://doi.org/10.5281/zenodo.23810658)

## Recorrido

| Etapa | Página | Qué explica |
|---|---|---|
| 0 | `index.html` | El sistema completo: emisor, clave y receptor |
| 1 | `compresion.html` | Compresión sin pérdida con la red neuronal Qwen2.5-1.5B y codificación aritmética |
| 2 | `clave.html` | Derivación de los parámetros desde la clave con SHA-512 |
| 3 | `caos.html` | Mapa logístico, sensibilidad, transitorio y binarización |
| 4 | `cifrado.html` | Cifrado XOR con el flujo de clave |
| 5 | `insercion.html` | Selección caótica de posiciones e inserción LSB en el audio |
| 6 | `recuperacion.html` | Recuperación exacta en el receptor |
| 7 | `seguridad.html` | Espacio de clave, fuerza bruta, sensibilidad y robustez |
| ? | `preguntas.html` | Preguntas frecuentes, glosario y referencias |

Los cálculos de la clave, las secuencias caóticas, el flujo de clave y las posiciones se ejecutan en el navegador con
[`site/assets/js/modelo.js`](site/assets/js/modelo.js), que reproduce `src/utils/caos.py` del repositorio del modelo y da los
mismos valores que el caso de estudio del artículo.

## Estructura

```text
site/
├── index.html … preguntas.html   # una página por etapa
└── assets/
    ├── css/base.css              # tokens de color (claro y oscuro) y componentes
    └── js/
        ├── modelo.js             # núcleo de cálculo del modelo
        ├── guia.js               # navegación por pasos
        ├── tres.js               # escenas 3D con three.js
        └── sitio.js              # barra de etapas, tema y pie
```

## Ver en local

```bash
cd site && python3 -m http.server 8000
# abrir http://localhost:8000
```

## Publicación

Cada push a `main` publica la carpeta `site/` en GitHub Pages con el flujo [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

## Autores

Juan Felipe Rodríguez-Galindo, Mateo Bohórquez-Rodríguez, Luz Deicy Alvarado-Nieto e Isabel Amaya-Barrera.
Universidad Distrital Francisco José de Caldas.
