/* ============================================================
   Iglesia De Cristo Gazcue — i18n.js
   Traducciones ES/EN con toggle persistente (localStorage).
   ============================================================ */

(function () {
  "use strict";

  const STORAGE_KEY = "idcg_lang";
  const DEFAULT_LANG = "es";

  const translations = {
    es: {
      "a11y.skip": "Saltar al contenido",

      "nav.home": "Inicio",
      "nav.about": "Nosotros",
      "nav.ministries": "Ministerios",
      "nav.content": "Contenido",
      "nav.faq": "Preguntas",
      "nav.schedule": "Horarios",
      "nav.contact": "Contacto",

      "hero.eyebrow": "Bienvenidos",
      "hero.title": "Iglesia De Cristo Gazcue",
      "hero.cta_zoom": "Únete al culto por Zoom",
      "hero.cta_schedule": "Ver horarios",
      "hero.next": "Próximo culto · Domingo 9:00 AM",

      "schedule.eyebrow": "Horarios",
      "schedule.title": "Nuestros cultos",
      "schedule.lead": "Te esperamos presencial o conéctate con nosotros desde cualquier lugar por Zoom.",
      "schedule.sunday.day": "Domingo",
      "schedule.sunday.type": "Culto general · Híbrido",
      "schedule.join_zoom": "Entrar al Zoom",
      "schedule.wednesday.day": "Miércoles",
      "schedule.wednesday.type": "Estudio bíblico",
      "schedule.more_info": "Más información",

      "about.eyebrow": "Quiénes somos",
      "about.title": "Una familia en Cristo",
      "about.mission.title": "Misión",
      "about.mission.text": "Proclamar el evangelio de Cristo y formar discípulos comprometidos con Su palabra. (Contenido pendiente)",
      "about.vision.title": "Visión",
      "about.vision.text": "Ser una comunidad que transforma vidas y refleja el amor de Cristo en Gazcue y más allá. (Contenido pendiente)",
      "about.history.title": "Historia",
      "about.history.text": "Nuestra historia como congregación en el corazón de Santo Domingo. (Contenido pendiente)",

      "ministries.eyebrow": "Ministerios",
      "ministries.title": "Encuentra tu lugar",
      "ministries.lead": "Espacios para crecer, servir y conectar con otros según tu etapa de vida.",
      "ministries.youth.title": "Jóvenes",
      "ministries.youth.text": "Una comunidad vibrante para la nueva generación.",
      "ministries.adults.title": "Adultos",
      "ministries.adults.text": "Discipulado, familia y crecimiento espiritual.",
      "ministries.more.title": "Más ministerios",
      "ministries.more.text": "Próximamente: niños, matrimonios, alabanza y más.",
      "ministries.see_more": "Conocer más →",

      "content.eyebrow": "Contenido",
      "content.title": "Reflexiones, podcast y más",
      "content.tabs.reflections": "Reflexiones",
      "content.tabs.podcast": "Podcast",
      "content.tabs.videos": "Videos",
      "content.reflections.text": "Reflexiones cortas desde nuestras redes sociales.",
      "content.podcast.text": "Nuestro podcast está disponible en YouTube.",
      "content.podcast.cta": "Abrir en YouTube",
      "content.videos.text": "Explora nuestros videos más recientes.",
      "content.videos.cta": "Ver en YouTube",

      "faq.eyebrow": "Preguntas",
      "faq.title": "¿Tienes una pregunta?",
      "faq.lead": "Estamos aquí para acompañarte. Pregúntanos lo que quieras sobre la fe, la Biblia o nuestra iglesia y te responderemos.",
      "faq.examples_label": "Algunas preguntas frecuentes:",
      "faq.q1": "¿Quién fue Jesús?",
      "faq.q2": "¿Por qué seguirlo?",
      "faq.q3": "¿Cómo ser cristiano?",
      "faq.name": "Tu nombre",
      "faq.question": "Tu pregunta",
      "faq.contact_method": "¿Cómo prefieres que te respondamos?",
      "faq.method_email": "Correo electrónico",
      "faq.method_whatsapp": "WhatsApp",
      "faq.email": "Tu correo electrónico",
      "faq.phone": "Tu WhatsApp (con código de país)",
      "faq.send": "Enviar pregunta",
      "faq.note": "Tus datos solo se usarán para responder tu pregunta. Sin spam, sin compartir.",

      "leaders.eyebrow": "Equipo",
      "leaders.title": "Nuestros líderes",
      "leaders.lead": "Conoce al equipo pastoral y de liderazgo que sirve a nuestra congregación.",
      "leaders.pastor.role": "Pastor",
      "leaders.youth.role": "Líder de Jóvenes",
      "leaders.more.title": "Más líderes",
      "leaders.more.role": "Próximamente",

      "location.eyebrow": "Ubicación",
      "location.title": "Visítanos",
      "location.country": "República Dominicana",
      "location.directions": "Cómo llegar",

      "contact.eyebrow": "Contacto",
      "contact.title": "¿Quieres conocernos?",
      "contact.lead": "Solo deja un mensaje y te responderemos.",
      "contact.name": "Nombre",
      "contact.email": "Correo electrónico",
      "contact.whatsapp": "WhatsApp",
      "contact.optional": "(opcional)",
      "contact.interest": "Interés",
      "contact.interests.choose": "Selecciona una opción",
      "contact.interests.visit": "Quiero visitar",
      "contact.interests.member": "Ser miembro",
      "contact.interests.prayer": "Petición de oración",
      "contact.interests.other": "Otro",
      "contact.message": "Mensaje",
      "contact.send": "Enviar mensaje",
      "contact.note": "Tus datos se usarán solo para responder tu solicitud.",

      "footer.tagline": "Comunidad cristiana no denominacional",
      "footer.nav_title": "Navegación",
      "footer.social_title": "Síguenos"
    },

    en: {
      "a11y.skip": "Skip to content",

      "nav.home": "Home",
      "nav.about": "About",
      "nav.ministries": "Ministries",
      "nav.content": "Content",
      "nav.faq": "Questions",
      "nav.schedule": "Schedule",
      "nav.contact": "Contact",

      "hero.eyebrow": "Welcome",
      "hero.title": "Iglesia De Cristo Gazcue",
      "hero.cta_zoom": "Join our service on Zoom",
      "hero.cta_schedule": "View schedule",
      "hero.next": "Next service · Sunday 9:00 AM",

      "schedule.eyebrow": "Schedule",
      "schedule.title": "Our services",
      "schedule.lead": "Join us in person or connect with us from anywhere via Zoom.",
      "schedule.sunday.day": "Sunday",
      "schedule.sunday.type": "General service · Hybrid",
      "schedule.join_zoom": "Join Zoom",
      "schedule.wednesday.day": "Wednesday",
      "schedule.wednesday.type": "Bible study",
      "schedule.more_info": "More info",

      "about.eyebrow": "About us",
      "about.title": "A family in Christ",
      "about.mission.title": "Mission",
      "about.mission.text": "To proclaim the gospel of Christ and form disciples committed to His word. (Pending content)",
      "about.vision.title": "Vision",
      "about.vision.text": "To be a community that transforms lives and reflects Christ's love in Gazcue and beyond. (Pending content)",
      "about.history.title": "History",
      "about.history.text": "Our history as a congregation in the heart of Santo Domingo. (Pending content)",

      "ministries.eyebrow": "Ministries",
      "ministries.title": "Find your place",
      "ministries.lead": "Spaces to grow, serve and connect with others according to your stage of life.",
      "ministries.youth.title": "Youth",
      "ministries.youth.text": "A vibrant community for the new generation.",
      "ministries.adults.title": "Adults",
      "ministries.adults.text": "Discipleship, family and spiritual growth.",
      "ministries.more.title": "More ministries",
      "ministries.more.text": "Coming soon: children, marriages, worship and more.",
      "ministries.see_more": "Learn more →",

      "content.eyebrow": "Content",
      "content.title": "Reflections, podcast and more",
      "content.tabs.reflections": "Reflections",
      "content.tabs.podcast": "Podcast",
      "content.tabs.videos": "Videos",
      "content.reflections.text": "Short reflections from our social media.",
      "content.podcast.text": "Our podcast is available on YouTube.",
      "content.podcast.cta": "Open on YouTube",
      "content.videos.text": "Browse our latest videos.",
      "content.videos.cta": "Watch on YouTube",

      "faq.eyebrow": "Questions",
      "faq.title": "Have a question?",
      "faq.lead": "We're here to walk with you. Ask us anything about faith, the Bible, or our church and we'll get back to you.",
      "faq.examples_label": "Some common questions:",
      "faq.q1": "Who was Jesus?",
      "faq.q2": "Why follow Him?",
      "faq.q3": "How to become a Christian?",
      "faq.name": "Your name",
      "faq.question": "Your question",
      "faq.contact_method": "How would you like us to respond?",
      "faq.method_email": "Email",
      "faq.method_whatsapp": "WhatsApp",
      "faq.email": "Your email",
      "faq.phone": "Your WhatsApp (with country code)",
      "faq.send": "Send question",
      "faq.note": "Your data will only be used to respond. No spam, no sharing.",

      "leaders.eyebrow": "Team",
      "leaders.title": "Our leaders",
      "leaders.lead": "Meet the pastoral and leadership team serving our congregation.",
      "leaders.pastor.role": "Pastor",
      "leaders.youth.role": "Youth Leader",
      "leaders.more.title": "More leaders",
      "leaders.more.role": "Coming soon",

      "location.eyebrow": "Location",
      "location.title": "Visit us",
      "location.country": "Dominican Republic",
      "location.directions": "Get directions",

      "contact.eyebrow": "Contact",
      "contact.title": "Want to get to know us?",
      "contact.lead": "Just leave a message and we'll respond.",
      "contact.name": "Name",
      "contact.email": "Email",
      "contact.whatsapp": "WhatsApp",
      "contact.optional": "(optional)",
      "contact.interest": "Interest",
      "contact.interests.choose": "Select an option",
      "contact.interests.visit": "I want to visit",
      "contact.interests.member": "Become a member",
      "contact.interests.prayer": "Prayer request",
      "contact.interests.other": "Other",
      "contact.message": "Message",
      "contact.send": "Send message",
      "contact.note": "Your data will only be used to respond to your request.",

      "footer.tagline": "Non-denominational Christian community",
      "footer.nav_title": "Navigation",
      "footer.social_title": "Follow us"
    }
  };

  const getStoredLang = () => {
    try { return localStorage.getItem(STORAGE_KEY); }
    catch { return null; }
  };

  const storeLang = (lang) => {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* sin storage disponible */ }
  };

  const detectInitialLang = () => {
    const stored = getStoredLang();
    if (stored && translations[stored]) return stored;
    const browser = (navigator.language || "").slice(0, 2).toLowerCase();
    return translations[browser] ? browser : DEFAULT_LANG;
  };

  const applyTranslations = (lang) => {
    const dict = translations[lang];
    if (!dict) return;

    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      const value = dict[key];
      if (value !== undefined) el.textContent = value;
    });

    // Actualiza estado visual del toggle
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    document.dispatchEvent(new CustomEvent("i18n:change", { detail: { lang } }));
  };

  const setLang = (lang) => {
    if (!translations[lang]) return;
    storeLang(lang);
    applyTranslations(lang);
  };

  // Inicialización
  const init = () => {
    applyTranslations(detectInitialLang());
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expone una API mínima por si otros scripts la necesitan
  window.IDCGi18n = {
    get: () => document.documentElement.lang || DEFAULT_LANG,
    set: setLang,
    t: (key) => {
      const lang = document.documentElement.lang || DEFAULT_LANG;
      return (translations[lang] && translations[lang][key]) || key;
    }
  };
})();
