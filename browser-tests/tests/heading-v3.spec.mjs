import { expect, test } from '@playwright/test';

const variants = [
  { name: 'bs5', path: '/browser-tests/fixtures/bs5-heading.html' },
  { name: 'lite', path: '/browser-tests/fixtures/lite-heading.html' },
];

async function openHeadingDialog(page, editorIndex = 0) {
  const editor = page.locator('.note-editor').nth(editorIndex);
  await editor.getByRole('button', { name: /insert heading/i }).click();
  return page.locator('.snb-heading-form:visible');
}

async function saveHeading(page, data = {}) {
  const form = page.locator('.snb-heading-form:visible');
  await form.locator('.snb-heading-form__level').selectOption(String(data.level || 2));
  await form.locator('.snb-heading-form__title').fill(data.title || 'Semantic title');
  await form.locator('.snb-heading-form__subtitle').fill(data.subtitle || 'Optional subtitle');
  await form.locator('.snb-heading-form__anchor').fill(data.anchor || 'semantic-title');
  await page.locator('.snb-heading-form__save:visible').click();
}

for (const variant of variants) {
  test.describe(`Heading v3 on Summernote ${variant.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(variant.path);
      await expect(page.locator('.note-editor')).toHaveCount(2);
    });

    test('creates semantic persisted HTML and isolates editor instances', async ({ page }) => {
      await openHeadingDialog(page, 0);
      await saveHeading(page, { level: 3, title: 'Architecture', subtitle: 'Summernote native', anchor: 'architecture' });

      const firstEditable = page.locator('.note-editable').nth(0);
      const secondEditable = page.locator('.note-editable').nth(1);
      const brick = firstEditable.locator('[data-snb-brick="heading"][data-snb-version="3"]');
      const heading = brick.locator('h3');

      await expect(heading).toHaveText('Architecture');
      await expect(heading).toHaveAttribute('id', 'architecture');
      await expect(brick.locator('.snb-heading__subtitle')).toHaveText('Summernote native');
      await expect(secondEditable.locator('[data-snb-brick="heading"]')).toHaveCount(0);
      await expect(brick.locator('.snb-brick-actions')).toHaveCount(0);
      await expect(brick.locator('style')).toHaveCount(0);
    });

    test('round-trips persisted heading HTML through destroy and recreate', async ({ page }) => {
      await openHeadingDialog(page, 0);
      await saveHeading(page, { level: 3, title: 'Persistent heading', subtitle: 'Round trip', anchor: 'persistent-heading' });

      const persistedHtml = await page.evaluate(() => $('#editor-a').summernote('code'));
      expect(persistedHtml).toContain('data-snb-brick="heading"');
      expect(persistedHtml).toContain('data-snb-version="3"');
      expect(persistedHtml).toContain('<h3 class="snb-heading__title" id="persistent-heading">Persistent heading</h3>');
      expect(persistedHtml).not.toContain('snb-brick-actions');
      expect(persistedHtml).not.toContain('<style');

      await page.evaluate(() => {
        window.destroyEditor('#editor-a');
        window.createEditor('#editor-a');
      });

      const recreated = page.locator('.note-editable').nth(0).locator('[data-snb-brick="heading"][data-snb-version="3"]');
      await expect(recreated.locator('h3')).toHaveText('Persistent heading');
      await expect(recreated.locator('h3')).toHaveAttribute('id', 'persistent-heading');
      await expect(recreated.locator('.snb-heading__subtitle')).toHaveText('Round trip');

      const reserializedHtml = await page.evaluate(() => $('#editor-a').summernote('code'));
      expect(reserializedHtml).toBe(persistedHtml);
    });

    test('edits a brick and participates in Summernote undo history', async ({ page }) => {
      await openHeadingDialog(page, 0);
      await saveHeading(page, { title: 'Before edit' });

      const firstEditable = page.locator('.note-editable').nth(0);
      const brick = firstEditable.locator('[data-snb-brick="heading"]');
      await brick.dblclick();

      const form = page.locator('.snb-heading-form:visible');
      await form.locator('.snb-heading-form__title').fill('After edit');
      await page.locator('.snb-heading-form__save:visible').click();
      await expect(firstEditable.locator('[data-snb-brick="heading"] h2')).toHaveText('After edit');

      await page.evaluate(() => window.undoEditor('#editor-a'));
      await expect(firstEditable.locator('[data-snb-brick="heading"] h2')).toHaveText('Before edit');
    });

    test('survives destroy and recreate without duplicate lifecycle state', async ({ page }) => {
      await page.evaluate(() => {
        window.destroyEditor('#editor-a');
        window.createEditor('#editor-a');
      });

      await expect(page.locator('.note-editor')).toHaveCount(2);
      await openHeadingDialog(page, 0);
      await saveHeading(page, { title: 'Recreated editor' });

      const firstEditor = page.locator('.note-editor').nth(0);
      const firstEditable = firstEditor.locator('.note-editable');
      await expect(firstEditable.locator('[data-snb-brick="heading"] h2')).toHaveText('Recreated editor');
      await expect(firstEditor.getByRole('button', { name: /insert heading/i })).toHaveCount(1);
    });
  });
}
