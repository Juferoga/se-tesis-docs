"""Genera site/assets/js/mapa-datos.js con los títulos de los pasos de cada etapa (para el mapa general).
Uso: python3 herramientas/mapa.py"""
import json, pathlib, re

SITE = pathlib.Path(__file__).resolve().parent.parent / "site"
PAGINAS = ["index", "compresion", "clave", "caos", "cifrado", "insercion", "recuperacion", "seguridad", "preguntas"]
datos = {}
for p in PAGINAS:
    t = (SITE / f"{p}.html").read_text()
    pasos = re.findall(r'<article class="paso"[^>]*>.*?<h2[^>]*>(.*?)</h2>', t, re.S)
    datos[p] = [re.sub(r"<[^>]+>", "", h).strip() for h in pasos]
(SITE / "assets/js/mapa-datos.js").write_text(
    "// Generado por herramientas/mapa.py. No editar a mano.\nexport const PASOS = " + json.dumps(datos, ensure_ascii=False, indent=1) + ";\n")
print({k: len(v) for k, v in datos.items()})
