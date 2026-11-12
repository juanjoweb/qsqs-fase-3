# QSQS 2026 · Fase 3

Abre `index.html` en un navegador moderno. Conserva la carpeta completa para mantener el banco, los estilos, los scripts y las imágenes. El recurso funciona sin conexión. Los archivos de esta carpeta también se pueden servir desde la raíz de un sitio estático.

Selecciona un grado y un área. Usa **Anterior**, **Siguiente** o **Ir a una pregunta** para navegar. En **Revisar respuestas** puedes consultar tus selecciones, volver a cualquier pregunta y borrar el intento de ese grado y área. El navegador guarda el progreso localmente cuando admite almacenamiento para esa ubicación.

| Grado | Lenguaje | Matemáticas | Socioemocionales |
| --- | ---: | ---: | ---: |
| 3.º | 20 | 20 | 70 |
| 5.º | 20 | 20 | 70 |
| 7.º | 20 | 20 | 78 |
| 9.º | 20 | 20 | 78 |

El banco conserva 456 preguntas, 1.796 opciones y 138 archivos de imagen originales utilizados por los ítems y sus materiales de referencia. Se corrigió una ruta incompleta usando el archivo del mismo nombre incluido en el ZIP. La numeración en pantalla sigue la secuencia de presentación del aplicativo.

## Clave propuesta

La clave de Lenguaje y Matemáticas se elaboró a partir de los textos, enunciados, tablas e imágenes del aplicativo. La base offline no identifica las opciones correctas. La revisión presenta la clave de los 160 ítems, con las decisiones de revisión incorporadas. En Matemáticas de 7.º, la pregunta 10 admite tanto A como B. El puntaje asigna un acierto al seleccionar cualquiera de esas dos opciones.

En `claves.js`, cada entrada usa el ID de la pregunta en `banco.js` y guarda los ID de las opciones propuestas en `optionIds`. Un arreglo vacío indica que no hay una opción válida. La propiedad `review` registra el motivo de revisión y excluye ese ítem del puntaje. Socioemocionales se revisa como cuestionario de autorreporte, sin calificación.
