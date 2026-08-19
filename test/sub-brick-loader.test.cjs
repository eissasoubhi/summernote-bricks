const test = require('node:test');
const assert = require('node:assert/strict');
const SubBrickLoader = require('../src/Module/SubBrickLoader');

function contextWith(memos) {
  return {
    memo(key) {
      return memos[key];
    }
  };
}

test('loads an official brick button through its alias', () => {
  const loader = new SubBrickLoader();
  const button = { id: 'gallery-button' };
  const context = contextWith({
    'button.summernoteGallery': () => button
  });

  assert.equal(loader.loadButton(context, 'summernote-gallery'), button);
});

test('loads any direct Summernote button without registering it in Bricks', () => {
  const loader = new SubBrickLoader();
  const button = { id: 'custom-button' };
  const context = contextWith({
    'button.myCustomBrick': () => button
  });

  assert.equal(loader.loadButton(context, 'myCustomBrick'), button);
});

test('supports custom aliases', () => {
  const loader = new SubBrickLoader();
  const button = { id: 'company-button' };
  const context = contextWith({
    'button.companyBrick': () => button
  });

  loader.register('company', 'companyBrick');

  assert.equal(loader.loadButton(context, 'company'), button);
});

test('fails clearly when the required plugin button is not registered', () => {
  const loader = new SubBrickLoader();

  assert.throws(
    () => loader.loadButton(contextWith({}), 'summernote-heading'),
    /summernoteHeading.*registered before editor initialization/
  );
});
