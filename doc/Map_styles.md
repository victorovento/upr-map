# OpenLevelUp map styles
OpenLevelUp proposes configurable map styles using [MapCSS 0.2](http://wiki.openstreetmap.org/wiki/MapCSS).
They are available in the `src/styles/` folder.

## About MapCSS
[MapCSS](http://wiki.openstreetmap.org/wiki/MapCSS) is a CSS-like language used to create map stylesheets.
It was created to offer a simple way to configure OpenStreetMap data rendering. It is used by a whole set
of OpenStreetMap-related software such as JOSM, Overpass Turbo, Maps.me... To make people's life easier,
OpenLevelUp also uses the same stylesheets.

## Supported properties
Here is a list of MapCSS 0.2 properties that are supported by OpenLevelUp. See
[MapCSS definition](http://wiki.openstreetmap.org/wiki/MapCSS/0.2) for details.

### Meta
Meta properties (describing the stylesheets) are supported. In fact, for proper rendering, two meta properties are mandatory:
* `title`: the name of the style
* `icon-image`: an icon representing the style

### Canvas
Canvas properties aren't supported. For background customization you should use configuration files.

### Line
* `z-index`: vertical ordering (example: `z-index: 2`)
* `width`: the line width in pixels (example: `width: 5`)
* `color`: the line color (example: `color: blue`, `color: #00F`, `color: #0000FF`, `color: rgb(0.0, 0.0, 1.0)`)
* `opacity`: the line transparency, from 0 (transparent) to 1 (opaque) (example: `opacity: 0.7`)
* `dashes`: the line dashes, as an array of alternating lengths (example: `dashes: 2,4,2,2`)
* `linecap`: the style for the end of line, between `none`, `round` or `square` (example: `linecap: round`)
* `fill-color`
* `fill-opacity`

### Point or icon
* `icon-image`: the URL of an image (example: `icon-image: url('my_icon.png');`). A joker can be used to replace a part of the icon URL by a tag value of rendered feature using `$[tag]` (example: `icon-image: url('icon_for_room_$[room].png');`)
* `icon-image-aliases`: when using a joker in `icon-image`, some tag values can be replaced by other ones using this property (example `icon-image-aliases: '"amphitheatre": "auditorium", "reception": "administration"';`)
* `icon-width`
* `icon-height`
* `icon-opacity`

### Label
* `font-family`
* `font-size`
* `font-weight`
* `font-style`
* `text-color`
* `text-opacity`
* `text-offset`
* `text-position`
* `text`

### Shield
Shields aren't supported yet.
