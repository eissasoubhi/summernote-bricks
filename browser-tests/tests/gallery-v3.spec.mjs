import { expect, test } from '@playwright/test';

const variants = [
  { name: 'bs5', path: '/browser-tests/fixtures/bs5-gallery.html' },
  { name: 'lite', path: '/browser-tests/fixtures/lite-gallery.html' },
];

async function openGalleryDialog(page, editorIndex = 0) {
  const editor = page.locator('.note-editor').nth(editorIndex);
  await editor.getByRole('button', { name: /insert gallery/i }).click();
  const dialog = page.locator('.snb-gallery-v3-form:visible');
  await expect(dialog.locator('.snb-gallery-v3-form__item')).toHaveCount(2);
  return dialog;
}

async function chooseImageAndSave(page, imageName) {
  const dialog = page.locator('.snb-gallery-v3-form:visible');
  await dialog.getByRole('option', { name: new RegExp(imageName, 'i') }).click();
  await page.locator('.snb-gallery-v3-form__save:visible').click();
}

for (const variant of variants) {
  test.describe(`Gallery v3 on Summernote ${variant.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(variant.path);
      await expect(page.locator('.note-editor')).toHaveCount(2);
    });

    test('creates semantic gallery HTML and isolates editors', async ({ page }) => {
      await openGalleryDialog(page, 0);
      await chooseImageAndSave(page, 'Mountain');

      const firstEditable = page.locator('.note-editable').nth(0);
      const secondEditable = page.locator('.note-editable').nth(1);
      const gallery = firstEditable.locator('[data-snb-brick="gallery"][data-snb-version="3"]');

      await expect(gallery.locator('figure')).toHaveCount(1);
      await expect(gallery.locator('img')).toHaveAttribute('data-snb-image-id', 'mountain');
      await expect(gallery.locator('img')).toHaveAttribute('alt', 'Mountain');
      await expect(gallery.locator('figcaption')).toHaveText('Mountain caption');
      await expect(secondEditable.locator('[data-snb-brick="gallery"]')).toHaveCount(0);
      await expect(gallery.locator('.snb-brick-actions')).toHaveCount(0);
      await expect(gallery.locator('style')).toHaveCount(0);
    });

    test('focuses the labeled search control and supports Enter search', async ({ page }) => {
      const dialog = await openGalleryDialog(page, 0);
      const query = dialog.getByLabel('Search images');

      await expect(query).toBeFocused();
      await expect(query).toHaveClass(/snb-gallery-v3-form__query/);
      await expect(dialog.locator('[role="status"]')).toHaveCount(1);
      await expect(dialog.locator('[role="alert"]')).toHaveCount(1);
      await expect(dialog.locator('[role="listbox"][aria-multiselectable="true"]')).toHaveCount(1);

      await query.fill('ocean');
      await query.press('Enter');
      await expect(dialog.getByRole('option', { name: /ocean/i })).toHaveCount(1);
      await expect(dialog.getByRole('option', { name: /mountain/i })).toHaveCount(0);
    });

    test('uploads through the host adapter and persists only returned image data', async ({ page }) => {
      const dialog = await openGalleryDialog(page, 0);
      const input = dialog.getByLabel('Upload images');

      await input.setInputFiles({
        name: 'fresh.png',
        mimeType: 'image/png',
        buffer: Buffer.from('browser-upload-fixture'),
      });
      await dialog.getByRole('button', { name: 'Upload', exact: true }).click();

      await expect.poll(() => page.evaluate(() => window.uploadedFiles)).toEqual(['fresh.png']);
      const uploaded = dialog.getByRole('option', { name: /fresh\.png/i });
      await expect(uploaded).toHaveCount(1);
      await expect(uploaded).toHaveAttribute('aria-selected', 'true');

      await page.locator('.snb-gallery-v3-form__save:visible').click();
      const firstEditable = page.locator('.note-editable').nth(0);
      const image = firstEditable.locator('[data-snb-brick="gallery"] img');
      await expect(image).toHaveAttribute('data-snb-image-id', 'upload-fresh.png');
      await expect(image).toHaveAttribute('alt', 'fresh.png');
      await expect(firstEditable.locator('.snb-gallery-v3-form__upload')).toHaveCount(0);
    });

    test('navigates source-only folders without persisting folder paths', async ({ page }) => {
      await page.evaluate(() => {
        window.galleryImages[0].path = 'nature/alps/mountain.jpg';
        window.galleryImages[1].path = 'nature/ocean.jpg';
      });

      const editor = page.locator('.note-editor').nth(0);
      await editor.getByRole('button', { name: /insert gallery/i }).click();
      const dialog = page.locator('.snb-gallery-v3-form:visible');
      const folders = dialog.getByRole('navigation', { name: 'Folders' });

      await expect(folders).toBeVisible();
      await expect(dialog.locator('.snb-gallery-v3-form__item')).toHaveCount(0);
      await folders.getByRole('button', { name: 'nature', exact: true }).click();
      await expect(dialog.getByRole('option', { name: /ocean/i })).toHaveCount(1);
      await expect(dialog.getByRole('option', { name: /mountain/i })).toHaveCount(0);

      await folders.getByRole('button', { name: 'alps', exact: true }).click();
      await expect(dialog.getByRole('option', { name: /mountain/i })).toHaveCount(1);
      await dialog.getByRole('option', { name: /mountain/i }).click();
      await page.locator('.snb-gallery-v3-form__save:visible').click();

      const persistedHtml = await page.evaluate(() => $('#gallery-a').summernote('code'));
      expect(persistedHtml).toContain('data-snb-image-id="mountain"');
      expect(persistedHtml).not.toContain('nature/alps');
      expect(persistedHtml).not.toContain('data-folder');
    });

    test('round-trips persisted gallery HTML through destroy and recreate', async ({ page }) => {
      await openGalleryDialog(page, 0);
      await chooseImageAndSave(page, 'Mountain');

      const persistedHtml = await page.evaluate(() => $('#gallery-a').summernote('code'));
      expect(persistedHtml).toContain('data-snb-brick="gallery"');
      expect(persistedHtml).toContain('data-snb-version="3"');
      expect(persistedHtml).toContain('<figure');
      expect(persistedHtml).not.toContain('snb-brick-actions');
      expect(persistedHtml).not.toContain('<style');

      await page.evaluate(() => {
        window.destroyGalleryEditor('#gallery-a');
        window.createGalleryEditor('#gallery-a');
      });

      const recreated = page.locator('.note-editable').nth(0).locator('[data-snb-brick="gallery"][data-snb-version="3"]');
      await expect(recreated).toHaveCount(1);
      await expect(recreated.locator('img')).toHaveAttribute('data-snb-image-id', 'mountain');
      await expect(recreated.locator('figcaption')).toHaveText('Mountain caption');

      const reserializedHtml = await page.evaluate(() => $('#gallery-a').summernote('code'));
      expect(reserializedHtml).toBe(persistedHtml);
    });

    test('searches through the source adapter', async ({ page }) => {
      const dialog = await openGalleryDialog(page, 0);
      await dialog.locator('.snb-gallery-v3-form__query').fill('ocean');
      await dialog.locator('.snb-gallery-v3-form__search-button').click();

      await expect(dialog.getByRole('option', { name: /ocean/i })).toHaveCount(1);
      await expect(dialog.getByRole('option', { name: /mountain/i })).toHaveCount(0);
    });

    test('switches accessible editor-only grid and gallery views', async ({ page }) => {
      const dialog = await openGalleryDialog(page, 0);
      const results = dialog.locator('.snb-gallery-v3-form__results');
      const grid = dialog.getByRole('button', { name: 'Grid', exact: true });
      const gallery = dialog.getByRole('button', { name: 'Gallery', exact: true });

      await expect(grid).toHaveAttribute('aria-pressed', 'true');
      await expect(gallery).toHaveAttribute('aria-pressed', 'false');
      await expect(results).toHaveAttribute('data-view', 'grid');
      await expect(results).toHaveCSS('display', 'grid');

      await gallery.click();
      await expect(grid).toHaveAttribute('aria-pressed', 'false');
      await expect(gallery).toHaveAttribute('aria-pressed', 'true');
      await expect(results).toHaveAttribute('data-view', 'gallery');
      await expect(results).toHaveCSS('display', 'flex');

      await grid.click();
      await expect(results).toHaveAttribute('data-view', 'grid');
    });

    test('edits a gallery and participates in Summernote undo history', async ({ page }) => {
      await openGalleryDialog(page, 0);
      await chooseImageAndSave(page, 'Mountain');

      const firstEditable = page.locator('.note-editable').nth(0);
      const gallery = firstEditable.locator('[data-snb-brick="gallery"]');
      await gallery.dblclick();

      const dialog = page.locator('.snb-gallery-v3-form:visible');
      await expect(dialog.locator('.snb-gallery-v3-form__item')).toHaveCount(2);
      await dialog.getByRole('option', { name: /mountain/i }).click();
      await dialog.getByRole('option', { name: /ocean/i }).click();
      await page.locator('.snb-gallery-v3-form__save:visible').click();

      await expect(firstEditable.locator('[data-snb-brick="gallery"] img')).toHaveAttribute('data-snb-image-id', 'ocean');
      await page.evaluate(() => window.undoGalleryEditor('#gallery-a'));
      await expect(firstEditable.locator('[data-snb-brick="gallery"] img')).toHaveAttribute('data-snb-image-id', 'mountain');
    });
  });
}
