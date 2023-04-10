const safeFetch = async (url: string) => {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Error fetching ${url}: ${res.status} ${res.statusText}`);
	}

	return res.text();
};

export type MappingsFile = { [k: string]: string[] };

export const getMappings = async (): Promise<MappingsFile> => {
	const html = await safeFetch("https://discord.com/app");
	const originalCSSURL = new URL(
		html.match(/<link rel="stylesheet" href="([/a-zA-Z0-9\.]+)"/)![1],
		"https://discord.com/",
	).toString();
	const originalCSS = await safeFetch(originalCSSURL);

	const classNameRegex =
		/\.([a-zA-Z0-9\-]+)\-[a-zA-Z0-9\_\-]{6}(?=(\.|,|\{|\[| |:|\)))/g;
	const classNameMap = new Map<string, string[]>();

	[...originalCSS.matchAll(classNameRegex)].forEach((v) => {
		const mappedClass = v[0].substring(1);

		if (!classNameMap.has(v[1])) {
			classNameMap.set(v[1], [mappedClass]);
		} else if (!classNameMap.get(v[1])!.includes(mappedClass)) {
			classNameMap.get(v[1])!.push(mappedClass);
		}
	});

	return Object.fromEntries(classNameMap);
};
