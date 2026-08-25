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
const missing = required.filter((path) => !files.has(path));
if (missing.length) throw new Error(`Bricks package is missing: ${missing.join(', ')}`);

const forbidden = [...files].filter((path) =>
  path.startsWith('src/') ||
  path.startsWith('test/') ||
  path.startsWith('v3-tooling/') ||
  path === 'package.v3.json'
);
if (forbidden.length) throw new Error(`Bricks package leaks internal files: ${forbidden.join(', ')}`);

const manifest = JSON.parse(readFileSync(resolve(repoDir, 'package.json'), 'utf8'));
if (manifest.name !== 'summernote-bricks') throw new Error(`Unexpected package name: ${manifest.name}`);
if (typeof manifest.version !== 'string' || !/^3\.0\.0(?:-rc\.\d+)?$/.test(manifest.version)) {
  throw new Error(`Unexpected package version: ${manifest.version}`);
}
if (manifest.peerDependencies?.jquery !== '>=3.6.0 <4' || manifest.peerDependencies?.summernote !== '>=0.9.1 <0.10') {
  throw new Error('Unexpected host peer dependency contract.');
}

const esm = await import(`${pathToFileURL(resolve(repoDir, 'dist/summernote-bricks.js')).href}?package-check=${Date.now()}`);
if (typeof esm.registerSummernoteBricks !== 'function') throw new Error('ESM entrypoint is invalid.');

const require = createRequire(import.meta.url);
const cjs = require(resolve(repoDir, 'dist/summernote-bricks.umd.cjs'));
if (typeof cjs.registerSummernoteBricks !== 'function') throw new Error('CommonJS entrypoint is invalid.');

const browserJquery = {
  extend(target, ...sources) { return Object.assign(target, ...sources); },
  summernote: { plugins: {} },
};
const sandbox = { jQuery: browserJquery, $: browserJquery };
vm.runInNewContext(readFileSync(resolve(repoDir, 'dist/summernote-bricks.umd.cjs'), 'utf8'), sandbox);
const Plugin = browserJquery.summernote.plugins.summernoteBricks;
if (typeof Plugin !== 'function') throw new Error('Browser artifact did not register Bricks.');

browserJquery.summernote.ui = {
  button: () => ({ render: () => ({}) }),
  dropdown: () => ({}),
  buttonGroup: () => ({ render: () => ({}) }),
};
const memos = new Map();
const context = {
  options: {},
  memo(key, value) {
    if (arguments.length === 2) {
      memos.set(key, value);
      return value;
    }
    return memos.get(key);
  },
};
new Plugin(context);
if (typeof context.memo('button.summernoteBricks') !== 'function') {
  throw new Error('Browser artifact did not initialize through the Summernote constructor lifecycle.');
}

console.log(`Validated summernote-bricks@${manifest.version} (${files.size} package files).`);
