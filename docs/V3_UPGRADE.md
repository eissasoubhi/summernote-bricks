# Upgrade to v3

This guide is for applications moving from an older Summernote Bricks/Heading/Gallery setup to v3.

## Requirements

- jQuery `>=3.6.0 <4`
- Summernote `>=0.9.1 <0.10`

The maintained test matrix uses Summernote 0.9.1 with BS3, BS4, BS5 and Lite on Chromium, Firefox and WebKit.

## Install

For the prerelease line:

```sh
npm install jquery summernote summernote-heading@next summernote-gallery@next summernote-bricks@next
```

Heading and Gallery are standalone. Install Bricks only if you want the composed dropdown.

## Script load order

1. jQuery
2. Summernote
3. Heading/Gallery or other standalone plugins
4. Bricks
5. initialize Summernote

## Standalone use

```js
$('#editor').summernote({
  toolbar: [
    ['insert', ['summernoteHeading', 'summernoteGallery']],
  ],
});
```

## Bricks use

```js
$('#editor').summernote({
  toolbar: [
    ['extensions', ['summernoteBricks']],
  ],
  summernoteBricks: {
    subBricks: ['summernote-heading', 'summernote-gallery'],
  },
});
```

Bricks does not instantiate child plugins. Their scripts must already be loaded before editor initialization.

## What changed conceptually

Older implementations mixed plugin composition with concrete plugin construction and legacy lifecycle behavior. v3 uses Summernote's normal plugin registry and button memo contract instead.

The repository itself also no longer has a separate `v3-tooling/` project: the v3 TypeScript source, tests and build configuration are the normal root project.

## Persisted HTML and migration

Treat stored editor HTML as application data.

v3 does not automatically rewrite legacy Heading or Gallery markup when an editor opens. Use the standalone plugin migration helpers explicitly, validate the result, and persist it only when your application decides to commit the migration.

Recommended rollout:

1. deploy v3 packages without bulk content migration;
2. test create/edit/undo/destroy-recreate in the real host application;
3. test representative legacy documents;
4. back up stored editor content;
5. migrate in controlled batches;
6. keep rollback data until the migrated content has been exercised in production.

## Rollback

If package code is rolled back before stored HTML is migrated, the previous application keeps handling its existing legacy content.

If content has already been migrated to v3 semantic HTML, do not assume an older plugin can understand it. Keep backups or reversible migration records before bulk conversion.

## More detail

- [Architecture](ARCHITECTURE.md)
- [Release checklist](V3_RELEASE_CHECKLIST.md)
- [Release process](../RELEASING.md)
- issue #3 is the source of truth for ecosystem roadmap/release status.
