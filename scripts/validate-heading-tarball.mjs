import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

const root = process.cwd();
const headingRoot = resolve(root, 'packages', 'heading');
const tempRoot = mkdtempSync(join(tmpdir(), 'snb-heading-consumer-'));

function run(command, args, options = {}) {
  return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options });
}

try {
  run('npm', ['run', 'heading:build'], { cwd: root });

  const [packed] = JSON.parse(run('npm', ['pack', '--json', '--ignore-scripts'], { cwd: headingRoot }));
  const tarball = resolve(headingRoot, packed.filename);
  const files = new Set(packed.files.map(({ path }) => path));
  const required = [
    'package.json', 'README.md', 'LICENSE',
    'dist/index.js', 'dist/index.js.map',
    'dist/index.umd.cjs', 'dist/index.umd.cjs.map',
    'dist/summernote-heading.browser.js', 'dist/summernote-heading.browser.js.map',
    'dist/types/index.d.ts',
  ];
  const missing = required.filter((path) => !files.has(path));
  if (missing.length) throw new Error(`Heading tarball is missing: ${missing.join(', ')}`);

  const forbidden = [...files].filter((path) =>
    path.startsWith('src/') || path.startsWith('test/') || path.startsWith('scripts/') ||
    path.includes('packages/core') || path.startsWith('v3-tooling/'),
  );
  if (forbidden.length) throw new Error(`Heading tarball leaks internal files: ${forbidden.join(', ')}`);

  const manifest = JSON.parse(readFileSync(resolve(headingRoot, 'package.json'), 'utf8'));
  const expectedEntrypoints = {
    main: './dist/index.umd.cjs',
    module: './dist/index.js',
    browser: './dist/index.umd.cjs',
    types: './dist/types/index.d.ts',
  };
  for (const [key, value] of Object.entries(expectedEntrypoints)) {
    if (manifest[key] !== value) throw new Error(`Heading ${key} drifted from standalone: ${manifest[key]}`);
  }

  writeFileSync(join(tempRoot, 'package.json'), JSON.stringify({ name: 'heading-clean-consumer', private: true, type: 'module' }));
  run('npm', [
    'install', '--ignore-scripts', '--no-audit', '--no-fund',
    tarball, 'jquery@3.7.1', 'summernote@0.9.1', 'jsdom@26.1.0',
  ], { cwd: tempRoot });

  const consumer = `
import { createRequire } from 'node:module';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body></body></html>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
const installSummernoteStub = () => {
  const summernote = { plugins: {} };
  globalThis.$ = { summernote, extend(target, source) { Object.assign(target, source); return target; } };
  return summernote;
};
const esmSummernote = installSummernoteStub();
const esm = await import('summernote-heading');
if (esmSummernote.plugins.summernoteHeading !== esm.SummernoteHeadingV3) throw new Error('ESM consumer registration failed.');
const rendered = esm.renderHeading({ level: 2, title: 'Release heading', subtitle: 'Persisted subtitle', anchor: 'release-heading' });
const expectedHtml = '<div class="snb-brick snb-heading" data-snb-brick="heading" data-snb-version="3" contenteditable="false"><h2 class="snb-heading__title" id="release-heading">Release heading</h2><p class="snb-heading__subtitle">Persisted subtitle</p></div>';
if (rendered.outerHTML !== expectedHtml) throw new Error('Persisted Heading HTML contract drifted.');
const parsed = esm.parseHeading(rendered);
if (JSON.stringify(parsed) !== JSON.stringify({ level: 2, title: 'Release heading', subtitle: 'Persisted subtitle', anchor: 'release-heading' })) throw new Error('Persisted Heading parse round-trip failed.');
const cjsSummernote = installSummernoteStub();
const require = createRequire(import.meta.url);
const cjs = require('summernote-heading');
if (cjsSummernote.plugins.summernoteHeading !== cjs.SummernoteHeadingV3) throw new Error('CommonJS consumer registration failed.');
`;
  writeFileSync(join(tempRoot, 'consumer.mjs'), consumer);
  run(process.execPath, ['consumer.mjs'], { cwd: tempRoot });

  console.log(`Heading tarball/clean-consumer gate passed (${files.size} files, ${basename(tarball)}).`);
} finally {
  try {
    const packageJson = JSON.parse(readFileSync(resolve(headingRoot, 'package.json'), 'utf8'));
    const tarballName = `${packageJson.name.replace('@', '').replace('/', '-')}-${packageJson.version}.tgz`;
    rmSync(resolve(headingRoot, tarballName), { force: true });
  } catch {}
  rmSync(tempRoot, { recursive: true, force: true });
}
