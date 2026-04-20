/* ============================================================
   Iglesia De Cristo Gazcue — main.js
   Fase 1 (parcial): mobile nav + año del footer.
   Fase 3 ampliará con i18n, tabs y validación de formulario.
   ============================================================ */

(function () {
  "use strict";

  // Año dinámico en el footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Toggle del menú móvil
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Cerrar al hacer clic en un enlace del menú
    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }
})();
