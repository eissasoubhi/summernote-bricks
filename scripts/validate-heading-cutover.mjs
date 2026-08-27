import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const headingRoot = join(root, 'packages', 'heading');
const packageJson = JSON.parse(await readFile(join(headingRoot, 'package.json'), 'utf8'));

const expectedStandalone = {
  name: 'summernote-heading',
  version: '3.0.0-rc.1',
  peerDependencies: {
    jquery: '>=3.6.0 <4',
    summernote: '>=0.9.1 <0.10',
  },
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(packageJson.name === expectedStandalone.name, 'Heading package name drifted from standalone npm identity.');
assert(packageJson.version === expectedStandalone.version, 'Heading staged version drifted from the pinned standalone baseline.');
assert(packageJson.private === true, 'Heading must remain private until build/tarball equivalence is proven.');

if (packageJson.peerDependencies) {
  assert(
    JSON.stringify(packageJson.peerDependencies) === JSON.stringify(expectedStandalone.peerDependencies),
    'Heading peer dependency contract differs from the standalone package.',
  );
}

const sourceDir = join(headingRoot, 'src');
const files = (await readdir(sourceDir)).filter((file) => file.endsWith('.ts'));
for (const file of files) {
  const content = await readFile(join(sourceDir, file), 'utf8');
  assert(!content.includes("../../core/"), `${file} leaks the private SNB Core path into the Heading public ABI.`);
  assert(!content.includes("../core/"), `${file} leaks the private SNB Core path into the Heading public ABI.`);
  assert(!content.includes('packages/core'), `${file} leaks the private SNB Core package layout.`);
}

console.log('Heading cutover package gate passed.');
console.log(`Pinned standalone identity: ${expectedStandalone.name}@${expectedStandalone.version}`);
console.log('Publication remains disabled until build, declarations, entrypoints and tarball equivalence are proven.');
