import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const root = process.cwd();
const headingRoot = resolve(root, 'packages', 'heading');
const tempRoot = await mkdtemp(join(tmpdir(), 'snb-heading-cutover-'));
const packDir = join(tempRoot, 'pack');
const consumerDir = join(tempRoot, 'consumer');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function installSummernoteStub() {
  const summernote = { plugins: {}, ui: {} };
  globalThis.$ = {
    summernote,
    extend(target, source) {
      Object.assign(target, source);
      return target;
    },
  };
  return summernote;
}

try {
  execFileSync('mkdir', ['-p', packDir, consumerDir]);

  const packOutput = execFileSync(
    'npm',
    ['pack', '--json', '--ignore-scripts', '--pack-destination', packDir],
    { cwd: headingRoot, encoding: 'utf8' },
  );
  const [pack] = JSON.parse(packOutput);
  assert(pack?.filename, 'npm pack did not return a Heading tarball filename.');

  const tarball = join(packDir, basename(pack.filename));
  const tarEntries = execFileSync('tar', ['-tf', tarball], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .map((entry) => entry.replace(/^package\//, ''));
  const files = new Set(tarEntries);

  const required = [
    'package.json',
    'README.md',
    'LICENSE',
    'dist/index.js',
    'dist/index.js.map',
    'dist/index.umd.cjs',
    'dist/index.umd.cjs.map',
    'dist/summernote-heading.browser.js',
    'dist/summernote-heading.browser.js.map',
    'dist/types/index.d.ts',
  ];
  const missing = required.filter((entry) => !files.has(entry));
  assert(missing.length === 0, `Heading tarball is missing: ${missing.join(', ')}`);

  const forbidden = [...files].filter((entry) =>
    entry.startsWith('src/') ||
    entry.startsWith('test/') ||
    entry.startsWith('scripts/') ||
    entry.startsWith('v3-tooling/') ||
    entry.includes('packages/core'),
  );
  assert(forbidden.length === 0, `Heading tarball leaks internal files: ${forbidden.join(', ')}`);

  await writeFile(
    join(consumerDir, 'package.json'),
    JSON.stringify({ name: 'heading-clean-consumer', private: true, type: 'module' }, null, 2),
  );
  execFileSync(
    'npm',
    ['install', '--ignore-scripts', '--legacy-peer-deps', '--no-audit', '--no-fund', tarball],
    { cwd: consumerDir, stdio: 'pipe' },
  );

  const consumerCheck = `
const installSummernoteStub = () => {
  const summernote = { plugins: {}, ui: {} };
  globalThis.$ = {
    summernote,
    extend(target, source) { Object.assign(target, source); return target; },
  };
  return summernote;
};

const esmSummernote = installSummernoteStub();
const esm = await import('summernote-heading');
if (esmSummernote.plugins.summernoteHeading !== esm.SummernoteHeadingV3) {
  throw new Error('Installed ESM entrypoint did not register summernoteHeading.');
}
if (typeof esm.renderHeading !== 'function' || typeof esm.parseHeading !== 'function') {
  throw new Error('Installed ESM entrypoint lost Heading public helpers.');
}

delete globalThis.$;
const { createRequire } = await import('node:module');
const require = createRequire(import.meta.url);
const cjsSummernote = installSummernoteStub();
const cjs = require('summernote-heading');
if (cjsSummernote.plugins.summernoteHeading !== cjs.SummernoteHeadingV3) {
  throw new Error('Installed CommonJS entrypoint did not register summernoteHeading.');
}
`;
  await writeFile(join(consumerDir, 'check.mjs'), consumerCheck);
  execFileSync('node', ['check.mjs'], { cwd: consumerDir, stdio: 'pipe' });

  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.Node = dom.window.Node;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Element = dom.window.Element;
  installSummernoteStub();

  const esmUrl = `${pathToFileURL(join(headingRoot, 'dist', 'index.js')).href}?persisted-html=${Date.now()}`;
  const heading = await import(esmUrl);
  const persistedCases = [
    {
      data: { level: 2, title: 'Architecture' },
      html: '<div class="snb-brick snb-heading" data-snb-brick="heading" data-snb-version="3" contenteditable="false"><h2 class="snb-heading__title">Architecture</h2></div>',
    },
    {
      data: { level: 3, title: 'Release', subtitle: 'Candidate', anchor: 'release-candidate' },
      html: '<div class="snb-brick snb-heading" data-snb-brick="heading" data-snb-version="3" contenteditable="false"><h3 class="snb-heading__title" id="release-candidate">Release</h3><p class="snb-heading__subtitle">Candidate</p></div>',
    },
  ];

  for (const fixture of persistedCases) {
    const rendered = heading.renderHeading(fixture.data);
    assert(rendered.outerHTML === fixture.html, `Persisted Heading HTML drifted for ${fixture.data.title}.`);
    assert(
      JSON.stringify(heading.parseHeading(rendered)) === JSON.stringify(fixture.data),
      `Persisted Heading parse/render round-trip drifted for ${fixture.data.title}.`,
    );
  }

  const browserBundle = await readFile(join(headingRoot, 'dist', 'summernote-heading.browser.js'), 'utf8');
  assert(
    browserBundle.includes('sourceMappingURL=summernote-heading.browser.js.map'),
    'Heading browser alias has an invalid source-map reference.',
  );

  console.log(`Heading tarball/consumer gate passed: ${basename(tarball)} (${files.size} files).`);
  console.log('Verified exact file set, ESM/CommonJS clean-consumer loading, browser alias and persisted v3 HTML.');
  console.log('Publication remains disabled; package is still private.');
} finally {
  delete globalThis.$;
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.Node;
  delete globalThis.HTMLElement;
  delete globalThis.Element;
  await rm(tempRoot, { recursive: true, force: true });
}
