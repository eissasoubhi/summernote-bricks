import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const galleryRoot = join(root, 'packages', 'gallery');
const packageJson = JSON.parse(await readFile(join(galleryRoot, 'package.json'), 'utf8'));

const standaloneBaseline = {
  repository: 'eissasoubhi/summernote-gallery',
  commit: '46f623102d14b7c1b73527cb4a8c6c1e04940ed3',
  packageJsonBlob: 'da3f8cf2a900269588f47c5783ef94a0c429c7f6',
  name: 'summernote-gallery',
  version: '3.0.0-rc.1',
  main: './dist/index.umd.cjs',
  module: './dist/index.js',
  browser: './dist/index.umd.cjs',
  types: './dist/types/index.d.ts',
  files: ['dist', 'README.md', 'LICENSE'],
  peerDependencies: {
    jquery: '>=3.6.0 <4',
    summernote: '>=0.9.1 <0.10',
  },
};
const expectedReleaseVersion = '3.0.0-rc.2';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function assertFile(relativePath) {
  const fullPath = join(galleryRoot, relativePath);
  const metadata = await stat(fullPath).catch(() => null);
  assert(metadata?.isFile(), `Gallery build output is missing ${relativePath}.`);
  return fullPath;
}

assert(packageJson.name === standaloneBaseline.name, 'Gallery package name drifted from standalone npm identity.');
assert(packageJson.version === expectedReleaseVersion, `Gallery release identity must be ${expectedReleaseVersion}.`);
assert(packageJson.private !== true, 'Gallery publishability cutover regressed: package is private again.');
assert(packageJson.main === standaloneBaseline.main, 'Gallery CommonJS entrypoint differs from standalone.');
assert(packageJson.module === standaloneBaseline.module, 'Gallery ESM entrypoint differs from standalone.');
assert(packageJson.browser === standaloneBaseline.browser, 'Gallery browser entrypoint differs from standalone.');
assert(packageJson.types === standaloneBaseline.types, 'Gallery declaration entrypoint differs from standalone.');
assert(JSON.stringify(packageJson.files) === JSON.stringify(standaloneBaseline.files), 'Gallery package file contract differs from standalone.');
assert(
  JSON.stringify(packageJson.peerDependencies) === JSON.stringify(standaloneBaseline.peerDependencies),
  'Gallery peer dependency contract differs from standalone.',
);
assert(packageJson.exports?.['.']?.types === standaloneBaseline.types, 'Gallery exports.types differs from standalone.');
assert(packageJson.exports?.['.']?.import === standaloneBaseline.module, 'Gallery exports.import differs from standalone.');
assert(packageJson.exports?.['.']?.require === standaloneBaseline.main, 'Gallery exports.require differs from standalone.');

const sourceDir = join(galleryRoot, 'src');
const sourceFiles = [];
async function collectTypeScript(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) await collectTypeScript(fullPath);
    else if (entry.name.endsWith('.ts')) sourceFiles.push(fullPath);
  }
}
await collectTypeScript(sourceDir);
assert(sourceFiles.length > 0, 'Gallery source tree contains no TypeScript files.');
for (const file of sourceFiles) {
  const content = await readFile(file, 'utf8');
  assert(!content.includes('../../core/'), `${file} leaks the private SNB Core path into Gallery source.`);
  assert(!content.includes('../core/'), `${file} leaks the private SNB Core path into Gallery source.`);
  assert(!content.includes('packages/core'), `${file} leaks the private SNB Core package layout.`);
}

const requiredOutputs = [
  'dist/index.js',
  'dist/index.js.map',
  'dist/index.umd.cjs',
  'dist/index.umd.cjs.map',
  'dist/summernote-gallery.browser.js',
  'dist/summernote-gallery.browser.js.map',
  'dist/types/index.d.ts',
  'dist/types/index.d.ts.map',
];
for (const relativePath of requiredOutputs) await assertFile(relativePath);

const declarationFiles = [];
async function collectDeclarations(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) await collectDeclarations(fullPath);
    else if (entry.name.endsWith('.d.ts')) declarationFiles.push(fullPath);
  }
}
await collectDeclarations(join(galleryRoot, 'dist', 'types'));
assert(declarationFiles.length > 0, 'Gallery declaration build produced no .d.ts files.');
for (const file of declarationFiles) {
  const content = await readFile(file, 'utf8');
  assert(!content.includes('../../core'), 'Gallery declarations leak the private SNB Core path.');
  assert(!content.includes('packages/core'), 'Gallery declarations leak the private SNB Core package layout.');
}

const esm = await readFile(join(galleryRoot, 'dist', 'index.js'), 'utf8');
const cjs = await readFile(join(galleryRoot, 'dist', 'index.umd.cjs'), 'utf8');
const browserAlias = await readFile(join(galleryRoot, 'dist', 'summernote-gallery.browser.js'), 'utf8');
for (const [label, bundle] of [['ESM', esm], ['CommonJS', cjs], ['browser', browserAlias]]) {
  assert(bundle.includes('summernoteGallery'), `Gallery ${label} bundle lost Summernote plugin registration.`);
}

console.log('Gallery publishability cutover gate passed.');
console.log(`Pinned standalone baseline: ${standaloneBaseline.repository}@${standaloneBaseline.commit}`);
console.log(`Pinned standalone package identity baseline: ${standaloneBaseline.name}@${standaloneBaseline.version}`);
console.log(`Prepared coordinated release identity: ${standaloneBaseline.name}@${expectedReleaseVersion}`);
console.log(`Pinned standalone package.json blob: ${standaloneBaseline.packageJsonBlob}`);
console.log('Verified publishable metadata, ESM, CommonJS, browser entrypoints and declaration ABI isolation from private SNB Core.');
console.log('This gate makes the package publishable but does not publish it or transfer release workflow ownership by itself.');
