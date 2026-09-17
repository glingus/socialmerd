// ==UserScript==
// @name         socialmerd
// @namespace    https://github.com/glingus/socialmerd
// @description  Instagram and YouTube without the addictive parts, in the Orion browser on iPhone (via Tampermonkey).
// @description:it  Instagram e YouTube senza le parti che creano dipendenza, nel browser Orion su iPhone (tramite Tampermonkey).
// @version      0.1.0.11
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
