/* ============================================================
   Iglesia De Cristo Gazcue — contenido.js
   Lee el contenido editado por Netlify CMS desde las carpetas
   data/anuncios, data/cumpleanos, data/oracion, data/lectura.

   Estrategia:
   1. Lista los archivos JSON de cada carpeta usando la GitHub
      Contents API (con caché en localStorage para no agotar el
      rate limit de 60 req/hora).
   2. Lee cada archivo desde el dominio actual (mismo origen,
      cero impacto en CSP), asumiendo que Netlify ya redeployó.
   3. Renderiza cada tipo a su contenedor si existe en la página.
      Si no hay datos o el contenedor no existe, la sección
      respectiva se oculta o se mantiene su fallback estático.

   Toda inserción al DOM usa textContent → no hay riesgo de XSS
   aunque un archivo JSON quede comprometido.
   ============================================================ */

(function () {
  "use strict";

  const REPO_OWNER = "jrm456-w";
  const REPO_NAME = "Iglesia-web";
  const BRANCH = "main";
  const CACHE_TTL_MS = 15 * 60 * 1000;

  const FOLDERS = {
    anuncios: "data/anuncios",
    cumpleanos: "data/cumpleanos",
    oracion: "data/oracion",
    lectura: "data/lectura"
  };

  const TIPO_LABELS = {
    evento: { es: "Evento", en: "Event" },
    semanal: { es: "Semanal", en: "Weekly" },
    mensual: { es: "Mensual", en: "Monthly" }
  };

  const MESES_ES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  const MESES_EN = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];

  const getLang = () => {
    if (window.IDCGi18n && typeof window.IDCGi18n.get === "function") {
      return window.IDCGi18n.get();
    }
    try { return localStorage.getItem("lang") || "es"; } catch { return "es"; }
  };

  const clear = (el) => { while (el && el.firstChild) el.removeChild(el.firstChild); };
  const make = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = String(text);
    return el;
  };

  /* ----- 1. Listado via GitHub Contents API (con caché) ----- */
  const cacheGet = (key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts > CACHE_TTL_MS) return null;
      return data;
    } catch { return null; }
  };

  const cacheSet = (key, data) => {
    try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch { /* ignore */ }
  };

  async function listFiles(folderPath) {
    const cacheKey = `idcg_listing_${folderPath}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${folderPath}?ref=${BRANCH}`;
    try {
      const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
      if (!res.ok) return [];
      const json = await res.json();
      if (!Array.isArray(json)) return [];
      const names = json
        .filter((f) => f && f.type === "file" && typeof f.name === "string" && f.name.endsWith(".json"))
        .map((f) => f.name);
      cacheSet(cacheKey, names);
      return names;
    } catch {
      return [];
    }
  }

  async function fetchEntries(folderPath) {
    const names = await listFiles(folderPath);
    if (!names.length) return [];
    const results = await Promise.all(names.map(async (name) => {
      try {
        const r = await fetch(`${folderPath}/${encodeURIComponent(name)}`, { cache: "no-cache" });
        if (!r.ok) return null;
        const obj = await r.json();
        return obj && typeof obj === "object" ? obj : null;
      } catch { return null; }
    }));
    // Adjunta el nombre del archivo para poder ordenar por slug si hace falta.
    return results
      .map((data, i) => data ? Object.assign({}, data, { _file: names[i] }) : null)
      .filter(Boolean);
  }

  /* ----- 2. Helpers de fechas y formato ----- */
  const formatISODate = (iso, lang) => {
    if (!iso || typeof iso !== "string") return "";
    try {
      const d = new Date(iso + "T00:00:00");
      if (isNaN(d.getTime())) return iso;
      const locale = lang === "en" ? "en-US" : "es-DO";
      return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
    } catch { return iso; }
  };

  // Parsea "15 de enero" o "January 15" → { day, month } (month 0–11)
  const parseFreeDate = (s) => {
    if (!s || typeof s !== "string") return null;
    const lower = s.toLowerCase().trim();
    // ES: "15 de enero"
    let m = lower.match(/(\d{1,2})\s+de\s+([a-záéíóú]+)/i);
    if (m) {
      const day = parseInt(m[1], 10);
      const month = MESES_ES.indexOf(m[2]);
      if (day && month !== -1) return { day, month };
    }
    // EN: "january 15"
    m = lower.match(/([a-z]+)\s+(\d{1,2})/i);
    if (m) {
      const month = MESES_EN.indexOf(m[1]);
      const day = parseInt(m[2], 10);
      if (day && month !== -1) return { day, month };
    }
    return null;
  };

  /* ----- 3. Renderers ----- */
  async function renderLectura() {
    const target = document.getElementById("reading-card");
    if (!target) return;
    const wrap = document.getElementById("bulletin-reading");
    const entries = await fetchEntries(FOLDERS.lectura);
    const active = entries.filter((e) => e && e.activo === true);
    if (!active.length) { if (wrap) wrap.hidden = true; return; }

    // "La más reciente": el slug suele incluir timestamp; ordena desc por nombre.
    active.sort((a, b) => String(b._file).localeCompare(String(a._file)));
    const L = active[0];
    const lang = getLang();

    clear(target);
    const verse = L["versiculo_" + lang] || L.versiculo_es || "";
    const ref = L.referencia || "";
    const refl = L["reflexion_" + lang] || L.reflexion_es || "";
    if (verse) target.appendChild(make("blockquote", "reading-verse", verse));
    if (ref) target.appendChild(make("p", "reading-reference", ref));
    if (refl) target.appendChild(make("p", "reading-reflection", refl));
    if (wrap) wrap.hidden = false;
  }

  async function renderAnnouncements() {
    const target = document.getElementById("announcement-grid");
    if (!target) return;
    const wrap = document.getElementById("bulletin-announcements");
    const entries = await fetchEntries(FOLDERS.anuncios);
    const active = entries
      .filter((e) => e && e.activo === true)
      .sort((a, b) => String(a.fecha || "").localeCompare(String(b.fecha || "")));

    if (!active.length) { if (wrap) wrap.hidden = true; return; }

    const lang = getLang();
    clear(target);
    active.forEach((a) => {
      const card = make("article", "ann-card");
      const tipo = TIPO_LABELS[a.tipo] ? a.tipo : "evento";
      const badge = make("span", "ann-badge ann-badge-" + tipo);
      badge.textContent = TIPO_LABELS[tipo][lang] || TIPO_LABELS[tipo].es;
      card.appendChild(badge);

      const title = a["titulo_" + lang] || a.titulo_es || "";
      if (title) card.appendChild(make("h4", "ann-title", title));

      const dateText = formatISODate(a.fecha, lang);
      if (dateText) {
        const t = make("time", "ann-date", dateText);
        t.dateTime = a.fecha || "";
        card.appendChild(t);
      }

      const desc = a["descripcion_" + lang] || a.descripcion_es || "";
      if (desc) card.appendChild(make("p", "ann-desc", desc));

      target.appendChild(card);
    });
    if (wrap) wrap.hidden = false;
  }

  async function renderBirthdays() {
    const target = document.getElementById("birthday-list");
    if (!target) return;
    const wrap = document.getElementById("bulletin-birthdays");
    const entries = await fetchEntries(FOLDERS.cumpleanos);
    const currentMonth = new Date().getMonth();

    const monthly = entries
      .map((e) => {
        const parsed = parseFreeDate(e && e.fecha);
        return parsed ? Object.assign({}, e, { _parsed: parsed }) : null;
      })
      .filter((e) => e && e._parsed.month === currentMonth)
      .sort((a, b) => a._parsed.day - b._parsed.day);

    if (!monthly.length) { if (wrap) wrap.hidden = true; return; }

    clear(target);
    monthly.forEach((b) => {
      const item = make("li", "birthday-item");
      const day = make("span", "birthday-day", String(b._parsed.day));
      const name = make("span", "birthday-name", b.nombre || "");
      item.appendChild(day);
      item.appendChild(name);
      target.appendChild(item);
    });
    if (wrap) wrap.hidden = false;
  }

  async function renderPrayerNeeds() {
    const list = document.getElementById("prayer-needs-list");
    if (!list) return;
    const entries = await fetchEntries(FOLDERS.oracion);
    const active = entries.filter((e) => e && e.activo === true);
    if (!active.length) return; // conserva el fallback estático

    const lang = getLang();
    clear(list);
    active.forEach((n) => {
      const li = make("li");
      li.textContent = (n["necesidad_" + lang] || n.necesidad_es || "").trim();
      if (li.textContent) list.appendChild(li);
    });
  }

  /* ----- 4. Inicio y reactividad al cambio de idioma ----- */
  const renderAll = () => {
    renderLectura();
    renderAnnouncements();
    renderBirthdays();
    renderPrayerNeeds();
  };

  renderAll();
  document.addEventListener("i18n:change", renderAll);
})();
