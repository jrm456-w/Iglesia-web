/* ============================================================
   Iglesia De Cristo Gazcue — contenido.js
   Carga data/contenido.json y renderiza la lectura de la semana
   y los anuncios. Todos los textos se inyectan con textContent
   (nunca innerHTML con datos externos) para evitar XSS.
   Reacciona al evento i18n:change para re-renderizar al cambiar
   de idioma.
   ============================================================ */

(function () {
  "use strict";

  const DATA_URL = "data/contenido.json";

  const TIPO_LABELS = {
    evento: { es: "Evento", en: "Event" },
    semanal: { es: "Semanal", en: "Weekly" },
    mensual: { es: "Mensual", en: "Monthly" }
  };

  const ERROR_MSG = {
    es: "Contenido no disponible.",
    en: "Content not available."
  };

  const EMPTY_MSG = {
    es: "Sin anuncios por ahora.",
    en: "No announcements yet."
  };

  const getLang = () => {
    if (window.IDCGi18n && typeof window.IDCGi18n.get === "function") {
      return window.IDCGi18n.get();
    }
    return document.documentElement.lang || "es";
  };

  const readingCard = document.getElementById("reading-card");
  const annGrid = document.getElementById("announcement-grid");
  let data = null;

  const clear = (el) => { while (el && el.firstChild) el.removeChild(el.firstChild); };

  const make = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = String(text);
    return el;
  };

  const formatDate = (iso, lang) => {
    if (!iso || typeof iso !== "string") return "";
    try {
      const d = new Date(iso + "T00:00:00");
      if (isNaN(d.getTime())) return iso;
      const locale = lang === "en" ? "en-US" : "es-DO";
      return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return iso;
    }
  };

  const renderReading = () => {
    if (!readingCard) return;
    clear(readingCard);
    const L = data && data.lectura;
    if (!L || typeof L !== "object") return;

    const lang = getLang();
    const verseText = L["versiculo_" + lang] || L.versiculo_es || "";
    const refText = L.referencia || "";
    const reflText = L["reflexion_" + lang] || L.reflexion_es || "";

    if (verseText) readingCard.appendChild(make("blockquote", "reading-verse", verseText));
    if (refText) readingCard.appendChild(make("p", "reading-reference", refText));
    if (reflText) readingCard.appendChild(make("p", "reading-reflection", reflText));
  };

  const renderAnnouncements = () => {
    if (!annGrid) return;
    clear(annGrid);
    const list = data && Array.isArray(data.anuncios) ? data.anuncios : [];
    const lang = getLang();
    const active = list
      .filter((a) => a && a.activo === true)
      .sort((a, b) => String(a.fecha || "").localeCompare(String(b.fecha || "")));

    if (active.length === 0) {
      annGrid.appendChild(make("p", "ann-empty", EMPTY_MSG[lang] || EMPTY_MSG.es));
      return;
    }

    active.forEach((a) => {
      const card = make("article", "ann-card");

      const tipo = TIPO_LABELS[a.tipo] ? a.tipo : "evento";
      const badge = make("span", "ann-badge ann-badge-" + tipo);
      badge.textContent = TIPO_LABELS[tipo][lang] || TIPO_LABELS[tipo].es;
      card.appendChild(badge);

      const titleText = a["titulo_" + lang] || a.titulo_es || "";
      if (titleText) card.appendChild(make("h3", "ann-title", titleText));

      const dateText = formatDate(a.fecha, lang);
      if (dateText) {
        const time = make("time", "ann-date", dateText);
        time.dateTime = a.fecha || "";
        card.appendChild(time);
      }

      const descText = a["descripcion_" + lang] || a.descripcion_es || "";
      if (descText) card.appendChild(make("p", "ann-desc", descText));

      annGrid.appendChild(card);
    });
  };

  const renderAll = () => { renderReading(); renderAnnouncements(); };

  const showError = () => {
    const lang = getLang();
    const msg = ERROR_MSG[lang] || ERROR_MSG.es;
    if (readingCard) { clear(readingCard); readingCard.appendChild(make("p", "reading-error", msg)); }
    if (annGrid) { clear(annGrid); annGrid.appendChild(make("p", "ann-empty", msg)); }
  };

  fetch(DATA_URL, { cache: "no-cache" })
    .then((r) => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then((json) => {
      if (!json || typeof json !== "object") throw new Error("invalid json");
      data = json;
      renderAll();
    })
    .catch(showError);

  document.addEventListener("i18n:change", () => {
    if (data) renderAll();
  });
})();
