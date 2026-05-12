# Iglesia De Cristo Gazcue — Sitio web

Sitio estático bilingüe (ES/EN) de la **Iglesia De Cristo Gazcue**
(Calle Caonabo #6, Gazcue, Santo Domingo, República Dominicana).

HTML/CSS/JS vanilla, sin build step ni dependencias. Despliegue en
Netlify desde la rama `main`.

---

## Páginas

```
index.html        Hero · Horarios · Ministerios resumen · Cumpleaños del mes · Contacto rápido
ministerios.html  Todos los ministerios con detalle
lideres.html      Equipo pastoral con fotos + Historia
oracion.html      Formulario de petición + Necesidades de la semana
admin/            Panel de Netlify CMS
```

---

## Configuración del panel admin

El panel `/admin/` usa **Netlify CMS** con **git-gateway** y
**Netlify Identity**. Para que funcione, en el dashboard de Netlify:

1. **Site configuration → Identity → Enable Identity**
2. **Registration**: `Invite only` (solo personas invitadas pueden
   iniciar sesión).
3. **Services → Git Gateway → Enable Git Gateway**
4. **Identity → Invite users** → invita los correos del equipo de la
   iglesia que vaya a editar el contenido.

Una vez aceptada la invitación, la persona puede entrar a
`https://tu-sitio.netlify.app/admin/` y editar:

- 🎂 **Cumpleaños** (con número de mes para auto-filtrado).
- 🙏 **Necesidades de Oración** (ES + EN, bandera *activo*).
- 📢 **Anuncios y Eventos** (tipo, fecha, imagen opcional).
- 📖 **Lectura de la Semana** (versículo, referencia, reflexión).

Cada cambio se commitea automáticamente a `main`; Netlify redeploya
en ~30 s.

---

## ⚠️ IMPORTANTE: mantenimiento del manifiesto `data/index.json`

El sitio es 100 % estático: sin backend que pueda *listar* las
carpetas. `assets/js/contenido.js` aprende qué archivos JSON existen
leyendo **`data/index.json`**, un manifiesto manual.

Estructura:

```json
{
  "cumpleanos": ["ejemplo-1.json", "ejemplo-2.json"],
  "oracion": ["ejemplo-1.json", "ejemplo-2.json"],
  "anuncios": ["ejemplo-1.json"],
  "lectura": ["semana-actual.json"]
}
```

**Cada vez que el panel CMS crea o elimina una entrada, hay que
actualizar este archivo a mano** para que la web la vea. El flujo es:

1. Crear/eliminar una entrada en `/admin/`.
2. Abrir `data/index.json` en GitHub (botón ✏️).
3. Añadir o quitar el nombre del archivo recién creado/eliminado en el
   array correspondiente.
4. Commit → Netlify redeploya → la web ya lo ve.

Una entrada en CMS sin entrada correspondiente en `index.json` queda
guardada pero invisible para el sitio.

> Si más adelante se quiere automatizar este paso, basta con añadir un
> script de Node que escanee `data/*` en cada build de Netlify y
> regenere `index.json`. Por simplicidad, hoy se mantiene manual.

---

## Editar contenido sin el panel

- Textos de la web → `assets/js/i18n.js` (claves ES + EN).
- Datos del CMS → uno o más JSON por carpeta en `data/<colección>/`
  + actualizar `data/index.json`.
- Fotos de líderes → `assets/img/lideres/<nombre>.jpg` (400×400).
- Imágenes subidas por el panel → `assets/img/uploads/`.

---

## Desarrollo local

No requiere build. Para previsualizar:

```bash
python3 -m http.server 8080
```

Abre <http://localhost:8080>.

---

## Antes de producción pública

- Quitar `<meta name="robots" content="noindex, nofollow">` de las
  4 páginas para permitir indexado.
- Considerar mover `mailto:` a Formspree o Netlify Forms para no
  exponer el correo de la iglesia.
- Añadir un archivo `_headers` en la raíz para reforzar a nivel HTTP:
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
