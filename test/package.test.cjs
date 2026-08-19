const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));

function packagePath(relativePath) {
  return path.join(root, relativePath);
}

test('published entrypoint exists after build', () => {
  assert.equal(typeof pkg.main, 'string');
  assert.ok(fs.existsSync(packagePath(pkg.main)), `missing main entrypoint: ${pkg.main}`);
});

test('package allow-list keeps the distributable focused', () => {
  assert.ok(Array.isArray(pkg.files));
  assert.ok(pkg.files.includes('dist'));
  assert.ok(pkg.files.includes('README.md'));
  assert.ok(pkg.files.includes('LICENSE'));
});
