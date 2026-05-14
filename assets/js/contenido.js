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
  // Rama de la que se listan los archivos del CMS vía GitHub Contents
  // API. Debe coincidir con la rama configurada en admin/config.yml
  // (backend.branch) y con la rama de producción de Netlify.
  const BRANCH = "claude/church-website-builder-LTHxX";
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

  // Helper: detectar localhost para logging de diagnóstico solo en
  // desarrollo. En producción la consola queda limpia.
  const isLocalhost = () => {
    const h = (window.location && window.location.hostname) || "";
    return h === "localhost" || h === "127.0.0.1" || h === "" || h.endsWith(".local");
  };
  const debug = (...args) => { if (isLocalhost()) console.log("[contenido]", ...args); };

  // Lista los .json de una carpeta usando la GitHub Contents API.
  // Devuelve metadata para tres rutas posibles de fetch:
  //   · path        — local same-origin (Netlify); más rápido cuando ya
  //                   está deployado.
  //   · apiUrl      — URL de la GitHub Contents API para ese archivo;
  //                   devuelve el contenido en base64 dentro de un
  //                   JSON. Funciona en redes que bloquean raw.gh.
  //   · downloadUrl — raw.githubusercontent.com; último recurso.
  // Aplica trim() defensivo por si la API devuelve whitespace.
  async function listarArchivos(carpeta, intento) {
    intento = intento || 0;
    try {
      const res = await fetch(`${API}/${carpeta}?ref=${BRANCH}`, {
        headers: { Accept: "application/vnd.github+json" }
      });
      // Reintento defensivo en errores 5xx transitorios (no en 403 de
      // rate limit, que no se cura esperando 2s).
      if (res.status >= 500 && res.status < 600 && intento === 0) {
        debug("listarArchivos 5xx, reintentando", carpeta, res.status);
        await new Promise((r) => setTimeout(r, 2000));
        return listarArchivos(carpeta, 1);
      }
      if (!res.ok) { debug("listarArchivos !ok", carpeta, res.status); return { ok: false, entries: [] }; }
      const archivos = await res.json();
      if (!Array.isArray(archivos)) return { ok: false, entries: [] };
      // Mapeo según spec: { path, api_url, download_url }.
      // El sha es un campo adicional opcional usado solo por el cache
      // localStorage (optimización transparente al spec).
      const entries = archivos
        .filter((f) =>
          f &&
          f.type === "file" &&
          typeof f.name === "string" &&
          f.name.endsWith(".json") &&
          typeof f.path === "string"
        )
        .map((f) => ({
          path: f.path.trim(),
          api_url: typeof f.url === "string" ? f.url.trim() : null,
          download_url: typeof f.download_url === "string" ? f.download_url.trim() : null,
          sha: typeof f.sha === "string" ? f.sha : null
        }))
        .filter((e) => e.path);
      return { ok: true, entries };
    } catch (err) {
      debug("listarArchivos error", carpeta, err);
      return { ok: false, entries: [] };
    }
  }

  // Decodifica el contenido base64 de la GitHub Contents API
  // respetando UTF-8 (atob solo devuelve binary string).
  function decodificarBase64Utf8(b64) {
    try {
      const limpio = b64.replace(/\s/g, "");
      const binStr = atob(limpio);
      const bytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
      return new TextDecoder("utf-8").decode(bytes);
    } catch {
      return null;
    }
  }

  // Caché localStorage por SHA. El SHA cambia solo cuando cambia el
  // contenido del archivo, así que un cache hit garantiza el contenido
  // actual y nos ahorra una llamada a la API por archivo.
  const FILE_CACHE_PREFIX = "idcg_file_";
  const FILE_CACHE_TTL_MS = 7 * 86400 * 1000;
  function fileCacheGet(sha) {
    if (!sha) return null;
    try {
      const raw = localStorage.getItem(FILE_CACHE_PREFIX + sha);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts > FILE_CACHE_TTL_MS) {
        localStorage.removeItem(FILE_CACHE_PREFIX + sha);
        return null;
      }
      return data;
    } catch { return null; }
  }
  function fileCacheSet(sha, data) {
    if (!sha) return;
    try {
      localStorage.setItem(FILE_CACHE_PREFIX + sha, JSON.stringify({ ts: Date.now(), data }));
    } catch { /* storage lleno: ignorar */ }
  }

  // Fetch del JSON con la cadena pedida en el spec:
  //   a) path relativo                       — same-origin Netlify
  //   b) /path absoluto                      — same-origin Netlify
  //   c) api_url?ref=BRANCH (base64)         — GitHub Contents API;
  //                                            funciona aunque raw.gh
  //                                            esté bloqueado por cert SSL
  //   d) download_url                        — raw.githubusercontent.com
  //
  // Pre-paso (mejora propia, transparente al spec): cache localStorage
  // por SHA. Si el SHA ya está cacheado, devuelve la data sin hacer
  // ninguna request. Cubre ~95% de cargas tras la primera visita.
  //
  // Trade-off conocido del orden a) primero: si Netlify aún no terminó
  // de deployar un archivo recién creado por el CMS, los pasos a y b
  // generan 404 visible en consola hasta que (c) lo rescata.
  async function fetchJSON(source) {
    if (!source || !source.path) return null;

    // Pre-paso: cache local por SHA (sin red).
    if (source.sha) {
      const cached = fileCacheGet(source.sha);
      if (cached) return cached;
    }

    const relativo = source.path.replace(/^\/+/, "");

    // a) path relativo
    try {
      const res = await fetch(relativo, { cache: "no-cache" });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object") {
          fileCacheSet(source.sha, data);
          return data;
        }
      } else {
        debug("fetchJSON rel !ok", res.status, relativo);
      }
    } catch (err) {
      debug("fetchJSON rel error", relativo, err);
    }

    // b) /path absoluto
    const absoluto = "/" + relativo;
    try {
      const res = await fetch(absoluto, { cache: "no-cache" });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object") {
          fileCacheSet(source.sha, data);
          return data;
        }
      } else {
        debug("fetchJSON abs !ok", res.status, absoluto);
      }
    } catch (err) {
      debug("fetchJSON abs error", absoluto, err);
    }

    // c) GitHub Contents API con base64 a UTF-8 a JSON.parse
    if (source.api_url) {
      try {
        const sep = source.api_url.includes("?") ? "&" : "?";
        const res = await fetch(`${source.api_url}${sep}ref=${BRANCH}`, {
          headers: { Accept: "application/vnd.github+json" },
          cache: "no-cache"
        });
        if (res.ok) {
          const payload = await res.json();
          if (payload && typeof payload.content === "string") {
            const text = decodificarBase64Utf8(payload.content);
            if (text) {
              const data = JSON.parse(text);
              if (data && typeof data === "object") {
                fileCacheSet(source.sha, data);
                return data;
              }
            }
          }
        } else {
          debug("fetchJSON api !ok", res.status, source.api_url);
        }
      } catch (err) {
        debug("fetchJSON api error", source.api_url, err);
      }
    }

    // d) raw.githubusercontent.com (puede fallar por cert SSL en algunas redes)
    if (source.download_url) {
      try {
        const res = await fetch(source.download_url, { cache: "no-cache" });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === "object") {
            fileCacheSet(source.sha, data);
            return data;
          }
        } else {
          debug("fetchJSON raw !ok", res.status, source.download_url);
        }
      } catch (err) {
        debug("fetchJSON raw error", source.download_url, err);
      }
    }

    debug("fetchJSON ALL failed", source.path);
    return null;
  }

  // Caché por carpeta para evitar repetir fetch en cada cambio de idioma.
  // Devuelve { ok, docs }: ok=false significa que la API listing falló
  // (rate limit, red, etc.), distinto de docs vacío por filtro.
  const cache = {};
  function loadCarpeta(carpeta) {
    if (!cache[carpeta]) {
      cache[carpeta] = (async () => {
        const res = await listarArchivos(carpeta);
        if (!res.ok) return { ok: false, docs: [] };
        const docs = await Promise.all(res.entries.map(fetchJSON));
        return { ok: true, docs: docs.filter(Boolean) };
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

    const ahora = new Date();
    const mesActual = ahora.getMonth() + 1;
    const lang = getLang();
    const nombreMes = ahora.toLocaleDateString(
      lang === "en" ? "en-US" : "es-DO",
      { month: "long" }
    );
    const res = await loadCarpeta("cumpleanos");

    // Caso "API no respondió": no engañar al usuario diciendo que no
    // hay datos cuando solo es un problema de red/rate limit.
    if (!res.ok) {
      const msg = document.createElement("p");
      msg.className = "cumpleanos-vacio";
      msg.textContent = lang === "en"
        ? "Couldn't load birthdays right now. Please try again in a few minutes."
        : "No se pudieron cargar los cumpleaños ahora. Intenta de nuevo en unos minutos.";
      el.appendChild(msg);
      return;
    }

    const filtrados = res.docs.filter((item) =>
      item && item.activo !== false && parseInt(item.mes, 10) === mesActual
    );

    if (filtrados.length === 0) {
      const msg = document.createElement("p");
      msg.className = "cumpleanos-vacio";
      msg.textContent = lang === "en"
        ? `No birthdays in ${nombreMes}.`
        : `No hay cumpleaños en ${nombreMes}.`;
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

    const res = await loadCarpeta("oracion");
    if (!res.ok) { ocultarSeccion(el); return; }
    const activos = res.docs.filter((item) => item && item.activo !== false);

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

    const res = await loadCarpeta("lectura");
    if (!res.ok) { ocultarSeccion(el); return; }
    const activo = res.docs.find((item) => item && item.activo !== false);

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

    const res = await loadCarpeta("anuncios");
    if (!res.ok) { ocultarSeccion(el); return; }
    const activos = res.docs
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
