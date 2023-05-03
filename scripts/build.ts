import { build, type BuildOptions } from "esbuild";
import { dependencies, peerDependencies } from "../package.json";

const shared = {
	entryPoints: ["index.ts"],
	bundle: true,
	platform: "node",
	external: Object.keys(dependencies).concat(Object.keys(peerDependencies)),
} satisfies BuildOptions;

build({
	...shared,
	outfile: "dist/index.js",
	format: "esm",
});

build({
	...shared,
	outfile: "dist/index.cjs",
	format: "cjs",
});
