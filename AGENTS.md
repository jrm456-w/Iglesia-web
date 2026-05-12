# AGENTS.md — Iglesia De Cristo Gazcue

## Rol
QA únicamente. NO hacer commits. NO modificar archivos.
Solo revisar, reportar bugs y sugerir correcciones.

## Stack
HTML5 + CSS3 + JavaScript vanilla. Sin frameworks. Sin build step.
Netlify + GitHub + Netlify CMS (Decap CMS).

## Páginas
- index.html — Hero, Horarios, Versículo, Oración, Ministerios resumen, Contacto
- nosotros.html — Historia, Misión, Visión, Ubicación
- ministerios.html — Todos los ministerios
- lideres.html — Equipo pastoral
- cumpleanos.html — Cumpleaños del mes actual
- oracion.html — Formulario privado + peticiones activas
- admin/index.html + admin/config.yml — Panel CMS

## Archivos JS
- main.js — Nav, hamburguesa, formularios, scroll spy
- i18n.js — Toggle ES/EN, diccionarios, localStorage('lang')
- contenido.js — Fetch GitHub API → renderiza JSON dinámico

## Contenido dinámico
contenido.js consulta:
https://api.github.com/repos/jrm456-w/Iglesia-web/contents/data/{carpeta}
Carpetas: cumpleanos/ oracion/ anuncios/ lectura/
Cada carpeta tiene archivos .json individuales.
El sitio los lista y renderiza según idioma activo.

## Bilingüe
Textos estáticos: atributo data-i18n en HTML, diccionario en i18n.js.
Textos dinámicos: campo _es obligatorio, campo _en OPCIONAL.
Si _en está vacío, contenido.js muestra _es.

## Paleta
Borgoña: #9E1B32 | Hover: #7A1426 | Crema: #FAF6F1 | Texto: #1A1A1A

## Seguridad
- CSP estricta vía meta tag
- sanitizeHeader() y sanitizeBody() en todos los formularios
- Honeypot en todos los formularios (name="website")
- Sin innerHTML con datos externos — usar textContent/createElement
- rel="noopener noreferrer" en enlaces externos

## Bugs prioritarios a buscar
1. innerHTML con datos externos (debe ser textContent)
2. Comparación string vs número en campo "mes" de cumpleaños
3. parseInt(item.mes) === new Date().getMonth() + 1
4. item.activo !== false (no if(item.activo))
5. Event listeners duplicados en re-renders de idioma
6. Elementos DOM manipulados sin verificar existencia primero
7. Imágenes sin onerror fallback
8. Claves i18n que existen en ES pero no en EN
9. Secciones que no se ocultan cuando no hay contenido
10. Scroll spy corriendo en páginas sin #horarios
11. Menú móvil que no cierra al hacer clic en enlace
12. Rutas de fotos subidas por CMS que no resuelven correctamente

## Formato de reporte
Por cada bug:
- Archivo + línea aproximada
- Descripción
- Impacto: alto / medio / bajo
- Corrección sugerida

## Prohibido
- Commits o push
- Modificar archivos
- Agregar frameworks o dependencias
- Tocar rama main
