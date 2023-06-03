import postcss from "postcss";
import plugin from ".";

const css = String.raw;
const testCSS = css`
	.discord-content {
		transform: scale(2);
	}

	.discord-mainContent {
		opacity: 0.1;
	}
`.trim();

(async () => {
	const output = await postcss([plugin({})]).process(testCSS, {
		from: "test.css",
		to: "test.output.css",
	});

	console.log(output.content);
})();
