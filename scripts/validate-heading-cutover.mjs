import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const headingRoot = join(root, 'packages', 'heading');
const packageJson = JSON.parse(await readFile(join(headingRoot, 'package.json'), 'utf8'));

const standaloneBaseline = {
  name: 'summernote-heading',
  version: '3.0.0-rc.1',
  main: './dist/index.umd.cjs',
  module: './dist/index.js',
  browser: './dist/index.umd.cjs',
  types: './dist/types/index.d.ts',
  peerDependencies: {
    jquery: '>=3.6.0 <4',
    summernote: '>=0.9.1 <0.10',
  },
};
const expectedReleaseVersion = '3.0.0-rc.2';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function assertFile(relativePath) {
  const fullPath = join(headingRoot, relativePath);
  const metadata = await stat(fullPath).catch(() => null);
  assert(metadata?.isFile(), `Heading build output is missing ${relativePath}.`);
  return fullPath;
}

assert(packageJson.name === standaloneBaseline.name, 'Heading package name drifted from standalone npm identity.');
assert(packageJson.version === expectedReleaseVersion, `Heading release identity must be ${expectedReleaseVersion}.`);
assert(packageJson.private !== true, 'Heading publishability cutover regressed: package is private again.');
assert(packageJson.main === standaloneBaseline.main, 'Heading CommonJS entrypoint differs from standalone.');
assert(packageJson.module === standaloneBaseline.module, 'Heading ESM entrypoint differs from standalone.');
assert(packageJson.browser === standaloneBaseline.browser, 'Heading browser entrypoint differs from standalone.');
assert(packageJson.types === standaloneBaseline.types, 'Heading declaration entrypoint differs from standalone.');
assert(
  JSON.stringify(packageJson.peerDependencies) === JSON.stringify(standaloneBaseline.peerDependencies),
  'Heading peer dependency contract differs from the standalone package.',
);
assert(packageJson.exports?.['.']?.types === standaloneBaseline.types, 'Heading exports.types differs from standalone.');
assert(packageJson.exports?.['.']?.import === standaloneBaseline.module, 'Heading exports.import differs from standalone.');
assert(packageJson.exports?.['.']?.require === standaloneBaseline.main, 'Heading exports.require differs from standalone.');

const sourceDir = join(headingRoot, 'src');
const sourceFiles = (await readdir(sourceDir)).filter((file) => file.endsWith('.ts'));
for (const file of sourceFiles) {
  const content = await readFile(join(sourceDir, file), 'utf8');
  assert(!content.includes("../../core/"), `${file} leaks the private SNB Core path into the Heading public ABI.`);
  assert(!content.includes("../core/"), `${file} leaks the private SNB Core path into the Heading public ABI.`);
  assert(!content.includes('packages/core'), `${file} leaks the private SNB Core package layout.`);
}

const requiredOutputs = [
  'dist/index.js',
  'dist/index.js.map',
  'dist/index.umd.cjs',
  'dist/index.umd.cjs.map',
  'dist/summernote-heading.browser.js',
  'dist/summernote-heading.browser.js.map',
  'dist/types/index.d.ts',
  'dist/types/index.d.ts.map',
];
for (const relativePath of requiredOutputs) {
  await assertFile(relativePath);
}

const declarationFiles = [];
async function collectDeclarations(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectDeclarations(fullPath);
    } else if (entry.name.endsWith('.d.ts')) {
      declarationFiles.push(fullPath);
    }
  }
}
await collectDeclarations(join(headingRoot, 'dist', 'types'));
assert(declarationFiles.length > 0, 'Heading declaration build produced no .d.ts files.');
for (const file of declarationFiles) {
  const content = await readFile(file, 'utf8');
  assert(!content.includes('../../core'), 'Heading declarations leak the private SNB Core path.');
  assert(!content.includes('packages/core'), 'Heading declarations leak the private SNB Core package layout.');
}

const esm = await readFile(join(headingRoot, 'dist', 'index.js'), 'utf8');
const cjs = await readFile(join(headingRoot, 'dist', 'index.umd.cjs'), 'utf8');
const browserAlias = await readFile(join(headingRoot, 'dist', 'summernote-heading.browser.js'), 'utf8');
assert(esm.includes('Summernote must be loaded before summernote-heading.'), 'Heading ESM bundle lost the Summernote load-order guard.');
assert(cjs.includes('Summernote must be loaded before summernote-heading.'), 'Heading CommonJS bundle lost the Summernote load-order guard.');
assert(browserAlias.includes('Summernote must be loaded before summernote-heading.'), 'Heading browser alias lost the Summernote load-order guard.');
assert(browserAlias.includes('summernoteHeading'), 'Heading browser alias lost plugin registration.');

console.log('Heading publishability cutover gate passed.');
console.log(`Pinned standalone identity baseline: ${standaloneBaseline.name}@${standaloneBaseline.version}`);
console.log(`Prepared coordinated release identity: ${standaloneBaseline.name}@${expectedReleaseVersion}`);
console.log('Verified publishable metadata, ESM, CommonJS, browser metadata/alias and declarations with no private SNB Core leakage.');
console.log('This gate makes the package publishable but does not publish it or transfer release workflow ownership by itself.');
