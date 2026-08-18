const test = require('node:test');
const assert = require('node:assert/strict');
const BrickRegistry = require('../src/Module/BrickRegistry');

class GalleryBrick {}
class CustomBrick {}

test('registers and resolves brick constructors', () => {
  const registry = new BrickRegistry({ gallery: GalleryBrick });

  assert.equal(registry.resolve('gallery'), GalleryBrick);
  assert.deepEqual(registry.names(), ['gallery']);
});

test('supports registering future bricks without changing the registry', () => {
  const registry = new BrickRegistry();

  registry.register('custom', CustomBrick);

  assert.equal(registry.has('custom'), true);
  assert.equal(registry.resolve('custom'), CustomBrick);
});

test('fails fast with a useful error for an unknown brick', () => {
  const registry = new BrickRegistry({ gallery: GalleryBrick });

  assert.throws(
    () => registry.resolve('missing'),
    /Unknown Summernote brick "missing".*gallery/
  );
});

test('rejects invalid registrations', () => {
  const registry = new BrickRegistry();

  assert.throws(() => registry.register('', CustomBrick), TypeError);
  assert.throws(() => registry.register('invalid', {}), TypeError);
});
