# `@discord-css-mappings/postcss-plugin`

A [PostCSS](https://postcss.org/) plugin for Discord CSS Mappings.

## Usage

Install this as a PostCSS plugin alongside PostCSS itself:

```console
$ yarn add @discord-css-mappings/postcss-plugin @discord-css-mappings/core postcss
```

Then, configure the plugin in `postcss.config.cjs`.

When writing your CSS, you can use named classes prefixed with `discord-`. These will be automatically transformed into the actual hashed classes.

```css
.discord-mainContent {
	opacity: 0.1;
}

/* ... gets transformed into... */

:is(
		.mainContent-15Uhv6,
		.mainContent-1ZOoSF,
		.mainContent-1jusE7,
		.mainContent-20q_Hp,
		.mainContent-2HlPBZ,
		.mainContent-2m17Xp,
		.mainContent-uDGa6R
	) {
	opacity: 0.1;
}
```
