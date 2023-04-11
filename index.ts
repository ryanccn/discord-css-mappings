import { readFile, writeFile } from "fs/promises";
import { getOctokit } from "@actions/github";
import { execa, $ } from "execa";

import { getMappings, type MappingsFile } from "./mappings";

console.log("Fetching mappings");

const oldMappings = (await readFile("mappings.json", {
	encoding: "utf-8",
}).then(JSON.parse)) as MappingsFile;
const newMappings = await getMappings();

const oldKeys = Object.keys(oldMappings);
const newKeys = Object.keys(newMappings);

console.log("Creating summary");

const removedKeys = [...oldKeys].filter((k) => !newKeys.includes(k));
const addedKeys = [...newKeys].filter((k) => !oldKeys.includes(k));

const changedKeys = [...newKeys].filter(
	(k) => oldKeys.includes(k) && oldMappings[k].length !== newMappings[k].length
);

const summary = {
	removed: removedKeys.map((key) => ({ key, length: oldMappings[key].length })),
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

console.log("Writing new mappings");
await writeFile("mappings.json", JSON.stringify(newMappings, undefined, 2));

if (!process.env.CI) {
	console.warn("Not in CI environment, skipping commit and comment");
	process.exit(0);
}

const github = getOctokit(process.env.GITHUB_TOKEN!);

await $`git config --global user.name ${"github-actions[bot]"}`;
await $`git config --global user.email ${"41898282+github-actions[bot]@users.noreply.github.com"}`;
await $`git add ${"mappings.json"}`;

const hasChange = !!(await $`git status -s`).stdout;

if (hasChange) {
	console.log("Pushing updates");
	await $`git commit -m ${"chore: update mappings"}`;
	await $`git push origin`;

	const { stdout: newSHA } = await execa("git", ["rev-parse", "HEAD"]);

	console.log("Creating summary comment");
	await github.rest.repos.createCommitComment({
		owner: "ryanccn",
		repo: "discord-css-mappings",
		commit_sha: newSHA,
		body: markdownChangelog,
	});
} else {
	console.warn("No changes happened, exiting cleanly");
}
