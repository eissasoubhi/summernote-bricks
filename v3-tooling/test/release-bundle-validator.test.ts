import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const temporaryDirectories: string[] = [];
const validator = path.resolve('scripts/validate-browser-release-bundle.mjs');

function makeBundle(runId = '123', releaseEligible = false) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'summernote-bricks-release-bundle-'));
  temporaryDirectories.push(root);

  const packages = Object.fromEntries(['bricks', 'heading', 'gallery'].map((name) => {
    const filename = `${name}-3.0.0-rc.0.tgz`;
    const contents = Buffer.from(`${name}-archive`);
    fs.writeFileSync(path.join(root, filename), contents);
    return [name, {
      ...(name === 'bricks' ? {
        ref: releaseEligible ? 'refs/heads/master' : 'refs/pull/1/merge',
        sha: releaseEligible ? 'public-master-sha' : 'synthetic-merge-sha',
        sourceRef: releaseEligible ? 'master' : 'agent/example',
        sourceSha: releaseEligible ? 'public-master-sha' : 'source-branch-sha',
      } : {}),
      tarball: {
        filename,
        sha256: crypto.createHash('sha256').update(contents).digest('hex'),
        bytes: contents.length,
      },
    }];
  }));

  fs.writeFileSync(path.join(root, 'public-heads.json'), JSON.stringify({
    schemaVersion: 4,
    workflow: {
      runId,
      event: releaseEligible ? 'push' : 'pull_request',
      releaseEligible,
    },
    packages,
  }));

  return root;
}

function validate(root: string, runId = '123', releaseEligible?: boolean) {
  const args = [validator, root, runId];
  if (releaseEligible !== undefined) args.push(String(releaseEligible));
  return () => execFileSync(process.execPath, args, { encoding: 'utf8' });
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe('browser-tested release bundle validator', () => {
  it('accepts exactly three digest-matching tarballs and schema-v4 CI evidence', () => {
    expect(validate(makeBundle(), '123', false)).not.toThrow();
  });

  it('accepts release-eligible evidence only for the exact public Bricks master head', () => {
    expect(validate(makeBundle('123', true), '123', true)).not.toThrow();
  });

  it('rejects release eligibility that differs from the expected artifact class', () => {
    expect(validate(makeBundle(), '123', true)).toThrow(/release eligibility is false; expected true/);
  });

  it('rejects release-eligible evidence for a synthetic pull-request ref', () => {
    const root = makeBundle('123', true);
    const evidencePath = path.join(root, 'public-heads.json');
    const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
    evidence.workflow.event = 'pull_request';
    evidence.packages.bricks.ref = 'refs/pull/1/merge';
    evidence.packages.bricks.sha = 'synthetic-merge-sha';
    fs.writeFileSync(evidencePath, JSON.stringify(evidence));
    expect(validate(root, '123', true)).toThrow(/exact public Bricks master head/);
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
    expect(validate(makeBundle('999'), '123')).toThrow(/does not identify this schema-v4 workflow run/);
  });
});
