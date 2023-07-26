import React, { useState, useEffect } from "react";

const GraphToMarkdown = ({ nodes, edges, sessionId }) => {
    const [markdown, setMarkdown] = useState("");

    useEffect(() => {
        let nodeHierarchy = {};
        let markdownString = "";

        // build node hierarchy
        edges.forEach((edge) => {
            const parent = nodes.find((node) => node.id === edge.from);
            const child = nodes.find((node) => node.id === edge.to);

            if (!parent || !child) return;

            if (!nodeHierarchy[parent.id]) {
                nodeHierarchy[parent.id] = {
                    label: parent.label,
                    children: [child],
                };
            } else {
                nodeHierarchy[parent.id].children.push(child);
            }
        });

        function buildMarkdownString(node, depth = 0) {
            const space = " ".repeat((depth > 2 ? depth - 2 : 0) * 2);
            const bullet = "- ";
            const header = "#".repeat(depth + 1);
            const markdownLine = `${
                depth === 0
                    ? header + " **" + node.label + "**\n"
                    : depth === 1
                    ? "\n" + header + " " + node.label + "\n"
                    : space + bullet + node.label
            }\n`;

            markdownString += markdownLine;

            const parentNode = nodeHierarchy[node.id];
            if (parentNode && parentNode.children) {
                parentNode.children.forEach((childNode) =>
                    buildMarkdownString(childNode, depth + 1)
                );
            }
        }

        // start building from root node
        const rootNode = nodes.find((node) => node.id === 1);
        if (rootNode) {
            buildMarkdownString(rootNode);
        }

        setMarkdown(markdownString);
    }, [nodes, edges]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(markdown);
        alert("Copied to clipboard!");
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([markdown], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = `${nodes[0].label}.md`;
        document.body.appendChild(element);
        element.click();
    };

    return (
        <div>
            <textarea value={markdown} readOnly={true} style={{ width: "100%", height: "400px" }} />
            <button onClick={copyToClipboard}>Copy to clipboard</button>
            <button onClick={handleDownload}>Download .md</button>
        </div>
    );
};

export default GraphToMarkdown;
