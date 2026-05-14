# Iglesia De Cristo Gazcue — Sitio web

Sitio estático bilingüe (ES/EN) de la **Iglesia De Cristo Gazcue**
(Calle Caonabo #6, Gazcue, Santo Domingo, República Dominicana).

HTML/CSS/JS vanilla, sin build step ni dependencias. Despliegue en
Netlify desde la rama `claude/church-website-builder-LTHxX`.

---

## Páginas

```
index.html        Hero · Horarios · Versículo · Oración · Anuncios · Ministerios · Contacto
nosotros.html     Misión, Identidad, Historia, Ubicación
ministerios.html  Todos los ministerios con detalle
lideres.html      Equipo pastoral con fotos + Historia
cumpleanos.html   Cumpleaños del mes (driven por CMS)
oracion.html      Formulario de petición + Necesidades de la semana
gracias.html      Página de confirmación tras envío de formulario
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

Cada cambio se commitea automáticamente a la rama de producción
`claude/church-website-builder-LTHxX`; Netlify redeploya
en ~30 s.

---

## Cómo descubre el sitio los archivos del CMS

`assets/js/contenido.js` consulta la **GitHub Contents API**
(`/repos/jrm456-w/Iglesia-web/contents/data/<carpeta>`) cada vez que
carga una página, lista los archivos `.json` y los descarga vía
`download_url` (raw.githubusercontent.com).

**Esto significa que cada entrada creada en el panel aparece
automáticamente en el sitio** sin tocar manifiestos ni código.

### Requisitos
- **El repositorio debe ser público** para que la API y los URLs raw
  funcionen sin token.
- Hay un *rate limit* de 60 peticiones por hora por IP sin
  autenticación; suficiente para tráfico normal de iglesia.

### Si el sitio queda privado
Convierte el repo a público (Settings → General → Change visibility →
Public). Mientras siga privado, las cards del sitio aparecerán vacías
aunque el panel siga guardando los archivos.

---

## Configuración de correo para formularios

Los formularios de **contacto** (`index.html`) y **oración**
(`oracion.html`) usan **Netlify Forms** — el envío ocurre en el
servidor de Netlify, sin exponer ningún correo en el HTML. Tras un
envío exitoso el visitante es redirigido a `/gracias.html`.

Después del primer deploy con los formularios activos:

1. Entrar a `app.netlify.com` → tu sitio
2. **Forms → Form notifications**
3. **Add notification → Email notification**
4. **Email to notify:** `rm0865806@gmail.com` *(correo temporal de prueba)*
5. Repetir para cada formulario detectado:
   - `contacto`
   - `oracion`

Para cambiar el correo destino en el futuro basta con actualizar
la notificación en Netlify — **no requiere tocar el código**.

### Cómo verificar que Netlify detectó los forms
En Netlify → **Forms** debe aparecer la lista con `contacto` y
`oracion` tras el primer deploy posterior a este cambio. Si no
aparecen, revisar que el HTML deployado contenga `data-netlify="true"`
y el input oculto `<input type="hidden" name="form-name" value="...">`.

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
  páginas para permitir indexado.
- Activar las notificaciones por correo en Netlify Forms (ver
  sección *Configuración de correo para formularios* arriba).
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
