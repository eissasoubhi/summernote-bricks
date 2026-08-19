import { expect, test } from '@playwright/test';

const variants = [
  { name: 'bs5', path: '/browser-tests/fixtures/bs5-composition.html' },
  { name: 'lite', path: '/browser-tests/fixtures/lite-composition.html' },
];

async function openBricksMenu(page) {
  const editor = page.locator('.note-editor');
  await editor.getByRole('button', { name: /summernote bricks/i }).click();
  return editor;
}

for (const variant of variants) {
  test.describe(`Bricks v3 composition on Summernote ${variant.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(variant.path);
      await expect(page.locator('.note-editor')).toHaveCount(1);
    });

    test('composes registered Heading and Gallery buttons in one editor', async ({ page }) => {
      const editor = await openBricksMenu(page);
      await editor.getByRole('button', { name: /insert heading/i }).click();

      const headingForm = page.locator('.snb-heading-form:visible');
      const title = headingForm.getByLabel('Title', { exact: true });
      await expect(title).toBeFocused();
      await title.fill('Composed heading');
      await headingForm.getByLabel('Subtitle', { exact: true }).fill('Shared editor');
      await page.locator('.snb-heading-form__save:visible').click();

      await openBricksMenu(page);
      await editor.getByRole('button', { name: /insert gallery/i }).click();

      const galleryForm = page.locator('.snb-gallery-v3-form:visible');
      await expect(galleryForm.getByLabel('Search images', { exact: true })).toBeFocused();
      await expect(galleryForm.locator('.snb-gallery-v3-form__item')).toHaveCount(2);
      await expect(galleryForm.getByRole('option', { name: /mountain/i })).toHaveCount(1);
      await galleryForm.getByRole('option', { name: /mountain/i }).click();
      await page.locator('.snb-gallery-v3-form__save:visible').click();

      const editable = editor.locator('.note-editable');
      await expect(editable.locator('[data-snb-brick="heading"] h2')).toHaveText('Composed heading');
      await expect(editable.locator('[data-snb-brick="gallery"] img')).toHaveAttribute('data-snb-image-id', 'mountain');

      const persistedHtml = await page.evaluate(() => $('#composition-editor').summernote('code'));
      expect(persistedHtml).toContain('data-snb-brick="heading"');
      expect(persistedHtml).toContain('data-snb-brick="gallery"');
      expect(persistedHtml).not.toContain('snb-brick-actions');
    });
  });
}
