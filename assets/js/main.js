/* ============================================================
   Iglesia De Cristo Gazcue — main.js
   Interacciones de UI: nav móvil, formularios (validación
   cliente; envío vía Netlify Forms) y scroll spy.
   Traducciones ES/EN viven en i18n.js.
   ============================================================ */

(function () {
  "use strict";

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_RE = /^\+?[0-9 ()\-]{7,20}$/;

  // Caps duros de longitud: previenen abusos aunque se manipule el atributo
  // maxlength desde DevTools.
  const MAX = {
    name: 80,
    email: 120,
    phone: 20,
    message: 1000,
    question: 1000
  };

  const setInvalid = (input, isInvalid) => {
    if (isInvalid) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  };

  // Honeypot: si el campo trampa fue llenado, asumimos bot.
  const isBot = (form) => {
    const hp = form.querySelector('input[name="website"]');
    return hp && hp.value !== "";
  };

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

  /* -------- Formulario principal de contacto (Netlify Forms) --------
     La validación corre en cliente; si pasa, dejamos que el browser haga
     POST nativo a Netlify (acción /gracias.html). Si es bot (honeypot)
     o falla validación, hacemos preventDefault y mostramos mensaje. */
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    const nameInput = contactForm.querySelector("#c-name");
    const emailInput = contactForm.querySelector("#c-email");
    const messageInput = contactForm.querySelector("#c-message");
    const statusEl = document.getElementById("form-status");
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener("submit", (e) => {
      if (submitBtn.disabled) { e.preventDefault(); return; }

      if (isBot(contactForm)) {
        e.preventDefault();
        statusEl.className = "form-status is-success";
        statusEl.textContent = "Gracias, recibimos tu mensaje.";
        return;
      }

      statusEl.className = "form-status";
      statusEl.textContent = "";

      const name = nameInput.value.trim().slice(0, MAX.name);
      const email = emailInput.value.trim().slice(0, MAX.email);
      const message = messageInput.value.trim().slice(0, MAX.message);

      const errors = [];

      const isNameOk = name.length >= 2 && name.length <= MAX.name;
      setInvalid(nameInput, !isNameOk);
      if (!isNameOk) errors.push("nombre");

      const isEmailOk = email.length <= MAX.email && EMAIL_RE.test(email);
      setInvalid(emailInput, !isEmailOk);
      if (!isEmailOk) errors.push("correo");

      const isMessageOk = message.length >= 5 && message.length <= MAX.message;
      setInvalid(messageInput, !isMessageOk);
      if (!isMessageOk) errors.push("mensaje");

      if (errors.length) {
        e.preventDefault();
        statusEl.classList.add("is-error");
        statusEl.textContent = `Revisa estos campos: ${errors.join(", ")}.`;
        return;
      }

      // Validación OK → Netlify procesa el POST y redirige a /gracias.html.
      submitBtn.disabled = true;
    });
  }

  /* -------- Formulario de petición de oración (Netlify Forms) -------- */
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
      if (submitBtn.disabled) { e.preventDefault(); return; }

      if (isBot(prayerForm)) {
        e.preventDefault();
        statusEl.className = "form-status is-success";
        statusEl.textContent = "Gracias, recibimos tu petición.";
        return;
      }

      statusEl.className = "form-status";
      statusEl.textContent = "";

      const rawName = (nameInput.value || "").trim().slice(0, PRAYER_MAX.name);
      const request = (requestInput.value || "").trim().slice(0, PRAYER_MAX.request);

      const errors = [];

      const isRequestOk = request.length >= 5 && request.length <= PRAYER_MAX.request;
      setInvalid(requestInput, !isRequestOk);
      if (!isRequestOk) errors.push("petición");

      // El nombre es opcional; solo lo marcamos inválido si excede el cap.
      const isNameOk = rawName.length <= PRAYER_MAX.name;
      setInvalid(nameInput, !isNameOk);
      if (!isNameOk) errors.push("nombre");

      if (errors.length) {
        e.preventDefault();
        statusEl.classList.add("is-error");
        statusEl.textContent = `Revisa estos campos: ${errors.join(", ")}.`;
        return;
      }

      submitBtn.disabled = true;
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
