// Banco de preguntas del buscador (tecla /). Generado a partir de preguntas.html y de las dudas de la revisión.
export const DUDAS = [
 {
  "etapa": "Inicio",
  "url": "index.html#paso-7-1",
  "p": "Si se insertan 1400 bits, ¿por qué el PSNR (135.89 dB) indica que cambiaron solo unas 696 muestras?",
  "r": "Porque escribir un bit en el LSB solo cambia la muestra cuando ese bit es distinto del que ya tenía. Si cada bit cifrado coincide con el LSB original con probabilidad 1/2, cambia cerca de la mitad de las 1400 muestras usadas.",
  "f": "Cada cambio de LSB mueve la muestra exactamente ±1, así que MSE = k/M con M = 25 143 552, y PSNR = 10·log₁₀(32 767²/MSE). Los 135.89 dB corresponden a k ≈ 696. Es una estimación propia del sitio: el artículo reporta solo el PSNR. Además, un PSNR alto no prueba indetectabilidad estadística, que exigiría D(P<sub>C</sub>‖P<sub>S</sub>) ≤ ε.",
  "fuente": "index.html, paso 7, capa 1 (PSNR y k); paso 1, capa 1 (indetectabilidad, Cachin 2004)",
  "claves": [
   "PSNR",
   "MSE",
   "muestras modificadas",
   "LSB",
   "696",
   "distorsión",
   "imperceptibilidad",
   "estegoanálisis"
  ]
 },
 {
  "etapa": "Compresión",
  "url": "preguntas.html#paso-1",
  "p": "¿Cada una de las 28 capas tiene a su vez otra red?",
  "r": "Sí: cada capa tiene autoatención y una red prealimentada (perceptrón multicapa) de 1536 → 8960 → 1536 neuronas.",
  "f": "La autoatención combina la información de los tokens anteriores. La red prealimentada procesa cada token por separado. Así está hecha cada una de las 28 capas del Transformer.",
  "fuente": "Preguntas frecuentes, pregunta 1",
  "claves": []
 },
 {
  "etapa": "Compresión",
  "url": "preguntas.html#paso-2",
  "p": "¿Qué es lo «proporcional» en el codificador aritmético?",
  "r": "La longitud de cada subintervalo, que es proporcional a la probabilidad del token.",
  "f": "El intervalo actual se divide en un subintervalo por token posible, con longitud proporcional a la probabilidad que le da la red. Se conserva el del token del texto, así que la longitud se multiplica por p.",
  "fuente": "Preguntas frecuentes, pregunta 2",
  "claves": []
 },
 {
  "etapa": "Compresión",
  "url": "preguntas.html#paso-3",
  "p": "¿Qué significa que los bits «se escriben en el mensaje comprimido»?",
  "r": "Que los bits iniciales comunes de los dos extremos del intervalo ya no cambian y se escriben en el mensaje comprimido.",
  "f": "Si los dos extremos del intervalo empiezan con los mismos bits, todo número de adentro también empieza así. Esos bits se escriben en el mensaje comprimido y el intervalo se amplía al doble por cada bit escrito.",
  "fuente": "Preguntas frecuentes, pregunta 3",
  "claves": []
 },
 {
  "etapa": "Compresión",
  "url": "preguntas.html#paso-4",
  "p": "¿Qué es cada término de la fórmula de las frecuencias f<sub>v</sub>?",
  "r": "Convierte cada probabilidad en una frecuencia entera, para que emisor y receptor obtengan exactamente los mismos subintervalos.",
  "f": "En f<sub>v</sub> = ⌊p<sub>v</sub>(2<sup>24</sup> − V)⌋ + 1, p<sub>v</sub> es la probabilidad del token v; 2<sup>24</sup> = 16 777 216 son las unidades que se reparten; V = 151 936 es el número de salidas de la red; ⌊ ⌋ redondea hacia abajo; el + 1 evita que un token quede con frecuencia 0, y f<sub>v</sub> es la frecuencia entera del token v.",
  "fuente": "Preguntas frecuentes, pregunta 4",
  "claves": []
 },
 {
  "etapa": "Compresión",
  "url": "preguntas.html#paso-5",
  "p": "¿Cómo vale un token 0.04 «bits» si los bits son enteros?",
  "r": "Lo decimal es la información de cada token, −log<sub>2</sub> p, medida en shannons (Sh); los bits del archivo sí son enteros.",
  "f": "La unidad shannon está definida en ISO/IEC 80000-13. El mensaje comprimido tiene 1384 bits.",
  "fuente": "Preguntas frecuentes, pregunta 5",
  "claves": []
 },
 {
  "etapa": "Compresión",
  "url": "compresion.html#paso-2-1",
  "p": "¿Qué garantiza que la compresión sea sin pérdida, y hay algún texto que no volvería idéntico?",
  "r": "Lo garantizan dos piezas reversibles: el tokenizador (unir los bytes de los tokens devuelve el texto) y el codificador aritmético, que se invierte si el receptor usa las mismas frecuencias. La salvedad es la normalización Unicode NFC del tokenizador de Qwen2: un texto escrito en otra forma no volvería byte por byte.",
  "f": "El BPE a nivel de byte es determinista y cumple τ⁻¹(τ(x)) = x. Pero el tokenizador normaliza a NFC antes de partir: una «á» escrita como «a» más tilde combinante volvería como el carácter compuesto. El poema volvió idéntico (verificado con SHA-256). Para la parte aritmética, A<sub>f</sub>⁻¹ ∘ A<sub>f</sub> = id solo si las f coinciden bit a bit.",
  "fuente": "compresion.html, paso 2 y su capa 1 (tokenization_qwen2.py); recuperacion.html, paso 6, capa 1",
  "claves": [
   "sin pérdida",
   "lossless",
   "reversible",
   "NFC",
   "normalización Unicode",
   "tokenizador",
   "BPE",
   "byte por byte"
  ]
 },
 {
  "etapa": "Compresión",
  "url": "compresion.html#paso-12-1",
  "p": "¿Qué pasa si emisor y receptor ejecutan la red con otro hardware, otra biblioteca u otra versión del software?",
  "r": "Las probabilidades pueden diferir en los últimos bits, y basta que una sola frecuencia entera cambie en un solo paso para que la descompresión falle desde ese token. Por eso se fija el mismo modelo, float32, CPU y 4 hilos; en GPU el mismo poema dio 174 bytes en vez de 173.",
  "f": "La suma en coma flotante no es asociativa: en float32, (10⁸ − 10⁸) + 1 = 1 pero 10⁸ + (−10⁸ + 1) = 0. Un producto de matrices o un softmax suman miles de términos y el orden lo decide la biblioteca según el procesador, los hilos y el tamaño de bloque. El sitio no reporta pruebas con otras versiones de biblioteca, y dice que el efecto de cambiar solo el número de hilos es posible pero no se probó.",
  "fuente": "compresion.html, paso 12 y su capa 1; Goldberg (1991); IEEE 754-2019",
  "claves": [
   "determinismo",
   "reproducibilidad",
   "PyTorch",
   "versión",
   "GPU",
   "CPU",
   "hilos",
   "float32",
   "no asociatividad",
   "174 bytes"
  ]
 },
 {
  "etapa": "Compresión",
  "url": "compresion.html#paso-10",
  "p": "¿Por qué se reparten justamente 2²⁴ unidades de frecuencia?",
  "r": "El sitio no justifica la elección de 24 en particular, pero muestra sus consecuencias: con 2²⁴ unidades caben las 151 936 salidas con al menos 1 unidad cada una, el costo extra por token es pequeño y, con extremos de 62 bits, ningún subintervalo queda vacío.",
  "f": "2²⁴ = 16 777 216 y 2²⁴ − V = 16 625 280 > 0. El costo extra por token es a lo sumo log₂(2²⁴/(2²⁴ − V)) ≈ 0.0131 Sh. Con R > 2⁶⁰ tras renormalizar, todo token con f<sub>v</sub> ≥ 1 recibe un ancho ≥ ⌊2⁶⁰/2²⁴⌋ = 2³⁶. Ningún token cuesta más de log₂ Σf ≤ 24 Sh. Un paso de f equivale a Δp ≈ 6.0 × 10⁻⁸, del orden del redondeo relativo de float32 (2⁻²⁴).",
  "fuente": "compresion.html, paso 10 y su capa 1; paso 9, capa 2; recuperacion.html, paso 7, capa 2",
  "claves": [
   "2^24",
   "16 777 216",
   "total de frecuencias",
   "precisión",
   "frecuencias enteras",
   "elección de parámetros"
  ]
 },
 {
  "etapa": "Compresión",
  "url": "compresion.html#paso-10-1",
  "p": "¿Qué pasa si la red le da una probabilidad casi nula a un token que sí aparece en el texto?",
  "r": "Se puede codificar igual, porque el «+1» le asegura frecuencia al menos 1. Su costo queda acotado en 24 Sh, incluso si el exponencial de float32 da 0.",
  "f": "Con f<sub>v</sub> = ⌊p<sub>v</sub>(2²⁴ − V)⌋ + 1 ≥ 1, ningún token cuesta más de log₂ Σ<sub>u</sub> f<sub>u</sub> ≤ 24 Sh. En el poema, « dul» quedó en 24.00 Sh, justo en ese tope; «Oh» al inicio tenía p ≈ 0.0021 % y puesto 1587. Para decodificar no importa que q̂ se parezca a p, sino que emisor y receptor obtengan los mismos enteros f<sub>v</sub>.",
  "fuente": "compresion.html, paso 10, capa 1; paso 7 y paso 8 (escena)",
  "claves": [
   "probabilidad cero",
   "subdesbordamiento",
   "underflow",
   "token improbable",
   "tope 24 Sh",
   "dul",
   "+1"
  ]
 },
 {
  "etapa": "Compresión",
  "url": "compresion.html#paso-9-2",
  "p": "Si el intervalo se achica en cada token, ¿cómo se evita que la precisión de la computadora se agote o que un subintervalo quede vacío?",
  "r": "Los extremos se guardan como enteros de 62 bits y se renormalizan: cada vez que se escribe un bit, el intervalo se amplía al doble. Así su ancho siempre supera 2⁶⁰ y cada token recibe al menos 2³⁶ unidades.",
  "f": "Con cortes ⌊R·c<sub>v</sub>/T⌋ y T ≤ 2²⁴, ancho(v) ≥ ⌊R·f<sub>v</sub>/T⌋ ≥ 2³⁶ para todo f<sub>v</sub> ≥ 1. El error relativo de cada corte es menor que 2⁻³⁶ y agrega menos de 2.1 × 10⁻¹¹ Sh por token. El costo real de la precisión finita está en las frecuencias enteras, no en los cortes (cota del sitio, cálculo propio).",
  "fuente": "compresion.html, paso 9, capa 2; src/compresion/llm_aritmetico.py; Witten, Neal y Cleary (1987)",
  "claves": [
   "precisión finita",
   "62 bits",
   "renormalización",
   "subintervalo vacío",
   "2^36",
   "enteros",
   "underflow del intervalo"
  ]
 },
 {
  "etapa": "Compresión",
  "url": "compresion.html#paso-11-2",
  "p": "¿Es justo comparar 173 bytes con zlib, bzip2 o LZMA si la red pesa varios gigabytes?",
  "r": "Depende de lo que se mida. Los 173 bytes no incluyen la red porque emisor y receptor ya la tienen y es pública; con el criterio de longitud de descripción mínima habría que sumar su tamaño. Los compresores comunes, en cambio, aprenden solo del propio texto.",
  "f": "ℓ<sub>total</sub> = ℓ(x | Q) + ℓ(Q). Los pesos ocupan unos 3.1 GB en bfloat16 y 6.2 GB en float32. Los compresores comunes dieron entre 535 (zlib) y 597 bytes (LZMA). El costo de la red es tiempo: 53.29 s para 294 tokens, unos 0.18 s por token en CPU. En idiomas o estilos alejados del entrenamiento la ganancia puede ser menor (no se midió).",
  "fuente": "compresion.html, paso 11, capa 2; Delétang et al. (2024); Rissanen (1978)",
  "claves": [
   "MDL",
   "longitud de descripción mínima",
   "zlib",
   "LZMA",
   "bzip2",
   "tamaño del modelo",
   "comparación justa"
  ]
 },
 {
  "etapa": "Compresión",
  "url": "compresion.html#paso-11-1",
  "p": "¿Los 173 bytes muestran que la red está cerca del límite teórico de compresión del español?",
  "r": "No. La entropía real del español no se conoce, así que el resultado solo mide a la red en este poema. Lo que sí se obtiene es una estimación de la perplejidad, cerca de 26.",
  "f": "En un texto concreto solo se observa −log₂ Q(x) = Σ −log₂ Q(x<sub>t</sub> | x<sub>&lt;t</sub>), cuyo valor esperado es H(P) + D(P‖Q) con H(P) desconocida. Con ℓ = 1384 bits y Q + 1 = 294 son unos 4.71 bits por token y 1.536 bits por carácter; PPL ≈ 25.6 a 26.1, estimada a partir del tamaño (el artículo no la reporta).",
  "fuente": "compresion.html, paso 8, capa 1; paso 11, capa 1; paso 1, capa 1",
  "claves": [
   "entropía del español",
   "límite de Shannon",
   "perplejidad",
   "entropía cruzada",
   "bits por carácter",
   "óptimo"
  ]
 },
 {
  "etapa": "Compresión",
  "url": "compresion.html#paso-12-2",
  "p": "¿Qué pasa si se altera un solo bit del estegoaudio, por ejemplo al convertirlo a MP3?",
  "r": "Si el bit afectado cae en el mensaje comprimido, el decodificador elige otro token desde ese punto, la red recibe otro contexto y el resto del texto se pierde. El modelo no tiene código corrector ni forma de detectar el error.",
  "f": "La decodificación es secuencial: el token t depende del intervalo, que depende de todos los tokens y bits anteriores. La recuperación exige q̂<sup>rec</sup>(v | x<sub>&lt;t</sub>) = q̂<sup>emi</sup>(v | x<sub>&lt;t</sub>) para todo t y v. Se supone un canal sin errores: sin recompresión con pérdida (MP3, AAC), remuestreo ni cambio de volumen.",
  "fuente": "compresion.html, paso 12, capa 2; index.html, paso 6, capa 1; MacKay (2003), cap. 6",
  "claves": [
   "robustez",
   "canal sin errores",
   "MP3",
   "corrección de errores",
   "propagación de errores",
   "remuestreo",
   "bit cambiado"
  ]
 },
 {
  "etapa": "Clave",
  "url": "preguntas.html#paso-6",
  "p": "Si hay dos secuencias en el cifrado, ¿cuál es la otra condición inicial?",
  "r": "Ninguna usa directamente el x<sub>0</sub> y el r de la clave: las dos salen de la clave con SHA-512.",
  "f": "Igual que la secuencia de posiciones. En la escena están los seis valores, calculados en tu navegador.",
  "fuente": "Preguntas frecuentes, pregunta 6",
  "claves": []
 },
 {
  "etapa": "Clave",
  "url": "preguntas.html#paso-7",
  "p": "Si SHA-512 da las condiciones iniciales, ¿para qué se definen x<sub>0</sub> y r?",
  "r": "Porque x<sub>0</sub>, r y N no son condiciones iniciales: son la clave secreta K.",
  "f": "La clave la comparten emisor y receptor. De ella salen, con SHA-512, las condiciones iniciales y los parámetros.",
  "fuente": "Preguntas frecuentes, pregunta 7",
  "claves": []
 },
 {
  "etapa": "Clave",
  "url": "preguntas.html#paso-12",
  "p": "¿Por qué SHA-512 no estaba en la versión anterior del artículo?",
  "r": "Se agregó en esta revisión porque, sin SHA-512, N solo desplazaba la misma secuencia.",
  "f": "Al recalcular el espacio de clave, como pidió un evaluador, se vio que el espacio real era de unos 2<sup>89.7</sup>. Con SHA-512, cualquier cambio en K da secuencias distintas.",
  "fuente": "Preguntas frecuentes, pregunta 12",
  "claves": []
 },
 {
  "etapa": "Clave",
  "url": "clave.html#paso-1-4",
  "p": "¿Por qué el espacio de clave es 2^112.91 y no 2^144 si la clave ocupa 144 bits?",
  "r": "Porque los rangos dejan fijos algunos bits: 8 de x0, 19 de r y 2 de N. Lo que varía suma 55.32 + 44.36 + 13.27 = 112.95 bits, y al quitar el 2.33 % de claves no válidas quedan 112.91.",
  "f": "Multiplicar conteos es sumar exponentes de 2: #x0 · #r · #N = 2^55.32 · 2^44.36 · 2^13.27 = 2^112.95; log₂ 0.9767 = −0.034.",
  "fuente": "Clave, paso 1, profundizar 4; articulo/_scripts_correcciones/res/espacio_clave.json",
  "claves": [
   "bits",
   "memoria",
   "144",
   "112",
   "espacio",
   "tamaño de clave"
  ]
 },
 {
  "etapa": "Clave",
  "url": "clave.html#paso-1-4",
  "p": "¿Cuántas claves posibles hay?",
  "r": "2^112.91 ≈ 9.78 · 10^33 claves válidas, unos 9780 quintillones. A mil millones de claves por segundo, recorrer la mitad tomaría unos 1.6 · 10^17 años.",
  "fuente": "espacio_clave.json: total.claves = 9.7809 · 10^33",
  "claves": [
   "posibilidades",
   "cantidad",
   "número de claves",
   "fuerza bruta"
  ]
 },
 {
  "etapa": "Clave",
  "url": "clave.html#paso-1-2",
  "p": "¿Cómo se cuentan los float64 que hay entre 0.001 y 0.999?",
  "r": "Para float64 positivos, el orden numérico coincide con el de sus 64 bits leídos como entero, así que el conteo es una resta: ent(0.999) − ent(0.001) + 1 = 44 918 902 683 393 328 ≈ 2^55.32.",
  "f": "Por pisos de exponente: [2^e, 2^(e+1)) tiene 2^52 float64. Entre 0.001 y 0.999 hay 10 pisos (e = −10 … −1): (0.976 + 8 + 0.998) · 2^52 = 9.974 · 2^52.",
  "fuente": "IEEE 754-2019; Goldberg (1991)",
  "claves": [
   "ulp",
   "binade",
   "exponente",
   "representables",
   "x0"
  ]
 },
 {
  "etapa": "Clave",
  "url": "clave.html#paso-1-3",
  "p": "¿Por qué r aporta solo 44.36 bits si ocupa 64?",
  "r": "Todo r ∈ [3.99, 4) está en un solo piso de exponente, [2, 4), donde la separación (ulp) es 2^−51. Caben (4 − 3.99)/2^−51 = 0.01 · 2^51 ≈ 2^44.36 valores; los 19 primeros bits son iguales en todo el rango.",
  "fuente": "Clave, paso 1, profundizar 3",
  "claves": [
   "ulp",
   "parámetro",
   "bits fijos"
  ]
 },
 {
  "etapa": "Clave",
  "url": "clave.html#paso-2",
  "p": "Si después se aplica SHA-512, ¿sirven de algo los 144 bits de la clave?",
  "r": "Sí: esos 144 bits (formato >ddH, 18 bytes) son exactamente la entrada de SHA-512, y cambiar uno solo cambia todo el hash. Además, N se usa directamente como transitorio: N iteraciones en el cifrado y N + 1000 en las posiciones.",
  "f": "Los rangos de x0 y r ya no son necesarios para el caos después del hash, porque lo que entra al mapa logístico se reescala; se conservan como convención y el espacio se cuenta con ellos.",
  "fuente": "src/utils/caos.py, derivar_parametros: sha512(struct.pack('>ddH', x0, r, N))",
  "claves": [
   "hash",
   "entrada",
   "struct",
   "transitorio",
   "N"
  ]
 },
 {
  "etapa": "Clave",
  "url": "clave.html#paso-7",
  "p": "¿Qué pasa si los valores derivados del hash no quedan en el rango de trabajo?",
  "r": "No puede pasar: u está en [0, 1), así que x = 0.001 + 0.998·u queda en [0.001, 0.999) y r = 3.99 + 0.01·u en [3.99, 4). Cualquier clave cae dentro por construcción.",
  "f": "Los rangos evitan que x sea 0 o 1 (el mapa se queda en 0) y mantienen r cerca de 4, donde hay caos. Aun ahí hay ventanas periódicas (por ejemplo, de periodo 5 cerca de r ≈ 3.9903); por eso la prueba de validez exige los tres exponentes de Lyapunov positivos.",
  "fuente": "src/utils/caos.py, derivar_parametros y clave_valida",
  "claves": [
   "rango",
   "escalado",
   "fuera de rango",
   "ventana periódica",
   "u"
  ]
 },
 {
  "etapa": "Clave",
  "url": "clave.html#paso-7",
  "p": "¿Por qué hay tres secuencias caóticas?",
  "r": "Dos se binarizan y se combinan con XOR para formar el flujo de clave del cifrado; la tercera (xp, rp) elige las posiciones en el audio. Así, dónde va cada bit es independiente de qué bit es.",
  "f": "Una sola logística binarizada con r < 4 tiene sesgo (52.8 % y 51.2 % de unos en el caso); el XOR lo reduce a ≈ 0.07 %.",
  "fuente": "Clave, paso 7; Cifrado",
  "claves": [
   "tres",
   "3",
   "XOR",
   "posiciones",
   "sesgo"
  ]
 },
 {
  "etapa": "Clave",
  "url": "clave.html#paso-6-1",
  "p": "¿Por qué se desplaza cada bloque 11 bits a la derecha (≫ 11) y luego se divide por 2^53?",
  "r": "Porque float64 tiene 53 bits de precisión en la mantisa: con 53 bits el entero cabe exacto y dividir por 2^53 solo cambia el exponente, sin redondeo. El resultado está en [0, 1), puede valer 0 y nunca vale 1.",
  "f": "u<sub>j</sub> = ⌊H<sub>j</sub>/2<sup>11</sup>⌋ / 2<sup>53</sup> ∈ {0, 1/2<sup>53</sup>, …, 1 − 1/2<sup>53</sup>}. Cada punto de la rejilla tiene exactamente 2<sup>11</sup> preimágenes, así que si H<sub>j</sub> es uniforme, u<sub>j</sub> es uniforme en la rejilla y truncar no introduce sesgo. Frente a la uniforme continua en [0, 1), la función de distribución difiere en menos de 2<sup>−53</sup>. Es la misma construcción de genrand_res53.",
  "fuente": "Clave, paso 6 y su capa; modelo.js, función uniforme; Matsumoto y Nishimura (1998), Mersenne Twister",
  "claves": [
   "≫ 11",
   "2^53",
   "mantisa",
   "uniforme",
   "genrand_res53",
   "u_j"
  ]
 },
 {
  "etapa": "Clave",
  "url": "clave.html#paso-7-1",
  "p": "Al escalar u<sub>j</sub> a [3.99, 4), ¿se conserva la uniformidad de los parámetros r?",
  "r": "Casi. En [3.99, 4) hay menos float64 que valores de u, así que varios u caen en el mismo r. La falta de uniformidad relativa es de a lo sumo ≈ 1/400.",
  "f": "En [3.99, 4) hay ≈ 2<sup>44.36</sup> float64 separados por 2<sup>−51</sup>. Cada r(1) = fl(3.99 + 0.01·u₂) recibe 399, 400 o 401 de los 2<sup>53</sup> valores de u₂ (comprobado en 2·10⁶ valores consecutivos); para rp, de ancho 0.0099, son 403 a 405. Para x(1) el mapeo es inyectivo por debajo de 0.5; por encima, la ulp (2<sup>−53</sup>) supera el paso 0.998·2<sup>−53</sup> y algunos vecinos coinciden: x(1) toma ≈ 2<sup>53</sup> valores.",
  "fuente": "Clave, paso 7, capa 1 (cálculo propio con modelo.js)",
  "claves": [
   "escalado",
   "redondeo",
   "fl",
   "uniformidad",
   "preimágenes",
   "ulp"
  ]
 },
 {
  "etapa": "Clave",
  "url": "clave.html#paso-7-2",
  "p": "¿Pueden dos claves distintas producir la misma secuencia 1? ¿Y el mismo flujo de clave?",
  "r": "La misma secuencia 1, sí: hay más claves que pares (x(1), r(1)), y en promedio unas 5 claves la comparten. El mismo flujo completo es despreciable, porque además debe coincidir la secuencia 2.",
  "f": "Con N fijo hay ≈ 2<sup>99.64</sup> claves válidas y solo ≈ 2<sup>53</sup>·2<sup>44.36</sup> = 2<sup>97.36</sup> pares (x(1), r(1)): por el palomar, unas 5 claves por par. Los cuatro parámetros admiten ≈ 2<sup>194.7</sup> combinaciones; con oráculo aleatorio, dos claves con el mismo N coinciden con probabilidad ≈ 2<sup>−194.7</sup>. Por el cumpleaños se esperan ≈ 2<sup>16.8</sup> parejas, una fracción ≈ 2<sup>−95</sup> de las claves.",
  "fuente": "Clave, paso 7, capa 2 (cálculo propio bajo oráculo aleatorio)",
  "claves": [
   "palomar",
   "colisión",
   "claves equivalentes",
   "cumpleaños",
   "secuencia 1"
  ]
 },
 {
  "etapa": "Clave",
  "url": "clave.html#paso-2-1",
  "p": "¿Los float64 están repartidos de forma pareja en [0.001, 0.999]?",
  "r": "No. La distancia entre float64 vecinos (ulp) crece con el valor: hay más valores de x0 cerca de 0 que cerca de 1. Por eso el espacio de claves cuenta valores representables, no un intervalo de reales.",
  "f": "Un float64 normal es x = (−1)<sup>s</sup>·2<sup>e−1023</sup>·(1.f)₂, con ulp(x) = 2<sup>e−1023−52</sup>. Dentro de [0.001, 0.999] la ulp va de 2<sup>−62</sup> a 2<sup>−53</sup>. x0 = 0.123456 se guarda como 3fbf9acffa7eb6bf, con e − 1023 = −4 y ulp 2<sup>−56</sup> ≈ 1.39·10<sup>−17</sup>. Todo r ∈ [3.99, 4) tiene e − 1023 = 1 y ulp constante 2<sup>−51</sup> ≈ 4.44·10<sup>−16</sup>.",
  "fuente": "Clave, paso 2 y su capa; IEEE 754-2019, binary64",
  "claves": [
   "ulp",
   "float64",
   "binary64",
   "exponente",
   "mantisa",
   "densidad de representables"
  ]
 },
 {
  "etapa": "Clave",
  "url": "clave.html#paso-3-1",
  "p": "¿Qué significa suponer que SHA-512 es un «oráculo aleatorio» y qué límites tiene ese supuesto?",
  "r": "Que cada entrada recibe una salida uniforme e independiente, de modo que los ocho bloques h1…h8 son uniformes e independientes. Es un supuesto heurístico, no un teorema, y el hash no agrega entropía.",
  "f": "Contra una función ideal de 512 bits, hallar una preimagen cuesta del orden de 2<sup>512</sup> evaluaciones y una colisión 2<sup>256</sup>; no se conocen ataques prácticos contra SHA-512 completa. Canetti, Goldreich y Halevi muestran esquemas seguros con oráculo aleatorio que dejan de serlo con cualquier función concreta. Hay a lo sumo tantas salidas como claves, 2<sup>112.91</sup>.",
  "fuente": "Clave, paso 3, capa; NIST FIPS 180-4; Bellare y Rogaway (1993); Canetti, Goldreich y Halevi (2004)",
  "claves": [
   "oráculo aleatorio",
   "SHA-512",
   "preimagen",
   "colisión",
   "entropía",
   "heurístico"
  ]
 },
 {
  "etapa": "Clave",
  "url": "clave.html#paso-9-1",
  "p": "¿Cómo se sabe que 243 bits cambiados de 512 es un efecto avalancha «bueno» y no un resultado sesgado?",
  "r": "Se compara con lo esperado si cada bit cambia con probabilidad 1/2: una binomial con media 256. El valor observado es compatible con ese ideal, aunque un solo experimento es solo una comprobación de cordura.",
  "f": "D ~ Bin(512, 1/2), E[D] = 256, σ = √128 ≈ 11.3. Con x0 + 10<sup>−15</sup> (72 ulp, 5 de los 144 bits de entrada) se observó D = 243: z ≈ −1.15 y P(|D − 256| ≥ 13) ≈ 0.27. En el flujo cambiaron 682 de 1400 bits, frente a 700 ± 18.7 (P ≈ 0.35). Criterio de Webster y Tavares; para SHA-512 está respaldado empíricamente, no demostrado.",
  "fuente": "Clave, paso 9 y su capa; Webster y Tavares (1985), CRYPTO ’85",
  "claves": [
   "avalancha",
   "binomial",
   "criterio estricto de avalancha",
   "z",
   "Webster Tavares"
  ]
 },
 {
  "etapa": "Caos",
  "url": "preguntas.html#paso-8",
  "p": "¿SHA-512 produce las secuencias?",
  "r": "No: SHA-512 solo produce una cadena fija de 512 bits, y las secuencias salen del mapa logístico.",
  "f": "El mapa logístico se itera a partir de los valores que se toman de esa cadena.",
  "fuente": "Preguntas frecuentes, pregunta 8",
  "claves": []
 },
 {
  "etapa": "Caos",
  "url": "preguntas.html#paso-10",
  "p": "¿«8n iteraciones adicionales» significa que antes hubo otras 8n?",
  "r": "No: «adicionales» quiere decir después del transitorio, las N iteraciones iniciales que se descartan.",
  "f": "Cada secuencia se itera N veces y esos valores se descartan (transitorio). Después se itera 8n veces más y esos sí se usan, uno por bit.",
  "fuente": "Preguntas frecuentes, pregunta 10",
  "claves": []
 },
 {
  "etapa": "Caos",
  "url": "caos.html#paso-6-1",
  "p": "¿Qué es exactamente el exponente de Lyapunov y por qué su máximo es ln 2?",
  "r": "Es la tasa media de estiramiento por paso: el promedio de ln|f′(x<sub>i</sub>)| a lo largo de la secuencia. Si es positivo, las diferencias crecen exponencialmente. En r = 4 vale exactamente ln 2 ≈ 0.6931.",
  "f": "λ(x₀) = lim<sub>n→∞</sub> (1/n) Σ ln|f′<sub>r</sub>(x<sub>i</sub>)|, con f′<sub>r</sub>(x) = r(1 − 2x). Si existe una medida invariante ergódica μ, Birkhoff da el mismo valor para μ-casi todo x₀: λ = ∫ ln|f′<sub>r</sub>| dμ. En r = 4, con la densidad del arcoseno, la integral es ln 2 (también por la conjugación con la tienda, de pendiente ±2); numéricamente 0.6931475 y con 10⁷ iteraciones 0.6931471.",
  "fuente": "Caos, paso 6, capa 1; Ott (2002), caps. 2 y 3",
  "claves": [
   "Lyapunov",
   "Birkhoff",
   "ergódico",
   "ln 2",
   "estiramiento",
   "medida invariante"
  ]
 },
 {
  "etapa": "Caos",
  "url": "caos.html#paso-6-2",
  "p": "¿Cómo se estima λ en la práctica y cuánto se puede confiar en ese número?",
  "r": "Se arranca en x = 0.3, se descartan 20 000 iteraciones y se promedian 4000 términos. El signo es fiable; el cuarto decimal no.",
  "f": "λ̂ = (1/4000) Σ ln|r(1 − 2x<sub>i</sub>)|. Con 200 arranques, la desviación típica de λ̂ es 0.0038, 0.0026 y 0.0031 para r(1), r(2) y rp; λ̂ = 0.6483, 0.6748, 0.6576 frente a 0.6433, 0.6734, 0.6615 con 10⁷ términos (diferencias de ≈ 1.3 desviaciones). λ ≈ 0.65 está a más de cien desviaciones de 0. Limitación: en una ventana de periodo largo el transitorio puede dar λ̂ > 0 aunque λ < 0.",
  "fuente": "Caos, paso 6, capa 2; Clave, paso 10, capa; modelo.js, función lyapunov",
  "claves": [
   "estimación",
   "Lyapunov",
   "desviación típica",
   "transitorio",
   "x = 0.3",
   "λ̂"
  ]
 },
 {
  "etapa": "Caos",
  "url": "caos.html#paso-5-2",
  "p": "¿Qué es una ventana periódica y qué tan probable es que un r de [3.99, 4) caiga en una?",
  "r": "Es un intervalo de r donde la secuencia termina en un ciclo atractor en vez de ser caótica. Hay ventanas cerca de cualquier r, pero ocupan poco: en una rejilla de [3.99, 4) el 0.74 % dio λ < 0.",
  "f": "Los r con ciclo atractor forman un conjunto abierto y denso (Graczyk–Świątek; Lyubich, 1997), y los r con λ > 0 tienen medida de Lebesgue positiva, con r = 4 punto de densidad (Jakobson, 1981). Ejemplo: una ventana de periodo 5 cerca de r ≈ 3.99027, de ancho ≈ 6·10<sup>−5</sup>. Por Singer hay a lo sumo un ciclo atractor y atrae al punto crítico 1/2, así que basta seguir la secuencia desde 1/2. El caos es típico en medida pero no robusto.",
  "fuente": "Caos, paso 5, capa 2 y paso 3, capa; Jakobson (1981); Graczyk y Świątek (1997); Lyubich (1997); Singer (1978)",
  "claves": [
   "ventana periódica",
   "ciclo atractor",
   "denso",
   "Jakobson",
   "Singer",
   "periodo 5"
  ]
 },
 {
  "etapa": "Caos",
  "url": "caos.html#paso-5-1",
  "p": "¿En qué sentido preciso se afirma que todo r ∈ [3.99, 4] es caótico?",
  "r": "En el sentido de Li–Yorke: como el periodo 3 aparece en r = 1 + √8 ≈ 3.8284 y se conserva para r mayores, hay ciclos de todos los periodos y un conjunto no numerable de puntos «revueltos». Eso no garantiza que una secuencia típica sea caótica.",
  "f": "Sharkovskii: si una función continua de un intervalo en sí mismo tiene un ciclo de periodo p y p ▷ q, también tiene uno de periodo q (3 ▷ 5 ▷ 7 ▷ … ▷ 2² ▷ 2 ▷ 1). Li–Yorke: periodo 3 implica un conjunto S con limsup |fⁿx − fⁿy| > 0 y liminf |fⁿx − fⁿy| = 0 para x ≠ y. Limitación: S puede tener medida cero y convivir con un ciclo atractor.",
  "fuente": "Caos, paso 5, capa 1; Sharkovskii (1964); Li y Yorke (1975); Milnor y Thurston (1988)",
  "claves": [
   "Li–Yorke",
   "Sharkovskii",
   "periodo 3",
   "caos topológico",
   "medida cero"
  ]
 },
 {
  "etapa": "Caos",
  "url": "caos.html#paso-7-1",
  "p": "Si float64 es un conjunto finito, ¿las secuencias caóticas del modelo acaban repitiéndose?",
  "r": "Sí: toda secuencia calculada en float64 es finalmente periódica. Para las secuencias del caso, el ciclo empieza después de millones de iteraciones, muy lejos de las menos de 10⁴ que usa el modelo.",
  "f": "En [0, 1] hay 4 607 182 418 800 017 409 ≈ 2<sup>62</sup> float64 y F(x) = fl(fl(rx)·fl(1 − x)) va de ese conjunto en sí mismo; por el palomar existen μ, L ≥ 1 con x<sub>μ+L</sub> = x<sub>μ</sub>. Con el algoritmo de Brent: secuencia 1, entrada tras 12 015 279 y periodo 9 213 816; secuencia 2, 21 158 433 y 2 774 760; posiciones, 27 443 276 y 3 494 724. Las longitudes cambian con cada clave y no hay fórmula.",
  "fuente": "Caos, paso 7, capa 1; Brent (1980), BIT 20; cálculo propio en C y JavaScript",
  "claves": [
   "ciclos",
   "float64",
   "periodo",
   "Brent",
   "palomar",
   "finalmente periódica"
  ]
 },
 {
  "etapa": "Caos",
  "url": "caos.html#paso-7-2",
  "p": "Si el caos amplifica cualquier error, ¿cómo pueden emisor y receptor obtener exactamente la misma secuencia?",
  "r": "Porque IEEE 754 exige redondeo correcto de cada operación: la misma expresión en el mismo orden da los mismos bits en JavaScript y en NumPy. Si cambia la expresión, la secuencia se pierde en unas 58 iteraciones.",
  "f": "fl(a ∘ b) = (a ∘ b)(1 + δ), |δ| ≤ 2<sup>−53</sup>. Se rompe con una FMA introducida por el compilador, la precisión extendida de x87 o al escribir r·x − r·x². La secuencia calculada tampoco es la exacta: para r = 3.8, Hammel, Yorke y Grebogi probaron una sombra a menos de 10<sup>−8</sup> en 10⁷ pasos; para los r del modelo no está probado. Al cifrado le basta que ambos calculen la misma secuencia aproximada.",
  "fuente": "Caos, paso 7, capa 2; IEEE 754-2019; Hammel, Yorke y Grebogi (1987)",
  "claves": [
   "reproducibilidad",
   "IEEE 754",
   "FMA",
   "x87",
   "sombra",
   "shadowing"
  ]
 },
 {
  "etapa": "Caos",
  "url": "caos.html#paso-4-1",
  "p": "¿Cuántas iteraciones bastan para que una diferencia mínima se vuelva total, y qué relación tiene eso con el transitorio N?",
  "r": "Con λ ≈ 0.65, una diferencia de una ulp llega al tamaño de [0, 1] en unas 58 iteraciones. El transitorio mínimo, N = 100, ya supera ese horizonte, y el del caso (6173) lo supera unas cien veces.",
  "f": "δₙ ≈ δ₀·e<sup>λn</sup>, de donde n* ≈ (1/λ)·ln(Δ/δ₀). Con λ = 0.6483, δ₀ = 10<sup>−10</sup> y Δ = 0.1 sale n* ≈ 32 (la escena muestra la separación en la iteración 33); con δ₀ = una ulp de x(1), 2<sup>−54</sup> ≈ 5.6·10<sup>−17</sup>, y Δ = 1, n* ≈ 58. Es un comportamiento medio: el factor local |f′(x<sub>i</sub>)| va de 0 a r y la separación se satura en el tamaño del intervalo.",
  "fuente": "Caos, paso 4 y su capa; Ott (2002)",
  "claves": [
   "sensibilidad",
   "condiciones iniciales",
   "horizonte",
   "transitorio",
   "ulp",
   "n*"
  ]
 },
 {
  "etapa": "Caos",
  "url": "caos.html#paso-8-1",
  "p": "¿El mapa logístico con r < 4 cubre todo [0, 1]? ¿Qué consecuencia tiene para el umbral 0.5?",
  "r": "No: su máximo es r/4 < 1, y la secuencia vive en [f<sub>r</sub>(r/4), r/4], que para r(1) es [0.0082, 0.9979]. Solo en r = 4 la densidad es simétrica y el umbral 0.5 da exactamente la mitad de unos; con r < 4 hay un sesgo pequeño.",
  "f": "En r = 4 la densidad invariante es ρ(x) = 1/(π√(x(1 − x))), con ρ(x) = ρ(1 − x) y ∫<sub>1/2</sub><sup>1</sup> ρ = 1/2. Para r < 4 la densidad, cuando existe, no tiene fórmula ni simetría. Con 10⁷ iteraciones: 52.77 % de unos para r(1), 51.22 % para r(2) y 53.34 % para rp; en los 1400 bits del caso, 52.57 % y 52.79 %, con ±1.34 % por azar. Con r entre 3.7 y 3.8 salió 72.7 % de unos.",
  "fuente": "Caos, paso 8, capa 1, paso 1 (máximo r/4) y paso 5; Ulam y von Neumann (1947)",
  "claves": [
   "umbral 0.5",
   "sobreyectivo",
   "arcoseno",
   "densidad invariante",
   "sesgo",
   "r/4"
  ]
 },
 {
  "etapa": "Caos",
  "url": "caos.html#paso-8-2",
  "p": "¿Los bits que salen del umbral son independientes entre sí?",
  "r": "En r = 4 y con x₀ distribuido según la densidad invariante, sí: está demostrado. En el modelo no se cumple ninguna de esas hipótesis, y para r(1) se mide una correlación pequeña entre bits vecinos.",
  "f": "Con x = sin²(πθ), f₄ actúa como θ ↦ 2θ mod 1; si θ = 0.d₁d₂d₃… en binario, x > 1/2 equivale a d₁ ≠ d₂, así que bₙ = d<sub>n+1</sub> ⊕ d<sub>n+2</sub>, monedas justas independientes si θ es uniforme. Para r(1): P(bₙ = b<sub>n+1</sub> = 1) = 0.2663 frente a p² = 0.2786; en r = 4, 0.2504 frente a 0.2502 (2·10⁶ iteraciones).",
  "fuente": "Caos, paso 8, capa 2; Devaney (1989), dinámica simbólica",
  "claves": [
   "independencia",
   "dinámica simbólica",
   "duplicación",
   "correlación",
   "bits vecinos"
  ]
 },
 {
  "etapa": "Caos",
  "url": "caos.html#paso-9-1",
  "p": "¿Cuánto reduce el XOR el sesgo de los bits, y qué supuesto necesita esa cuenta?",
  "r": "Baja el sesgo de casi 3 % a 0.07 %, como predice el lema de acumulación. La cuenta supone que las dos secuencias son independientes, algo que no está demostrado.",
  "f": "Si P(bᵢ = 1) = 1/2 + εᵢ y los bits son independientes, P(b₁ ⊕ b₂ = 1) = 1/2 − 2ε₁ε₂. Con ε₁ = 0.0277 y ε₂ = 0.0122 (10⁷ iteraciones) el lema predice 0.49933 y se mide 0.49929. El XOR también baja la covarianza entre vecinos, P(11) − p², de −0.012 a +0.0005, sin anularla. Pasar pruebas estadísticas no es seguridad: hay ataques conocidos a generadores caóticos.",
  "fuente": "Caos, paso 9, capa; Matsui (1993); Alvarez y Li (2006)",
  "claves": [
   "XOR",
   "lema de acumulación",
   "piling-up",
   "sesgo",
   "independencia",
   "Matsui"
  ]
 },
 {
  "etapa": "Cifrado",
  "url": "preguntas.html#paso-9",
  "p": "¿Por qué se binarizan las dos secuencias y luego se aplica XOR?",
  "r": "Para que quien reconstruyera una de las secuencias todavía necesitara la otra: el flujo de clave es la XOR de las dos.",
  "f": "Con el umbral en 0.5 cada número se vuelve un bit: mayor que 0.5 da 1, menor o igual da 0. La XOR de las dos cadenas de bits es el flujo de clave.",
  "fuente": "Preguntas frecuentes, pregunta 9",
  "claves": []
 },
 {
  "etapa": "Cifrado",
  "url": "cifrado.html#paso-5",
  "p": "¿Por qué se cifra con XOR y no con otra operación?",
  "r": "Porque el mismo procedimiento cifra y descifra, el cifrado mide lo mismo que el mensaje y el costo crece en proporción a la longitud. Si el flujo de clave está equilibrado y no se puede predecir, el cifrado no conserva la estadística del texto.",
  "f": "XOR es involutivo: (m ⊕ k) ⊕ k = m ⊕ (k ⊕ k) = m ⊕ 0 = m. El costo es O(n) operaciones de bytes: 175 bytes, 175 XOR. Es un cifrado de flujo del tipo de Vernam, cuya clave larga la genera el mapa logístico a partir de la clave corta K.",
  "fuente": "cifrado.html, pasos 4 y 5 (detalle técnico)",
  "claves": [
   "XOR",
   "involutivo",
   "Vernam",
   "cifrado de flujo",
   "costo lineal"
  ]
 },
 {
  "etapa": "Cifrado",
  "url": "cifrado.html#paso-5-1",
  "p": "Si imita al cifrado de Vernam, ¿tiene secreto perfecto? ¿Su seguridad está demostrada?",
  "r": "No. El flujo de 1400 bits sale de una clave de 112.91 bits, mucho menos que los mensajes posibles, así que la seguridad solo puede ser computacional. Y para generadores basados en el mapa logístico no hay demostración: es un supuesto respaldado por pruebas empíricas.",
  "f": "Shannon exige al menos tantas claves como mensajes: |K| = 2<sup>112.91</sup> ≪ 2<sup>1400</sup>, y cada c es compatible con a lo más 2<sup>112.91</sup> mensajes. G sería seguro si ningún algoritmo eficiente distingue G(K) de bits uniformes con ventaja apreciable; para el mapa logístico no hay reducción a un problema difícil conocido, y varios cifrados caóticos publicados se han roto.",
  "fuente": "cifrado.html, paso 5, capas 1 y 2; Shannon (1949); Katz y Lindell (2020), cap. 3; Álvarez y Li (2006)",
  "claves": [
   "secreto perfecto",
   "Shannon",
   "generador pseudoaleatorio",
   "seguridad computacional",
   "distinguidor"
  ]
 },
 {
  "etapa": "Cifrado",
  "url": "cifrado.html#paso-7-2",
  "p": "¿Qué pasa si se reutiliza la misma clave para dos mensajes?",
  "r": "Los dos mensajes reciben el mismo flujo y las mismas posiciones, porque el modelo no usa nonce. Al combinar los dos cifrados el flujo se cancela y queda la XOR de los dos mensajes comprimidos, que se puede atacar.",
  "f": "c ⊕ c′ = (m ⊕ k) ⊕ (m′ ⊕ k) = m ⊕ m′, atacable con texto conocido o con su estructura (caso histórico: Venona). Si además se ocultan en el mismo audio, las muestras cuyo LSB difiere delatan cerca de la mitad de las posiciones. Por eso K debe usarse una sola vez, o añadirse un nonce público a la entrada de SHA-512 (propuesta ajena al artículo).",
  "fuente": "cifrado.html, paso 7, capa 2; Katz y Lindell (2020), cap. 3",
  "claves": [
   "reutilización de clave",
   "nonce",
   "two-time pad",
   "Venona",
   "m ⊕ m′"
  ]
 },
 {
  "etapa": "Cifrado",
  "url": "cifrado.html#paso-7-1",
  "p": "Las dos secuencias tienen 256 bits de estado: ¿eso da 256 bits de seguridad?",
  "r": "No. Los cuatro valores (x₁, r₁, x₂, r₂) se derivan de K con funciones deterministas, así que la búsqueda exhaustiva queda acotada por la clave: a lo más 112.91 bits.",
  "f": "H(x<sub>1</sub>, r<sub>1</sub>, x<sub>2</sub>, r<sub>2</sub>) ≤ H(K) ≤ 112.91 bits. Además r<sub>1</sub> ∈ [3.99, 4) toma a lo más 2<sup>44.4</sup> valores float64 distintos. Un ataque de correlación (Siegenthaler) aprovecharía que b coincide con b<sup>(1)</sup> con probabilidad 0.4878; su costo frente a buscar K no se ha analizado.",
  "fuente": "cifrado.html, paso 7 y capa 1; Siegenthaler (1985)",
  "claves": [
   "estado interno",
   "256 bits",
   "espacio de clave",
   "ataque de correlación",
   "Siegenthaler"
  ]
 },
 {
  "etapa": "Cifrado",
  "url": "cifrado.html#paso-4-1",
  "p": "¿El cifrado XOR protege contra alteraciones del mensaje?",
  "r": "No. Quien invierta bits del cifrado invierte los mismos bits del mensaje sin conocer la clave, y el receptor no lo detecta porque el modelo no tiene código de autenticación (MAC).",
  "f": "Dec<sub>K</sub>(c ⊕ Δ) = m ⊕ Δ; por ejemplo, alterar c<sub>2</sub> cambia la longitud declarada. En el audio, una alteración ciega de un LSB cae en el mensaje con probabilidad L/M ≈ 5.6 × 10<sup>−5</sup>. La solución estándar, ajena al artículo, es cifrar y luego autenticar (por ejemplo con HMAC-SHA-256).",
  "fuente": "cifrado.html, paso 4, capa 1; Bellare y Namprempre (2000)",
  "claves": [
   "integridad",
   "maleabilidad",
   "MAC",
   "HMAC",
   "autenticación"
  ]
 },
 {
  "etapa": "Cifrado",
  "url": "cifrado.html#paso-3-1",
  "p": "Si los dos primeros bytes guardan la longitud, ¿eso no le regala texto conocido al atacante?",
  "r": "Sí: quien tenga el cifrado conoce su tamaño y, con él, los dos primeros bytes del mensaje, así que recupera 16 bits del flujo. Esto no revela la clave si el generador es seguro (supuesto no demostrado), pero sirve de filtro en una búsqueda exhaustiva.",
  "f": "Con n = 175, m<sub>1</sub>m<sub>2</sub> = 00 AD y k<sub>1</sub>k<sub>2</sub> = c<sub>1</sub>c<sub>2</sub> ⊕ m<sub>1</sub>m<sub>2</sub> = 5A EB ⊕ 00 AD = 5A 46. En todo mensaje de menos de 256 bytes m<sub>1</sub> = 0 y c<sub>1</sub> = k<sub>1</sub>. De cada 2<sup>16</sup> claves candidatas pasa en promedio una, y el espacio sigue siendo 2<sup>112.91</sup>; en el canal esteganográfico, obtener c ya exige conocer las posiciones.",
  "fuente": "cifrado.html, paso 3 y capa 1; Katz y Lindell (2020), cap. 3",
  "claves": [
   "texto conocido",
   "cabecera de longitud",
   "big-endian",
   "0x00AD",
   "búsqueda exhaustiva"
  ]
 },
 {
  "etapa": "Cifrado",
  "url": "cifrado.html#paso-2-1",
  "p": "¿Qué ocurre si un bit del cifrado llega cambiado, o si se pierde un bit?",
  "r": "Un bit cambiado altera solo ese bit del mensaje, porque XOR no propaga errores; pero la decodificación aritmética posterior sí los propaga. Perder o insertar un bit desincroniza todo lo que sigue.",
  "f": "El cifrado es síncrono: el flujo k = G(K) no depende de m ni de c, y c<sub>j</sub> = m<sub>j</sub> ⊕ k<sub>j</sub>. Por eso emisor y receptor deben generar exactamente la misma secuencia en float64.",
  "fuente": "cifrado.html, paso 2, capa 1; Menezes, van Oorschot y Vanstone (1996), cap. 6",
  "claves": [
   "cifrado síncrono",
   "propagación de errores",
   "desincronización",
   "float64"
  ]
 },
 {
  "etapa": "Cifrado",
  "url": "cifrado.html#paso-6-1",
  "p": "Si el histograma del texto cifrado sale plano, ¿eso demuestra que el cifrado es seguro?",
  "r": "No. La uniformidad es necesaria pero no suficiente: un flujo predecible para quien conozca su estructura también aplana el histograma. Las baterías estadísticas miden más propiedades y tampoco demuestran seguridad.",
  "f": "Para 98 bytes uniformes se esperan 256(1 − (255/256)<sup>98</sup>) ≈ 81.6 valores distintos y el verso cifrado tiene 84. Con 98 muestras la entropía empírica no pasa de log<sub>2</sub> 98 ≈ 6.61 Sh por byte: el cifrado da 6.33 y el texto 4.17.",
  "fuente": "cifrado.html, paso 6, capa 1 (cálculo propio con el verso y el flujo del caso); NIST SP 800-22",
  "claves": [
   "histograma",
   "uniformidad",
   "entropía empírica",
   "NIST SP 800-22",
   "valores distintos"
  ]
 },
 {
  "etapa": "Cifrado",
  "url": "cifrado.html#paso-6-2",
  "p": "¿Por qué ayuda comprimir antes de cifrar?",
  "r": "Porque reduce la redundancia del texto y así alarga la distancia de unicidad: es más difícil reconocer la clave correcta en una búsqueda exhaustiva. Comprimir no sustituye a un generador seguro.",
  "f": "U ≈ H(K)/D, con D = log<sub>2</sub>|Σ| − H<sub>r</sub>. Con H(K) ≤ 112.91 bits y un texto sin comprimir con D ≈ 6 bits por byte (valor ilustrativo), U ≈ 19 bytes; comprimir acerca D a 0. El formato deja algo de redundancia: la longitud y el final del código aritmético.",
  "fuente": "cifrado.html, paso 6, capa 2; Shannon (1949)",
  "claves": [
   "distancia de unicidad",
   "redundancia",
   "compresión",
   "Shannon"
  ]
 },
 {
  "etapa": "Inserción",
  "url": "insercion.html#paso-5",
  "p": "¿Para qué sirven xp y rp?",
  "r": "Son el valor inicial y el parámetro de la tercera secuencia, la de posiciones. Se descartan las primeras Np = N + 1000 iteraciones y cada valor siguiente da una muestra del audio donde se esconde un bit.",
  "fuente": "src/utils/caos.py, generar_posiciones_caoticas",
  "claves": [
   "xp",
   "rp",
   "posiciones",
   "tercera secuencia"
  ]
 },
 {
  "etapa": "Inserción",
  "url": "insercion.html#paso-5",
  "p": "¿Por qué rp usa 0.0099 y no 0.01?",
  "r": "Con 0.0099, rp queda en [3.99, 3.9999). El código no documenta el motivo, así que no debe presentarse como un resultado; es una decisión de diseño que mantiene rp un poco más lejos de r = 4.",
  "fuente": "src/utils/caos.py, línea 148 (sin comentario)",
  "claves": [
   "0.0099",
   "rp",
   "margen"
  ]
 },
 {
  "etapa": "Inserción",
  "url": "insercion.html#paso-5",
  "p": "¿Cómo se convierte un valor de la secuencia en una posición del audio?",
  "r": "Con p = ⌊y · M⌋: y ∈ (0, 1) indica en qué fracción del audio cae el bit, y · M lo pasa a número de muestra y ⌊ ⌋ quita los decimales porque las muestras se numeran con enteros.",
  "f": "Ejemplo: y = 0.9968405145514073, y · M = 25 064 111.3, p₁ = 25 064 111.",
  "fuente": "src/utils/caos.py, línea 116: pos = int(x * total_muestras)",
  "claves": [
   "posición",
   "parte entera",
   "piso",
   "floor",
   "y·M"
  ]
 },
 {
  "etapa": "Inserción",
  "url": "insercion.html#paso-3",
  "p": "¿De dónde sale M = 25 143 552?",
  "r": "Del audio: WAV PCM de 16 bits, 44 100 Hz, estéreo, 4 min 45 s. Son 12 571 776 tramas de 2 muestras (izquierda y derecha), leídas intercaladas como una sola lista.",
  "fuente": "Inserción, paso 3",
  "claves": [
   "M",
   "muestras",
   "audio",
   "duración",
   "estéreo"
  ]
 },
 {
  "etapa": "Inserción",
  "url": "insercion.html#paso-5",
  "p": "¿Pueden dos valores de la secuencia dar la misma posición?",
  "r": "Sí. El código guarda las posiciones usadas y, si una se repite, la salta y sigue iterando hasta tener 1400 distintas; el receptor hace lo mismo y queda sincronizado. En el caso no hubo ninguna repetida.",
  "f": "Por la paradoja del cumpleaños se esperan 1400²/(2M) ≈ 0.04 colisiones si y fuera uniforme; con la densidad arcoseno del mapa logístico, ≈ 0.17 por mensaje.",
  "fuente": "src/utils/caos.py, líneas 98 y 120-122 (if pos not in usadas)",
  "claves": [
   "colisión",
   "repetida",
   "cumpleaños",
   "usadas"
  ]
 },
 {
  "etapa": "Inserción",
  "url": "insercion.html#paso-5",
  "p": "¿Por qué y · M da un número con decimales si las muestras son enteras?",
  "r": "Porque y es real; y · M casi nunca es entero. Ese valor no es una muestra, es un paso intermedio: ⌊ ⌋ se queda con la parte entera, que sí es el índice.",
  "fuente": "src/utils/caos.py, línea 116",
  "claves": [
   "decimal",
   "muestra decimal",
   "entero"
  ]
 },
 {
  "etapa": "Inserción",
  "url": "insercion.html#paso-5",
  "p": "Si y = 0.620275, ¿por qué p₈ = 15 595 907 y no 15 595 916?",
  "r": "0.620275 es y redondeado a 6 decimales para mostrarlo. El cálculo usa y completo, 0.6202746203268334, y con ese y · M = 15 595 907.17.",
  "f": "Como M ≈ 2.5 · 10^7, redondear y a 6 decimales puede correr la posición hasta unas 13 muestras; por eso todo se calcula en float64 de forma determinista.",
  "fuente": "Inserción, paso 5 (tabla en «i»)",
  "claves": [
   "redondeo",
   "precisión",
   "float64",
   "0.620275"
  ]
 },
 {
  "etapa": "Inserción",
  "url": "insercion.html#paso-7",
  "p": "¿En qué canal se oculta cada bit?",
  "r": "No se elige canal: si la posición p es par la muestra es del canal izquierdo y si es impar, del derecho. En el caso, 671 bits quedaron en el izquierdo y 729 en el derecho.",
  "fuente": "Inserción, pasos 3 y 7",
  "claves": [
   "canal",
   "izquierdo",
   "derecho",
   "estéreo",
   "par",
   "impar"
  ]
 },
 {
  "etapa": "Inserción",
  "url": "insercion.html#paso-4-1",
  "p": "¿Cuál es la capacidad del audio y qué tasa de inserción usa el caso?",
  "r": "Con un bit por muestra caben M = 25 143 552 bits, unos 3.14 MB; el caso usa 1400 bits, una muestra de cada 18 000 aproximadamente. El límite práctico lo pone el campo de longitud de 2 bytes.",
  "f": "α = L/M = 1400 / 25 143 552 ≈ 5.57 × 10<sup>−5</sup> bits por muestra (0.0056 %). El mensaje comprimido no puede superar 2<sup>16</sup> − 1 = 65 535 bytes: L<sub>max</sub> = 8 (65 535 + 2) = 524 296 bits, el 2.09 % de M. La capacidad útil es algo menor porque las muestras cercanas a los extremos nunca se eligen.",
  "fuente": "insercion.html, paso 4 y capa 1",
  "claves": [
   "capacidad",
   "tasa de inserción",
   "bits por muestra",
   "65 535",
   "L máx"
  ]
 },
 {
  "etapa": "Inserción",
  "url": "insercion.html#paso-5-1",
  "p": "¿Hay muestras del audio que nunca pueden recibir un bit?",
  "r": "Sí. Tras el transitorio, la secuencia de posiciones queda en un intervalo invariante que no llega a 0 ni a 1, así que nunca elige las muestras del principio y del final del audio.",
  "f": "Con r<sub>p</sub> = 3.99602, y queda en [f(r<sub>p</sub>/4), r<sub>p</sub>/4] = [0.00397, 0.99901]: nunca se eligen las muestras p < 99 838 (primeros 1.13 s) ni p > 25 118 542 (últimos 0.28 s).",
  "fuente": "insercion.html, paso 5, capa 1; Lasota y Mackey (1994)",
  "claves": [
   "intervalo invariante",
   "transitorio",
   "r_p",
   "muestras excluidas",
   "extremos"
  ]
 },
 {
  "etapa": "Inserción",
  "url": "insercion.html#paso-6-1",
  "p": "¿Por qué las posiciones se concentran en los extremos del audio y qué riesgo implica?",
  "r": "Porque la densidad del mapa logístico se parece a la arcoseno, con picos cerca de 0 y de 1, y las posiciones heredan esa forma. Así, en los extremos la tasa local de inserción es mayor y un analista que conozca el algoritmo puede concentrar allí su búsqueda.",
  "f": "En el primer y último 5 % del audio caen 326 posiciones (23.3 %), frente al 10 % uniforme y al 24.5 % de la densidad con r<sub>p</sub>. χ² con 19 grados de libertad (crítico al 5 %: 30.1): 15.5 frente a la densidad con r<sub>p</sub> y 376.7 frente a la uniforme. En los últimos 5 s caen 109 bits: tasa local de 0.025 %, 4.4 veces la global. Una corrección posible, ajena al artículo, es usar ⌊F(y)·M⌋ con F(y) = (2/π) arcsen √y.",
  "fuente": "insercion.html, paso 5, capa 1 y paso 6, capa 1; Ulam y von Neumann (1947); principio de Kerckhoffs",
  "claves": [
   "densidad arcoseno",
   "concentración en extremos",
   "tasa local",
   "χ²",
   "Kerckhoffs"
  ]
 },
 {
  "etapa": "Inserción",
  "url": "insercion.html#paso-8",
  "p": "¿Por qué se usa el bit menos significativo y cuánto cambia cada muestra?",
  "r": "Porque es el bit que menos pesa: reemplazarlo mueve el valor de la muestra en 1 como mucho, y si ya valía el bit del mensaje la muestra no cambia.",
  "f": "s′ = (s ∧ ¬1) ∨ w = 2⌊s/2⌋ + w, con s′ − s ∈ {−1, 0, +1}. El cambio es de 1 nivel de 65 536; sobre un máximo de 32 767 es 0.003 % de la amplitud. Si w es equiprobable e independiente del LSB original, cada muestra cambia con probabilidad 1/2: se esperan 700 ± 18.7 cambios y hubo 695.",
  "fuente": "insercion.html, pasos 8 y 9 y capa 8-1",
  "claves": [
   "LSB",
   "bit menos significativo",
   "int16",
   "complemento a dos",
   "695 cambios"
  ]
 },
 {
  "etapa": "Inserción",
  "url": "insercion.html#paso-8-1",
  "p": "¿Qué es el reemplazo asimétrico del LSB y por qué importa frente al ataque χ²?",
  "r": "Al reemplazar el LSB, un valor par solo puede subir y uno impar solo bajar, así que cada par de valores (2k, 2k+1) tiende a igualar sus frecuencias. Esa huella es la que explotan el ataque χ² y el análisis RS.",
  "f": "El ataque χ² de Westfeld y Pfitzmann compara las frecuencias de cada par (2k, 2k+1); es fuerte con inserción secuencial y débil con posiciones dispersas. La variante «LSB matching», que suma o resta 1 al azar, evita la asimetría; el artículo usa reemplazo. Ni el artículo ni el sitio aplican estos detectores al estegoaudio.",
  "fuente": "insercion.html, paso 8, capa 1 y paso 10, capa 2; Westfeld y Pfitzmann (2000); Ker (2005); Fridrich, Goljan y Du (2001)",
  "claves": [
   "reemplazo asimétrico",
   "pares de valores",
   "ataque χ²",
   "análisis RS",
   "LSB matching"
  ]
 },
 {
  "etapa": "Inserción",
  "url": "insercion.html#paso-10-1",
  "p": "¿Cómo se mide la imperceptibilidad y qué valores se obtuvieron?",
  "r": "Con el error cuadrático medio (MSE) y la PSNR, además de la correlación entre muestras vecinas y la entropía. La PSNR fue de 135.89 dB, muy por encima de los 80 dB que el artículo adopta como umbral de transparencia acústica.",
  "f": "Como cada cambio es de ±1, MSE = 695 / 25 143 552 = 2.764 × 10<sup>−5</sup> y PSNR = 10 log<sub>10</sub>(32 767² / MSE) = 135.89 dB. Correlación entre vecinas: 0.9869, casi sin cambio; entropía 14.8785 en el original y 14.8786 en el estegoaudio (máximo 16 bits). La PSNR depende de M: el mismo mensaje en un audio 10 veces más corto da 10 dB menos.",
  "fuente": "insercion.html, paso 10 y capa 1",
  "claves": [
   "PSNR",
   "MSE",
   "imperceptibilidad",
   "transparencia acústica",
   "entropía",
   "correlación"
  ]
 },
 {
  "etapa": "Inserción",
  "url": "insercion.html#paso-9-1",
  "p": "Una PSNR tan alta, ¿significa que el mensaje es indetectable y resistente?",
  "r": "No. La PSNR mide distorsión, no seguridad: el artículo no reporta la tasa de acierto de ningún detector. Tampoco hay robustez: recomprimir, remuestrear o recortar el audio destruye el mensaje.",
  "f": "Cachin define la seguridad como D(P<sub>C</sub> ‖ P<sub>S</sub>) ≤ ε (divergencia de Kullback–Leibler entre portador y estegoaudio), pero para audio real P<sub>C</sub> es desconocida y ε no se puede calcular. Con 5.6 × 10<sup>−5</sup> bits por muestra se espera que los detectores fallen, pero no está medido; no hay código corrector, y un MP3 recalcularía las muestras y borraría el mensaje (por eso se usa WAV PCM).",
  "fuente": "insercion.html, pasos 2, 9 (capa 1) y 10 (capa 2); Cachin (2004)",
  "claves": [
   "indetectabilidad",
   "Cachin",
   "Kullback–Leibler",
   "robustez",
   "WAV",
   "MP3"
  ]
 },
 {
  "etapa": "Recuperación",
  "url": "recuperacion.html#paso-4",
  "p": "¿Cómo sabe el receptor cuántos bits leer y dónde termina el texto?",
  "r": "Hay dos marcas. Las 16 primeras posiciones guardan, cifrada, la longitud del mensaje comprimido (173 bytes), y con ella el receptor calcula cuántos bits leer. Dentro del mensaje comprimido, el token de fin le indica al decodificador cuándo parar.",
  "f": "Los 16 bits leídos, con XOR de los 2 primeros bytes del flujo de clave, dan 0x00AD = 173. Entonces n = 173 + 2 = 175 bytes y L = 175 × 8 = 1400 bits. El decodificador aritmético reconstruye tokens hasta el token de fin (Q + 1 = 294 símbolos). El último byte se completa con relleno, por eso 1377 ≤ ℓ<sub>bits</sub> ≤ 1384.",
  "fuente": "recuperacion.html, pasos 3, 4 y 7; compresion.html, paso 2 y paso 11",
  "claves": [
   "fin del mensaje",
   "cabecera",
   "longitud",
   "token de fin",
   "0x00AD",
   "16 bits",
   "relleno",
   "EOS"
  ]
 },
 {
  "etapa": "Recuperación",
  "url": "recuperacion.html#paso-2-1",
  "p": "Si la red no da resultados idénticos en distintos equipos, ¿por qué los parámetros que salen de SHA-512 sí son idénticos?",
  "r": "Porque SHA-512 es una función exacta sobre bytes, y las pocas operaciones de coma flotante que siguen (+, −, ×) tienen redondeo correcto exigido por IEEE 754. La red, en cambio, suma miles de términos en un orden que elige la biblioteca.",
  "f": "u<sub>i</sub> = ⌊H<sub>i</sub>/2¹¹⌋/2⁵³ deja 53 bits, la precisión de float64, así que la conversión es exacta; luego x = 0.001 + 0.998·u y r = 3.99 + 0.01·u. El resultado no depende del equipo siempre que no se fusionen operaciones (FMA) ni se use precisión extendida. En la red, el orden de las sumas cambia con procesador, hilos y bloque.",
  "fuente": "recuperacion.html, paso 2, capa 1 (IEEE 754-2019, sec. 4.3); compresion.html, paso 12, capa 1",
  "claves": [
   "determinismo",
   "SHA-512",
   "IEEE 754",
   "FMA",
   "redondeo correcto",
   "float64",
   "reproducibilidad entre equipos"
  ]
 },
 {
  "etapa": "Recuperación",
  "url": "recuperacion.html#paso-7-1",
  "p": "¿Por qué descomprimir tarda tanto como comprimir y no se puede hacer en paralelo?",
  "r": "Porque para saber las frecuencias del token t el receptor necesita haber decodificado todos los anteriores: cada token exige una pasada de la red. Por eso la descompresión tomó 56.77 s frente a 53.29 s de la compresión.",
  "f": "El decodificador elige el único v con F<sub>v</sub> ≤ ⌊((c − l + 1)·F − 1)/R⌋ < F<sub>v</sub> + f<sub>v</sub>, actualiza l y R como el codificador y renormaliza. Una pasada cuesta del orden de 2P operaciones por token con P = 1.54 × 10⁹, unas 9.1 × 10¹¹ para los 294 símbolos. La máscara causal permite repetir cada predicción sin conocer el token siguiente.",
  "fuente": "recuperacion.html, paso 7, capa 1 y paso 10, capa 1; compresion.html, paso 5, capa 1",
  "claves": [
   "decodificación secuencial",
   "paralelizar",
   "tiempo de descompresión",
   "56.77 s",
   "máscara causal",
   "autoregresivo"
  ]
 },
 {
  "etapa": "Recuperación",
  "url": "recuperacion.html#paso-8-1",
  "p": "¿Qué demuestra que los SHA-256 del original y del recuperado coincidan, y qué no demuestra?",
  "r": "Demuestra que, en este caso, el texto recuperado es idéntico al original, con una probabilidad despreciable de coincidencia por azar. No demuestra que el sistema funcione con otros textos o equipos: para eso están los 16 casos probados, una muestra limitada.",
  "f": "Si m̂ ≠ m y SHA-256 se modela como función aleatoria, P[SHA-256(m̂) = SHA-256(m)] = 2⁻²⁵⁶. Encontrar a propósito una colisión costaría del orden de 2¹²⁸ evaluaciones, pero aquí no hay adversario y además se hizo la comparación byte a byte. Los 16 casos fueron 4 textos por 4 audios en Colab con GPU.",
  "fuente": "recuperacion.html, paso 8, capa 1 y paso 9; NIST FIPS 180-4; Menezes et al. (1996), cap. 9",
  "claves": [
   "SHA-256",
   "verificación",
   "generalización",
   "16 casos",
   "colisión",
   "validez externa"
  ]
 },
 {
  "etapa": "Seguridad",
  "url": "preguntas.html#paso-11",
  "p": "¿De dónde sale el tamaño del espacio de clave?",
  "r": "Se cuentan los valores de cada componente en su rango y se suman sus bits: quedan 2<sup>112.91</sup> claves válidas.",
  "f": "Son 55.32 bits para x<sub>0</sub>, 44.36 para r y 13.27 para N. Suman 112.95; con el 97.67 % de claves válidas quedan 2<sup>112.91</sup>, más que el mínimo de 2<sup>100</sup>.",
  "fuente": "Preguntas frecuentes, pregunta 11",
  "claves": []
 },
 {
  "etapa": "Seguridad",
  "url": "seguridad.html#paso-8",
  "p": "¿Con cuántas claves se hizo el experimento de claves vecinas?",
  "r": "Con 200 claves válidas al azar, cada una cambiada de 3 formas (x0 + 1 ulp, r + 1 ulp, N + 1): 600 comparaciones. Se descartaron 22 vecinas no válidas. Las 300 claves son de otro experimento, el del equilibrio de unos.",
  "fuente": "scripts/espacio_clave.py (semilla 2026)",
  "claves": [
   "200",
   "300",
   "vecinas",
   "experimento",
   "avalancha"
  ]
 },
 {
  "etapa": "Seguridad",
  "url": "seguridad.html#paso-7-2",
  "p": "¿Que haya 2<sup>112.91</sup> claves válidas prueba que el sistema es seguro?",
  "r": "No. 2<sup>112.91</sup> es solo una cota superior frente a la fuerza bruta. La fuerza de seguridad es el costo del mejor ataque conocido, no el tamaño del espacio, y no se conoce una prueba de seguridad para este generador caótico.",
  "f": "Se cumple 2<sup>112.91</sup> > 2<sup>112</sup> > 2<sup>100</sup>: supera el mínimo de Alvarez y Li para criptosistemas caóticos (2<sup>100</sup>) y la fuerza mínima aceptable de NIST SP 800-57 (112 bits), pero solo como cota de fuerza bruta. La cifra vale mientras no exista un atajo mejor que probar claves; si apareciera uno, la seguridad bajaría.",
  "fuente": "Paso 7, capa «Frente a los criterios»; Alvarez y Li, Int. J. Bifurcation and Chaos 16(8), 2006; NIST SP 800-57 Part 1 Rev. 5, 2020.",
  "claves": [
   "prueba de seguridad",
   "cota superior",
   "NIST SP 800-57",
   "Alvarez y Li",
   "112 bits",
   "fuerza de seguridad"
  ]
 },
 {
  "etapa": "Seguridad",
  "url": "seguridad.html#paso-7-1",
  "p": "Si elijo x0 al azar de forma uniforme en [0.001, 0.999], ¿aprovecho los 112.91 bits?",
  "r": "No del todo. 112.91 es el log<sub>2</sub> del tamaño del conjunto. Frente a la fuerza bruta lo que cuenta es la entropía de cómo se elige K, y esta llega a 112.91 solo si K es uniforme sobre los float64 válidos, que no es lo mismo que uniforme sobre el intervalo real.",
  "f": "H(K) ≤ log<sub>2</sub>|𝒦| = 112.91, con igualdad solo si K es uniforme sobre los float64 válidos. Los float64 no se reparten por igual: cada binada [2<sup>e</sup>, 2<sup>e+1</sup>) tiene 2<sup>52</sup> valores, así que casi la mitad de los valores posibles de x0 está por debajo de √(0.001·0.999) ≈ 0.0316. Una clave escrita con seis decimales tiene a lo sumo 998 001 · 10 000 · 9 901 ≈ 2<sup>46.49</sup> posibilidades; por eso K debe salir de un generador aleatorio criptográfico.",
  "fuente": "Paso 7, capa «Cardinal frente a entropía»; paso 3, capa «Contar float64 con enteros»; Shannon, Bell Syst. Tech. J. 27, 1948.",
  "claves": [
   "entropía",
   "H(K)",
   "cardinal",
   "uniforme",
   "binada",
   "generador aleatorio criptográfico",
   "seis decimales"
  ]
 },
 {
  "etapa": "Seguridad",
  "url": "seguridad.html#paso-4-1",
  "p": "Si x0 y r ocupan 64 bits cada uno, ¿por qué r aporta 11 bits menos? ¿No convendría ampliar su rango?",
  "r": "Porque r vive en una sola binada, [2, 4), donde los float64 están a 2<sup>−51</sup>, y su rango solo mide 0.01. x0 recorre diez binadas, donde la separación es mucho menor. Duplicar el rango de r solo sumaría 1 bit, y además el rango debe quedarse donde no hay ventanas periódicas grandes.",
  "f": "En la binada [2<sup>e</sup>, 2<sup>e+1</sup>) la ulp vale 2<sup>e−52</sup>: ulp(x0) ∈ [2<sup>−62</sup>, 2<sup>−53</sup>] y ulp(r) = 2<sup>−51</sup>. Para r: 0.01 · 2<sup>51</sup> ≈ 2.25 × 10<sup>13</sup> valores, es decir 44.36 bits, frente a 55.32 de x0. x0 va de [2<sup>−10</sup>, 2<sup>−9</sup>), donde está 0.001, hasta [2<sup>−1</sup>, 1).",
  "fuente": "Paso 4 y su capa «La ulp en cada rango»; IEEE 754-2019; Goldberg, ACM Comput. Surv. 23(1), 1991, sec. 1.2.",
  "claves": [
   "ulp",
   "binada",
   "rango de r",
   "ventanas periódicas",
   "44.36 bits",
   "float64"
  ]
 },
 {
  "etapa": "Seguridad",
  "url": "seguridad.html#paso-7",
  "p": "¿De dónde sale el 97.67 % de claves válidas y qué tan confiable es?",
  "r": "Es una estimación empírica por Monte Carlo: una clave cuenta como válida si sus tres secuencias son caóticas, es decir, si tienen exponente de Lyapunov positivo. Quitar las claves no válidas resta solo 0.03 bits.",
  "f": "Se muestrearon 100 000 claves al azar. r<sub>1</sub> y r<sub>2</sub> salieron caóticos en el 98.48 % y r<sub>p</sub> en el 99.18 %; las tres a la vez en el 97.67 %, con error estándar de 0.048 %. log<sub>2</sub>(0.9767) ≈ −0.034, de modo que 112.948 − 0.034 ≈ 112.91.",
  "fuente": "Paso 7 y su detalle técnico; diálogo «Ver todos los experimentos realizados», experimento 1 (scripts/espacio_clave.py, semilla 2026).",
  "claves": [
   "97.67 %",
   "Monte Carlo",
   "Lyapunov",
   "claves válidas",
   "error estándar",
   "caóticas"
  ]
 },
 {
  "etapa": "Seguridad",
  "url": "seguridad.html#paso-8",
  "p": "¿Qué es la «resolución efectiva» de la clave y por qué se dice que es 1 ulp?",
  "r": "Es el cambio más pequeño en la clave que ya produce un flujo de clave distinto. Si dos float64 vecinos dieran el mismo flujo, el espacio útil sería menor que el contado; como ya con 1 ulp el flujo cambia, se concluye que el espacio efectivo sigue en 2<sup>112.91</sup>.",
  "f": "Según el experimento 4 del diálogo de experimentos, con 1 ulp en x0 o en r el 100 % de las claves probadas da un flujo con al menos 40 % de bits distintos y menos del 5 % de posiciones comunes. La ulp es la distancia al float64 siguiente: no existe un cambio menor. Es una conclusión por muestreo, apoyada en SHA-512 bajo el supuesto de oráculo aleatorio, no una verificación de todas las claves.",
  "fuente": "Paso 8; diálogo de experimentos, experimento 4 (scripts/resolucion_clave.py); glosario del sitio (ulp).",
  "claves": [
   "resolución efectiva",
   "1 ulp",
   "distinguibles",
   "espacio efectivo",
   "posiciones comunes"
  ]
 },
 {
  "etapa": "Seguridad",
  "url": "seguridad.html#paso-8-1",
  "p": "¿Cumplir el criterio de avalancha basta para que el flujo de clave sea seguro?",
  "r": "No. Es una condición necesaria, no suficiente: un generador predecible también puede cumplirla. Además, aquí la avalancha la produce SHA-512, no el mapa logístico.",
  "f": "El criterio estricto de avalancha (SAC) pide que, al invertir un bit de la entrada, cada bit de la salida cambie con probabilidad 1/2. Lo que se midió fue d(K, K′) = (1/n) Σ k<sub>j</sub> ⊕ k′<sub>j</sub> ≈ 1/2 entre flujos de claves vecinas. Claves vecinas dan entradas distintas a SHA-512 y, bajo el supuesto de oráculo aleatorio, parámetros independientes.",
  "fuente": "Paso 8, capa «Avalancha»; Webster y Tavares, «On the design of S-boxes», CRYPTO ’85, LNCS 218, 1986.",
  "claves": [
   "SAC",
   "criterio estricto de avalancha",
   "necesaria no suficiente",
   "SHA-512",
   "oráculo aleatorio"
  ]
 },
 {
  "etapa": "Seguridad",
  "url": "seguridad.html#paso-8-1",
  "p": "¿Cómo se sabe que un promedio de 49.93 % y no de 50 % no indica un sesgo?",
  "r": "Porque la diferencia es menor que la variación esperada por azar. Con flujos de 1400 bits y 200 claves, el error estándar del promedio es de apenas 0.094 %, y tanto los promedios como los extremos por clave caen dentro de lo esperado.",
  "f": "Error estándar del promedio: 1/(2√(200 n)) ≈ 0.094 % con n = 1400. Por clave, la desviación esperada es √1400/(2·1400) ≈ 1.34 %. Los extremos observados, de 45.36 % a 54.71 %, quedan dentro de ±3.6σ, lo que es compatible con 600 comparaciones (200 claves × 3 cambios).",
  "fuente": "Paso 8, capa «Avalancha»; datos/claves_vecinas.json (200 filas, L_bits = 1400).",
  "claves": [
   "error estándar",
   "sesgo",
   "desviación",
   "3.6σ",
   "600 comparaciones",
   "1.34 %"
  ]
 },
 {
  "etapa": "Seguridad",
  "url": "seguridad.html#paso-9-1",
  "p": "¿Qué supone exactamente la cifra de 3.10 × 10<sup>14</sup> años de fuerza bruta?",
  "r": "Supone recorrer todo el espacio a 10<sup>12</sup> claves por segundo y que existe una prueba que reconozca la clave correcta. En promedio bastaría la mitad del tiempo, porque la clave se encuentra tras revisar la mitad del espacio.",
  "f": "t = 2<sup>112.91</sup> / (10<sup>12</sup> s<sup>−1</sup> · 31 557 600 s/año) ≈ 3.10 × 10<sup>14</sup> años, con un año de 365.25 días. El promedio es |𝒦|/2 = 2<sup>111.91</sup> intentos. A 10<sup>9</sup> claves por segundo serían 3.10 × 10<sup>17</sup> años; la edad del universo es de unos 1.38 × 10<sup>10</sup> años.",
  "fuente": "Paso 9, detalle técnico y capa «Fuerza bruta y Grover».",
  "claves": [
   "fuerza bruta",
   "3.10 × 10^14 años",
   "2^111.91",
   "promedio",
   "claves por segundo"
  ]
 },
 {
  "etapa": "Seguridad",
  "url": "seguridad.html#paso-9-1",
  "p": "¿Qué pasa con un computador cuántico y el algoritmo de Grover?",
  "r": "En teoría, Grover reduciría la búsqueda a la mitad de los bits: unas 2<sup>56.1</sup> evaluaciones en vez de 2<sup>111.91</sup> en promedio. El sitio lo presenta solo como nota, porque exigiría ejecutar todo el descifrado como un circuito cuántico reversible, algo muy lejos de lo realizable hoy.",
  "f": "Grover encuentra la clave con unas (π/4)·√|𝒦| ≈ 2<sup>56.1</sup> evaluaciones, frente a |𝒦|/2 = 2<sup>111.91</sup> de la búsqueda clásica. Con esa cuenta, 2<sup>56.1</sup> queda por debajo tanto de 2<sup>100</sup> como de 2<sup>112</sup>.",
  "fuente": "Paso 9, capa «Fuerza bruta y Grover»; L. K. Grover, STOC 1996.",
  "claves": [
   "Grover",
   "computación cuántica",
   "2^56.1",
   "circuito reversible",
   "poscuántico"
  ]
 },
 {
  "etapa": "Seguridad",
  "url": "seguridad.html#paso-9-2",
  "p": "¿Por qué el modelo no puede tener secreto perfecto?",
  "r": "Porque Shannon demostró que el secreto perfecto exige que la clave tenga al menos tanta incertidumbre como el mensaje, y aquí la clave tiene como máximo 112.91 Sh frente a un mensaje cifrado de 1400 bits. La seguridad es computacional, no incondicional.",
  "f": "Secreto perfecto ⇒ H(K) ≥ H(M), como en el cifrado de Vernam de un solo uso. Aquí H(K) ≤ 112.91 Sh; en cuanto H(M) supere 112.91 Sh, el secreto perfecto es imposible. La seguridad descansa en dos supuestos no demostrados para generadores del mapa logístico: que nadie distinga el flujo de bits al azar y que nadie recupere K más rápido que por fuerza bruta.",
  "fuente": "Paso 9, capa «Computacional, no incondicional»; Shannon, «Communication theory of secrecy systems», Bell Syst. Tech. J. 28, 1949.",
  "claves": [
   "secreto perfecto",
   "Shannon",
   "Vernam",
   "seguridad computacional",
   "H(K) ≥ H(M)"
  ]
 },
 {
  "etapa": "Seguridad",
  "url": "seguridad.html#paso-10-1",
  "p": "¿Por qué una clave casi correcta, con x0 desviado en 10<sup>−15</sup>, no recupera parte del texto?",
  "r": "Por dos fuentes de sensibilidad. SHA-512 cambia por completo los parámetros derivados ante cualquier cambio en la entrada, y el caos amplifica cualquier diferencia hasta el orden de 1 antes de que termine el transitorio. Por eso el atacante no puede acercarse poco a poco.",
  "f": "Cerca de 0.123456 la ulp es 2<sup>−56</sup> ≈ 1.39 × 10<sup>−17</sup>, así que 10<sup>−15</sup> son unas 72 ulp y los 18 bytes de entrada a SHA-512 cambian. Además δ<sub>n</sub> ≈ δ<sub>0</sub>·e<sup>λn</sup> con λ(3.999952) ≈ 0.690 ≈ ln 2: δ<sub>0</sub> = 10<sup>−15</sup> llega al orden de 1 en unas 50 iteraciones, menos que el transitorio mínimo N = 100. Resultado: 47.64 % de bits extraídos distintos y 8.91 % de similitud del texto.",
  "fuente": "Paso 10 y su capa «SHA-512 y Lyapunov»; Strogatz, Nonlinear Dynamics and Chaos, 2.ª ed., 2015, sec. 10.5.",
  "claves": [
   "sensibilidad",
   "10^-15",
   "72 ulp",
   "Lyapunov",
   "transitorio",
   "8.91 %",
   "47.64 %"
  ]
 },
 {
  "etapa": "Seguridad",
  "url": "seguridad.html#paso-11-1",
  "p": "¿Por qué un solo bit erróneo arruina toda la descompresión desde ese punto?",
  "r": "Porque en la codificación aritmética el mensaje es un número dentro de un intervalo que se va estrechando. Un bit cambiado desplaza ese número fuera del subintervalo correcto, sale un token equivocado, la red recibe un contexto erróneo y el error ya no se resincroniza.",
  "f": "Tras t tokens el intervalo mide W<sub>t</sub> = 2<sup>−I<sub>t</sub></sup>, con I<sub>t</sub> la información acumulada en Sh. Invertir el bit j mueve el valor 2<sup>−j</sup>: si W<sub>t</sub> ≤ 2<sup>−j</sup>, el valor sale de [l<sub>t</sub>, l<sub>t</sub> + W<sub>t</sub>). El primer token erróneo aparece, a más tardar, cuando la información acumulada llega a j Sh. El modelo no usa código corrector de errores.",
  "fuente": "Paso 11, capa «Propagación del error»; Witten, Neal y Cleary, Commun. ACM 30(6), 1987; MacKay, 2003, cap. 6.",
  "claves": [
   "propagación del error",
   "codificación aritmética",
   "resincronización",
   "bit erróneo",
   "intervalo",
   "Sh"
  ]
 },
 {
  "etapa": "Seguridad",
  "url": "seguridad.html#paso-11-1",
  "p": "Si el canal tiene una tasa de error de bits pequeña, ¿qué probabilidad hay de que el mensaje llegue intacto?",
  "r": "Como basta un error para perder el resto del texto, el mensaje solo llega bien si los 1400 bits llegan bien. Incluso con una tasa de un error por cada mil bits, la probabilidad es de apenas 0.25.",
  "f": "Con errores independientes de tasa p por bit, P(intacto) = (1 − p)<sup>L</sup>. Con p = 10<sup>−3</sup> y L = 1400, (0.999)<sup>1400</sup> ≈ 0.25.",
  "fuente": "Paso 11, capa «Propagación del error».",
  "claves": [
   "probabilidad intacto",
   "(1 − p)^L",
   "tasa de error",
   "1400 bits",
   "robustez"
  ]
 },
 {
  "etapa": "Seguridad",
  "url": "seguridad.html#paso-12",
  "p": "¿Qué ataques al audio destruyen el mensaje oculto y con qué BER?",
  "r": "Sal y pimienta y oclusión destruyen el mensaje con todas las intensidades probadas. Del ruido gaussiano solo sobrevive el más débil, el de SNR 100 dB, con BER de 0 %.",
  "f": "Sal y pimienta al 5 %, 10 % y 25 %: BER de 2.14 %, 5.36 % y 13.07 %. Oclusión al 5 %, 10 % y 25 %: 1.79 %, 3.79 % y 7.93 %. Ruido gaussiano con SNR de 100, 90 y 80 dB: 0.00 %, 5.86 % y 47.5 %. Como no hay código corrector, cualquier BER distinto de cero arruina el texto, y 50 % equivale a adivinar al azar.",
  "fuente": "Paso 12 (texto, detalle técnico y vista de la escena con las barras de BER).",
  "claves": [
   "BER",
   "sal y pimienta",
   "oclusión",
   "ruido gaussiano",
   "SNR",
   "ataques al audio",
   "robustez"
  ]
 },
 {
  "etapa": "Seguridad",
  "url": "seguridad.html#paso-12-1",
  "p": "¿Bastaría con añadir un código corrector como Reed-Solomon para resistir esos ataques?",
  "r": "Solo en parte. Si los errores fueran independientes, un código bien elegido podría corregir, por ejemplo, la sal y pimienta al 5 %, pero con SNR 80 dB casi no queda capacidad. Además, la oclusión produce ráfagas y, si un ataque cambia el número de muestras, cambian todas las posiciones de inserción. Evaluarlo queda como trabajo futuro.",
  "f": "En un canal binario simétrico, C = 1 − h(p): con p = 2.14 %, C ≈ 0.85; con p = 47.5 %, C ≈ 0.002. Si un ataque cambia el número de muestras M (recortar, remuestrear), todas las posiciones ⌊yM⌋ cambian. Reed-Solomon corrige bytes enteros, lo que sirve contra ráfagas cortas.",
  "fuente": "Paso 12, capa «Un canal con errores»; Shannon, 1948; Reed y Solomon, J. SIAM 8(2), 1960.",
  "claves": [
   "Reed-Solomon",
   "código corrector",
   "capacidad",
   "canal binario simétrico",
   "ráfagas",
   "desincronización",
   "trabajo futuro"
  ]
 }
];
