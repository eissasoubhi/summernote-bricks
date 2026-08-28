// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderGalleryDialogBody, renderGalleryDialogFooter } from '../src/dialog';
import { defaultGalleryOptions, resolveGalleryOptions } from '../src/options';

const upload = { upload: async () => [] };

describe('Gallery options/dialog contract', () => {
  it('preserves the standalone defaults and local overrides', () => {
    expect(defaultGalleryOptions.defaultView).toBe('grid');
    expect(defaultGalleryOptions.buttonLabel).toBe('Gallery');
    expect(resolveGalleryOptions({ saveText: 'Save' }).saveText).toBe('Save');
    expect(resolveGalleryOptions({ saveText: 'Save' }).dialogTitle).toBe('Image gallery');
  });

  it('uses editor-scoped search and upload ids and omits upload controls without an adapter', () => {
    const body = renderGalleryDialogBody({ options: { id: 'alpha' } }, defaultGalleryOptions);
    expect(body).toContain('id="snb-gallery-alpha-search"');
    expect(body).not.toContain('snb-gallery-v3-form__upload-input');
    expect(body).toContain('role="listbox"');
    expect(body).toContain('aria-multiselectable="true"');
  });

  it('renders upload controls only when configured and escapes labels/footer text', () => {
    const options = resolveGalleryOptions({
      upload,
      uploadLabel: '<Upload & go>',
      uploadText: 'Add "files"',
      saveText: '<Insert>',
    });
    const body = renderGalleryDialogBody({ options: { id: 'beta' } }, options);
    expect(body).toContain('id="snb-gallery-beta-upload"');
    expect(body).toContain('&lt;Upload &amp; go&gt;');
    expect(body).toContain('Add &quot;files&quot;');
    expect(renderGalleryDialogFooter(options)).toContain('&lt;Insert&gt;');
  });
});
