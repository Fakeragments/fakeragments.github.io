import { visit } from "unist-util-visit";

export default function rehypeImageWidth() {
	const regex = / w-([0-9]+)%/;
	return function transformer(tree) {
		visit(tree, "element", (node, _index, parent) => {
			if (node.tagName === "img") {
				const alt = node.properties?.alt || "";
				const match = alt.match(regex);

				if (match) {
					const width = match[1];
					node.properties.alt = alt.replace(regex, "").trim();
					node.properties.style = node.properties.style || "";
					node.properties.style += `; width: ${width}% !important;`;

					if (parent && parent.tagName === "p") {
						parent.tagName = "figure";
						parent.properties = parent.properties || {};
						parent.properties.style =
							"display: grid; justify-items: center; margin: 1rem 0;";
					}
				}
			}
		});
	};
}
