// Cerrajería Speed — diccionario canónico de eventos (ver 02_PLAN.md, Decisión B).
// Pendiente: conectar GA4/Meta Pixel cuando Jhon confirme cuenta (00_BRIEF.md §8.3).
// Por ahora, cada evento se empuja a window.dataLayer (compatible con GTM) y se
// registra en consola para poder verificarlo manualmente.

document.documentElement.classList.remove('no-js');

window.dataLayer = window.dataLayer || [];

function track(event, props) {
  var payload = Object.assign({ event: event }, props || {});
  window.dataLayer.push(payload);
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('[track]', payload);
  }
}

// view_hero — se dispara una sola vez cuando el hero entra en viewport.
(function () {
  var hero = document.getElementById('hero');
  if (!hero) return;
  var seen = false;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !seen) {
        seen = true;
        track('view_hero');
        io.disconnect();
      }
    });
  }, { threshold: 0.4 });
  io.observe(hero);
})();

// section_view — una vez por sección, con su id.
(function () {
  var sections = document.querySelectorAll('main section[id]');
  var seen = {};
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var id = entry.target.id;
      if (entry.isIntersecting && !seen[id]) {
        seen[id] = true;
        track('section_view', { id: id });
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(function (s) { io.observe(s); });
})();

// scroll_depth — 25/50/75/100, cada hito una sola vez.
(function () {
  var hitos = [25, 50, 75, 100];
  var disparados = {};
  function onScroll() {
    var alto = document.documentElement.scrollHeight - window.innerHeight;
    if (alto <= 0) return;
    var pct = Math.round((window.scrollY / alto) * 100);
    hitos.forEach(function (h) {
      if (pct >= h && !disparados[h]) {
        disparados[h] = true;
        track('scroll_depth', { pct: h });
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// reveal — aparición suave de títulos/tarjetas al entrar en viewport.
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(function (el) { io.observe(el); });
})();

// cta_click + whatsapp_click — todos los CTA abren WhatsApp (Decisión A: N/A backend).
(function () {
  document.querySelectorAll('[data-cta]').forEach(function (el) {
    el.addEventListener('click', function () {
      var ctx = el.getAttribute('data-ctx') || 'desconocido';
      track('cta_click', { ctx: ctx });
      track('whatsapp_click', { ctx: ctx });
    });
  });
})();
