const test = require('node:test');
const assert = require('node:assert/strict');
const BrickRegistry = require('../src/Module/BrickRegistry');

function createGallery() {
  return { name: 'gallery' };
}

function createCustom() {
  return { name: 'custom' };
}

test('registers, resolves and creates bricks through factories', () => {
  const registry = new BrickRegistry({ gallery: createGallery });

  assert.equal(registry.resolve('gallery'), createGallery);
  assert.deepEqual(registry.create('gallery'), { name: 'gallery' });
  assert.deepEqual(registry.names(), ['gallery']);
});

test('supports future brick factories without changing the registry', () => {
  const registry = new BrickRegistry();

  registry.register('custom', createCustom);

  assert.equal(registry.has('custom'), true);
  assert.deepEqual(registry.create('custom'), { name: 'custom' });
});

test('fails fast with a useful error for an unknown brick', () => {
  const registry = new BrickRegistry({ gallery: createGallery });

  assert.throws(
    () => registry.resolve('missing'),
    /Unknown Summernote brick "missing".*gallery/
  );
});

test('rejects invalid registrations and empty factory results', () => {
  const registry = new BrickRegistry();

  assert.throws(() => registry.register('', createCustom), TypeError);
  assert.throws(() => registry.register('invalid', {}), TypeError);

  registry.register('empty', () => null);
  assert.throws(() => registry.create('empty'), /did not return a plugin instance/);
});
