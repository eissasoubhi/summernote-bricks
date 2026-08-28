import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

function parseExpectedEligibility(value) {
  if (value === undefined) return undefined;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  throw new Error(`Expected release eligibility to be true or false; received ${String(value)}`);
}

export function validateBrowserReleaseBundle(rootDirectory, expectedRunId, expectedReleaseEligible) {
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
  if (evidence.schemaVersion !== 4 || String(evidence.workflow?.runId) !== String(expectedRunId)) {
    throw new Error('Downloaded evidence does not identify this schema-v4 workflow run');
  }

  const releaseEligible = evidence.workflow?.releaseEligible;
  if (typeof releaseEligible !== 'boolean') {
    throw new Error('Downloaded evidence does not declare release eligibility');
  }

  const expectedEligibility = parseExpectedEligibility(expectedReleaseEligible);
  if (expectedEligibility !== undefined && releaseEligible !== expectedEligibility) {
    throw new Error(`Downloaded evidence release eligibility is ${releaseEligible}; expected ${expectedEligibility}`);
  }

  const packages = evidence.packages;
  if (!packages || typeof packages !== 'object' || Array.isArray(packages)) {
    throw new Error('Downloaded evidence does not contain package identities');
  }

  if (releaseEligible) {
    const bricks = packages.bricks;
    if (
      evidence.workflow?.event === 'pull_request'
      || bricks?.ref !== 'refs/heads/master'
      || bricks?.sourceRef !== 'master'
      || bricks?.sha !== bricks?.sourceSha
      || bricks?.sourceRepository !== 'eissasoubhi/summernote-bricks'
    ) {
      throw new Error('Release-eligible evidence must represent the exact public Bricks master head, not a pull-request or synthetic merge ref');
    }

    const monorepoPackages = {
      heading: 'packages/heading',
      gallery: 'packages/gallery',
    };
    for (const [name, sourcePath] of Object.entries(monorepoPackages)) {
      const value = packages[name];
      if (
        value?.sourceRepository !== 'eissasoubhi/summernote-bricks'
        || value?.sourceRef !== 'master'
        || value?.sourceSha !== bricks.sourceSha
        || value?.sourcePath !== sourcePath
      ) {
        throw new Error(`${name} release artifact must come from ${sourcePath} on the exact release-eligible Bricks master SHA`);
      }
    }
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
  const expectedReleaseEligible = process.argv[4];
  if (!rootDirectory || !expectedRunId) {
    throw new Error('Usage: node scripts/validate-browser-release-bundle.mjs <bundle-directory> <expected-run-id> [expected-release-eligible]');
  }
  validateBrowserReleaseBundle(rootDirectory, expectedRunId, expectedReleaseEligible);
}
