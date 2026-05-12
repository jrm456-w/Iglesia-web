/* ============================================================
   Iglesia De Cristo Gazcue — contenido.js
   Lee dinámicamente las carpetas data/* del repositorio en
   GitHub vía la Contents API. Así, cada archivo nuevo que
   cree el panel CMS aparece en el sitio sin tocar manifiestos
   ni código.

   Seguridad: todo lo que entra al DOM va por textContent o
   atributos controlados — nunca innerHTML con datos externos.
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

    const entries = await cargarCarpeta("cumpleanos");
    const mes = new Date().getMonth() + 1;
    const lang = getLang();
    const list = entries
      .filter((e) => e && e.activo === true && Number(e.mes) === mes)
      .sort((a, b) => parseDay(a.fecha) - parseDay(b.fecha));

    clear(target);
    if (!list.length) {
      target.appendChild(make("p", "empty-msg", EMPTY.cumpleanos[lang] || EMPTY.cumpleanos.es));
      return;
    }

    list.forEach((b) => {
      const card = make("article", "birthday-card");

      if (b.foto && String(b.foto).trim()) {
        const img = document.createElement("img");
        img.className = "birthday-photo";
        img.src = b.foto;
        img.alt = b.nombre || "";
        img.loading = "lazy";
        img.width = 96;
        img.height = 96;
        card.appendChild(img);
      } else {
        const icon = make("span", "birthday-icon");
        icon.textContent = "🎂";
        icon.setAttribute("aria-hidden", "true");
        card.appendChild(icon);
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

    const entries = await cargarCarpeta("oracion");
    const active = entries.filter((e) => e && e.activo === true);
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

    const entries = await cargarCarpeta("anuncios");
    const active = entries
      .filter((e) => e && e.activo === true)
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

    const entries = await cargarCarpeta("lectura");
    const active = entries.filter((e) => e && e.activo === true);
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

  // El usuario quiso window.addEventListener('langChange'); i18n.js
  // dispara el evento en window y en document para compatibilidad.
  window.addEventListener("langChange", renderAll);
  document.addEventListener("i18n:change", renderAll);
})();
