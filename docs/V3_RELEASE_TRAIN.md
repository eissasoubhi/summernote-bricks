# v3 coordinated release train

The maintained v3 release train covers `summernote-bricks`, `summernote-heading`, and `summernote-gallery`.

## Public-head invariant

A publishable bundle is valid only when the release-eligible Bricks `master` Browser compatibility run records the exact current public heads of all three repositories in `public-heads.json`.

If Heading or Gallery moves after the browser run starts, that artifact is stale even when every browser test passed. Do not publish it. Run Browser compatibility again from the real Bricks `master` head and use only the newly archived tarballs.

PR-only, synthetic, locally rebuilt, or manually repacked tarballs are never publication evidence.

## Publication order

1. Confirm Bricks `master`, Heading `main`, and Gallery `master` are the intended release sources.
2. Confirm package and lockfile identities match in every package.
3. Run the Bricks Browser compatibility workflow on real public `master`.
4. Verify `public-heads.json` records the current exact SHAs and marks the workflow release-eligible.
5. Publish the exact archived tarballs. Prereleases use npm tag `next`; stable versions use `latest`.
6. Verify registry integrity and perform a clean-consumer install.
7. Create matching Git tags and GitHub Releases at the exact tested source SHAs.

Any public-head change between steps 3 and 5 invalidates the bundle and returns the train to step 3.

`SNB-components` is independent and is not part of this coordinated publication workflow.
