import { type PluginCreator } from "postcss";
import parser from "postcss-selector-parser";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { type MappingsFile } from "./scripts/generate/mappings";
import { fileURLToPath } from "node:url";
import { bold, yellow } from "kleur/colors";

if (!("__dirname" in globalThis))
	__dirname = fileURLToPath(new URL(".", import.meta.url));

const plugin: PluginCreator<{}> = () => {
	let mappings: MappingsFile;

	const loadMappings = async () => {
		mappings = await readFile(join(__dirname, "..", "mappings.json"), {
			encoding: "utf-8",
		}).then(JSON.parse);
	};

	return {
		postcssPlugin: "discord-css-mappings",
		async Rule(rule) {
			if (!mappings) await loadMappings();

			rule.selector = await parser((tree) => {
				tree.walkClasses((node) => {
					for (const key of Object.keys(mappings)) {
						if (node.value !== `discord-${key}`) continue;

						if (mappings[key].length > 5) {
							console.warn(
								yellow(
									`The class ${bold(key)} has ${
										mappings[key].length
									} mapped class names, it is not recommended to use this due to increased CSS size and most likely overly wide matching selectors.`
								)
							);
						}

						node.replaceWith(
							mappings[key].length > 1
								? parser.pseudo({
										value: `:is`,
										nodes: mappings[key].map((k) =>
											parser.className({ value: k })
										),
								  })
								: parser.className({ value: mappings[key][0] })
						);
					}
				});
			}).process(rule.selector);
		},
	};
};

plugin.postcss = true;

export default plugin;
