// ==UserScript==
// @name         socialmerd
// @namespace    https://github.com/glingus/socialmerd
// @description  Instagram and YouTube without the addictive parts, in the Orion browser on iPhone (via Tampermonkey).
// @description:it  Instagram e YouTube senza le parti che creano dipendenza, nel browser Orion su iPhone (tramite Tampermonkey).
// @version      0.1.0.9
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

  // src/core/dom-scheduler.ts
  var processors = /* @__PURE__ */ new Set();
  var observer = null;
  var scheduled = false;
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
    return true;
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

  // src/platforms/instagram/explore-search.ts
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
    ...SUGGESTED_FOR_YOU_HEADING.en,
    ...FOLLOW_BUTTON.it,
    ...FOLLOW_BUTTON.en
  ]);
  function processFeedFilter(root, route) {
    if (route.kind !== "feed") return;
    for (const post of root.querySelectorAll(FEED.postSelector)) {
      if (!markProcessed(post, "feed-filter")) continue;
      const text = post.textContent ?? "";
      const shouldHide = [...HIDE_TEXTS].some((needle) => text.includes(needle));
      if (shouldHide) {
        post.style.display = "none";
      }
    }
  }
  var registerFeedFilterProcessor = (getRoute) => (root) => processFeedFilter(root, getRoute());

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

  // src/core/blocks.ts
  async function incrementBlock(type, date = /* @__PURE__ */ new Date()) {
    const stats = await getDayStats(date);
    stats.blocks[type] += 1;
    await setDayStats(stats, date);
    return stats.blocks[type];
  }

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

  // src/core/i18n/en.ts
  var en = {
    "welcome.title": "Welcome to socialmerd",
    "placeholder.watchReel": "Watch reel"
  };

  // src/core/i18n/it.ts
  var it = {
    "welcome.title": "Benvenuto su socialmerd",
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
            returnSilently(action.origin, navigate);
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

  // src/core/url-watcher.ts
  function getNavigation() {
    return window.navigation;
  }
  function watchUrl(onChange, options = {}) {
    const intervalMs = options.intervalMs ?? 250;
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
  var defaultNavigate3 = {
    back: () => history.back(),
    replace: (url) => location.replace(url)
  };
  function handleRoute(url, navigate = defaultNavigate3) {
    const { pathname, search } = new URL(url, location.origin);
    const route = classifyInstagramRoute(pathname, search);
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
  function startInstagramPlatform() {
    let currentRoute = classifyInstagramRoute(location.pathname, location.search);
    const getRoute = () => currentRoute;
    const reelLock = createReelLockController();
    const routeGuard = startRouteGuard((route) => {
      currentRoute = route;
      reelLock.handleRoute(route);
    });
    const processors2 = [
      processNavCleanup,
      processAppBanners,
      ...registerExploreSearchProcessors(getRoute),
      registerFeedFilterProcessor(getRoute),
      registerFeedReelsPlaceholderProcessor(getRoute),
      registerFeedLimiterProcessor(getRoute, { getAccount: () => detectLoggedInUsername() }),
      (root) => processStoriesAds(root, getRoute(), currentStoryKey)
    ];
    const unregisterAll = processors2.map(registerProcessor);
    return () => {
      routeGuard.stop();
      for (const unregister of unregisterAll) unregister();
    };
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
    if (site === "instagram") {
      startInstagramPlatform();
      return;
    }
    const count = await getValue(COUNT_KEY, 0) + 1;
    await setValue(COUNT_KEY, count);
    renderBadge(site, count);
  }
  void main();
})();
