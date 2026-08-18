const test = require('node:test');
const assert = require('node:assert/strict');
const BrickRegistry = require('../src/Module/BrickRegistry');

test('resolves official aliases to Summernote button names', () => {
  const registry = new BrickRegistry({
    'summernote-gallery': 'summernoteGallery'
  });

  assert.equal(registry.resolve('summernote-gallery'), 'summernoteGallery');
  assert.deepEqual(registry.names(), ['summernote-gallery']);
});

test('passes through a direct Summernote button name', () => {
  const registry = new BrickRegistry();

  assert.equal(registry.resolve('myCustomButton'), 'myCustomButton');
});

test('supports custom aliases without core changes', () => {
  const registry = new BrickRegistry();

  registry.register('my-company-brick', 'myCompanyBrick');

  assert.equal(registry.has('my-company-brick'), true);
  assert.equal(registry.resolve('my-company-brick'), 'myCompanyBrick');
});

test('rejects invalid aliases', () => {
  const registry = new BrickRegistry();

  assert.throws(() => registry.register('', 'button'), TypeError);
  assert.throws(() => registry.register('invalid', ''), TypeError);
  assert.throws(() => registry.register('invalid', {}), TypeError);
});
