/* ============================================================
   GameHub · app.js
   Роутер, рендеринг представлений, состояние, интерактив.
   Классический скрипт (без модулей) — работает и с file://.
   ============================================================ */
(function () {
  'use strict';

  /* ================= Утилиты ================= */
  var qs = function (s, root) { return (root || document).querySelector(s); };
  var qsa = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var hexA = function (hex, a) {
    var h = hex.replace('#', '');
    var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  };
  var plural = function (n, forms) {
    n = Math.abs(n) % 100; var n1 = n % 10;
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
  };
  var fmtDate = function (iso) {
    try { return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { return iso; }
  };
  var relTime = function (ts) {
    var d = Date.now() - ts, m = Math.floor(d / 60000);
    if (m < 1) return 'только что';
    if (m < 60) return m + ' мин назад';
    var h = Math.floor(m / 60);
    if (h < 24) return h + ' ' + plural(h, ['час', 'часа', 'часов']) + ' назад';
    var days = Math.floor(h / 24);
    if (days < 7) return days + ' ' + plural(days, ['день', 'дня', 'дней']) + ' назад';
    return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };
  var debounce = function (fn, ms) {
    var t; return function () { var a = arguments, self = this; clearTimeout(t); t = setTimeout(function () { fn.apply(self, a); }, ms); };
  };
  var uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = function () { return motionQuery.matches; };
  var smooth = function () { return reduced() ? 'auto' : 'smooth'; };

  /* ================= Иконки ================= */
  var IC = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>',
    bell: '<path d="M6 9.5a6 6 0 0 1 12 0c0 4.6 1.8 5.8 1.8 5.8H4.2S6 14.1 6 9.5"/><path d="M10.3 19.5a2 2 0 0 0 3.4 0"/>',
    heart: '<path d="M12 20.3S4 15.3 4 9.9A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.9c0 5.4-8 10.4-8 10.4Z"/>',
    gamepad: '<rect x="2.5" y="7.5" width="19" height="10" rx="5"/><path d="M7.5 11v3M6 12.5h3"/><circle cx="15.4" cy="11.4" r="1" fill="currentColor" stroke="none"/><circle cx="17.8" cy="13.6" r="1" fill="currentColor" stroke="none"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2V5Z"/><path d="M20 15H6a2 2 0 0 0-2 2"/>',
    star: '<path fill="currentColor" stroke="none" d="M12 2.6l2.8 5.9 6.3.8-4.6 4.4 1.2 6.3-5.7-3.1-5.7 3.1 1.2-6.3L2.9 9.3l6.3-.8L12 2.6Z"/>',
    play: '<path fill="currentColor" stroke="none" d="M8 5.5v13l11-6.5-11-6.5Z"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M4.5 12.5l5 5 10-11"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    chevD: '<path d="M6 9l6 6 6-6"/>',
    chevL: '<path d="M15 5l-7 7 7 7"/>',
    chevR: '<path d="M9 5l7 7-7 7"/>',
    arrowR: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    external: '<path d="M9 5H5v14h14v-4"/><path d="M14 4h6v6M20 4l-9 9"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    list: '<path d="M8.5 6h12M8.5 12h12M8.5 18h12"/><circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none"/>',
    compare: '<path d="M16 3l4 4-4 4M20 7H7M8 21l-4-4 4-4M4 17h13"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13"/><path d="M10 11v6M14 11v6"/>',
    dice: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8.2" cy="8.2" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.8" cy="8.2" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="8.2" cy="15.8" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.8" cy="15.8" r="1.1" fill="currentColor" stroke="none"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    fire: '<path d="M12 3s5 4.2 5 9a5 5 0 0 1-10 0c0-2 1-3.6 2.1-5.1.5 1.5 1.4 2.1 2.4 2.1C11 7 12 3 12 3Z"/>',
    sparkles: '<path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4Z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/><path d="M5 15.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6Z"/>',
    zap: '<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2Z"/>',
    d20: '<path d="M12 2l9 5.5v9L12 22l-9-5.5v-9L12 2Z"/><path d="M12 7.5l5 8.5H7l5-8.5Z"/>',
    flag: '<path d="M5 3v18"/><path d="M5 4h13l-2.5 4L18 12H5"/>',
    crosshair: '<circle cx="12" cy="12" r="7.5"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
    ghost: '<path d="M5 11a7 7 0 0 1 14 0v9l-2.3-2-2.4 2-2.3-2-2.3 2-2.4-2L5 20v-9Z"/><circle cx="9.5" cy="11" r="1.1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="11" r="1.1" fill="currentColor" stroke="none"/>',
    castle: '<path d="M6 21V8H4V4h3v2h3V4h4v2h3V4h3v4h-2v13H6Z"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/>',
    cpu: '<rect x="7" y="7" width="10" height="10" rx="2"/><rect x="10.5" y="10.5" width="3" height="3"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    trophy: '<path d="M8 4h8v6a4 4 0 0 1-8 0V4Z"/><path d="M8 5H4.5a3.5 3.5 0 0 0 3.6 4M16 5h3.5a3.5 3.5 0 0 1-3.6 4"/><path d="M12 14v4M8 21c0-2 1.6-3 4-3s4 1 4 3"/>',
    monitor: '<rect x="3" y="4.5" width="18" height="12.5" rx="2"/><path d="M12 17v3.5M8 20.5h8"/>',
    xbox: '<circle cx="12" cy="12" r="8.5"/><path d="M7 6.5c3 2 7 8 9 11M17 6.5c-3 2-7 8-9 11"/>',
    switch: '<rect x="3.5" y="4" width="7" height="16" rx="3"/><rect x="13.5" y="4" width="7" height="16" rx="3"/><circle cx="7" cy="9" r="1.3" fill="currentColor" stroke="none"/><circle cx="17" cy="15" r="1.3" fill="currentColor" stroke="none"/>',
    youtube: '<rect x="2.5" y="6" width="19" height="12.5" rx="4"/><path fill="currentColor" stroke="none" d="M10.5 9.5v5.5l5-2.75-5-2.75Z"/>',
    share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.9l7.6-3.8M8.2 13.1l7.6 3.8"/>',
    calendar: '<rect x="3.5" y="5.5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    tag: '<path d="M3.5 10.5v-6a1 1 0 0 1 1-1h6l10 10-7 7-10-10Z"/><circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" stroke="none"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 7.8h.01"/>',
    alert: '<path d="M12 3L2.5 20h19L12 3Z"/><path d="M12 9.5v4.5M12 16.8h.01"/>',
    checkCircle: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.5l2.8 2.8L16.5 9"/>',
    xCircle: '<circle cx="12" cy="12" r="8.5"/><path d="M9 9l6 6M15 9l-6 6"/>',
    undo: '<path d="M4 9h10a6 6 0 0 1 0 12h-3"/><path d="M4 9l4-4M4 9l4 4"/>',
    sliders: '<path d="M5 4v5M5 15v5M12 4v2M12 12v8M19 4v8M19 18v2"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="9" r="2"/><circle cx="19" cy="15" r="2"/>',
    palette: '<path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 1.5-2-.7-1.4.2-3 1.8-3H18a3.5 3.5 0 0 0 3-3.5C21 7 17 3 12 3Z"/><circle cx="7.5" cy="11" r="1.1" fill="currentColor" stroke="none"/><circle cx="10" cy="7.3" r="1.1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="7.3" r="1.1" fill="currentColor" stroke="none"/>',
    home: '<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
    crown: '<path d="M3.5 7.5l4.5 4L12 5l4 6.5 4.5-4-2 11h-13l-2-11Z"/><path d="M7.5 21h9"/>',
    medal: '<circle cx="12" cy="14.5" r="5"/><path d="M8.5 10L6 3h4l2 4.5L14 3h4l-2.5 7"/>',
    rocket: '<path d="M12 2.5c3.5 1.5 5.5 5 5.5 9L15 14H9l-2.5-2.5c0-4 2-7.5 5.5-9Z"/><circle cx="12" cy="9.5" r="1.8"/><path d="M9 14l-2.5 4L10 17M15 14l2.5 4L14 17M12 17.5v3.5"/>',
    skull: '<path d="M12 3a8 8 0 0 0-8 8c0 2.5 1.2 4.3 3 5.5V20h10v-3.5c1.8-1.2 3-3 3-5.5a8 8 0 0 0-8-8Z"/><circle cx="9" cy="11.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="11.5" r="1.5" fill="currentColor" stroke="none"/><path d="M10.5 20v-2M13.5 20v-2"/>',
    alien: '<path d="M12 3C7 3 4 6.5 4 10.5 4 15 8 19.5 12 21c4-1.5 8-6 8-10.5C20 6.5 17 3 12 3Z"/><path fill="currentColor" stroke="none" d="M7.5 10.5c1.5-.5 3 .5 3.5 2-1.5.5-3-.5-3.5-2ZM16.5 10.5c-1.5-.5-3 .5-3.5 2 1.5.5 3-.5 3.5-2Z"/>',
    cat: '<path d="M4 10a8 8 0 0 0 16 0l.5-6-4.5 2.5h-8L3.5 4 4 10Z"/><circle cx="9" cy="11" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.1" fill="currentColor" stroke="none"/><path d="M2.5 12h3M2.5 14.5l3-.5M21.5 12h-3M21.5 14.5l-3-.5"/>',
    sword: '<path d="M4 20l4-1L20 7l-3-3L5 16l-1 4Z"/><path d="M14.5 6.5l3 3M4 20l3-3"/>',
    gem: '<path d="M7 3h10l4 6-9 12L3 9l4-6Z"/><path d="M3 9h18M12 21L9 9l2-6M12 21l3-12-2-6"/>',
    chart: '<path d="M4 20h16"/><path d="M6.5 20v-6M11.5 20V9M16.5 20v-9"/>',
    zoom: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21M8 11h6M11 8v6"/>'
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[name] || IC.gamepad) + '</svg>';
  }

  /* ================= Данные ================= */
  var D = window.GHData, S = window.GHStorage;
  var GAMES = D.games, GENRES = D.GENRES, PLATFORMS = D.PLATFORMS, STATUSES = D.STATUSES, THEMES = D.THEMES;
  var byId = {}; GAMES.forEach(function (g) { byId[g.id] = g; });
  var genreById = {}; GENRES.forEach(function (g) { genreById[g.id] = g; });
  var statusById = {}; STATUSES.forEach(function (s) { statusById[s.id] = s; });
  var YEARS = GAMES.map(function (g) { return g.year; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return a - b; });
  var DEVS = GAMES.map(function (g) { return g.dev; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();

  var CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps/';
  function cover(g) { return CDN + g.app + '/header.jpg'; }
  function portrait(g) { return CDN + g.app + '/library_600x900.jpg'; }
  function heroArt(g) { return CDN + g.app + '/library_hero.jpg'; }
  function bgArt(g) { return CDN + g.app + '/page_bg_generated_v6b.jpg'; }
  function capsule(g) { return CDN + g.app + '/capsule_616x353.jpg'; }
  function mediaList(g) {
    return [
      { url: heroArt(g), label: 'Промо-арт' },
      { url: bgArt(g), label: 'Арт окружения' },
      { url: capsule(g), label: 'Капсульный арт' },
      { url: cover(g), label: 'Обложка' }
    ];
  }
  function ratingTier(r) { return r >= 4.5 ? 'high' : r >= 4 ? 'good' : r >= 3.5 ? 'mid' : 'low'; }
  function isNew(g) { return g.year >= 2023; }

  /* Аватары: генерируемые SVG */
  var AV_GLYPHS = ['gamepad', 'ghost', 'rocket', 'skull', 'alien', 'cat', 'zap', 'crown'];
  var AV_COLORS = [
    ['#8B5CF6', '#38BDF8'], ['#F43F5E', '#FB923C'], ['#2DD4BF', '#38BDF8'], ['#E879F9', '#8B5CF6'],
    ['#A3E635', '#2DD4BF'], ['#FBBF24', '#FB7185'], ['#38BDF8', '#4ADE80'], ['#FB923C', '#E879F9']
  ];
  function avatarSVG(i) {
    i = Math.max(0, Math.min(7, i | 0));
    var c = AV_COLORS[i];
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[1] + '"/></linearGradient></defs>' +
      '<rect width="96" height="96" rx="22" fill="url(#g)"/>' +
      '<circle cx="76" cy="18" r="30" fill="rgba(255,255,255,.14)"/>' +
      '<circle cx="48" cy="48" r="34" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="2"/>' +
      '<g transform="translate(24 24) scale(2)" color="#FFFFFF" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + IC[AV_GLYPHS[i]] + '</g></svg>';
  }
  function avatarURI(i) { return 'data:image/svg+xml;utf8,' + encodeURIComponent(avatarSVG(i)); }

  /* ================= Состояние и хранилище ================= */
  var favs = new Set((S.read('favorites', []) || []).filter(function (id) { return byId[id]; }));
  var libRaw = S.read('library', {}) || {};
  var lib = {};
  Object.keys(libRaw).forEach(function (id) {
    if (byId[id] && libRaw[id] && statusById[libRaw[id].status]) lib[id] = { status: libRaw[id].status, addedAt: libRaw[id].addedAt || Date.now() };
  });
  var profile = S.read('profile', null);
  var settings = S.read('settings', {}) || {};
  var recent = (S.read('recent', []) || []).filter(function (id) { return byId[id]; }).slice(0, 10);
  var notifs = (S.read('notifications', []) || []).slice(0, 30);
  var activity = (S.read('activity', []) || []).slice(0, 300);
  var compare = (S.read('compare', []) || []).filter(function (id) { return byId[id]; }).slice(0, 3);

  function saveFavs() { S.write('favorites', Array.from(favs)); }
  function saveLib() { S.write('library', lib); }
  function saveProfile() { S.write('profile', profile); }
  function saveSettings() { S.write('settings', settings); }
  function saveRecent() { S.write('recent', recent); }
  function saveNotifs() { S.write('notifications', notifs); }
  function saveActivity() { S.write('activity', activity); }
  function saveCompare() { S.write('compare', compare); }

  function seed() {
    if (!profile || !profile.createdAt) {
      profile = { name: 'Игрок', avatar: 0, createdAt: Date.now() };
      saveProfile();
      notifs = [
        { id: uid(), icon: 'sparkles', text: 'Добро пожаловать в GameHub! Добавляйте игры в избранное и библиотеку — всё сохранится в вашем браузере.', ts: Date.now(), read: false },
        { id: uid(), icon: 'zap', text: 'Совет: нажмите Ctrl+K, чтобы мгновенно найти любую игру.', ts: Date.now() - 60000, read: false },
        { id: uid(), icon: 'info', text: 'Оценки и индексы популярности в каталоге — демонстрационные данные.', ts: Date.now() - 120000, read: false }
      ];
      saveNotifs();
      logActivity('join');
    }
    if (!THEMES.some(function (t) { return t.id === settings.theme; })) settings.theme = 'violet';
    if (!profile.name) profile.name = 'Игрок';
    profile.avatar = Math.max(0, Math.min(7, profile.avatar | 0));
  }

  function logActivity(type) {
    activity.unshift({ t: type, ts: Date.now() });
    if (activity.length > 300) activity.length = 300;
    saveActivity();
  }
  function pushNotif(iconName, text) {
    notifs.unshift({ id: uid(), icon: iconName, text: text, ts: Date.now(), read: false });
    if (notifs.length > 30) notifs.length = 30;
    saveNotifs();
    syncBadges();
    var dd = qs('#notifDD');
    if (dd && dd.classList.contains('open')) renderNotifMenu();
  }

  var state = {
    route: { name: 'home', params: {} },
    catalog: {
      q: '', genres: new Set(), platforms: new Set(), yearMin: null, yearMax: null,
      rating: 0, dev: '', sort: settings.sort || 'popularity', view: settings.view || 'grid'
    },
    libTab: 'all', libQuery: '',
    heroIndex: 0, heroTimer: null, heroWrap: null,
    io: null, modals: [], confirmResolve: null,
    palette: null, lb: null, profileDraft: null
  };
  var SORTS = [
    { id: 'popularity', label: 'По популярности', icon: 'fire' },
    { id: 'rating', label: 'По рейтингу', icon: 'star' },
    { id: 'title', label: 'По названию', icon: 'tag' },
    { id: 'year', label: 'По году выпуска', icon: 'calendar' },
    { id: 'new', label: 'Сначала новые', icon: 'sparkles' },
    { id: 'old', label: 'Сначала старые', icon: 'clock' }
  ];
  function sortLabel(id) { var s = SORTS.find(function (x) { return x.id === id; }); return s ? s.label : SORTS[0].label; }

  /* ================= Тосты ================= */
  var TOAST_IC = { success: 'checkCircle', info: 'info', warn: 'alert', error: 'xCircle' };
  function toast(msg, opts) {
    opts = opts || {};
    var type = opts.type || 'success';
    var duration = opts.duration || 4200;
    var box = qs('#toasts'); if (!box) return;
    while (box.children.length >= 4) dismissToast(box.lastElementChild, true);
    var el = document.createElement('div');
    el.className = 'toast t-' + type;
    el.innerHTML =
      '<span class="toast-ic">' + icon(TOAST_IC[type]) + '</span>' +
      '<div class="toast-body">' + esc(msg) +
      (opts.action ? '<br><button class="toast-act" data-action="toast-act">' + esc(opts.action.label) + '</button>' : '') +
      '</div><button class="toast-x" data-action="toast-close" aria-label="Закрыть">' + icon('x') + '</button>' +
      '<i class="toast-bar" style="animation-duration:' + duration + 'ms"></i>';
    el._fn = opts.action ? opts.action.fn : null;
    el._remain = duration; el._start = Date.now();
    el._timer = setTimeout(function () { dismissToast(el); }, duration);
    el.addEventListener('mouseenter', function () {
      clearTimeout(el._timer); el._remain -= Date.now() - el._start; el.classList.add('paused');
    });
    el.addEventListener('mouseleave', function () {
      el._start = Date.now(); el.classList.remove('paused');
      el._timer = setTimeout(function () { dismissToast(el); }, Math.max(400, el._remain));
    });
    box.prepend(el);
  }
  function dismissToast(el, instant) {
    if (!el || el._gone) return;
    el._gone = true; clearTimeout(el._timer);
    if (instant) { el.remove(); return; }
    el.classList.add('out');
    setTimeout(function () { el.remove(); }, 300);
  }

  /* ================= Модальные окна ================= */
  var lockCount = 0, scrollComp = 0;
  function lockScroll() {
    lockCount++;
    if (lockCount === 1) {
      if (!(window.CSS && CSS.supports && CSS.supports('scrollbar-gutter', 'stable'))) {
        scrollComp = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = scrollComp + 'px';
        var h = qs('#header'); if (h) h.style.paddingRight = scrollComp + 'px';
      }
      document.documentElement.classList.add('locked');
    }
  }
  function unlockScroll() {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.documentElement.classList.remove('locked');
      document.body.style.paddingRight = '';
      var h = qs('#header'); if (h) h.style.paddingRight = '';
    }
  }
  function openModal(html, opts) {
    opts = opts || {};
    var root = qs('#modalRoot');
    var layer = document.createElement('div');
    layer.className = 'modal-layer ' + (opts.cls || '');
    layer.style.zIndex = 200 + state.modals.length * 10;
    layer.innerHTML = '<div class="modal-backdrop" data-action="modal-backdrop"></div><div class="modal-panel" role="dialog" aria-modal="true">' + html + '</div>';
    root.appendChild(layer);
    var m = { el: layer, kind: opts.kind || '', onClose: opts.onClose, dismissable: opts.dismissable !== false, focus: document.activeElement, timer: null };
    state.modals.push(m);
    lockScroll();
    requestAnimationFrame(function () { requestAnimationFrame(function () { layer.classList.add('in'); }); });
    var focusEl = qs('[autofocus]', layer) || qs('button, input, a, select', layer);
    if (focusEl) setTimeout(function () { try { focusEl.focus({ preventScroll: true }); } catch (e) { focusEl.focus(); } }, 60);
    return m;
  }
  function closeModal(m) {
    m = m || state.modals[state.modals.length - 1];
    if (!m || m._closing) return;
    m._closing = true;
    var i = state.modals.indexOf(m);
    if (i > -1) state.modals.splice(i, 1);
    if (m.timer) clearTimeout(m.timer);
    if (m.onClose) try { m.onClose(); } catch (e) { /* noop */ }
    m.el.classList.remove('in'); m.el.classList.add('out');
    setTimeout(function () { m.el.remove(); }, 240);
    unlockScroll();
    if (m.focus && document.contains(m.focus)) { try { m.focus.focus({ preventScroll: true }); } catch (e) { /* noop */ } }
  }
  function closeAllModals() {
    while (state.modals.length) closeModal(state.modals[state.modals.length - 1]);
  }
  function topModal() { return state.modals[state.modals.length - 1] || null; }

  function confirmDialog(opts) {
    return new Promise(function (resolve) {
      state.confirmResolve = resolve;
      var m = openModal(
        '<div class="confirm-ic">' + icon(opts.icon || 'alert') + '</div>' +
        '<h3 class="modal-title">' + esc(opts.title) + '</h3>' +
        '<p class="confirm-text">' + esc(opts.text) + '</p>' +
        '<div class="confirm-actions">' +
        '<button class="btn ghost" data-action="confirm-cancel" autofocus>' + esc(opts.cancel || 'Отмена') + '</button>' +
        '<button class="btn ' + (opts.danger === false ? 'primary' : 'danger') + '" data-action="confirm-ok">' + esc(opts.ok || 'Удалить') + '</button></div>',
        { cls: 'modal-confirm', kind: 'confirm', onClose: function () { if (state.confirmResolve) { state.confirmResolve(false); state.confirmResolve = null; } } }
      );
      m._confirm = true;
    });
  }
  function resolveConfirm(val) {
    var r = state.confirmResolve; state.confirmResolve = null;
    var m = topModal(); if (m && m._confirm) closeModal(m);
    if (r) r(val);
  }

  /* ================= Партиалы ================= */
  function imgTag(url, alt, cls, opts) {
    opts = opts || {};
    var g = opts.game;
    return '<img src="' + url + '" alt="' + esc(alt) + '" class="' + (cls || '') + '" ' +
      (opts.eager ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async" ' +
      (g ? 'data-fb-title="' + esc(g.title) + '" data-fb-genre="' + esc(g.genres[0]) + '" ' : '') +
      (opts.fallbackSrc ? 'data-fallback-src="' + opts.fallbackSrc + '" ' : '') + '>';
  }
  function coverBlock(g, cls, opts) {
    opts = opts || {};
    return '<span class="img-wrap ' + (cls || '') + '">' +
      imgTag(opts.src || cover(g), g.title, opts.imgCls || 'g-img', { game: g, eager: opts.eager, fallbackSrc: opts.fallbackSrc }) + '</span>';
  }
  function starsHTML(r) {
    var row = ''; for (var i = 0; i < 5; i++) row += icon('star');
    return '<span class="stars" title="Оценка ' + r.toFixed(1) + ' из 5 (демо)"><span class="s-row">' + row + '</span>' +
      '<span class="s-fill" style="width:' + (r / 5 * 100) + '%"><span class="s-row">' + row + '</span></span></span>';
  }
  function ratingPill(g) {
    return '<span class="rating-pill t-' + ratingTier(g.rating) + '" title="Демо-оценка сообщества GameHub">' + icon('star') + g.rating.toFixed(1) + '</span>';
  }
  function genreChip(id, linked) {
    var m = genreById[id]; if (!m) return '';
    var style = '--gc:' + m.color + ';--gcs:' + hexA(m.color, .12) + ';--gcb:' + hexA(m.color, .35);
    var inner = '<i class="dot"></i>' + esc(id);
    return linked
      ? '<a class="g-chip" style="' + style + '" href="#/catalog?genre=' + encodeURIComponent(id) + '">' + inner + '</a>'
      : '<span class="g-chip" style="' + style + '">' + inner + '</span>';
  }
  function genreChips(g, max, linked) {
    return g.genres.slice(0, max || 3).map(function (id) { return genreChip(id, linked); }).join('');
  }
  function platformIcons(g) {
    return '<span class="g-plats">' + g.platforms.map(function (p) {
      var m = PLATFORMS.find(function (x) { return x.id === p; });
      return m ? '<span class="plat-ic" title="' + esc(m.label) + '">' + icon(m.icon) + '</span>' : '';
    }).join('') + '</span>';
  }
  function ageBadge(g) {
    var cls = g.age === '18+' ? 'a18' : g.age === '16+' ? 'a16' : '';
    return '<span class="age-badge ' + cls + '" title="Возрастная категория">' + esc(g.age) + '</span>';
  }
  function favBtn(g, extraCls) {
    var on = favs.has(g.id);
    return '<button class="mini-btn fav-btn ' + (extraCls || '') + (on ? ' active' : '') + '" data-action="fav-toggle" data-id="' + g.id + '" data-fav-btn="' + g.id + '" aria-pressed="' + on + '" aria-label="В избранное" title="' + (on ? 'Убрать из избранного' : 'В избранное') + '">' + icon('heart') + '</button>';
  }
  function libBtn(g) {
    var on = !!lib[g.id];
    return '<button class="mini-btn' + (on ? ' active' : '') + '" data-action="lib-add" data-id="' + g.id + '" data-lib-btn="' + g.id + '" aria-label="В библиотеку" title="' + (on ? 'Уже в библиотеке' : 'Добавить в библиотеку') + '">' + icon(on ? 'check' : 'plus') + '</button>';
  }
  function cmpBtn(g) {
    var on = compare.indexOf(g.id) > -1;
    return '<button class="mini-btn' + (on ? ' active' : '') + '" data-action="compare-toggle" data-id="' + g.id + '" data-compare-btn="' + g.id + '" aria-label="Сравнить" title="' + (on ? 'Убрать из сравнения' : 'Добавить к сравнению') + '">' + icon('compare') + '</button>';
  }
  function actionTrio(g) { return favBtn(g) + libBtn(g) + cmpBtn(g); }
  function delay(i) { return 'style="--d:' + ((i % 6) * 0.06).toFixed(2) + 's"'; }

  function gameCard(g, i, variant) {
    var pm = genreById[g.genres[0]];
    if (variant === 'library') {
      var entry = lib[g.id], st = statusById[entry ? entry.status : 'want'];
      var scs = '--sc:' + st.color + ';--scs:' + hexA(st.color, .12) + ';--scb:' + hexA(st.color, .4);
      return '<article class="g-card reveal" ' + delay(i) + ' data-card="' + g.id + '">' +
        '<div class="g-media img-wrap"><a class="g-media-link" href="#/game/' + g.id + '" aria-label="' + esc(g.title) + '">' +
        imgTag(cover(g), g.title, 'g-img', { game: g }) +
        '<span class="g-rating">' + ratingPill(g) + '</span>' +
        '<span class="g-overlay"><span class="g-overlay-genres">' + genreChips(g, 2) + '</span><span class="g-overlay-desc">' + esc(g.short) + '</span><span class="g-overlay-cta">Подробнее ' + icon('arrowR') + '</span></span></a>' +
        '<div class="g-actions">' + favBtn(g) + cmpBtn(g) + '</div></div>' +
        '<div class="g-body"><a class="g-title" href="#/game/' + g.id + '">' + esc(g.title) + '</a>' +
        '<div class="g-meta"><span class="g-genre" style="--gc:' + pm.color + '">' + esc(g.genres[0]) + '</span><span>·</span><span>' + g.year + '</span></div></div>' +
        '<div class="lib-foot"><div class="dd status-dd" style="' + scs + '">' +
        '<button class="status-pill" data-action="dd-toggle" aria-expanded="false"><i class="dot"></i>' + esc(st.label) + icon('chevD') + '</button>' +
        '<div class="dd-menu dd-status">' + STATUSES.map(function (s) {
          return '<button class="dd-item' + (s.id === st.id ? ' checked' : '') + '" style="--sc:' + s.color + '" data-action="lib-status" data-id="' + g.id + '" data-status="' + s.id + '"><i class="dot"></i>' + esc(s.label) + '<span class="dd-check">' + icon('check') + '</span></button>';
        }).join('') + '<div class="dd-hr"></div><button class="dd-item danger" data-action="lib-remove" data-id="' + g.id + '">' + icon('trash') + 'Удалить из библиотеки</button></div></div>' +
        '<button class="mini-btn lib-remove-btn" data-action="lib-remove" data-id="' + g.id + '" title="Удалить" aria-label="Удалить из библиотеки">' + icon('trash') + '</button></div>' +
        '<div class="lib-added">Добавлено ' + fmtDate(entry ? entry.addedAt : Date.now()) + '</div></article>';
    }
    return '<article class="g-card reveal" ' + delay(i) + ' data-card="' + g.id + '">' +
      '<div class="g-media img-wrap"><a class="g-media-link" href="#/game/' + g.id + '" aria-label="' + esc(g.title) + '">' +
      imgTag(cover(g), g.title, 'g-img', { game: g }) +
      '<span class="g-badges">' + (isNew(g) ? '<span class="badge-new">NEW</span>' : '') + '</span>' +
      '<span class="g-rating">' + ratingPill(g) + '</span>' +
      '<span class="g-overlay"><span class="g-overlay-genres">' + genreChips(g, 2) + '</span><span class="g-overlay-desc">' + esc(g.short) + '</span><span class="g-overlay-cta">Подробнее ' + icon('arrowR') + '</span></span></a>' +
      '<div class="g-actions">' + actionTrio(g) + '</div></div>' +
      '<div class="g-body"><a class="g-title" href="#/game/' + g.id + '">' + esc(g.title) + '</a>' +
      '<div class="g-meta"><span class="g-genre" style="--gc:' + pm.color + '">' + esc(g.genres[0]) + '</span><span>·</span><span>' + g.year + '</span></div>' +
      '<div class="g-foot">' + starsHTML(g.rating) + platformIcons(g) + '</div></div></article>';
  }
  function portraitCard(g, i) {
    var rankCls = i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : '';
    return '<article class="p-card reveal" ' + delay(i) + '>' +
      '<a class="p-link img-wrap" href="#/game/' + g.id + '">' +
      imgTag(portrait(g), g.title, '', { game: g, fallbackSrc: cover(g) }) +
      '<span class="p-shade"></span>' +
      '<span class="p-rank ' + rankCls + '">' + (i < 3 ? icon('medal') : '') + '#' + (i + 1) + '</span>' +
      '<span class="p-info"><span class="p-title">' + esc(g.title) + '</span><span class="p-meta">' + esc(g.genres[0]) + ' · ' + g.year + '</span>' + ratingPill(g) + '</span></a>' +
      favBtn(g, 'p-fav') + '</article>';
  }
  function miniCard(g, removable) {
    var inner = '<a class="mini-card" href="#/game/' + g.id + '">' + coverBlock(g, 'mini-thumb') +
      '<span class="mini-info"><b>' + esc(g.title) + '</b><i>' + esc(g.genres[0]) + ' · ' + g.year + '</i>' + ratingPill(g) + '</span></a>';
    if (!removable) return inner;
    return '<div class="mini-wrap reveal">' + inner +
      '<button class="mini-x" data-action="recent-remove" data-id="' + g.id + '" title="Убрать из просмотренных" aria-label="Убрать">' + icon('x') + '</button></div>';
  }
  function listRow(g, i) {
    return '<div class="list-row reveal" ' + delay(i) + '>' +
      '<a class="list-thumb img-wrap" href="#/game/' + g.id + '">' + imgTag(cover(g), g.title, '', { game: g }) + '</a>' +
      '<div class="list-main"><a class="list-title" href="#/game/' + g.id + '">' + esc(g.title) + '</a>' +
      '<div class="list-sub">' + esc(g.dev) + ' · ' + esc(g.pub) + '</div>' +
      '<div class="list-genres">' + genreChips(g, 3) + '</div></div>' +
      '<span class="list-year">' + g.year + '</span>' + ratingPill(g) +
      '<div class="list-actions">' + actionTrio(g) + '</div></div>';
  }
  function rankRow(g, rank) {
    return '<div class="rank-row reveal" ' + delay(rank) + '>' +
      '<span class="rank-num">' + rank + '</span>' +
      '<a class="rank-thumb img-wrap" href="#/game/' + g.id + '">' + imgTag(cover(g), g.title, '', { game: g }) + '</a>' +
      '<div class="rank-info"><a class="rank-title" href="#/game/' + g.id + '">' + esc(g.title) + '</a>' +
      '<div class="rank-sub">' + esc(g.dev) + ' · ' + g.year + '</div>' +
      '<div class="rank-genres">' + genreChips(g, 2) + '</div></div>' +
      '<div class="rank-pop"><span class="rank-pop-label">Индекс</span><div class="pop-bar"><i style="--w:' + g.popularity + '%"></i></div><b>' + g.popularity + '</b></div>' +
      ratingPill(g) + '<div class="rank-actions">' + actionTrio(g) + '</div></div>';
  }
  function sectionHead(kickerIcon, kickerText, kickerColor, title, sub, actions) {
    return '<div class="sec-head reveal"><div>' +
      '<span class="kicker" style="--kc:' + kickerColor + '">' + icon(kickerIcon) + esc(kickerText) + '</span>' +
      '<h2 class="sec-title">' + title + '</h2>' + (sub ? '<p class="sec-sub">' + sub + '</p>' : '') +
      '</div>' + (actions ? '<div class="sec-head-actions">' + actions + '</div>' : '') + '</div>';
  }
  function rowNav(id) {
    return '<div class="row-nav"><button class="icon-btn" data-action="row-scroll" data-target="' + id + '" data-dir="-1" aria-label="Прокрутить влево">' + icon('chevL') + '</button>' +
      '<button class="icon-btn" data-action="row-scroll" data-target="' + id + '" data-dir="1" aria-label="Прокрутить вправо">' + icon('chevR') + '</button></div>';
  }
  function hRow(id, cls, inner) {
    return '<div class="row-wrap reveal" data-rowwrap="' + id + '"><div class="h-row ' + cls + '" id="' + id + '" tabindex="0">' + inner + '</div></div>';
  }
  function emptyState(ic, title, text, action) {
    return '<div class="empty reveal"><div class="empty-art">' + icon(ic) + '</div><h3>' + esc(title) + '</h3><p>' + esc(text) + '</p>' + (action || '') + '</div>';
  }
  function hi(text, q) {
    var t = String(text); if (!q) return esc(t);
    var i = t.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(t);
    return esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + q.length)) + '</mark>' + esc(t.slice(i + q.length));
  }

  /* ================= Действия пользователя ================= */
  function burst(btn) {
    if (!btn || reduced()) return;
    btn.classList.add('burst');
    for (var i = 0; i < 6; i++) {
      var s = document.createElement('i');
      s.className = 'spark'; s.style.setProperty('--a', (i * 60) + 'deg');
      btn.appendChild(s);
    }
    setTimeout(function () {
      btn.classList.remove('burst');
      qsa('.spark', btn).forEach(function (s) { s.remove(); });
    }, 700);
  }
  function toggleFav(id, btn) {
    var g = byId[id]; if (!g) return;
    if (favs.has(id)) {
      favs.delete(id); saveFavs(); logActivity('fav_remove');
      refreshButtons(id); syncBadges();
      toast('«' + g.title + '» удалена из избранного', {
        type: 'info', action: { label: 'Отменить', fn: function () { favs.add(id); saveFavs(); refreshButtons(id); syncBadges(); toast('Возвращено в избранное'); rerenderSoft(); } }
      });
      if (state.route.name === 'favorites') {
        var card = qs('[data-card="' + id + '"]');
        if (card) { card.style.transition = '.25s'; card.style.opacity = '0'; card.style.transform = 'scale(.9)'; }
        setTimeout(rerenderSoft, 240);
      }
    } else {
      favs.add(id); saveFavs(); logActivity('fav_add');
      burst(btn); refreshButtons(id); syncBadges();
      toast('«' + g.title + '» добавлена в избранное');
    }
  }
  function libAdd(id, status) {
    var g = byId[id]; if (!g) return;
    if (lib[id]) {
      toast('«' + g.title + '» уже в библиотеке · ' + statusById[lib[id].status].label, {
        type: 'info', action: { label: 'Открыть библиотеку', fn: function () { navigateTo('#/library'); } }
      });
      return;
    }
    lib[id] = { status: status || 'want', addedAt: Date.now() };
    saveLib(); logActivity('lib_add');
    pushNotif('book', '«' + g.title + '» добавлена в вашу библиотеку.');
    refreshButtons(id); syncBadges();
    toast('«' + g.title + '» добавлена в библиотеку', {
      action: { label: 'Статус: Играю', fn: function () { libSetStatus(id, 'playing'); } }
    });
    rerenderSoft();
  }
  function libSetStatus(id, status) {
    var g = byId[id]; if (!g || !lib[id] || !statusById[status]) return;
    lib[id].status = status; saveLib(); logActivity('status');
    if (status === 'done') pushNotif('trophy', 'Поздравляем! «' + g.title + '» пройдена. Отличный результат!');
    refreshButtons(id); syncBadges();
    toast('Статус «' + g.title + '»: ' + statusById[status].label, { type: status === 'done' ? 'success' : 'info' });
    rerenderSoft();
  }
  function libRemove(id) {
    var g = byId[id]; if (!g || !lib[id]) return;
    confirmDialog({
      title: 'Удалить из библиотеки?',
      text: '«' + g.title + '» и её статус будут удалены из вашей библиотеки. Действие можно отменить сразу после удаления.',
      ok: 'Удалить'
    }).then(function (ok) {
      if (!ok) return;
      var snapshot = lib[id];
      delete lib[id]; saveLib(); logActivity('lib_remove');
      refreshButtons(id); syncBadges(); rerenderSoft();
      toast('«' + g.title + '» удалена из библиотеки', {
        type: 'info', action: { label: 'Отменить', fn: function () { lib[id] = snapshot; saveLib(); refreshButtons(id); syncBadges(); rerenderSoft(); toast('Игра восстановлена в библиотеке'); } }
      });
    });
  }
  function clearFavs() {
    if (!favs.size) return;
    confirmDialog({
      title: 'Очистить избранное?',
      text: 'Будет удалено ' + favs.size + ' ' + plural(favs.size, ['игра', 'игры', 'игр']) + ' из избранного. Сразу после очистки действие можно отменить.',
      ok: 'Очистить'
    }).then(function (ok) {
      if (!ok) return;
      var snapshot = Array.from(favs);
      favs.clear(); saveFavs(); syncBadges(); rerenderSoft();
      toast('Избранное очищено', {
        type: 'info', action: { label: 'Отменить', fn: function () { snapshot.forEach(function (id) { favs.add(id); }); saveFavs(); syncBadges(); rerenderSoft(); toast('Избранное восстановлено'); } }
      });
    });
  }
  function trackView(id) {
    if (recent[0] !== id) {
      recent = recent.filter(function (x) { return x !== id; });
      recent.unshift(id);
      if (recent.length > 10) recent.length = 10;
      saveRecent();
    }
    logActivity('view');
  }
  function toggleCompare(id) {
    var g = byId[id]; if (!g) return;
    var i = compare.indexOf(id);
    if (i > -1) { compare.splice(i, 1); }
    else {
      if (compare.length >= 3) { toast('Сравнивать можно не более трёх игр одновременно', { type: 'warn' }); return; }
      compare.push(id); logActivity('compare');
      toast('«' + g.title + '» добавлена к сравнению' + (compare.length < 2 ? ' — выберите ещё одну' : ''), { type: 'info' });
    }
    saveCompare(); refreshButtons(id); renderTray();
  }
  function shareGame(id) {
    var url = location.href.split('#')[0] + '#/game/' + id;
    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = url; ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand('copy'); ta.remove();
        if (ok) toast('Ссылка на игру скопирована'); else throw new Error();
      } catch (e) { toast('Не удалось скопировать ссылку', { type: 'error' }); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { toast('Ссылка на игру скопирована'); }, fallback);
    } else fallback();
  }
  function applyTheme(id, silent) {
    if (!THEMES.some(function (t) { return t.id === id; })) id = 'violet';
    document.documentElement.setAttribute('data-theme', id);
    settings.theme = id; saveSettings();
    if (!silent) { logActivity('theme'); toast('Тема оформления: ' + THEMES.find(function (t) { return t.id === id; }).label, { type: 'info' }); }
    qsa('[data-action="theme-set"]').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-theme') === id); });
    var dd = qs('#profileDD');
    if (dd && dd.classList.contains('open')) renderProfileMenu();
    renderMobileMenu();
  }
  function resetAll() {
    confirmDialog({
      title: 'Сбросить все данные?',
      text: 'Профиль, избранное, библиотека, история просмотров и настройки будут удалены без возможности отмены. Каталог игр останется на месте.',
      ok: 'Сбросить всё'
    }).then(function (ok) {
      if (!ok) return;
      S.clearAll();
      favs = new Set(); lib = {}; recent = []; notifs = []; activity = []; compare = [];
      settings = { theme: 'violet' }; profile = null;
      seed(); applyTheme('violet', true);
      state.catalog = { q: '', genres: new Set(), platforms: new Set(), yearMin: null, yearMax: null, rating: 0, dev: '', sort: 'popularity', view: 'grid' };
      state.libTab = 'all'; state.libQuery = '';
      closeAllModals(); syncBadges(); renderTray(); navigateTo('#/');
      toast('Все данные сброшены. С чистого листа!', { type: 'info' });
    });
  }

  /* ================= Синхронизация UI ================= */
  function syncBadges() {
    var fb = qs('#favBadge'), lb = qs('#libBadge');
    if (fb) { fb.textContent = favs.size; fb.hidden = !favs.size; }
    if (lb) { var n = Object.keys(lib).length; lb.textContent = n; lb.hidden = !n; }
    var unread = notifs.filter(function (n) { return !n.read; }).length;
    var nb = qs('#notifBadge');
    if (nb) { nb.textContent = unread > 9 ? '9+' : unread; nb.hidden = !unread; }
    var av = qs('#headerAvatar');
    if (av && profile) av.src = avatarURI(profile.avatar);
    var mfb = qs('#mFavBadge'), mlb = qs('#mLibBadge');
    if (mfb) { mfb.textContent = favs.size; mfb.hidden = !favs.size; }
    if (mlb) { var mn = Object.keys(lib).length; mlb.textContent = mn; mlb.hidden = !mn; }
    var mname = qs('#mProfileName'); if (mname && profile) mname.textContent = profile.name;
    var mav = qs('#mProfileAvatar'); if (mav && profile) mav.src = avatarURI(profile.avatar);
  }
  function refreshButtons(id) {
    var g = byId[id]; if (!g) return;
    var on = favs.has(id);
    qsa('[data-fav-btn="' + id + '"]').forEach(function (b) {
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on);
      b.title = on ? 'Убрать из избранного' : 'В избранное';
      var lbl = qs('[data-fav-label]', b);
      if (lbl) lbl.textContent = on ? 'В избранном' : 'В избранное';
    });
    var inLib = !!lib[id];
    qsa('[data-lib-btn="' + id + '"]').forEach(function (b) {
      b.classList.toggle('active', inLib);
      b.title = inLib ? 'Уже в библиотеке' : 'Добавить в библиотеку';
      b.innerHTML = icon(inLib ? 'check' : 'plus');
    });
    qsa('[data-compare-btn="' + id + '"]').forEach(function (b) {
      b.classList.toggle('active', compare.indexOf(id) > -1);
    });
    var la = qs('#libAction');
    if (la && state.route.name === 'game' && state.route.id === id) la.innerHTML = libActionHTML(g);
  }
  function rerenderSoft() {
    var n = state.route.name;
    if (n === 'favorites' || n === 'library') renderRoute({ animate: false, keepScroll: true });
  }

  /* ================= Меню профиля и уведомлений ================= */
  function renderProfileMenu() {
    var el = qs('#profileMenu'); if (!el || !profile) return;
    el.innerHTML =
      '<div class="pm-head"><img src="' + avatarURI(profile.avatar) + '" alt=""><div><b>' + esc(profile.name) + '</b><span>Локальный профиль</span></div></div>' +
      '<div class="dd-hr"></div>' +
      '<button class="dd-item" data-action="profile-open">' + icon('user') + 'Профиль и настройки</button>' +
      '<a class="dd-item" href="#/favorites">' + icon('heart') + 'Избранное<span class="dd-check" style="opacity:1;color:var(--muted)">' + favs.size + '</span></a>' +
      '<a class="dd-item" href="#/library">' + icon('book') + 'Моя библиотека<span class="dd-check" style="opacity:1;color:var(--muted)">' + Object.keys(lib).length + '</span></a>' +
      '<div class="dd-hr"></div><div class="dd-label">Тема акцентов</div>' +
      '<div class="theme-dots">' + THEMES.map(function (t) {
        return '<button class="theme-dot ' + t.id + (settings.theme === t.id ? ' active' : '') + '" data-action="theme-set" data-theme="' + t.id + '" title="' + esc(t.label) + '" aria-label="Тема: ' + esc(t.label) + '"></button>';
      }).join('') + '</div>' +
      '<div class="dd-hr"></div>' +
      '<button class="dd-item danger" data-action="reset-data">' + icon('trash') + 'Сбросить все данные</button>';
  }
  function renderNotifMenu() {
    var el = qs('#notifMenu'); if (!el) return;
    var items = notifs.length ? notifs.map(function (n) {
      return '<button class="notif-item' + (n.read ? ' read' : '') + '" data-action="notif-read" data-nid="' + n.id + '">' +
        '<span class="notif-ic">' + icon(n.icon || 'info') + '</span>' +
        '<span style="flex:1;min-width:0"><p>' + esc(n.text) + '</p><time>' + relTime(n.ts) + '</time></span>' +
        (n.read ? '' : '<i class="unread-dot"></i>') + '</button>';
    }).join('') : '<div class="notif-empty">' + icon('bell') + '<p>Пока нет уведомлений.<br>Действия с играми появятся здесь.</p></div>';
    el.innerHTML = '<div class="notif-head"><b>Уведомления</b>' +
      (notifs.some(function (n) { return !n.read; }) ? '<button data-action="notif-read-all">Прочитать все</button>' : '') +
      '</div>' + items;
  }
  function renderMobileMenu() {
    var el = qs('#mobileMenu'); if (!el || !profile) return;
    var links = [
      ['#/', 'home', 'Главная', 'home'],
      ['#/catalog', 'catalog', 'Каталог игр', 'grid'],
      ['#/popular', 'popular', 'Популярное', 'fire'],
      ['#/favorites', 'favorites', 'Избранное', 'heart'],
      ['#/library', 'library', 'Моя библиотека', 'book']
    ];
    el.innerHTML = links.map(function (l, i) {
      var badge = l[1] === 'favorites' ? '<span class="nav-badge" id="mFavBadge"' + (favs.size ? '' : ' hidden') + '>' + favs.size + '</span>'
        : l[1] === 'library' ? '<span class="nav-badge" id="mLibBadge"' + (Object.keys(lib).length ? '' : ' hidden') + '>' + Object.keys(lib).length + '</span>' : '';
      return '<a class="m-link' + (state.route.name === l[1] ? ' active' : '') + '" style="--i:' + i + '" href="' + l[0] + '" data-nav="' + l[1] + '">' + icon(l[3]) + esc(l[2]) + badge + '</a>';
    }).join('') +
      '<div class="m-divider"></div>' +
      '<div class="m-row"><span class="m-row-label">Тема</span><div class="theme-dots" style="padding:0">' + THEMES.map(function (t) {
        return '<button class="theme-dot ' + t.id + (settings.theme === t.id ? ' active' : '') + '" data-action="theme-set" data-theme="' + t.id + '" aria-label="Тема: ' + esc(t.label) + '"></button>';
      }).join('') + '</div></div>' +
      '<div class="m-divider"></div>' +
      '<button class="m-profile" data-action="profile-open"><img id="mProfileAvatar" src="' + avatarURI(profile.avatar) + '" alt=""><span><b id="mProfileName">' + esc(profile.name) + '</b><span>Профиль и настройки</span></span>' + icon('chevR') + '</button>';
  }
  function closeAllDD(except) {
    qsa('.dd.open').forEach(function (dd) {
      if (dd === except) return;
      dd.classList.remove('open');
      var t = qs('[data-action="dd-toggle"]', dd); if (t) t.setAttribute('aria-expanded', 'false');
      var card = dd.closest('.g-card'); if (card) card.classList.remove('dd-open');
    });
  }
  function toggleDD(btn) {
    var dd = btn.closest('.dd'); if (!dd) return;
    var willOpen = !dd.classList.contains('open');
    closeAllDD(dd);
    dd.classList.toggle('open', willOpen);
    btn.setAttribute('aria-expanded', willOpen);
    var card = dd.closest('.g-card'); if (card) card.classList.toggle('dd-open', willOpen);
    if (willOpen) {
      if (dd.getAttribute('data-dd') === 'notifs') renderNotifMenu();
      if (dd.getAttribute('data-dd') === 'profile') renderProfileMenu();
    }
  }

  /* ================= Мобильное меню / фильтры ================= */
  function setMobile(open) {
    var menu = qs('#mobileMenu'), bd = qs('#mobileBackdrop'), burger = qs('#burger');
    if (!menu) return;
    var was = menu.classList.contains('open');
    menu.classList.toggle('open', open);
    if (bd) bd.classList.toggle('open', open);
    if (burger) { burger.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); }
    if (open && !was) lockScroll();
    if (!open && was) unlockScroll();
  }
  function setFilters(open) {
    var p = qs('#filtersPanel'), bd = qs('#filtersBackdrop');
    if (!p) return;
    var was = p.classList.contains('open');
    p.classList.toggle('open', open);
    if (bd) bd.classList.toggle('open', open);
    if (open && !was) lockScroll();
    if (!open && was) unlockScroll();
  }

  /* ================= Панель сравнения ================= */
  function renderTray() {
    var tray = qs('#compareTray'); if (!tray) return;
    if (!compare.length) { tray.hidden = true; tray.innerHTML = ''; return; }
    tray.hidden = false;
    var slots = compare.map(function (id) {
      var g = byId[id];
      return '<span class="tray-slot">' + coverBlock(g, '') +
        '<button class="tray-x" data-action="compare-remove" data-id="' + id + '" aria-label="Убрать ' + esc(g.title) + '">' + icon('x') + '</button></span>';
    });
    for (var i = compare.length; i < 3; i++) slots.push('<span class="tray-slot empty">' + icon('plus') + '</span>');
    tray.innerHTML = '<span class="tray-label">Сравнение ' + compare.length + '/3</span>' +
      '<div class="tray-slots">' + slots.join('') + '</div>' +
      '<div class="tray-actions"><button class="btn primary sm" data-action="compare-open"' + (compare.length < 2 ? ' disabled title="Выберите минимум 2 игры"' : '') + '>' + icon('compare') + 'Сравнить</button>' +
      '<button class="icon-btn" style="width:38px;height:38px" data-action="compare-clear" title="Очистить" aria-label="Очистить сравнение">' + icon('x') + '</button></div>';
  }
  function openCompare() {
    if (compare.length < 2) {
      toast('Выберите 2–3 игры для сравнения — кнопка ' + '⇄' + ' есть на каждой карточке', { type: 'info' });
      return;
    }
    var gs = compare.map(function (id) { return byId[id]; });
    var best = gs.reduce(function (a, b) { return b.rating > a.rating ? b : a; });
    var newest = gs.reduce(function (a, b) { return b.year > a.year ? b : a; });
    function row(label, cells) {
      return '<tr><th>' + label + '</th>' + cells.map(function (c, i) {
        return '<td' + (c.best ? ' class="best"' : '') + '>' + c.html + '</td>';
      }).join('') + '</tr>';
    }
    var head = '<tr><th>Игра</th>' + gs.map(function (g) {
      return '<td><div class="cmp-head">' + coverBlock(g, '') +
        '<a href="#/game/' + g.id + '">' + esc(g.title) + '</a>' +
        '<button class="cmp-x" data-action="compare-remove-modal" data-id="' + g.id + '">' + icon('x') + 'убрать</button></div></td>';
    }).join('') + '</tr>';
    var rows =
      row('Оценка', gs.map(function (g) { return { best: g === best, html: ratingPill(g) + (g === best ? '<span class="cmp-best-chip">' + icon('crown') + 'лучшая</span>' : '') + '<div style="margin-top:8px">' + starsHTML(g.rating) + '</div>' }; })) +
      row('Год', gs.map(function (g) { return { best: g === newest && gs.some(function (x) { return x.year !== g.year; }), html: '<b>' + g.year + '</b>' + (g === newest ? '<span class="cmp-best-chip">' + icon('sparkles') + 'новее</span>' : '') + '<div style="color:var(--muted);font-size:.74rem;margin-top:3px">' + fmtDate(g.released) + '</div>' }; })) +
      row('Жанры', gs.map(function (g) { return { html: '<div style="display:flex;gap:6px;flex-wrap:wrap">' + genreChips(g, 3) + '</div>' }; })) +
      PLATFORMS.map(function (p) {
        return row(p.label, gs.map(function (g) {
          return { html: g.platforms.indexOf(p.id) > -1 ? '<span class="cmp-check">' + icon('check') + '</span>' : '<span class="cmp-dash">—</span>' };
        }));
      }).join('') +
      row('Разработчик', gs.map(function (g) { return { html: esc(g.dev) }; })) +
      row('Возраст', gs.map(function (g) { return { html: ageBadge(g) }; })) +
      row('Размер', gs.map(function (g) { return { html: '≈ ' + g.storage + ' ГБ' }; })) +
      row('Действия', gs.map(function (g) { return { html: '<div class="cmp-actions">' + favBtn(g) + libBtn(g) + '</div>' }; }));
    openModal(
      '<button class="icon-btn modal-x" data-action="modal-close" aria-label="Закрыть">' + icon('x') + '</button>' +
      '<h3 class="modal-title">' + icon('compare') + 'Сравнение игр</h3>' +
      '<p class="modal-sub">Оценки — демонстрационные. Лучший показатель подсвечен.</p>' +
      '<div class="cmp-wrap"><table class="cmp-table"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>',
      { cls: 'modal-compare', kind: 'compare' }
    );
  }

  /* ================= Поиск-палитра ================= */
  function openSearch() {
    var t = topModal(); if (t && t.kind === 'search') return;
    state.palette = { q: '', items: [], index: 0 };
    openModal(
      '<div class="palette-head">' + icon('search') +
      '<input id="paletteInput" data-input="palette-search" placeholder="Название, жанр или разработчик…" autocomplete="off" autofocus>' +
      '<button class="palette-clear" data-action="palette-clear" aria-label="Очистить" hidden>' + icon('x') + '</button>' +
      '<span class="palette-esc">Esc</span></div>' +
      '<div class="palette-list" id="paletteList" role="listbox"></div>' +
      '<div class="palette-foot"><span><kbd>↑↓</kbd>навигация</span><span><kbd>Enter</kbd>открыть</span><span><kbd>Esc</kbd>закрыть</span><span style="margin-left:auto">Мгновенный поиск по ' + GAMES.length + ' играм</span></div>',
      { cls: 'modal-search', kind: 'search', onClose: function () { state.palette = null; } }
    );
    refreshPalette('');
  }
  function paletteMatch(g, q) {
    q = q.toLowerCase();
    return g.title.toLowerCase().indexOf(q) > -1 || g.dev.toLowerCase().indexOf(q) > -1 ||
      g.genres.join(' ').toLowerCase().indexOf(q) > -1 || String(g.year).indexOf(q) > -1;
  }
  function refreshPalette(q) {
    var list = qs('#paletteList'); if (!list || !state.palette) return;
    state.palette.q = q;
    var clr = qs('.palette-clear'); if (clr) clr.hidden = !q;
    var games, groups = '';
    if (q) {
      games = GAMES.filter(function (g) { return paletteMatch(g, q); }).slice(0, 7);
    } else {
      var rec = recent.slice(0, 3).map(function (id) { return byId[id]; });
      var pop = GAMES.slice().sort(function (a, b) { return b.popularity - a.popularity; }).slice(0, 5);
      games = rec.concat(pop.filter(function (g) { return rec.indexOf(g) === -1; }));
      if (rec.length) groups += '<div class="palette-group">Недавно смотрели</div>';
    }
    var items = [];
    function gameRow(g, idx) {
      items.push({ type: 'game', id: g.id });
      return '<button class="palette-item" role="option" data-action="palette-open" data-id="' + g.id + '" data-pidx="' + idx + '">' +
        coverBlock(g, '') + '<span class="pi-main"><b>' + hi(g.title, q) + '</b><span>' + hi(g.dev, q) + ' · ' + esc(g.genres.join(', ')) + ' · ' + g.year + '</span></span>' + ratingPill(g) + '</button>';
    }
    var html = '';
    if (q) {
      html += games.length ? '<div class="palette-group">Игры · ' + games.length + '</div>' + games.map(function (g) { return gameRow(g, items.length); }).join('')
        : '<div class="palette-empty">' + icon('search') + '<b>Ничего не найдено по «' + esc(q) + '»</b>Попробуйте другое название или откройте каталог с фильтрами.</div>';
      var matchedGenres = GENRES.filter(function (m) { return m.id.toLowerCase().indexOf(q.toLowerCase()) > -1 || m.ru.toLowerCase().indexOf(q.toLowerCase()) > -1; });
      if (matchedGenres.length) {
        html += '<div class="palette-group">Жанры</div><div class="palette-chips">' + matchedGenres.map(function (m) {
          return '<button class="g-chip" style="--gc:' + m.color + ';--gcs:' + hexA(m.color, .12) + ';--gcb:' + hexA(m.color, .35) + '" data-action="palette-genre" data-genre="' + m.id + '"><i class="dot"></i>' + m.id + ' · ' + esc(m.ru) + '</button>';
        }).join('') + '</div>';
      }
      items.push({ type: 'catalog' });
      html += '<button class="palette-item" data-action="palette-catalog" data-pidx="' + (items.length - 1) + '" style="margin-top:6px">' +
        '<span class="notif-ic">' + icon('arrowR') + '</span><span class="pi-main"><b>Открыть каталог с запросом «' + esc(q) + '»</b><span>Фильтры, сортировка и все результаты</span></span></button>';
    } else {
      var ri = 0;
      html += games.map(function (g, i) {
        var chunk = (i === 3 && recent.length) ? '<div class="palette-group">Популярные запросы</div>' : '';
        return chunk + gameRow(g, items.length);
      }).join('');
      html += '<div class="palette-group">Быстрые жанры</div><div class="palette-chips">' + GENRES.slice(0, 6).map(function (m) {
        return '<button class="g-chip" style="--gc:' + m.color + ';--gcs:' + hexA(m.color, .12) + ';--gcb:' + hexA(m.color, .35) + '" data-action="palette-genre" data-genre="' + m.id + '"><i class="dot"></i>' + m.id + '</button>';
      }).join('') + '</div>';
    }
    list.innerHTML = html;
    state.palette.items = items;
    state.palette.index = 0;
    markPaletteActive();
  }
  function markPaletteActive() {
    if (!state.palette) return;
    qsa('.palette-item').forEach(function (el) {
      var on = +el.getAttribute('data-pidx') === state.palette.index;
      el.classList.toggle('active', on);
      el.setAttribute('aria-selected', on);
      if (on) el.scrollIntoView({ block: 'nearest' });
    });
  }
  function paletteActivate(item) {
    if (!item) return;
    if (item.type === 'game') navigateTo('#/game/' + item.id);
    else navigateTo('#/catalog?q=' + encodeURIComponent(state.palette ? state.palette.q : ''));
  }

  /* ================= Профиль ================= */
  function activityChart() {
    var days = [], now = new Date();
    for (var i = 6; i >= 0; i--) {
      var d = new Date(now); d.setDate(now.getDate() - i);
      var key = d.toDateString();
      var count = activity.filter(function (a) { return new Date(a.ts).toDateString() === key; }).length;
      days.push({ label: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'][d.getDay()], count: count });
    }
    var max = Math.max.apply(null, days.map(function (d) { return d.count; }).concat([1]));
    var all = days.reduce(function (s, d) { return s + d.count; }, 0);
    return '<div class="p-chart">' + days.map(function (d) {
      return '<div class="p-chart-col" title="' + d.count + ' ' + plural(d.count, ['действие', 'действия', 'действий']) + '">' +
        '<i class="p-chart-bar" style="--h:' + Math.max(6, d.count / max * 100) + '%"></i><span>' + d.label + '</span></div>';
    }).join('') + '</div>' +
    '<p class="p-chart-hint">' + (all ? all + ' ' + plural(all, ['действие', 'действия', 'действий']) + ' за неделю' : 'Активность появится после первых действий — добавьте игру в избранное!') + '</p>';
  }
  function openProfile() {
    closeAllDD(); setMobile(false);
    state.profileDraft = { avatar: profile.avatar };
    var done = Object.keys(lib).filter(function (id) { return lib[id].status === 'done'; }).length;
    var views = activity.filter(function (a) { return a.t === 'view'; }).length;
    openModal(
      '<button class="icon-btn modal-x" data-action="modal-close" aria-label="Закрыть">' + icon('x') + '</button>' +
      '<div class="profile-head"><img id="profileAvatarPreview" src="' + avatarURI(profile.avatar) + '" alt="">' +
      '<div><b id="profileNamePreview">' + esc(profile.name) + '</b><span>Локальный профиль · с ' + fmtDate(profile.createdAt) + '</span></div></div>' +
      '<div class="p-section"><div class="p-label">Имя игрока</div>' +
      '<input class="p-input" id="profileName" data-input="profile-name" maxlength="24" value="' + esc(profile.name) + '" placeholder="Как вас называть?"></div>' +
      '<div class="p-section"><div class="p-label">Аватар</div><div class="avatar-grid">' + AV_GLYPHS.map(function (_, i) {
        return '<button class="avatar-opt' + (i === profile.avatar ? ' active' : '') + '" data-action="avatar-set" data-avatar="' + i + '" aria-label="Аватар ' + (i + 1) + '"><img src="' + avatarURI(i) + '" alt=""></button>';
      }).join('') + '</div></div>' +
      '<div class="p-section"><div class="p-label">Тема акцентов</div><div class="theme-cards">' + THEMES.map(function (t) {
        return '<button class="theme-card' + (settings.theme === t.id ? ' active' : '') + '" data-action="theme-set" data-theme="' + t.id + '">' +
          '<span class="swatch" style="background:linear-gradient(135deg,' + t.c1 + ',' + t.c2 + ')"></span>' + esc(t.label) +
          '<span class="tc-check">' + icon('check') + '</span></button>';
      }).join('') + '</div></div>' +
      '<div class="p-section"><div class="p-label">Статистика</div><div class="p-stats">' +
      '<div class="p-stat"><b>' + Object.keys(lib).length + '</b><span>в библиотеке</span></div>' +
      '<div class="p-stat"><b>' + favs.size + '</b><span>в избранном</span></div>' +
      '<div class="p-stat"><b>' + done + '</b><span>пройдено</span></div>' +
      '<div class="p-stat"><b>' + views + '</b><span>просмотров</span></div></div></div>' +
      '<div class="p-section"><div class="p-label">Активность за неделю</div>' + activityChart() + '</div>' +
      '<div class="profile-foot"><button class="btn ghost sm" data-action="reset-data">' + icon('trash') + 'Сбросить данные</button>' +
      '<button class="btn primary" data-action="profile-save">' + icon('check') + 'Сохранить настройки</button></div>',
      { cls: 'modal-profile', kind: 'profile', onClose: function () { state.profileDraft = null; } }
    );
  }
  function saveProfileForm() {
    var input = qs('#profileName');
    var name = input ? input.value.trim() : '';
    profile.name = name || 'Игрок';
    if (state.profileDraft) profile.avatar = state.profileDraft.avatar;
    saveProfile(); logActivity('profile');
    syncBadges(); renderMobileMenu();
    closeModal();
    toast('Настройки сохранены');
  }

  /* ================= Рулетка «Выбери игру за меня» ================= */
  function openRoulette() {
    var m = openModal(
      '<button class="icon-btn modal-x" data-action="modal-close" aria-label="Закрыть">' + icon('x') + '</button>' +
      '<h3 class="modal-title" style="justify-content:center;padding:0">' + icon('dice') + 'Случайная игра</h3>' +
      '<p class="modal-sub">Доверьтесь судьбе — пусть каталог выберет за вас.</p>' +
      '<div class="roulette-card" id="rouletteCard"></div>' +
      '<div class="roulette-actions"><button class="btn ghost" data-action="roulette-again" id="rouletteAgain">' + icon('dice') + 'Ещё раз</button>' +
      '<button class="btn primary" data-action="roulette-open" id="rouletteOpen" disabled>' + icon('arrowR') + 'Открыть игру</button></div>',
      { cls: 'modal-roulette', kind: 'roulette', onClose: function () { if (m && m.timer) clearTimeout(m.timer); } }
    );
    spinRoulette(m);
  }
  function spinRoulette(m) {
    if (m.timer) clearTimeout(m.timer);
    var card = qs('#rouletteCard'), openBtn = qs('#rouletteOpen'), againBtn = qs('#rouletteAgain');
    if (!card) return;
    var final = GAMES[Math.floor(Math.random() * GAMES.length)];
    var steps = reduced() ? 1 : 11;
    var delays = [60, 60, 70, 80, 100, 130, 170, 220, 300, 400, 500];
    if (openBtn) openBtn.disabled = true;
    if (againBtn) againBtn.disabled = true;
    card.classList.remove('settled');
    var i = 0;
    function step() {
      if (!card.isConnected) return;
      var last = i >= steps - 1;
      var g = last ? final : GAMES[Math.floor(Math.random() * GAMES.length)];
      var pm = genreById[g.genres[0]];
      if (last) {
        card.style.setProperty('--rc', hexA(pm.color, .5));
        card.innerHTML = coverBlock(g, '', { eager: true }) +
          '<span class="r-meta"><b style="font-size:.9rem;text-align:left">' + esc(g.title) + '</b>' + ratingPill(g) + '</span>';
        card.classList.add('settled');
        if (openBtn) { openBtn.disabled = false; openBtn.setAttribute('data-id', g.id); }
        if (againBtn) againBtn.disabled = false;
        logActivity('random');
      } else {
        card.style.setProperty('--rc', hexA(pm.color, .5));
        card.innerHTML = icon(pm.icon) + '<b>' + esc(g.title) + '</b><span>' + esc(g.genres.join(' · ')) + ' · ' + g.year + '</span>';
        i++;
        m.timer = setTimeout(step, delays[Math.min(i, delays.length - 1)]);
      }
    }
    step();
  }

  /* ================= Лайтбокс ================= */
  function openLightbox(id, index) {
    var g = byId[id]; if (!g) return;
    state.lb = { g: g, items: mediaList(g), index: index || 0 };
    openModal(
      '<button class="icon-btn lb-close" data-action="modal-close" aria-label="Закрыть галерею">' + icon('x') + '</button>' +
      '<div class="lb-stage" id="lbStage">' +
      '<button class="lb-nav prev" data-action="lightbox-prev" aria-label="Предыдущее">' + icon('chevL') + '</button>' +
      '<img class="lb-img" id="lbImg" alt="">' +
      '<div class="lb-fallback">' + icon('alert') + '<p>Изображение недоступно.<br>Листайте дальше — остальные материалы на месте.</p></div>' +
      '<button class="lb-nav next" data-action="lightbox-next" aria-label="Следующее">' + icon('chevR') + '</button></div>' +
      '<div class="lb-bar"><span class="lb-caption" id="lbCaption"></span><span style="color:var(--muted);font-size:.8rem" id="lbCounter"></span></div>' +
      '<div class="lb-thumbs" id="lbThumbs"></div>',
      { cls: 'modal-lightbox', kind: 'lightbox', onClose: function () { state.lb = null; } }
    );
    updateLightbox();
  }
  function updateLightbox() {
    var lb = state.lb; if (!lb) return;
    var item = lb.items[lb.index];
    var img = qs('#lbImg'), stage = qs('#lbStage');
    if (img) {
      stage.classList.remove('failed');
      img.classList.remove('loaded');
      img.onload = function () { img.classList.add('loaded'); };
      img.onerror = function () { stage.classList.add('failed'); };
      img.src = item.url;
      img.alt = lb.g.title + ' — ' + item.label;
      if (img.complete && img.naturalWidth) img.classList.add('loaded');
    }
    var cap = qs('#lbCaption'); if (cap) cap.innerHTML = esc(item.label) + '<span>' + esc(lb.g.title) + '</span>';
    var cnt = qs('#lbCounter'); if (cnt) cnt.textContent = (lb.index + 1) + ' / ' + lb.items.length;
    var th = qs('#lbThumbs');
    if (th) th.innerHTML = lb.items.map(function (m, i) {
      return '<button class="lb-thumb' + (i === lb.index ? ' active' : '') + '" data-action="lightbox-goto" data-index="' + i + '" aria-label="' + esc(m.label) + '">' +
        '<span class="img-wrap done"><img src="' + m.url + '" alt="" loading="lazy" class="loaded" data-fb-title="' + esc(lb.g.title) + '" data-fb-genre="' + esc(lb.g.genres[0]) + '"></span></button>';
    }).join('');
    [1, -1].forEach(function (d) {
      var n = lb.items[(lb.index + d + lb.items.length) % lb.items.length];
      var pre = new Image(); pre.src = n.url;
    });
  }
  function lightboxNav(d) {
    if (!state.lb) return;
    state.lb.index = (state.lb.index + d + state.lb.items.length) % state.lb.items.length;
    updateLightbox();
  }

  /* ================= Рекомендации / похожие ================= */
  function ownedGenreWeights() {
    var w = {};
    favs.forEach(function (id) { byId[id].genres.forEach(function (g) { w[g] = (w[g] || 0) + 2; }); });
    Object.keys(lib).forEach(function (id) { byId[id].genres.forEach(function (g) { w[g] = (w[g] || 0) + 2; }); });
    return w;
  }
  function recommendations() {
    var w = ownedGenreWeights();
    var owned = {}; favs.forEach(function (id) { owned[id] = 1; }); Object.keys(lib).forEach(function (id) { owned[id] = 1; });
    return GAMES.filter(function (g) { return !owned[g.id]; })
      .map(function (g) {
        var s = g.genres.reduce(function (sum, x) { return sum + (w[x] || 0); }, 0) + g.rating * 0.3;
        return { g: g, s: s };
      })
      .filter(function (x) { return x.s > 1; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 6).map(function (x) { return x.g; });
  }
  function similarGames(g) {
    return GAMES.filter(function (x) { return x.id !== g.id; })
      .map(function (x) {
        var shared = x.genres.filter(function (j) { return g.genres.indexOf(j) > -1; }).length;
        return { g: x, s: shared * 3 + (x.dev === g.dev ? 2 : 0) + x.rating * 0.2 };
      })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 8).map(function (x) { return x.g; });
  }

  /* ================= Представления ================= */
  function HomeView() {
    var feats = D.HERO_FEATURES.map(function (id) { return byId[id]; });
    var f0 = feats[0];
    var popular = GAMES.slice().sort(function (a, b) { return b.popularity - a.popularity; }).slice(0, 8);
    var best = GAMES.slice().sort(function (a, b) { return b.rating - a.rating || b.popularity - a.popularity; }).slice(0, 6);
    var fresh = GAMES.slice().sort(function (a, b) { return new Date(b.released) - new Date(a.released); }).slice(0, 8);
    var editors = D.EDITOR_PICKS.map(function (id) { return byId[id]; });
    var gems = D.GEMS.map(function (id) { return byId[id]; });
    var genreCounts = GENRES.map(function (m) {
      return { m: m, n: GAMES.filter(function (g) { return g.genres.indexOf(m.id) > -1; }).length };
    }).sort(function (a, b) { return b.n - a.n; });
    var maxCount = genreCounts[0].n;
    var reco = recommendations();
    var recWeights = ownedGenreWeights();
    var basis = Object.keys(recWeights).sort(function (a, b) { return recWeights[b] - recWeights[a]; }).slice(0, 3);
    var recentGames = recent.slice(0, 6).map(function (id) { return byId[id]; });

    var html =
      /* HERO */
      '<section class="hero" id="hero">' +
      '<div class="hero-bg-wrap" id="heroBgWrap"><div class="hero-bg active" id="heroBgA" style="background-image:url(\'' + heroArt(f0) + '\')"></div><div class="hero-bg" id="heroBgB"></div></div>' +
      '<div class="hero-scrim"></div>' +
      '<div class="container"><div class="hero-content">' +
      '<span class="hero-badge">' + icon('gamepad') + 'Игровая вселенная GameHub</span>' +
      '<h1 class="hero-title">Открой свой следующий <em>игровой мир</em></h1>' +
      '<p class="hero-desc">Каталог лучших игр, честные подборки, избранное и личная библиотека прогресса — всё в одном месте. Без установки и регистрации: исследуй, выбирай, играй.</p>' +
      '<div class="hero-cta"><a class="btn primary lg" href="#/catalog">' + icon('compass') + 'Исследовать игры</a>' +
      '<a class="btn secondary lg" href="#/popular">' + icon('fire') + 'Популярные игры</a></div>' +
      '<div class="hero-stats">' +
      '<span class="hero-stat"><b>' + GAMES.length + '</b><span>' + plural(GAMES.length, ['игра', 'игры', 'игр']) + '<br>в каталоге</span></span>' +
      '<span class="hero-stat"><b>' + GENRES.length + '</b><span>жанров<br>на любой вкус</span></span>' +
      '<span class="hero-stat"><b>4</b><span>платформы<br>PC и консоли</span></span>' +
      '</div></div></div>' +
      '<div class="hero-float" aria-hidden="false">' + feats.map(function (g, i) {
        return '<a class="float-card f' + (i + 1) + '" href="#/game/' + g.id + '">' +
          '<span class="img-wrap done" style="display:block;aspect-ratio:460/215">' + imgTag(cover(g), g.title, 'loaded', { game: g, eager: i === 0 }) + '</span>' +
          '<span class="fc-body"><b>' + esc(g.title) + '</b>' + ratingPill(g) + '</span></a>';
      }).join('') + '</div>' +
      '<div class="hero-foot"><div class="container">' +
      '<a class="hero-chip" id="heroChip" href="#/game/' + f0.id + '">' + icon('eye') + 'На фоне: <b id="heroChipName">' + esc(f0.title) + '</b>' + icon('arrowR') + '</a>' +
      '<div class="hero-dots">' + feats.map(function (g, i) {
        return '<button class="hero-dot' + (i === 0 ? ' active' : '') + '" data-action="hero-dot" data-index="' + i + '" aria-label="Фон: ' + esc(g.title) + '"></button>';
      }).join('') + '</div>' +
      '<button class="hero-scroll" data-action="hero-scroll">Листай вниз ' + icon('chevD') + '</button>' +
      '</div></div></section>' +

      /* ПОПУЛЯРНЫЕ СЕЙЧАС */
      '<section class="section" id="popularSection"><div class="container">' +
      sectionHead('fire', 'В огне', '#FB923C', 'Популярные сейчас', 'Игры, в которые играет весь GameHub — по индексу популярности (демо).',
        '<a class="link-more" href="#/popular">Весь рейтинг ' + icon('arrowR') + '</a>' + rowNav('rowPopular')) +
      hRow('rowPopular', 'row-cards', popular.map(function (g, i) { return gameCard(g, i); }).join('')) +
      '</div></section>' +

      /* КАТЕГОРИИ */
      '<section class="section"><div class="container">' +
      sectionHead('grid', 'Навигация', '#A78BFA', 'Категории', 'Десять миров — от адреналиновых шутеров до уютных ферм.') +
      '<div class="cats-grid">' + GENRES.map(function (m, i) {
        var n = GAMES.filter(function (g) { return g.genres.indexOf(m.id) > -1; }).length;
        return '<a class="cat-tile reveal" ' + delay(i) + ' style="--gc:' + m.color + ';--gcs:' + hexA(m.color, .13) + ';--gcb:' + hexA(m.color, .4) + '" href="#/catalog?genre=' + m.id + '">' +
          '<span class="cat-count">' + n + '</span><span class="cat-ic">' + icon(m.icon) + '</span>' +
          '<span><span class="cat-name">' + m.id + '</span><div class="cat-ru">' + esc(m.ru) + '</div></span></a>';
      }).join('') + '</div></div></section>' +

      /* ЛУЧШИЕ ИГРЫ */
      '<section class="section"><div class="container">' +
      sectionHead('trophy', 'Зал славы', '#34D399', 'Лучшие игры', 'Максимальные оценки сообщества — проверенная классика и новые легенды.', rowNav('rowBest')) +
      hRow('rowBest', 'row-portraits', best.map(function (g, i) { return portraitCard(g, i); }).join('')) +
      '</div></section>' +

      /* НОВИНКИ */
      '<section class="section"><div class="container">' +
      sectionHead('sparkles', 'Свежее', '#38BDF8', 'Недавно вышедшие игры', 'Самые свежие релизы каталога — успейте пройти раньше друзей.',
        '<a class="link-more" href="#/catalog?sort=new">Все новинки ' + icon('arrowR') + '</a>') +
      '<div class="cards-grid">' + fresh.map(function (g, i) { return gameCard(g, i); }).join('') + '</div>' +
      '</div></section>' +

      /* ВЫБОР РЕДАКЦИИ */
      '<section class="section"><div class="container">' +
      sectionHead('crown', 'Кураторы', '#E879F9', 'Выбор редакции', 'Три игры, за которые команда GameHub ручается лично.') +
      '<div class="editor-grid">' + editors.map(function (g, i) {
        return '<a class="ed-card reveal' + (i === 0 ? ' big' : '') + '" ' + delay(i) + ' href="#/game/' + g.id + '">' +
          coverBlock(g, '', { src: capsule(g) }) + '<span class="ed-scrim"></span>' +
          '<span class="ed-body"><span class="ed-badge">' + icon('crown') + 'Выбор редакции</span>' +
          '<span class="ed-quote">' + esc(g.editor || g.short) + '</span>' +
          '<span class="ed-meta"><b>' + esc(g.title) + '</b><span>' + esc(g.genres.join(' · ')) + '</span>' + ratingPill(g) + '</span></span>' +
          '</a>';
      }).join('') + '</div></div></section>' +

      /* ПОПУЛЯРНЫЕ ЖАНРЫ */
      '<section class="section"><div class="container">' +
      sectionHead('chart', 'Аналитика каталога', '#A3E635', 'Популярные жанры', 'Что представлено в каталоге — нажмите на жанр, чтобы открыть подборку.') +
      '<div class="genre-bars">' + genreCounts.map(function (x, i) {
        return '<a class="genre-bar reveal" ' + delay(i) + ' style="--gc:' + x.m.color + ';--gc2:' + hexA(x.m.color, .55) + ';--gcs:' + hexA(x.m.color, .35) + '" href="#/catalog?genre=' + x.m.id + '">' +
          '<span class="gb-name">' + icon(x.m.icon) + x.m.id + '</span>' +
          '<span class="gb-track"><i class="gb-fill" style="--w:' + Math.round(x.n / maxCount * 100) + '%"></i></span>' +
          '<span class="gb-count">' + x.n + '</span></a>';
      }).join('') + '</div></div></section>' +

      /* СТОИТ ПОПРОБОВАТЬ */
      '<section class="section"><div class="container">' +
      sectionHead('gem', 'Скрытые жемчужины', '#2DD4BF', 'Игры, которые стоит попробовать', 'Не самые громкие, но точно незабываемые.',
        '<button class="btn ghost sm" data-action="random-game">' + icon('dice') + 'Выбери игру за меня</button>') +
      '<div class="gems-grid">' + gems.map(function (g, i) {
        return '<div class="gem-row reveal" ' + delay(i) + '>' +
          '<a class="gem-thumb img-wrap" href="#/game/' + g.id + '">' + imgTag(cover(g), g.title, '', { game: g }) + '</a>' +
          '<div class="gem-info"><b>' + esc(g.title) + '</b><p class="gem-reason"><em>Почему:</em> ' + esc(g.gem || g.short) + '</p>' +
          '<div style="margin-top:8px">' + starsHTML(g.rating) + '</div></div>' +
          '<div class="gem-actions">' + favBtn(g) + libBtn(g) + '</div></div>';
      }).join('') + '</div></div></section>';

    /* ПЕРСОНАЛЬНЫЕ РЕКОМЕНДАЦИИ */
    if (reco.length) {
      html += '<section class="section"><div class="container">' +
        sectionHead('user', 'Для вас', '#8B5CF6', 'Подобрано для вас',
          'На основе ваших жанров: ' + basis.map(function (b) { return genreChip(b); }).join(' '), rowNav('rowReco')) +
        hRow('rowReco', 'row-cards', reco.map(function (g, i) { return gameCard(g, i); }).join('')) +
        '</div></section>';
    } else {
      html += '<section class="section"><div class="container">' +
        sectionHead('user', 'Для вас', '#8B5CF6', 'Подобрано для вас') +
        emptyState('sparkles', 'Рекомендации скоро появятся',
          'Добавьте пару игр в избранное или библиотеку — и GameHub подберёт похожие миры именно для вас.',
          '<a class="btn primary" href="#/catalog">' + icon('compass') + 'Выбрать первые игры</a>') +
        '</div></section>';
    }

    /* НЕДАВНО ПРОСМОТРЕННЫЕ */
    if (recentGames.length) {
      html += '<section class="section"><div class="container">' +
        sectionHead('clock', 'История', '#60A5FA', 'Недавно просмотренные', 'Вернитесь к мирам, которые уже зацепили взгляд.', rowNav('rowRecent')) +
        hRow('rowRecent', 'row-mini', recentGames.map(function (g) { return miniCard(g, true); }).join('')) +
        '</div></section>';
    }

    /* CTA */
    html += '<section class="section"><div class="container">' +
      '<div class="cta-panel reveal">' +
      '<span class="cta-float c1">' + icon('ghost') + '</span><span class="cta-float c2">' + icon('dice') + '</span><span class="cta-float c3">' + icon('rocket') + '</span>' +
      '<div class="cta-inner"><h2 class="cta-title">Исследуй новые <span class="grad-text">игровые миры</span></h2>' +
      '<p class="cta-desc">' + GAMES.length + ' игр, ' + GENRES.length + ' жанров и бесконечные поводы сказать «ещё пять минут». Собери свою библиотеку мечты — GameHub запомнит всё.</p>' +
      '<div class="cta-actions"><a class="btn primary lg" href="#/catalog">' + icon('compass') + 'В каталог</a>' +
      '<button class="btn secondary lg" data-action="random-game">' + icon('dice') + 'Выбери игру за меня</button></div>' +
      '</div></div></div></section>';
    return html;
  }

  /* ---------- Каталог ---------- */
  function filtersHTML() {
    var f = state.catalog;
    return '<div class="filters-head"><b>Фильтры</b><button class="icon-btn filters-x" data-action="filters-close" aria-label="Закрыть фильтры">' + icon('x') + '</button></div>' +
      '<div class="filters-scroll">' +
      '<div class="f-group"><div class="f-title">Жанр</div><div class="f-opts">' + GENRES.map(function (m) {
        var n = GAMES.filter(function (g) { return g.genres.indexOf(m.id) > -1; }).length;
        return '<label class="f-check"><input type="checkbox" data-change="filter-genre" value="' + m.id + '"' + (f.genres.has(m.id) ? ' checked' : '') + '>' +
          '<span class="box">' + icon('check') + '</span><span class="f-label"><i class="dot" style="--gc:' + m.color + '"></i>' + m.id + '</span><span class="f-count">' + n + '</span></label>';
      }).join('') + '</div></div>' +
      '<div class="f-group"><div class="f-title">Год выпуска</div><div class="f-years">' +
      '<span class="f-select"><select data-change="filter-year-min" aria-label="Год от">' +
      '<option value="">От</option>' + YEARS.map(function (y) { return '<option value="' + y + '"' + (f.yearMin === y ? ' selected' : '') + '>' + y + '</option>'; }).join('') + '</select></span>' +
      '<span class="f-select"><select data-change="filter-year-max" aria-label="Год до">' +
      '<option value="">До</option>' + YEARS.map(function (y) { return '<option value="' + y + '"' + (f.yearMax === y ? ' selected' : '') + '>' + y + '</option>'; }).join('') + '</select></span>' +
      '</div></div>' +
      '<div class="f-group"><div class="f-title">Платформа</div><div class="f-opts">' + PLATFORMS.map(function (p) {
        return '<label class="f-check"><input type="checkbox" data-change="filter-platform" value="' + p.id + '"' + (f.platforms.has(p.id) ? ' checked' : '') + '>' +
          '<span class="box">' + icon('check') + '</span><span class="f-label">' + icon(p.icon) + esc(p.label) + '</span></label>';
      }).join('') + '</div></div>' +
      '<div class="f-group"><div class="f-title">Оценка сообщества</div><div class="f-chips">' +
      [['0', 'Любая'], ['3.5', '3.5+'], ['4', '4.0+'], ['4.5', '4.5+']].map(function (r) {
        return '<button class="f-chip' + (f.rating === +r[0] ? ' active' : '') + '" data-action="rating-set" data-rating="' + r[0] + '">' + r[1] + '</button>';
      }).join('') + '</div></div>' +
      '<div class="f-group"><div class="f-title">Разработчик</div><span class="f-select"><select data-change="filter-dev" aria-label="Разработчик">' +
      '<option value="">Все студии</option>' + DEVS.map(function (d) { return '<option value="' + esc(d) + '"' + (f.dev === d ? ' selected' : '') + '>' + esc(d) + '</option>'; }).join('') +
      '</select></span></div></div>' +
      '<div class="filters-foot"><button class="btn ghost sm block" data-action="filters-reset" id="filtersReset">' + icon('undo') + 'Сбросить фильтры</button>' +
      '<button class="btn primary block filters-apply" data-action="filters-close" id="filtersApply">Показать игры</button></div>';
  }
  function CatalogView() {
    var f = state.catalog;
    return '<div class="page-head"><div class="container">' +
      '<span class="kicker" style="--kc:#38BDF8">' + icon('grid') + 'Каталог</span>' +
      '<h1 class="page-title">Каталог игр</h1>' +
      '<p class="page-sub">' + GAMES.length + ' ' + plural(GAMES.length, ['игра', 'игры', 'игр']) + ' · демо-каталог с оценками сообщества · фильтры работают совместно</p>' +
      '</div></div>' +
      '<div class="container"><div class="catalog-layout">' +
      '<aside class="filters" id="filtersPanel" aria-label="Фильтры каталога">' + filtersHTML() + '</aside>' +
      '<div class="filters-backdrop" id="filtersBackdrop" data-action="filters-close"></div>' +
      '<div class="catalog-results">' +
      '<div class="cat-toolbar">' +
      '<div class="cat-search">' + icon('search') +
      '<input id="catSearch" data-input="catalog-search" placeholder="Поиск по названию, жанру, студии…" value="' + esc(f.q) + '" autocomplete="off">' +
      '<button class="cat-clear' + (f.q ? '' : ' hidden') + '" data-action="catalog-search-clear" aria-label="Очистить поиск">' + icon('x') + '</button></div>' +
      '<div class="cat-tools">' +
      '<button class="btn ghost sm filters-btn" data-action="filters-toggle">' + icon('filter') + 'Фильтры<span class="f-active-count" id="fActiveCount" hidden></span></button>' +
      '<div class="dd sort-dd"><button class="btn ghost sm" data-action="dd-toggle" aria-expanded="false">' + icon('sliders') + '<span id="sortLabel">' + esc(sortLabel(f.sort)) + '</span>' + icon('chevD') + '</button>' +
      '<div class="dd-menu">' + SORTS.map(function (s) {
        return '<button class="dd-item' + (f.sort === s.id ? ' checked' : '') + '" data-action="sort-set" data-sort="' + s.id + '">' + icon(s.icon) + esc(s.label) + '<span class="dd-check">' + icon('check') + '</span></button>';
      }).join('') + '</div></div>' +
      '<div class="view-toggle" role="group" aria-label="Вид отображения">' +
      '<button class="' + (f.view === 'grid' ? 'active' : '') + '" data-action="view-set" data-view="grid" aria-label="Сетка карточек" title="Сетка">' + icon('grid') + '</button>' +
      '<button class="' + (f.view === 'list' ? 'active' : '') + '" data-action="view-set" data-view="list" aria-label="Компактный список" title="Список">' + icon('list') + '</button></div>' +
      '<button class="icon-btn" data-action="random-game" title="Выбери игру за меня" aria-label="Случайная игра">' + icon('dice') + '</button>' +
      '</div></div>' +
      '<div class="cat-status"><span id="catCount"></span><div class="active-chips" id="catChips"></div></div>' +
      '<div id="catGrid"></div>' +
      '</div></div></div>';
  }
  function sortGames(list, sort) {
    var s = list.slice();
    switch (sort) {
      case 'rating': s.sort(function (a, b) { return b.rating - a.rating || b.popularity - a.popularity; }); break;
      case 'title': s.sort(function (a, b) { return a.title.localeCompare(b.title, 'ru'); }); break;
      case 'year': s.sort(function (a, b) { return b.year - a.year || b.popularity - a.popularity; }); break;
      case 'new': s.sort(function (a, b) { return new Date(b.released) - new Date(a.released); }); break;
      case 'old': s.sort(function (a, b) { return new Date(a.released) - new Date(b.released); }); break;
      default: s.sort(function (a, b) { return b.popularity - a.popularity; });
    }
    return s;
  }
  function filteredGames() {
    var f = state.catalog;
    var list = GAMES.filter(function (g) {
      if (f.q && !paletteMatch(g, f.q)) return false;
      if (f.genres.size && !g.genres.some(function (x) { return f.genres.has(x); })) return false;
      if (f.platforms.size && !g.platforms.some(function (x) { return f.platforms.has(x); })) return false;
      if (f.yearMin && g.year < f.yearMin) return false;
      if (f.yearMax && g.year > f.yearMax) return false;
      if (f.rating && g.rating < f.rating) return false;
      if (f.dev && g.dev !== f.dev) return false;
      return true;
    });
    return sortGames(list, f.sort);
  }
  function activeFilterCount() {
    var f = state.catalog;
    return f.genres.size + f.platforms.size + (f.yearMin ? 1 : 0) + (f.yearMax ? 1 : 0) + (f.rating ? 1 : 0) + (f.dev ? 1 : 0) + (f.q ? 1 : 0);
  }
  function activeChipsHTML() {
    var f = state.catalog, chips = [];
    function chip(kind, value, label) {
      return '<span class="a-chip">' + esc(label) + '<button data-action="filter-chip-remove" data-kind="' + kind + '" data-value="' + esc(value) + '" aria-label="Убрать фильтр">' + icon('x') + '</button></span>';
    }
    if (f.q) chips.push(chip('q', '', '«' + f.q + '»'));
    f.genres.forEach(function (g) { chips.push(chip('genre', g, g)); });
    f.platforms.forEach(function (p) {
      var m = PLATFORMS.find(function (x) { return x.id === p; });
      chips.push(chip('platform', p, m ? m.label : p));
    });
    if (f.yearMin) chips.push(chip('yearMin', '', 'с ' + f.yearMin));
    if (f.yearMax) chips.push(chip('yearMax', '', 'по ' + f.yearMax));
    if (f.rating) chips.push(chip('rating', '', f.rating.toFixed(1) + '+'));
    if (f.dev) chips.push(chip('dev', '', f.dev));
    if (chips.length) chips.push('<button class="a-chip reset" data-action="filters-reset">Сбросить всё</button>');
    return chips.join('');
  }
  function renderCatalogResults() {
    var grid = qs('#catGrid'); if (!grid) return;
    var f = state.catalog;
    var list = filteredGames();
    grid.className = f.view === 'grid' ? 'cards-grid' : 'cards-list';
    grid.innerHTML = list.length
      ? list.map(function (g, i) { return f.view === 'grid' ? gameCard(g, i) : listRow(g, i); }).join('')
      : emptyState('filter', 'Ничего не найдено', 'Попробуйте смягчить фильтры или изменить поисковый запрос — в каталоге точно есть что-то для вас.',
        '<button class="btn primary" data-action="filters-reset">' + icon('undo') + 'Сбросить фильтры</button>');
    var cnt = qs('#catCount');
    if (cnt) cnt.innerHTML = 'Найдено: <b>' + list.length + '</b> ' + plural(list.length, ['игра', 'игры', 'игр']);
    var chips = qs('#catChips'); if (chips) chips.innerHTML = activeChipsHTML();
    var reset = qs('#filtersReset'); if (reset) reset.disabled = !activeFilterCount();
    var apply = qs('#filtersApply'); if (apply) apply.textContent = 'Показать ' + list.length + ' ' + plural(list.length, ['игру', 'игры', 'игр']);
    var fc = qs('#fActiveCount');
    if (fc) { var n = activeFilterCount(); fc.textContent = n; fc.hidden = !n; }
    var clr = qs('.cat-clear'); if (clr) clr.classList.toggle('hidden', !f.q);
    setupReveal();
  }
  function syncFilterInputs() {
    var f = state.catalog;
    qsa('[data-change="filter-genre"]').forEach(function (c) { c.checked = f.genres.has(c.value); });
    qsa('[data-change="filter-platform"]').forEach(function (c) { c.checked = f.platforms.has(c.value); });
    var ymin = qs('[data-change="filter-year-min"]'); if (ymin) ymin.value = f.yearMin || '';
    var ymax = qs('[data-change="filter-year-max"]'); if (ymax) ymax.value = f.yearMax || '';
    var dev = qs('[data-change="filter-dev"]'); if (dev) dev.value = f.dev;
    qsa('[data-action="rating-set"]').forEach(function (b) { b.classList.toggle('active', +b.getAttribute('data-rating') === f.rating); });
    var input = qs('#catSearch'); if (input && input.value !== f.q) input.value = f.q;
  }
  function resetFilters() {
    var f = state.catalog;
    f.q = ''; f.genres.clear(); f.platforms.clear(); f.yearMin = null; f.yearMax = null; f.rating = 0; f.dev = '';
    syncFilterInputs(); renderCatalogResults();
    toast('Фильтры сброшены', { type: 'info' });
  }
  function applyCatalogParams(params) {
    if (!Object.keys(params).length) return; // без параметров сохраняем прошлые фильтры
    var f = state.catalog;
    f.q = params.q || ''; f.dev = params.dev || '';
    f.genres = new Set(params.genre && genreById[params.genre] ? [params.genre] : []);
    f.platforms = new Set(); f.yearMin = null; f.yearMax = null; f.rating = 0;
    if (params.sort && SORTS.some(function (s) { return s.id === params.sort; })) f.sort = params.sort;
  }

  /* ---------- Популярное ---------- */
  function PopularView() {
    var top = sortGames(GAMES, 'popularity').slice(0, 12);
    return '<div class="page-head"><div class="container">' +
      '<span class="kicker" style="--kc:#FB923C">' + icon('fire') + 'Рейтинг</span>' +
      '<h1 class="page-title">Популярное</h1>' +
      '<p class="page-sub">Топ-12 каталога по индексу популярности. Индекс и оценки — демонстрационные данные GameHub.</p>' +
      '</div></div>' +
      '<div class="container">' +
      '<div class="podium">' + top.slice(0, 3).map(function (g, i) { return portraitCard(g, i); }).join('') + '</div>' +
      '<div class="rank-list">' + top.slice(3).map(function (g, i) { return rankRow(g, i + 4); }).join('') + '</div>' +
      '<div style="text-align:center;margin:36px 0 20px"><a class="btn secondary" href="#/catalog">' + icon('grid') + 'Открыть весь каталог</a></div>' +
      '</div>';
  }

  /* ---------- Избранное ---------- */
  function FavoritesView() {
    var list = Array.from(favs).map(function (id) { return byId[id]; });
    return '<div class="page-head"><div class="container">' +
      '<span class="kicker" style="--kc:#FB7185">' + icon('heart') + 'Коллекция</span>' +
      '<div class="sec-head" style="margin-bottom:0"><div><h1 class="page-title">Избранное</h1>' +
      '<p class="page-sub">' + (list.length ? list.length + ' ' + plural(list.length, ['игра', 'игры', 'игр']) + ' в вашей коллекции сердец' : 'Здесь живут игры, которые тронули сердце') + '</p></div>' +
      (list.length ? '<div class="sec-head-actions"><button class="btn ghost sm" data-action="clear-favs">' + icon('trash') + 'Очистить всё</button><a class="btn primary sm" href="#/catalog">' + icon('plus') + 'Добавить ещё</a></div>' : '') +
      '</div></div></div>' +
      '<div class="container" style="padding-top:26px;padding-bottom:40px">' +
      (list.length
        ? '<div class="cards-grid">' + list.map(function (g, i) { return gameCard(g, i); }).join('') + '</div>'
        : emptyState('heart', 'В избранном пока пусто',
          'Нажмите на сердечко на любой карточке — и игра навсегда поселится здесь. Коллекция сохранится даже после перезагрузки.',
          '<a class="btn primary lg" href="#/catalog">' + icon('compass') + 'Найти первую любовь</a>')) +
      '</div>';
  }

  /* ---------- Библиотека ---------- */
  function libFiltered() {
    var q = state.libQuery.toLowerCase();
    return Object.keys(lib)
      .filter(function (id) { return state.libTab === 'all' || lib[id].status === state.libTab; })
      .filter(function (id) { return !q || byId[id].title.toLowerCase().indexOf(q) > -1 || byId[id].dev.toLowerCase().indexOf(q) > -1; })
      .sort(function (a, b) { return lib[b].addedAt - lib[a].addedAt; })
      .map(function (id) { return byId[id]; });
  }
  function LibraryView() {
    var counts = { all: Object.keys(lib).length };
    STATUSES.forEach(function (s) {
      counts[s.id] = Object.keys(lib).filter(function (id) { return lib[id].status === s.id; }).length;
    });
    var list = libFiltered();
    var emptyTexts = {
      all: ['Библиотека пока пуста', 'Добавляйте игры кнопкой «+» на карточках или со страницы игры — и отслеживайте свой прогресс от «Хочу сыграть» до «Пройдено».'],
      want: ['Список желаний пуст', 'Здесь будут игры, которые вы планируете пройти. Нажмите «+» на любой карточке каталога.'],
      playing: ['Сейчас вы ничего не проходите', 'Переведите игру в статус «Играю» — и она появится в этом разделе.'],
      done: ['Пока нет пройденных игр', 'Каждая великая коллекция начинается с первого титра. У вас всё впереди!'],
      dropped: ['Отложенных игр нет', 'И это отлично — значит, всё начатое доведено до конца.']
    };
    var et = emptyTexts[state.libTab] || emptyTexts.all;
    return '<div class="page-head"><div class="container">' +
      '<span class="kicker" style="--kc:#38BDF8">' + icon('book') + 'Прогресс</span>' +
      '<h1 class="page-title">Моя библиотека</h1>' +
      '<p class="page-sub">Личный трекер прохождений. Статусы, счётчики и поиск — всё сохраняется локально.</p>' +
      '</div></div>' +
      '<div class="container" style="padding-bottom:40px">' +
      '<div class="lib-stats">' + STATUSES.map(function (s) {
        return '<button class="lib-stat reveal' + (state.libTab === s.id ? ' active' : '') + '" style="--sc:' + s.color + ';--scs:' + hexA(s.color, .13) + ';--scb:' + hexA(s.color, .45) + '" data-action="lib-tab" data-tab="' + s.id + '">' +
          '<span class="lib-stat-ic">' + icon(s.icon) + '</span><span><b>' + counts[s.id] + '</b><span>' + esc(s.label) + '</span></span></button>';
      }).join('') + '</div>' +
      '<div class="lib-toolbar">' +
      '<div class="tabs" role="tablist">' +
      '<button class="tab' + (state.libTab === 'all' ? ' active' : '') + '" data-action="lib-tab" data-tab="all">Все<span class="t-count">' + counts.all + '</span></button>' +
      STATUSES.map(function (s) {
        return '<button class="tab' + (state.libTab === s.id ? ' active' : '') + '" data-action="lib-tab" data-tab="' + s.id + '">' + esc(s.label) + '<span class="t-count">' + counts[s.id] + '</span></button>';
      }).join('') + '</div>' +
      '<div class="lib-search">' + icon('search') + '<input data-input="library-search" placeholder="Поиск по библиотеке…" value="' + esc(state.libQuery) + '"></div>' +
      '</div>' +
      (list.length
        ? '<div class="cards-grid">' + list.map(function (g, i) { return gameCard(g, i, 'library'); }).join('') + '</div>'
        : (state.libQuery
          ? emptyState('search', 'Не найдено в библиотеке', 'По запросу «' + state.libQuery + '» ничего нет в разделе «' + (state.libTab === 'all' ? 'Все' : statusById[state.libTab].label) + '».', '<a class="btn primary" href="#/catalog">' + icon('plus') + 'Пополнить библиотеку</a>')
          : emptyState('book', et[0], et[1], '<a class="btn primary" href="#/catalog">' + icon('plus') + 'Добавить игры</a>'))) +
      '</div>';
  }

  /* ---------- Страница игры ---------- */
  function libActionHTML(g) {
    var entry = lib[g.id];
    if (!entry) {
      return '<button class="btn primary" data-action="lib-add" data-id="' + g.id + '" data-lib-btn="' + g.id + '">' + icon('plus') + 'Добавить в библиотеку</button>';
    }
    var st = statusById[entry.status];
    return '<div class="dd status-dd" style="--sc:' + st.color + ';--scs:' + hexA(st.color, .14) + ';--scb:' + hexA(st.color, .45) + '">' +
      '<button class="status-pill" style="padding:12px 18px;font-size:.9rem" data-action="dd-toggle" aria-expanded="false"><i class="dot"></i>' + esc(st.label) + icon('chevD') + '</button>' +
      '<div class="dd-menu dd-status">' +
      '<div class="dd-label">Статус в библиотеке</div>' +
      STATUSES.map(function (s) {
        return '<button class="dd-item' + (s.id === st.id ? ' checked' : '') + '" style="--sc:' + s.color + '" data-action="lib-status" data-id="' + g.id + '" data-status="' + s.id + '"><i class="dot"></i>' + esc(s.label) + '<span class="dd-check">' + icon('check') + '</span></button>';
      }).join('') + '<div class="dd-hr"></div>' +
      '<button class="dd-item danger" data-action="lib-remove" data-id="' + g.id + '">' + icon('trash') + 'Удалить из библиотеки</button></div></div>';
  }
  function specsHTML(g) {
    var t = D.SPEC_TIERS[g.tier] || D.SPEC_TIERS.mid;
    function row(label, min, rec) { return '<tr><th>' + label + '</th><td>' + esc(min) + '</td><td>' + esc(rec) + '</td></tr>'; }
    return '<p class="specs-note">Ориентировочные требования для демо-каталога (Windows, 64-bit).</p>' +
      '<table class="specs-table"><thead><tr><th></th><th>Минимальные</th><th>Рекомендуемые</th></tr></thead><tbody>' +
      row('ОС', 'Windows 10 64-bit', 'Windows 10/11 64-bit') +
      row('Процессор', t.min.cpu, t.rec.cpu) +
      row('Память', t.min.ram, t.rec.ram) +
      row('Видеокарта', t.min.gpu, t.rec.gpu) +
      row('DirectX', t.min.dx, t.rec.dx) +
      row('Место на диске', '≈ ' + g.storage + ' ГБ', '≈ ' + g.storage + ' ГБ (SSD)') +
      '</tbody></table>';
  }
  function trailerHTML(g) {
    if (g.trailer) {
      return '<div class="trailer-frame" id="trailerFrame">' +
        '<button class="trailer-facade" data-action="trailer-play" data-id="' + g.id + '" aria-label="Смотреть трейлер">' +
        '<span class="img-wrap">' + imgTag('https://i.ytimg.com/vi/' + g.trailer + '/hqdefault.jpg', g.title + ' — трейлер', '', { game: g, fallbackSrc: bgArt(g) }) + '</span>' +
        '<span class="trailer-play">' + icon('play') + '</span></button></div>' +
        '<div class="trailer-links"><a class="btn ghost sm" href="https://www.youtube.com/watch?v=' + g.trailer + '" target="_blank" rel="noopener">' + icon('youtube') + 'Открыть на YouTube' + icon('external') + '</a></div>';
    }
    return '<div class="trailer-frame"><div class="trailer-none">' + icon('youtube') +
      '<p><b style="color:var(--text)">Трейлер пока не добавлен</b><br>Мы бережём вас от случайных видео — найдите официальный трейлер на YouTube.</p>' +
      '<a class="btn secondary sm" href="https://www.youtube.com/results?search_query=' + encodeURIComponent(g.title + ' official trailer') + '" target="_blank" rel="noopener">' + icon('search') + 'Найти трейлер на YouTube</a></div></div>';
  }
  function playTrailer(id) {
    var g = byId[id]; if (!g || !g.trailer) return;
    var frame = qs('#trailerFrame'); if (!frame || frame.getAttribute('data-playing')) return;
    frame.setAttribute('data-playing', '1');
    frame.innerHTML = '<div class="trailer-loading" id="trailerLoading"><div class="spinner"></div></div>' +
      '<iframe id="trailerIframe" src="https://www.youtube-nocookie.com/embed/' + g.trailer + '?autoplay=1&rel=0" title="' + esc(g.title) + ' — трейлер" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
    var ifr = qs('#trailerIframe');
    if (ifr) ifr.addEventListener('load', function () { var l = qs('#trailerLoading'); if (l) l.remove(); });
    setTimeout(function () { var l = qs('#trailerLoading'); if (l) l.remove(); }, 6000);
  }
  function GameView(g) {
    var media = mediaList(g);
    var similar = similarGames(g);
    var devGames = GAMES.filter(function (x) { return x.dev === g.dev && x.id !== g.id; }).slice(0, 4);
    var on = favs.has(g.id);
    return '<section class="game-hero">' +
      '<div class="game-hero-bg">' + coverBlock(g, '', { src: bgArt(g), eager: true }) + '<div class="game-hero-scrim"></div></div>' +
      '<div class="container">' +
      '<a class="back-link" href="#/catalog">' + icon('chevL') + 'Назад в каталог</a>' +
      '<div class="game-hero-badges">' + (isNew(g) ? '<span class="badge-new">NEW</span>' : '') + ageBadge(g) + genreChips(g, 3, true) + '</div>' +
      '<h1 class="game-title">' + esc(g.title) + '</h1>' +
      '<div class="game-meta-row"><span>' + g.year + '</span><span class="sep">·</span><span>' + esc(g.dev) + '</span><span class="sep">·</span>' + platformIcons(g) + '</div>' +
      '<div class="game-rating-row">' + starsHTML(g.rating) + '<span class="game-rating-val">' + g.rating.toFixed(1) + '</span>' +
      '<span class="demo-note">демо-оценка сообщества</span><span class="demo-note">индекс популярности: ' + g.popularity + '/100</span></div>' +
      '<div class="game-actions">' +
      '<button class="btn secondary fav-big' + (on ? ' active' : '') + '" data-action="fav-toggle" data-id="' + g.id + '" data-fav-btn="' + g.id + '" aria-pressed="' + on + '">' + icon('heart') + '<span data-fav-label>' + (on ? 'В избранном' : 'В избранное') + '</span></button>' +
      '<span id="libAction" style="display:inline-flex">' + libActionHTML(g) + '</span>' +
      '<button class="btn ghost" data-action="trailer-jump" data-id="' + g.id + '">' + icon('play') + 'Смотреть трейлер</button>' +
      '<button class="icon-btn' + (compare.indexOf(g.id) > -1 ? ' active' : '') + '" style="' + (compare.indexOf(g.id) > -1 ? 'color:var(--accent2);border-color:rgba(var(--accent2-rgb),.55)' : '') + '" data-action="compare-toggle" data-id="' + g.id + '" data-compare-btn="' + g.id + '" title="Добавить к сравнению" aria-label="Сравнить">' + icon('compare') + '</button>' +
      '<button class="icon-btn" data-action="share" data-id="' + g.id + '" title="Поделиться ссылкой" aria-label="Поделиться">' + icon('share') + '</button>' +
      '</div></div></section>' +
      '<div class="container"><div class="game-layout">' +
      '<div class="game-main">' +
      '<div class="game-block reveal"><h3>' + icon('book') + 'Об игре</h3><p class="game-desc">' + esc(g.full) + '</p>' +
      '<div class="game-tags">' + g.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div></div>' +
      '<div class="game-block reveal"><h3>' + icon('eye') + 'Галерея</h3>' +
      '<p class="specs-note">Официальные арт-материалы Steam. Нажмите, чтобы открыть просмотр.</p>' +
      '<div class="gallery-grid">' + media.map(function (m, i) {
        return '<button class="gal-thumb" data-action="lightbox-open" data-id="' + g.id + '" data-index="' + i + '" aria-label="Открыть: ' + esc(m.label) + '">' +
          '<span class="img-wrap">' + imgTag(m.url, g.title + ' — ' + m.label, '', { game: g }) + '</span>' +
          '<span class="gal-label">' + esc(m.label) + '</span><span class="gal-zoom">' + icon('zoom') + '</span></button>';
      }).join('') + '</div></div>' +
      '<div class="game-block reveal" id="trailerBlock"><h3>' + icon('youtube') + 'Трейлер</h3>' + trailerHTML(g) + '</div>' +
      '<div class="game-block reveal"><h3>' + icon('cpu') + 'Системные требования</h3>' + specsHTML(g) + '</div>' +
      '</div>' +
      '<aside class="game-side">' +
      '<div class="side-card reveal">' + coverBlock(g, 'side-cover', { eager: true }) +
      '<div class="side-rows">' +
      '<div class="side-row"><span class="k">Разработчик</span><span class="v"><a href="#/catalog?dev=' + encodeURIComponent(g.dev) + '">' + esc(g.dev) + '</a></span></div>' +
      '<div class="side-row"><span class="k">Издатель</span><span class="v">' + esc(g.pub) + '</span></div>' +
      '<div class="side-row"><span class="k">Дата выхода</span><span class="v">' + fmtDate(g.released) + '</span></div>' +
      '<div class="side-row"><span class="k">Платформы</span><span class="v">' + platformIcons(g) + '</span></div>' +
      '<div class="side-row"><span class="k">Жанры</span><span class="v"><span class="side-genres">' + genreChips(g, 3, true) + '</span></span></div>' +
      '<div class="side-row"><span class="k">Возраст</span><span class="v">' + ageBadge(g) + '</span></div>' +
      '<div class="side-row"><span class="k">Размер</span><span class="v">≈ ' + g.storage + ' ГБ</span></div>' +
      '</div></div>' +
      (devGames.length ? '<div class="side-block reveal"><h4>Ещё от ' + esc(g.dev) + '</h4>' + devGames.map(function (x) {
        return '<a class="side-mini" href="#/game/' + x.id + '">' + coverBlock(x, '') + '<span><b>' + esc(x.title) + '</b><span>' + x.year + ' · ' + esc(x.genres[0]) + '</span></span></a>';
      }).join('') + '</div>' : '') +
      '</aside></div>' +
      '<section class="section" style="padding-top:14px">' +
      sectionHead('sparkles', 'Похожие миры', '#A78BFA', 'Похожие игры', 'Подобрано по жанрам, студии и оценкам.', rowNav('rowSimilar')) +
      hRow('rowSimilar', 'row-cards', similar.map(function (x, i) { return gameCard(x, i); }).join('')) +
      '</section></div>';
  }
  function NotFoundView() {
    return '<div class="page-head"><div class="container"></div></div><div class="container">' +
      emptyState('ghost', 'Игра не найдена', 'Возможно, ссылка устарела или игра ещё не добралась до нашего каталога. Зато там есть ' + GAMES.length + ' других миров.',
        '<a class="btn primary lg" href="#/catalog">' + icon('compass') + 'Вернуться в каталог</a>') + '</div>';
  }

  /* ================= Роутер ================= */
  function parseRoute() {
    var raw = (location.hash || '#/').replace(/^#/, '');
    var parts = raw.split('?');
    var params = {};
    try { new URLSearchParams(parts[1] || '').forEach(function (v, k) { params[k] = v; }); } catch (e) { /* noop */ }
    var seg = parts[0].split('/').filter(Boolean);
    if (!seg.length) return { name: 'home', params: params };
    if (seg[0] === 'game' && seg[1]) return { name: 'game', id: decodeURIComponent(seg[1]), params: params };
    if (['catalog', 'popular', 'favorites', 'library'].indexOf(seg[0]) > -1) return { name: seg[0], params: params };
    return { name: 'home', params: params };
  }
  function navigateTo(hash) {
    if (location.hash === hash) renderRoute();
    else location.hash = hash;
  }
  function teardownView() {
    if (state.heroTimer) { clearInterval(state.heroTimer); state.heroTimer = null; }
    state.heroWrap = null;
    if (state.io) { state.io.disconnect(); state.io = null; }
  }
  function renderRoute(opts) {
    opts = opts || {};
    var y = window.scrollY;
    teardownView();
    closeAllModals(); closeAllDD(); setMobile(false); setFilters(false);
    var r = parseRoute();
    state.route = r;
    var view = qs('#view'); if (!view) return;
    var title = 'GameHub — открой свой следующий игровой мир';
    switch (r.name) {
      case 'catalog':
        applyCatalogParams(r.params);
        view.innerHTML = CatalogView();
        renderCatalogResults();
        title = 'Каталог игр — GameHub';
        break;
      case 'popular':
        view.innerHTML = PopularView();
        title = 'Популярное — GameHub';
        break;
      case 'favorites':
        view.innerHTML = FavoritesView();
        title = 'Избранное — GameHub';
        break;
      case 'library':
        view.innerHTML = LibraryView();
        title = 'Моя библиотека — GameHub';
        break;
      case 'game':
        var g = byId[r.id];
        view.innerHTML = g ? GameView(g) : NotFoundView();
        if (g) { trackView(g.id); title = g.title + ' — GameHub'; }
        else title = 'Игра не найдена — GameHub';
        break;
      default:
        view.innerHTML = HomeView();
        afterHome();
    }
    document.title = title;
    var navName = r.name === 'game' ? 'catalog' : r.name;
    qsa('[data-nav]').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-nav') === navName); });
    if (opts.keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
    if (opts.animate !== false && !reduced()) {
      view.classList.remove('view-anim'); void view.offsetWidth; view.classList.add('view-anim');
    }
    setupReveal(); setupRows(); syncBadges(); renderTray(); renderMobileMenu();
  }

  /* ================= Reveal / ряды / hero ================= */
  function setupReveal() {
    if (state.io) state.io.disconnect();
    var els = qsa('#view .reveal:not(.in)');
    if (reduced() || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    state.io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); state.io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.05 });
    els.forEach(function (el) { state.io.observe(el); });
  }
  function updateRowNav(row) {
    var wrap = row.closest('.row-wrap'); if (!wrap) return;
    var max = row.scrollWidth - row.clientWidth - 2;
    wrap.classList.toggle('can-l', row.scrollLeft > 4);
    wrap.classList.toggle('can-r', row.scrollLeft < max);
    qsa('[data-action="row-scroll"][data-target="' + row.id + '"]').forEach(function (b) {
      var dir = +b.getAttribute('data-dir');
      b.classList.toggle('off', dir < 0 ? row.scrollLeft <= 4 : row.scrollLeft >= max);
    });
  }
  function setupRows() {
    qsa('#view .h-row').forEach(function (row) {
      updateRowNav(row);
      row.addEventListener('scroll', function () { requestAnimationFrame(function () { updateRowNav(row); }); }, { passive: true });
    });
  }
  function scrollRow(id, dir) {
    var row = qs('#' + id); if (!row) return;
    row.scrollBy({ left: dir * row.clientWidth * 0.85, behavior: smooth() });
  }
  function setHeroFeature(i, instant) {
    var feats = D.HERO_FEATURES.map(function (id) { return byId[id]; });
    var g = feats[i]; if (!g) return;
    var layers = [qs('#heroBgA'), qs('#heroBgB')];
    if (!layers[0] || !layers[1]) return;
    var active = layers[0].classList.contains('active') ? layers[0] : layers[1];
    var next = active === layers[0] ? layers[1] : layers[0];
    function apply() {
      next.style.backgroundImage = "url('" + heroArt(g) + "')";
      next.classList.add('active'); active.classList.remove('active');
      state.heroIndex = i;
      var chip = qs('#heroChip'), name = qs('#heroChipName');
      if (chip) chip.setAttribute('href', '#/game/' + g.id);
      if (name) name.textContent = g.title;
      qsa('.hero-dot').forEach(function (d, di) { d.classList.toggle('active', di === i); });
    }
    if (instant) { apply(); return; }
    var img = new Image();
    img.onload = apply;
    img.onerror = function () { /* оставляем текущий фон */ };
    img.src = heroArt(g);
  }
  function restartHeroTimer() {
    if (state.heroTimer) clearInterval(state.heroTimer);
    if (reduced()) return;
    state.heroTimer = setInterval(function () {
      if (document.hidden) return;
      setHeroFeature((state.heroIndex + 1) % D.HERO_FEATURES.length);
    }, 7000);
  }
  function afterHome() {
    var hero = qs('#hero'); if (!hero) return;
    state.heroWrap = qs('#heroBgWrap');
    state.heroIndex = 0;
    restartHeroTimer();
    // предзагрузка остальных фонов в простое
    var preload = function () {
      D.HERO_FEATURES.slice(1).forEach(function (id) { var im = new Image(); im.src = heroArt(byId[id]); });
    };
    if ('requestIdleCallback' in window) requestIdleCallback(preload, { timeout: 4000 });
    else setTimeout(preload, 2500);
    // лёгкий параллакс от курсора для парящих карточек
    if (window.matchMedia('(pointer: fine)').matches && !reduced()) {
      var raf = null, px = 0, py = 0;
      hero.addEventListener('pointermove', function (e) {
        var rect = hero.getBoundingClientRect();
        px = (e.clientX - rect.left) / rect.width - 0.5;
        py = (e.clientY - rect.top) / rect.height - 0.5;
        if (!raf) raf = requestAnimationFrame(function () {
          raf = null;
          hero.style.setProperty('--mx', px.toFixed(3));
          hero.style.setProperty('--my', py.toFixed(3));
        });
      });
    }
  }

  /* ================= Прокрутка страницы ================= */
  var scrollTick = false;
  function onScroll() {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(function () {
      scrollTick = false;
      var y = window.scrollY;
      var header = qs('#header'); if (header) header.classList.toggle('scrolled', y > 10);
      var top = qs('#toTop'); if (top) top.classList.toggle('show', y > 600);
      var ring = qs('#ringFg');
      if (ring) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var p = max > 0 ? Math.min(1, y / max) : 0;
        ring.style.strokeDashoffset = (106.8 * (1 - p)).toFixed(1);
      }
      if (state.heroWrap && !reduced() && window.innerWidth > 768 && y < window.innerHeight * 1.2) {
        state.heroWrap.style.transform = 'translate3d(0,' + (y * 0.22).toFixed(1) + 'px,0)';
      }
    });
  }

  /* ================= Обработка изображений ================= */
  function onImgLoad(e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG') return;
    img.classList.add('loaded');
    var wrap = img.closest('.img-wrap'); if (wrap) wrap.classList.add('done');
  }
  function onImgError(e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG' || img.dataset.fbDone) return;
    // сначала пробуем запасной источник (например, портрет → обложка)
    if (img.dataset.fallbackSrc && !img.dataset.fbTried) {
      img.dataset.fbTried = '1';
      img.src = img.dataset.fallbackSrc;
      return;
    }
    img.dataset.fbDone = '1';
    var title = img.getAttribute('data-fb-title') || img.alt || 'GameHub';
    var genreId = img.getAttribute('data-fb-genre') || 'RPG';
    var m = genreById[genreId] || genreById.RPG;
    var initials = title.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 3).toUpperCase();
    var fb = document.createElement('span');
    fb.className = 'cover-fallback';
    fb.style.setProperty('--fc', hexA(m.color, .55));
    fb.innerHTML = icon(m.icon) + '<b>' + esc(initials) + '</b><span>' + esc(title) + '</span>';
    var wrap = img.closest('.img-wrap');
    if (wrap) { wrap.classList.add('done'); img.replaceWith(fb); }
    else img.replaceWith(fb);
  }

  /* ================= Делегирование событий ================= */
  function onClick(e) {
    var t = e.target;
    // клик вне выпадающих меню — закрываем
    if (!t.closest('.dd')) closeAllDD();
    // закрытие мобильного меню при переходе по ссылке
    if (t.closest('#mobileMenu a[href^="#/"]')) setMobile(false);
    // клик по текущему пункту навигации — плавно наверх
    var navA = t.closest('a[data-nav]');
    if (navA && navA.getAttribute('href') === (location.hash || '#/')) {
      e.preventDefault(); window.scrollTo({ top: 0, behavior: smooth() }); return;
    }
    var el = t.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');
    var id = el.getAttribute('data-id');

    switch (action) {
      case 'dd-toggle': toggleDD(el); break;
      case 'mobile-toggle': setMobile(!qs('#mobileMenu').classList.contains('open')); break;
      case 'search-open': openSearch(); break;
      case 'profile-open': openProfile(); break;
      case 'theme-set': applyTheme(el.getAttribute('data-theme')); break;
      case 'avatar-set': {
        var i = +el.getAttribute('data-avatar');
        if (state.profileDraft) state.profileDraft.avatar = i;
        qsa('.avatar-opt').forEach(function (b) { b.classList.toggle('active', +b.getAttribute('data-avatar') === i); });
        var prev = qs('#profileAvatarPreview'); if (prev) prev.src = avatarURI(i);
        break;
      }
      case 'profile-save': saveProfileForm(); break;
      case 'reset-data': resetAll(); break;
      case 'notif-read': {
        var n = notifs.find(function (x) { return x.id === el.getAttribute('data-nid'); });
        if (n && !n.read) { n.read = true; saveNotifs(); syncBadges(); renderNotifMenu(); }
        break;
      }
      case 'notif-read-all':
        notifs.forEach(function (x) { x.read = true; });
        saveNotifs(); syncBadges(); renderNotifMenu();
        toast('Все уведомления прочитаны', { type: 'info' });
        break;
      case 'fav-toggle': toggleFav(id, el); break;
      case 'lib-add': libAdd(id); break;
      case 'lib-status': closeAllDD(); libSetStatus(id, el.getAttribute('data-status')); break;
      case 'lib-remove': closeAllDD(); libRemove(id); break;
      case 'lib-tab':
        state.libTab = el.getAttribute('data-tab');
        renderRoute({ animate: false, keepScroll: true });
        break;
      case 'clear-favs': clearFavs(); break;
      case 'compare-toggle': toggleCompare(id); break;
      case 'compare-remove': toggleCompare(id); break;
      case 'compare-remove-modal':
        toggleCompare(id);
        if (compare.length < 2) { closeModal(); toast('Для сравнения нужно минимум две игры', { type: 'info' }); }
        else { closeModal(); openCompare(); }
        break;
      case 'compare-clear':
        compare = []; saveCompare(); renderTray();
        qsa('[data-compare-btn]').forEach(function (b) { b.classList.remove('active'); });
        toast('Список сравнения очищен', { type: 'info' });
        break;
      case 'compare-open': closeAllDD(); openCompare(); break;
      case 'random-game': openRoulette(); break;
      case 'roulette-again': { var m = topModal(); if (m && m.kind === 'roulette') spinRoulette(m); break; }
      case 'roulette-open': closeModal(); navigateTo('#/game/' + id); break;
      case 'trailer-jump': {
        var block = qs('#trailerBlock');
        if (block) block.scrollIntoView({ behavior: smooth(), block: 'center' });
        playTrailer(id);
        break;
      }
      case 'trailer-play': playTrailer(id); break;
      case 'lightbox-open': openLightbox(id, +el.getAttribute('data-index') || 0); break;
      case 'lightbox-prev': lightboxNav(-1); break;
      case 'lightbox-next': lightboxNav(1); break;
      case 'lightbox-goto': if (state.lb) { state.lb.index = +el.getAttribute('data-index'); updateLightbox(); } break;
      case 'modal-close': closeModal(); break;
      case 'modal-backdrop': { var tm = topModal(); if (tm && tm.dismissable && el.closest('.modal-layer') === tm.el) closeModal(tm); break; }
      case 'confirm-ok': resolveConfirm(true); break;
      case 'confirm-cancel': resolveConfirm(false); break;
      case 'filters-toggle': setFilters(true); break;
      case 'filters-close': setFilters(false); break;
      case 'filters-reset': resetFilters(); break;
      case 'filter-chip-remove': {
        var f = state.catalog, kind = el.getAttribute('data-kind'), val = el.getAttribute('data-value');
        if (kind === 'q') f.q = '';
        else if (kind === 'genre') f.genres.delete(val);
        else if (kind === 'platform') f.platforms.delete(val);
        else if (kind === 'yearMin') f.yearMin = null;
        else if (kind === 'yearMax') f.yearMax = null;
        else if (kind === 'rating') f.rating = 0;
        else if (kind === 'dev') f.dev = '';
        syncFilterInputs(); renderCatalogResults();
        break;
      }
      case 'rating-set':
        state.catalog.rating = +el.getAttribute('data-rating');
        syncFilterInputs(); renderCatalogResults();
        break;
      case 'sort-set':
        state.catalog.sort = el.getAttribute('data-sort');
        settings.sort = state.catalog.sort; saveSettings();
        closeAllDD();
        var sl = qs('#sortLabel'); if (sl) sl.textContent = sortLabel(state.catalog.sort);
        qsa('[data-action="sort-set"]').forEach(function (b) { b.classList.toggle('checked', b.getAttribute('data-sort') === state.catalog.sort); });
        renderCatalogResults();
        break;
      case 'view-set':
        state.catalog.view = el.getAttribute('data-view');
        settings.view = state.catalog.view; saveSettings();
        qsa('[data-action="view-set"]').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-view') === state.catalog.view); });
        renderCatalogResults();
        break;
      case 'catalog-search-clear': {
        state.catalog.q = '';
        var inp = qs('#catSearch'); if (inp) { inp.value = ''; inp.focus(); }
        renderCatalogResults();
        break;
      }
      case 'row-scroll': scrollRow(el.getAttribute('data-target'), +el.getAttribute('data-dir')); break;
      case 'hero-dot': setHeroFeature(+el.getAttribute('data-index')); restartHeroTimer(); break;
      case 'hero-scroll': {
        var target = qs('#popularSection');
        if (target) target.scrollIntoView({ behavior: smooth(), block: 'start' });
        break;
      }
      case 'scroll-top': window.scrollTo({ top: 0, behavior: smooth() }); break;
      case 'toast-act': { var tst = el.closest('.toast'); if (tst && tst._fn) tst._fn(); dismissToast(tst); break; }
      case 'toast-close': dismissToast(el.closest('.toast')); break;
      case 'palette-open': navigateTo('#/game/' + id); break;
      case 'palette-catalog': navigateTo('#/catalog?q=' + encodeURIComponent(state.palette ? state.palette.q : '')); break;
      case 'palette-genre': navigateTo('#/catalog?genre=' + encodeURIComponent(el.getAttribute('data-genre'))); break;
      case 'palette-clear': {
        var pi = qs('#paletteInput');
        if (pi) { pi.value = ''; pi.focus(); }
        refreshPalette('');
        break;
      }
      case 'share': shareGame(id); break;
      case 'recent-remove':
        recent = recent.filter(function (x) { return x !== id; });
        saveRecent(); rerenderSoft();
        if (state.route.name === 'home') renderRoute({ animate: false, keepScroll: true });
        break;
    }
  }

  var debouncedCatalog = debounce(function (v) { state.catalog.q = v; renderCatalogResults(); }, 160);
  var debouncedLib = debounce(function (v) { state.libQuery = v; renderRoute({ animate: false, keepScroll: true }); var inp = qs('[data-input="library-search"]'); if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); } }, 200);
  var debouncedPalette = debounce(function (v) { refreshPalette(v); }, 110);

  function onInput(e) {
    var el = e.target, kind = el.getAttribute && el.getAttribute('data-input');
    if (!kind) return;
    if (kind === 'catalog-search') debouncedCatalog(el.value.trim());
    else if (kind === 'library-search') debouncedLib(el.value.trim());
    else if (kind === 'palette-search') debouncedPalette(el.value.trim());
    else if (kind === 'profile-name') {
      var prev = qs('#profileNamePreview');
      if (prev) prev.textContent = el.value.trim() || 'Игрок';
    }
  }
  function onChange(e) {
    var el = e.target, kind = el.getAttribute && el.getAttribute('data-change');
    if (!kind) return;
    var f = state.catalog;
    if (kind === 'filter-genre') { el.checked ? f.genres.add(el.value) : f.genres.delete(el.value); }
    else if (kind === 'filter-platform') { el.checked ? f.platforms.add(el.value) : f.platforms.delete(el.value); }
    else if (kind === 'filter-year-min') {
      f.yearMin = el.value ? +el.value : null;
      if (f.yearMin && f.yearMax && f.yearMin > f.yearMax) f.yearMax = f.yearMin;
      syncFilterInputs();
    }
    else if (kind === 'filter-year-max') {
      f.yearMax = el.value ? +el.value : null;
      if (f.yearMin && f.yearMax && f.yearMax < f.yearMin) f.yearMin = f.yearMax;
      syncFilterInputs();
    }
    else if (kind === 'filter-dev') f.dev = el.value;
    renderCatalogResults();
  }
  function onKeydown(e) {
    // Ctrl/⌘ + K — быстрый поиск
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.key === 'л' || e.key === 'Л')) {
      e.preventDefault(); openSearch(); return;
    }
    var tm = topModal();
    if (e.key === 'Escape') {
      if (tm) { if (tm._confirm) resolveConfirm(false); else if (tm.dismissable) closeModal(tm); return; }
      if (qs('.dd.open')) { closeAllDD(); return; }
      if (qs('#filtersPanel.open')) { setFilters(false); return; }
      if (qs('#mobileMenu.open')) { setMobile(false); return; }
      return;
    }
    // фокус-ловушка внутри модального окна
    if (tm && e.key === 'Tab') {
      var focusables = qsa('button, input, a[href], select, [tabindex]:not([tabindex="-1"])', tm.el).filter(function (f) { return !f.disabled && f.offsetParent !== null; });
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      return;
    }
    if (tm && tm.kind === 'lightbox') {
      if (e.key === 'ArrowRight') { e.preventDefault(); lightboxNav(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); lightboxNav(-1); }
      return;
    }
    if (tm && tm.kind === 'search' && state.palette) {
      var items = state.palette.items;
      if (e.key === 'ArrowDown') { e.preventDefault(); state.palette.index = (state.palette.index + 1) % Math.max(1, items.length); markPaletteActive(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); state.palette.index = (state.palette.index - 1 + items.length) % Math.max(1, items.length); markPaletteActive(); }
      else if (e.key === 'Enter') { e.preventDefault(); paletteActivate(items[state.palette.index]); }
    }
  }

  /* ================= Инициализация ================= */
  function init() {
    seed();
    applyTheme(settings.theme, true);
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('change', onChange);
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('load', onImgLoad, true);
    document.addEventListener('error', onImgError, true);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', function () { renderRoute(); });
    window.addEventListener('resize', debounce(function () {
      if (window.innerWidth > 900) { setMobile(false); setFilters(false); }
      qsa('#view .h-row').forEach(updateRowNav);
    }, 150));
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', function () { renderRoute({ animate: false, keepScroll: true }); });

    var kbd = qs('#kbdHint');
    if (kbd && /Mac|iPhone|iPad/.test(navigator.platform || '')) kbd.textContent = '⌘K';
    var fy = qs('#footerYear'), fc = qs('#footerCreated');
    var year = new Date().getFullYear();
    if (fy) fy.textContent = year;
    if (fc) fc.textContent = Math.max(2026, year);

    syncBadges(); renderMobileMenu(); renderTray();
    renderRoute();
    onScroll();

    if (!S.available) {
      toast('LocalStorage недоступен: данные сохранятся только до закрытия вкладки', { type: 'warn', duration: 6500 });
    }

    // плавное снятие загрузочного экрана
    window.__ghBooted = true;
    setTimeout(function () {
      var boot = qs('#boot');
      if (boot) { boot.classList.add('done'); setTimeout(function () { boot.remove(); }, 600); }
    }, reduced() ? 100 : 550);
  }

  try {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  } catch (err) {
    var boot = qs('#boot');
    if (boot) {
      boot.innerHTML = '<div class="boot-error"><div class="boot-tile">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3L2.5 20h19L12 3Z"/><path d="M12 9.5v4.5M12 16.8h.01"/></svg></div>' +
        '<p>Не удалось запустить GameHub. Попробуйте обновить страницу.</p>' +
        '<button class="btn primary" onclick="location.reload()">Обновить</button></div>';
    }
    if (window.console) console.error('GameHub init error:', err);
  }
})();