import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

const repoDir = resolve(import.meta.dirname, '..');
const output = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
  cwd: repoDir,
  encoding: 'utf8',
});
const [pack] = JSON.parse(output);
const files = new Set(pack.files.map(({ path }) => path));
const required = [
  'package.json', 'README.md', 'LICENSE',
  'dist/summernote-bricks.js', 'dist/summernote-bricks.js.map',
  'dist/summernote-bricks.umd.cjs', 'dist/summernote-bricks.umd.cjs.map',
  'dist/index.d.ts',
];
const missing = required.filter((path) => !files.has(path));
if (missing.length) throw new Error(`Root Bricks package is missing: ${missing.join(', ')}`);
const forbidden = [...files].filter((path) => path.startsWith('src/') || path.startsWith('v3-tooling/') || path.startsWith('test/'));
if (forbidden.length) throw new Error(`Root Bricks package leaks internal files: ${forbidden.join(', ')}`);

const manifest = JSON.parse(readFileSync(resolve(repoDir, 'package.json'), 'utf8'));
if (manifest.version !== '3.0.0-rc.0') throw new Error(`Unexpected root version: ${manifest.version}`);
if (manifest.peerDependencies?.jquery !== '>=3.6.0 <4' || manifest.peerDependencies?.summernote !== '>=0.9.1 <0.10') {
  throw new Error('Unexpected root host peer contract.');
}

const esm = await import(pathToFileURL(resolve(repoDir, 'dist/summernote-bricks.js')).href);
if (typeof esm.registerSummernoteBricks !== 'function') throw new Error('Root ESM entrypoint is invalid.');
const require = createRequire(import.meta.url);
const cjs = require(resolve(repoDir, 'dist/summernote-bricks.umd.cjs'));
if (typeof cjs.registerSummernoteBricks !== 'function') throw new Error('Root CommonJS entrypoint is invalid.');

const browserJquery = { extend(target, ...sources) { return Object.assign(target, ...sources); }, summernote: { plugins: {} } };
const sandbox = { jQuery: browserJquery, $: browserJquery };
vm.runInNewContext(readFileSync(resolve(repoDir, 'dist/summernote-bricks.umd.cjs'), 'utf8'), sandbox);
const Plugin = browserJquery.summernote.plugins.summernoteBricks;
if (typeof Plugin !== 'function') throw new Error('Root browser artifact did not register Bricks.');
browserJquery.summernote.ui = {
  button: () => ({ render: () => ({}) }),
  dropdown: () => ({}),
  buttonGroup: () => ({ render: () => ({}) }),
};
const memos = new Map();
const context = { options: {}, memo(key, value) { if (arguments.length === 2) { memos.set(key, value); return value; } return memos.get(key); } };
new Plugin(context);
if (typeof context.memo('button.summernoteBricks') !== 'function') throw new Error('Root browser artifact did not initialize Bricks through the Summernote constructor lifecycle.');

console.log(`Validated promoted root Bricks package (${files.size} files).`);
