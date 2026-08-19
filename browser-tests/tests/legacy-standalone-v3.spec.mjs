import { expect, test } from '@playwright/test';

const headingVariants = [
  { name: 'bs4', path: '/browser-tests/fixtures/bs4-heading.html' },
  { name: 'bs3', path: '/browser-tests/fixtures/bs3-heading.html' },
];

const galleryVariants = [
  { name: 'bs4', path: '/browser-tests/fixtures/bs4-gallery.html' },
  { name: 'bs3', path: '/browser-tests/fixtures/bs3-gallery.html' },
];

for (const variant of headingVariants) {
  test.describe(`Standalone Heading v3 on Summernote ${variant.name}`, () => {
    test('creates, round-trips and destroys cleanly', async ({ page }) => {
      await page.goto(variant.path);
      await expect(page.locator('.note-editor')).toHaveCount(2);

      const editor = page.locator('.note-editor').first();
      await editor.getByRole('button', { name: /insert heading/i }).click();
      const dialog = page.getByRole('dialog', { name: 'Heading' });
      const form = dialog.locator('.snb-heading-form');
      await expect(form.getByLabel('Title', { exact: true })).toBeFocused();
      await form.getByLabel('Level', { exact: true }).selectOption('3');
      await form.getByLabel('Title', { exact: true }).fill('Legacy interface heading');
      await form.getByLabel('Subtitle', { exact: true }).fill('Standalone');
      await form.getByLabel('Anchor', { exact: true }).fill('legacy-interface-heading');
      await dialog.getByRole('button', { name: 'Save', exact: true }).click();

      const brick = page.locator('.note-editable').first().locator('[data-snb-brick="heading"][data-snb-version="3"]');
      await expect(brick.locator('h3')).toHaveText('Legacy interface heading');
      await expect(brick.locator('h3')).toHaveAttribute('id', 'legacy-interface-heading');
      await expect(page.locator('.note-editable').nth(1).locator('[data-snb-brick="heading"]')).toHaveCount(0);

      const html = await page.evaluate(() => $('#editor-a').summernote('code'));
      expect(html).not.toContain('snb-brick-actions');
      expect(html).not.toContain('<style');

      await page.evaluate(() => {
        window.destroyEditor('#editor-a');
        window.createEditor('#editor-a');
      });
      await expect(page.locator('.note-editable').first().locator('[data-snb-brick="heading"] h3')).toHaveText('Legacy interface heading');
      expect(await page.evaluate(() => $('#editor-a').summernote('code'))).toBe(html);
    });
  });
}

for (const variant of galleryVariants) {
  test.describe(`Standalone Gallery v3 on Summernote ${variant.name}`, () => {
    test('creates, searches, undoes and round-trips cleanly', async ({ page }) => {
      await page.goto(variant.path);
      await expect(page.locator('.note-editor')).toHaveCount(2);

      const editor = page.locator('.note-editor').first();
      await editor.getByRole('button', { name: /insert gallery/i }).click();
      const dialog = page.getByRole('dialog', { name: 'Image gallery' });
      const form = dialog.locator('.snb-gallery-v3-form');
      const query = form.getByLabel('Search images');
      await expect(query).toBeFocused();
      await expect(form.locator('.snb-gallery-v3-form__item')).toHaveCount(2);
      await query.fill('mountain');
      await query.press('Enter');
      await expect(form.getByRole('option', { name: /mountain/i })).toHaveCount(1);
      await form.getByRole('option', { name: /mountain/i }).click();
      await dialog.getByRole('button', { name: 'Insert', exact: true }).click();

      const editable = page.locator('.note-editable').first();
      const gallery = editable.locator('[data-snb-brick="gallery"][data-snb-version="3"]');
      await expect(gallery.locator('img')).toHaveAttribute('data-snb-image-id', 'mountain');
      await expect(page.locator('.note-editable').nth(1).locator('[data-snb-brick="gallery"]')).toHaveCount(0);

      const html = await page.evaluate(() => $('#gallery-a').summernote('code'));
      expect(html).not.toContain('snb-brick-actions');
      expect(html).not.toContain('<style');

      await page.evaluate(() => {
        window.destroyGalleryEditor('#gallery-a');
        window.createGalleryEditor('#gallery-a');
      });
      await expect(page.locator('.note-editable').first().locator('[data-snb-brick="gallery"] img')).toHaveAttribute('data-snb-image-id', 'mountain');
      expect(await page.evaluate(() => $('#gallery-a').summernote('code'))).toBe(html);
    });
  });
}
