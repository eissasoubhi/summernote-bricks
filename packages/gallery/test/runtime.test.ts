// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { galleryImageKey, type GalleryImage } from '../src/gallery';
import {
  persistGallerySelection,
  seedGallerySelection,
  type GalleryCommandContext,
} from '../src/runtime';

const first: GalleryImage = {
  id: 'img-1',
  src: '/first.jpg',
  alt: 'First',
  caption: 'Caption',
};

const second: GalleryImage = {
  src: '/second.jpg',
  alt: 'Second',
};

function commandContext(calls: string[]): GalleryCommandContext {
  return {
    invoke(command: string, ...args: unknown[]): unknown {
      calls.push(command);
      if (command === 'editor.insertNode') {
        expect(args[0]).toBeInstanceOf(HTMLElement);
      }
      return undefined;
    },
  };
}

describe('Gallery save runtime contract', () => {
  it('seeds editing selection from persisted v3 HTML using stable image keys', () => {
    const host = document.createElement('div');
    host.innerHTML = [
      '<div class="snb-brick snb-gallery" data-snb-brick="gallery" data-snb-version="3">',
      '<figure class="snb-gallery__item"><img src="/first.jpg" alt="First" data-snb-image-id="img-1"><figcaption class="snb-gallery__caption">Caption</figcaption></figure>',
      '<figure class="snb-gallery__item"><img src="/second.jpg" alt="Second"></figure>',
      '</div>',
    ].join('');

    const selected = seedGallerySelection(host.firstElementChild);
    expect(Array.from(selected.keys())).toEqual(['img-1', '/second.jpg']);
    expect(selected.get('img-1')?.caption).toBe('Caption');
  });

  it('inserts a new gallery through Summernote editor.insertNode', () => {
    const calls: string[] = [];
    const selected = new Map([
      [galleryImageKey(first), first],
      [galleryImageKey(second), second],
    ]);

    const element = persistGallerySelection(commandContext(calls), selected);

    expect(calls).toEqual(['editor.insertNode']);
    expect(element.getAttribute('data-snb-brick')).toBe('gallery');
    expect(element.querySelectorAll('.snb-gallery__item')).toHaveLength(2);
  });

  it('edits persisted gallery inside beforeCommand/afterCommand boundaries', () => {
    const calls: string[] = [];
    const parent = document.createElement('div');
    const editingTarget = document.createElement('div');
    editingTarget.setAttribute('data-snb-brick', 'gallery');
    parent.appendChild(editingTarget);

    const selected = new Map([[galleryImageKey(second), second]]);
    const next = persistGallerySelection(commandContext(calls), selected, editingTarget);

    expect(calls).toEqual(['editor.beforeCommand', 'editor.afterCommand']);
    expect(parent.firstElementChild).toBe(next);
    expect(next.querySelector('img')?.getAttribute('src')).toBe('/second.jpg');
  });

  it('always closes the Summernote command boundary if replacement throws', () => {
    const calls: string[] = [];
    const editingTarget = document.createElement('div');
    vi.spyOn(editingTarget, 'replaceWith').mockImplementation(() => {
      throw new Error('replace failed');
    });

    const selected = new Map([[galleryImageKey(first), first]]);
    expect(() => persistGallerySelection(commandContext(calls), selected, editingTarget)).toThrow('replace failed');
    expect(calls).toEqual(['editor.beforeCommand', 'editor.afterCommand']);
  });

  it('rejects an empty selection before issuing editor commands', () => {
    const calls: string[] = [];
    expect(() => persistGallerySelection(commandContext(calls), new Map())).toThrow('Select at least one image.');
    expect(calls).toEqual([]);
  });
});
