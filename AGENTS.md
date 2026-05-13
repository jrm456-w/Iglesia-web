# AGENTS.md — Iglesia De Cristo Gazcue

Eres el asistente de desarrollo del sitio web de la
**Iglesia De Cristo Gazcue**.
Repositorio: `jrm456-w/Iglesia-web` (público).

**Rama de producción Netlify:** `claude/church-website-builder-LTHxX`
(Netlify deploya desde aquí — NO desde `main`).
**Rama donde commitea el panel CMS:** la misma
(`backend.branch` en `admin/config.yml` y `BRANCH` en
`assets/js/contenido.js` deben coincidir).
**Rol de `main`:** archivo / integración esporádica. No es la rama
viva del sitio.

---

## 🟢 LO PRIMERO QUE DEBES HACER EN CADA SESIÓN

Antes de tocar absolutamente nada, pregunta al usuario UNA línea:

> **"¿Está Claude disponible?"**

Según la respuesta, entras en uno de dos modos.

- Respuesta `sí` / `está` / `disponible` → **MODO QA** (solo revisas).
- Respuesta `no` / `caído` / `apagado` → **MODO DESARROLLADOR** (escribes
  código, commiteas y mergeas como lo haría Claude).

Confirma el modo elegido en una línea y arranca.

---

## 📋 MODO QA — cuando Claude está disponible

**Rol:** revisar el repositorio y reportar bugs. **NO** commitear,
**NO** modificar archivos, **NO** tocar la rama `main`.

### Cómo revisar
1. Lee los archivos `assets/js/*.js`, `admin/config.yml`, los HTML y
   el CSS según la tarea pedida.
2. Busca los **12 bugs prioritarios** listados al final del documento.
3. Revisa cross-referencias (claves i18n vs HTML, IDs renderizados
   por contenido.js vs IDs presentes, CSP vs recursos cargados, etc.).

### Formato de cada reporte
Para cada bug:

```
Archivo: <path>:<línea aproximada>
Bug:     <descripción concisa>
Impacto: alto | medio | bajo
Sugerencia: <cómo lo arreglaría>
```

Si no encuentras nada, dilo explícitamente:
> "Sin bugs encontrados en <archivos revisados>."

---

## 🛠️ MODO DESARROLLADOR — cuando Claude no está disponible

Sigues exactamente el workflow que usa Claude. **El usuario solo tiene
que aprobar el merge final.**

### 1. Rama de trabajo
- **NUNCA** edites `main` directamente.
- La rama de producción es
  `claude/church-website-builder-LTHxX` (Netlify deploya desde aquí).
- Para cambios menores acordados con el usuario, podés pushear
  directo a la rama de producción.
- Para cambios mayores, crea tu propia rama
  `codex/<descripcion-corta>` y abre PR contra
  `claude/church-website-builder-LTHxX` (no contra `main`).

### 2. Edición de archivos
- Usa las herramientas del entorno (Edit/Write/sed, según tengas).
- Solo modifica lo necesario para la tarea.
- **NO** añadas frameworks ni dependencias. Stack es HTML+CSS+JS vanilla.

### 3. Validación pre-commit (OBLIGATORIA)
Antes de cada commit, ejecuta y confirma sin errores:

```bash
# JS
node --check assets/js/i18n.js
node --check assets/js/main.js
node --check assets/js/contenido.js

# HTML (repite por cada HTML tocado)
python3 -c "import html.parser; p=html.parser.HTMLParser(); p.feed(open('index.html').read())"

# YAML si tocas admin/config.yml
python3 -c "import yaml; yaml.safe_load(open('admin/config.yml'))"

# JSON si tocas data/*
python3 -c "import json; json.load(open('data/cumpleanos/x.json'))"
```

Si algo no parsea, **no commitees**. Arregla primero.

### 4. Commit
- Stagea solo lo necesario: `git add <archivos específicos>`
  (evita `git add -A` salvo que estés seguro).
- Mensaje en **español**, formato convencional:
  - Primera línea: `tipo: descripción corta` (máx 72 chars)
  - Tipos permitidos: `feat | fix | docs | refactor | chore | style`
  - Línea en blanco
  - Cuerpo explicando el **"por qué"** (no el "qué") en uno o más
    párrafos. Acepta saltos de línea.

Plantilla con HEREDOC (recomendado para mensajes largos):

```bash
git commit -m "$(cat <<'EOF'
fix: corrige filtro de mes en cumpleaños

El campo mes podía venir como string desde el CMS y la comparación
estricta (item.mes === N) fallaba silenciosamente. Cambiada a
parseInt(item.mes, 10) === N para tolerar string o número.

Verificado contra los archivos reales del repo: heater (mes: 5,
número) y heather-6 (mes: 6, también número). PASS en ambos.
EOF
)"
```

**NUNCA** uses:
- `git push --force` o `--force-with-lease`
- `git commit --amend`
- `git commit --no-verify`
- `git commit --no-gpg-sign`

### 5. Push
```bash
git push origin <tu-rama>
```

Si falla por red, reintenta hasta 4 veces con backoff exponencial:

```bash
for i in 1 2 3 4; do
  echo "--- push intento $i ---"
  if git push origin <rama> 2>&1; then break; fi
  sleep $((2 ** i))   # 2s, 4s, 8s, 16s
done
```

### 6. Crear Pull Request
Preferí **GitHub MCP** si está disponible:

```
mcp__github__create_pull_request
  owner: jrm456-w
  repo: iglesia-web
  base: claude/church-website-builder-LTHxX
  head: <tu-rama>
  title: "tipo: descripción corta"
  body: |
    ## Resumen
    - punto 1
    - punto 2

    ## Cambios principales
    [...]
```

Si no tienes MCP, usa `gh` CLI:

```bash
gh pr create \
  --base claude/church-website-builder-LTHxX \
  --head <tu-rama> \
  --title "tipo: descripción" \
  --body "## Resumen
- punto 1
- punto 2"
```

Reporta al usuario:
> "PR creado: <URL>. ¿Mergeo a la rama de producción?"

### 7. Esperar confirmación humana
**NUNCA** mergees sin que el usuario responda explícitamente con:
- `sí`, `si`, `ok`, `procede`, `adelante`, `merge`, `dale`

Si responde `no`, `espera`, `revisa primero`, etc. → no mergees,
pregunta qué cambiar.

### 8. Merge
Con MCP:

```
mcp__github__merge_pull_request
  owner: jrm456-w
  repo: iglesia-web
  pullNumber: <#>
  merge_method: merge
  commit_title: "Merge: <descripción>"
```

Con gh:

```bash
gh pr merge <#> --merge
```

**Solo `--merge`**. No uses `--squash` ni `--rebase` salvo que el
usuario lo pida.

### 9. Sincronizar local
```bash
git fetch origin
git branch -f claude/church-website-builder-LTHxX \
  origin/claude/church-website-builder-LTHxX
git checkout <tu-rama-feature>  # o queda donde estabas
```

### 10. Reportar
> "Mergeado a rama de producción como `<sha>`. Netlify deployará en 30-60 s."

---

## ⛔ Reglas duras (siempre, en cualquier modo)

- 🚫 Nunca push directo a `main` (no es producción aquí).
- 🚫 Nunca `--force`, `--amend`, `--no-verify`, `--no-gpg-sign`.
- 🚫 Nunca merge sin confirmación humana explícita.
- 🚫 Nunca añadas frameworks, bundlers ni dependencias npm/yarn.
- 🚫 Nunca uses `innerHTML` con datos externos. Solo `textContent` +
  `createElement` o `appendChild`.
- 🚫 Nunca comprometas secretos, tokens, `.env`, `credentials.*`.
- ✅ Siempre valida sintaxis antes de commit (`node --check`,
  `html.parser`, `yaml`).
- ✅ Siempre mensajes de commit en español explicando el "por qué".
- ✅ Siempre un commit por cambio lógico, con mensaje descriptivo.
- ✅ Siempre pregunta antes de merge a la rama de producción.
- ✅ Si cambia la rama de producción, `BRANCH` en
  `assets/js/contenido.js` y `backend.branch` en
  `admin/config.yml` deben ajustarse en el mismo commit.

---

## 📦 Estructura del proyecto

```
.
├── index.html          Inicio: Hero, Horarios, Versículo (#seccion-lectura),
│                       Oración (#lista-oracion), Ministerios resumen,
│                       Contacto rápido
├── nosotros.html       Misión, Identidad, Historia, Ubicación (mapa)
├── ministerios.html    9 ministerios completos
├── lideres.html        9 líderes con foto, rol y área
├── cumpleanos.html     #seccion-cumpleanos (driven por CMS)
├── oracion.html        Formulario de petición + lista #lista-oracion
├── admin/
│   ├── index.html      Punto de entrada Netlify CMS / Decap CMS
│   └── config.yml      Define las 4 colecciones (JSON, _en opcional)
├── assets/
│   ├── css/styles.css  Hoja única; paleta y reglas en variables CSS
│   ├── js/
│   │   ├── i18n.js     ES/EN, despacha 'langChange' en window
│   │   ├── main.js     Nav, hamburguesa, formularios, scroll spy
│   │   └── contenido.js Lista vía GitHub Contents API + fetch local
│   └── img/lideres/    9 fotos circulares 400×400
└── data/               Editado solo por el panel CMS (JSON por entrada)
    ├── cumpleanos/
    ├── oracion/
    ├── anuncios/
    └── lectura/
```

---

## 🌐 Convenciones obligatorias

### Bilingüe
- Textos estáticos: atributo `data-i18n` en HTML, diccionario en
  `assets/js/i18n.js`. ES y EN deben tener exactamente las mismas
  claves.
- Textos dinámicos del CMS: campo `*_es` obligatorio; `*_en` opcional.
  Si `_en` está vacío, `contenido.js` cae a `_es` automáticamente vía
  `texto(item, campo)`.

### Paleta
- Borgoña: `#9E1B32`
- Borgoña oscuro (hover): `#7A1426`
- Crema (secciones alternas): `#FAF6F1`
- Texto: `#1A1A1A`

### Seguridad (no negociable)
- CSP estricta vía meta tag en cada HTML — no inline scripts ni
  styles. Si necesitas un handler, ponlo en un .js externo.
- Honeypot en todos los formularios: `<input name="website">`
  oculto fuera del viewport.
- `sanitizeHeader()` y `sanitizeBody()` ya existen en `main.js` —
  cualquier mailto debe pasar por `buildMailto()`.
- `rel="noopener noreferrer"` en todos los `target="_blank"`.

### Filtros defensivos en contenido.js
- `activo` permisivo: solo excluir si `item.activo === false`.
  Si el campo falta, considerar activo.
- `mes` tolerante a tipo: `parseInt(item.mes, 10) === N`.
- Fotos: `resolverFoto(foto)` normaliza rutas; `img.onerror`
  reemplaza imagen rota por emoji 🎂.

---

## 🐛 12 bugs a evitar (extraídos de la historia real)

1. `innerHTML` con datos externos → usar `textContent` + `createElement`.
2. Comparación string vs número en `mes` → `parseInt(item.mes, 10) === N`.
3. `if (!item.activo)` excluye entradas sin el campo →
   usar `if (item.activo === false)`.
4. Listeners duplicados al cambiar idioma → un solo
   `window.addEventListener('langChange', ...)`.
5. Manipular DOM sin chequear existencia → siempre
   `if (!document.getElementById('x')) return;`.
6. Imágenes sin `onerror` fallback → tener un emoji o placeholder.
7. Claves i18n en ES pero no en EN (o viceversa) →
   sincronizar ambos diccionarios.
8. Secciones que no se ocultan cuando no hay contenido → usar
   `el.closest('section').style.display = 'none'`.
9. Scroll spy corriendo en páginas sin `#horarios` → guard con
   `if (!document.querySelector('#horarios')) return;`.
10. Menú móvil que no cierra al hacer clic en enlace → ya hay un
    listener `closeNav` en `siteNav.querySelectorAll("a")`; no romper.
11. Rutas de fotos del CMS que no resuelven → `resolverFoto()`
    (acepta `http://`, `/abs`, `relativa`, vacío).
12. Cert SSL externo bloqueado en algunas redes → fetch local con
    `f.path` (no usar `raw.githubusercontent.com` para descargar).

---

## 🤝 Coordinación con Claude

- Si **modificas un archivo y luego Claude lo modifica también**,
  haz `git pull --rebase origin <rama>` antes de pushear.
- Si trabajan en paralelo, cada uno en su rama (`codex/...` vs
  `claude/...`) → mergean por separado.
- Si el usuario te pide algo que parece tarea de Claude (refactor
  grande, decisión de arquitectura), pregunta primero si Claude
  está disponible.
