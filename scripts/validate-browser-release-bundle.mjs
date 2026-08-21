import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export function validateBrowserReleaseBundle(rootDirectory, expectedRunId) {
  const root = path.resolve(rootDirectory);
  const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });

  const files = walk(root);
  const jsonFiles = files.filter((file) => path.basename(file) === 'public-heads.json');
  const tarballs = files.filter((file) => file.endsWith('.tgz'));

  if (files.length !== 4 || jsonFiles.length !== 1 || tarballs.length !== 3) {
    throw new Error(`Expected exactly public-heads.json plus three tarballs; found ${files.map((file) => path.relative(root, file)).join(', ')}`);
  }

  const evidence = JSON.parse(fs.readFileSync(jsonFiles[0], 'utf8'));
  if (evidence.schemaVersion !== 3 || String(evidence.workflow?.runId) !== String(expectedRunId)) {
    throw new Error('Downloaded evidence does not identify this schema-v3 workflow run');
  }

  const packages = evidence.packages;
  if (!packages || typeof packages !== 'object' || Array.isArray(packages)) {
    throw new Error('Downloaded evidence does not contain package identities');
  }

  const packageEntries = Object.entries(packages);
  if (packageEntries.length !== 3) {
    throw new Error(`Expected exactly three package identities; found ${packageEntries.length}`);
  }

  for (const [name, value] of packageEntries) {
    if (!value?.tarball?.filename || typeof value.tarball.sha256 !== 'string' || !Number.isInteger(value.tarball.bytes)) {
      throw new Error(`${name} evidence is missing a complete tarball identity`);
    }

    const matches = tarballs.filter((file) => path.basename(file) === value.tarball.filename);
    if (matches.length !== 1) {
      throw new Error(`Expected one archived tarball for ${name}; found ${matches.length}`);
    }

    const file = matches[0];
    const bytes = fs.statSync(file).size;
    const sha256 = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    if (bytes !== value.tarball.bytes || sha256 !== value.tarball.sha256) {
      throw new Error(`${name} archived tarball identity differs from public-heads.json`);
    }
  }

  return evidence;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const rootDirectory = process.argv[2];
  const expectedRunId = process.argv[3] ?? process.env.GITHUB_RUN_ID;
  if (!rootDirectory || !expectedRunId) {
    throw new Error('Usage: node scripts/validate-browser-release-bundle.mjs <bundle-directory> <expected-run-id>');
  }
  validateBrowserReleaseBundle(rootDirectory, expectedRunId);
}
