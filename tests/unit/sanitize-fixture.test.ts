import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from '../../scripts/sanitize-fixture.mjs';

describe('sanitizeHtml', () => {
  it('removes script and noscript tags', () => {
    const out = sanitizeHtml('<html><body><script>steal()</script><noscript>x</noscript><p>hi</p></body></html>');
    expect(out).not.toContain('steal()');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('<noscript');
    expect(out).toContain('<p>hi</p>');
  });

  it('removes HTML comments', () => {
    const out = sanitizeHtml('<html><body><!-- secret --><p>hi</p></body></html>');
    expect(out).not.toContain('secret');
  });

  it('redirects CDN media URLs to a placeholder', () => {
    const out = sanitizeHtml(
      '<html><body><img src="https://scontent.cdninstagram.com/v/abc123.jpg?token=xyz"></body></html>',
    );
    expect(out).toContain('https://example.invalid/media/placeholder.jpg');
    expect(out).not.toContain('cdninstagram.com');
    expect(out).not.toContain('token=xyz');
  });

  it('leaves non-media URLs untouched', () => {
    const out = sanitizeHtml('<html><body><a href="/p/abc123/">post</a></body></html>');
    expect(out).toContain('href="/p/abc123/"');
  });

  it('strips inline event handler attributes', () => {
    const out = sanitizeHtml('<html><body><div onclick="steal()">hi</div></body></html>');
    expect(out).not.toContain('onclick');
  });
});
