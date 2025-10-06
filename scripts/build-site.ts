import { $ } from "bun";

// Clean up dist
await $`rm -rf site-dist`;
// Create new dist
await $`cp -r site site-dist`;
// Compile tailwindcss
await $`bunx @tailwindcss/cli -i ./site/input.css -o ./site-dist/output.css `;

// Read index file
const htmlContent = await Bun.file("site-dist/index.html").text();
// Update script tags and css link
const updatedHtml = htmlContent
	.replace(
		`<link rel="stylesheet" href="tailwindcss" />`,
		`<link rel="stylesheet" href="output.css" />`,
	);
// Write file
await Bun.write("site-dist/index.html", updatedHtml);

// Read feeds file
const feedsContent = await Bun.file("site-dist/feeds.html").text();
// Update script tags and css link
const updatedFeedsHtml = feedsContent
	.replace(
		`<link rel="stylesheet" href="tailwindcss" />`,
		`<link rel="stylesheet" href="/output.css" />`,
	);
// Write file
await Bun.write("site-dist/feeds.html", updatedFeedsHtml);
