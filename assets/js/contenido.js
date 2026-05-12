/* ============================================================
   Iglesia De Cristo Gazcue — contenido.js
   Lee dinámicamente las carpetas data/* del repo en GitHub
   vía la Contents API. Cada archivo nuevo que cree el panel
   CMS aparece en el sitio sin tocar código.

   Seguridad: todo lo que entra al DOM se inserta con
   textContent o atributos controlados — nunca innerHTML con
   datos externos.

   Fixes defensivos:
   · activo === false es la única condición que excluye (los
     archivos donde activo no exista se consideran activos).
   · mes se compara con parseInt, así tolera string o número.
   · resolverRutaFoto normaliza rutas absolutas/relativas y
     img.onerror reemplaza la imagen rota por un emoji.
   ============================================================ */

(function () {
  "use strict";

  const REPO = "jrm456-w/Iglesia-web";
  const BRANCH = "main";
  const API = `https://api.github.com/repos/${REPO}/contents/data`;

  const TIPO_LABELS = {
    evento: { es: "Evento", en: "Event" },
    semanal: { es: "Semanal", en: "Weekly" },
    mensual: { es: "Mensual", en: "Monthly" }
  };

  const EMPTY = {
    cumpleanos: { es: "No hay cumpleaños este mes", en: "No birthdays this month" },
    oracion: { es: "Estén atentos, actualizamos cada domingo", en: "Stay tuned, we update every Sunday" }
  };

  const getLang = () => {
    if (window.IDCGi18n && typeof window.IDCGi18n.get === "function") {
      return window.IDCGi18n.get();
    }
    try { return localStorage.getItem("lang") || localStorage.getItem("idcg_lang") || "es"; }
    catch { return "es"; }
  };

  const clear = (el) => { while (el && el.firstChild) el.removeChild(el.firstChild); };

  const make = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = String(text);
    return el;
  };

  /* ----- BUG 1: activo permisivo (excluye solo si === false) ----- */
  const estaActivo = (item) => !item || item.activo !== false;

  /* ----- BUG 3: normalizar la ruta de la foto ----- */
  function resolverRutaFoto(foto) {
    if (foto === undefined || foto === null) return null;
    const v = String(foto).trim();
    if (v === "") return null;
    if (v.startsWith("http://") || v.startsWith("https://")) return v;
    if (v.startsWith("/")) return v;
    return "/" + v;
  }

  /* ----- Listado y carga via GitHub Contents API ----- */
  async function listarArchivos(carpeta) {
    try {
      const res = await fetch(`${API}/${carpeta}?ref=${BRANCH}`, {
        headers: { Accept: "application/vnd.github+json" }
      });
      if (!res.ok) return [];
      const archivos = await res.json();
      if (!Array.isArray(archivos)) return [];
      return archivos
        .filter((f) => f && f.type === "file" && typeof f.name === "string" && f.name.endsWith(".json") && f.download_url)
        .map((f) => f.download_url);
    } catch {
      return [];
    }
  }

  async function fetchJSON(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      return data && typeof data === "object" ? data : null;
    } catch {
      return null;
    }
  }

  async function cargarCarpeta(nombre) {
    const urls = await listarArchivos(nombre);
    const docs = await Promise.all(urls.map(fetchJSON));
    return docs.filter(Boolean);
  }

  // Caché por carpeta (almacena la promesa, no el resultado) para evitar
  // que el toggle de idioma vuelva a golpear la GitHub API. Las requests
  // concurrentes durante el primer render comparten la misma promesa.
  const entriesCache = {};
  const loadEntries = (folder) => {
    if (!entriesCache[folder]) {
      entriesCache[folder] = cargarCarpeta(folder);
    }
    return entriesCache[folder];
  };

  /* ----- Helpers ----- */
  const parseDay = (s) => {
    if (!s) return 9999;
    const m = String(s).match(/\d+/);
    return m ? parseInt(m[0], 10) : 9999;
  };

  const formatISODate = (iso, lang) => {
    if (!iso || typeof iso !== "string") return "";
    try {
      const d = new Date(iso + "T00:00:00");
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString(lang === "en" ? "en-US" : "es-DO", { year: "numeric", month: "long", day: "numeric" });
    } catch { return iso; }
  };

  /* ----- 1. Cumpleaños del mes ----- */
  async function cargarCumpleanos() {
    const target = document.getElementById("seccion-cumpleanos");
    if (!target) return;

    const entries = await loadEntries("cumpleanos");
    const mesActual = new Date().getMonth() + 1;
    const lang = getLang();

    // BUG 1 + BUG 2 aplicados.
    const list = entries
      .filter((e) => estaActivo(e) && parseInt(e.mes, 10) === mesActual)
      .sort((a, b) => parseDay(a.fecha) - parseDay(b.fecha));

    clear(target);
    if (!list.length) {
      target.appendChild(make("p", "empty-msg", EMPTY.cumpleanos[lang] || EMPTY.cumpleanos.es));
      return;
    }

    list.forEach((b) => {
      const card = make("article", "birthday-card");
      const rutaFoto = resolverRutaFoto(b.foto);

      if (rutaFoto) {
        const img = document.createElement("img");
        img.className = "cumpleanos-foto";
        img.src = rutaFoto;
        img.alt = "Foto de " + (b.nombre || "");
        img.loading = "lazy";
        img.width = 80;
        img.height = 80;
        // Si la imagen falla, la reemplazamos por el emoji para no romper el grid.
        img.onerror = function () {
          const emoji = document.createElement("span");
          emoji.textContent = "🎂";
          emoji.className = "cumpleanos-emoji";
          emoji.setAttribute("aria-hidden", "true");
          this.replaceWith(emoji);
        };
        card.appendChild(img);
      } else {
        const emoji = make("span", "cumpleanos-emoji");
        emoji.textContent = "🎂";
        emoji.setAttribute("aria-hidden", "true");
        card.appendChild(emoji);
      }

      card.appendChild(make("p", "birthday-name", b.nombre || ""));
      card.appendChild(make("p", "birthday-date", b.fecha || ""));
      target.appendChild(card);
    });
  }

  /* ----- 2. Necesidades de oración ----- */
  async function cargarOracion() {
    const target = document.getElementById("lista-oracion");
    if (!target) return;

    const entries = await loadEntries("oracion");
    const active = entries.filter(estaActivo);
    const lang = getLang();

    clear(target);
    if (!active.length) {
      const empty = make("li", "empty-msg");
      empty.textContent = EMPTY.oracion[lang] || EMPTY.oracion.es;
      target.appendChild(empty);
      return;
    }

    active.forEach((n) => {
      const text = (n["necesidad_" + lang] || n.necesidad_es || "").trim();
      if (!text) return;
      target.appendChild(make("li", null, text));
    });
  }

  /* ----- 3. Anuncios y eventos ----- */
  async function cargarAnuncios() {
    const target = document.getElementById("seccion-anuncios");
    if (!target) return;

    const entries = await loadEntries("anuncios");
    const active = entries
      .filter(estaActivo)
      .sort((a, b) => String(a.fecha || "").localeCompare(String(b.fecha || "")));
    const lang = getLang();

    clear(target);
    if (!active.length) return;

    active.forEach((a) => {
      const card = make("article", "ann-card");
      const tipo = TIPO_LABELS[a.tipo] ? a.tipo : "evento";
      const badge = make("span", "ann-badge ann-badge-" + tipo);
      badge.textContent = TIPO_LABELS[tipo][lang] || TIPO_LABELS[tipo].es;
      card.appendChild(badge);

      const title = a["titulo_" + lang] || a.titulo_es || "";
      if (title) card.appendChild(make("h3", "ann-title", title));

      const dateFmt = formatISODate(a.fecha, lang);
      if (dateFmt) {
        const t = make("time", "ann-date", dateFmt);
        t.dateTime = a.fecha || "";
        card.appendChild(t);
      }

      const desc = a["descripcion_" + lang] || a.descripcion_es || "";
      if (desc) card.appendChild(make("p", "ann-desc", desc));

      target.appendChild(card);
    });
  }

  /* ----- 4. Lectura de la semana ----- */
  async function cargarLectura() {
    const target = document.getElementById("seccion-lectura");
    if (!target) return;

    const entries = await loadEntries("lectura");
    const active = entries.filter(estaActivo);
    if (!active.length) { clear(target); return; }

    const L = active[0];
    const lang = getLang();

    clear(target);
    const verse = L["versiculo_" + lang] || L.versiculo_es || "";
    const ref = L.referencia || "";
    const refl = L["reflexion_" + lang] || L.reflexion_es || "";
    if (verse) target.appendChild(make("blockquote", "reading-verse", verse));
    if (ref) target.appendChild(make("p", "reading-reference", ref));
    if (refl) target.appendChild(make("p", "reading-reflection", refl));
  }

  /* ----- Inicio y reactividad al cambio de idioma ----- */
  const renderAll = () => {
    cargarCumpleanos();
    cargarOracion();
    cargarAnuncios();
    cargarLectura();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAll);
  } else {
    renderAll();
  }

  // Un solo listener para evitar re-renders duplicados. i18n.js despacha
  // 'langChange' en window y 'i18n:change' en document; escogemos uno.
  window.addEventListener("langChange", renderAll);
})();
