import { describe, expect, it } from 'vitest';
import { DEFAULT_ACCOUNT, detectLoggedInUsername } from '../../src/platforms/instagram/account';

// Minimal synthetic markup mirroring the real bottom nav bar structure
// confirmed in docs/spike-findings.md (points g, l) — no real captured
// fixture is used here, since the real one contains personal data.
function renderNav(profileHref: string): void {
  document.body.innerHTML = `
    <div id="nav-container">
      <a href="/"><svg aria-label="Home"></svg></a>
      <a href="/explore/"><svg aria-label="Esplora"></svg></a>
      <a href="/reels/"><svg aria-label="Reels"></svg></a>
      <a href="/direct/inbox/"><svg aria-label="Messaggi"></svg></a>
      <a href="${profileHref}"><img alt="Immagine del profilo di someone" /></a>
    </div>
  `;
}

describe('detectLoggedInUsername', () => {
  it('finds the one nav link that is not a fixed route', () => {
    renderNav('/someuser/');
    expect(detectLoggedInUsername()).toBe('someuser');
  });

  it('falls back to default when the nav is not found', () => {
    document.body.innerHTML = '<div>nothing here</div>';
    expect(detectLoggedInUsername()).toBe(DEFAULT_ACCOUNT);
  });

  it('falls back to default when every nav link is a fixed route', () => {
    document.body.innerHTML = `
      <div>
        <a href="/"><svg aria-label="Home"></svg></a>
        <a href="/explore/"><svg aria-label="Esplora"></svg></a>
      </div>
    `;
    expect(detectLoggedInUsername()).toBe(DEFAULT_ACCOUNT);
  });
});
