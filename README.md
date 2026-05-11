# Iglesia De Cristo Gazcue — Sitio web

Sitio estático bilingüe (ES/EN) de la **Iglesia De Cristo Gazcue**
(Calle Caonabo #6, Gazcue, Santo Domingo, República Dominicana).

HTML/CSS/JS vanilla, sin build step ni dependencias.
Pensado para desplegarse en Netlify desde la rama `main`.

---

## Estructura de archivos

```
.
├── index.html               Página principal
├── ministerios.html         Listado completo de ministerios
├── lideres.html             Cuerpo ministerial + historia de la iglesia
├── oracion.html             Formulario de petición + necesidades semanales
├── admin/
│   ├── index.html           Punto de entrada de Netlify CMS
│   └── config.yml           Definición de colecciones del CMS
├── assets/
│   ├── css/styles.css       Hoja de estilos única
│   ├── js/
│   │   ├── i18n.js          Diccionarios ES/EN + toggle persistente
│   │   ├── main.js          Nav, formularios, scroll spy, sanitización
│   │   ├── contenido.js     Lee contenido del CMS y lo renderiza
│   │   └── identity-init.js Redirige a /admin/ tras login en Identity
│   └── img/
│       ├── lideres/         Fotos de los 9 líderes (400×400)
│       └── uploads/         Imágenes subidas desde el CMS
└── data/                    Contenido editable por el CMS (JSON)
    ├── anuncios/            Una entrada por archivo
    ├── cumpleanos/
    ├── oracion/
    └── lectura/
```

---

## Configuración del panel admin

El panel `/admin/` usa **Netlify CMS** con **git-gateway** y
**Netlify Identity**. Para que funcione hay que activarlo desde el
dashboard de Netlify una sola vez:

1. **Site configuration → Identity → Enable Identity**
2. **Registration**: cambia a `Invite only` (solo personas invitadas
   pueden iniciar sesión).
3. **Services → Git Gateway → Enable Git Gateway**
4. **Identity → Invite users** → invita los correos del equipo de la
   iglesia que vaya a editar el contenido.

Una vez aceptada la invitación, la persona puede entrar a
`https://tu-sitio.netlify.app/admin/` con su correo y editar:

- **Anuncios y Eventos** (con fecha, tipo y bandera *activo*)
- **Cumpleaños del mes** (formato `15 de enero`)
- **Necesidades de oración** (con bandera *activo*)
- **Lectura de la semana** (versículo + reflexión bilingüe)

Cada cambio guardado en el panel se **commitea** automáticamente a
`main`. Netlify detecta el push y redeploya el sitio en ~30 s.

> El repo necesita ser **público** para que `assets/js/contenido.js`
> liste los archivos vía la GitHub Contents API. Si el repo es privado,
> el contenido del CMS seguirá guardándose, pero no se mostrará en el
> sitio hasta que se haga público o se reemplace la API por un
> manifiesto generado en build time.

---

## Editar contenido sin el panel

Si prefieres editar a mano (en GitHub o local):

- Textos de la web → `assets/js/i18n.js` (claves ES + EN).
- Datos del CMS → un archivo JSON por entrada en `data/<colección>/`.
- Fotos de líderes → reemplaza `assets/img/lideres/<nombre>.jpg`
  manteniendo dimensiones cuadradas.

---

## Desarrollo local

No requiere build. Para previsualizar:

```bash
python3 -m http.server 8080
# o cualquier servidor estático que sirva la raíz
```

Abre <http://localhost:8080>. Si quieres probar el formulario de
contacto sin abrir tu cliente de correo, examina el `mailto:` generado
con DevTools → Network → "Document".

---

## Antes de pasar a producción

- Quita `<meta name="robots" content="noindex, nofollow">` de las 4
  páginas para que Google indexe el sitio.
- Considera mover `mailto:` a un servicio tipo Formspree o Netlify
  Forms para no exponer el correo de la iglesia.
- Para reforzar la seguridad a nivel HTTP (no solo meta), añade un
  archivo `_headers` en la raíz con:
  ```
  /*
    X-Content-Type-Options: nosniff
    X-Frame-Options: SAMEORIGIN
    Strict-Transport-Security: max-age=31536000; includeSubDomains
    Permissions-Policy: geolocation=(), microphone=(), camera=()
  ```

---

## Créditos

Identidad y contenido oficial extraídos de la *Guía de Inducción
Congregacional* de la Iglesia De Cristo Gazcue. Tipografías
Playfair Display + Inter (Google Fonts).
