import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const tooling = path.join(root, 'v3-tooling');
const staged = path.join(root, '.v3-public-package');

await rm(staged, { recursive: true, force: true });
await mkdir(staged, { recursive: true });
await cp(path.join(tooling, 'dist'), path.join(staged, 'dist'), { recursive: true });
await cp(path.join(root, 'README.md'), path.join(staged, 'README.md'));
await cp(path.join(root, 'LICENSE'), path.join(staged, 'LICENSE'));
await writeFile(path.join(staged, 'package.json'), await readFile(path.join(root, 'package.v3.json')));

const pack = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json'], {
  cwd: staged,
  encoding: 'utf8',
}));
const files = new Set(pack[0].files.map(({ path: file }) => file));

const required = [
  'package.json',
  'README.md',
  'LICENSE',
  'dist/summernote-bricks.js',
  'dist/summernote-bricks.js.map',
  'dist/summernote-bricks.umd.cjs',
  'dist/summernote-bricks.umd.cjs.map',
  'dist/index.d.ts',
  'dist/index.d.ts.map',
];
for (const file of required) {
  if (!files.has(file)) throw new Error(`Public package is missing ${file}`);
}
for (const file of files) {
  if (file.startsWith('src/') || file.startsWith('test/') || file.includes('v3-tooling')) {
    throw new Error(`Internal file leaked into public package: ${file}`);
  }
}

const manifest = JSON.parse(await readFile(path.join(staged, 'package.json'), 'utf8'));
if (manifest.name !== 'summernote-bricks' || manifest.version !== '3.0.0-rc.0') {
  throw new Error('Unexpected public package identity.');
}
if (manifest.peerDependencies?.jquery !== '>=3.6.0 <4' || manifest.peerDependencies?.summernote !== '>=0.9.1 <0.10') {
  throw new Error('Unexpected Summernote/jQuery peer dependency contract.');
}

const esm = await import(pathToFileURL(path.join(staged, 'dist/summernote-bricks.js')).href);
if (typeof esm.registerSummernoteBricks !== 'function') throw new Error('ESM entrypoint does not expose registerSummernoteBricks.');

const require = createRequire(path.join(staged, 'package.json'));
const cjs = require(path.join(staged, 'dist/summernote-bricks.umd.cjs'));
if (typeof cjs.registerSummernoteBricks !== 'function') throw new Error('CommonJS entrypoint does not expose registerSummernoteBricks.');

// Exercise the actual packaged UMD in browser-global mode. Summernote 0.9.x can
// expose its plugin registry before $.summernote.ui is populated, so script-tag
// registration must succeed at that point and defer UI access until Summernote
// constructs the plugin with `new ModuleClass(context)` during Context.module().
const browserJquery = {
  extend(target, ...sources) {
    return Object.assign(target, ...sources);
  },
  summernote: { plugins: {} },
};
const browserSandbox = { jQuery: browserJquery, $: browserJquery };
const umdSource = await readFile(path.join(staged, 'dist/summernote-bricks.umd.cjs'), 'utf8');
vm.runInNewContext(umdSource, browserSandbox, { filename: 'summernote-bricks.umd.cjs' });

const browserPlugin = browserJquery.summernote.plugins.summernoteBricks;
if (typeof browserPlugin !== 'function') {
  throw new Error('Browser UMD did not auto-register summernoteBricks with the Summernote plugin registry.');
}

browserJquery.summernote.ui = {
  button: () => ({ render: () => ({}) }),
  dropdown: () => ({}),
  buttonGroup: () => ({ render: () => ({}) }),
};
const memos = new Map();
const browserContext = {
  options: {},
  memo(key, value) {
    if (arguments.length === 2) {
      memos.set(key, value);
      return value;
    }
    return memos.get(key);
  },
};
new browserPlugin(browserContext);
if (typeof browserContext.memo('button.summernoteBricks') !== 'function') {
  throw new Error('Browser UMD did not register the summernoteBricks button after deferred UI setup.');
}

console.log(`Validated ${files.size} files in summernote-bricks@${manifest.version}.`);
