import React, { useState, useEffect } from "react";
import Slide from "@mui/material/Slide";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

const styles = {
    markdown: {
        width: "25%",
        height: "80%",
        position: "fixed",
        right: "0%",
        bottom: "10%",
        border: "2px solid #d9d9d9",
        overflow: "auto",
        backgroundColor: "#f8f8f8",
    },
};

const GraphToMarkdown = ({ nodes, edges, isMarkdownVisible, networkRef }) => {
    const [markdown, setMarkdown] = useState([]);

    useEffect(() => {
        let nodeHierarchy = {};
        let markdownLines = [];

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
            const markdownLine = {
                line: `${
                    depth === 0
                        ? header + " **" + node.label + "**\n"
                        : depth === 1
                        ? "\n" + header + " " + node.label + "\n"
                        : space + bullet + node.label
                }\n`,
                x: node.x,
                y: node.y,
            };

            markdownLines.push(markdownLine);

            const parentNode = nodeHierarchy[node.id];
            if (parentNode && parentNode.children) {
                parentNode.children.forEach((childNode) =>
                    buildMarkdownString(childNode, depth + 1)
                );
            }
        }

        const rootNode = nodes.find((node) => node.id === 1);
        if (rootNode) {
            buildMarkdownString(rootNode);
        }

        setMarkdown(markdownLines);
    }, [nodes, edges]);

    const handleFocusButtonClick = (x, y) => {
        networkRef.current.moveTo({
            position: { x: x, y: y },
            scale: 1.0,
            offset: { x: 0, y: 0 },
            animation: {
                duration: 1000,
                easingFunction: "easeInOutQuad",
            },
        });
    };

    const handleDownload = () => {
        const markdownString = markdown.map((lineObj) => lineObj.line).join("");
        const element = document.createElement("a");
        const file = new Blob([markdownString], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = `${nodes[0].label}.md`;
        document.body.appendChild(element);
        element.click();
    };

    const displayMarkdown = () => {
        return markdown.map((lineObj, index) => (
            <ListItem
                button
                key={index}
                onClick={() => handleFocusButtonClick(lineObj.x, lineObj.y)}
                style={{ whiteSpace: "pre" }}
            >
                {lineObj.line}
            </ListItem>
        ));
    };

    useEffect(() => {
        window.addEventListener("makeMarkdown", handleDownload);
        // window.addEventListener("copyMarkdown", copyToClipboard);
        return () => {
            window.removeEventListener("makeMarkdown", handleDownload);
            // window.removeEventListener("copyMarkdown", copyToClipboard);
        };
    }, []);

    return (
        <Slide direction="left" in={isMarkdownVisible} mountOnEnter unmountOnExit>
            <Box sx={styles.markdown}>
                <List>{displayMarkdown()}</List>
            </Box>
        </Slide>
    );
};

export default GraphToMarkdown;
