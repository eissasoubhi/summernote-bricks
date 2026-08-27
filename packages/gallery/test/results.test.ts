import { describe, expect, it } from 'vitest';
import type { GalleryImage } from '../src/gallery';
import {
  galleryResultLabel,
  renderGalleryResultItem,
  toggleGallerySelection,
} from '../src/results';

const image: GalleryImage = {
  id: 'img-1',
  src: 'https://example.test/image?a=1&b=2',
  alt: 'Alt text',
  title: '<Title>',
  caption: 'Caption',
};

describe('Gallery results contract', () => {
  it('keeps standalone label precedence', () => {
    expect(galleryResultLabel(image)).toBe('<Title>');
    expect(galleryResultLabel({ src: '/a.jpg', alt: 'Alt', caption: 'Caption' })).toBe('Alt');
    expect(galleryResultLabel({ src: '/a.jpg', alt: '', caption: 'Caption' })).toBe('Caption');
    expect(galleryResultLabel({ src: '/a.jpg', alt: '' })).toBe('/a.jpg');
  });

  it('renders the standalone result option contract with escaped content', () => {
    expect(renderGalleryResultItem(image, 3, true)).toBe(
      '<button type="button" class="snb-gallery-v3-form__item" data-index="3" role="option" aria-selected="true">' +
        '<img src="https://example.test/image?a=1&amp;b=2" alt="">' +
        '<span>&lt;Title&gt;</span>' +
        '</button>',
    );
  });

  it('toggles selection by the stable Gallery image key', () => {
    const selected = new Map<string, GalleryImage>();
    expect(toggleGallerySelection(selected, image)).toBe(true);
    expect(selected.get('img-1')).toBe(image);
    expect(toggleGallerySelection(selected, image)).toBe(false);
    expect(selected.size).toBe(0);
  });
});
