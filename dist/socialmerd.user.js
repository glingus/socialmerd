// ==UserScript==
// @name         socialmerd
// @namespace    https://github.com/glingus/socialmerd
// @description  Instagram and YouTube without the addictive parts, in Safari on iPhone (via the Userscripts app).
// @description:it  Instagram e YouTube senza le parti che creano dipendenza, in Safari su iPhone (tramite l'app Userscripts).
// @version      0.1.0.5
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

  // src/main.ts
  var BADGE_ID = "smd-hello-badge";
  var STYLE_ID = "smd-hello-style";
  var COUNT_KEY = "smd:v1:hello:count";
  injectStyle(
    `
  #${BADGE_ID} {
    position: fixed;
    right: 12px;
    bottom: 12px;
    z-index: 2147483647;
    padding: 6px 10px;
    border-radius: 8px;
    background: #111;
    color: #fff;
    font: 12px/1.4 -apple-system, system-ui, sans-serif;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    pointer-events: none;
    opacity: 0.85;
  }
  `,
    STYLE_ID
  );
  function renderBadge(site, count) {
    let badge = document.getElementById(BADGE_ID);
    if (!badge) {
      badge = document.createElement("div");
      badge.id = BADGE_ID;
      document.documentElement.appendChild(badge);
    }
    badge.textContent = `socialmerd hello \xB7 ${site} \xB7 ${"dev"} \xB7 visite: ${count}`;
  }
  async function main() {
    const site = detectSite();
    if (!site) return;
    const count = await getValue(COUNT_KEY, 0) + 1;
    await setValue(COUNT_KEY, count);
    renderBadge(site, count);
  }
  void main();
})();
