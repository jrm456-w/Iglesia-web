/* ============================================================
   Iglesia De Cristo Gazcue — main.js
   Interacciones de UI: nav móvil, tabs, formularios (FAQ y
   contacto), scroll spy y envío por mailto seguro.
   Traducciones ES/EN viven en i18n.js.
   ============================================================ */

(function () {
  "use strict";

  // Correo destino temporal — reemplazar al confirmar el correo oficial.
  const TARGET_EMAIL = "contacto@idcgazcue.org";

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_RE = /^\+?[0-9 ()\-]{7,20}$/;

  const setInvalid = (input, isInvalid) => {
    if (isInvalid) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  };

  const buildMailto = (subject, body) =>
    `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

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

  /* -------- Tabs del hub de contenido -------- */
  const tabs = Array.from(document.querySelectorAll(".tabs .tab"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));

  const activateTab = (tabEl) => {
    const name = tabEl.dataset.tab;
    tabs.forEach((t) => {
      const active = t === tabEl;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
      t.setAttribute("tabindex", active ? "0" : "-1");
    });
    panels.forEach((panel) => {
      const active = panel.id === `panel-${name}`;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const idx = tabs.indexOf(tab);
      const nextIdx = e.key === "ArrowRight"
        ? (idx + 1) % tabs.length
        : (idx - 1 + tabs.length) % tabs.length;
      tabs[nextIdx].focus();
      activateTab(tabs[nextIdx]);
    });
  });

  /* -------- FAQ: chips + campo condicional + envío -------- */
  const faqForm = document.getElementById("faq-form");

  if (faqForm) {
    const nameInput = faqForm.querySelector("#q-name");
    const questionField = faqForm.querySelector("#q-question");
    const emailField = faqForm.querySelector("#q-email");
    const phoneField = faqForm.querySelector("#q-phone");
    const emailRow = faqForm.querySelector('[data-method="email"]');
    const phoneRow = faqForm.querySelector('[data-method="whatsapp"]');
    const statusEl = document.getElementById("faq-status");
    const submitBtn = faqForm.querySelector('button[type="submit"]');

    document.querySelectorAll(".faq-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const text = chip.dataset.question || chip.textContent.trim();
        questionField.value = text;
        questionField.focus();
        questionField.setSelectionRange(text.length, text.length);
      });
    });

    const toggleContactMethod = (method) => {
      const isEmail = method === "email";
      emailRow.hidden = !isEmail;
      phoneRow.hidden = isEmail;
      emailField.required = isEmail;
      phoneField.required = !isEmail;
      setInvalid(isEmail ? phoneField : emailField, false);
    };

    faqForm.querySelectorAll('input[name="contactMethod"]').forEach((radio) => {
      radio.addEventListener("change", (e) => toggleContactMethod(e.target.value));
    });

    faqForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (submitBtn.disabled) return;

      statusEl.className = "form-status";
      statusEl.textContent = "";

      const data = new FormData(faqForm);
      const name = (data.get("name") || "").toString().trim();
      const question = (data.get("question") || "").toString().trim();
      const method = (data.get("contactMethod") || "email").toString();
      const contactValue = method === "email"
        ? (data.get("email") || "").toString().trim()
        : (data.get("phone") || "").toString().trim();

      const errors = [];
      const isNameOk = name.length >= 2 && name.length <= 80;
      setInvalid(nameInput, !isNameOk);
      if (!isNameOk) errors.push("nombre");

      const isQuestionOk = question.length >= 5;
      setInvalid(questionField, !isQuestionOk);
      if (!isQuestionOk) errors.push("pregunta");

      if (method === "email") {
        const emailOk = EMAIL_RE.test(contactValue);
        setInvalid(emailField, !emailOk);
        if (!emailOk) errors.push("correo");
      } else {
        const phoneOk = PHONE_RE.test(contactValue);
        setInvalid(phoneField, !phoneOk);
        if (!phoneOk) errors.push("WhatsApp");
      }

      if (errors.length) {
        statusEl.classList.add("is-error");
        statusEl.textContent = `Revisa estos campos: ${errors.join(", ")}.`;
        return;
      }

      const subject = `Pregunta desde la web — ${name}`;
      const body = [
        `Nombre: ${name}`,
        `Medio de contacto preferido: ${method === "email" ? "Correo" : "WhatsApp"}`,
        `Contacto: ${contactValue}`,
        ``,
        `Pregunta:`,
        question
      ].join("\n");

      submitBtn.disabled = true;
      window.location.href = buildMailto(subject, body);

      statusEl.classList.add("is-success");
      statusEl.textContent = "Abriendo tu cliente de correo… si no se abre, revisa tu configuración.";
      setTimeout(() => { submitBtn.disabled = false; }, 3000);
    });
  }

  /* -------- Formulario principal de contacto -------- */
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    const nameInput = contactForm.querySelector("#c-name");
    const emailInput = contactForm.querySelector("#c-email");
    const whatsappInput = contactForm.querySelector("#c-whatsapp");
    const interestInput = contactForm.querySelector("#c-interest");
    const messageInput = contactForm.querySelector("#c-message");
    const statusEl = document.getElementById("form-status");
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (submitBtn.disabled) return;

      statusEl.className = "form-status";
      statusEl.textContent = "";

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const whatsapp = whatsappInput.value.trim();
      const interest = interestInput.value;
      const message = messageInput.value.trim();

      const errors = [];

      const isNameOk = name.length >= 2 && name.length <= 80;
      setInvalid(nameInput, !isNameOk);
      if (!isNameOk) errors.push("nombre");

      const isEmailOk = EMAIL_RE.test(email);
      setInvalid(emailInput, !isEmailOk);
      if (!isEmailOk) errors.push("correo");

      // WhatsApp es opcional: solo valida si el usuario escribió algo
      const isWhatsappOk = !whatsapp || PHONE_RE.test(whatsapp);
      setInvalid(whatsappInput, !isWhatsappOk);
      if (!isWhatsappOk) errors.push("WhatsApp");

      const isInterestOk = Boolean(interest);
      setInvalid(interestInput, !isInterestOk);
      if (!isInterestOk) errors.push("interés");

      const isMessageOk = message.length >= 5;
      setInvalid(messageInput, !isMessageOk);
      if (!isMessageOk) errors.push("mensaje");

      if (errors.length) {
        statusEl.classList.add("is-error");
        statusEl.textContent = `Revisa estos campos: ${errors.join(", ")}.`;
        return;
      }

      const interestLabels = {
        visitar: "Quiero visitar",
        miembro: "Ser miembro",
        oracion: "Petición de oración",
        otro: "Otro"
      };

      const subject = `Contacto desde la web — ${name}`;
      const body = [
        `Nombre: ${name}`,
        `Correo: ${email}`,
        whatsapp ? `WhatsApp: ${whatsapp}` : null,
        `Interés: ${interestLabels[interest] || interest}`,
        ``,
        `Mensaje:`,
        message
      ].filter(Boolean).join("\n");

      submitBtn.disabled = true;
      window.location.href = buildMailto(subject, body);

      statusEl.classList.add("is-success");
      statusEl.textContent = "Abriendo tu cliente de correo… si no se abre, revisa tu configuración.";
      setTimeout(() => { submitBtn.disabled = false; }, 3000);
    });
  }

  /* -------- Scroll spy: resalta el enlace activo del menú -------- */
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const linkFor = (id) => navLinks.find((a) => a.getAttribute("href") === `#${id}`);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const link = linkFor(entry.target.id);
        if (!link) return;
        navLinks.forEach((a) => a.classList.remove("is-active"));
        link.classList.add("is-active");
      });
    }, {
      rootMargin: "-45% 0px -50% 0px",
      threshold: 0
    });

    sections.forEach((sec) => observer.observe(sec));
  }
})();
