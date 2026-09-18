// docs/PIANO.md §4.3: a post-reel (its own permalink is a `/reel/` one, see
// docs/spike-findings.md point b) gets its original article hidden — with
// every <video> inside paused/muted, re-pausing if autoplay restarts it —
// and replaced by a static placeholder card: avatar, @username, date,
// static cover, first 100 letters of the caption, and a "Guarda reel"
// button linking to the isolated player (`/reel/<code>/`, reel-lock.ts).
//
// TODO (needs live verification): avatar/username/date have a solid
// selector (nav.ts's profile-link pattern, FEED.timeSelector). The caption
// extraction is a best-effort heuristic (longest `[dir="auto"]` text run
// that isn't the username or the date) — Instagram's caption markup wasn't
// pinned down further in this spike; revisit once a captioned reel is seen
// live so this can be made more precise if it turns out unreliable.

import { detectLang, t } from '../../core/i18n';
import { markProcessed, type Processor } from '../../core/dom-scheduler';
import { injectStyle } from '../../core/styles';
import { FEED } from './selectors';
import { parseReelPermalinkHref } from './routes';
import type { InstagramRoute } from './routes';

const CAPTION_MAX_LENGTH = 100;
const PLACEHOLDER_CLASS = 'smd-reel-placeholder';
const STYLE_ID = 'smd-reel-placeholder-style';

// Found live 2026-09-18: this card had no CSS at all -- the avatar rendered
// as a raw, huge, square <img> and the poster overflowed the screen width.
// Injected once at document-start, into the page itself (not the Shadow UI
// host): this card lives inside Instagram's own feed, not our overlay UI.
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
  STYLE_ID,
);

function findReelCode(article: Element): string | null {
  for (const link of article.querySelectorAll('a[href]')) {
    const code = parseReelPermalinkHref(link.getAttribute('href') ?? '');
    if (code) return code;
  }
  return null;
}

function findUsername(article: Element): string | null {
  for (const link of article.querySelectorAll('a[href]')) {
    const match = /^\/([a-zA-Z0-9_.]+)\/$/.exec(link.getAttribute('href') ?? '');
    if (match?.[1]) return match[1];
  }
  return null;
}

function findAvatarSrc(article: Element): string {
  const avatar = article.querySelector('img[alt^="Immagine del profilo"], img[alt^="Profile photo of"]');
  return avatar?.getAttribute('src') ?? '';
}

function findDateText(article: Element): string {
  const time = article.querySelector(FEED.timeSelector);
  return time?.getAttribute('title') ?? time?.textContent?.trim() ?? '';
}

function findPosterSrc(article: Element, avatarSrc: string): string {
  const video = article.querySelector('video[poster]');
  const poster = video?.getAttribute('poster');
  if (poster) return poster;

  for (const img of article.querySelectorAll('img')) {
    const src = img.getAttribute('src') ?? '';
    if (src && src !== avatarSrc) return src;
  }
  return '';
}

function findCaption(article: Element, usernameText: string, dateText: string): string {
  let longest = '';
  for (const el of article.querySelectorAll('[dir="auto"]')) {
    const text = el.textContent?.trim() ?? '';
    if (text === usernameText || text === dateText) continue;
    if (text.length > longest.length) longest = text;
  }
  return longest.slice(0, CAPTION_MAX_LENGTH);
}

function pauseAndMute(video: HTMLVideoElement): void {
  video.pause();
  video.muted = true;
  video.addEventListener('play', () => video.pause());
}

function buildPlaceholder(params: {
  code: string;
  username: string | null;
  avatarSrc: string;
  dateText: string;
  posterSrc: string;
  caption: string;
}): HTMLElement {
  const card = document.createElement('div');
  card.className = PLACEHOLDER_CLASS;

  const header = document.createElement('div');
  header.className = `${PLACEHOLDER_CLASS}-header`;
  if (params.avatarSrc) {
    const avatar = document.createElement('img');
    avatar.className = `${PLACEHOLDER_CLASS}-avatar`;
    avatar.src = params.avatarSrc;
    avatar.alt = '';
    header.appendChild(avatar);
  }
  const username = document.createElement('span');
  username.className = `${PLACEHOLDER_CLASS}-username`;
  username.textContent = params.username ? `@${params.username}` : '';
  header.appendChild(username);

  const date = document.createElement('span');
  date.className = `${PLACEHOLDER_CLASS}-date`;
  date.textContent = params.dateText;
  header.appendChild(date);
  card.appendChild(header);

  if (params.posterSrc) {
    const poster = document.createElement('img');
    poster.className = `${PLACEHOLDER_CLASS}-poster`;
    poster.src = params.posterSrc;
    poster.alt = '';
    card.appendChild(poster);
  }

  const caption = document.createElement('p');
  caption.className = `${PLACEHOLDER_CLASS}-caption`;
  caption.textContent = params.caption;
  card.appendChild(caption);

  const cta = document.createElement('a');
  cta.className = `${PLACEHOLDER_CLASS}-cta`;
  cta.href = `/reel/${params.code}/`;
  cta.textContent = t('placeholder.watchReel', detectLang());
  card.appendChild(cta);

  return card;
}

export function processFeedReelsPlaceholder(root: ParentNode, route: InstagramRoute): void {
  if (route.kind !== 'feed') return;

  for (const article of root.querySelectorAll(FEED.postSelector)) {
    if (!markProcessed(article, 'feed-reel-placeholder')) continue;

    const code = findReelCode(article);
    if (!code) continue;

    for (const video of article.querySelectorAll('video')) {
      pauseAndMute(video);
    }

    const username = findUsername(article);
    const avatarSrc = findAvatarSrc(article);
    const dateText = findDateText(article);
    const posterSrc = findPosterSrc(article, avatarSrc);
    const caption = findCaption(article, username ? `@${username}` : '', dateText);

    const placeholder = buildPlaceholder({ code, username, avatarSrc, dateText, posterSrc, caption });
    article.parentElement?.insertBefore(placeholder, article.nextSibling);
    article.style.display = 'none';
  }
}

export const registerFeedReelsPlaceholderProcessor =
  (getRoute: () => InstagramRoute): Processor =>
  (root) =>
    processFeedReelsPlaceholder(root, getRoute());
