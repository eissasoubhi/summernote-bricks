# Upgrade to Summernote Bricks V3

This guide is for applications moving from an older Bricks integration to the V3 ecosystem.

## What changed

V3 uses the normal Summernote plugin lifecycle.

Bricks no longer owns or constructs Heading/Gallery implementations. It only groups buttons that were already registered by standalone plugins.

The supported host contract is:

- jQuery `>=3.6.0 <4`
- Summernote `>=0.9.1 <0.10`

The maintained browser matrix covers Summernote BS3, BS4, BS5, and Lite on Chromium, Firefox, and WebKit.

## 1. Update dependencies

When the V3 packages are available on npm, install the host editor and only the plugins you use:

```bash
npm install jquery summernote summernote-bricks@next
```

Add `summernote-heading@next` and/or `summernote-gallery@next` when your application uses them.

`SNB-components` is not required by Bricks, Heading, or Gallery today.

## 2. Fix script load order

Use this order:

```text
jQuery
Summernote
standalone child plugins
Summernote Bricks
initialize the editor
```

Do not initialize the editor before the child plugins are registered.

## 3. Update toolbar configuration

Recommended V3 configuration:

```js
$('#editor').summernote({
  toolbar: [['extensions', ['summernoteBricks']]],
  summernoteBricks: {
    subBricks: ['summernote-heading', 'summernote-gallery'],
  },
});
```

The friendly aliases map to `summernoteHeading` and `summernoteGallery`. Third-party Summernote button names can be used directly.

## 4. Remove old Bricks-specific construction code

Your application should not instantiate Heading/Gallery classes through Bricks or patch `$.fn.summernote` to inject them.

Each standalone plugin registers itself with Summernote. Bricks only reads the resulting button memo.

## 5. Treat persisted HTML separately

Package migration and stored-content migration are different operations.

Do not perform a database-wide HTML rewrite just because the JavaScript packages were upgraded. If Heading or Gallery legacy content needs migration, use the migration API provided by that standalone plugin and validate representative documents first.

Recommended production sequence:

1. back up persisted editor content;
2. deploy the V3 packages without bulk rewriting stored HTML;
3. verify create/edit/undo/destroy-recreate behavior in the real application;
4. test migration on representative legacy documents;
5. migrate stored content in controlled batches only when needed;
6. keep rollback data until the migrated content has been verified.

## Troubleshooting

### A child button is missing

Confirm the standalone child plugin is loaded before editor initialization and that `subBricks` contains the correct alias or Summernote button name.

### Bricks says Summernote is missing

Load Summernote before the Bricks bundle.

### The application uses a custom plugin

No Bricks adapter is required if the plugin already registers a standard Summernote button memo. Use that button name directly or configure `brickAliases`.

## Verification before production

At minimum, verify:

- the real application can create and destroy multiple editors;
- Heading/Gallery work standalone if you use them;
- Bricks composition shows the expected child buttons;
- undo/change/focus behavior is unchanged for your application;
- your stored HTML remains valid through the application sanitizer/storage pipeline.

For the project-level automated gates, see [V3_RELEASE_CHECKLIST.md](V3_RELEASE_CHECKLIST.md).
