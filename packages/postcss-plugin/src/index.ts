import { type PluginCreator } from "postcss";
import parser from "postcss-selector-parser";

import { getMappings, type MappingsData } from "@discord-css-mappings/core";

import { fileURLToPath } from "node:url";
import { bold, yellow } from "kleur/colors";

if (!("__dirname" in globalThis))
	__dirname = fileURLToPath(new URL(".", import.meta.url));

interface PluginConfig {
	suppressWarnings?: boolean;
	rewrite?: {
		attributes?: boolean;
	};
}

const plugin: PluginCreator<PluginConfig> = (config) => {
	let mappings: MappingsData;

	const loadMappings = async () => {
		console.log("Fetching mappings from Discord...");
		mappings = await getMappings();
	};

	return {
		postcssPlugin: "discord-css-mappings",
		async Rule(rule) {
			if (!mappings) await loadMappings();

			rule.selector = await parser((tree) => {
				tree.walkClasses((node) => {
					for (const key of Object.keys(mappings)) {
						if (node.value !== `discord-${key}`) continue;

						if (mappings[key].length > 20 && !config?.suppressWarnings) {
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

				if (config?.rewrite?.attributes) {
					tree.walkAttributes((node) => {
						if (node.attribute !== "class" || !node.value) return;
						const key = node.value.split("-")[0];
						const mappedClasses = mappings[key];
						if (!mappedClasses) return;

						if (mappedClasses.length <= 20) {
							node.replaceWith(
								mappedClasses.length > 1
									? parser.pseudo({
											value: `:is`,
											nodes: mappedClasses.map((k) =>
												parser.className({ value: k })
											),
									  })
									: parser.className({ value: mappedClasses[0] })
							);
						}
					});
				}
			}).process(rule.selector);
		},
	};
};

plugin.postcss = true;

export default plugin;
