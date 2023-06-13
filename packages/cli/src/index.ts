import postcss from "postcss";
import plugin from "@discord-css-mappings/postcss-plugin";
import { readFile } from "fs/promises";

(async () => {
	const processor = postcss([plugin()]);

	const original = await readFile(process.argv[2]);
	const output = await processor.process(original, {
		from: process.argv[2],
		to: undefined,
	});

	process.stdout.write(output.content);
})().catch((e) => {
	console.error(e);
	process.exit(1);
});
