# Getting started with Summernote Bricks

This page shows the shortest path from a normal Summernote editor to a Bricks toolbar.

## 1. Load the host editor

Summernote Bricks expects:

- jQuery `>=3.6.0 <4`
- Summernote `>=0.9.1 <0.10`

Choose the Summernote BS3, BS4, BS5, or Lite build that matches your application.

## 2. Load the plugins you want to group

Bricks does not create Heading, Gallery, or third-party plugins. Each child plugin must register its own Summernote button first.

For script tags, use this order:

```text
jQuery
Summernote
Heading / Gallery / other standalone plugins
Summernote Bricks
editor initialization
```

Example:

```html
<script src="jquery.js"></script>
<script src="summernote.js"></script>
<script src="summernote-heading/dist/index.umd.cjs"></script>
<script src="summernote-gallery/dist/index.umd.cjs"></script>
<script src="summernote-bricks/dist/summernote-bricks.umd.cjs"></script>
```

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

That is enough for the normal Heading + Gallery composition.

## Configuration

| Option | Purpose | Default |
| --- | --- | --- |
| `buttonLabel` | HTML shown on the dropdown button | `SN bricks` |
| `tooltip` | Button tooltip | `Summernote bricks` |
| `subBricks` | Child Summernote buttons to show | `[]` |
| `brickAliases` | Friendly name → Summernote button name | `{}` |

Built-in aliases:

```text
summernote-heading -> summernoteHeading
summernote-gallery -> summernoteGallery
```

You may also use the real Summernote button name directly.

## Custom plugin example

If your plugin does this:

```js
context.memo('button.myCompanyButton', () => /* button */);
```

then Bricks can use it without a Bricks-specific adapter:

```js
summernoteBricks: {
  subBricks: ['myCompanyButton'],
}
```

Or with an alias:

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

Add at least one entry to `subBricks` and verify that each child plugin is registered.

### Do I need `SNB-components`?

No. It is currently an independent optional project and is not required by Summernote Bricks, Heading, or Gallery.

## Next steps

- Existing application: read [V3_UPGRADE.md](V3_UPGRADE.md).
- Internal design details: read [ARCHITECTURE.md](ARCHITECTURE.md).
- Development: read [CONTRIBUTING.md](../CONTRIBUTING.md).
