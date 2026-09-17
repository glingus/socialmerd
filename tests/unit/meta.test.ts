import { describe, expect, it } from 'vitest';
import { renderMetaBlock } from '../../src/meta';

describe('renderMetaBlock', () => {
  it('includes updateURL/downloadURL on the main branch', () => {
    const header = renderMetaBlock({ version: '0.1.0', channel: 'main' });
    expect(header).toContain('@version      0.1.0');
    expect(header).toContain(
      '@updateURL    https://raw.githubusercontent.com/glingus/socialmerd/main/dist/socialmerd.meta.js',
    );
    expect(header).toContain(
      '@downloadURL  https://raw.githubusercontent.com/glingus/socialmerd/main/dist/socialmerd.user.js',
    );
  });

  it('points at the dev branch for the dev channel', () => {
    const header = renderMetaBlock({ version: '0.1.0.5', channel: 'dev' });
    expect(header).toContain('/dev/dist/socialmerd.meta.js');
    expect(header).toContain('/dev/dist/socialmerd.user.js');
  });

  it('omits updateURL/downloadURL for greasyfork', () => {
    const header = renderMetaBlock({ version: '0.1.0', channel: 'greasyfork' });
    expect(header).not.toContain('@updateURL');
    expect(header).not.toContain('@downloadURL');
  });
});
