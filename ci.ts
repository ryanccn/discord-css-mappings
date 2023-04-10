const getGitHubOutput = () => Deno.env.get("GITHUB_OUTPUT");

export const setMultilineOutput = async (k: string, v: string) => {
	const outputPath = getGitHubOutput();
	if (!outputPath) return;

	const file = await Deno.open(outputPath, { append: true });
	const delimiter = crypto.randomUUID();

	await file.write(
		new TextEncoder().encode(`${k}<<${delimiter}\n${v}\n${delimiter}`),
	);
};
