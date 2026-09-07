import { $, Glob } from "bun";
import { rm } from "node:fs/promises";

const OUT = "site-dist";
// Dev placeholder that bun-plugin-tailwind resolves; must be rewritten for prod.
const PLACEHOLDER = `<link rel="stylesheet" href="tailwindcss" />`;

// Fresh copy of the static site
await $`rm -rf ${OUT}`;
await $`cp -r site ${OUT}`;

// Compile + minify Tailwind
await $`bunx @tailwindcss/cli -i ./site/input.css -o ./${OUT}/assets/styles.css --minify`;

// Content-hash the stylesheet so it can be cached immutably
const css = Bun.file(`${OUT}/assets/styles.css`);
const hash = Bun.hash(await css.arrayBuffer()).toString(16).slice(0, 8);
const cssPath = `/assets/styles.${hash}.css`;
await Bun.write(`${OUT}${cssPath}`, css);
await rm(`${OUT}/assets/styles.css`);

// The Tailwind source isn't needed in the deployed output
await rm(`${OUT}/input.css`, { force: true });

// Point every page at the built stylesheet
for (const file of new Glob("*.html").scanSync(OUT)) {
	const path = `${OUT}/${file}`;
	const html = await Bun.file(path).text();
	if (!html.includes(PLACEHOLDER)) {
		throw new Error(
			`${file}: expected stylesheet placeholder ${PLACEHOLDER} — CSS would 404`,
		);
	}
	await Bun.write(
		path,
		html.replaceAll(
			PLACEHOLDER,
			`<link rel="stylesheet" href="${cssPath}" />`,
		),
	);
	console.log(`✓ ${file} → ${cssPath}`);
}
