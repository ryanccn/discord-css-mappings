import { type MappingsFile } from "./mappings";

export const getSummary = (
	oldMappings: MappingsFile,
	newMappings: MappingsFile
) => {
	const oldKeys = Object.keys(oldMappings);
	const newKeys = Object.keys(newMappings);

	const removedKeys = [...oldKeys].filter((k) => !newKeys.includes(k));
	const addedKeys = [...newKeys].filter((k) => !oldKeys.includes(k));

	const changedKeys = [...newKeys].filter(
		(k) =>
			oldKeys.includes(k) && oldMappings[k].length !== newMappings[k].length
	);

	const summary = {
		removed: removedKeys.map((key) => ({
			key,
			length: oldMappings[key].length,
		})),
		added: addedKeys.map((key) => ({ key, length: newMappings[key].length })),
		changed: changedKeys.map((key) => ({
			key,
			old: oldMappings[key].length,
			new: newMappings[key].length,
		})),
	};

	const markdownChangelog = `
## Removed classes

${
	summary.removed.length > 0
		? summary.removed
				.map((k) => `- \`${k.key}\` (${k.length} classes)`)
				.join("\n")
		: "*None*"
}

## Added classes

${
	summary.added.length > 0
		? summary.added
				.map((k) => `- \`${k.key}\` (${k.length} classes)`)
				.join("\n")
		: "*None*"
}

## Changed classes

${
	summary.changed.length > 0
		? summary.changed
				.map((k) => `- \`${k.key}\` (${k.old} → ${k.new} classes)`)
				.join("\n")
		: "*None*"
}
`.trim();

	return markdownChangelog;
};
