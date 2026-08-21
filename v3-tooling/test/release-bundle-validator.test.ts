import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const temporaryDirectories: string[] = [];
const validator = path.resolve('scripts/validate-browser-release-bundle.mjs');

function makeBundle(runId = '123') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'summernote-bricks-release-bundle-'));
  temporaryDirectories.push(root);

  const packages = Object.fromEntries(['bricks', 'heading', 'gallery'].map((name) => {
    const filename = `${name}-3.0.0-rc.0.tgz`;
    const contents = Buffer.from(`${name}-archive`);
    fs.writeFileSync(path.join(root, filename), contents);
    return [name, {
      tarball: {
        filename,
        sha256: crypto.createHash('sha256').update(contents).digest('hex'),
        bytes: contents.length,
      },
    }];
  }));

  fs.writeFileSync(path.join(root, 'public-heads.json'), JSON.stringify({
    schemaVersion: 3,
    workflow: { runId },
    packages,
  }));

  return root;
}

function validate(root: string, runId = '123') {
  return () => execFileSync(process.execPath, [validator, root, runId], { encoding: 'utf8' });
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe('browser-tested release bundle validator', () => {
  it('accepts exactly three digest-matching tarballs and schema-v3 evidence', () => {
    expect(validate(makeBundle())).not.toThrow();
  });

  it('rejects a tarball whose bytes changed after evidence was recorded', () => {
    const root = makeBundle();
    fs.appendFileSync(path.join(root, 'heading-3.0.0-rc.0.tgz'), 'tampered');
    expect(validate(root)).toThrow(/identity differs/);
  });

  it('rejects extra files in the archived release bundle', () => {
    const root = makeBundle();
    fs.writeFileSync(path.join(root, 'unexpected.txt'), 'unexpected');
    expect(validate(root)).toThrow(/Expected exactly public-heads\.json plus three tarballs/);
  });

  it('rejects evidence from a different workflow run', () => {
    expect(validate(makeBundle('999'), '123')).toThrow(/does not identify this schema-v3 workflow run/);
  });
});
