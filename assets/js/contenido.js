/* ============================================================
   Iglesia De Cristo Gazcue — contenido.js
   Lee data/index.json (manifiesto) y luego cada archivo JSON
   listado para renderizar cumpleaños, oración, anuncios y
   lectura. No depende de backend — funciona sobre Netlify
   estático.

   Cada vez que el CMS crea/elimina una entrada, hay que
   actualizar data/index.json (documentado en el README).

   Seguridad: todas las inserciones al DOM usan textContent o
   atributos seguros — no se usa innerHTML con datos externos.
   ============================================================ */

(function () {
  "use strict";

  const MANIFEST_URL = "data/index.json";

  const FOLDERS = {
    cumpleanos: "data/cumpleanos",
    oracion: "data/oracion",
    anuncios: "data/anuncios",
    lectura: "data/lectura"
  };

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

  /* ----- Carga del manifiesto y de las entradas ----- */
  let manifestPromise = null;
  const entriesCache = {};

  const loadManifest = () => {
    if (!manifestPromise) {
      manifestPromise = fetch(MANIFEST_URL, { cache: "no-cache" })
        .then((r) => (r.ok ? r.json() : null))
        .then((m) => (m && typeof m === "object" ? m : null))
        .catch(() => null);
    }
    return manifestPromise;
  };

  async function loadEntries(type) {
    if (entriesCache[type]) return entriesCache[type];
    const manifest = await loadManifest();
    if (!manifest || !Array.isArray(manifest[type])) return [];
    const folder = FOLDERS[type];
    if (!folder) return [];

    const files = manifest[type].filter((f) => typeof f === "string" && f.endsWith(".json"));
    const results = await Promise.all(
      files.map(async (name) => {
        try {
          const r = await fetch(`${folder}/${encodeURIComponent(name)}`, { cache: "no-cache" });
          if (!r.ok) return null;
          const data = await r.json();
          return data && typeof data === "object" ? data : null;
        } catch { return null; }
      })
    );
    const entries = results.filter(Boolean);
    entriesCache[type] = entries;
    return entries;
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

  /* ----- Renderers ----- */
  async function cargarCumpleanos() {
    const target = document.getElementById("seccion-cumpleanos");
    if (!target) return;

    const entries = await loadEntries("cumpleanos");
    const mes = new Date().getMonth() + 1; // 1-12
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

  async function cargarOracion() {
    const target = document.getElementById("lista-oracion");
    if (!target) return;

    const entries = await loadEntries("oracion");
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

  async function cargarAnuncios() {
    const target = document.getElementById("seccion-anuncios");
    if (!target) return;

    const entries = await loadEntries("anuncios");
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

  async function cargarLectura() {
    const target = document.getElementById("seccion-lectura");
    if (!target) return;

    const entries = await loadEntries("lectura");
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

  renderAll();
  document.addEventListener("langChange", renderAll);
  document.addEventListener("i18n:change", renderAll); // compatibilidad
})();
