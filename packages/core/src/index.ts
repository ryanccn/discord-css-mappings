const safeFetch = async (url: string) => {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Error fetching ${url}: ${res.status} ${res.statusText}`);
	}

	return res.text();
};

export type MappingsData = { [className: string]: string[] };

export const getMappings = async (): Promise<MappingsData> => {
	const html = await safeFetch("https://discord.com/app");
	const htmlLink = html.match(/<link rel="stylesheet" href="([/a-zA-Z0-9.]+)"/);
	if (!htmlLink) {
		throw new Error("Could not fetch upstream Discord CSS source");
	}

	const originalCSSURL = new URL(
		htmlLink[1],
		"https://discord.com/"
	).toString();
	const originalCSS = await safeFetch(originalCSSURL);

	const classNameRegex =
		/\.([a-zA-Z0-9-]+)-[a-zA-Z0-9_-]{6}(?=(\.|,|\{|\[| |:|\)))/g;
	const classNameMap = new Map<string, string[]>();

	[...originalCSS.matchAll(classNameRegex)].forEach((v) => {
		const mappedClass = v[0].substring(1);

		const mapValue = classNameMap.get(v[1]);
		if (!mapValue) classNameMap.set(v[1], [mappedClass]);
		else if (!mapValue.includes(mappedClass)) mapValue.push(mappedClass);
	});

	for (const key of classNameMap.keys()) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		classNameMap.get(key)!.sort();
	}

	const sortedMap = new Map(
		[...classNameMap].sort((a, b) => (a[0] > b[0] ? 1 : -1))
	);
	return Object.fromEntries(sortedMap);
};
