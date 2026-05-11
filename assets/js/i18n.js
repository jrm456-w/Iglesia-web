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
      "nav.reading": "Lectura",
      "nav.announcements": "Anuncios",
      "nav.content": "Contenido",
      "nav.prayer": "Oración",
      "nav.faq": "Preguntas",
      "nav.schedule": "Horarios",
      "nav.contact": "Contacto",

      "hero.eyebrow": "Bienvenidos",
      "hero.title": "Iglesia De Cristo Gazcue",
      "hero.subtitle": "Ven a la Iglesia de Cristo en Gazcue, aquí hay un espacio para ti.",
      "hero.cta_zoom": "Únete al culto por Zoom",
      "hero.cta_schedule": "Ver horarios",
      "hero.next": "Próximo culto · Domingo 9:00 AM",

      "reading.eyebrow": "Lectura",
      "reading.title": "Lectura de la semana",
      "reading.loading": "Cargando…",

      "announcements.eyebrow": "Anuncios",
      "announcements.title": "Anuncios y eventos",
      "announcements.loading": "Cargando…",

      "prayer.eyebrow": "Oración",
      "prayer.title": "Solicitar oración",
      "prayer.lead": "Comparte tu petición con nosotros. Si lo prefieres, puedes mantenerla anónima.",
      "prayer.name": "Tu nombre",
      "prayer.optional": "(opcional)",
      "prayer.request": "Tu petición",
      "prayer.anonymous": "Prefiero mantenerlo anónimo",
      "prayer.send": "Enviar petición",
      "prayer.note": "Tu petición se enviará al equipo pastoral. La trataremos con confidencialidad.",

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
      "about.mission.text": "Teniendo la Biblia como fuente fundamental de enseñanza, estamos para agradar a Dios, predicar a Cristo crucificado y hacer discípulos.",
      "about.identity.title": "Identidad",
      "about.identity.text": "Somos una congregación no denominacional, parte de las Iglesias de Cristo en la República Dominicana. Buscamos hablar donde la Biblia habla y callar donde ella calla, viviendo como una iglesia familiar y participativa.",
      "about.history.title": "Historia",
      "about.history.text": "Iniciamos en 1983 con los hermanos Harold Paden, Alan McAfee y los esposos John y Dulce Cloward. Tras congregarnos en distintos lugares de Santo Domingo, el 20 de agosto de 1997 inauguramos nuestro edificio actual en la calle Caonabo #6 de Gazcue.",

      "ministries.eyebrow": "Ministerios",
      "ministries.title": "Encuentra tu lugar",
      "ministries.lead": "Espacios para crecer, servir y conectar con otros según tu etapa de vida.",
      "ministries.youth.title": "Ministerio Juvenil",
      "ministries.youth.text": "Jóvenes de 12 a 24 años que se reúnen los domingos para estudios, crecimiento y actividades de integración.",
      "ministries.youth.leader": "Líder: Paulo Cruz",
      "ministries.ladies.title": "Ministerio de Damas",
      "ministries.ladies.text": "Hermandad caracterizada por el amor, la solidaridad y la devoción a Dios, con estudios bíblicos dominicales.",
      "ministries.men.title": "Ministerio de Varones",
      "ministries.men.text": "Los caballeros se preparan para servir en el culto dominical, con estudios semanales y actividades el primer sábado de cada mes.",
      "ministries.men.leader": "Líder: Rashad Gold",
      "ministries.kids.title": "Niños, Niñas y Adolescentes",
      "ministries.kids.text": "Equipo de profesionales de la educación infantil y la conducta que acompaña la formación bíblica de los más pequeños.",
      "ministries.kids.leader": "Líder: Domingo Amézquita",
      "ministries.family.title": "Familia y Matrimonio",
      "ministries.family.text": "Soporte espiritual, emocional y de acompañamiento para matrimonios, familias y núcleos familiares de la congregación.",
      "ministries.family.leader": "Líder: Confesor Sánchez",
      "ministries.prayer.title": "Ministerios de Oración",
      "ministries.prayer.text": "Espacios especiales dedicados a la intercesión y la oración congregacional.",
      "ministries.benevolence.title": "Benevolencia",
      "ministries.benevolence.text": "Atiende con sensibilidad e imparcialidad las necesidades materiales de la congregación y la comunidad.",
      "ministries.followup.title": "Seguimiento y Apoyo",
      "ministries.followup.text": "Consejería pastoral, familiar, discipular y emocional para quien la necesite.",
      "ministries.pcf.title": "Pequeñas Comunidades de Fe",
      "ministries.pcf.text": "Grupos que se reúnen en distintos puntos del Gran Santo Domingo: KO1NON1A, La Roka Fuerte, Soldados de la Palabra, L1bres y Ps1cópatas del Reino.",

      "content.eyebrow": "Videos",
      "content.title": "Mira nuestros videos",
      "content.lead": "Encuentra prédicas, reflexiones y actividades en nuestro canal de YouTube.",
      "content.cta": "Ver en YouTube",

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
      "leaders.lead": "Evangelistas y diáconos que sirven a la congregación bajo la dirección del Espíritu Santo.",
      "leaders.daniel.role": "Predicador",
      "leaders.daniel.area": "Pastoreo, predicación y discipulado",
      "leaders.paulo.role": "Evangelista",
      "leaders.paulo.area": "Líder del Ministerio Juvenil",
      "leaders.domingo.role": "Evangelista",
      "leaders.domingo.area": "Ministerio de Niños y Adolescentes",
      "leaders.wilton.role": "Evangelista",
      "leaders.wilton.area": "Pequeños grupos y visitas",
      "leaders.felipe.role": "Diácono",
      "leaders.felipe.area": "Mantenimiento del edificio",
      "leaders.rashad.role": "Diácono",
      "leaders.rashad.area": "Ministerio de Varones y predicación",
      "leaders.confesor.role": "Diácono",
      "leaders.confesor.area": "Alabanza, Familia y Diseño Gráfico",
      "leaders.jesus.role": "Diácono Ad Vitam",
      "leaders.jesus.area": "Asesor · Retiros y actividades",
      "leaders.leopoldo.role": "Diácono Ad Vitam",
      "leaders.leopoldo.area": "Hospitalidad y orden congregacional",

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
      "nav.reading": "Reading",
      "nav.announcements": "Announcements",
      "nav.content": "Content",
      "nav.prayer": "Prayer",
      "nav.faq": "Questions",
      "nav.schedule": "Schedule",
      "nav.contact": "Contact",

      "hero.eyebrow": "Welcome",
      "hero.title": "Iglesia De Cristo Gazcue",
      "hero.subtitle": "Come to Iglesia de Cristo en Gazcue — there is a place for you here.",
      "hero.cta_zoom": "Join our service on Zoom",
      "hero.cta_schedule": "View schedule",
      "hero.next": "Next service · Sunday 9:00 AM",

      "reading.eyebrow": "Reading",
      "reading.title": "Reading of the week",
      "reading.loading": "Loading…",

      "announcements.eyebrow": "Announcements",
      "announcements.title": "Announcements and events",
      "announcements.loading": "Loading…",

      "prayer.eyebrow": "Prayer",
      "prayer.title": "Request prayer",
      "prayer.lead": "Share your request with us. If you prefer, you can keep it anonymous.",
      "prayer.name": "Your name",
      "prayer.optional": "(optional)",
      "prayer.request": "Your request",
      "prayer.anonymous": "I prefer to remain anonymous",
      "prayer.send": "Send request",
      "prayer.note": "Your request will be shared with the pastoral team and treated confidentially.",

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
      "about.mission.text": "With the Bible as our foundational source of teaching, we exist to please God, preach Christ crucified, and make disciples.",
      "about.identity.title": "Identity",
      "about.identity.text": "We are a non-denominational congregation, part of the Churches of Christ in the Dominican Republic. We seek to speak where the Bible speaks and remain silent where it is silent, living as a participatory, family-oriented church.",
      "about.history.title": "History",
      "about.history.text": "We began in 1983 with brothers Harold Paden, Alan McAfee, and the Cloward family. After gathering in different places throughout Santo Domingo, on August 20, 1997 we inaugurated our current building on Calle Caonabo #6 in Gazcue.",

      "ministries.eyebrow": "Ministries",
      "ministries.title": "Find your place",
      "ministries.lead": "Spaces to grow, serve and connect with others according to your stage of life.",
      "ministries.youth.title": "Youth Ministry",
      "ministries.youth.text": "Young people ages 12–24 who meet every Sunday for Bible study, growth and fellowship activities.",
      "ministries.youth.leader": "Leader: Paulo Cruz",
      "ministries.ladies.title": "Women's Ministry",
      "ministries.ladies.text": "A sisterhood marked by love, solidarity and devotion to God, gathering for Bible study every Sunday.",
      "ministries.men.title": "Men's Ministry",
      "ministries.men.text": "Brothers preparing to serve in Sunday worship, with weekly studies and special activities on the first Saturday of each month.",
      "ministries.men.leader": "Leader: Rashad Gold",
      "ministries.kids.title": "Children & Teens",
      "ministries.kids.text": "A team of childhood education and behavior professionals who guide the biblical formation of our youngest members.",
      "ministries.kids.leader": "Leader: Domingo Amézquita",
      "ministries.family.title": "Family & Marriage",
      "ministries.family.text": "Spiritual, emotional and pastoral support for marriages, families and family circles in our congregation.",
      "ministries.family.leader": "Leader: Confesor Sánchez",
      "ministries.prayer.title": "Prayer Ministries",
      "ministries.prayer.text": "Special spaces dedicated to intercession and congregational prayer.",
      "ministries.benevolence.title": "Benevolence",
      "ministries.benevolence.text": "Attends with sensitivity and impartiality to the material needs of the congregation and the community.",
      "ministries.followup.title": "Follow-up & Support",
      "ministries.followup.text": "Pastoral, family, discipleship and emotional counseling for whoever needs it.",
      "ministries.pcf.title": "Small Faith Communities",
      "ministries.pcf.text": "Groups meeting throughout Greater Santo Domingo: KO1NON1A, La Roka Fuerte, Soldados de la Palabra, L1bres and Ps1cópatas del Reino.",

      "content.eyebrow": "Videos",
      "content.title": "Watch our videos",
      "content.lead": "Find sermons, reflections and church activities on our YouTube channel.",
      "content.cta": "Watch on YouTube",

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
      "leaders.lead": "Evangelists and deacons serving the congregation under the guidance of the Holy Spirit.",
      "leaders.daniel.role": "Preacher",
      "leaders.daniel.area": "Pastoral care, preaching and discipleship",
      "leaders.paulo.role": "Evangelist",
      "leaders.paulo.area": "Youth Ministry Leader",
      "leaders.domingo.role": "Evangelist",
      "leaders.domingo.area": "Children & Teens Ministry",
      "leaders.wilton.role": "Evangelist",
      "leaders.wilton.area": "Small groups and visitation",
      "leaders.felipe.role": "Deacon",
      "leaders.felipe.area": "Building maintenance",
      "leaders.rashad.role": "Deacon",
      "leaders.rashad.area": "Men's Ministry and preaching",
      "leaders.confesor.role": "Deacon",
      "leaders.confesor.area": "Worship, Family and Graphic Design",
      "leaders.jesus.role": "Deacon Ad Vitam",
      "leaders.jesus.area": "Advisor · Retreats and activities",
      "leaders.leopoldo.role": "Deacon Ad Vitam",
      "leaders.leopoldo.area": "Hospitality and congregational order",

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

  window.IDCGi18n = {
    get: () => document.documentElement.lang || DEFAULT_LANG,
    set: setLang,
    t: (key) => {
      const lang = document.documentElement.lang || DEFAULT_LANG;
      return (translations[lang] && translations[lang][key]) || key;
    }
  };
})();
