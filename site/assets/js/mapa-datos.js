// Generado por herramientas/mapa.py. No editar a mano.
export const PASOS = {
 "index": [
  "El problema: mandar un secreto sin que se note",
  "Primero, comprimir",
  "Luego, cifrar con la clave",
  "Por último, esconder en el audio",
  "La clave K: lo único secreto",
  "El receptor deshace todo en orden inverso",
  "Las cifras del caso de estudio",
  "Cómo usar este sitio"
 ],
 "compresion": [
  "Qué entra y qué sale",
  "El texto se parte en tokens",
  "Qué es una neurona artificial",
  "La red: Qwen2.5-1.5B, 28 capas apiladas",
  "Dentro de una capa: atención y perceptrón",
  "La salida: una probabilidad para cada token posible",
  "Lo que predijo la red en el poema",
  "Cuánta información trae cada token",
  "El codificador aritmético",
  "De probabilidades a números enteros",
  "El resultado: 928 → 173 bytes",
  "Emisor y receptor deben usar la misma red"
 ],
 "clave": [
  "La clave K: tres números secretos",
  "Cómo se guarda la clave en memoria",
  "Qué es una función hash",
  "El hash real de la clave del caso",
  "Ocho bloques de 64 bits",
  "Cada bloque se vuelve un número entre 0 y 1",
  "Escalado a los rangos de trabajo",
  "Por qué usar SHA-512",
  "Efecto avalancha",
  "Cuándo una clave es válida"
 ],
 "caos": [
  "Una regla muy simple",
  "Iterar a mano",
  "El diagrama de telaraña",
  "Sensibilidad a la condición inicial",
  "Por qué r está entre 3.99 y 4",
  "El exponente de Lyapunov",
  "El transitorio se descarta",
  "De números a bits",
  "Dos filas de bits, un flujo de clave",
  "«8n iteraciones»: cuántos valores se usan"
 ],
 "cifrado": [
  "Qué es XOR",
  "El flujo de clave se agrupa en bytes",
  "Cifrar los dos primeros bytes",
  "Descifrar es repetir la misma operación",
  "Por qué XOR",
  "Qué le pasa a un texto",
  "Por qué dos secuencias",
  "De bytes a bits"
 ],
 "insercion": [
  "Qué es un audio digital",
  "WAV sin compresión, no MP3",
  "El audio del caso de estudio",
  "¿Cuánto cabe?",
  "La tercera secuencia elige las posiciones",
  "1400 posiciones, ninguna repetida",
  "Dónde caen las primeras ocho",
  "El bit menos significativo",
  "Original y estegoaudio, lado a lado",
  "Las cifras confirman que no se nota"
 ],
 "recuperacion": [
  "Qué tiene el receptor",
  "SHA-512 da los mismos parámetros",
  "Lee el último bit de 16 muestras",
  "La longitud es 173 bytes",
  "Regenera las 1400 posiciones y lee 1400 bits",
  "Agrupa en bytes y aplica XOR",
  "La red da las mismas probabilidades",
  "El texto recuperado es idéntico al original",
  "16 combinaciones, 16 recuperaciones exactas",
  "Casi todo el tiempo lo usa la red"
 ],
 "seguridad": [
  "La clave ocupa 144 bits",
  "Muchas combinaciones de bits no son claves",
  "x0 puede tomar 4.49 × 1016 valores",
  "r puede tomar 2.25 × 1013 valores",
  "N puede tomar 9 901 valores",
  "Los bits se suman porque las cantidades se multiplican",
  "2112.91 claves, más que las 2100 recomendadas",
  "Dos claves vecinas dan resultados distintos",
  "Probar todas las claves tomaría 3.10 × 1014 años",
  "Una clave casi correcta no sirve",
  "Un solo bit erróneo arruina el texto",
  "Solo el ruido más débil conserva el mensaje"
 ],
 "preguntas": [
  "¿Cada una de las 28 capas tiene a su vez otra red?",
  "¿Qué es lo «proporcional» en el codificador aritmético?",
  "¿Qué significa que los bits «se escriben en el mensaje comprimido»?",
  "¿Qué es cada término de la fórmula de las frecuencias fv?",
  "¿Cómo vale un token 0.04 «bits» si los bits son enteros?",
  "Si hay dos secuencias en el cifrado, ¿cuál es la otra condición inicial?",
  "Si SHA-512 da las condiciones iniciales, ¿para qué se definen x0 y r?",
  "¿SHA-512 produce las secuencias?",
  "¿Por qué se binarizan las dos secuencias y luego se aplica XOR?",
  "¿«8n iteraciones adicionales» significa que antes hubo otras 8n?",
  "¿De dónde sale el tamaño del espacio de clave?",
  "¿Por qué SHA-512 no estaba en la versión anterior del artículo?"
 ]
};
