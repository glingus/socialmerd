// ==UserScript==
// @name         socialmerd
// @namespace    https://github.com/glingus/socialmerd
// @description  Instagram and YouTube without the addictive parts, in the Orion browser on iPhone (via Tampermonkey).
// @description:it  Instagram e YouTube senza le parti che creano dipendenza, nel browser Orion su iPhone (tramite Tampermonkey).
// @version      0.1.0.17
// @license      GPL-3.0-or-later
// @match        https://www.instagram.com/*
// @match        https://instagram.com/*
// @match        https://m.youtube.com/*
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @run-at       document-start
// @inject-into  content
// @noframes
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        GM.listValues
// @grant        GM.xmlHttpRequest
// @connect      raw.githubusercontent.com
// @homepageURL  https://github.com/glingus/socialmerd
// @supportURL   https://github.com/glingus/socialmerd/issues
// @updateURL    https://raw.githubusercontent.com/glingus/socialmerd/dev/dist/socialmerd.meta.js
// @downloadURL  https://raw.githubusercontent.com/glingus/socialmerd/dev/dist/socialmerd.user.js
// ==/UserScript==

"use strict";
(() => {
  // src/core/env.ts
  function detectSite(hostname = location.hostname) {
    if (hostname === "www.instagram.com" || hostname === "instagram.com") {
      return "instagram";
    }
    if (hostname === "m.youtube.com" || hostname === "www.youtube.com" || hostname === "youtube.com") {
      return "youtube";
    }
    return null;
  }

  // src/core/i18n/en.ts
  var en = {
    "welcome.title": "Welcome to socialmerd",
    "welcome.intro": "socialmerd quietly removes the parts of Instagram and YouTube built to keep you scrolling.",
    "welcome.blockedIntro": "What's blocked, always on, no toggle:",
    "welcome.blockedInstagram": "Instagram: no Reels tab or feed reels, no suggested content, no Explore grid. Home feed stops at posts you already saw.",
    "welcome.blockedYoutube": "YouTube: no Shorts, anywhere.",
    "welcome.tipsTitle": "For it to actually work every time:",
    "welcome.tipUninstall": "Uninstall the official Instagram and YouTube apps.",
    "welcome.tipShortcut": "Add a Home Screen icon with a Shortcut (Shortcuts app -> Open URL -> Add to Home Screen).",
    "welcome.tipDefaultBrowser": "Set Orion as your default browser, so links from other apps open here too.",
    "welcome.tipTampermonkey": "Check that socialmerd is enabled in Tampermonkey.",
    "welcome.close": "Got it",
    "pill.ariaLabel": "socialmerd \u2014 usage time, tap for details",
    "pill.minutes": "{{n}} min today",
    "panel.today": "Today",
    "panel.last7days": "Last 7 days",
    "panel.blocksSnapped": "Blocks stopped",
    "panel.settings": "Settings",
    "panel.info": "Info",
    "panel.instagram": "Instagram",
    "panel.youtube": "YouTube",
    "panel.pillToggle": "Show pill",
    "panel.language": "Language",
    "panel.languageAuto": "Auto",
    "panel.languageIt": "Italiano",
    "panel.languageEn": "English",
    "panel.updateCheckToggle": "Check for updates",
    "panel.resetStats": "Reset statistics",
    "panel.resetStatsConfirm": "Delete all saved statistics? This cannot be undone.",
    "panel.baseBlocksNote": "Base blocks above are not configurable \u2014 only these extras are.",
    "panel.githubLink": "View on GitHub",
    "panel.updateAvailable": "Update available",
    "panel.close": "Close",
    "section.feed": "Feed",
    "section.dm": "Direct",
    "section.stories": "Stories",
    "section.profile": "Profile",
    "section.reel": "Reel",
    "section.search": "Search",
    "section.other": "Other",
    "section.video": "Videos",
    "section.browse": "Browsing",
    "debug.title": "Debug overlay",
    "debug.featureProbes": "Feature probes",
    "debug.selectorCounts": "Selector hit counts",
    "debug.logTitle": "Last log lines",
    "debug.noLogs": "No log lines yet.",
    "debug.close": "Close",
    "placeholder.watchReel": "Watch reel"
  };

  // src/core/i18n/it.ts
  var it = {
    "welcome.title": "Benvenuto su socialmerd",
    "welcome.intro": "socialmerd toglie in silenzio le parti di Instagram e YouTube pensate per farti scrollare senza fine.",
    "welcome.blockedIntro": "Cosa viene bloccato, sempre attivo, senza interruttore:",
    "welcome.blockedInstagram": "Instagram: niente tab Reel n\xE9 reel nel feed, niente contenuti suggeriti, niente griglia Esplora. Il feed Home si ferma ai post gi\xE0 visti.",
    "welcome.blockedYoutube": "YouTube: niente Shorts, da nessuna parte.",
    "welcome.tipsTitle": "Perch\xE9 funzioni sempre:",
    "welcome.tipUninstall": "Disinstalla le app ufficiali di Instagram e YouTube.",
    "welcome.tipShortcut": "Crea un'icona sulla schermata Home con un Comando Rapido (app Comandi Rapidi -> Apri URL -> Aggiungi alla schermata Home).",
    "welcome.tipDefaultBrowser": "Imposta Orion come browser predefinito, cos\xEC anche i link dalle altre app si aprono qui.",
    "welcome.tipTampermonkey": "Controlla che socialmerd sia attivo in Tampermonkey.",
    "welcome.close": "Ho capito",
    "pill.ariaLabel": "socialmerd \u2014 tempo di utilizzo, tocca per i dettagli",
    "pill.minutes": "{{n}} min oggi",
    "panel.today": "Oggi",
    "panel.last7days": "Ultimi 7 giorni",
    "panel.blocksSnapped": "Blocchi scattati",
    "panel.settings": "Impostazioni",
    "panel.info": "Info",
    "panel.instagram": "Instagram",
    "panel.youtube": "YouTube",
    "panel.pillToggle": "Mostra la pillola",
    "panel.language": "Lingua",
    "panel.languageAuto": "Auto",
    "panel.languageIt": "Italiano",
    "panel.languageEn": "English",
    "panel.updateCheckToggle": "Controllo aggiornamenti",
    "panel.resetStats": "Azzera statistiche",
    "panel.resetStatsConfirm": "Cancellare tutte le statistiche salvate? Non si pu\xF2 annullare.",
    "panel.baseBlocksNote": "I blocchi base qui sopra non sono disattivabili \u2014 solo questi extra lo sono.",
    "panel.githubLink": "Vedi su GitHub",
    "panel.updateAvailable": "Aggiornamento disponibile",
    "panel.close": "Chiudi",
    "section.feed": "Feed",
    "section.dm": "Direct",
    "section.stories": "Storie",
    "section.profile": "Profilo",
    "section.reel": "Reel",
    "section.search": "Ricerca",
    "section.other": "Altro",
    "section.video": "Video",
    "section.browse": "Navigazione",
    "debug.title": "Overlay di debug",
    "debug.featureProbes": "Sonde funzionalit\xE0",
    "debug.selectorCounts": "Conteggi selettori",
    "debug.logTitle": "Ultime righe di log",
    "debug.noLogs": "Ancora nessuna riga di log.",
    "debug.close": "Chiudi",
    "placeholder.watchReel": "Guarda reel"
  };

  // src/core/i18n/index.ts
  var dictionaries = { it, en };
  function detectLang(navigatorLanguage = navigator.language, override = "auto") {
    if (override !== "auto") return override;
    return navigatorLanguage.toLowerCase().startsWith("it") ? "it" : "en";
  }
  function t(key, lang) {
    return dictionaries[lang][key] ?? dictionaries.en[key];
  }
  function tf(key, lang, params) {
    return t(key, lang).replace(/\{\{(\w+)\}\}/g, (match, name) => String(params[name] ?? match));
  }

  // src/core/gm.ts
  function hasGM() {
    return typeof GM !== "undefined" && typeof GM.getValue === "function";
  }
  async function getValue(key, defaultValue) {
    if (hasGM()) {
      return GM.getValue(key, defaultValue);
    }
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    try {
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }
  async function setValue(key, value) {
    if (hasGM()) {
      return GM.setValue(key, value);
    }
    localStorage.setItem(key, JSON.stringify(value));
  }
  async function deleteValue(key) {
    if (hasGM()) {
      return GM.deleteValue(key);
    }
    localStorage.removeItem(key);
  }
  async function listValues() {
    if (hasGM()) {
      return GM.listValues();
    }
    return Object.keys(localStorage);
  }

  // src/core/settings.ts
  var SETTINGS_KEY = "smd:v1:settings";
  function defaultSettings() {
    return { pillEnabled: true, langOverride: "auto", updateCheckEnabled: true };
  }
  async function getSettings() {
    return getValue(SETTINGS_KEY, defaultSettings());
  }
  async function setSettings(settings) {
    await setValue(SETTINGS_KEY, settings);
  }
  async function updateSettings(patch) {
    const next = { ...await getSettings(), ...patch };
    await setSettings(next);
    return next;
  }

  // src/core/storage.ts
  function emptyDayStats() {
    return {
      ig: { feed: 0, dm: 0, stories: 0, profile: 0, reel: 0, search: 0, other: 0 },
      yt: { video: 0, browse: 0 },
      blocks: { reel_next: 0, blocked_route: 0, feed_end: 0 }
    };
  }
  var DAY_KEY_PREFIX = "smd:v1:stats:";
  function dayKey(date) {
    return `${DAY_KEY_PREFIX}${date.toISOString().slice(0, 10)}`;
  }
  async function getDayStats(date = /* @__PURE__ */ new Date()) {
    return getValue(dayKey(date), emptyDayStats());
  }
  async function setDayStats(stats, date = /* @__PURE__ */ new Date()) {
    await setValue(dayKey(date), stats);
  }
  async function pruneOldDayStats(retentionDays = 35, now = /* @__PURE__ */ new Date()) {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - retentionDays);
    const cutoffSuffix = dayKey(cutoff).slice(DAY_KEY_PREFIX.length);
    const keys = await listValues();
    for (const key of keys) {
      if (!key.startsWith(DAY_KEY_PREFIX)) continue;
      const suffix = key.slice(DAY_KEY_PREFIX.length);
      if (suffix < cutoffSuffix) {
        await deleteValue(key);
      }
    }
  }
  async function resetAllStats() {
    const keys = await listValues();
    for (const key of keys) {
      if (key.startsWith(DAY_KEY_PREFIX)) {
        await deleteValue(key);
      }
    }
  }

  // src/core/dom-scheduler.ts
  var processors = /* @__PURE__ */ new Set();
  var observer = null;
  var scheduled = false;
  var markerCounts = /* @__PURE__ */ new Map();
  function runProcessors() {
    scheduled = false;
    for (const processor of processors) {
      try {
        processor(document.documentElement);
      } catch (error) {
        console.error("[socialmerd] dom-scheduler processor failed", error);
      }
    }
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(runProcessors);
    } else {
      setTimeout(runProcessors, 100);
    }
  }
  function ensureObserver() {
    if (observer) return;
    observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
  function registerProcessor(processor) {
    processors.add(processor);
    ensureObserver();
    schedule();
    return () => {
      processors.delete(processor);
      if (processors.size === 0 && observer) {
        observer.disconnect();
        observer = null;
      }
    };
  }
  function markProcessed(el, marker) {
    const attr = `data-smd-${marker}`;
    if (el.hasAttribute(attr)) return false;
    el.setAttribute(attr, "");
    markerCounts.set(marker, (markerCounts.get(marker) ?? 0) + 1);
    return true;
  }
  function getMarkerCounts() {
    return new Map(markerCounts);
  }

  // src/core/log.ts
  var buffer = [];
  function getLogEntries() {
    return buffer;
  }

  // src/core/styles.ts
  function injectStyle(css, id) {
    const existing = document.getElementById(id);
    if (existing) {
      existing.textContent = css;
      return;
    }
    const style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    document.documentElement.appendChild(style);
  }

  // src/core/ui/debug-overlay.ts
  var STYLE_ID = "smd-debug-style";
  var CSS = `
.smd-debug-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483004;
  background: rgba(0, 0, 0, 0.6);
}
.smd-debug-backdrop[hidden] { display: none; }
.smd-debug {
  position: fixed;
  inset: 40px 12px;
  overflow-y: auto;
  padding: 16px;
  border-radius: 12px;
  background: #111;
  color: #0f0;
  font: 11px/1.5 ui-monospace, 'SF Mono', monospace;
}
.smd-debug[hidden] { display: none; }
.smd-debug h3 { margin: 12px 0 4px; color: #fff; font-size: 12px; text-transform: uppercase; }
.smd-debug-close {
  display: block;
  margin-left: auto;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font: inherit;
}
.smd-debug-line { white-space: pre-wrap; word-break: break-word; }
.smd-debug-line.warn { color: #ff0; }
.smd-debug-line.error { color: #f55; }
`;
  function probeFeatures() {
    return {
      hasGM: hasGM(),
      hasNavigationApi: typeof window.navigation !== "undefined",
      unsafeWindowType: typeof window.unsafeWindow
    };
  }
  function createDebugOverlay(host, lang) {
    injectStyle(CSS, STYLE_ID);
    const backdrop = document.createElement("div");
    backdrop.className = "smd-debug-backdrop";
    backdrop.hidden = true;
    const panel = document.createElement("div");
    panel.className = "smd-debug";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    const close = () => {
      backdrop.hidden = true;
      panel.hidden = true;
    };
    backdrop.addEventListener("click", close);
    function render() {
      const closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.className = "smd-debug-close";
      closeButton.textContent = t("debug.close", lang);
      closeButton.addEventListener("click", close);
      const title = document.createElement("h2");
      title.textContent = t("debug.title", lang);
      const probesHeading = document.createElement("h3");
      probesHeading.textContent = t("debug.featureProbes", lang);
      const probes = probeFeatures();
      const probesLines = document.createElement("div");
      probesLines.className = "smd-debug-line";
      probesLines.textContent = [
        `GM: ${probes.hasGM}`,
        `navigation API: ${probes.hasNavigationApi}`,
        `typeof unsafeWindow: ${probes.unsafeWindowType}`
      ].join("\n");
      const countsHeading = document.createElement("h3");
      countsHeading.textContent = t("debug.selectorCounts", lang);
      const countsLines = document.createElement("div");
      countsLines.className = "smd-debug-line";
      const counts = [...getMarkerCounts().entries()];
      countsLines.textContent = counts.length > 0 ? counts.map(([marker, n]) => `${marker}: ${n}`).join("\n") : t("debug.noLogs", lang);
      const logHeading = document.createElement("h3");
      logHeading.textContent = t("debug.logTitle", lang);
      const logEntries = getLogEntries();
      const logContainer = document.createElement("div");
      if (logEntries.length === 0) {
        const empty = document.createElement("div");
        empty.className = "smd-debug-line";
        empty.textContent = t("debug.noLogs", lang);
        logContainer.appendChild(empty);
      } else {
        for (const entry of [...logEntries].reverse()) {
          const line = document.createElement("div");
          line.className = `smd-debug-line ${entry.level}`;
          const time = new Date(entry.time).toISOString().slice(11, 19);
          line.textContent = `[${time}] ${entry.message}`;
          logContainer.appendChild(line);
        }
      }
      panel.replaceChildren(
        closeButton,
        title,
        probesHeading,
        probesLines,
        countsHeading,
        countsLines,
        logHeading,
        logContainer
      );
    }
    host.mount(backdrop);
    host.mount(panel);
    return {
      open() {
        render();
        backdrop.hidden = false;
        panel.hidden = false;
      },
      close,
      isOpen() {
        return !panel.hidden;
      },
      destroy() {
        backdrop.remove();
        panel.remove();
      }
    };
  }

  // src/core/ui/host.ts
  var HOST_ID = "smd-ui-host";
  function getHost() {
    let host = document.getElementById(HOST_ID);
    if (!host) {
      host = document.createElement("div");
      host.id = HOST_ID;
      host.style.all = "initial";
      (document.body ?? document.documentElement).appendChild(host);
    }
    const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    return {
      shadowRoot,
      mount(el) {
        shadowRoot.appendChild(el);
      }
    };
  }

  // src/features/stats.ts
  function isoDate(date) {
    return date.toISOString().slice(0, 10);
  }
  async function getLast7Days(now = /* @__PURE__ */ new Date()) {
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      days.push({ date: isoDate(date), stats: await getDayStats(date) });
    }
    return days;
  }
  function sumSeconds(section2) {
    return Object.values(section2).reduce((total, seconds) => total + seconds, 0);
  }
  function igMinutes(stats) {
    return Math.round(sumSeconds(stats.ig) / 60);
  }
  function ytMinutes(stats) {
    return Math.round(sumSeconds(stats.yt) / 60);
  }
  function totalBlocks(stats) {
    return sumSeconds(stats.blocks);
  }

  // src/core/ui/bars.ts
  function computeBarHeights(values) {
    const max = Math.max(0, ...values.map((v) => v.value));
    return values.map((v) => ({ ...v, heightPercent: max === 0 ? 0 : Math.round(v.value / max * 100) }));
  }
  function renderBars(values, unitLabel) {
    const container = document.createElement("div");
    container.className = "smd-bars";
    for (const bar of computeBarHeights(values)) {
      const col = document.createElement("div");
      col.className = "smd-bars-col";
      col.setAttribute("role", "img");
      col.setAttribute("aria-label", `${bar.label}: ${unitLabel(bar.value)}`);
      const track = document.createElement("div");
      track.className = "smd-bars-track";
      const fill = document.createElement("div");
      fill.className = "smd-bars-fill";
      fill.style.height = `${bar.heightPercent}%`;
      track.appendChild(fill);
      const label = document.createElement("span");
      label.className = "smd-bars-label";
      label.textContent = bar.label;
      col.append(track, label);
      container.appendChild(col);
    }
    return container;
  }

  // src/core/ui/panel.ts
  var STYLE_ID2 = "smd-panel-style";
  var DEBUG_TAP_COUNT = 5;
  var DEBUG_TAP_WINDOW_MS = 2e3;
  var CSS2 = `
.smd-panel-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483001;
  background: rgba(0, 0, 0, 0.4);
}
.smd-panel-backdrop[hidden] { display: none; }
.smd-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2147483002;
  max-height: 80vh;
  overflow-y: auto;
  padding: 16px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  border-radius: 16px 16px 0 0;
  background: #1c1c1e;
  color: #fff;
  font: 14px/1.5 -apple-system, system-ui, sans-serif;
}
.smd-panel[hidden] { display: none; }
@media (prefers-color-scheme: light) {
  .smd-panel { background: #fff; color: #111; }
}
.smd-panel-close {
  display: block;
  margin: 0 0 12px auto;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  background: rgba(127, 127, 127, 0.2);
  color: inherit;
  font: inherit;
}
.smd-panel-section { margin-bottom: 20px; }
.smd-panel-section h3 { margin: 0 0 8px; font-size: 13px; text-transform: uppercase; opacity: 0.6; }
.smd-panel-row { display: flex; justify-content: space-between; padding: 4px 0; }
.smd-panel-row label { display: flex; justify-content: space-between; width: 100%; align-items: center; gap: 8px; }
.smd-panel-button {
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 69, 58, 0.15);
  color: #ff453a;
  font: inherit;
}
.smd-panel-link { color: #4da3ff; }
.smd-panel-note { opacity: 0.6; font-size: 12px; margin-top: 8px; }
.smd-bars { display: flex; gap: 6px; align-items: flex-end; height: 60px; }
.smd-bars-col { display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; }
.smd-bars-track { flex: 1; width: 100%; display: flex; align-items: flex-end; }
.smd-bars-fill { width: 100%; min-height: 2px; border-radius: 3px; background: #4da3ff; }
.smd-bars-label { font-size: 10px; opacity: 0.6; margin-top: 4px; }
`;
  function row(labelText, valueText) {
    const el = document.createElement("div");
    el.className = "smd-panel-row";
    const label = document.createElement("span");
    label.textContent = labelText;
    const value = document.createElement("span");
    value.textContent = valueText;
    el.append(label, value);
    return el;
  }
  function section(titleText) {
    const el = document.createElement("div");
    el.className = "smd-panel-section";
    const heading = document.createElement("h3");
    heading.textContent = titleText;
    el.appendChild(heading);
    return el;
  }
  function buildTodaySection(today, lang) {
    const el = section(t("panel.today", lang));
    el.appendChild(row(t("panel.instagram", lang), `${igMinutes(today)} min`));
    const igSections = [
      ["feed", "section.feed"],
      ["dm", "section.dm"],
      ["stories", "section.stories"],
      ["profile", "section.profile"],
      ["reel", "section.reel"],
      ["search", "section.search"],
      ["other", "section.other"]
    ];
    for (const [key, labelKey] of igSections) {
      const seconds = today.ig[key];
      if (seconds === 0) continue;
      el.appendChild(row(`\xB7 ${t(labelKey, lang)}`, `${Math.round(seconds / 60)} min`));
    }
    el.appendChild(row(t("panel.youtube", lang), `${ytMinutes(today)} min`));
    const ytSections = [
      ["video", "section.video"],
      ["browse", "section.browse"]
    ];
    for (const [key, labelKey] of ytSections) {
      const seconds = today.yt[key];
      if (seconds === 0) continue;
      el.appendChild(row(`\xB7 ${t(labelKey, lang)}`, `${Math.round(seconds / 60)} min`));
    }
    return el;
  }
  function weekdayLabel(dateIso, lang) {
    const weekday = (/* @__PURE__ */ new Date(`${dateIso}T00:00:00Z`)).toLocaleDateString(lang === "it" ? "it-IT" : "en-US", {
      weekday: "short",
      timeZone: "UTC"
    });
    return weekday.slice(0, 3);
  }
  function buildWeekSection(days, lang) {
    const el = section(t("panel.last7days", lang));
    const igRow = document.createElement("div");
    const igLabel = document.createElement("div");
    igLabel.className = "smd-panel-note";
    igLabel.textContent = t("panel.instagram", lang);
    igRow.appendChild(igLabel);
    igRow.appendChild(
      renderBars(
        days.map((d) => ({ label: weekdayLabel(d.date, lang), value: igMinutes(d.stats) })),
        (v) => `${v} min`
      )
    );
    el.appendChild(igRow);
    const ytRow = document.createElement("div");
    ytRow.style.marginTop = "12px";
    const ytLabel = document.createElement("div");
    ytLabel.className = "smd-panel-note";
    ytLabel.textContent = t("panel.youtube", lang);
    ytRow.appendChild(ytLabel);
    ytRow.appendChild(
      renderBars(
        days.map((d) => ({ label: weekdayLabel(d.date, lang), value: ytMinutes(d.stats) })),
        (v) => `${v} min`
      )
    );
    el.appendChild(ytRow);
    return el;
  }
  function buildBlocksSection(today, days, lang) {
    const el = section(t("panel.blocksSnapped", lang));
    const weekTotal = days.reduce((sum, d) => sum + totalBlocks(d.stats), 0);
    el.appendChild(row(t("panel.today", lang), String(totalBlocks(today))));
    el.appendChild(row(t("panel.last7days", lang), String(weekTotal)));
    return el;
  }
  function buildSettingsSection(settings, lang, onChange) {
    const el = section(t("panel.settings", lang));
    const pillRow = document.createElement("div");
    pillRow.className = "smd-panel-row";
    const pillLabel = document.createElement("label");
    const pillText = document.createElement("span");
    pillText.textContent = t("panel.pillToggle", lang);
    const pillCheckbox = document.createElement("input");
    pillCheckbox.type = "checkbox";
    pillCheckbox.checked = settings.pillEnabled;
    pillCheckbox.addEventListener("change", () => onChange({ pillEnabled: pillCheckbox.checked }));
    pillLabel.append(pillText, pillCheckbox);
    pillRow.appendChild(pillLabel);
    el.appendChild(pillRow);
    const updateRow = document.createElement("div");
    updateRow.className = "smd-panel-row";
    const updateLabel = document.createElement("label");
    const updateText = document.createElement("span");
    updateText.textContent = t("panel.updateCheckToggle", lang);
    const updateCheckbox = document.createElement("input");
    updateCheckbox.type = "checkbox";
    updateCheckbox.checked = settings.updateCheckEnabled;
    updateCheckbox.addEventListener("change", () => onChange({ updateCheckEnabled: updateCheckbox.checked }));
    updateLabel.append(updateText, updateCheckbox);
    updateRow.appendChild(updateLabel);
    el.appendChild(updateRow);
    const langRow = document.createElement("div");
    langRow.className = "smd-panel-row";
    const langLabel = document.createElement("label");
    const langText = document.createElement("span");
    langText.textContent = t("panel.language", lang);
    const langSelect = document.createElement("select");
    const options = [
      ["auto", t("panel.languageAuto", lang)],
      ["it", t("panel.languageIt", lang)],
      ["en", t("panel.languageEn", lang)]
    ];
    for (const [value, text] of options) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      option.selected = settings.langOverride === value;
      langSelect.appendChild(option);
    }
    langSelect.addEventListener("change", () => onChange({ langOverride: langSelect.value }));
    langLabel.append(langText, langSelect);
    langRow.appendChild(langLabel);
    el.appendChild(langRow);
    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.className = "smd-panel-button";
    resetButton.textContent = t("panel.resetStats", lang);
    resetButton.addEventListener("click", () => {
      if (!confirm(t("panel.resetStatsConfirm", lang))) return;
      void resetAllStats();
    });
    el.appendChild(resetButton);
    const note = document.createElement("p");
    note.className = "smd-panel-note";
    note.textContent = t("panel.baseBlocksNote", lang);
    el.appendChild(note);
    return el;
  }
  function buildInfoSection(version, channel, lang, hasUpdate, onDebugTap) {
    const el = section(t("panel.info", lang));
    let taps = 0;
    let tapTimer = null;
    const versionLine = document.createElement("p");
    versionLine.textContent = `socialmerd ${version} (${channel})`;
    versionLine.addEventListener("click", () => {
      taps += 1;
      if (tapTimer) clearTimeout(tapTimer);
      tapTimer = setTimeout(() => {
        taps = 0;
      }, DEBUG_TAP_WINDOW_MS);
      if (taps >= DEBUG_TAP_COUNT) {
        taps = 0;
        if (tapTimer) clearTimeout(tapTimer);
        onDebugTap();
      }
    });
    el.appendChild(versionLine);
    if (hasUpdate) {
      const updateLine = document.createElement("p");
      updateLine.textContent = t("panel.updateAvailable", lang);
      el.appendChild(updateLine);
    }
    const link = document.createElement("a");
    link.className = "smd-panel-link";
    link.href = "https://github.com/glingus/socialmerd";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = t("panel.githubLink", lang);
    el.appendChild(link);
    return el;
  }
  function createPanel(host, options) {
    injectStyle(CSS2, STYLE_ID2);
    const backdrop = document.createElement("div");
    backdrop.className = "smd-panel-backdrop";
    backdrop.hidden = true;
    const sheet = document.createElement("div");
    sheet.className = "smd-panel";
    sheet.hidden = true;
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    const close = () => {
      backdrop.hidden = true;
      sheet.hidden = true;
    };
    backdrop.addEventListener("click", close);
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "smd-panel-close";
    closeButton.addEventListener("click", close);
    host.mount(backdrop);
    host.mount(sheet);
    async function render() {
      const lang = options.getLang();
      closeButton.textContent = t("panel.close", lang);
      const [days, settings] = await Promise.all([getLast7Days(), getSettings()]);
      const today = days[days.length - 1]?.stats;
      if (!today) return;
      sheet.replaceChildren(
        closeButton,
        buildTodaySection(today, lang),
        buildWeekSection(days, lang),
        buildBlocksSection(today, days, lang),
        buildSettingsSection(settings, lang, (patch) => {
          void updateSettings(patch).then((next) => {
            options.onSettingsChanged?.(next);
            void render();
          });
        }),
        buildInfoSection(options.version, options.channel, lang, options.hasUpdate?.() ?? false, () => {
          close();
          options.onDebugTap?.();
        })
      );
    }
    return {
      open() {
        backdrop.hidden = false;
        sheet.hidden = false;
        return render();
      },
      close,
      isOpen() {
        return !sheet.hidden;
      },
      toggle() {
        if (sheet.hidden) {
          backdrop.hidden = false;
          sheet.hidden = false;
          return render();
        }
        close();
        return void 0;
      },
      destroy() {
        backdrop.remove();
        sheet.remove();
      }
    };
  }

  // src/core/ui/pill.ts
  var INSTAGRAM_HIDDEN_PREFIXES = ["/direct/t/", "/stories/", "/reel/", "/create/", "/accounts/"];
  function shouldHidePill(ctx) {
    if (ctx.site === "instagram") {
      return INSTAGRAM_HIDDEN_PREFIXES.some((prefix) => ctx.pathname.startsWith(prefix));
    }
    return Boolean(ctx.isFullscreenVideo);
  }
  var STYLE_ID3 = "smd-pill-style";
  var CSS3 = `
.smd-pill {
  position: fixed;
  right: 12px;
  bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  z-index: 2147483000;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: none;
  border-radius: 999px;
  background: rgba(20, 20, 20, 0.72);
  color: #fff;
  font: 500 12px/1.4 -apple-system, system-ui, sans-serif;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
}
.smd-pill[hidden] { display: none; }
.smd-pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4da3ff;
}
.smd-pill-dot[hidden] { display: none; }
@media (prefers-color-scheme: light) {
  .smd-pill { background: rgba(255, 255, 255, 0.85); color: #111; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15); }
}
`;
  function createPill(host, lang, onActivate) {
    injectStyle(CSS3, STYLE_ID3);
    const el = document.createElement("button");
    el.type = "button";
    el.className = "smd-pill";
    el.setAttribute("aria-label", t("pill.ariaLabel", lang));
    el.addEventListener("click", onActivate);
    const text = document.createElement("span");
    text.className = "smd-pill-text";
    const dot = document.createElement("span");
    dot.className = "smd-pill-dot";
    dot.hidden = true;
    dot.setAttribute("aria-hidden", "true");
    el.append(text, dot);
    host.mount(el);
    return {
      update(minutesToday, hasUpdate, hidden) {
        el.hidden = hidden;
        text.textContent = tf("pill.minutes", lang, { n: minutesToday });
        dot.hidden = !hasUpdate;
      },
      destroy() {
        el.remove();
      }
    };
  }

  // src/core/ui/welcome.ts
  var SHOWN_KEY = "smd:v1:welcomeShown";
  var STYLE_ID4 = "smd-welcome-style";
  var CSS4 = `
.smd-welcome-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483003;
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.55);
}
.smd-welcome-backdrop[hidden] { display: none; }
.smd-welcome {
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 20px 20px calc(20px + env(safe-area-inset-bottom, 0px));
  border-radius: 16px 16px 0 0;
  background: #1c1c1e;
  color: #fff;
  font: 14px/1.5 -apple-system, system-ui, sans-serif;
}
@media (prefers-color-scheme: light) {
  .smd-welcome { background: #fff; color: #111; }
}
.smd-welcome h2 { margin: 0 0 8px; font-size: 18px; }
.smd-welcome h3 { margin: 16px 0 8px; font-size: 13px; text-transform: uppercase; opacity: 0.6; }
.smd-welcome ul { margin: 0; padding-left: 20px; }
.smd-welcome li { margin-bottom: 6px; }
.smd-welcome-close {
  display: block;
  width: 100%;
  margin-top: 20px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: #4da3ff;
  color: #fff;
  font: 600 15px/1 -apple-system, system-ui, sans-serif;
}
`;
  async function hasSeenWelcome() {
    return getValue(SHOWN_KEY, false);
  }
  async function markWelcomeSeen() {
    await setValue(SHOWN_KEY, true);
  }
  function showWelcome(host, lang, onClose) {
    injectStyle(CSS4, STYLE_ID4);
    const backdrop = document.createElement("div");
    backdrop.className = "smd-welcome-backdrop";
    const sheet = document.createElement("div");
    sheet.className = "smd-welcome";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    const title = document.createElement("h2");
    title.textContent = t("welcome.title", lang);
    const intro = document.createElement("p");
    intro.textContent = t("welcome.intro", lang);
    const blockedHeading = document.createElement("h3");
    blockedHeading.textContent = t("welcome.blockedIntro", lang);
    const blockedList = document.createElement("ul");
    for (const key of ["welcome.blockedInstagram", "welcome.blockedYoutube"]) {
      const li = document.createElement("li");
      li.textContent = t(key, lang);
      blockedList.appendChild(li);
    }
    const tipsHeading = document.createElement("h3");
    tipsHeading.textContent = t("welcome.tipsTitle", lang);
    const tipsList = document.createElement("ul");
    for (const key of [
      "welcome.tipUninstall",
      "welcome.tipShortcut",
      "welcome.tipDefaultBrowser",
      "welcome.tipTampermonkey"
    ]) {
      const li = document.createElement("li");
      li.textContent = t(key, lang);
      tipsList.appendChild(li);
    }
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "smd-welcome-close";
    closeButton.textContent = t("welcome.close", lang);
    closeButton.addEventListener("click", () => {
      void markWelcomeSeen();
      backdrop.remove();
      onClose?.();
    });
    sheet.append(title, intro, blockedHeading, blockedList, tipsHeading, tipsList, closeButton);
    backdrop.appendChild(sheet);
    host.mount(backdrop);
  }

  // src/features/time-tracker.ts
  function startTimeTracker(options) {
    const tickIntervalMs = options.tickIntervalMs ?? 1e3;
    const flushEveryTicks = options.flushEveryTicks ?? 10;
    const isVisible = options.isVisible ?? (() => document.visibilityState === "visible");
    const pendingIg = {};
    const pendingYt = {};
    let ticksSinceFlush = 0;
    const flush = async () => {
      ticksSinceFlush = 0;
      const igEntries = Object.entries(pendingIg);
      const ytEntries = Object.entries(pendingYt);
      if (igEntries.length === 0 && ytEntries.length === 0) return;
      const date = options.now?.() ?? /* @__PURE__ */ new Date();
      const stats = await getDayStats(date);
      for (const [section2, count] of igEntries) {
        stats.ig[section2] += count;
        delete pendingIg[section2];
      }
      for (const [section2, count] of ytEntries) {
        stats.yt[section2] += count;
        delete pendingYt[section2];
      }
      await setDayStats(stats, date);
    };
    const tick = () => {
      if (!isVisible()) return;
      if (!options.hasRecentInteraction() && !options.isVideoPlaying()) return;
      const current = options.getSection();
      if (!current) return;
      if (current.site === "instagram") {
        pendingIg[current.section] = (pendingIg[current.section] ?? 0) + 1;
      } else {
        pendingYt[current.section] = (pendingYt[current.section] ?? 0) + 1;
      }
      ticksSinceFlush += 1;
      if (ticksSinceFlush >= flushEveryTicks) {
        void flush();
      }
    };
    const timer = setInterval(tick, tickIntervalMs);
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    const onPageHide = () => void flush();
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    void pruneOldDayStats(options.retentionDays ?? 35, options.now?.() ?? /* @__PURE__ */ new Date());
    return {
      stop() {
        clearInterval(timer);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        window.removeEventListener("pagehide", onPageHide);
      },
      flush
    };
  }

  // src/features/update-check.ts
  var LAST_CHECK_KEY = "smd:v1:updateCheck:lastRunAt";
  var LATEST_VERSION_KEY = "smd:v1:updateCheck:latestVersion";
  var CHECK_INTERVAL_MS = 24 * 60 * 60 * 1e3;
  function defaultXhr(details) {
    GM.xmlHttpRequest({ method: "GET", url: details.url, onload: details.onload, onerror: details.onerror });
  }
  function parseVersionFromMeta(metaText) {
    const match = /@version\s+(\S+)/.exec(metaText);
    return match ? match[1] ?? null : null;
  }
  function compareVersions(a, b) {
    const partsA = a.split(".").map(Number);
    const partsB = b.split(".").map(Number);
    const length = Math.max(partsA.length, partsB.length);
    for (let i = 0; i < length; i++) {
      const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
      if (diff !== 0) return diff;
    }
    return 0;
  }
  function fetchLatestVersion(metaUrl, xhr) {
    return new Promise((resolve) => {
      xhr({
        url: metaUrl,
        onload: (response) => {
          if (response.status !== 200) {
            resolve(null);
            return;
          }
          resolve(parseVersionFromMeta(response.responseText));
        },
        onerror: () => resolve(null)
      });
    });
  }
  async function checkForUpdate(options) {
    const now = (options.now ?? Date.now)();
    const lastRun = await getValue(LAST_CHECK_KEY, 0);
    if (now - lastRun < CHECK_INTERVAL_MS) {
      const cached = await getValue(LATEST_VERSION_KEY, null);
      return {
        checked: false,
        hasUpdate: cached !== null && compareVersions(cached, options.currentVersion) > 0,
        latestVersion: cached
      };
    }
    const latestVersion = await fetchLatestVersion(options.metaUrl, options.xhr ?? defaultXhr);
    await setValue(LAST_CHECK_KEY, now);
    if (latestVersion !== null) {
      await setValue(LATEST_VERSION_KEY, latestVersion);
    }
    return {
      checked: true,
      hasUpdate: latestVersion !== null && compareVersions(latestVersion, options.currentVersion) > 0,
      latestVersion
    };
  }

  // src/platforms/instagram/account.ts
  var FIXED_NAV_HREFS = /* @__PURE__ */ new Set(["/", "/explore/", "/reels/", "/direct/inbox/", "/notifications/"]);
  var USERNAME_HREF = /^\/([a-zA-Z0-9_.]+)\/$/;
  function closestCommonAncestor(a, b) {
    const ancestors = /* @__PURE__ */ new Set();
    for (let node = a; node; node = node.parentElement) {
      ancestors.add(node);
    }
    for (let node = b; node; node = node.parentElement) {
      if (ancestors.has(node)) return node;
    }
    return null;
  }
  var DEFAULT_ACCOUNT = "default";
  function detectLoggedInUsername(root = document) {
    const home = root.querySelector('[aria-label="Home"]');
    const explore = root.querySelector('[aria-label="Esplora"], [aria-label="Explore"]');
    if (!home || !explore) return DEFAULT_ACCOUNT;
    const container = closestCommonAncestor(home, explore);
    if (!container) return DEFAULT_ACCOUNT;
    for (const link of container.querySelectorAll("a[href]")) {
      const href = link.getAttribute("href") ?? "";
      if (FIXED_NAV_HREFS.has(href)) continue;
      const match = href.match(USERNAME_HREF);
      if (match?.[1]) return match[1];
    }
    return DEFAULT_ACCOUNT;
  }

  // src/platforms/instagram/selectors.ts
  var FEED = {
    // verified 2026-09-17 (point b): each post in the feed is an <article>.
    postSelector: "article",
    // verified 2026-09-17 (point b): ISO 8601 timestamp on every post.
    timeSelector: "time[datetime]"
  };
  var APP_BANNER = {
    // verified 2026-09-17 (point m): the dismiss icon is an <svg aria-label
    //="Chiudi"> (IT). Never click the "Usa l'app" button next to it — that
    // opens the native app / store, the opposite of what this script does.
    closeIconAriaLabels: ["Chiudi", "Close"]
  };

  // src/platforms/instagram/strings.ts
  var SPONSORED_LABEL = {
    it: ["Sponsorizzato"],
    // verified 2026-09-17: not yet seen on a post in this spike (§b), text confirmed via Instagram's standard IT label wording used elsewhere in the product; re-check on first real sighting.
    en: ["Sponsored"]
    // unverified: standard Meta EN wording, not observed live
  };
  var SUGGESTED_FOR_YOU_HEADING = {
    it: ["Suggeriti per te"],
    // verified 2026-09-17 (point n): <h4> heading on /accounts/activity/
    en: ["Suggested for you"]
    // unverified
  };
  var FOLLOW_BUTTON = {
    it: ["Segui"],
    // unverified live: no non-followed post appeared in this spike (§b); standard IT wording used elsewhere in the product (e.g. profile pages)
    en: ["Follow"]
    // unverified
  };
  var USE_APP_CTA = {
    // The app-open interstitial's primary button (spike point m). Never click
    // this — it is documented so app-banners.ts can positively confirm it is
    // looking at the right interstitial before touching the nearby close icon.
    it: ["Usa l'app"],
    // verified 2026-09-17 (point m)
    en: ["Use the app", "Get the app"]
    // unverified
  };

  // src/platforms/instagram/app-banners.ts
  var CTA_TEXTS = /* @__PURE__ */ new Set([...USE_APP_CTA.it, ...USE_APP_CTA.en]);
  var MAX_ANCESTOR_LEVELS = 6;
  function findCloseIcon(ctaButton) {
    const closeSelector = APP_BANNER.closeIconAriaLabels.map((label) => `[aria-label="${label}"]`).join(", ");
    let ancestor = ctaButton.parentElement;
    for (let i = 0; i < MAX_ANCESTOR_LEVELS && ancestor; i += 1) {
      const closeIcon = ancestor.querySelector(closeSelector);
      if (closeIcon && closeIcon !== ctaButton) return closeIcon;
      ancestor = ancestor.parentElement;
    }
    return null;
  }
  function dispatchClick(el) {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  }
  var processAppBanners = (root) => {
    for (const button of root.querySelectorAll("button")) {
      const text = button.textContent?.trim() ?? "";
      if (!CTA_TEXTS.has(text)) continue;
      if (!markProcessed(button, "app-banner")) continue;
      const closeIcon = findCloseIcon(button);
      if (closeIcon) {
        dispatchClick(closeIcon);
      }
    }
  };

  // src/core/blocks.ts
  async function incrementBlock(type, date = /* @__PURE__ */ new Date()) {
    const stats = await getDayStats(date);
    stats.blocks[type] += 1;
    await setDayStats(stats, date);
    return stats.blocks[type];
  }

  // src/core/silent-nav.ts
  var STACK_KEY = "smd:v1:navstack";
  var MAX_STACK = 50;
  function readStack() {
    try {
      const raw = sessionStorage.getItem(STACK_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function writeStack(stack) {
    sessionStorage.setItem(STACK_KEY, JSON.stringify(stack.slice(-MAX_STACK)));
  }
  function pushAllowed(url) {
    const stack = readStack();
    if (stack[stack.length - 1] !== url) {
      stack.push(url);
      writeStack(stack);
    }
  }
  function getStack() {
    return readStack();
  }
  var defaultNavigate = {
    back: () => history.back(),
    replace: (url) => location.replace(url)
  };
  function returnSilently(fallbackUrl, navigate = defaultNavigate) {
    const stack = readStack();
    const lastAllowed = stack[stack.length - 1];
    if (lastAllowed) {
      navigate.back();
    } else {
      navigate.replace(fallbackUrl);
    }
  }

  // src/platforms/instagram/reel-lock.ts
  var FALLBACK_URL = "/?variant=following";
  var EXEMPT_SELECTOR = [
    "input",
    "textarea",
    '[contenteditable="true"]',
    '[role="dialog"]',
    '[aria-label="Commenta"]',
    '[aria-label="Comment"]',
    '[aria-label="Condividi"]',
    '[aria-label="Share"]',
    '[aria-label="Altre opzioni"]',
    '[aria-label="More options"]'
  ].join(", ");
  function decideReelLockAction(current, route, previousUrl) {
    if (route.kind === "reel-lock") {
      if (!current) {
        return { type: "engage", code: route.code ?? "", origin: previousUrl ?? FALLBACK_URL };
      }
      if (current.code !== route.code) {
        return { type: "swiped-next", origin: current.origin };
      }
      return { type: "noop" };
    }
    return current ? { type: "release" } : { type: "noop" };
  }
  function isExempt(target) {
    return target instanceof Element ? target.closest(EXEMPT_SELECTOR) !== null : false;
  }
  function preventUnlessExempt(event) {
    if (isExempt(event.target)) return;
    event.preventDefault();
  }
  var ADVANCE_KEYS = /* @__PURE__ */ new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", " "]);
  function blockKeys(event) {
    if (isExempt(event.target)) return;
    if (ADVANCE_KEYS.has(event.key)) event.preventDefault();
  }
  function blockAdjacentReelGestures(target = document) {
    const options = { capture: true, passive: false };
    target.addEventListener("touchmove", preventUnlessExempt, options);
    target.addEventListener("wheel", preventUnlessExempt, options);
    target.addEventListener("keydown", blockKeys, options);
    return {
      release() {
        target.removeEventListener("touchmove", preventUnlessExempt, options);
        target.removeEventListener("wheel", preventUnlessExempt, options);
        target.removeEventListener("keydown", blockKeys, options);
      }
    };
  }
  var defaultNavigate2 = {
    back: () => history.back(),
    replace: (url) => location.replace(url)
  };
  function createReelLockController() {
    let current = null;
    let gestureHandle = null;
    return {
      isLocked: () => current !== null,
      handleRoute(route, navigate = defaultNavigate2) {
        const stack = getStack();
        const previousUrl = stack.length >= 2 ? stack[stack.length - 2] ?? null : null;
        const action = decideReelLockAction(current, route, previousUrl);
        switch (action.type) {
          case "engage":
            current = { code: action.code, origin: action.origin };
            gestureHandle = blockAdjacentReelGestures();
            break;
          case "swiped-next":
            void incrementBlock("reel_next");
            gestureHandle?.release();
            gestureHandle = null;
            current = null;
            navigate.replace(action.origin);
            break;
          case "release":
            gestureHandle?.release();
            gestureHandle = null;
            current = null;
            break;
          case "noop":
            break;
        }
      }
    };
  }

  // src/platforms/instagram/dm-reel-lock.ts
  var FULLSCREEN_COVERAGE_RATIO = 0.8;
  function findFullscreenVideo(root) {
    for (const video of root.querySelectorAll("video")) {
      const rect = video.getBoundingClientRect();
      if (rect.width >= window.innerWidth * FULLSCREEN_COVERAGE_RATIO && rect.height >= window.innerHeight * FULLSCREEN_COVERAGE_RATIO) {
        return video;
      }
    }
    return null;
  }
  function createDmReelLock() {
    let handle = null;
    let active = false;
    function deactivate() {
      handle?.release();
      handle = null;
      active = false;
    }
    return {
      isActive: () => active,
      process(root, route) {
        if (route.kind !== "direct") {
          if (active) deactivate();
          return;
        }
        const found = findFullscreenVideo(root) !== null;
        if (found && !active) {
          active = true;
          handle = blockAdjacentReelGestures();
        } else if (!found && active) {
          deactivate();
        }
      }
    };
  }

  // src/platforms/instagram/explore-search.ts
  var STYLE_ID5 = "smd-explore-grid-style";
  injectStyle(
    `
  html[data-smd-ig-route="explore"] a[href^="/p/"],
  html[data-smd-ig-route="explore"] a[href^="/reel/"] {
    display: none !important;
  }
  `,
    STYLE_ID5
  );
  function hide(el) {
    el.style.display = "none";
  }
  function processExploreGrid(root, route) {
    if (route.kind !== "explore") return;
    for (const link of root.querySelectorAll('a[href^="/p/"], a[href^="/reel/"]')) {
      if (!markProcessed(link, "explore-grid")) continue;
      hide(link);
    }
  }
  function processExploreSearchResults(root, route) {
    if (route.kind !== "explore-search") return;
    const selector = [
      'a[href^="/explore/tags/"]',
      'a[href^="/explore/locations/"]',
      'a[href^="/reels/audio/"]'
    ].join(", ");
    for (const link of root.querySelectorAll(selector)) {
      if (!markProcessed(link, "explore-search-entry")) continue;
      hide(link);
    }
  }
  var registerExploreSearchProcessors = (getRoute) => [
    (root) => processExploreGrid(root, getRoute()),
    (root) => processExploreSearchResults(root, getRoute())
  ];

  // src/platforms/instagram/feed-filter.ts
  var HIDE_TEXTS = /* @__PURE__ */ new Set([
    ...SPONSORED_LABEL.it,
    ...SPONSORED_LABEL.en,
    ...SUGGESTED_FOR_YOU_HEADING.it,
    ...SUGGESTED_FOR_YOU_HEADING.en
  ]);
  var FOLLOW_TEXTS = /* @__PURE__ */ new Set([...FOLLOW_BUTTON.it, ...FOLLOW_BUTTON.en]);
  function hasFollowButton(post) {
    for (const el of post.querySelectorAll('button, [role="button"]')) {
      if (FOLLOW_TEXTS.has(el.textContent?.trim() ?? "")) return true;
    }
    return false;
  }
  function processFeedFilter(root, route) {
    if (route.kind !== "feed") return;
    for (const post of root.querySelectorAll(FEED.postSelector)) {
      if (!markProcessed(post, "feed-filter")) continue;
      const text = post.textContent ?? "";
      const shouldHide = [...HIDE_TEXTS].some((needle) => text.includes(needle)) || hasFollowButton(post);
      if (shouldHide) {
        post.style.display = "none";
      }
    }
  }
  var registerFeedFilterProcessor = (getRoute) => (root) => processFeedFilter(root, getRoute());

  // src/platforms/instagram/feed-limiter.ts
  function emptyFeedState() {
    return { watermark: null, lastCaughtUpAt: null };
  }
  var DEFAULT_WINDOW_MS = 24 * 60 * 60 * 1e3;
  function computeBoundary(state, now, windowMs = DEFAULT_WINDOW_MS) {
    return Math.max(state.watermark ?? 0, now - windowMs);
  }
  function decideChronological(posts, boundary) {
    for (let i = 0; i < posts.length; i += 1) {
      const ts = posts[i]?.timestamp ?? null;
      if (ts !== null && ts <= boundary) {
        return { visibleCount: i, caughtUpAtIndex: i };
      }
    }
    return { visibleCount: posts.length, caughtUpAtIndex: null };
  }
  function nextWatermark(state, mostRecentShown) {
    if (mostRecentShown === null) return state.watermark;
    return Math.max(state.watermark ?? 0, mostRecentShown);
  }
  function stateKey(account) {
    return `smd:v1:ig:${account}:feed`;
  }
  async function loadFeedState(account) {
    return getValue(stateKey(account), emptyFeedState());
  }
  async function saveFeedState(account, state) {
    await setValue(stateKey(account), state);
  }
  var CARD_CLASS = "smd-feed-caught-up";
  var LOADING_ARIA_LABELS = ["Caricamento...", "Loading..."];
  function parseTimestamp(article) {
    const time = article.querySelector(FEED.timeSelector);
    const datetime = time?.getAttribute("datetime");
    if (!datetime) return null;
    const parsed = Date.parse(datetime);
    return Number.isNaN(parsed) ? null : parsed;
  }
  function buildCaughtUpCard() {
    const card = document.createElement("div");
    card.className = CARD_CLASS;
    card.textContent = "Sei in pari \u2713";
    return card;
  }
  function clipContainer(container, upTo) {
    const bottom = upTo.offsetTop + upTo.offsetHeight - container.offsetTop;
    container.style.maxHeight = `${bottom}px`;
    container.style.overflow = "hidden";
  }
  function hideLoadingSentinels(container) {
    const selector = LOADING_ARIA_LABELS.map((label) => `[aria-label="${label}"]`).join(", ");
    for (const sentinel of container.querySelectorAll(selector)) {
      sentinel.style.display = "none";
    }
  }
  function registerFeedLimiterProcessor(getRoute, deps) {
    const now = deps.now ?? (() => Date.now());
    let cachedState = null;
    let cachedAccount = null;
    let caughtUpCard = null;
    return (root) => {
      if (getRoute().kind !== "feed") return;
      const account = deps.getAccount();
      if (account !== cachedAccount) {
        cachedAccount = account;
        cachedState = null;
        void loadFeedState(account).then((state) => {
          cachedState = state;
        });
      }
      if (!cachedState) return;
      const articles = [...root.querySelectorAll(FEED.postSelector)];
      const posts = articles.map((article) => ({ timestamp: parseTimestamp(article) }));
      const boundary = computeBoundary(cachedState, now());
      const decision = decideChronological(posts, boundary);
      for (let i = decision.visibleCount; i < articles.length; i += 1) {
        const article = articles[i];
        if (article && markProcessed(article, "feed-limiter-hide")) {
          article.style.display = "none";
        }
      }
      if (decision.caughtUpAtIndex === null) return;
      if (caughtUpCard?.isConnected) return;
      const anchor = articles[decision.visibleCount - 1] ?? articles[0];
      const container = anchor?.parentElement ?? root;
      caughtUpCard = buildCaughtUpCard();
      if (anchor) {
        anchor.parentElement?.insertBefore(caughtUpCard, anchor.nextSibling);
      } else if (container instanceof Element) {
        container.appendChild(caughtUpCard);
      }
      if (container instanceof HTMLElement) {
        clipContainer(container, caughtUpCard);
        hideLoadingSentinels(container);
      }
      const mostRecentShown = posts.slice(0, decision.visibleCount).reduce(
        (max, post) => post.timestamp !== null && (max === null || post.timestamp > max) ? post.timestamp : max,
        null
      );
      const ObserverImpl = deps.IntersectionObserverImpl ?? IntersectionObserver;
      const observer2 = new ObserverImpl(
        (entries) => {
          const visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5);
          if (!visible) return;
          observer2.disconnect();
          void incrementBlock("feed_end");
          if (!cachedState) return;
          const updated = { watermark: nextWatermark(cachedState, mostRecentShown), lastCaughtUpAt: now() };
          cachedState = updated;
          void saveFeedState(account, updated);
        },
        { threshold: 0.5 }
      );
      observer2.observe(caughtUpCard);
    };
  }

  // src/platforms/instagram/routes.ts
  var RESERVED_TOP_SEGMENTS = /* @__PURE__ */ new Set([
    "explore",
    "reels",
    "reel",
    "p",
    "direct",
    "stories",
    "accounts",
    "create",
    "challenge",
    "notifications"
  ]);
  function isFeedVariant(search) {
    const params = new URLSearchParams(search);
    const variant = params.get("variant");
    return variant === "following" || variant === "favorites";
  }
  function classifyInstagramRoute(pathname, search = "") {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      return isFeedVariant(search) ? { kind: "feed" } : { kind: "redirect-to-following" };
    }
    const [first, second, third] = segments;
    if (first === "reels") {
      return { kind: "blocked" };
    }
    if (first === "reel" && segments.length === 2 && second) {
      return { kind: "reel-lock", code: second };
    }
    if (first === "p" && segments.length === 2 && second) {
      return { kind: "post", code: second };
    }
    if (first === "explore") {
      if (segments.length === 1) return { kind: "explore" };
      if (second === "search") return { kind: "explore-search" };
      if (second === "tags" || second === "locations" || second === "people") {
        return { kind: "blocked" };
      }
      return { kind: "passthrough" };
    }
    if (first === "direct") {
      return { kind: "direct" };
    }
    if (first === "stories") {
      return { kind: "stories" };
    }
    if (first === "accounts") {
      return second === "activity" ? { kind: "activity" } : { kind: "passthrough" };
    }
    if (first === "create" || first === "challenge" || first === "notifications") {
      return { kind: "passthrough" };
    }
    if (!RESERVED_TOP_SEGMENTS.has(first ?? "")) {
      if (second === "reel" && segments.length === 3 && third) {
        return { kind: "reel-lock", code: third };
      }
      if (second === "p" && segments.length === 3 && third) {
        return { kind: "post", code: third };
      }
      return { kind: "profile" };
    }
    return { kind: "passthrough" };
  }
  var REEL_PERMALINK = /^\/(?:[a-zA-Z0-9_.]+\/)?reel\/([A-Za-z0-9_-]+)\/?$/;
  function parseReelPermalinkHref(href) {
    return REEL_PERMALINK.exec(href)?.[1] ?? null;
  }

  // src/platforms/instagram/feed-reels-placeholder.ts
  var CAPTION_MAX_LENGTH = 100;
  var PLACEHOLDER_CLASS = "smd-reel-placeholder";
  var STYLE_ID6 = "smd-reel-placeholder-style";
  injectStyle(
    `
  .${PLACEHOLDER_CLASS} {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    margin: 8px 0;
    border: 1px solid rgba(127, 127, 127, 0.25);
    border-radius: 12px;
    font: 14px/1.4 -apple-system, system-ui, sans-serif;
    color: inherit;
    box-sizing: border-box;
  }
  .${PLACEHOLDER_CLASS}-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .${PLACEHOLDER_CLASS}-avatar {
    width: 32px;
    height: 32px;
    min-width: 32px;
    border-radius: 50%;
    object-fit: cover;
  }
  .${PLACEHOLDER_CLASS}-username {
    font-weight: 600;
  }
  .${PLACEHOLDER_CLASS}-date {
    opacity: 0.6;
    font-size: 12px;
  }
  .${PLACEHOLDER_CLASS}-poster {
    display: block;
    width: 100%;
    max-width: 100%;
    max-height: 60vh;
    object-fit: cover;
    border-radius: 8px;
  }
  .${PLACEHOLDER_CLASS}-caption {
    margin: 0;
    opacity: 0.85;
  }
  .${PLACEHOLDER_CLASS}-cta {
    align-self: flex-start;
    padding: 6px 14px;
    border-radius: 999px;
    background: #4da3ff;
    color: #fff;
    text-decoration: none;
    font-weight: 600;
  }
  @media (prefers-color-scheme: light) {
    .${PLACEHOLDER_CLASS} { border-color: rgba(0, 0, 0, 0.12); }
  }
  `,
    STYLE_ID6
  );
  function findReelCode(article) {
    for (const link of article.querySelectorAll("a[href]")) {
      const code = parseReelPermalinkHref(link.getAttribute("href") ?? "");
      if (code) return code;
    }
    return null;
  }
  function findUsername(article) {
    for (const link of article.querySelectorAll("a[href]")) {
      const match = /^\/([a-zA-Z0-9_.]+)\/$/.exec(link.getAttribute("href") ?? "");
      if (match?.[1]) return match[1];
    }
    return null;
  }
  function findAvatarSrc(article) {
    const avatar = article.querySelector('img[alt^="Immagine del profilo"], img[alt^="Profile photo of"]');
    return avatar?.getAttribute("src") ?? "";
  }
  function findDateText(article) {
    const time = article.querySelector(FEED.timeSelector);
    return time?.getAttribute("title") ?? time?.textContent?.trim() ?? "";
  }
  function findPosterSrc(article, avatarSrc) {
    const video = article.querySelector("video[poster]");
    const poster = video?.getAttribute("poster");
    if (poster) return poster;
    for (const img of article.querySelectorAll("img")) {
      const src = img.getAttribute("src") ?? "";
      if (src && src !== avatarSrc) return src;
    }
    return "";
  }
  function findCaption(article, usernameText, dateText) {
    let longest = "";
    for (const el of article.querySelectorAll('[dir="auto"]')) {
      const text = el.textContent?.trim() ?? "";
      if (text === usernameText || text === dateText) continue;
      if (text.length > longest.length) longest = text;
    }
    return longest.slice(0, CAPTION_MAX_LENGTH);
  }
  function pauseAndMute(video) {
    video.pause();
    video.muted = true;
    video.addEventListener("play", () => video.pause());
  }
  function buildPlaceholder(params) {
    const card = document.createElement("div");
    card.className = PLACEHOLDER_CLASS;
    const header = document.createElement("div");
    header.className = `${PLACEHOLDER_CLASS}-header`;
    if (params.avatarSrc) {
      const avatar = document.createElement("img");
      avatar.className = `${PLACEHOLDER_CLASS}-avatar`;
      avatar.src = params.avatarSrc;
      avatar.alt = "";
      header.appendChild(avatar);
    }
    const username = document.createElement("span");
    username.className = `${PLACEHOLDER_CLASS}-username`;
    username.textContent = params.username ? `@${params.username}` : "";
    header.appendChild(username);
    const date = document.createElement("span");
    date.className = `${PLACEHOLDER_CLASS}-date`;
    date.textContent = params.dateText;
    header.appendChild(date);
    card.appendChild(header);
    if (params.posterSrc) {
      const poster = document.createElement("img");
      poster.className = `${PLACEHOLDER_CLASS}-poster`;
      poster.src = params.posterSrc;
      poster.alt = "";
      card.appendChild(poster);
    }
    const caption = document.createElement("p");
    caption.className = `${PLACEHOLDER_CLASS}-caption`;
    caption.textContent = params.caption;
    card.appendChild(caption);
    const cta = document.createElement("a");
    cta.className = `${PLACEHOLDER_CLASS}-cta`;
    cta.href = `/reel/${params.code}/`;
    cta.textContent = t("placeholder.watchReel", detectLang());
    card.appendChild(cta);
    return card;
  }
  function processFeedReelsPlaceholder(root, route) {
    if (route.kind !== "feed") return;
    for (const article of root.querySelectorAll(FEED.postSelector)) {
      if (!markProcessed(article, "feed-reel-placeholder")) continue;
      const code = findReelCode(article);
      if (!code) continue;
      for (const video of article.querySelectorAll("video")) {
        pauseAndMute(video);
      }
      const username = findUsername(article);
      const avatarSrc = findAvatarSrc(article);
      const dateText = findDateText(article);
      const posterSrc = findPosterSrc(article, avatarSrc);
      const caption = findCaption(article, username ? `@${username}` : "", dateText);
      const placeholder = buildPlaceholder({ code, username, avatarSrc, dateText, posterSrc, caption });
      article.parentElement?.insertBefore(placeholder, article.nextSibling);
      article.style.display = "none";
    }
  }
  var registerFeedReelsPlaceholderProcessor = (getRoute) => (root) => processFeedReelsPlaceholder(root, getRoute());

  // src/platforms/instagram/nav-cleanup.ts
  var processNavCleanup = (root) => {
    for (const link of root.querySelectorAll('a[href="/reels/"]')) {
      if (!markProcessed(link, "nav-cleanup")) continue;
      link.style.display = "none";
    }
  };

  // src/core/url-watcher.ts
  function getNavigation() {
    return window.navigation;
  }
  function watchUrl(onChange, options = {}) {
    const intervalMs = options.intervalMs ?? 100;
    let lastUrl = location.href;
    const check = () => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        onChange(lastUrl);
      }
    };
    const timer = setInterval(check, intervalMs);
    window.addEventListener("popstate", check, true);
    const navigation = getNavigation();
    navigation?.addEventListener("currententrychange", check);
    return () => {
      clearInterval(timer);
      window.removeEventListener("popstate", check, true);
      navigation?.removeEventListener("currententrychange", check);
    };
  }

  // src/platforms/instagram/route-guard.ts
  var FALLBACK_URL2 = "/?variant=following";
  var ROUTE_ATTR = "data-smd-ig-route";
  var STYLE_ID7 = "smd-route-guard-style";
  injectStyle(
    `
  html[${ROUTE_ATTR}="blocked"] body > :not(#smd-ui-host),
  html[${ROUTE_ATTR}="redirect-to-following"] body > :not(#smd-ui-host) {
    visibility: hidden !important;
  }
  `,
    STYLE_ID7
  );
  var defaultNavigate3 = {
    back: () => history.back(),
    replace: (url) => location.replace(url)
  };
  function handleRoute(url, navigate = defaultNavigate3) {
    const { pathname, search } = new URL(url, location.origin);
    const route = classifyInstagramRoute(pathname, search);
    document.documentElement.setAttribute(ROUTE_ATTR, route.kind);
    switch (route.kind) {
      case "redirect-to-following":
        navigate.replace(FALLBACK_URL2);
        break;
      case "blocked":
        void incrementBlock("blocked_route");
        returnSilently(FALLBACK_URL2, navigate);
        break;
      default:
        pushAllowed(url);
    }
    return route;
  }
  function startRouteGuard(onRoute, navigate = defaultNavigate3) {
    const run = (url) => {
      const route = handleRoute(url, navigate);
      onRoute?.(route, url);
    };
    run(location.href);
    const stopWatching = watchUrl(run);
    return { stop: stopWatching };
  }

  // src/platforms/instagram/stories-ads.ts
  var MAX_ATTEMPTS_PER_STORY = 3;
  var ADVANCE_ARIA_LABELS = ["Avanti", "Next"];
  var attemptsByStory = /* @__PURE__ */ new Map();
  function isSponsoredStoryVisible(root) {
    const text = root.textContent ?? "";
    return [...SPONSORED_LABEL.it, ...SPONSORED_LABEL.en].some((needle) => text.includes(needle));
  }
  function dispatchClick2(el, coords) {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ...coords }));
  }
  function clickAdvanceButton(root) {
    const selector = ADVANCE_ARIA_LABELS.map((label) => `[aria-label="${label}"]`).join(", ");
    const button = root.querySelector(selector);
    if (!button) return false;
    dispatchClick2(button);
    return true;
  }
  function tapRightThird(win = window) {
    const x = win.innerWidth * 0.85;
    const y = win.innerHeight / 2;
    const el = win.document.elementFromPoint(x, y);
    if (el) dispatchClick2(el, { clientX: x, clientY: y });
  }
  function processStoriesAds(root, route, getStoryKey) {
    if (route.kind !== "stories") return;
    const storyKey = getStoryKey();
    if (!isSponsoredStoryVisible(root)) {
      attemptsByStory.delete(storyKey);
      return;
    }
    const attempts = attemptsByStory.get(storyKey) ?? 0;
    if (attempts >= MAX_ATTEMPTS_PER_STORY) return;
    attemptsByStory.set(storyKey, attempts + 1);
    if (!clickAdvanceButton(root)) {
      tapRightThird();
    }
  }

  // src/platforms/instagram/index.ts
  function currentStoryKey() {
    const media = document.querySelector("video, img[srcset]");
    return media?.getAttribute("src") ?? location.href;
  }
  function startInstagramPlatform(onRoute) {
    let currentRoute = classifyInstagramRoute(location.pathname, location.search);
    const getRoute = () => currentRoute;
    const reelLock = createReelLockController();
    const dmReelLock = createDmReelLock();
    const routeGuard = startRouteGuard((route) => {
      currentRoute = route;
      reelLock.handleRoute(route);
      onRoute?.(route);
    });
    const processors2 = [
      processNavCleanup,
      processAppBanners,
      ...registerExploreSearchProcessors(getRoute),
      registerFeedFilterProcessor(getRoute),
      registerFeedReelsPlaceholderProcessor(getRoute),
      registerFeedLimiterProcessor(getRoute, { getAccount: () => detectLoggedInUsername() }),
      (root) => processStoriesAds(root, getRoute(), currentStoryKey),
      (root) => dmReelLock.process(root, getRoute())
    ];
    const unregisterAll = processors2.map(registerProcessor);
    return () => {
      routeGuard.stop();
      for (const unregister of unregisterAll) unregister();
    };
  }

  // src/platforms/instagram/section.ts
  function sectionForRoute(route) {
    switch (route.kind) {
      case "feed":
        return "feed";
      case "direct":
        return "dm";
      case "stories":
        return "stories";
      case "profile":
      case "post":
        return "profile";
      case "reel-lock":
        return "reel";
      case "explore":
      case "explore-search":
        return "search";
      case "redirect-to-following":
      case "blocked":
      case "activity":
      case "passthrough":
        return "other";
    }
  }

  // src/platforms/youtube/routes.ts
  var SHORTS_PATH = /^\/shorts\/([A-Za-z0-9_-]+)/;
  function classifyYoutubeRoute(pathname) {
    const shortsMatch = SHORTS_PATH.exec(pathname);
    if (shortsMatch?.[1]) {
      return { kind: "shorts-redirect", videoId: shortsMatch[1] };
    }
    if (pathname === "/watch") {
      return { kind: "watch" };
    }
    return { kind: "browse" };
  }
  function watchUrlFor(videoId) {
    return `/watch?v=${videoId}`;
  }

  // src/platforms/youtube/selectors.ts
  var SHORTS = {
    // verified 2026-09-17 (point p): every individual Shorts card (home feed,
    // search results, channel) is exactly one of these, always wrapping an
    // `a[href^="/shorts/"]`. 8/8 Shorts cards in the home capture matched.
    lockupTag: "ytm-shorts-lockup-view-model",
    // verified 2026-09-17 (point p): the shelf wrapper around a Shorts row in
    // home. This tag is generic (also wraps non-Shorts shelves, e.g. "Ultime
    // notizie" in the same capture) -- only hide an instance that actually
    // contains a `lockupTag` descendant, never unconditionally.
    shelfWrapperTag: "ytm-rich-section-renderer",
    // verified 2026-09-17 (point p): the bottom tab bar's Shorts entry carries
    // this semantic (non-hashed) class on its tab/title elements, alongside
    // Home/Iscrizioni/Tu using the equivalent pivot-w2w/pivot-subs/pivot-you.
    bottomTabItemTag: "ytm-pivot-bar-item-renderer",
    bottomTabClass: "pivot-shorts",
    // verified 2026-09-17 (point p): fallback for a Shorts link rendered
    // outside a `lockupTag` card -- observed in the home capture's "Ultime
    // notizie" shelf (a `shelfWrapperTag` mixed with normal /watch cards, so
    // the whole shelf must NOT be hidden): `ytm-video-with-context-renderer >
    // ytm-media-item.big-shorts-singleton > a[href^="/shorts/"]`. Hide the
    // nearest `ytm-video-with-context-renderer` ancestor so the whole card
    // (thumbnail + metadata) disappears, not just the link.
    looseLinkSelector: 'a[href^="/shorts/"]',
    looseLinkCardAncestorSelector: "ytm-video-with-context-renderer"
  };

  // src/platforms/youtube/shorts-hider.ts
  function hide2(el, marker) {
    if (!markProcessed(el, marker)) return;
    el.style.display = "none";
  }
  function hideShelvesContainingShorts(root) {
    for (const shelf of root.querySelectorAll(SHORTS.shelfWrapperTag)) {
      if (!shelf.querySelector(SHORTS.lockupTag)) continue;
      hide2(shelf, "yt-shorts-shelf");
    }
  }
  function hideBottomTab(root) {
    for (const item of root.querySelectorAll(SHORTS.bottomTabItemTag)) {
      if (!item.querySelector(`.${SHORTS.bottomTabClass}`)) continue;
      hide2(item, "yt-shorts-tab");
    }
  }
  function hideLooseShortsLinks(root) {
    for (const link of root.querySelectorAll(SHORTS.looseLinkSelector)) {
      const card = link.closest(SHORTS.looseLinkCardAncestorSelector) ?? link;
      hide2(card, "yt-shorts-loose-link");
    }
  }
  var processShortsHider = (root) => {
    hideShelvesContainingShorts(root);
    hideBottomTab(root);
    hideLooseShortsLinks(root);
  };

  // src/platforms/youtube/index.ts
  function redirectAwayFromShorts(route) {
    if (route.kind !== "shorts-redirect" || !route.videoId) return;
    void incrementBlock("blocked_route");
    location.replace(watchUrlFor(route.videoId));
  }
  function startYoutubePlatform(onRoute) {
    const classifyAndHandle = (pathname) => {
      const route = classifyYoutubeRoute(pathname);
      onRoute?.(route);
      redirectAwayFromShorts(route);
    };
    classifyAndHandle(location.pathname);
    const stopWatching = watchUrl((url) => {
      classifyAndHandle(new URL(url, location.origin).pathname);
    });
    const unregister = registerProcessor(processShortsHider);
    return () => {
      stopWatching();
      unregister();
    };
  }

  // src/platforms/youtube/section.ts
  function sectionForRoute2(route) {
    return route.kind === "watch" ? "video" : "browse";
  }

  // src/main.ts
  var REPO = "glingus/socialmerd";
  var INTERACTION_WINDOW_MS = 6e4;
  var PILL_REFRESH_MS = 5e3;
  function isFullscreenVideo() {
    const doc = document;
    return doc.fullscreenElement != null || doc.webkitFullscreenElement != null;
  }
  function metaUrlFor(channel) {
    if (channel === "greasyfork") return null;
    const branch = channel === "main" ? "main" : "dev";
    return `https://raw.githubusercontent.com/${REPO}/${branch}/dist/socialmerd.meta.js`;
  }
  function startPlatform(site) {
    let instagramRoute = null;
    let youtubeRoute = null;
    let onRouteChanged = null;
    if (site === "instagram") {
      startInstagramPlatform((route) => {
        instagramRoute = route;
        onRouteChanged?.();
      });
    } else {
      startYoutubePlatform((route) => {
        youtubeRoute = route;
        onRouteChanged?.();
      });
    }
    return {
      getInstagramRoute: () => instagramRoute,
      getYoutubeRoute: () => youtubeRoute,
      setOnRouteChanged: (fn) => {
        onRouteChanged = fn;
      }
    };
  }
  async function bootstrapUi(site, routes) {
    const settings = await getSettings();
    let pillEnabled = settings.pillEnabled;
    let lang = detectLang(navigator.language, settings.langOverride);
    const host = getHost();
    let hasRecentInteraction = false;
    let interactionTimer = null;
    const markInteraction = () => {
      hasRecentInteraction = true;
      if (interactionTimer) clearTimeout(interactionTimer);
      interactionTimer = setTimeout(() => {
        hasRecentInteraction = false;
      }, INTERACTION_WINDOW_MS);
    };
    for (const type of ["pointerdown", "keydown", "touchstart", "scroll"]) {
      document.addEventListener(type, markInteraction, { capture: true, passive: true });
    }
    function isVideoPlaying() {
      for (const video of document.querySelectorAll("video")) {
        if (!video.paused) return true;
      }
      return false;
    }
    function getSection() {
      if (site === "instagram") {
        const route2 = routes.getInstagramRoute();
        return route2 ? { site: "instagram", section: sectionForRoute(route2) } : null;
      }
      const route = routes.getYoutubeRoute();
      return route ? { site: "youtube", section: sectionForRoute2(route) } : null;
    }
    startTimeTracker({ hasRecentInteraction: () => hasRecentInteraction, isVideoPlaying, getSection });
    let hasUpdate = false;
    const debugOverlay = createDebugOverlay(host, lang);
    const panel = createPanel(host, {
      getLang: () => lang,
      version: "0.1.0.17",
      channel: "dev",
      hasUpdate: () => hasUpdate,
      onSettingsChanged: (next) => {
        pillEnabled = next.pillEnabled;
        lang = detectLang(navigator.language, next.langOverride);
        refreshPill();
      },
      onDebugTap: () => debugOverlay.open()
    });
    const pill = createPill(host, lang, () => void panel.toggle());
    function refreshPill() {
      const pathname = location.pathname;
      const hidden = !pillEnabled || shouldHidePill(
        site === "youtube" ? { site, pathname, isFullscreenVideo: isFullscreenVideo() } : { site, pathname }
      );
      void getDayStats().then((stats) => {
        const minutes = site === "instagram" ? igMinutes(stats) : ytMinutes(stats);
        pill.update(minutes, hasUpdate, hidden);
      });
    }
    routes.setOnRouteChanged(refreshPill);
    setInterval(refreshPill, PILL_REFRESH_MS);
    refreshPill();
    const metaUrl = metaUrlFor("dev");
    if (settings.updateCheckEnabled && metaUrl) {
      const result = await checkForUpdate({ currentVersion: "0.1.0.17", metaUrl });
      hasUpdate = result.hasUpdate;
      refreshPill();
    }
    if (!await hasSeenWelcome()) {
      showWelcome(host, lang);
    }
  }
  function main() {
    const site = detectSite();
    if (!site) return;
    const routes = startPlatform(site);
    void bootstrapUi(site, routes);
  }
  main();
})();
