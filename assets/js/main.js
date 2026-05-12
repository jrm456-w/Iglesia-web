/* ============================================================
   Iglesia De Cristo Gazcue — main.js
   Interacciones de UI: nav móvil, tabs, formularios (FAQ y
   contacto), scroll spy y envío por mailto seguro.
   Traducciones ES/EN viven en i18n.js.
   ============================================================ */

(function () {
  "use strict";

  // Correo oficial de la Iglesia De Cristo Gazcue.
  const TARGET_EMAIL = "idcengazcue@gmail.com";

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_RE = /^\+?[0-9 ()\-]{7,20}$/;

  // Caps duros de longitud: previenen abusos aunque se manipule el atributo
  // maxlength desde DevTools.
  const MAX = {
    name: 80,
    email: 120,
    phone: 20,
    message: 1000,
    question: 1000,
    subject: 120,
    mailto: 8000
  };

  // Strip caracteres de control (0x00-0x1F + DEL).
  // Variante NO_LF preserva el line feed para mantener párrafos en el body.
  const CTRL_ALL = new RegExp("[\\u0000-\\u001F\\u007F]", "g");
  const CTRL_NO_LF = new RegExp("[\\u0000-\\u0009\\u000B-\\u001F\\u007F]", "g");

  const sanitizeHeader = (s) =>
    String(s).replace(CTRL_ALL, " ").replace(/\s+/g, " ").trim().slice(0, MAX.subject);

  const sanitizeBody = (s) =>
    String(s).replace(CTRL_NO_LF, "");

  const setInvalid = (input, isInvalid) => {
    if (isInvalid) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  };

  const buildMailto = (subject, body) => {
    const url = `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(sanitizeHeader(subject))}&body=${encodeURIComponent(sanitizeBody(body))}`;
    return url.length > MAX.mailto ? url.slice(0, MAX.mailto) : url;
  };

  // Honeypot: si el campo trampa fue llenado, asumimos bot.
  const isBot = (form) => {
    const hp = form.querySelector('input[name="website"]');
    return hp && hp.value !== "";
  };

  /* -------- Reemplazo del logo si la imagen no carga -------- */
  const logo = document.getElementById("brand-logo");
  if (logo) {
    logo.addEventListener("error", () => logo.classList.add("is-missing"), { once: true });
  }

  /* -------- Año dinámico en el footer -------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------- Toggle del menú móvil -------- */
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");

  if (navToggle && siteNav) {
    const closeNav = () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Abrir menú");
      document.body.style.overflow = "";
    };

    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Cerrar al clicar cualquier enlace del nav.
    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    // Cerrar al clicar fuera del nav (defensivo, mejor UX en móvil).
    document.addEventListener("click", (e) => {
      if (!siteNav.classList.contains("is-open")) return;
      const insideNav = siteNav.contains(e.target);
      const insideToggle = navToggle.contains(e.target);
      if (!insideNav && !insideToggle) closeNav();
    });

    // Cerrar con Escape.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && siteNav.classList.contains("is-open")) closeNav();
    });
  }

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
        const text = (chip.dataset.question || chip.textContent).trim().slice(0, MAX.question);
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

      // Honeypot: si bot, fingimos éxito sin enviar nada.
      if (isBot(faqForm)) {
        statusEl.className = "form-status is-success";
        statusEl.textContent = "Gracias, recibimos tu mensaje.";
        return;
      }

      statusEl.className = "form-status";
      statusEl.textContent = "";

      const data = new FormData(faqForm);
      const name = (data.get("name") || "").toString().trim().slice(0, MAX.name);
      const question = (data.get("question") || "").toString().trim().slice(0, MAX.question);
      const method = (data.get("contactMethod") || "email").toString();
      const contactValue = method === "email"
        ? (data.get("email") || "").toString().trim().slice(0, MAX.email)
        : (data.get("phone") || "").toString().trim().slice(0, MAX.phone);

      const errors = [];

      const isNameOk = name.length >= 2 && name.length <= MAX.name;
      setInvalid(nameInput, !isNameOk);
      if (!isNameOk) errors.push("nombre");

      const isQuestionOk = question.length >= 5 && question.length <= MAX.question;
      setInvalid(questionField, !isQuestionOk);
      if (!isQuestionOk) errors.push("pregunta");

      if (method === "email") {
        const emailOk = contactValue.length <= MAX.email && EMAIL_RE.test(contactValue);
        setInvalid(emailField, !emailOk);
        if (!emailOk) errors.push("correo");
      } else {
        const phoneOk = contactValue.length <= MAX.phone && PHONE_RE.test(contactValue);
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
    const whatsappInput = contactForm.querySelector("#c-whatsapp");   // puede no existir (form simplificado)
    const interestInput = contactForm.querySelector("#c-interest");   // puede no existir
    const messageInput = contactForm.querySelector("#c-message");
    const statusEl = document.getElementById("form-status");
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (submitBtn.disabled) return;

      if (isBot(contactForm)) {
        statusEl.className = "form-status is-success";
        statusEl.textContent = "Gracias, recibimos tu mensaje.";
        return;
      }

      statusEl.className = "form-status";
      statusEl.textContent = "";

      const name = nameInput.value.trim().slice(0, MAX.name);
      const email = emailInput.value.trim().slice(0, MAX.email);
      const whatsapp = whatsappInput ? whatsappInput.value.trim().slice(0, MAX.phone) : "";
      const interest = interestInput ? interestInput.value : "";
      const message = messageInput.value.trim().slice(0, MAX.message);

      const errors = [];

      const isNameOk = name.length >= 2 && name.length <= MAX.name;
      setInvalid(nameInput, !isNameOk);
      if (!isNameOk) errors.push("nombre");

      const isEmailOk = email.length <= MAX.email && EMAIL_RE.test(email);
      setInvalid(emailInput, !isEmailOk);
      if (!isEmailOk) errors.push("correo");

      if (whatsappInput) {
        const isWhatsappOk = !whatsapp || (whatsapp.length <= MAX.phone && PHONE_RE.test(whatsapp));
        setInvalid(whatsappInput, !isWhatsappOk);
        if (!isWhatsappOk) errors.push("WhatsApp");
      }

      if (interestInput) {
        const isInterestOk = Boolean(interest);
        setInvalid(interestInput, !isInterestOk);
        if (!isInterestOk) errors.push("interés");
      }

      const isMessageOk = message.length >= 5 && message.length <= MAX.message;
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
        interest ? `Interés: ${interestLabels[interest] || "Otro"}` : null,
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

  /* -------- Formulario de petición de oración -------- */
  const prayerForm = document.getElementById("prayer-form");

  if (prayerForm) {
    const PRAYER_MAX = { name: 60, request: 500 };

    const nameInput = prayerForm.querySelector("#p-name");
    const requestInput = prayerForm.querySelector("#p-request");
    const counter = prayerForm.querySelector("#p-count");
    const statusEl = document.getElementById("prayer-status");
    const submitBtn = prayerForm.querySelector('button[type="submit"]');

    // Trunca el valor al teclear si se intenta exceder PRAYER_MAX.request
    // (caso en que se manipule maxlength desde DevTools); así el contador
    // y el valor enviado siempre coinciden.
    const updateCounter = () => {
      if (requestInput.value.length > PRAYER_MAX.request) {
        requestInput.value = requestInput.value.slice(0, PRAYER_MAX.request);
      }
      counter.textContent = String(requestInput.value.length);
    };
    requestInput.addEventListener("input", updateCounter);
    updateCounter();

    prayerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (submitBtn.disabled) return;

      if (isBot(prayerForm)) {
        statusEl.className = "form-status is-success";
        statusEl.textContent = "Gracias, recibimos tu petición.";
        return;
      }

      statusEl.className = "form-status";
      statusEl.textContent = "";

      const data = new FormData(prayerForm);
      const rawName = (data.get("name") || "").toString().trim().slice(0, PRAYER_MAX.name);
      const request = (data.get("request") || "").toString().trim().slice(0, PRAYER_MAX.request);
      const anonymous = data.get("anonymous") === "on";

      const errors = [];

      const isRequestOk = request.length >= 5 && request.length <= PRAYER_MAX.request;
      setInvalid(requestInput, !isRequestOk);
      if (!isRequestOk) errors.push("petición");

      // El nombre es opcional; solo lo marcamos inválido si excede el cap.
      const isNameOk = rawName.length <= PRAYER_MAX.name;
      setInvalid(nameInput, !isNameOk);
      if (!isNameOk) errors.push("nombre");

      if (errors.length) {
        statusEl.classList.add("is-error");
        statusEl.textContent = `Revisa estos campos: ${errors.join(", ")}.`;
        return;
      }

      // Si pidió anonimato o no escribió nombre, no se incluye en el envío.
      const displayName = anonymous || !rawName ? "Anónimo" : rawName;

      const subject = `Petición de oración — ${displayName}`;
      const bodyLines = [`De: ${displayName}`, ``, `Petición:`, request];
      const body = bodyLines.join("\n");

      submitBtn.disabled = true;
      window.location.href = buildMailto(subject, body);

      statusEl.classList.add("is-success");
      statusEl.textContent = "Abriendo tu cliente de correo… si no se abre, revisa tu configuración.";
      setTimeout(() => { submitBtn.disabled = false; }, 3000);
    });
  }

  /* -------- Scroll spy: solo aplica en index.html (donde existe #horarios) -------- */
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  const isIndexPage = !!document.querySelector("#horarios");

  if (isIndexPage && sections.length && navLinks.length && "IntersectionObserver" in window) {
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
