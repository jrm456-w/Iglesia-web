/* ============================================================
   Iglesia De Cristo Gazcue — main.js
   Funcionalidad de UI: navegación móvil, año del footer,
   sección de preguntas (chips, campo condicional, envío mailto).
   La Fase 3 ampliará con i18n ES/EN, tabs y validación del
   formulario principal de contacto.
   ============================================================ */

(function () {
  "use strict";

  /* -------- Año dinámico en el footer -------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------- Toggle del menú móvil -------- */
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* -------- Sección de preguntas (FAQ) -------- */
  const faqForm = document.getElementById("faq-form");

  if (faqForm) {
    const questionField = faqForm.querySelector("#q-question");
    const emailField = faqForm.querySelector("#q-email");
    const phoneField = faqForm.querySelector("#q-phone");
    const emailRow = faqForm.querySelector('[data-method="email"]');
    const phoneRow = faqForm.querySelector('[data-method="whatsapp"]');
    const statusEl = document.getElementById("faq-status");

    // Email destino temporal (se reemplazará al confirmar el correo oficial).
    const TARGET_EMAIL = "contacto@idcgazcue.org";

    /* Chips: click pre-rellena el textarea con la pregunta sugerida */
    document.querySelectorAll(".faq-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const text = chip.dataset.question || chip.textContent.trim();
        questionField.value = text;
        questionField.focus();
        questionField.setSelectionRange(text.length, text.length);
      });
    });

    /* Toggle del campo de contacto según el medio elegido */
    const toggleContactMethod = (method) => {
      const isEmail = method === "email";
      emailRow.hidden = !isEmail;
      phoneRow.hidden = isEmail;
      emailField.required = isEmail;
      phoneField.required = !isEmail;
      // Limpia validación previa del campo oculto
      const hidden = isEmail ? phoneField : emailField;
      hidden.removeAttribute("aria-invalid");
    };

    faqForm.querySelectorAll('input[name="contactMethod"]').forEach((radio) => {
      radio.addEventListener("change", (e) => toggleContactMethod(e.target.value));
    });

    /* Validación + envío por mailto */
    faqForm.addEventListener("submit", (e) => {
      e.preventDefault();
      statusEl.className = "form-status";
      statusEl.textContent = "";

      const data = new FormData(faqForm);
      const name = (data.get("name") || "").toString().trim();
      const question = (data.get("question") || "").toString().trim();
      const method = (data.get("contactMethod") || "email").toString();
      const contactValue = method === "email"
        ? (data.get("email") || "").toString().trim()
        : (data.get("phone") || "").toString().trim();

      // Validación campo a campo con marcado accesible
      const errors = [];
      const setInvalid = (input, isInvalid) => {
        if (isInvalid) input.setAttribute("aria-invalid", "true");
        else input.removeAttribute("aria-invalid");
      };

      const nameInput = faqForm.querySelector("#q-name");
      const isNameOk = name.length >= 2 && name.length <= 80;
      setInvalid(nameInput, !isNameOk);
      if (!isNameOk) errors.push("nombre");

      const isQuestionOk = question.length >= 5;
      setInvalid(questionField, !isQuestionOk);
      if (!isQuestionOk) errors.push("pregunta");

      if (method === "email") {
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contactValue);
        setInvalid(emailField, !emailOk);
        if (!emailOk) errors.push("correo");
      } else {
        const phoneOk = /^\+?[0-9 ()\-]{7,20}$/.test(contactValue);
        setInvalid(phoneField, !phoneOk);
        if (!phoneOk) errors.push("WhatsApp");
      }

      if (errors.length) {
        statusEl.classList.add("is-error");
        statusEl.textContent = `Revisa estos campos: ${errors.join(", ")}.`;
        return;
      }

      // Construye el mailto seguro (todo va en el body, sin inyección de headers)
      const subject = `Pregunta desde la web — ${name}`;
      const body = [
        `Nombre: ${name}`,
        `Medio de contacto preferido: ${method === "email" ? "Correo" : "WhatsApp"}`,
        `Contacto: ${contactValue}`,
        ``,
        `Pregunta:`,
        question
      ].join("\n");

      const mailto = `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;

      statusEl.classList.add("is-success");
      statusEl.textContent = "Abriendo tu cliente de correo… si no se abre, revisa tu configuración.";
    });
  }
})();
