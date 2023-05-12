import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["index.ts"],
	clean: true,
	minify: false,
	dts: true,
	format: ["cjs", "esm"],
});
