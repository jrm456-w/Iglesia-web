/* ============================================================
   Iglesia De Cristo Gazcue — identity-init.js
   Redirige al panel /admin/ después de iniciar sesión con
   Netlify Identity desde una página del sitio.
   El script se extrae del HTML (en vez de inline) para mantener
   la CSP estricta sin 'unsafe-inline'.
   ============================================================ */

(function () {
  "use strict";

  if (!window.netlifyIdentity) return;

  window.netlifyIdentity.on("init", function (user) {
    if (!user) {
      window.netlifyIdentity.on("login", function () {
        document.location.href = "/admin/";
      });
    }
  });
})();
