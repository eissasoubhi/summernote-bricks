// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  migrateLegacyHeading,
  normalizeHeadingData,
  parseHeading,
  parseLegacyHeading,
  renderHeading,
} from '../src/heading';

describe('Heading content contract', () => {
  it('round-trips semantic heading content', () => {
    const node = renderHeading({
      level: 2,
      title: 'Architecture',
      subtitle: 'Summernote native',
      anchor: 'architecture',
    });

    expect(node.getAttribute('data-snb-brick')).toBe('heading');
    expect(node.getAttribute('data-snb-version')).toBe('3');
    expect(node.querySelector('h2')?.id).toBe('architecture');
    expect(parseHeading(node)).toEqual({
      level: 2,
      title: 'Architecture',
      subtitle: 'Summernote native',
      anchor: 'architecture',
    });
  });

  it('omits optional fields that normalize to empty text', () => {
    const normalized = normalizeHeadingData({
      level: 3,
      title: '  Clean heading  ',
      subtitle: '   ',
      anchor: '',
    });

    expect(normalized).toEqual({ level: 3, title: 'Clean heading' });
    expect(normalized).not.toHaveProperty('subtitle');
    expect(normalized).not.toHaveProperty('anchor');
  });

  it('migrates legacy persisted markup only when explicitly requested', () => {
    const legacy = document.createElement('div');
    legacy.setAttribute('data-brickdata', JSON.stringify({
      title: 'Legacy title',
      subtitle: 'Legacy subtitle',
      underlineColor: '#123456',
    }));
    legacy.innerHTML = '<h1 class="snb-heading-title">Legacy title<span>Legacy subtitle</span></h1><style>.old { color: red; }</style>';

    expect(parseLegacyHeading(legacy)).toEqual({
      level: 1,
      title: 'Legacy title',
      subtitle: 'Legacy subtitle',
    });

    const migrated = migrateLegacyHeading(legacy);
    expect(migrated?.getAttribute('data-snb-version')).toBe('3');
    expect(migrated?.querySelector('style')).toBeNull();
    expect(migrated?.hasAttribute('data-brickdata')).toBe(false);
    expect(legacy.hasAttribute('data-brickdata')).toBe(true);
  });

  it('rejects malformed legacy payloads without mutating source content', () => {
    const legacy = document.createElement('div');
    legacy.setAttribute('data-brickdata', '{not-json');
    legacy.innerHTML = '<h1 class="snb-heading-title">Broken</h1>';

    expect(parseLegacyHeading(legacy)).toBeNull();
    expect(migrateLegacyHeading(legacy)).toBeNull();
    expect(legacy.getAttribute('data-brickdata')).toBe('{not-json');
  });
});
