# Getting started with Summernote Bricks

Summernote Bricks has one job: **take Summernote buttons that already exist and group them into one dropdown**.

It does not ship Heading, Gallery, or third-party plugins. Those plugins stay standalone and work without Bricks.

## Choose the pieces you need

- Heading only → install [`summernote-heading`](https://github.com/eissasoubhi/summernote-heading).
- Gallery only → install [`summernote-gallery`](https://github.com/eissasoubhi/summernote-gallery).
- Heading + Gallery as separate toolbar buttons → install both; Bricks is optional.
- Heading + Gallery grouped in one dropdown → install both plus `summernote-bricks`.

## 1. Install

Example with the complete Heading + Gallery composition:

```bash
npm install jquery bootstrap summernote summernote-heading@next summernote-gallery@next summernote-bricks@next
```

Remove any standalone plugin that your application does not use.

## 2. Load Summernote, the child plugins, then Bricks

For script tags, remember this order:

```text
jQuery
Bootstrap (when using a Bootstrap Summernote build)
Summernote
standalone child plugins
Summernote Bricks
editor initialization
```

Example with the Bootstrap 5 build:

```html
<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="node_modules/summernote/dist/summernote-bs5.min.css">

<script src="node_modules/jquery/dist/jquery.min.js"></script>
<script src="node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
<script src="node_modules/summernote/dist/summernote-bs5.min.js"></script>
<script src="node_modules/summernote-heading/dist/summernote-heading.browser.js"></script>
<script src="node_modules/summernote-gallery/dist/summernote-gallery.browser.js"></script>
<script src="node_modules/summernote-bricks/dist/summernote-bricks.browser.js"></script>
```

The browser entrypoints deliberately end in `.browser.js`. ESM and CommonJS files still exist for package managers and build tools, but they are not part of the normal script-tag installation path.

## 3. Add Bricks to the toolbar

```js
$('#editor').summernote({
  toolbar: [
    ['extensions', ['summernoteBricks']],
  ],
  summernoteBricks: {
    buttonLabel: '<i class="fa fa-puzzle-piece"></i> Bricks',
    tooltip: 'Bricks',
    subBricks: ['summernote-heading', 'summernote-gallery'],
  },
});
```

Built-in aliases map the friendly package names to the buttons registered by those standalone plugins:

```text
summernote-heading -> summernoteHeading
summernote-gallery -> summernoteGallery
```

That is all Bricks needs. It does not instantiate, import, or own the child plugins itself.

## Configuration

| Option | Purpose | Default |
| --- | --- | --- |
| `buttonLabel` | HTML shown on the dropdown button | `SN bricks` |
| `tooltip` | Button tooltip | `Summernote bricks` |
| `subBricks` | Child Summernote buttons to show | `[]` |
| `brickAliases` | Friendly name → Summernote button name | `{}` |

## Custom plugin example

If your own Summernote plugin registers:

```js
context.memo('button.myCompanyButton', () => /* button */);
```

Bricks can group it directly:

```js
summernoteBricks: {
  subBricks: ['myCompanyButton'],
}
```

Or through an alias:

```js
summernoteBricks: {
  subBricks: ['my-company-plugin'],
  brickAliases: {
    'my-company-plugin': 'myCompanyButton',
  },
}
```

## Common problems

### "requires the ... button to be registered"

The child plugin was not loaded before the editor was initialized, or the configured button name is wrong.

### "Summernote must be loaded before Summernote Bricks"

Load the Summernote script before the Bricks bundle.

### The dropdown is empty

Bricks has no built-in child buttons. Add at least one entry to `subBricks` and load the corresponding standalone plugin before Bricks.

### Do I need `SNB-components`?

No. It is an independent optional project and is not required by Summernote Bricks, Heading, or Gallery.

## Next steps

- Copy-paste integration: [COMPLETE_EXAMPLE.md](COMPLETE_EXAMPLE.md)
- Existing application: [V3_UPGRADE.md](V3_UPGRADE.md)
- Internal design details: [ARCHITECTURE.md](ARCHITECTURE.md)
- Development: [CONTRIBUTING.md](../CONTRIBUTING.md)
