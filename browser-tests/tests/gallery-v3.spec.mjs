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

    test('searches through the source adapter', async ({ page }) => {
      const dialog = await openGalleryDialog(page, 0);
      await dialog.locator('.snb-gallery-v3-form__query').fill('ocean');
      await dialog.locator('.snb-gallery-v3-form__search-button').click();

      await expect(dialog.getByRole('option', { name: /ocean/i })).toHaveCount(1);
      await expect(dialog.getByRole('option', { name: /mountain/i })).toHaveCount(0);
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
