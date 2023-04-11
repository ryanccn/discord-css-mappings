import { readFile, writeFile } from "fs/promises";
import { getOctokit } from "@actions/github";
import { execa, $ } from "execa";

import { getMappings, type MappingsFile } from "./mappings";
import { getSummary } from "./summary";

import { yellow } from "kleur/colors";

console.log("Fetching mappings");

const oldMappings = (await readFile("mappings.json", {
	encoding: "utf-8",
}).then(JSON.parse)) as MappingsFile;
const newMappings = await getMappings();

console.log("Creating summary");
const summary = getSummary(oldMappings, newMappings);

console.log("Writing new mappings");
await writeFile("mappings.json", JSON.stringify(newMappings, undefined, 2));

if (!process.env.CI) {
	console.warn(yellow("Not in CI environment, skipping commit and comment"));
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
		body: summary,
	});
} else {
	console.warn(yellow("No changes happened, exiting cleanly"));
}
