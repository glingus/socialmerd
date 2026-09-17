// Minimal document-start CSS injection. Runs before <head>/<body> exist,
// so the style element is attached directly to documentElement.

export function injectStyle(css: string, id: string): void {
  const existing = document.getElementById(id);
  if (existing) {
    existing.textContent = css;
    return;
  }
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.documentElement.appendChild(style);
}
