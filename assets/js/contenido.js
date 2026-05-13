/* ============================================================
   Iglesia De Cristo Gazcue — contenido.js
   Lee dinámicamente las carpetas data/* del repo en GitHub
   vía la Contents API. Cada archivo nuevo creado por el panel
   CMS aparece en el sitio sin tocar código ni manifiestos.

   Seguridad: todas las inserciones al DOM se hacen con
   textContent y createElement — nunca innerHTML con datos
   externos.

   Reglas defensivas:
   · activo !== false (permisivo: si falta el campo se considera activo).
   · mes se compara con parseInt (acepta string o número).
   · texto(item, campo) cae a *_es si falta *_en o viene vacío.
   · resolverFoto normaliza rutas absolutas/relativas; img.onerror
     reemplaza la imagen rota por el emoji 🎂.
   · Si una sección no tiene entradas activas, se oculta su
     <section> contenedora (con la excepción de #seccion-cumpleanos
     que muestra mensaje "no hay cumpleaños este mes").
   ============================================================ */

(function () {
  "use strict";

  const REPO = "jrm456-w/Iglesia-web";
  const BRANCH = "main";
  const API = `https://api.github.com/repos/${REPO}/contents/data`;

  const COLORES_BADGE = {
    evento: "#9E1B32",
    semanal: "#1B5E9E",
    mensual: "#1B7A3E"
  };

  function getLang() {
    if (window.IDCGi18n && typeof window.IDCGi18n.get === "function") {
      return window.IDCGi18n.get();
    }
    try { return localStorage.getItem("lang") || "es"; }
    catch { return "es"; }
  }

  // Devuelve el texto correcto según idioma activo.
  // Si lang === 'en' y el campo *_en existe y no está vacío, devuelve EN;
  // si no, cae a *_es; si no, intenta el campo bare; si no, "".
  function texto(item, campo) {
    if (!item || !campo) return "";
    const lang = getLang();
    const campoEn = campo + "_en";
    const campoEs = campo + "_es";
    if (lang === "en" && item[campoEn] && String(item[campoEn]).trim() !== "") {
      return item[campoEn];
    }
    if (item[campoEs]) return item[campoEs];
    if (item[campo]) return item[campo];
    return "";
  }

  // Normaliza ruta de imagen: vacío → null; http(s) → tal cual;
  // empieza con "/" → tal cual; si no → prepend "/".
  function resolverFoto(foto) {
    if (foto === undefined || foto === null) return null;
    const v = String(foto).trim();
    if (v === "") return null;
    if (v.startsWith("http://") || v.startsWith("https://")) return v;
    if (v.startsWith("/")) return v;
    return "/" + v;
  }

  // Lista los .json de una carpeta usando la GitHub Contents API.
  // Devuelve metadata con path local y fallback remoto (download_url).
  // Caso de uso: si GitHub ya tiene un archivo nuevo pero Netlify aún no
  // termina de desplegarlo, el fetch local puede responder 404. En ese caso
  // intentamos download_url como fallback para evitar "huecos" de contenido.
  async function listarArchivos(carpeta) {
    try {
      const res = await fetch(`${API}/${carpeta}?ref=${BRANCH}`, {
        headers: { Accept: "application/vnd.github+json" }
      });
      if (!res.ok) return [];
      const archivos = await res.json();
      if (!Array.isArray(archivos)) return [];
      return archivos
        .filter((f) =>
          f &&
          f.type === "file" &&
          typeof f.name === "string" &&
          f.name.endsWith(".json") &&
          typeof f.path === "string"
        )
        .map((f) => ({
          path: f.path,
          downloadUrl: typeof f.download_url === "string" ? f.download_url : null
        }));
    } catch {
      return [];
    }
  }

  // Fetch del JSON con estrategia:
  // 1) path local (más rápido y mismo-origen)
  // 2) download_url remoto (fallback si local aún no está en deploy)
  async function fetchJSON(entry) {
    const path = entry && typeof entry.path === "string" ? entry.path : null;
    const downloadUrl = entry && typeof entry.downloadUrl === "string" ? entry.downloadUrl : null;
    if (!path) return null;

    try {
      const res = await fetch(path, { cache: "no-cache" });
      if (res.ok) {
        const data = await res.json();
        return data && typeof data === "object" ? data : null;
      }
    } catch { /* fallback abajo */ }

    if (!downloadUrl) return null;

    try {
      const resFallback = await fetch(downloadUrl, { cache: "no-cache" });
      if (!resFallback.ok) return null;
      const dataFallback = await resFallback.json();
      return dataFallback && typeof dataFallback === "object" ? dataFallback : null;
    } catch {
      return null;
    }
  }

  // Caché por carpeta para evitar repetir fetch en cada cambio de idioma.
  const cache = {};
  function loadCarpeta(carpeta) {
    if (!cache[carpeta]) {
      cache[carpeta] = (async () => {
        const urls = await listarArchivos(carpeta);
        const docs = await Promise.all(urls.map(fetchJSON));
        return docs.filter(Boolean);
      })();
    }
    return cache[carpeta];
  }

  function ocultarSeccion(el) {
    const seccion = el.closest("section");
    if (seccion) seccion.style.display = "none";
  }

  function mostrarSeccion(el) {
    const seccion = el.closest("section");
    if (seccion) seccion.style.display = "";
  }

  /* ----- CUMPLEAÑOS ----- */
  async function cargarCumpleanos() {
    const el = document.getElementById("seccion-cumpleanos");
    if (!el) return;
    el.innerHTML = "";
    mostrarSeccion(el);

    const mesActual = new Date().getMonth() + 1;
    const todos = await loadCarpeta("cumpleanos");
    const filtrados = todos.filter((item) =>
      item && item.activo !== false && parseInt(item.mes, 10) === mesActual
    );

    if (filtrados.length === 0) {
      const msg = document.createElement("p");
      msg.className = "cumpleanos-vacio";
      msg.textContent = getLang() === "en"
        ? "No birthdays this month."
        : "No hay cumpleaños este mes.";
      el.appendChild(msg);
      return;
    }

    const grid = document.createElement("div");
    grid.className = "cumpleanos-grid";

    filtrados.forEach((item) => {
      const card = document.createElement("div");
      card.className = "cumpleanos-card";

      const rutaFoto = resolverFoto(item.foto);
      if (rutaFoto) {
        const img = document.createElement("img");
        img.src = rutaFoto;
        img.alt = item.nombre || "";
        img.className = "cumpleanos-foto";
        img.loading = "lazy";
        img.onerror = function () {
          const emoji = document.createElement("span");
          emoji.textContent = "🎂";
          emoji.className = "cumpleanos-emoji";
          emoji.setAttribute("aria-hidden", "true");
          this.parentNode.replaceChild(emoji, this);
        };
        card.appendChild(img);
      } else {
        const emoji = document.createElement("span");
        emoji.textContent = "🎂";
        emoji.className = "cumpleanos-emoji";
        emoji.setAttribute("aria-hidden", "true");
        card.appendChild(emoji);
      }

      const nombre = document.createElement("p");
      nombre.className = "cumpleanos-nombre";
      nombre.textContent = item.nombre || "";
      card.appendChild(nombre);

      const fecha = document.createElement("p");
      fecha.className = "cumpleanos-fecha";
      fecha.textContent = item.fecha || "";
      card.appendChild(fecha);

      grid.appendChild(card);
    });

    el.appendChild(grid);
  }

  /* ----- ORACIÓN ----- */
  async function cargarOracion() {
    const el = document.getElementById("lista-oracion");
    if (!el) return;
    el.innerHTML = "";

    const todos = await loadCarpeta("oracion");
    const activos = todos.filter((item) => item && item.activo !== false);

    if (activos.length === 0) {
      ocultarSeccion(el);
      return;
    }
    mostrarSeccion(el);

    const lista = document.createElement("ul");
    lista.className = "oracion-lista";
    activos.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = texto(item, "necesidad");
      lista.appendChild(li);
    });
    el.appendChild(lista);
  }

  /* ----- VERSÍCULO / LECTURA ----- */
  async function cargarLectura() {
    const el = document.getElementById("seccion-lectura");
    if (!el) return;
    el.innerHTML = "";

    const todos = await loadCarpeta("lectura");
    const activo = todos.find((item) => item && item.activo !== false);

    if (!activo) {
      ocultarSeccion(el);
      return;
    }
    mostrarSeccion(el);

    const versiculo = document.createElement("blockquote");
    versiculo.className = "lectura-versiculo";
    versiculo.textContent = texto(activo, "versiculo");
    el.appendChild(versiculo);

    if (activo.referencia) {
      const referencia = document.createElement("cite");
      referencia.className = "lectura-referencia";
      referencia.textContent = activo.referencia;
      el.appendChild(referencia);
    }

    const refl = texto(activo, "reflexion");
    if (refl) {
      const reflexion = document.createElement("p");
      reflexion.className = "lectura-reflexion";
      reflexion.textContent = refl;
      el.appendChild(reflexion);
    }
  }

  /* ----- ANUNCIOS ----- */
  async function cargarAnuncios() {
    const el = document.getElementById("seccion-anuncios");
    if (!el) return;
    el.innerHTML = "";

    const todos = await loadCarpeta("anuncios");
    const activos = todos
      .filter((item) => item && item.activo !== false)
      .sort((a, b) => String(a.fecha || "").localeCompare(String(b.fecha || "")));

    if (activos.length === 0) {
      ocultarSeccion(el);
      return;
    }
    mostrarSeccion(el);

    const grid = document.createElement("div");
    grid.className = "anuncios-grid";

    activos.forEach((item) => {
      const card = document.createElement("div");
      card.className = "anuncio-card";

      const tipo = COLORES_BADGE[item.tipo] ? item.tipo : "evento";
      const badge = document.createElement("span");
      badge.className = "anuncio-badge";
      badge.style.background = COLORES_BADGE[tipo];
      badge.textContent = tipo;
      card.appendChild(badge);

      const titulo = document.createElement("h3");
      titulo.className = "anuncio-titulo";
      titulo.textContent = texto(item, "titulo");
      card.appendChild(titulo);

      const desc = document.createElement("p");
      desc.className = "anuncio-desc";
      desc.textContent = texto(item, "descripcion");
      card.appendChild(desc);

      grid.appendChild(card);
    });

    el.appendChild(grid);
  }

  /* ----- INIT ----- */
  const renderAll = () => {
    cargarCumpleanos();
    cargarOracion();
    cargarLectura();
    cargarAnuncios();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAll);
  } else {
    renderAll();
  }

  // Un solo listener: i18n.js despacha 'langChange' tanto en window
  // como en document; escuchamos en window para evitar el double-render.
  window.addEventListener("langChange", renderAll);
})();
