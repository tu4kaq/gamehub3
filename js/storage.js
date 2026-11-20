/* ============================================================
   GameHub · storage.js
   Безопасная обёртка над LocalStorage с версионированием ключей
   и резервным хранением в памяти (приватный режим и т.п.).
   ============================================================ */
(function (global) {
  'use strict';

  var NS = 'gamehub.v1.';
  var available = true;

  // Проверяем доступность LocalStorage (может быть заблокирован)
  try {
    var probe = NS + '__probe__';
    global.localStorage.setItem(probe, '1');
    global.localStorage.removeItem(probe);
  } catch (e) {
    available = false;
  }

  var memory = {}; // запасное хранилище на время сессии

  function read(key, fallback) {
    try {
      var raw = available ? global.localStorage.getItem(NS + key) : memory[key];
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback; // повреждённые данные не ломают приложение
    }
  }

  function write(key, value) {
    var raw;
    try { raw = JSON.stringify(value); } catch (e) { return false; }
    try {
      if (available) global.localStorage.setItem(NS + key, raw);
      else memory[key] = raw;
      return true;
    } catch (e) {
      memory[key] = raw; // квота исчерпана — держим в памяти
      return false;
    }
  }

  function remove(key) {
    try {
      if (available) global.localStorage.removeItem(NS + key);
      delete memory[key];
    } catch (e) { /* noop */ }
  }

  function clearAll() {
    KEYS.forEach(remove);
  }

  var KEYS = ['favorites', 'library', 'profile', 'settings', 'recent', 'notifications', 'activity', 'compare'];

  global.GHStorage = {
    read: read,
    write: write,
    remove: remove,
    clearAll: clearAll,
    available: available,
    KEYS: KEYS
  };
})(window);