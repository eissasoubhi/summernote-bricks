import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const root = process.cwd();
const galleryRoot = resolve(root, 'packages', 'gallery');
const tempRoot = await mkdtemp(join(tmpdir(), 'snb-gallery-cutover-'));
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

function installDom() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.Node = dom.window.Node;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Element = dom.window.Element;
  return dom;
}

try {
  execFileSync('mkdir', ['-p', packDir, consumerDir]);

  const packOutput = execFileSync(
    'npm',
    ['pack', '--json', '--ignore-scripts', '--pack-destination', packDir],
    { cwd: galleryRoot, encoding: 'utf8' },
  );
  const [pack] = JSON.parse(packOutput);
  assert(pack?.filename, 'npm pack did not return a Gallery tarball filename.');

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
    'dist/summernote-gallery.browser.js',
    'dist/summernote-gallery.browser.js.map',
    'dist/types/index.d.ts',
  ];
  const missing = required.filter((entry) => !files.has(entry));
  assert(missing.length === 0, `Gallery tarball is missing: ${missing.join(', ')}`);

  const forbidden = [...files].filter((entry) =>
    entry.startsWith('src/') ||
    entry.startsWith('test/') ||
    entry.startsWith('scripts/') ||
    entry.startsWith('v3-tooling/') ||
    entry.includes('packages/core'),
  );
  assert(forbidden.length === 0, `Gallery tarball leaks internal files: ${forbidden.join(', ')}`);

  const manifest = JSON.parse(await readFile(join(galleryRoot, 'package.json'), 'utf8'));
  assert(manifest.private !== true, 'Gallery publishability cutover regressed: packed package is private again.');
  assert(manifest.main === './dist/index.umd.cjs', 'Gallery CommonJS entrypoint drifted.');
  assert(manifest.module === './dist/index.js', 'Gallery ESM entrypoint drifted.');
  assert(manifest.browser === './dist/index.umd.cjs', 'Gallery browser entrypoint drifted.');
  assert(manifest.types === './dist/types/index.d.ts', 'Gallery declaration entrypoint drifted.');
  assert(
    JSON.stringify(manifest.exports) === JSON.stringify({
      '.': {
        types: './dist/types/index.d.ts',
        import: './dist/index.js',
        require: './dist/index.umd.cjs',
      },
    }),
    'Gallery exports map drifted from the pinned standalone package contract.',
  );

  await writeFile(
    join(consumerDir, 'package.json'),
    JSON.stringify({ name: 'gallery-clean-consumer', private: true, type: 'module' }, null, 2),
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
const esm = await import('summernote-gallery');
if (typeof esmSummernote.plugins.summernoteGallery !== 'function') {
  throw new Error('Installed ESM entrypoint did not register summernoteGallery.');
}
if (typeof esm.renderGallery !== 'function' || typeof esm.parseGallery !== 'function') {
  throw new Error('Installed ESM entrypoint lost Gallery public helpers.');
}

delete globalThis.$;
const { createRequire } = await import('node:module');
const require = createRequire(import.meta.url);
const cjsSummernote = installSummernoteStub();
const cjs = require('summernote-gallery');
if (typeof cjsSummernote.plugins.summernoteGallery !== 'function') {
  throw new Error('Installed CommonJS entrypoint did not register summernoteGallery.');
}
if (typeof cjs.renderGallery !== 'function' || typeof cjs.parseGallery !== 'function') {
  throw new Error('Installed CommonJS entrypoint lost Gallery public helpers.');
}
`;
  await writeFile(join(consumerDir, 'check.mjs'), consumerCheck);
  execFileSync('node', ['check.mjs'], { cwd: consumerDir, stdio: 'pipe' });

  installDom();
  installSummernoteStub();
  const esmUrl = `${pathToFileURL(join(galleryRoot, 'dist', 'index.js')).href}?persisted-html=${Date.now()}`;
  const gallery = await import(esmUrl);

  const persistedCases = [
    {
      data: {
        images: [
          { src: '/media/a.jpg', alt: 'Alpha' },
        ],
      },
      html: '<div class="snb-brick snb-gallery" data-snb-brick="gallery" data-snb-version="3" role="group" aria-label="Image gallery"><figure class="snb-gallery__item"><img src="/media/a.jpg" alt="Alpha" loading="lazy" decoding="async"></figure></div>',
    },
    {
      data: {
        images: [
          {
            id: 'hero',
            src: '/media/hero.jpg',
            alt: 'Hero',
            title: 'Homepage hero',
            caption: 'Launch day',
            width: 1200,
            height: 800,
          },
          { src: '/media/thumb.jpg', alt: '' },
        ],
      },
      html: '<div class="snb-brick snb-gallery" data-snb-brick="gallery" data-snb-version="3" role="group" aria-label="Image gallery"><figure class="snb-gallery__item"><img src="/media/hero.jpg" alt="Hero" loading="lazy" decoding="async" data-snb-image-id="hero" title="Homepage hero" width="1200" height="800"><figcaption class="snb-gallery__caption">Launch day</figcaption></figure><figure class="snb-gallery__item"><img src="/media/thumb.jpg" alt="" loading="lazy" decoding="async"></figure></div>',
    },
  ];

  for (const fixture of persistedCases) {
    const rendered = gallery.renderGallery(fixture.data);
    assert(rendered.outerHTML === fixture.html, 'Persisted Gallery HTML drifted from the deterministic v3 contract.');
    const expectedData = {
      images: fixture.data.images.map((image) => gallery.normalizeGalleryImage(image)),
    };
    assert(
      JSON.stringify(gallery.parseGallery(rendered)) === JSON.stringify(expectedData),
      'Persisted Gallery parse/render round-trip drifted.',
    );
  }

  const legacyHost = document.createElement('div');
  legacyHost.setAttribute('data-brickdata', JSON.stringify({
    selectedImages: [{ id: 'legacy-1', url: '/legacy/image.jpg', title: 'Legacy title' }],
  }));
  legacyHost.innerHTML = '<img src="/legacy/image.jpg" alt="Legacy alt" title="Legacy title">';
  const legacyData = gallery.parseLegacyGallery(legacyHost);
  assert(
    JSON.stringify(legacyData) === JSON.stringify({
      images: [{ src: '/legacy/image.jpg', alt: 'Legacy alt', id: 'legacy-1', title: 'Legacy title' }],
    }),
    'Legacy Gallery migration parser drifted from the preserved v2 contract.',
  );
  const migrated = gallery.migrateLegacyGallery(legacyHost);
  assert(migrated?.getAttribute('data-snb-version') === '3', 'Legacy Gallery migration did not create v3 persisted markup.');
  assert(
    JSON.stringify(gallery.parseGallery(migrated)) === JSON.stringify(legacyData),
    'Legacy Gallery migration lost persisted image data.',
  );

  const browserBundle = await readFile(join(galleryRoot, 'dist', 'summernote-gallery.browser.js'), 'utf8');
  assert(
    browserBundle.includes('sourceMappingURL=summernote-gallery.browser.js.map'),
    'Gallery browser alias has an invalid source-map reference.',
  );
  assert(browserBundle.includes('summernoteGallery'), 'Gallery browser alias lost Summernote plugin registration.');

  console.log(`Gallery tarball/consumer gate passed: ${basename(tarball)} (${files.size} files).`);
  console.log('Verified exact file set, ESM/CommonJS clean-consumer loading, browser alias, deterministic v3 persisted HTML and legacy migration round-trip.');
  console.log('Publishability is enabled, but publication remains disabled until the coordinated release train uses a new immutable version.');
} finally {
  delete globalThis.$;
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.Node;
  delete globalThis.HTMLElement;
  delete globalThis.Element;
  await rm(tempRoot, { recursive: true, force: true });
}
